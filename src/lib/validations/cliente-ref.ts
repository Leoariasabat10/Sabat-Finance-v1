import type { RefinementCtx } from "zod";

/**
 * Cómo se identifica al cliente en una venta o un préstamo: o se eligió uno de la lista (llega su `clienteId`, y no
 * hace falta ningún número), o se escribe uno nuevo y entonces el WhatsApp es obligatorio.
 *
 * Bug real corregido: los formularios nunca enviaban el `clienteId` del cliente elegido y el servidor lo buscaba por
 * WhatsApp. Como 15 de 16 clientes importados tienen WhatsApp "Pendiente", elegir a "Juana" asignaba la venta al primer
 * cliente "Pendiente" que apareciera, y además el formulario rechazaba "Pendiente" como número no válido.
 */
export const WHATSAPP_VALIDO = /^[0-9+()\s-]{7,20}$/;

export function refinarClienteReferido(v: { clienteId?: string; whatsappCliente?: string }, ctx: RefinementCtx) {
  if (v.clienteId) return;
  if (!v.whatsappCliente || !WHATSAPP_VALIDO.test(v.whatsappCliente)) {
    ctx.addIssue({
      code: "custom",
      path: ["whatsappCliente"],
      message: v.whatsappCliente ? "Ese número no parece válido" : "Escribe el WhatsApp o elige al cliente de la lista",
    });
  }
}
