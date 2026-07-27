import { formatearMoneda, formatearFecha } from "@/lib/formato";

/**
 * WhatsApp simplificado (27 jul 2026): la app es de un solo negocio, en un
 * solo computador — no necesita un proveedor de mensajería (Twilio, 360dialog,
 * Meta Cloud API) ni una cola de envío. Solo necesita abrir WhatsApp con el
 * mensaje correcto ya escrito, en un clic. Todo lo demás (tokens, "pendiente",
 * proveedor) era complejidad técnica que Geisa nunca pidió ni necesita ver.
 *
 * Este archivo reemplaza a lib/whatsapp/EnviadorMensajes.ts y
 * lib/whatsapp/encolarMensaje.ts, que quedaron eliminados.
 */

/** Normaliza un número colombiano a formato internacional para wa.me (57 + 10 dígitos). */
export function normalizarNumeroWhatsapp(numero: string): string {
  const digitos = numero.replace(/[^0-9]/g, "");
  if (digitos.startsWith("57") && digitos.length >= 12) return digitos;
  if (digitos.length === 10) return `57${digitos}`;
  return digitos;
}

/** Construye el enlace https://wa.me/... que abre WhatsApp Web o la app, según el dispositivo. */
export function construirLinkWhatsapp(numero: string, mensaje: string): string {
  const destino = normalizarNumeroWhatsapp(numero);
  return `https://wa.me/${destino}?text=${encodeURIComponent(mensaje)}`;
}

export function mensajeRecordatorio(cliente: string, valor: number, fecha: Date | string): string {
  return `Hola ${cliente}.\nTe recuerdo que tu pago de ${formatearMoneda(valor)} vence el ${formatearFecha(fecha)}.\nMuchas gracias.`;
}

export function mensajeHoyVence(cliente: string, valor: number): string {
  return `Hola ${cliente}.\nHoy vence tu pago de ${formatearMoneda(valor)}.\nCuando puedas me confirmas.\nGracias.`;
}

export function mensajeVencido(cliente: string, valor: number): string {
  return `Hola ${cliente}.\nTu pago por ${formatearMoneda(valor)} se encuentra pendiente.\nPor favor comunícate conmigo para acordar el pago.\nGracias.`;
}

export function mensajeGraciasPorPagar(cliente: string, valor: number): string {
  return `Hola ${cliente}.\nRecibí tu pago de ${formatearMoneda(valor)}.\nMuchas gracias.`;
}

export function mensajeRenovacion(cliente: string, fecha: Date | string): string {
  return `Hola ${cliente}.\nTu préstamo fue renovado correctamente.\nLa nueva fecha de vencimiento es ${formatearFecha(fecha)}.\nGracias por confiar en nosotros.`;
}

/** Elige automáticamente el mensaje correcto según qué tan vencido está el cobro. */
export function mensajeSegunSemaforo(params: {
  semaforo: "vencido" | "hoy" | "proximo";
  cliente: string;
  valor: number;
  fecha: Date | string;
}): string {
  if (params.semaforo === "vencido") return mensajeVencido(params.cliente, params.valor);
  if (params.semaforo === "hoy") return mensajeHoyVence(params.cliente, params.valor);
  return mensajeRecordatorio(params.cliente, params.valor, params.fecha);
}
