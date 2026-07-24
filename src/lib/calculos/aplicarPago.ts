import { redondear } from "./redondeo";
import type { ParametrosAplicarPago, ResultadoAplicarPago } from "./tipos";

/**
 * Aplica un abono a un saldo pendiente (interés + capital), doc 04 sección 4.5.
 *
 * - tipoAbono='abono_capital': todo el abono baja capital, el interés pendiente no se toca.
 * - tipoAbono='abono_interes': todo el abono baja interés, el capital pendiente no se toca.
 * - tipoAbono='cuota_completa' (o 'mora', tratada igual aquí): usa
 *   ordenAplicacionPago:
 *     - 'interes_primero' (regla dura #3 / default del negocio): primero
 *       cubre el interés pendiente, el resto baja capital.
 *     - 'proporcional': reparte el abono según el peso de interés/capital
 *       en el saldo total, como una cuota de amortización bancaria.
 *
 * Los pendientes nunca bajan de cero (un abono mayor al saldo no genera
 * saldo negativo); `pagadoCompleto` indica si el saldo quedó en cero.
 */
export function aplicarPago(params: ParametrosAplicarPago): ResultadoAplicarPago {
  const { interesPendiente, capitalPendiente, montoAbono, tipoAbono, ordenAplicacionPago } = params;

  if (montoAbono <= 0) throw new Error("montoAbono debe ser mayor que cero.");

  let aplicadoInteres = 0;
  let aplicadoCapital = 0;

  if (tipoAbono === "abono_capital") {
    aplicadoCapital = Math.min(montoAbono, capitalPendiente);
  } else if (tipoAbono === "abono_interes") {
    aplicadoInteres = Math.min(montoAbono, interesPendiente);
  } else if (ordenAplicacionPago === "proporcional") {
    const totalPendiente = interesPendiente + capitalPendiente;
    if (totalPendiente <= 0) {
      // Nada pendiente: el abono no tiene dónde aplicarse.
      aplicadoInteres = 0;
      aplicadoCapital = 0;
    } else {
      const montoEfectivo = Math.min(montoAbono, totalPendiente);
      const propInteres = interesPendiente / totalPendiente;
      aplicadoInteres = redondear(montoEfectivo * propInteres);
      aplicadoCapital = redondear(montoEfectivo - aplicadoInteres);
    }
  } else {
    // interes_primero (default del negocio)
    aplicadoInteres = Math.min(montoAbono, interesPendiente);
    const restante = montoAbono - aplicadoInteres;
    aplicadoCapital = Math.min(restante, capitalPendiente);
  }

  const nuevoInteresPendiente = redondear(Math.max(0, interesPendiente - aplicadoInteres));
  const nuevoCapitalPendiente = redondear(Math.max(0, capitalPendiente - aplicadoCapital));
  const saldoPendiente = redondear(nuevoInteresPendiente + nuevoCapitalPendiente);

  return {
    aplicadoInteres: redondear(aplicadoInteres),
    aplicadoCapital: redondear(aplicadoCapital),
    interesPendiente: nuevoInteresPendiente,
    capitalPendiente: nuevoCapitalPendiente,
    saldoPendiente,
    pagadoCompleto: saldoPendiente <= 0,
  };
}
