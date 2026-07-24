import type { Prisma, PrismaClient } from "@prisma/client";
import { getEnviador } from "./EnviadorMensajes";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

function reemplazarVariables(cuerpo: string, variables: Record<string, string>): string {
  return cuerpo.replace(/\{\{(\w+)\}\}/g, (_, clave: string) => variables[clave] ?? "");
}

/**
 * Encola un mensaje de WhatsApp para un evento automático (doc 07 Módulo 8):
 * busca la plantilla activa del evento, rellena las variables y guarda el
 * mensaje en `whatsapp_mensajes`. El envío real pasa por el adaptador
 * (lib/whatsapp/EnviadorMensajes.ts) — sin credenciales de un BSP configuradas,
 * el mensaje queda registrado como 'pendiente' en vez de enviarse.
 */
export async function encolarMensajeEvento(
  tx: TxClient,
  params: {
    evento: string;
    clienteId: string;
    numeroWhatsapp: string;
    variables: Record<string, string>;
    referenciaId?: string;
    referenciaTipo?: string;
  },
) {
  const plantilla = await tx.whatsappPlantilla.findFirst({
    where: { evento: params.evento as never, activa: true },
  });
  if (!plantilla) return null;

  const mensajeFinal = reemplazarVariables(plantilla.cuerpo, params.variables);
  const resultado = await getEnviador().enviar(params.numeroWhatsapp, mensajeFinal);

  return tx.whatsappMensaje.create({
    data: {
      clienteId: params.clienteId,
      plantillaId: plantilla.id,
      referenciaId: params.referenciaId,
      referenciaTipo: params.referenciaTipo,
      mensajeFinal,
      estadoEnvio: resultado.ok ? "enviado" : "pendiente",
      proveedor: resultado.proveedor,
      enviadoAt: resultado.ok ? new Date() : null,
    },
  });
}

export type { Prisma };
