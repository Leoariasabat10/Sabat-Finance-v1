import { listCobrar } from "@/lib/cobrar/queries";
import { mensajeSegunSemaforo } from "./mensajes";

export interface ContactoWhatsapp {
  operacionId: string;
  clienteNombre: string;
  clienteWhatsapp: string;
  motivo: string;
  mensaje: string;
  monto: number;
}

/**
 * WhatsApp simplificado (27 jul 2026): la pantalla ya no gestiona plantillas
 * ni una cola técnica — responde directamente "¿a quién debería escribirle
 * hoy y qué le digo?", reutilizando la misma fuente de verdad que Cobrar
 * (lib/cobrar/queries.ts) para que nunca queden desincronizadas.
 */
export async function getContactosHoy(): Promise<ContactoWhatsapp[]> {
  const cobros = await listCobrar(0);

  return cobros
    .filter((c) => c.semaforo === "vencido" || c.semaforo === "hoy")
    .map((c) => ({
      operacionId: c.operacionId,
      clienteNombre: c.clienteNombre,
      clienteWhatsapp: c.clienteWhatsapp,
      motivo: c.semaforo === "vencido" ? `Pago vencido hace ${c.diasAtraso} día${c.diasAtraso === 1 ? "" : "s"}` : "Vence hoy",
      mensaje: mensajeSegunSemaforo({
        semaforo: c.semaforo,
        cliente: c.clienteNombre,
        valor: c.saldoCuota,
        fecha: c.fechaVencimiento,
      }),
      monto: c.saldoCuota,
    }));
}
