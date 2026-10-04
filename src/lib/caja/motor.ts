import type { Prisma, PrismaClient } from "@prisma/client";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

/**
 * Libro de caja simple (doc CLAUDE.md: `movimientos_caja`).
 *
 * El saldo es SIEMPRE: dinero con el que empezó el negocio (`capital_inicial`) + todo lo que entró − todo lo
 * que salió. Antes se tomaba el `saldo_resultante_calc` del último movimiento (una cadena): si dos pagos se
 * registraban a la vez, ambos leían el mismo "último" saldo y la cadena quedaba mal; y cambiar el saldo
 * inicial no movía nada. Sumar es exacto y no depende del orden.
 */
export async function obtenerSaldoActual(tx: TxClient): Promise<number> {
  const [config, ingresos, egresos] = await Promise.all([
    tx.configuracion.findUnique({ where: { id: 1 } }),
    tx.movimientoCaja.aggregate({ where: { tipo: "ingreso" }, _sum: { monto: true } }),
    tx.movimientoCaja.aggregate({ where: { tipo: "egreso" }, _sum: { monto: true } }),
  ]);
  return Number(config?.capitalInicial ?? 0) + Number(ingresos._sum.monto ?? 0) - Number(egresos._sum.monto ?? 0);
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
