/**
 * El "CFO dentro del software" (fase 2, visión de producto — 27 jul 2026):
 * Sabat Finance ya no debe limitarse a mostrar cifras — debe recomendar.
 * Esta pieza calcula, con la información real del negocio, la respuesta a
 * la pregunta más frecuente de la dueña: "¿cuánto puedo prestar hoy sin
 * quedarme sin plata para lo que ya se vino encima (cobros vencidos,
 * imprevistos)?"
 *
 * Regla de negocio deliberadamente simple (no es una promesa de precisión
 * contable, es una guardarraíl): nunca recomendar prestar el 100% de lo
 * disponible. Se reserva un colchón — por defecto 20% — para que un cobro
 * que se atrasa o un imprevisto no deje la caja en cero. El número se
 * redondea hacia abajo a la decena de mil más cercana porque es la unidad
 * en la que Geisa realmente presta.
 */

const COLCHON_SEGURIDAD_PCT = 0.2;

export interface CupoSeguro {
  /** Monto recomendado a prestar hoy, ya con el colchón de seguridad aplicado. */
  cupo: number;
  /** true si viene del capital configurado (exacto); false si es una aproximación con el saldo de caja. */
  confiable: boolean;
  /** Mensaje en tono de CFO, listo para mostrar. */
  mensaje: string;
}

function redondearMil(valor: number): number {
  return Math.floor(valor / 10_000) * 10_000;
}

const moneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

/**
 * Calcula cuánto es seguro prestar hoy.
 *
 * Si el negocio ya configuró su capital inicial, usa `capitalDisponible`
 * (capital total − prestado − invertido en mercancía) porque es la cifra
 * exacta de la Posición del Negocio. Si todavía no lo configuró (caso muy
 * común el primer día de uso), no bloquea la recomendación — usa el saldo
 * de caja como aproximación razonable y lo marca como no confiable, para
 * que la interfaz pueda decirlo con honestidad.
 */
export function calcularCupoSeguro(params: {
  capitalTotalConfigurado: number;
  capitalDisponible: number;
  saldoCaja: number;
}): CupoSeguro {
  const usaCapitalConfigurado = params.capitalTotalConfigurado > 0;
  const base = usaCapitalConfigurado ? params.capitalDisponible : params.saldoCaja;

  if (base <= 0) {
    return {
      cupo: 0,
      confiable: usaCapitalConfigurado,
      mensaje: usaCapitalConfigurado
        ? "No prestes hoy. Tu capital disponible está en cero o negativo — antes de prestar, cobra lo pendiente o recupera capital retenido."
        : "No prestes hoy. Tu caja está en cero o negativa — antes de prestar, cobra lo pendiente.",
    };
  }

  const cupo = redondearMil(base * (1 - COLCHON_SEGURIDAD_PCT));

  const mensaje = usaCapitalConfigurado
    ? `Puedes prestar hasta ${moneda.format(cupo)} hoy sin comprometer tu liquidez. Dejamos ${moneda.format(redondearMil(base - cupo))} de colchón por si algún cobro se atrasa.`
    : `Puedes prestar hasta ${moneda.format(cupo)} hoy, calculado sobre tu saldo de caja (aproximado — configura tu capital inicial en Configuración para un cálculo exacto).`;

  return { cupo, confiable: usaCapitalConfigurado, mensaje };
}

export interface ImpactoRecuperarCapital {
  capitalDisponibleActual: number;
  capitalDisponibleProyectado: number;
  cupoSeguroActual: number;
  cupoSeguroProyectado: number;
  mensaje: string;
}

/**
 * Simulación "¿qué pasa si recupero este capital retenido?" — la pregunta
 * que sigue naturalmente a ver a alguien como Camilo en la lista de capital
 * retenido. No es un adorno: convierte la alerta en una cifra de impacto
 * sobre lo único que a Geisa le importa — cuánto más podría prestar mañana.
 */
export function simularRecuperarCapital(params: {
  montoARecuperar: number;
  capitalTotalConfigurado: number;
  capitalDisponible: number;
  saldoCaja: number;
}): ImpactoRecuperarCapital {
  const actual = calcularCupoSeguro({
    capitalTotalConfigurado: params.capitalTotalConfigurado,
    capitalDisponible: params.capitalDisponible,
    saldoCaja: params.saldoCaja,
  });
  const proyectado = calcularCupoSeguro({
    capitalTotalConfigurado: params.capitalTotalConfigurado,
    capitalDisponible: params.capitalDisponible + params.montoARecuperar,
    saldoCaja: params.saldoCaja + params.montoARecuperar,
  });

  return {
    capitalDisponibleActual: params.capitalDisponible,
    capitalDisponibleProyectado: params.capitalDisponible + params.montoARecuperar,
    cupoSeguroActual: actual.cupo,
    cupoSeguroProyectado: proyectado.cupo,
    mensaje: `Si recuperas ${moneda.format(params.montoARecuperar)}, tu cupo seguro para prestar pasa de ${moneda.format(actual.cupo)} a ${moneda.format(proyectado.cupo)}.`,
  };
}

/**
 * Narrativa completa para un cliente con capital retenido — la versión
 * "CFO" del hallazgo, no solo el dato. Se usa en Mi dinero junto a la
 * simulación de impacto, y es la misma idea que ya vive en
 * lib/clientes/expediente.ts para el expediente individual (mismo negocio,
 * dos lugares — deliberado: aquí se agrega el impacto en el cupo de
 * préstamo, que el expediente individual no conoce).
 */
export function narrativaImpactoCapitalRetenido(params: {
  clienteNombre: string;
  montoCapital: number;
  antiguedadDias: number | null;
  pctDelCapitalTotal: number | null;
}): string {
  const monto = moneda.format(params.montoCapital);
  const tiempo =
    params.antiguedadDias !== null
      ? `lleva aproximadamente ${Math.floor(params.antiguedadDias / 365) >= 1 ? `${Math.floor(params.antiguedadDias / 365)} año${Math.floor(params.antiguedadDias / 365) === 1 ? "" : "s"}` : `${Math.floor(params.antiguedadDias / 30)} meses`} pagando solo intereses`
      : "lleva un tiempo pagando solo intereses, sin abonar capital";
  const pct = params.pctDelCapitalTotal !== null ? ` Ese cliente ya representa el ${params.pctDelCapitalTotal.toFixed(0)}% de tu capital retenido.` : "";
  return `${params.clienteNombre} ${tiempo} sobre ${monto}. Ese dinero no ha vuelto al negocio: mientras sigue inmovilizado, pierdes la oportunidad de prestarlo de nuevo.${pct} Recomendación: negocia una devolución parcial o total antes de aprobarle un préstamo nuevo.`;
}
