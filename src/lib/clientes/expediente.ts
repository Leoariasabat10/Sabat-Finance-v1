import { prisma } from "@/lib/db";
import { calcularMetricasCliente, formatoAntiguedad, INCLUDE_OPERACION_DETALLE, type ConfianzaDato } from "./metricas";
import { detectarReendeudamiento } from "@/lib/inteligencia/reendeudamiento";

export type TonoRecomendacion = "success" | "warning" | "danger" | "info";
export type EtiquetaComportamiento = "puntual" | "tardio" | "solo-intereses" | "alto-riesgo" | "nuevo" | "reendeudamiento";

export interface Recomendacion {
  tono: TonoRecomendacion;
  texto: string;
  boton: { texto: string; href: string } | null;
  /** Cuándo la recomendación no viene de una sola consulta SQL limpia: qué tan segura está. */
  confianza: ConfianzaDato | null;
}

export interface ExpedienteFinanciero {
  prestadoHistorico: number;
  pagadoHistorico: number;
  saldoActual: number;
  interesGenerado: number;
  utilidadGenerada: number;
  antiguedadDias: number | null;
  antiguedadTexto: string | null;
  puntualidadPct: number | null; // null = sin historial suficiente
  cuotasEvaluadas: number;
  capitalRetenido: boolean;
  vecesReendeudado: number;
  moraActivaDias: number;
  vecesRefinanciado: number;
  etiquetas: EtiquetaComportamiento[];
  recomendacion: Recomendacion;
  /**
   * Préstamo activo único de este cliente al que se le puede agregar
   * contexto histórico ("¿desde cuándo le prestas?") — null si no tiene
   * ninguno activo o si tiene más de uno (evita ambigüedad sobre a cuál
   * aplica la fecha aproximada).
   */
  operacionParaContexto: { id: string; confianzaFecha: string; contextoHistorico: string | null } | null;
}

const formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

/**
 * El expediente financiero (visión final del producto, sección "Clientes"):
 * reemplaza la ficha CRUD por la respuesta a "¿vale la pena seguir
 * prestándole a esta persona?" — con una recomendación explícita e
 * interpretación, no solo datos para leer.
 */
export async function getExpedienteFinanciero(clienteId: string): Promise<ExpedienteFinanciero> {
  const [operaciones, primeraOperacion, primeraVenta, refinanciaciones] = await Promise.all([
    prisma.operacionCredito.findMany({
      where: { clienteId, deletedAt: null },
      include: INCLUDE_OPERACION_DETALLE,
    }),
    prisma.operacionCredito.findFirst({
      where: { clienteId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.venta.findFirst({
      where: { clienteId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.refinanciacion.count({
      where: { operacionOriginal: { clienteId, deletedAt: null } },
    }),
  ]);

  const primerasFechas = [primeraOperacion?.createdAt, primeraVenta?.createdAt].filter((f): f is Date => !!f);
  const m = calcularMetricasCliente(operaciones, primerasFechas, refinanciaciones);
  const reendeudamiento = detectarReendeudamiento(operaciones);

  const etiquetas: EtiquetaComportamiento[] = [];
  if (operaciones.length === 0) etiquetas.push("nuevo");
  if (m.puntualidadPct !== null && m.puntualidadPct >= 90 && m.cuotasEvaluadas >= 3) etiquetas.push("puntual");
  if (m.puntualidadPct !== null && m.puntualidadPct < 50 && m.cuotasEvaluadas >= 2) etiquetas.push("tardio");
  if (m.operacionRetenida) etiquetas.push("solo-intereses");
  if (reendeudamiento.length > 0) etiquetas.push("reendeudamiento");
  if (m.moraActivaDias >= 30) etiquetas.push("alto-riesgo");

  const recomendacion = construirRecomendacion({
    puntualidadPct: m.puntualidadPct,
    operacionRetenida: m.operacionRetenida,
    reendeudamiento,
    moraActivaDias: m.moraActivaDias,
    tieneOperaciones: operaciones.length > 0,
  });

  const prestamosActivos = operaciones.filter(
    (o) => o.origen === "prestamo" && (o.estado === "activo" || o.estado === "vencido"),
  );
  const operacionParaContexto =
    prestamosActivos.length === 1
      ? {
          id: prestamosActivos[0]!.id,
          confianzaFecha: prestamosActivos[0]!.confianzaFecha,
          contextoHistorico: prestamosActivos[0]!.contextoHistorico,
        }
      : null;

  return {
    prestadoHistorico: m.prestadoHistorico,
    pagadoHistorico: m.pagadoHistorico,
    saldoActual: m.saldoActual,
    interesGenerado: m.interesGenerado,
    utilidadGenerada: m.utilidadGenerada,
    antiguedadDias: m.antiguedadDias,
    antiguedadTexto: m.antiguedadDias !== null ? formatoAntiguedad(m.antiguedadDias) : null,
    puntualidadPct: m.puntualidadPct,
    cuotasEvaluadas: m.cuotasEvaluadas,
    capitalRetenido: m.operacionRetenida !== null,
    vecesReendeudado: reendeudamiento.length,
    moraActivaDias: m.moraActivaDias,
    vecesRefinanciado: m.vecesRefinanciado,
    etiquetas,
    recomendacion,
    operacionParaContexto,
  };
}

function construirRecomendacion(params: {
  puntualidadPct: number | null;
  operacionRetenida: { antiguedadDias: number | null; montoCapital: number; confianza: ConfianzaDato } | null;
  reendeudamiento: { diasEntre: number; montoNuevo: number }[];
  moraActivaDias: number;
  tieneOperaciones: boolean;
}): Recomendacion {
  if (!params.tieneOperaciones) {
    return { tono: "info", texto: "Cliente nuevo — todavía no tiene préstamos ni ventas para evaluar.", boton: null, confianza: null };
  }
  if (params.moraActivaDias >= 30 || (params.puntualidadPct !== null && params.puntualidadPct < 50)) {
    return {
      tono: "danger",
      texto: "Riesgo alto. No se recomienda ampliar el crédito hasta que regularice.",
      boton: null,
      confianza: "alta",
    };
  }
  // Auditoría "paga diario": ciclo de reendeudamiento — se le prestó de
  // nuevo muy pocos días después de haber pagado otra operación. No se
  // bloquea nada (la decisión sigue siendo de Geisa), pero se nombra el
  // patrón explícitamente en vez de dejarlo solo como una coincidencia de
  // fechas en el historial.
  if (params.reendeudamiento.length > 0) {
    const monto = formatoMoneda.format(params.reendeudamiento[0]!.montoNuevo);
    return {
      tono: "warning",
      texto:
        params.reendeudamiento.length > 1
          ? `Ya son ${params.reendeudamiento.length} veces que recibe un préstamo nuevo justo después de pagar otro — revisa si de verdad puede sostener el ritmo antes de prestarle de nuevo.`
          : `Recibió un préstamo nuevo de ${monto} muy pocos días después de pagar otra operación — puede ser normal o puede ser que le prestaste para que pagara la cuota anterior. Vale la pena confirmarlo antes de repetirlo.`,
      boton: null,
      confianza: "alta",
    };
  }
  // Caso Camilo (visión final, 26 jul 2026): capital retenido — préstamo
  // donde solo se ha cobrado interés. La recomendación nombra el tiempo real
  // cuando existe; cuando la única evidencia es comportamiento de pago sin
  // fecha confiable, lo dice así en vez de inventar una antigüedad.
  if (params.operacionRetenida) {
    const { antiguedadDias, montoCapital, confianza } = params.operacionRetenida;
    const monto = formatoMoneda.format(montoCapital);
    const texto =
      antiguedadDias !== null
        ? `Llevas ${formatoAntiguedad(antiguedadDias)} recuperando solo intereses sobre ${monto}, pero el capital sigue inmovilizado. Evalúa negociar la devolución parcial o total.`
        : `Este cliente ya pagó varias cuotas pero el capital de ${monto} casi no bajó — patrón de solo intereses, aunque no hay una fecha de inicio confiable todavía. Evalúa negociar y agrega cuándo empezó este préstamo si lo recuerdas.`;
    return {
      tono: "warning",
      texto,
      boton: { texto: "Ir a Mi dinero", href: "/dinero" },
      confianza,
    };
  }
  if (params.puntualidadPct !== null && params.puntualidadPct >= 80) {
    return {
      tono: "success",
      texto: "Cliente confiable. Buen candidato para un nuevo préstamo.",
      boton: { texto: "Ofrecer nuevo préstamo", href: "/prestamos/nuevo" },
      confianza: "alta",
    };
  }
  return {
    tono: "info",
    texto:
      params.puntualidadPct === null
        ? "Sin historial suficiente todavía para evaluar puntualidad."
        : "Cliente aceptable — mantente atento a su próximo vencimiento.",
    boton: null,
    confianza: params.puntualidadPct === null ? null : "alta",
  };
}
