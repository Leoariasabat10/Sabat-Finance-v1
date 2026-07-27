const formateadorCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatearMoneda(valor: number | string | { toString(): string }): string {
  const n = typeof valor === "number" ? valor : Number(valor.toString());
  return formateadorCOP.format(Number.isFinite(n) ? n : 0);
}

// Bug real encontrado en QA de producción (26 jul 2026): las fechas de
// negocio se guardan como @db.Date (medianoche UTC, sin hora). Si se
// formatean sin fijar timeZone: "UTC", Intl.DateTimeFormat las convierte a
// la hora local del servidor — en Colombia (UTC-5) eso muestra TODAS las
// fechas de la app un día antes de la fecha real guardada (un préstamo con
// vencimiento real 26 de agosto aparecía como "25 de ago" en todas partes).
// Toda fecha de negocio en este sistema se trata como fecha pura (sin hora),
// así que se ancla a UTC de punta a punta: al parsear un string y al
// formatear cualquier Date.
const formateadorFecha = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatearFecha(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(`${fecha}T00:00:00Z`) : fecha;
  return formateadorFecha.format(d);
}

export function fechaHoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function diasEntre(desde: string | Date, hasta: string | Date): number {
  const a = typeof desde === "string" ? new Date(`${desde}T00:00:00Z`) : desde;
  const b = typeof hasta === "string" ? new Date(`${hasta}T00:00:00Z`) : hasta;
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
