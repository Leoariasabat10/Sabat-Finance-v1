"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { registrarMovimientoCaja } from "./motor";
import { movimientoCajaSchema, type MovimientoCajaInput } from "./validations";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

/** Ingreso/egreso manual de caja (doc 07 Módulo 6): gastos, retiros, aportes, etc. */
export async function registrarMovimientoManual(input: MovimientoCajaInput): Promise<ActionResult> {
  const parsed = movimientoCajaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await registrarMovimientoCaja(tx, {
        tipo: data.tipo,
        monto: data.monto,
        categoria: data.categoria ?? "manual",
        fecha: data.fecha,
        descripcion: data.descripcion,
      });
    });
    revalidatePath("/caja");
    revalidatePath("/dinero");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "No se pudo registrar el movimiento." };
  }
}
