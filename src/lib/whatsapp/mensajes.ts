import { formatearMoneda, formatearFecha } from "../formato";

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

/** Solo el primer nombre, como se le habla a alguien: "María Fernanda Pérez" -> "María". */
export function primerNombre(nombreCompleto: string): string {
  return nombreCompleto.trim().split(/\s+/)[0] ?? nombreCompleto;
}

/** Un número sirve para WhatsApp solo si tiene al menos 10 dígitos (hay clientes importados con "Pendiente"). */
export function tieneWhatsapp(numero: string | null | undefined): boolean {
  return (numero ?? "").replace(/[^0-9]/g, "").length >= 10;
}

export function mensajeRecordatorio(cliente: string, valor: number, fecha: Date | string): string {
  return `Hola ${primerNombre(cliente)}, te recordamos que tu pago de ${formatearMoneda(valor)} con SABAT vence el ${formatearFecha(fecha)}. Gracias.`;
}

export function mensajeHoyVence(cliente: string, valor: number): string {
  return `Hola ${primerNombre(cliente)}, hoy vence tu pago de ${formatearMoneda(valor)} con SABAT. Cuando puedas, me confirmas. Gracias.`;
}

export function mensajeVencido(cliente: string, valor: number): string {
  return `Hola ${primerNombre(cliente)}, te recordamos que tienes un saldo pendiente de ${formatearMoneda(valor)} con SABAT. ¿Cuándo podemos acordar el pago? Gracias.`;
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
