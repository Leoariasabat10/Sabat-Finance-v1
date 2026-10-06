"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { estimarCt } from "./costos";

const num = z.coerce.number().min(0);
const opt = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
};
const optNum = (v: FormDataEntryValue | null) => {
  const s = opt(v);
  if (s == null) return null;
  const x = Number(s.replace(",", "."));
  return Number.isFinite(x) && x > 0 ? x : null;
};
const dinero = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(/\D/g, "") || 0);

function refrescar() {
  revalidatePath("/inventario", "layout");
}

/** Peso real individual: al guardarlo, todo lo derivado (costo, costo/ct, joya, margen, mínimo) se recalcula solo. */
export async function guardarPiedra(piedraId: string, fd: FormData) {
  const ctReal = optNum(fd.get("ctReal"));
  await prisma.piedra.update({
    where: { id: piedraId },
    data: {
      ctReal,
      forma: opt(fd.get("forma")),
      calidad: opt(fd.get("calidad")),
      color: opt(fd.get("color")),
      transparencia: opt(fd.get("transparencia")),
      tratamiento: opt(fd.get("tratamiento")),
      origen: opt(fd.get("origen")),
      notas: opt(fd.get("notas")),
    },
  });
  refrescar();
}

const COSTOS = ["montaje", "plata", "cadena", "mano_obra", "caja", "otros"] as const;

function leerCostos(fd: FormData) {
  return COSTOS.map((concepto) => ({ concepto, monto: dinero(fd.get(`costo_${concepto}`)) })).filter((c) => c.monto > 0);
}

export async function crearJoya(piedraId: string, fd: FormData) {
  const nombre = String(fd.get("nombre") ?? "").trim();
  if (!nombre) throw new Error("Ponle un nombre a la joya.");
  const joya = await prisma.$transaction(async (tx) => {
    const piedra = await tx.piedra.findFirst({ where: { id: piedraId, deletedAt: null }, include: { joya: true } });
    if (!piedra || piedra.joya) throw new Error("Esa piedra ya está en una joya.");
    const j = await tx.joya.create({
      data: {
        nombre,
        piedraId,
        margenObjetivo: z.coerce.number().min(0).max(0.95).parse(Number(fd.get("margen") ?? 60) / 100),
        primaPct: num.parse(Number(fd.get("prima") ?? 0) / 100),
        precioSabat: dinero(fd.get("precioSabat")) || null,
        costos: { create: leerCostos(fd) },
      },
    });
    await tx.piedra.update({ where: { id: piedraId }, data: { estado: "en_joya" } });
    return j;
  });
  refrescar();
  redirect(`/inventario/joyas/${joya.id}`);
}

export async function guardarJoya(joyaId: string, fd: FormData) {
  await prisma.$transaction(async (tx) => {
    await tx.joya.update({
      where: { id: joyaId },
      data: {
        nombre: String(fd.get("nombre") ?? "").trim() || undefined,
        margenObjetivo: z.coerce.number().min(0).max(0.95).parse(Number(fd.get("margen") ?? 60) / 100),
        primaPct: num.parse(Number(fd.get("prima") ?? 0) / 100),
        precioSabat: dinero(fd.get("precioSabat")) || null,
      },
    });
    await tx.joyaCosto.deleteMany({ where: { joyaId } });
    await tx.joyaCosto.createMany({ data: leerCostos(fd).map((c) => ({ ...c, joyaId })) });
  });
  refrescar();
}

export async function marcarJoyaVendida(joyaId: string, vendida: boolean) {
  const j = await prisma.joya.update({ where: { id: joyaId }, data: { vendida } });
  await prisma.piedra.update({ where: { id: j.piedraId }, data: { estado: vendida ? "vendida" : "en_joya" } });
  refrescar();
}

/**
 * Nuevo lote. Las piedras van una por línea: "forma, largo, ancho, alto" en mm (la forma puede ir vacía).
 * El peso de cada una se ESTIMA por dimensiones; el real se agrega después al pesarla.
 */
export async function crearLote(fd: FormData) {
  const nombre = String(fd.get("nombre") ?? "").trim();
  const costoTotal = dinero(fd.get("costoTotal"));
  const ctDeclarados = optNum(fd.get("ctDeclarados"));
  if (!nombre || !costoTotal || !ctDeclarados) throw new Error("Faltan nombre, costo o peso del lote.");
  const lineas = String(fd.get("piedras") ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const piedras = lineas.map((l, i) => {
    const [forma, a, b, c] = l.split(/[,;]/).map((s) => s.trim());
    const [largo = 0, ancho = 0, alto = 0] = [a, b, c].map((s) => Number(String(s).replace(",", ".")));
    if (![largo, ancho, alto].every((x) => x > 0)) throw new Error(`Línea ${i + 1}: usa "forma, largo, ancho, alto".`);
    return { forma: forma || null, largo, ancho, alto };
  });
  const lote = await prisma.$transaction(async (tx) => {
    const total = await tx.loteCompra.count();
    const codigo = `ESM-${new Date().getUTCFullYear()}-${String(total + 1).padStart(3, "0")}`;
    const ultimas = await tx.piedra.count();
    const l = await tx.loteCompra.create({
      data: {
        codigo,
        nombre,
        proveedor: opt(fd.get("proveedor")),
        fecha: opt(fd.get("fecha")) ? new Date(`${opt(fd.get("fecha"))}T00:00:00Z`) : null,
        costoTotal,
        ctDeclarados,
        ctReal: optNum(fd.get("ctReal")),
      },
    });
    await tx.piedra.createMany({
      data: piedras.map((p, i) => ({
        loteId: l.id,
        codigo: `ESM-${String(ultimas + i + 1).padStart(3, "0")}`,
        forma: p.forma,
        largoMm: p.largo,
        anchoMm: p.ancho,
        altoMm: p.alto,
        ctEstimado: estimarCt(p.largo, p.ancho, p.alto),
      })),
    });
    return l;
  });
  refrescar();
  redirect(`/inventario/lotes/${lote.id}`);
}
