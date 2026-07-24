import { redondear } from "./redondeo";
import type { ParametrosInteres, ResultadoInteres, TipoInteres } from "./tipos";

/**
 * Días que representa un "periodo" según el tipo de interés (doc 04, secciones 4.2-4.4).
 * `personalizado` exige que el llamador indique la base (ej. "3% cada 10 días" → 10).
 */
function diasPorPeriodo(tipoInteres: TipoInteres, diasBasePersonalizado?: number): number {
  switch (tipoInteres) {
    case "diario":
      return 1;
    case "semanal":
      return 7;
    case "quincenal":
      return 15;
    case "mensual":
      return 30;
    case "personalizado":
      if (!diasBasePersonalizado || diasBasePersonalizado <= 0) {
        throw new Error(
          "tipoInteres 'personalizado' requiere diasBasePersonalizado (ej. 10 para '3% cada 10 días').",
        );
      }
      return diasBasePersonalizado;
  }
}

/**
 * Modelo fijo sobre capital inicial (decisión aprobada, ver DECISIONS.md):
 * interesTotal = montoCapital × tasaInteres × numeroDePeriodos.
 * numeroDePeriodos = plazoDias / diasPorPeriodo — puede ser fraccionario
 * (pago anticipado o plazo que no calza con el periodo, doc 04 sección 4.3).
 *
 * Para ventas a crédito (origen='venta') se invoca con tasaInteres=0: la
 * fórmula da interesTotal=0 de forma natural, sin rama especial (doc 04,
 * sección 4.12 — regla dura #4 de CLAUDE.md).
 */
export function calcularInteres(params: ParametrosInteres): ResultadoInteres {
  const { montoCapital, tasaInteres, tipoInteres, plazoDias, diasBasePersonalizado } = params;

  if (montoCapital <= 0) throw new Error("montoCapital debe ser mayor que cero.");
  if (tasaInteres < 0) throw new Error("tasaInteres no puede ser negativa.");
  if (plazoDias <= 0) throw new Error("plazoDias debe ser mayor que cero.");

  const diasPeriodo = diasPorPeriodo(tipoInteres, diasBasePersonalizado);
  const numeroPeriodos = plazoDias / diasPeriodo;
  const interesTotal = redondear(montoCapital * tasaInteres * numeroPeriodos);
  const totalAPagar = redondear(montoCapital + interesTotal);

  return { interesTotal, totalAPagar, numeroPeriodos, diasPorPeriodo: diasPeriodo };
}
