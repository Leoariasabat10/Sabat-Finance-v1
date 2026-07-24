"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { calcularInteres, generarCalendarioCuotas } from "@/lib/calculos";
import { registrarMovimientoCaja } from "@/lib/caja/motor";
import { encolarMensajeEvento } from "@/lib/whatsapp/encolarMensaje";
import { prestamoSchema, type PrestamoInput } from "./validations";

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

    // Fire-and-forget: encolar el WhatsApp es una llamada de red extra a
    // Supabase que no debe sumarse al tiempo de respuesta de "crear
    // préstamo" (regla dura: préstamo en <20s). No se espera (`await`) —
    // corre en segundo plano y cualquier error se traga sin afectar al usuario.
    encolarMensajeEvento(prisma, {
      evento: "nuevo_prestamo",
      clienteId: resultado.clienteId,
      numeroWhatsapp: data.whatsappCliente,
      variables: {
        cliente: data.nombreCliente,
        valor: interes.totalAPagar.toLocaleString("es-CO"),
        fecha: fechaVencimiento,
      },
      referenciaId: resultado.operacionId,
      referenciaTipo: "operacion_credito",
    }).catch(() => {});

    revalidatePath("/prestamos");
    revalidatePath("/cartera");
    revalidatePath("/dashboard");
    revalidatePath("/cobrar");
    revalidatePath("/caja");
    revalidatePath("/whatsapp");
    return { ok: true, data: { id: resultado.operacionId } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? `No se pudo crear el préstamo: ${e.message}` : "No se pudo crear el préstamo.",
    };
  }
}

export async function anularPrestamo(id: string): Promise<ActionResult> {
  try {
    await prisma.operacionCredito.update({
      where: { id },
      data: { estado: "anulado", deletedAt: new Date() },
    });
    revalidatePath("/prestamos");
    revalidatePath("/cartera");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "No se pudo anular el préstamo." };
  }
}
