"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { calcularInteres, generarCalendarioCuotas } from "@/lib/calculos";
import { registrarMovimientoCaja } from "@/lib/caja/motor";
import { prestamoSchema, prestamoEditSchema, type PrestamoInput, type PrestamoEditInput } from "./validations";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function diasPorPeriodoFormaPago(formaPago: PrestamoInput["formaPago"], plazoDias: number): number {
  switch (formaPago) {
    case "pago_unico":
      return plazoDias;
    case "semanal":
      return 7;
    case "quincenal":
      return 15;
    case "mensual":
      return 30;
  }
}

/**
 * Crea un préstamo (flujo rápido, doc 07 Módulo 4): si no existe un cliente
 * con ese WhatsApp, se crea automáticamente. El cálculo de interés y el
 * calendario de cuotas salen del motor puro de lib/calculos — esta acción
 * solo arma la transacción de base de datos.
 */
export async function crearPrestamo(input: PrestamoInput): Promise<ActionResult<{ id: string }>> {
  const parsed = prestamoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  let interes;
  try {
    interes = calcularInteres({
      montoCapital: data.montoCapital,
      tasaInteres: data.tasaInteres,
      tipoInteres: data.tipoInteres,
      plazoDias: data.plazoDias,
      diasBasePersonalizado: data.diasBasePersonalizado,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo calcular el interés." };
  }

  const diasPorCuota = diasPorPeriodoFormaPago(data.formaPago, data.plazoDias);
  const numeroCuotas = Math.max(1, Math.round(data.plazoDias / diasPorCuota));

  const cuotasCalculadas = generarCalendarioCuotas({
    montoCapital: data.montoCapital,
    interesTotal: interes.interesTotal,
    numeroCuotas,
    fechaOperacion: data.fechaOperacion,
    diasPorPeriodo: diasPorCuota,
  });

  const fechaVencimiento = cuotasCalculadas[cuotasCalculadas.length - 1]!.fechaVencimiento;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      let clienteId = data.clienteId;

      if (!clienteId) {
        const existente = await tx.cliente.findFirst({
          where: { whatsapp: data.whatsappCliente, deletedAt: null },
        });
        clienteId = existente
          ? existente.id
          : (
              await tx.cliente.create({
                data: { nombre: data.nombreCliente, whatsapp: data.whatsappCliente },
              })
            ).id;
      }

      const operacion = await tx.operacionCredito.create({
        data: {
          origen: "prestamo",
          clienteId,
          montoCapital: data.montoCapital,
          fechaOperacion: new Date(`${data.fechaOperacion}T00:00:00Z`),
          plazoDias: data.plazoDias,
          tipoInteres: data.tipoInteres,
          modeloInteres: "fijo_sobre_capital",
          tasaInteres: data.tasaInteres,
          formaPago: data.formaPago,
          estado: "activo",
          fechaVencimiento: new Date(`${fechaVencimiento}T00:00:00Z`),
          interesTotalCalc: interes.interesTotal,
          totalAPagarCalc: interes.totalAPagar,
          saldoPendienteCalc: interes.totalAPagar,
        },
      });

      await tx.cuota.createMany({
        data: cuotasCalculadas.map((c) => ({
          operacionCreditoId: operacion.id,
          numeroCuota: c.numeroCuota,
          fechaVencimiento: new Date(`${c.fechaVencimiento}T00:00:00Z`),
          capital: c.capital,
          interes: c.interes,
          total: c.total,
          saldoCalc: c.total,
          estado: "pendiente",
        })),
      });

      await registrarMovimientoCaja(tx, {
        tipo: "egreso",
        monto: data.montoCapital,
        categoria: "prestamo",
        referenciaId: operacion.id,
        referenciaTipo: "operacion_credito",
        fecha: data.fechaOperacion,
        descripcion: `Préstamo a ${data.nombreCliente}`,
      });

      return { operacionId: operacion.id, clienteId };
    });

    revalidatePath("/prestamos");
    revalidatePath("/cartera");
    revalidatePath("/dashboard");
    revalidatePath("/cobrar");
    revalidatePath("/caja");
    revalidatePath("/dinero");
    revalidatePath("/whatsapp");
    return { ok: true, data: { id: resultado.operacionId } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? `No se pudo crear el préstamo: ${e.message}` : "No se pudo crear el préstamo.",
    };
  }
}

/**
 * Anula un préstamo (auditoría Sprint 1, punto #2: paridad con
 * anularVenta). Solo se permite si todavía no tiene pagos registrados —
 * anular un préstamo con abonos ya recibidos dejaría la caja y el
 * historial de pagos inconsistentes, así que ese caso se bloquea con un
 * mensaje claro en vez de intentar reversarlo automáticamente.
 */
export async function anularPrestamo(id: string): Promise<ActionResult> {
  try {
    await prisma.$transaction(async (tx) => {
      const operacion = await tx.operacionCredito.findFirst({
        where: { id, origen: "prestamo", deletedAt: null },
        include: {
          cliente: { select: { nombre: true } },
          pagos: { where: { deletedAt: null } },
        },
      });
      if (!operacion) throw new Error("No se encontró el préstamo.");
      if (operacion.pagos.length > 0) {
        throw new Error(
          "Este préstamo ya tiene pagos registrados y no se puede anular. Si necesitas corregirlo, refináncialo.",
        );
      }

      // Bug real encontrado en QA de producción (26 jul 2026): estado
      // "anulado" y deletedAt son cosas distintas — deletedAt oculta el
      // registro de TODA consulta con `deletedAt: null` (incluido el
      // historial del cliente), contradiciendo el propio diálogo de
      // confirmación de la UI ("no se borra del historial"). Anular solo
      // cambia el estado.
      await tx.operacionCredito.update({
        where: { id },
        data: { estado: "anulado" },
      });

      // El desembolso original salió de caja como egreso; anular el
      // préstamo devuelve ese capital con un ingreso compensatorio,
      // igual que anularVenta hace con las ventas de contado.
      await registrarMovimientoCaja(tx, {
        tipo: "ingreso",
        monto: Number(operacion.montoCapital),
        categoria: "anulacion_prestamo",
        referenciaId: operacion.id,
        referenciaTipo: "operacion_credito",
        fecha: new Date().toISOString().slice(0, 10),
        descripcion: `Anulación de préstamo a ${operacion.cliente.nombre}`,
      });
    });

    revalidatePath("/prestamos");
    revalidatePath("/cartera");
    revalidatePath("/dashboard");
    revalidatePath("/caja");
    revalidatePath("/dinero");
    revalidatePath("/cobrar");
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo anular el préstamo." };
  }
}

/**
 * Edita los términos financieros de un préstamo (auditoría Sprint 1,
 * punto #2). Solo aplica a préstamos activos sin pagos registrados: si ya
 * hay abonos, cambiar capital/tasa/plazo dejaría el historial de pagos sin
 * sentido, así que se bloquea con un mensaje claro en vez de intentar
 * recalcular pagos ya hechos.
 */
export async function editarPrestamo(id: string, input: PrestamoEditInput): Promise<ActionResult> {
  const parsed = prestamoEditSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  let interes;
  try {
    interes = calcularInteres({
      montoCapital: data.montoCapital,
      tasaInteres: data.tasaInteres,
      tipoInteres: data.tipoInteres,
      plazoDias: data.plazoDias,
      diasBasePersonalizado: data.diasBasePersonalizado,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo calcular el interés." };
  }

  const diasPorCuota = diasPorPeriodoFormaPago(data.formaPago, data.plazoDias);
  const numeroCuotas = Math.max(1, Math.round(data.plazoDias / diasPorCuota));
  const cuotasCalculadas = generarCalendarioCuotas({
    montoCapital: data.montoCapital,
    interesTotal: interes.interesTotal,
    numeroCuotas,
    fechaOperacion: data.fechaOperacion,
    diasPorPeriodo: diasPorCuota,
  });
  const fechaVencimiento = cuotasCalculadas[cuotasCalculadas.length - 1]!.fechaVencimiento;

  try {
    await prisma.$transaction(async (tx) => {
      const operacion = await tx.operacionCredito.findFirst({
        where: { id, origen: "prestamo", deletedAt: null },
        include: { pagos: { where: { deletedAt: null } } },
      });
      if (!operacion) throw new Error("No se encontró el préstamo.");
      if (operacion.pagos.length > 0) {
        throw new Error(
          "Este préstamo ya tiene pagos registrados y no se puede editar. Anúlalo y crea uno nuevo si necesitas corregirlo.",
        );
      }
      if (operacion.estado !== "activo") {
        throw new Error("Solo se pueden editar préstamos activos.");
      }

      const diferenciaCapital = data.montoCapital - Number(operacion.montoCapital);

      await tx.cuota.deleteMany({ where: { operacionCreditoId: id } });

      await tx.operacionCredito.update({
        where: { id },
        data: {
          montoCapital: data.montoCapital,
          tasaInteres: data.tasaInteres,
          tipoInteres: data.tipoInteres,
          plazoDias: data.plazoDias,
          formaPago: data.formaPago,
          fechaOperacion: new Date(`${data.fechaOperacion}T00:00:00Z`),
          fechaVencimiento: new Date(`${fechaVencimiento}T00:00:00Z`),
          interesTotalCalc: interes.interesTotal,
          totalAPagarCalc: interes.totalAPagar,
          saldoPendienteCalc: interes.totalAPagar,
        },
      });

      await tx.cuota.createMany({
        data: cuotasCalculadas.map((c) => ({
          operacionCreditoId: id,
          numeroCuota: c.numeroCuota,
          fechaVencimiento: new Date(`${c.fechaVencimiento}T00:00:00Z`),
          capital: c.capital,
          interes: c.interes,
          total: c.total,
          saldoCalc: c.total,
          estado: "pendiente",
        })),
      });

      // Si el capital cambió, el desembolso registrado en caja también
      // debe ajustarse para que el saldo siga cuadrando.
      if (diferenciaCapital !== 0) {
        await registrarMovimientoCaja(tx, {
          tipo: diferenciaCapital > 0 ? "egreso" : "ingreso",
          monto: Math.abs(diferenciaCapital),
          categoria: "ajuste_edicion_prestamo",
          referenciaId: id,
          referenciaTipo: "operacion_credito",
          fecha: new Date().toISOString().slice(0, 10),
          descripcion: "Ajuste de caja por edición de préstamo",
        });
      }
    });

    revalidatePath("/prestamos");
    revalidatePath(`/prestamos/${id}`);
    revalidatePath("/cartera");
    revalidatePath("/dashboard");
    revalidatePath("/caja");
    revalidatePath("/dinero");
    revalidatePath("/cobrar");
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo editar el préstamo." };
  }
}
