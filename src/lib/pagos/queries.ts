import { prisma } from "@/lib/db";

/**
 * Datos de identificación de la operación antes de registrar un pago
 * (doc 07 Módulo 6): nombre grande, WhatsApp, tipo 🏦/🛍, producto si aplica,
 * saldo, próxima cuota, vencimiento y días de atraso — todo antes del valor
 * recibido, para que sea imposible confundir de cliente.
 */
export async function getOperacionParaPago(id: string) {
  const operacion = await prisma.operacionCredito.findFirst({
    where: { id, deletedAt: null },
    include: {
      cliente: { select: { nombre: true, whatsapp: true, fotoUrl: true } },
      venta: { include: { items: { select: { nombreProducto: true } } } },
      cuotas: { where: { estado: { in: ["pendiente", "parcial", "vencida"] } }, orderBy: { numeroCuota: "asc" }, take: 1 },
    },
  });
  if (!operacion) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximaCuota = operacion.cuotas[0] ?? null;
  const diasAtraso =
    proximaCuota && proximaCuota.fechaVencimiento < hoy
      ? Math.floor((hoy.getTime() - proximaCuota.fechaVencimiento.getTime()) / 86_400_000)
      : 0;

  return {
    id: operacion.id,
    origen: operacion.origen,
    clienteNombre: operacion.cliente.nombre,
    clienteWhatsapp: operacion.cliente.whatsapp,
    clienteFotoUrl: operacion.cliente.fotoUrl,
    producto: operacion.venta?.items.map((i) => i.nombreProducto).join(", ") ?? null,
    saldoPendiente: Number(operacion.saldoPendienteCalc),
    proximaCuota: proximaCuota
      ? { numero: proximaCuota.numeroCuota, total: Number(proximaCuota.total), saldo: Number(proximaCuota.saldoCalc), vencimiento: proximaCuota.fechaVencimiento }
      : null,
    diasAtraso,
    estado: operacion.estado,
  };
}

export interface CarteraItem {
  id: string;
  origen: string;
  clienteNombre: string;
  clienteWhatsapp: string;
  saldoPendiente: number;
  fechaVencimiento: Date;
  estado: string;
  diasAtraso: number;
}

/** Cartera unificada (regla dura #7): préstamos y ventas a crédito juntos, siempre distinguibles por `origen`. */
export async function listCartera(): Promise<CarteraItem[]> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const operaciones = await prisma.operacionCredito.findMany({
    where: { deletedAt: null, estado: { in: ["activo", "vencido"] } },
    include: { cliente: { select: { nombre: true, whatsapp: true } } },
    orderBy: { fechaVencimiento: "asc" },
  });

  return operaciones.map((o) => ({
    id: o.id,
    origen: o.origen,
    clienteNombre: o.cliente.nombre,
    clienteWhatsapp: o.cliente.whatsapp,
    saldoPendiente: Number(o.saldoPendienteCalc),
    fechaVencimiento: o.fechaVencimiento,
    estado: o.estado,
    diasAtraso: o.fechaVencimiento < hoy ? Math.floor((hoy.getTime() - o.fechaVencimiento.getTime()) / 86_400_000) : 0,
  }));
}
