const formateadorCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatearMoneda(valor: number | string | { toString(): string }): string {
  const n = typeof valor === "number" ? valor : Number(valor.toString());
  return formateadorCOP.format(Number.isFinite(n) ? n : 0);
}

const formateadorFecha = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatearFecha(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(`${fecha}T00:00:00`) : fecha;
  return formateadorFecha.format(d);
}

export function fechaHoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function diasEntre(desde: string | Date, hasta: string | Date): number {
  const a = typeof desde === "string" ? new Date(`${desde}T00:00:00`) : desde;
  const b = typeof hasta === "string" ? new Date(`${hasta}T00:00:00`) : hasta;
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
