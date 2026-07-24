import { calcularInteres } from "./calcularInteres";
import { redondear } from "./redondeo";
import type { ParametrosRenovacion, ResultadoRenovacion } from "./tipos";

function diasPorPeriodo(tipoInteres: ParametrosRenovacion["tipoInteres"], diasBasePersonalizado?: number): number {
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
      return diasBasePersonalizado ?? 30;
  }
}

function sumarDias(fechaIso: string, dias: number): string {
  const fecha = new Date(`${fechaIso}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + Math.round(dias));
  return fecha.toISOString().slice(0, 10);
}

/**
 * Renovación (doc 04, sección 4.9): el cliente paga exactamente el interés
 * del período, el capital se mantiene igual y el plazo se extiende un
 * período más — la operación NO cambia de id (a diferencia de refinanciar).
 * Devuelve el interés a cobrar ahora y la nueva fecha de vencimiento; la
 * capa de Server Actions es la que registra el pago y mueve
 * fecha_vencimiento en operaciones_credito.
 */
export function simularRenovacion(params: ParametrosRenovacion): ResultadoRenovacion {
  const { capitalPendiente, tasaInteres, tipoInteres, fechaVencimientoActual, diasBasePersonalizado } = params;

  const dias = diasPorPeriodo(tipoInteres, diasBasePersonalizado);

  const { interesTotal } = calcularInteres({
    montoCapital: capitalPendiente,
    tasaInteres,
    tipoInteres,
    plazoDias: dias,
    diasBasePersonalizado,
  });

  return {
    interesPeriodo: interesTotal,
    nuevaFechaVencimiento: sumarDias(fechaVencimientoActual, dias),
    capitalPendiente: redondear(capitalPendiente),
  };
}
