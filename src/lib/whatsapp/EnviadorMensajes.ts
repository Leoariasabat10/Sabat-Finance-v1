/**
 * Adaptador de mensajería (CLAUDE.md regla #10): ningún módulo debe llamar
 * directo a la API de un proveedor de WhatsApp. Todo pasa por esta interfaz;
 * cambiar de proveedor (Twilio → 360dialog → API oficial de Meta) es
 * escribir una nueva clase que la implemente, sin tocar el resto del código.
 *
 * Esta app todavía no tiene credenciales de un BSP configuradas — el
 * adaptador activo por defecto es `EnviadorConsola`, que no envía nada de
 * verdad: solo dejar el mensaje en `whatsapp_mensajes` como 'pendiente' y
 * lo registra en consola. Cuando haya credenciales de Twilio/360dialog, se
 * agrega una clase `EnviadorTwilio implements EnviadorMensajes` aquí mismo
 * y se cambia `getEnviador()` para devolverla — el resto de la app no cambia.
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

export function getEnviador(): EnviadorMensajes {
  // TODO: cuando existan credenciales, leer una variable de entorno
  // (ej. WHATSAPP_PROVIDER=twilio) y devolver la implementación real.
  return new EnviadorConsola();
}
