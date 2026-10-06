export const ct = (v: number, d = 2) => `${v.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d })} ct`;
export const pct = (v: number | null, d = 0) => (v == null ? "—" : `${(v * 100).toLocaleString("es-CO", { maximumFractionDigits: d })} %`);
export const ESTADO_PIEDRA = { disponible: "Disponible", en_joya: "En joya", vendida: "Vendida" } as const;
export const VARIANTE_ESTADO = { disponible: "success", en_joya: "warning", vendida: "info" } as const;
export const CONCEPTOS = [
  ["montaje", "Montaje"],
  ["plata", "Plata"],
  ["cadena", "Cadena"],
  ["mano_obra", "Mano de obra"],
  ["caja", "Caja / empaque"],
  ["otros", "Otros"],
] as const;
export const campo =
  "w-full border border-[color:var(--border-md)] bg-card min-h-11 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus-visible:border-accent";
