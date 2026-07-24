import { calcularInteres } from "./calcularInteres";
import { generarCalendarioCuotas } from "./generarCalendarioCuotas";
import type { ParametrosRefinanciacion, ResultadoRefinanciacion } from "./tipos";

/**
 * Refinanciación (doc 04, sección 4.8): el saldo pendiente consolidado
 * (capital + interés + mora) se convierte en el nuevo capital de una
 * operación nueva. No es una función separada del motor: reutiliza
 * calcularInteres()/generarCalendarioCuotas() tal cual — la creación de la
 * operación_credito hija, el cierre de la original y el registro en
 * `refinanciaciones` son responsabilidad de la capa de Server Actions
 * (Módulo 11), no de este motor puro.
 */
export function simularRefinanciacion(params: ParametrosRefinanciacion): ResultadoRefinanciacion {
  const {
    saldoPendienteConsolidado,
    nuevaTasaInteres,
    nuevoTipoInteres,
    nuevoPlazoDias,
    numeroCuotas,
    fechaOperacion,
    diasBasePersonalizado,
  } = params;

  const interes = calcularInteres({
    montoCapital: saldoPendienteConsolidado,
    tasaInteres: nuevaTasaInteres,
    tipoInteres: nuevoTipoInteres,
    plazoDias: nuevoPlazoDias,
    diasBasePersonalizado,
  });

  const cuotas = generarCalendarioCuotas({
    montoCapital: saldoPendienteConsolidado,
    interesTotal: interes.interesTotal,
    numeroCuotas,
    fechaOperacion,
    diasPorPeriodo: nuevoPlazoDias / numeroCuotas,
  });

  return { montoCapital: saldoPendienteConsolidado, interes, cuotas };
}
