"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { simularRefinanciacion, simularRenovacion } from "@/lib/calculos";
import { registrarMovimientoCaja } from "@/lib/caja/motor";
import { z } from "zod";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const refinanciarSchema = z.object({
  operacionOriginalId: z.string().uuid(),
  nuevaTasaInteres: z.coerce.number().min(0),
  nuevoTipoInteres: z.enum(["mensual", "diario", "semanal", "quincenal", "personalizado"]),
  nuevoPlazoDias: z.coerce.number().int().positive(),
  numeroCuotas: z.coerce.number().int().positive(),
  motivo: z.string().trim().max(300).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
});
export type RefinanciarInput = z.infer<typeof refinanciarSchema>;

/**
 * Refinanciación (doc 04 sección 4.8): el saldo pendiente consolidado se
 * convierte en el capital de una operación nueva; la original se cierra con
 * estado 'refinanciado' (no se borra, queda como historial). No hay
 * movimiento de caja: es el mismo dinero, solo se reestructura el compromiso.
 */
export async function refinanciar(input: RefinanciarInput): Promise<ActionResult<{ id: string }>> {
  const parsed = refinanciarSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;
  const hoyIso = new Date().toISOString().slice(0, 10);

  try {
    const nuevaId = await prisma.$transaction(async (tx) => {
      const original = await tx.operacionCredito.findFirst({
        where: { id: data.operacionOriginalId, deletedAt: null },
      });
      if (!original) throw new Error("No se encontró la operación original.");
      if (original.estado !== "activo") throw new Error("Solo se pueden refinanciar operaciones activas.");

      const saldo = Number(original.saldoPendienteCalc);
      const simulacion = simularRefinanciacion({
        saldoPendienteConsolidado: saldo,
        nuevaTasaInteres: data.nuevaTasaInteres,
        nuevoTipoInteres: data.nuevoTipoInteres,
        nuevoPlazoDias: data.nuevoPlazoDias,
        numeroCuotas: data.numeroCuotas,
        fechaOperacion: hoyIso,
      });

      const fechaVencimiento = simulacion.cuotas[simulacion.cuotas.length - 1]!.fechaVencimiento;

      const nueva = await tx.operacionCredito.create({
        data: {
          origen: original.origen,
          clienteId: original.clienteId,
          ventaId: original.origen === "venta" ? original.ventaId : null,
          montoCapital: simulacion.montoCapital,
          fechaOperacion: new Date(`${hoyIso}T00:00:00Z`),
          plazoDias: data.nuevoPlazoDias,
          tipoInteres: data.nuevoTipoInteres,
          modeloInteres: "fijo_sobre_capital",
          tasaInteres: data.nuevaTasaInteres,
          formaPago: data.numeroCuotas === 1 ? "pago_unico" : "mensual",
          estado: "activo",
          fechaVencimiento: new Date(`${fechaVencimiento}T00:00:00Z`),
          interesTotalCalc: simulacion.interes.interesTotal,
          totalAPagarCalc: simulacion.interes.totalAPagar,
          saldoPendienteCalc: simulacion.interes.totalAPagar,
          operacionPadreId: original.id,
        },
      });

      await tx.cuota.createMany({
        data: simulacion.cuotas.map((c) => ({
          operacionCreditoId: nueva.id,
          numeroCuota: c.numeroCuota,
          fechaVencimiento: new Date(`${c.fechaVencimiento}T00:00:00Z`),
          capital: c.capital,
          interes: c.interes,
          total: c.total,
          saldoCalc: c.total,
          estado: "pendiente",
        })),
      });

      await tx.operacionCredito.update({
        where: { id: original.id },
        data: { estado: "refinanciado" },
      });

      await tx.refinanciacion.create({
        data: {
          operacionOriginalId: original.id,
          operacionNuevaId: nueva.id,
          fecha: new Date(`${hoyIso}T00:00:00Z`),
          saldoConsolidado: saldo,
          motivo: data.motivo,
        },
      });

      return nueva.id;
    });

    revalidatePath("/prestamos");
    revalidatePath("/cartera");
    revalidatePath("/cobrar");
    revalidatePath("/dashboard");
    return { ok: true, data: { id: nuevaId } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo refinanciar." };
  }
}

/**
 * Renovación (doc 04 sección 4.9): el cliente paga exactamente el interés
 * del período, el capital se mantiene y el plazo se extiende — la operación
 * NO cambia de id. Solo aplica a operaciones de pago único (el patrón
 * clásico "gota a gota").
 */
export async function renovar(operacionId: string): Promise<ActionResult> {
  try {
    await prisma.$transaction(async (tx) => {
      const operacion = await tx.operacionCredito.findFirst({
        where: { id: operacionId, deletedAt: null },
        include: { cuotas: { where: { estado: { not: "pagada" } }, orderBy: { numeroCuota: "asc" } }, cliente: true },
      });
      if (!operacion) throw new Error("No se encontró el préstamo.");
      if (operacion.estado !== "activo") throw new Error("Solo se pueden renovar préstamos activos.");

      const capitalPendiente = Number(operacion.montoCapital);
      const simulacion = simularRenovacion({
        capitalPendiente,
        tasaInteres: Number(operacion.tasaInteres),
        tipoInteres: operacion.tipoInteres,
        fechaVencimientoActual: operacion.fechaVencimiento.toISOString().slice(0, 10),
      });

      await tx.pago.create({
        data: {
          operacionCreditoId: operacion.id,
          fechaPago: new Date(),
          valor: simulacion.interesPeriodo,
          metodoPago: "efectivo",
          tipoAbono: "abono_interes",
          observaciones: "Renovación: pago del interés del período",
        },
      });

      for (const cuota of operacion.cuotas) {
        await tx.cuota.update({ where: { id: cuota.id }, data: { saldoCalc: 0, estado: "pagada" } });
      }

      const ultimaCuota = operacion.cuotas.length
        ? Math.max(...operacion.cuotas.map((c) => c.numeroCuota))
        : (await tx.cuota.count({ where: { operacionCreditoId: operacion.id } }));

      const nuevoTotal = capitalPendiente + simulacion.interesPeriodo;
      await tx.cuota.create({
        data: {
          operacionCreditoId: operacion.id,
          numeroCuota: ultimaCuota + 1,
          fechaVencimiento: new Date(`${simulacion.nuevaFechaVencimiento}T00:00:00Z`),
          capital: capitalPendiente,
          interes: simulacion.interesPeriodo,
          total: nuevoTotal,
          saldoCalc: nuevoTotal,
          estado: "pendiente",
        },
      });

      await tx.operacionCredito.update({
        where: { id: operacion.id },
        data: {
          fechaVencimiento: new Date(`${simulacion.nuevaFechaVencimiento}T00:00:00Z`),
          interesTotalCalc: { increment: simulacion.interesPeriodo },
          totalAPagarCalc: { increment: simulacion.interesPeriodo },
          saldoPendienteCalc: nuevoTotal,
        },
      });

      await registrarMovimientoCaja(tx, {
        tipo: "ingreso",
        monto: simulacion.interesPeriodo,
        categoria: "renovacion",
        referenciaId: operacion.id,
        referenciaTipo: "operacion_credito",
        fecha: new Date().toISOString().slice(0, 10),
        descripcion: `Renovación de ${operacion.cliente.nombre}`,
      });
    });

    revalidatePath("/prestamos");
    revalidatePath("/cartera");
    revalidatePath("/cobrar");
    revalidatePath("/dashboard");
    revalidatePath("/caja");
    revalidatePath("/dinero");
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo renovar el préstamo." };
  }
}
