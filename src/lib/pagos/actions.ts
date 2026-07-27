"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { aplicarPago, estaPagada } from "@/lib/calculos";
import { registrarMovimientoCaja } from "@/lib/caja/motor";
import { pagoSchema, type PagoInput } from "./validations";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Registra un pago (doc 07 Módulo 6, <10s).
 *
 * El motor puro (lib/calculos/aplicarPago) solo sabe de "interés pendiente"
 * y "capital pendiente" en abstracto; esta acción reconstruye esos dos
 * números a partir de las cuotas reales (cada cuota guarda un único
 * `saldoCalc`, así que el interés/capital pendiente de una cuota parcial se
 * reconstruye asumiendo que lo ya pagado de esa cuota se aplicó
 * interés-primero, igual que la regla del negocio) y luego reparte el
 * resultado de vuelta a las cuotas, más antigua primero.
 */
export async function registrarPago(input: PagoInput): Promise<ActionResult<{ id: string }>> {
  const parsed = pagoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const operacion = await tx.operacionCredito.findFirst({
        where: { id: data.operacionCreditoId, deletedAt: null },
        include: { cuotas: { orderBy: { numeroCuota: "asc" } }, cliente: { select: { id: true, nombre: true, whatsapp: true } } },
      });
      if (!operacion) throw new Error("No se encontró la operación de crédito.");
      if (operacion.estado === "pagado") throw new Error("Esta operación ya está paga (paz y salvo).");

      // Bloqueo financiero crítico (auditoría Sprint 1): un pago nunca puede
      // superar el saldo pendiente real de la operación. Tolerancia de 1
      // peso para absorber redondeos de centavos entre cuotas.
      const saldoPendienteActual = Number(operacion.saldoPendienteCalc);
      if (data.valor > saldoPendienteActual + 1) {
        throw new Error(
          `El pago (${data.valor.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}) supera el saldo pendiente (${saldoPendienteActual.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}). Ajusta el valor antes de registrar el pago.`,
        );
      }

      const config = await tx.configuracion.findUnique({ where: { id: 1 } });
      const ordenAplicacionPago = config?.ordenAplicacionPago ?? "interes_primero";

      const cuotasPendientes = operacion.cuotas.filter((c) => c.estado !== "pagada");

      const pendientesPorCuota = cuotasPendientes.map((c) => {
        const total = Number(c.total);
        const saldo = Number(c.saldoCalc);
        const yaPagado = Math.max(0, total - saldo);
        // Lo ya pagado de esta cuota se asume aplicado interés-primero.
        const interesPendiente = Math.max(0, Number(c.interes) - yaPagado);
        const capitalPendiente = Math.max(0, saldo - interesPendiente);
        return { cuota: c, interesPendiente, capitalPendiente };
      });

      const interesPendienteTotal = pendientesPorCuota.reduce((a, p) => a + p.interesPendiente, 0);
      const capitalPendienteTotal = pendientesPorCuota.reduce((a, p) => a + p.capitalPendiente, 0);

      const resultado = aplicarPago({
        interesPendiente: interesPendienteTotal,
        capitalPendiente: capitalPendienteTotal,
        montoAbono: data.valor,
        tipoAbono: data.tipoAbono,
        ordenAplicacionPago,
      });

      let restanteInteres = resultado.aplicadoInteres;
      let restanteCapital = resultado.aplicadoCapital;

      for (const { cuota, interesPendiente, capitalPendiente } of pendientesPorCuota) {
        const aplicadoInteresCuota = Math.min(restanteInteres, interesPendiente);
        restanteInteres -= aplicadoInteresCuota;
        const aplicadoCapitalCuota = Math.min(restanteCapital, capitalPendiente);
        restanteCapital -= aplicadoCapitalCuota;

        const nuevoInteresPendiente = interesPendiente - aplicadoInteresCuota;
        const nuevoCapitalPendiente = capitalPendiente - aplicadoCapitalCuota;
        const nuevoSaldo = nuevoInteresPendiente + nuevoCapitalPendiente;

        if (aplicadoInteresCuota > 0 || aplicadoCapitalCuota > 0) {
          await tx.cuota.update({
            where: { id: cuota.id },
            data: {
              saldoCalc: Math.max(0, nuevoSaldo),
              estado: estaPagada(nuevoSaldo) ? "pagada" : "parcial",
            },
          });
        }
      }

      const pago = await tx.pago.create({
        data: {
          operacionCreditoId: operacion.id,
          fechaPago: new Date(`${data.fechaPago}T00:00:00Z`),
          valor: data.valor,
          metodoPago: data.metodoPago,
          tipoAbono: data.tipoAbono,
          observaciones: data.observaciones,
        },
      });

      await tx.operacionCredito.update({
        where: { id: operacion.id },
        data: {
          saldoPendienteCalc: resultado.saldoPendiente,
          estado: estaPagada(resultado.saldoPendiente) ? "pagado" : operacion.estado,
        },
      });

      await registrarMovimientoCaja(tx, {
        tipo: "ingreso",
        monto: data.valor,
        categoria: operacion.origen === "prestamo" ? "pago_prestamo" : "pago_venta",
        referenciaId: operacion.id,
        referenciaTipo: "operacion_credito",
        fecha: data.fechaPago,
        descripcion: `Pago de ${operacion.cliente.nombre}`,
      });

      return {
        pagoId: pago.id,
        clienteId: operacion.cliente.id,
        clienteNombre: operacion.cliente.nombre,
        clienteWhatsapp: operacion.cliente.whatsapp,
        saldoFinal: resultado.saldoPendiente,
        pagadoCompleto: estaPagada(resultado.saldoPendiente),
      };
    });

    revalidatePath("/prestamos");
    revalidatePath("/ventas");
    revalidatePath("/cartera");
    revalidatePath("/cobrar");
    revalidatePath("/caja");
    revalidatePath("/dinero");
    revalidatePath("/dashboard");
    revalidatePath("/whatsapp");
    return { ok: true, data: { id: resultado.pagoId } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo registrar el pago.",
    };
  }
}
