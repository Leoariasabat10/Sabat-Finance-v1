"use server";

import { prisma } from "@/lib/db";

export interface ResultadoBusqueda {
  tipo: "cliente" | "prestamo" | "venta";
  id: string;
  titulo: string;
  subtitulo: string;
  href: string;
}

/**
 * Búsqueda global (auditoría Sprint 2): un solo cuadro busca clientes,
 * préstamos y ventas por nombre/WhatsApp, en vez de obligar a saber en qué
 * módulo vive lo que se busca.
 */
export async function buscarGlobal(query: string): Promise<ResultadoBusqueda[]> {
  const termino = query.trim();
  if (termino.length < 2) return [];

  const [clientes, prestamos, ventas] = await Promise.all([
    prisma.cliente.findMany({
      where: {
        deletedAt: null,
        OR: [{ nombre: { contains: termino, mode: "insensitive" } }, { whatsapp: { contains: termino } }],
      },
      select: { id: true, nombre: true, whatsapp: true },
      take: 5,
    }),
    prisma.operacionCredito.findMany({
      where: {
        deletedAt: null,
        origen: "prestamo",
        cliente: {
          OR: [{ nombre: { contains: termino, mode: "insensitive" } }, { whatsapp: { contains: termino } }],
        },
      },
      select: { id: true, montoCapital: true, estado: true, cliente: { select: { nombre: true } } },
      take: 5,
    }),
    prisma.venta.findMany({
      where: {
        deletedAt: null,
        cliente: {
          OR: [{ nombre: { contains: termino, mode: "insensitive" } }, { whatsapp: { contains: termino } }],
        },
      },
      select: { id: true, totalCalc: true, tipoPago: true, cliente: { select: { nombre: true } } },
      take: 5,
    }),
  ]);

  const resultados: ResultadoBusqueda[] = [
    ...clientes.map((c) => ({
      tipo: "cliente" as const,
      id: c.id,
      titulo: c.nombre,
      subtitulo: c.whatsapp,
      href: `/clientes/${c.id}`,
    })),
    ...prestamos.map((p) => ({
      tipo: "prestamo" as const,
      id: p.id,
      titulo: p.cliente.nombre,
      subtitulo: `🏦 Préstamo · ${Number(p.montoCapital).toLocaleString("es-CO")} · ${p.estado}`,
      href: `/prestamos/${p.id}`,
    })),
    ...ventas.map((v) => ({
      tipo: "venta" as const,
      id: v.id,
      titulo: v.cliente.nombre,
      subtitulo: `🛍 Venta · ${Number(v.totalCalc).toLocaleString("es-CO")} · ${v.tipoPago}`,
      href: `/ventas/${v.id}`,
    })),
  ];

  return resultados;
}
