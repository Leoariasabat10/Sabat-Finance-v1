import { prisma } from "@/lib/db";
import { calcularMetricasCliente, formatoAntiguedad, INCLUDE_OPERACION_DETALLE } from "@/lib/clientes/metricas";
import { detectarReendeudamiento } from "@/lib/inteligencia/reendeudamiento";

/**
 * Inteligencia de negocio a nivel de cartera (visión final, 26 jul 2026):
 * "Clientes" ya no es una lista — responde "¿a quién le puedo volver a
 * prestar y a quién no?" también en agregado, señalando quién representa
 * el mayor riesgo, quién es más rentable, quién nunca falla y quién tiene
 * capital inmovilizado más antiguo. Reusa el mismo motor de métricas que
 * el expediente individual (lib/clientes/metricas.ts) para que un cliente
 * nunca se vea distinto en una pantalla que en otra.
 */
export interface InsightCliente {
  clienteId: string;
  nombre: string;
  tipo: "riesgo" | "rentable" | "puntual" | "retenido" | "reendeudamiento";
  etiqueta: string;
  detalle: string;
  href: string;
}

export interface InsightsNegocio {
  mayorRiesgo: InsightCliente | null;
  masRentable: InsightCliente | null;
  masPuntual: InsightCliente | null;
  capitalRetenidoMasAntiguo: InsightCliente | null;
  reendeudamientoActivo: InsightCliente | null;
}

const formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export async function getInsightsNegocio(): Promise<InsightsNegocio> {
  const clientes = await prisma.cliente.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      nombre: true,
      operaciones: { where: { deletedAt: null }, include: INCLUDE_OPERACION_DETALLE },
    },
  });

  const candidatos = clientes
    .map((c) => ({
      clienteId: c.id,
      nombre: c.nombre,
      m: calcularMetricasCliente(
        c.operaciones,
        c.operaciones.map((o) => o.createdAt),
        0, // el conteo de refinanciaciones no afecta ningún ranking aquí
      ),
      reendeudamiento: detectarReendeudamiento(c.operaciones),
    }))
    .filter((c) => c.m.prestadoHistorico > 0);

  // Mayor riesgo: más días de mora activa; empate se rompe por peor puntualidad.
  const conMora = candidatos.filter((c) => c.m.moraActivaDias > 0);
  const mayorRiesgo = conMora.sort((a, b) => b.m.moraActivaDias - a.m.moraActivaDias)[0];

  // Más rentable: mayor utilidad efectivamente cobrada hasta ahora.
  const conUtilidad = candidatos.filter((c) => c.m.utilidadGenerada > 0);
  const masRentable = conUtilidad.sort((a, b) => b.m.utilidadGenerada - a.m.utilidadGenerada)[0];

  // Más puntual: 100% de puntualidad con historial real (al menos 3 cuotas evaluadas).
  const puntuales = candidatos.filter((c) => c.m.puntualidadPct === 100 && c.m.cuotasEvaluadas >= 3);
  const masPuntual = puntuales.sort((a, b) => b.m.cuotasEvaluadas - a.m.cuotasEvaluadas)[0];

  // Capital retenido más antiguo: el caso "Camilo" — el que más tiempo lleva pagando solo intereses.
  const retenidos = candidatos.filter((c) => c.m.operacionRetenida !== null);
  const capitalRetenidoMasAntiguo = retenidos.sort(
    (a, b) => (b.m.operacionRetenida?.antiguedadDias ?? 0) - (a.m.operacionRetenida?.antiguedadDias ?? 0),
  )[0];

  // Ciclo de reendeudamiento: cliente al que se le prestó de nuevo muy poco
  // después de haber pagado otra operación — se prioriza a quien más veces
  // repite el patrón (más señales), no solo la más reciente.
  const conReendeudamiento = candidatos.filter((c) => c.reendeudamiento.length > 0);
  const reendeudamientoActivo = conReendeudamiento.sort(
    (a, b) => b.reendeudamiento.length - a.reendeudamiento.length,
  )[0];

  return {
    mayorRiesgo: mayorRiesgo
      ? {
          clienteId: mayorRiesgo.clienteId,
          nombre: mayorRiesgo.nombre,
          tipo: "riesgo",
          etiqueta: "Mayor riesgo",
          detalle: `${mayorRiesgo.m.moraActivaDias}d de mora`,
          href: `/clientes/${mayorRiesgo.clienteId}`,
        }
      : null,
    masRentable: masRentable
      ? {
          clienteId: masRentable.clienteId,
          nombre: masRentable.nombre,
          tipo: "rentable",
          etiqueta: "Más rentable",
          detalle: `te ha generado ${formatoMoneda.format(masRentable.m.utilidadGenerada)}`,
          href: `/clientes/${masRentable.clienteId}`,
        }
      : null,
    masPuntual: masPuntual
      ? {
          clienteId: masPuntual.clienteId,
          nombre: masPuntual.nombre,
          tipo: "puntual",
          etiqueta: "Nunca falla",
          detalle: `${masPuntual.m.cuotasEvaluadas} cuotas a tiempo`,
          href: `/clientes/${masPuntual.clienteId}`,
        }
      : null,
    capitalRetenidoMasAntiguo: capitalRetenidoMasAntiguo?.m.operacionRetenida
      ? {
          clienteId: capitalRetenidoMasAntiguo.clienteId,
          nombre: capitalRetenidoMasAntiguo.nombre,
          tipo: "retenido",
          etiqueta: "Capital retenido",
          detalle:
            capitalRetenidoMasAntiguo.m.operacionRetenida.antiguedadDias !== null
              ? `${formatoAntiguedad(capitalRetenidoMasAntiguo.m.operacionRetenida.antiguedadDias)} solo pagando intereses`
              : "solo pagando intereses — sin fecha de inicio confirmada",
          href: `/clientes/${capitalRetenidoMasAntiguo.clienteId}`,
        }
      : null,
    reendeudamientoActivo: reendeudamientoActivo
      ? {
          clienteId: reendeudamientoActivo.clienteId,
          nombre: reendeudamientoActivo.nombre,
          tipo: "reendeudamiento",
          etiqueta: "Ciclo de reendeudamiento",
          detalle:
            reendeudamientoActivo.reendeudamiento.length > 1
              ? `${reendeudamientoActivo.reendeudamiento.length} préstamos nuevos justo después de un pago`
              : "recibió un préstamo nuevo días después de pagar otro",
          href: `/clientes/${reendeudamientoActivo.clienteId}`,
        }
      : null,
  };
}
