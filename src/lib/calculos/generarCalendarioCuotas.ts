import { redondear } from "./redondeo";
import type { CuotaCalculada, ParametrosCalendario } from "./tipos";

function sumarDias(fechaIso: string, dias: number): string {
  const fecha = new Date(`${fechaIso}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + Math.round(dias));
  return fecha.toISOString().slice(0, 10);
}

/**
 * Reparto simple en partes iguales (doc 04, secciones 4.4 y 4.12): capital e
 * interés se dividen entre el número de cuotas. Funciona sin rama especial
 * para ventas a crédito porque interesTotal ya viene en 0 desde
 * calcularInteres() cuando origen='venta'.
 *
 * El redondeo de cada cuota puede dejar un residuo de centavos frente al
 * total exacto; ese residuo se ajusta en la última cuota para que la suma
 * de todas las cuotas cuadre exactamente con montoCapital + interesTotal.
 */
export function generarCalendarioCuotas(params: ParametrosCalendario): CuotaCalculada[] {
  const { montoCapital, interesTotal, numeroCuotas, fechaOperacion, diasPorPeriodo } = params;

  if (numeroCuotas <= 0) throw new Error("numeroCuotas debe ser mayor que cero.");

  const capitalPorCuota = redondear(montoCapital / numeroCuotas);
  const interesPorCuota = redondear(interesTotal / numeroCuotas);

  const cuotas: CuotaCalculada[] = [];
  let capitalAcumulado = 0;
  let interesAcumulado = 0;

  for (let i = 1; i <= numeroCuotas; i++) {
    const esUltima = i === numeroCuotas;
    const capital = esUltima ? redondear(montoCapital - capitalAcumulado) : capitalPorCuota;
    const interes = esUltima ? redondear(interesTotal - interesAcumulado) : interesPorCuota;

    capitalAcumulado = redondear(capitalAcumulado + capital);
    interesAcumulado = redondear(interesAcumulado + interes);

    cuotas.push({
      numeroCuota: i,
      fechaVencimiento: sumarDias(fechaOperacion, diasPorPeriodo * i),
      capital,
      interes,
      total: redondear(capital + interes),
    });
  }

  return cuotas;
}
