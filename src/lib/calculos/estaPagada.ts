/**
 * "Paz y salvo": una operación queda saldada cuando su saldo pendiente llega
 * a cero. Se tolera un residuo de un centavo por acumulación de redondeos
 * en pagos parciales sucesivos.
 */
export function estaPagada(saldoPendiente: number): boolean {
  return saldoPendiente <= 0.01;
}
