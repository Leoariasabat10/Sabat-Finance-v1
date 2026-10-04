/**
 * Fecha de negocio de Sabat Finance: SIEMPRE la de Bogotá (UTC-5, sin horario de verano).
 *
 * Bug real corregido: el servidor (Vercel) corre en UTC. `new Date().toISOString().slice(0, 10)` y
 * `setHours(0,0,0,0)` daban la fecha UTC, así que desde las 7:00 p. m. en Colombia "hoy" ya era
 * "mañana": una venta o un pago registrado a las 8 p. m. quedaba con la fecha del día siguiente y los
 * cobros "de hoy", las ventas "de hoy" y la mora cambiaban de día antes de tiempo.
 *
 * Las fechas de negocio se guardan como `@db.Date` (medianoche UTC, sin hora). Por eso `hoyFecha()` devuelve
 * la medianoche UTC del día calendario de Bogotá, comparable directamente con esas columnas.
 */
const ZONA = "America/Bogota";

const formateador = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "YYYY-MM-DD" del día actual en Bogotá (o del instante `ahora`, para pruebas). */
export function hoyIso(ahora: Date = new Date()): string {
  return formateador.format(ahora);
}

/** Medianoche UTC del día actual en Bogotá: comparable con columnas `@db.Date`. */
export function hoyFecha(ahora: Date = new Date()): Date {
  return new Date(`${hoyIso(ahora)}T00:00:00Z`);
}

/** Suma (o resta) días a una fecha pura, sin pasar por la hora local. */
export function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getTime() + dias * 86_400_000);
}

/** Primer día del mes de una fecha pura. */
export function inicioDeMes(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), 1));
}

/** Días enteros de `desde` a `hasta` (positivo si `hasta` es posterior). */
export function diasEntreFechas(desde: Date, hasta: Date): number {
  return Math.round((hasta.getTime() - desde.getTime()) / 86_400_000);
}
