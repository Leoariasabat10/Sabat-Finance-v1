"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { listCobrar } from "@/lib/cobrar/queries";
import { getEnviador } from "./EnviadorMensajes";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const plantillaSchema = z.object({
  id: z.string().uuid(),
  cuerpo: z.string().min(1, "El mensaje no puede estar vacío").max(1000),
  activa: z.boolean(),
});

export async function actualizarPlantilla(input: z.infer<typeof plantillaSchema>): Promise<ActionResult> {
  const parsed = plantillaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  try {
    await prisma.whatsappPlantilla.update({
      where: { id: parsed.data.id },
      data: { cuerpo: parsed.data.cuerpo, activa: parsed.data.activa },
    });
    revalidatePath("/whatsapp");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "No se pudo guardar la plantilla." };
  }
}

/**
 * Resumen diario (doc 07 Módulo 8): arma el texto de cobros del día usando
 * la plantilla `resumen_diario` y lo deja en cola. Pensado para dispararse
 * automáticamente a las 8 AM (job programado) — aquí se expone también como
 * botón manual mientras no hay un scheduler configurado.
 */
export async function generarResumenDiario(): Promise<ActionResult<{ mensaje: string }>> {
  try {
    const [plantilla, cobros] = await Promise.all([
      prisma.whatsappPlantilla.findFirst({ where: { evento: "resumen_diario", activa: true } }),
      listCobrar(0),
    ]);
    if (!plantilla) return { ok: false, error: "No hay plantilla activa para el resumen diario." };

    const hoy = cobros.filter((c) => c.semaforo === "hoy" || c.semaforo === "vencido");
    const detalle = hoy.length
      ? hoy.map((c) => `${c.clienteNombre} (${c.saldoCuota.toLocaleString("es-CO")})`).join(", ")
      : "nada pendiente hoy";
    const valorTotal = hoy.reduce((a, c) => a + c.saldoCuota, 0);

    const mensaje = plantilla.cuerpo
      .replace("{{detalle}}", detalle)
      .replace("{{valor}}", valorTotal.toLocaleString("es-CO"));

    const resultado = await getEnviador().enviar("", mensaje);

    await prisma.whatsappMensaje.create({
      data: {
        plantillaId: plantilla.id,
        mensajeFinal: mensaje,
        estadoEnvio: resultado.ok ? "enviado" : "pendiente",
        proveedor: resultado.proveedor,
        enviadoAt: resultado.ok ? new Date() : null,
        referenciaTipo: "resumen_diario",
      },
    });

    revalidatePath("/whatsapp");
    return { ok: true, data: { mensaje } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo generar el resumen." };
  }
}
