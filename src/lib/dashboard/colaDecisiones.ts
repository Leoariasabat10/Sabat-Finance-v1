import type { ClienteAtencion } from "./queries";
import type { CobroItem } from "@/lib/cobrar/queries";
import type { ClienteRetenido } from "@/lib/posicion/queries";
import { formatearMoneda } from "@/lib/formato";
import { calcularCupoSeguro } from "@/lib/inteligencia/cfo";
import { construirLinkWhatsapp, mensajeVencido } from "@/lib/whatsapp/mensajes";

export type TonoDecision = "danger" | "warning" | "success" | "info";

export interface TarjetaDecision {
  tono: TonoDecision;
  etiqueta: string;
  texto: string;
  boton: { texto: string; href: string };
}

/**
 * Visión final del producto (26 jul 2026), sección 2: "Hoy" no es un
 * dashboard de tarjetas sueltas — es un cupo fijo de máximo 4 decisiones,
 * ordenadas por lo que más mueve el negocio hoy. Si algo no entra en las 4,
 * espera a mañana o se consulta en su propia pantalla (Cobrar, Mi dinero,
 * Clientes) — nunca se agregan más de 4 tarjetas, sin importar cuántas
 * cosas ameriten atención.
 */
export function construirColaDecisiones(params: {
  clientesAtencion: ClienteAtencion[];
  cobrarHoy: CobroItem[];
  clientesRetenidos: ClienteRetenido[];
  dineroDisponible: number;
  capitalTotalConfigurado: number;
  capitalDisponible: number;
}): TarjetaDecision[] {
  const tarjetas: TarjetaDecision[] = [];

  // 1. Lo más urgente: el cliente con más días de mora.
  const vencidoUrgente = params.clientesAtencion[0];
  if (vencidoUrgente) {
    tarjetas.push({
      tono: "danger",
      etiqueta: `Llama a ${vencidoUrgente.nombre}`,
      texto: `Debe ${formatearMoneda(vencidoUrgente.montoVencido)}. Lleva ${vencidoUrgente.diasMora} día${vencidoUrgente.diasMora === 1 ? "" : "s"} de mora.`,
      boton: {
        texto: "WhatsApp",
        href: construirLinkWhatsapp(vencidoUrgente.whatsapp, mensajeVencido(vencidoUrgente.nombre, vencidoUrgente.montoVencido)),
      },
    });
  }

  // 2. Lo que vence hoy: registrar el pago en cuanto llegue.
  const venceHoy = params.cobrarHoy.find((c) => c.semaforo === "hoy");
  if (venceHoy) {
    tarjetas.push({
      tono: "warning",
      etiqueta: `${venceHoy.clienteNombre} vence hoy`,
      texto: `Registra el pago de ${formatearMoneda(venceHoy.saldoCuota)} cuando llegue.`,
      boton: { texto: "Registrar pago", href: `/pagos/nuevo?operacion=${venceHoy.operacionId}` },
    });
  }

  // 3. Capital que lleva más de un año inmovilizado (el más antiguo con evidencia).
  const retenido = params.clientesRetenidos[0];
  if (retenido) {
    const texto =
      retenido.antiguedadDias !== null
        ? `Lleva ${Math.floor(retenido.antiguedadDias / 30)} meses pagando solo intereses, sin abonar capital.`
        : "Ya pagó varias cuotas pero el capital no baja — patrón de solo intereses, sin fecha de inicio confirmada.";
    tarjetas.push({
      tono: "info",
      etiqueta: `Capital retenido en ${retenido.clienteNombre}`,
      texto,
      boton: { texto: "Ver capital retenido", href: "/dinero" },
    });
  }

  // 4. Liquidez: siempre se muestra — es la pregunta que responde "¿cuánto
  //    puedo prestar hoy?", la más frecuente del negocio. No basta con decir
  //    "sí" o "no": el CFO da un número concreto y deja un colchón de
  //    seguridad (lib/inteligencia/cfo.ts) en vez de recomendar prestar
  //    hasta el último peso disponible.
  const cupo = calcularCupoSeguro({
    capitalTotalConfigurado: params.capitalTotalConfigurado,
    capitalDisponible: params.capitalDisponible,
    saldoCaja: params.dineroDisponible,
  });
  tarjetas.push(
    cupo.cupo > 0
      ? {
          tono: "success",
          etiqueta: `Puedes prestar hasta ${formatearMoneda(cupo.cupo)} hoy`,
          texto: cupo.confiable
            ? "Ya dejamos un colchón de seguridad para imprevistos."
            : "Cálculo aproximado con tu caja — configura tu capital inicial para uno exacto.",
          boton: { texto: "Ver candidatos", href: "/clientes" },
        }
      : {
          tono: "danger",
          etiqueta: "No prestes hoy",
          texto: cupo.mensaje,
          boton: { texto: "Ver Mi dinero", href: "/dinero" },
        },
  );

  return tarjetas.slice(0, 4);
}
