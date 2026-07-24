import { prisma } from "@/lib/db";
import { obtenerSaldoActual } from "./motor";

export async function getSaldoActual(): Promise<number> {
  return obtenerSaldoActual(prisma);
}

export interface MovimientoListItem {
  id: string;
  tipo: string;
  categoria: string | null;
  monto: number;
  descripcion: string | null;
  fecha: Date;
  saldoResultante: number;
}

export async function listMovimientos(limite = 100): Promise<MovimientoListItem[]> {
  const movimientos = await prisma.movimientoCaja.findMany({
    orderBy: { createdAt: "desc" },
    take: limite,
  });
  return movimientos.map((m) => ({
    id: m.id,
    tipo: m.tipo,
    categoria: m.categoria,
    monto: Number(m.monto),
    descripcion: m.descripcion,
    fecha: m.fecha,
    saldoResultante: Number(m.saldoResultanteCalc),
  }));
}

/** Resumen del día (equivalente a un arqueo rápido): ingresos, egresos y neto de hoy. */
export async function getResumenHoy() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date();
  fin.setHours(23, 59, 59, 999);

  const movimientos = await prisma.movimientoCaja.findMany({
    where: { fecha: { gte: inicio, lte: fin } },
  });

  const ingresos = movimientos.filter((m) => m.tipo === "ingreso").reduce((a, m) => a + Number(m.monto), 0);
  const egresos = movimientos.filter((m) => m.tipo === "egreso").reduce((a, m) => a + Number(m.monto), 0);

  return { ingresos, egresos, neto: ingresos - egresos, movimientos: movimientos.length };
}
