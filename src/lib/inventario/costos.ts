import { redondear } from "../calculos/redondeo";

/** Peso que cuenta para repartir el costo: el medido si existe, si no el estimado. */
export interface PiedraPeso {
  id: string;
  ctReal?: number | null;
  ctEstimado: number;
}

const pesoDe = (p: PiedraPeso) => p.ctReal ?? p.ctEstimado;

/** Costo del lote por quilate declarado. */
export function costoPorCt(costoTotal: number, ctDeclarados: number): number {
  return ctDeclarados > 0 ? costoTotal / ctDeclarados : 0;
}

/**
 * Reparte el costo del lote entre sus piedras en proporción al peso. La suma es EXACTA
 * (el residuo de redondeo va a la última piedra), así el inventario siempre cuadra con la compra.
 */
export function asignarCostoLote(costoTotal: number, piedras: PiedraPeso[]): Record<string, number> {
  const total = piedras.reduce((s, p) => s + pesoDe(p), 0);
  const out: Record<string, number> = {};
  if (total <= 0) return out;
  let asignado = 0;
  piedras.forEach((p, i) => {
    const v = i === piedras.length - 1 ? redondear(costoTotal - asignado) : redondear((costoTotal * pesoDe(p)) / total);
    out[p.id] = v;
    asignado += v;
  });
  return out;
}

/** Costo SABAT de una joya terminada = piedra + todo lo que costó transformarla (montaje, plata, mano de obra, caja…). */
export function costoJoya(costoPiedra: number, transformacion: number[]): number {
  return redondear(costoPiedra + transformacion.reduce((s, c) => s + c, 0));
}

/** Margen sobre el precio (no sobre el costo): margen 0,6 → precio = costo / 0,4. */
export function precioMinimo(costo: number, margen: number): number {
  if (margen < 0 || margen >= 1) throw new RangeError("margen debe estar en [0, 1)");
  return Math.ceil(costo / (1 - margen));
}

export type Veredicto = "atractiva" | "aceptable" | "no_recomendada";

export interface EntradaCompra {
  precioPedido: number;
  ctDeclarados: number;
  /** Peso estimado por dimensiones; si falta se usa el declarado. */
  ctEstimados?: number;
  costosAdicionales?: number;
  /** Máximo $/ct que SABAT está dispuesta a pagar. */
  precioMaxCt: number;
}

export function simularCompra(e: EntradaCompra) {
  const ct = e.ctEstimados ?? e.ctDeclarados;
  const declaradoCt = costoPorCt(e.precioPedido, e.ctDeclarados);
  const efectivoCt = costoPorCt(e.precioPedido + (e.costosAdicionales ?? 0), ct);
  // ponytail: umbral fijo de 10% bajo el máximo para "atractiva"; volverlo configurable si el criterio cambia.
  const veredicto: Veredicto = efectivoCt <= e.precioMaxCt * 0.9 ? "atractiva" : efectivoCt <= e.precioMaxCt ? "aceptable" : "no_recomendada";
  return { declaradoCt: Math.round(declaradoCt), efectivoCt: Math.round(efectivoCt), veredicto };
}

// ── Sistema completo: lote → piedras → joya ───────────────────────────
// Convención: nada se redondea aquí; se redondea solo al mostrar (formatearMoneda / toFixed).

export const SG_ESMERALDA = 2.72;
/** Factor de volumen/forma calibrado con ESM-001 (corazón 12.4×13.3×8.0 mm ≈ 8.7 ct). Es un estimado interno, no peso real. */
export const FACTOR_FORMA = 0.485;

/** ct ≈ L×A×H × SG × factor / 200. ponytail: un solo factor para todas las tallas; afinar por forma cuando haya pesos reales. */
export function estimarCt(largoMm: number, anchoMm: number, altoMm: number, factor = FACTOR_FORMA): number {
  return (largoMm * anchoMm * altoMm * SG_ESMERALDA * factor) / 200;
}

export interface PiedraLote extends PiedraPeso {
  ctReal?: number | null;
}

export function resumenLote(lote: { costoTotal: number; ctDeclarados: number; ctReal?: number | null }, piedras: PiedraLote[]) {
  const medidas = piedras.filter((p) => p.ctReal != null);
  const sinMedir = piedras.filter((p) => p.ctReal == null);
  const sumMedido = medidas.reduce((s, p) => s + (p.ctReal as number), 0);
  const sumEstSinMedir = sinMedir.reduce((s, p) => s + p.ctEstimado, 0);
  const sumEstimado = piedras.reduce((s, p) => s + p.ctEstimado, 0);

  // Las piedras sin pesar se reparten lo que falta del peso real del lote, en proporción a su estimado.
  const escala = lote.ctReal != null && sumEstSinMedir > 0 && lote.ctReal > sumMedido ? (lote.ctReal - sumMedido) / sumEstSinMedir : 1;
  const ajustado = (p: PiedraLote) => (p.ctReal != null ? p.ctReal : p.ctEstimado * escala);
  const totalPeso = piedras.reduce((s, p) => s + ajustado(p), 0);

  const filas = piedras.map((p) => {
    const pesoAjustado = ajustado(p);
    const participacion = totalPeso > 0 ? pesoAjustado / totalPeso : 0;
    const costo = lote.costoTotal * participacion;
    return { id: p.id, pesoEstimado: p.ctEstimado, pesoReal: p.ctReal ?? null, pesoAjustado, participacion, costo, costoPorCt: pesoAjustado > 0 ? costo / pesoAjustado : 0 };
  });

  const pesoReferencia = lote.ctReal ?? lote.ctDeclarados;
  return {
    costoPorCtDeclarado: costoPorCt(lote.costoTotal, lote.ctDeclarados),
    costoPorCtReal: lote.ctReal != null ? costoPorCt(lote.costoTotal, lote.ctReal) : null,
    sumEstimado,
    sumMedido,
    /** Estimado por dimensiones − peso real (o declarado) del lote. Positivo = las dimensiones sobreestiman. */
    diferenciaEstimadoVsLote: sumEstimado - pesoReferencia,
    diferenciaDeclaradoVsReal: lote.ctReal != null ? lote.ctDeclarados - lote.ctReal : null,
    piedrasSinPesar: sinMedir.length,
    filas,
  };
}

export type Concepto = "montaje" | "plata" | "cadena" | "mano_obra" | "caja" | "otros";

export function resumenJoya(e: {
  costoPiedra: number;
  costos: { concepto: Concepto; monto: number }[];
  margenObjetivo: number;
  primaPct?: number;
  precioSabat?: number | null;
}) {
  if (e.margenObjetivo < 0 || e.margenObjetivo >= 1) throw new RangeError("margen debe estar en [0, 1)");
  const porConcepto: Record<Concepto, number> = { montaje: 0, plata: 0, cadena: 0, mano_obra: 0, caja: 0, otros: 0 };
  for (const c of e.costos) porConcepto[c.concepto] += c.monto;
  const transformacion = e.costos.reduce((s, c) => s + c.monto, 0);
  const costoTotal = e.costoPiedra + transformacion;
  const minimo = costoTotal / (1 - e.margenObjetivo);
  const recomendado = minimo * (1 + (e.primaPct ?? 0));
  const p = e.precioSabat ?? null;
  return {
    costoPiedra: e.costoPiedra,
    porConcepto,
    transformacion,
    costoTotal,
    precioMinimo: minimo,
    precioRecomendado: recomendado,
    precioSabat: p,
    utilidad: p != null ? p - costoTotal : null,
    margenReal: p != null && p > 0 ? (p - costoTotal) / p : null,
    /** Rentabilidad sobre lo invertido (utilidad ÷ costo). */
    rentabilidad: p != null && costoTotal > 0 ? (p - costoTotal) / costoTotal : null,
    bajoMinimo: p != null && p < minimo,
  };
}

// Ajustes cualitativos sobre el precio máximo/ct del simulador (editables; no son tasación gemológica).
export const AJUSTES_CALIDAD = {
  calidad: { alta: 0.1, media: 0, baja: -0.15 },
  color: { intenso: 0.05, medio: 0, palido: -0.1 },
  transparencia: { limpia: 0.05, incluida: 0, muy_incluida: -0.15 },
  tratamiento: { ninguno: 0.1, aceite_menor: 0, significativo: -0.15 },
} as const;

export function simularCompraCompleta(e: EntradaCompra & { numPiedras?: number; dimensiones?: [number, number, number][]; ajustes?: number[] }) {
  const ctDim = e.dimensiones?.length ? e.dimensiones.reduce((s, d) => s + estimarCt(d[0], d[1], d[2]), 0) : undefined;
  const ctEst = e.ctEstimados ?? ctDim;
  const maxAjustado = e.precioMaxCt * (e.ajustes ?? []).reduce((a, f) => a * (1 + f), 1);
  const base = simularCompra({ ...e, ctEstimados: ctEst, precioMaxCt: maxAjustado });
  const ct = ctEst ?? e.ctDeclarados;
  const costoEfectivo = e.precioPedido + (e.costosAdicionales ?? 0);
  return {
    ...base,
    pesoEstimado: ct,
    precioMaxCtAjustado: maxAjustado,
    diferenciaCt: base.efectivoCt - base.declaradoCt,
    diferenciaPeso: ct - e.ctDeclarados,
    costoEfectivo,
    /** Holgura frente al máximo objetivo: (máx − efectivo/ct) ÷ máx. Negativo = por encima del máximo. */
    margenPotencial: maxAjustado > 0 ? (maxAjustado - costoEfectivo / ct) / maxAjustado : 0,
    costoPorPiedra: e.numPiedras ? costoEfectivo / e.numPiedras : null,
  };
}
