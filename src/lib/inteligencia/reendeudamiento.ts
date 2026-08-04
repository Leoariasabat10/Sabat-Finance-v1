import type { OperacionConDetalle } from "@/lib/clientes/metricas";

/**
 * Auditoría "paga diario" (ver spec): el riesgo operativo real del gota a
 * gota no es solo "pagar solo intereses sin bajar capital" (eso ya lo cubre
 * `evaluarOperacionRetenida`) — es el ciclo distinto de "le presté de nuevo
 * para que pudiera pagar la cuota de hoy". La señal es la proximidad
 * temporal: un préstamo nuevo que nace muy pocos días después de un pago en
 * OTRA operación activa del mismo cliente. No se bloquea nada — el negocio
 * pide hacerlo visible, no impedirlo, para que la decisión de prestar de
 * nuevo se tome con los ojos abiertos.
 */
const VENTANA_REENDEUDAMIENTO_DIAS = 3;

export interface SenalReendeudamiento {
  operacionNuevaId: string;
  operacionPagadaId: string;
  fechaPago: Date;
  fechaPrestamoNuevo: Date;
  diasEntre: number;
  montoNuevo: number;
  valorPago: number;
}

/**
 * Recibe todas las operaciones (con pagos) de UN cliente y devuelve cada
 * préstamo nuevo que aparece dentro de la ventana de un pago hecho en otra
 * operación de ese mismo cliente. Puede haber varias señales por cliente —
 * cuantas más, más fuerte el patrón de ciclo.
 */
export function detectarReendeudamiento(operaciones: OperacionConDetalle[]): SenalReendeudamiento[] {
  const prestamos = operaciones.filter((o) => o.origen === "prestamo" && o.estado !== "anulado");
  const senales: SenalReendeudamiento[] = [];

  for (const nueva of prestamos) {
    let mejorPago: { fechaPago: Date; valor: number; operacionId: string } | null = null;

    for (const previa of prestamos) {
      if (previa.id === nueva.id) continue;
      for (const pago of previa.pagos) {
        const diasEntre = Math.floor((nueva.fechaOperacion.getTime() - pago.fechaPago.getTime()) / 86_400_000);
        if (diasEntre < 0 || diasEntre > VENTANA_REENDEUDAMIENTO_DIAS) continue;
        if (!mejorPago || pago.fechaPago > mejorPago.fechaPago) {
          mejorPago = { fechaPago: pago.fechaPago, valor: Number(pago.valor), operacionId: previa.id };
        }
      }
    }

    if (mejorPago) {
      senales.push({
        operacionNuevaId: nueva.id,
        operacionPagadaId: mejorPago.operacionId,
        fechaPago: mejorPago.fechaPago,
        fechaPrestamoNuevo: nueva.fechaOperacion,
        diasEntre: Math.floor((nueva.fechaOperacion.getTime() - mejorPago.fechaPago.getTime()) / 86_400_000),
        montoNuevo: Number(nueva.montoCapital),
        valorPago: mejorPago.valor,
      });
    }
  }

  return senales;
}
