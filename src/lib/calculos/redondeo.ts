/** Redondeo a 2 decimales (pesos con centavos) evitando arrastre de flotantes. */
export function redondear(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}
