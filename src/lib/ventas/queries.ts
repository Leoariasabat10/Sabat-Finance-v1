import { prisma } from "@/lib/db";

export interface VentaListItem {
  id: string;
  clienteNombre: string;
  clienteWhatsapp: string;
  tipoPago: string;
  total: number;
  utilidad: number;
  estado: string;
  fecha: Date;
  saldoPendiente: number | null;
}

/** Listado de ventas (contado y crédito). Regla dura #7: separado de préstamos. */
export async function listVentas(): Promise<VentaListItem[]> {
  const ventas = await prisma.venta.findMany({
    where: { deletedAt: null, cliente: { deletedAt: null } },
    include: { cliente: { select: { nombre: true, whatsapp: true } }, operacionCredito: true },
    orderBy: { fecha: "desc" },
  });

  return ventas.map((v) => ({
    id: v.id,
    clienteNombre: v.cliente.nombre,
    clienteWhatsapp: v.cliente.whatsapp,
    tipoPago: v.tipoPago,
    total: Number(v.totalCalc),
    utilidad: Number(v.utilidadCalc),
    estado: v.estado,
    fecha: v.fecha,
    saldoPendiente: v.operacionCredito ? Number(v.operacionCredito.saldoPendienteCalc) : null,
  }));
}

export async function getVentaById(id: string) {
  return prisma.venta.findFirst({
    where: { id, deletedAt: null },
    include: {
      cliente: true,
      items: true,
      operacionCredito: {
        include: { cuotas: { orderBy: { numeroCuota: "asc" } }, pagos: { where: { deletedAt: null } } },
      },
    },
  });
}
