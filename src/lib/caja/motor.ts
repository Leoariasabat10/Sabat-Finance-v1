import type { Prisma, PrismaClient } from "@prisma/client";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

/**
 * Libro de caja simple con saldo corrido (doc CLAUDE.md: `movimientos_caja`).
 * El saldo de cada movimiento se calcula a partir del último movimiento
 * registrado (o de `configuracion.capital_inicial` si todavía no hay ninguno).
 */
export async function obtenerSaldoActual(tx: TxClient): Promise<number> {
  const ultimo = await tx.movimientoCaja.findFirst({ orderBy: { createdAt: "desc" } });
  if (ultimo) return Number(ultimo.saldoResultanteCalc);
  const config = await tx.configuracion.findUnique({ where: { id: 1 } });
  return Number(config?.capitalInicial ?? 0);
}

export interface ParametrosMovimientoCaja {
  tipo: "ingreso" | "egreso";
  monto: number;
  categoria?: string;
  referenciaId?: string;
  referenciaTipo?: string;
  fecha: string; // YYYY-MM-DD
  descripcion?: string;
}

export async function registrarMovimientoCaja(tx: TxClient, params: ParametrosMovimientoCaja) {
  const saldoAnterior = await obtenerSaldoActual(tx);
  const saldoResultante =
    params.tipo === "ingreso" ? saldoAnterior + params.monto : saldoAnterior - params.monto;

  return tx.movimientoCaja.create({
    data: {
      tipo: params.tipo,
      monto: params.monto,
      categoria: params.categoria,
      referenciaId: params.referenciaId,
      referenciaTipo: params.referenciaTipo,
      fecha: new Date(`${params.fecha}T00:00:00Z`),
      descripcion: params.descripcion,
      saldoResultanteCalc: saldoResultante,
    },
  });
}

export type { Prisma };
