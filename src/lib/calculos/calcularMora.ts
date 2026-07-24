import { redondear } from "./redondeo";
import type { ParametrosMora } from "./tipos";

/**
 * Mora configurable (doc 04, sección 4.7).
 * - porcentaje_diario: mora = valorCuota × tasaMora × diasAtraso (tasaMora ej. 0.01 = 1%/día)
 * - fijo: mora = tasaMora × diasAtraso (tasaMora = valor fijo en pesos por día)
 *
 * Se calcula día a día (pensado para correr desde un job diario que
 * actualiza cuotas.mora_acumulada), no "al vuelo" en el frontend, para que
 * el histórico quede consistente aunque el usuario no entre a la app ese día.
 */
export function calcularMora(params: ParametrosMora): number {
  const { valorCuota, diasAtraso, tipoMora, tasaMora } = params;

  if (diasAtraso <= 0) return 0;
  if (tasaMora < 0) throw new Error("tasaMora no puede ser negativa.");

  if (tipoMora === "porcentaje_diario") {
    return redondear(valorCuota * tasaMora * diasAtraso);
  }
  // fijo
  return redondear(tasaMora * diasAtraso);
}
