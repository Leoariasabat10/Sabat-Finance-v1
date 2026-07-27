import type { Prisma } from "@prisma/client";

/**
 * Motor de métricas de comportamiento del cliente — usado tanto por el
 * expediente financiero (un cliente), los insights de negocio (todos los
 * clientes, ver lib/inteligencia/insights.ts) y la Posición del Negocio
 * (lib/posicion/queries.ts). Vive en un solo sitio para que "capital
 * retenido", "puntualidad" y "utilidad generada" nunca se bifurquen entre
 * pantallas — un solo motor, como manda CLAUDE.md.
 *
 * Filosofía de datos incompletos (26 jul 2026): este negocio operó años con
 * papeles y memoria antes de Sabat Finance. `fecha_operacion` no siempre es
 * la fecha real de un préstamo — a veces es solo la fecha en que alguien lo
 * cargó al sistema. Por eso el detector de "capital retenido" nunca depende
 * de una sola señal: cruza fecha (cuando es confiable) con comportamiento de
 * pago real, y siempre declara qué tan seguro está — nunca finge precisión
 * que no tiene.
 */

export const INCLUDE_OPERACION_DETALLE = {
  cuotas: { include: { pagos: { where: { deletedAt: null } } } },
  pagos: { where: { deletedAt: null } },
} satisfies Prisma.OperacionCreditoInclude;

export type OperacionConDetalle = Prisma.OperacionCreditoGetPayload<{
  include: typeof INCLUDE_OPERACION_DETALLE;
}>;

const GRACIA_DIAS = 2; // tolerancia antes de considerar un pago "tarde"
const ANTIGUEDAD_RETENIDO_DIAS = 365;
const TOLERANCIA_SIN_ABONO = 0.98;
const PAGOS_MINIMOS_PARA_PATRON = 2;

export type ConfianzaDato = "alta" | "media" | "baja";

export interface OperacionRetenida {
  operacionId: string;
  /** null cuando la única evidencia es comportamiento de pago, sin fecha usable. */
  antiguedadDias: number | null;
  montoCapital: number;
  saldoPendiente: number;
  confianza: ConfianzaDato;
  origenDeteccion: "fecha" | "comportamiento" | "fecha+comportamiento";
  contextoHistorico: string | null;
}

/**
 * Evalúa un solo préstamo activo/vencido buscando el patrón "capital
 * retenido" (visión final, caso Camilo, 26 jul 2026): se sigue cobrando
 * dinero pero el capital nunca baja. Cruza dos señales independientes:
 *
 * 1. Fecha: ¿lleva más de un año, usando la fecha en la que de verdad
 *    confiamos (fecha_real_aproximada si existe, si no fecha_operacion
 *    solo cuando confianza_fecha = "exacta")?
 * 2. Comportamiento: ¿ya se registraron pagos reales y el saldo casi no
 *    se movió? Esto no depende de ninguna fecha — si mamá cargó el
 *    préstamo ayer pero ya van 3 pagos y el capital sigue intacto, la
 *    señal es tan válida como si llevara un año.
 *
 * Si ninguna señal aplica (fecha no confiable y sin pagos registrados
 * todavía, como el Camilo real hoy) devuelve null — es preferible no decir
 * nada a inventar una conclusión con datos que no existen.
 */
export function evaluarOperacionRetenida(o: OperacionConDetalle): OperacionRetenida | null {
  if (o.origen !== "prestamo" || (o.estado !== "activo" && o.estado !== "vencido")) return null;

  const hoy = new Date();
  const montoCapital = Number(o.montoCapital);
  const saldoPendiente = Number(o.saldoPendienteCalc);
  const saldoCasiIntacto = saldoPendiente >= montoCapital * TOLERANCIA_SIN_ABONO;
  if (!saldoCasiIntacto) return null;

  // Señal 1: fecha, solo si hay una fecha en la que de verdad confiamos.
  let antiguedadDias: number | null = null;
  let confianzaFechaUsable: ConfianzaDato | null = null;
  if (o.fechaRealAproximada) {
    antiguedadDias = Math.floor((hoy.getTime() - o.fechaRealAproximada.getTime()) / 86_400_000);
    confianzaFechaUsable = "media"; // estimación humana, no un registro exacto
  } else if (o.confianzaFecha === "exacta") {
    antiguedadDias = Math.floor((hoy.getTime() - o.fechaOperacion.getTime()) / 86_400_000);
    confianzaFechaUsable = "alta";
  }
  const senalFecha = antiguedadDias !== null && antiguedadDias >= ANTIGUEDAD_RETENIDO_DIAS;

  // Señal 2: comportamiento de pago real — independiente de cualquier fecha.
  const pagosReales = o.pagos.length;
  const senalComportamiento = pagosReales >= PAGOS_MINIMOS_PARA_PATRON;

  if (!senalFecha && !senalComportamiento) return null;

  let confianza: ConfianzaDato;
  let origenDeteccion: OperacionRetenida["origenDeteccion"];
  if (senalFecha && senalComportamiento) {
    confianza = confianzaFechaUsable === "alta" ? "alta" : "alta"; // dos señales coincidiendo = alta confianza siempre
    origenDeteccion = "fecha+comportamiento";
  } else if (senalComportamiento) {
    confianza = "alta"; // pagos reales registrados, no depende de ninguna fecha
    origenDeteccion = "comportamiento";
  } else {
    confianza = confianzaFechaUsable ?? "baja";
    origenDeteccion = "fecha";
  }

  return {
    operacionId: o.id,
    antiguedadDias,
    montoCapital,
    saldoPendiente,
    confianza,
    origenDeteccion,
    contextoHistorico: o.contextoHistorico,
  };
}

export interface MetricasCliente {
  prestadoHistorico: number;
  pagadoHistorico: number;
  saldoActual: number;
  interesGenerado: number;
  /** Aproximación de utilidad realmente cobrada: pagado − capital recuperado. */
  utilidadGenerada: number;
  antiguedadDias: number | null;
  puntualidadPct: number | null;
  cuotasEvaluadas: number;
  operacionRetenida: OperacionRetenida | null;
  moraActivaDias: number;
  vecesRefinanciado: number;
}

export function calcularMetricasCliente(
  operaciones: OperacionConDetalle[],
  primerasFechas: Date[],
  vecesRefinanciado: number,
): MetricasCliente {
  // "anulado" ya no se oculta con deletedAt (ver evaluarOperacionRetenida /
  // anularPrestamo — bug real de QA, 26 jul 2026: un préstamo anulado debe
  // seguir visible en el historial, pero nunca debe sumar como dinero
  // realmente prestado). Se excluye explícitamente aquí en vez de depender
  // de que la fila esté "borrada".
  const prestamos = operaciones.filter((o) => o.origen === "prestamo" && o.estado !== "anulado");
  const activos = operaciones.filter((o) => o.estado === "activo" || o.estado === "vencido");
  const hoy = new Date();

  const prestadoHistorico = prestamos.reduce((a, o) => a + Number(o.montoCapital), 0);
  const pagadoHistorico = operaciones
    .filter((o) => o.estado !== "anulado")
    .reduce((a, o) => a + o.pagos.reduce((s, p) => s + Number(p.valor), 0), 0);
  const saldoActual = activos.reduce((a, o) => a + Number(o.saldoPendienteCalc), 0);
  const interesGenerado = prestamos.reduce((a, o) => a + Number(o.interesTotalCalc), 0);
  const capitalRecuperado = Math.max(0, prestadoHistorico - saldoActual);
  const utilidadGenerada = Math.max(0, pagadoHistorico - capitalRecuperado);

  const antiguedadDias =
    primerasFechas.length > 0
      ? Math.floor((hoy.getTime() - Math.min(...primerasFechas.map((f) => f.getTime()))) / 86_400_000)
      : null;

  // Puntualidad: de las cuotas ya vencidas (pagadas o no), ¿cuántas se
  // pagaron a tiempo? Una cuota "pagada" se evalúa contra el último pago
  // que la cerró; una "vencida" sin pagar cuenta como tardía.
  let aTiempo = 0;
  let evaluadas = 0;
  for (const o of operaciones) {
    for (const c of o.cuotas) {
      if (c.estado === "vencida") {
        evaluadas += 1;
        continue;
      }
      if (c.estado === "pagada" && c.pagos.length > 0) {
        evaluadas += 1;
        const ultimoPago = c.pagos.reduce((max, p) => (p.fechaPago > max ? p.fechaPago : max), c.pagos[0]!.fechaPago);
        const limite = new Date(c.fechaVencimiento);
        limite.setDate(limite.getDate() + GRACIA_DIAS);
        if (ultimoPago <= limite) aTiempo += 1;
      }
    }
  }
  const puntualidadPct = evaluadas > 0 ? Math.round((aTiempo / evaluadas) * 100) : null;

  const moraActivaDias = activos.reduce((max, o) => {
    if (o.fechaVencimiento >= hoy) return max;
    const dias = Math.floor((hoy.getTime() - o.fechaVencimiento.getTime()) / 86_400_000);
    return Math.max(max, dias);
  }, 0);

  const retenidas = prestamos
    .map((o) => evaluarOperacionRetenida(o))
    .filter((r): r is OperacionRetenida => r !== null)
    .sort((a, b) => {
      // Prioriza mayor confianza; entre iguales, la más antigua (o sin fecha al final).
      const orden: Record<ConfianzaDato, number> = { alta: 2, media: 1, baja: 0 };
      if (orden[a.confianza] !== orden[b.confianza]) return orden[b.confianza] - orden[a.confianza];
      return (b.antiguedadDias ?? -1) - (a.antiguedadDias ?? -1);
    });

  return {
    prestadoHistorico,
    pagadoHistorico,
    saldoActual,
    interesGenerado,
    utilidadGenerada,
    antiguedadDias,
    puntualidadPct,
    cuotasEvaluadas: evaluadas,
    operacionRetenida: retenidas[0] ?? null,
    moraActivaDias,
    vecesRefinanciado,
  };
}

/** "3 años" / "1 año" / "8 meses" — para narrativa, no para cálculo. */
export function formatoAntiguedad(dias: number): string {
  const anos = Math.floor(dias / 365);
  if (anos >= 1) return `${anos} año${anos === 1 ? "" : "s"}`;
  const meses = Math.max(1, Math.floor(dias / 30));
  return `${meses} mes${meses === 1 ? "" : "es"}`;
}
