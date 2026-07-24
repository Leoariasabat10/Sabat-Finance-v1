"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { configuracionSchema, type ConfiguracionInput } from "./validations";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export async function actualizarConfiguracion(input: ConfiguracionInput): Promise<ActionResult> {
  const parsed = configuracionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await prisma.configuracion.upsert({
      where: { id: 1 },
      create: { id: 1, ...parsed.data },
      update: parsed.data,
    });
    revalidatePath("/configuracion");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "No se pudo guardar la configuración." };
  }
}
