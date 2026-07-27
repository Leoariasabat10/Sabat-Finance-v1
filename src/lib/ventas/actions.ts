"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { calcularInteres, generarCalendarioCuotas } from "@/lib/calculos";
import { registrarMovimientoCaja } from "@/lib/caja/motor";
import { ventaSchema, type VentaInput } from "./validations";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Crea una venta (doc 07 Módulo 5): de contado o a crédito, sin catálogo.
 * Regla dura #4: si tipoPago='credito', la operación de crédito se crea
 * siempre con tasaInteres=0 — calcularInteres() da interesTotal=0 de forma
 * natural, sin rama especial (doc 04, sección 4.12).
 */
export async function crearVenta(input: VentaInput): Promise<ActionResult<{ id: string }>> {
  const parsed = ventaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const total = data.items.reduce((acc, i) => acc + i.precioVenta, 0);
  const utilidad = data.items.reduce((acc, i) => acc + (i.precioVenta - i.costo), 0);

  try {
    const ventaId = await prisma.$transaction(async (tx) => {
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

      const venta = await tx.venta.create({
        data: {
          clienteId,
          tipoPago: data.tipoPago,
          fecha: new Date(`${data.fecha}T00:00:00Z`),
          totalCalc: total,
          utilidadCalc: utilidad,
          estado: "activa",
          items: {
            create: data.items.map((i) => ({
              nombreProducto: i.nombreProducto,
              descripcion: i.descripcion,
              costo: i.costo,
              precioVenta: i.precioVenta,
              utilidadLineaCalc: i.precioVenta - i.costo,
            })),
          },
        },
      });

      if (data.tipoPago === "contado") {
        await registrarMovimientoCaja(tx, {
          tipo: "ingreso",
          monto: total,
          categoria: "venta",
          referenciaId: venta.id,
          referenciaTipo: "venta",
          fecha: data.fecha,
          descripcion: `Venta de contado a ${data.nombreCliente}`,
        });
      }

      if (data.tipoPago === "credito" && data.numeroCuotas && data.plazoDias) {
        const interes = calcularInteres({
          montoCapital: total,
          tasaInteres: 0,
          tipoInteres: "diario",
          plazoDias: data.plazoDias,
        });

        const diasPorCuota = data.plazoDias / data.numeroCuotas;
        const cuotasCalculadas = generarCalendarioCuotas({
          montoCapital: total,
          interesTotal: interes.interesTotal,
          numeroCuotas: data.numeroCuotas,
          fechaOperacion: data.fecha,
          diasPorPeriodo: diasPorCuota,
        });
        const fechaVencimiento = cuotasCalculadas[cuotasCalculadas.length - 1]!.fechaVencimiento;

        const operacion = await tx.operacionCredito.create({
          data: {
            origen: "venta",
            clienteId,
            ventaId: venta.id,
            montoCapital: total,
            fechaOperacion: new Date(`${data.fecha}T00:00:00Z`),
            plazoDias: data.plazoDias,
            tipoInteres: "diario",
            modeloInteres: "fijo_sobre_capital",
            tasaInteres: 0,
            formaPago: "pago_unico",
            estado: "activo",
            fechaVencimiento: new Date(`${fechaVencimiento}T00:00:00Z`),
            interesTotalCalc: 0,
            totalAPagarCalc: total,
            saldoPendienteCalc: total,
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
      }

      return { ventaId: venta.id, clienteId };
    });

    revalidatePath("/ventas");
    revalidatePath("/cartera");
    revalidatePath("/dashboard");
    revalidatePath("/cobrar");
    revalidatePath("/caja");
    revalidatePath("/dinero");
    revalidatePath("/whatsapp");
    return { ok: true, data: { id: ventaId.ventaId } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? `No se pudo crear la venta: ${e.message}` : "No se pudo crear la venta.",
    };
  }
}

export async function anularVenta(id: string): Promise<ActionResult> {
  try {
    await prisma.$transaction(async (tx) => {
      const venta = await tx.venta.findUnique({
        where: { id },
        include: { cliente: { select: { nombre: true } } },
      });
      if (!venta || venta.deletedAt) throw new Error("No se encontró la venta.");

      // Bug real encontrado en QA de producción (26 jul 2026): estado
      // "anulada" y deletedAt son cosas distintas — deletedAt oculta el
      // registro de TODA consulta con `deletedAt: null` (incluido el
      // historial del cliente), contradiciendo el propio diálogo de
      // confirmación ("no se borra del historial"). Anular solo cambia el
      // estado; el borrado lógico es una acción aparte que esta app no
      // expone desde la UI (ver CLAUDE.md, regla 8).
      await tx.venta.update({ where: { id }, data: { estado: "anulada" } });
      await tx.operacionCredito.updateMany({
        where: { ventaId: id },
        data: { estado: "anulado" },
      });

      // Si fue de contado, el dinero había entrado a caja — se registra el
      // egreso compensatorio para que el saldo vuelva a cuadrar.
      if (venta.tipoPago === "contado") {
        await registrarMovimientoCaja(tx, {
          tipo: "egreso",
          monto: Number(venta.totalCalc),
          categoria: "anulacion_venta",
          referenciaId: venta.id,
          referenciaTipo: "venta",
          fecha: new Date().toISOString().slice(0, 10),
          descripcion: `Anulación de venta de ${venta.cliente.nombre}`,
        });
      }
    });
    revalidatePath("/ventas");
    revalidatePath("/cartera");
    revalidatePath("/dashboard");
    revalidatePath("/caja");
    revalidatePath("/dinero");
    revalidatePath("/cobrar");
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo anular la venta." };
  }
}
