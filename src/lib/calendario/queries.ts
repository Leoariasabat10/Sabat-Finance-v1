import { prisma } from "@/lib/db";

export interface EventoAgenda {
  fecha: Date;
  tipo: "cuota" | "evento";
  titulo: string;
  subtitulo: string;
  href: string | null;
}

/**
 * Agenda de los próximos `dias` días: vencimientos de cuotas (préstamos y
 * ventas a crédito) + eventos manuales de `eventos_calendario`. Se deriva de
 * las cuotas reales en vez de duplicar datos en una tabla aparte que
 * pudiera desincronizarse.
 */
export async function listAgenda(dias = 30): Promise<EventoAgenda[]> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(hoy);
  limite.setDate(limite.getDate() + dias);

  const [cuotas, eventos] = await Promise.all([
    prisma.cuota.findMany({
      where: {
        estado: { in: ["pendiente", "parcial", "vencida"] },
        fechaVencimiento: { gte: hoy, lte: limite },
      },
      include: {
        operacion: { include: { cliente: { select: { nombre: true } } } },
      },
      orderBy: { fechaVencimiento: "asc" },
    }),
    prisma.eventoCalendario.findMany({
      where: { fecha: { gte: hoy, lte: limite } },
      orderBy: { fecha: "asc" },
    }),
  ]);

  const deCuotas: EventoAgenda[] = cuotas.map((c) => ({
    fecha: c.fechaVencimiento,
    tipo: "cuota",
    titulo: `${c.operacion.origen === "prestamo" ? "🏦" : "🛍"} ${c.operacion.cliente.nombre}`,
    subtitulo: `Cuota #${c.numeroCuota} · $${Number(c.saldoCalc).toLocaleString("es-CO")}`,
    href: c.operacion.origen === "prestamo" ? `/prestamos/${c.operacionCreditoId}` : `/ventas/${c.operacion.ventaId ?? ""}`,
  }));

  const deEventos: EventoAgenda[] = eventos.map((e) => ({
    fecha: e.fecha,
    tipo: "evento",
    titulo: e.titulo,
    subtitulo: e.tipo,
    href: null,
  }));

  return [...deCuotas, ...deEventos].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}
