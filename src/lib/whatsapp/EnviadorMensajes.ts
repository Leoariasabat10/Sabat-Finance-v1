/**
 * Adaptador de mensajería (CLAUDE.md regla #10): ningún módulo debe llamar
 * directo a la API de un proveedor de WhatsApp. Todo pasa por esta interfaz;
 * cambiar de proveedor es escribir una nueva clase que la implemente, sin
 * tocar el resto del código.
 *
 * Proveedor activo: WhatsApp Cloud API (Meta), número de negocio
 * +57 312 592 0603. Requiere dos variables de entorno:
 *   - WHATSAPP_TOKEN: token de acceso permanente del System User de Meta.
 *   - WHATSAPP_PHONE_NUMBER_ID: el Phone Number ID (no el número en sí) que
 *     aparece en Meta for Developers > WhatsApp > Configuración de la API.
 * Si no están configuradas, se usa `EnviadorConsola` (no envía nada real,
 * solo deja el mensaje en `whatsapp_mensajes` como 'pendiente').
 */
export interface ResultadoEnvio {
  ok: boolean;
  proveedor: string;
  error?: string;
}

export interface EnviadorMensajes {
  enviar(numeroWhatsapp: string, texto: string): Promise<ResultadoEnvio>;
}

class EnviadorConsola implements EnviadorMensajes {
  async enviar(numeroWhatsapp: string, texto: string): Promise<ResultadoEnvio> {
    // eslint-disable-next-line no-console
    console.log(`[WhatsApp:consola] Para ${numeroWhatsapp}: ${texto}`);
    return { ok: false, proveedor: "consola", error: "Sin proveedor BSP configurado todavía." };
  }
}

/**
 * Envía mensajes reales vía WhatsApp Cloud API (Meta).
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Nota importante: fuera de la ventana de 24h de "servicio al cliente"
 * (es decir, si el cliente no te ha escrito en las últimas 24h), Meta solo
 * permite enviar mensajes de plantilla pre-aprobados, no texto libre. Para
 * recordatorios de cobro proactivos (el caso principal de esta app), en
 * algún momento habrá que crear y aprobar plantillas en el Business
 * Manager. Por ahora se envía como texto libre — funcionará siempre que el
 * cliente le haya escrito al negocio en las últimas 24h, y Meta devolverá
 * un error claro (capturado en `ResultadoEnvio.error`) cuando no sea así.
 */
class EnviadorMetaCloud implements EnviadorMensajes {
  constructor(
    private readonly token: string,
    private readonly phoneNumberId: string,
  ) {}

  private normalizarNumero(numero: string): string {
    // Meta espera el número completo con código de país, solo dígitos (sin "+", espacios ni guiones).
    return numero.replace(/[^\d]/g, "");
  }

  async enviar(numeroWhatsapp: string, texto: string): Promise<ResultadoEnvio> {
    const destino = this.normalizarNumero(numeroWhatsapp);
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: destino,
          type: "text",
          text: { body: texto },
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const mensajeError = data?.error?.message ?? `HTTP ${res.status}`;
        return { ok: false, proveedor: "meta-cloud", error: mensajeError };
      }
      return { ok: true, proveedor: "meta-cloud" };
    } catch (err) {
      return {
        ok: false,
        proveedor: "meta-cloud",
        error: err instanceof Error ? err.message : "Error de red desconocido",
      };
    }
  }
}

export function getEnviador(): EnviadorMensajes {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (token && phoneNumberId) {
    return new EnviadorMetaCloud(token, phoneNumberId);
  }
  return new EnviadorConsola();
}
