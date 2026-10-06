import { prisma } from "@/lib/db";
import { resumenJoya, resumenLote, type Concepto } from "./costos";

const n = (v: { toString(): string } | null | undefined) => (v == null ? null : Number(v.toString()));

/** Todo el inventario con costos ya calculados (sin redondear; se redondea al mostrar). */
export async function getInventario() {
  const lotes = await prisma.loteCompra.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: { piedras: { where: { deletedAt: null }, orderBy: { codigo: "asc" }, include: { joya: { include: { costos: true } } } } },
  });

  return lotes.map((l) => {
    const lote = { costoTotal: Number(l.costoTotal), ctDeclarados: Number(l.ctDeclarados), ctReal: n(l.ctReal) };
    const resumen = resumenLote(
      lote,
      l.piedras.map((p) => ({ id: p.id, ctEstimado: Number(p.ctEstimado), ctReal: n(p.ctReal) })),
    );
    const piedras = l.piedras.map((p) => {
      const fila = resumen.filas.find((f) => f.id === p.id)!;
      const joya = p.joya && !p.joya.deletedAt ? p.joya : null;
      const joyaCalc = joya
        ? resumenJoya({
            costoPiedra: fila.costo,
            costos: joya.costos.map((c) => ({ concepto: c.concepto as Concepto, monto: Number(c.monto) })),
            margenObjetivo: Number(joya.margenObjetivo),
            primaPct: Number(joya.primaPct),
            precioSabat: n(joya.precioSabat),
          })
        : null;
      return {
        id: p.id,
        codigo: p.codigo,
        forma: p.forma,
        dimensiones: p.largoMm && p.anchoMm && p.altoMm ? `${Number(p.largoMm)} × ${Number(p.anchoMm)} × ${Number(p.altoMm)} mm` : null,
        estado: p.estado,
        calidad: p.calidad,
        color: p.color,
        transparencia: p.transparencia,
        tratamiento: p.tratamiento,
        origen: p.origen,
        notas: p.notas,
        fila,
        joya: joya ? { id: joya.id, nombre: joya.nombre, vendida: joya.vendida, margen: Number(joya.margenObjetivo), prima: Number(joya.primaPct), calc: joyaCalc! } : null,
      };
    });
    return {
      id: l.id,
      codigo: l.codigo,
      nombre: l.nombre,
      proveedor: l.proveedor,
      fecha: l.fecha,
      notas: l.notas,
      ...lote,
      resumen,
      piedras,
    };
  });
}

export type InventarioLote = Awaited<ReturnType<typeof getInventario>>[number];
export type InventarioPiedra = InventarioLote["piedras"][number];

/** Las cifras del tablero: pocas y claras. */
export async function getTablero() {
  const lotes = await getInventario();
  const piedras = lotes.flatMap((l) => l.piedras);
  const ct = (ps: InventarioPiedra[]) => ps.reduce((s, p) => s + p.fila.pesoAjustado, 0);
  const costo = (ps: InventarioPiedra[]) => ps.reduce((s, p) => s + p.fila.costo, 0);
  const disponibles = piedras.filter((p) => p.estado === "disponible");
  const enJoya = piedras.filter((p) => p.estado === "en_joya");
  const vendidas = piedras.filter((p) => p.estado === "vendida");
  const capitalJoyas = enJoya.reduce((s, p) => s + (p.joya?.calc.costoTotal ?? 0), 0);
  const totalCompra = lotes.reduce((s, l) => s + l.costoTotal, 0);
  const ctCompra = lotes.reduce((s, l) => s + (l.ctReal ?? l.ctDeclarados), 0);
  return {
    lotes,
    piedras: piedras.length,
    ct: ct(piedras),
    capitalEnPiedras: costo(disponibles),
    capitalEnJoyas: capitalJoyas,
    totalCompra,
    costoPromedioCt: ctCompra > 0 ? totalCompra / ctCompra : 0,
    disponibles: disponibles.length,
    enJoya: enJoya.length,
    vendidas: vendidas.length,
    ctDisponibles: ct(disponibles),
  };
}
