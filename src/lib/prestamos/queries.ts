import { prisma } from "@/lib/db";

export interface PrestamoListItem {
  id: string;
  clienteNombre: string;
  clienteWhatsapp: string;
  montoCapital: number;
  saldoPendiente: number;
  estado: string;
  fechaVencimiento: Date;
  diasAtraso: number;
}

/** Listado de préstamos (origen='prestamo'), regla dura #7: nunca mezclar con ventas. */
export async function listPrestamos(): Promise<PrestamoListItem[]> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const operaciones = await prisma.operacionCredito.findMany({
    where: { origen: "prestamo", deletedAt: null },
    include: { cliente: { select: { nombre: true, whatsapp: true } } },
    orderBy: [{ estado: "asc" }, { fechaVencimiento: "asc" }],
  });

  return operaciones.map((o) => {
    const diasAtraso =
      o.estado === "activo" && o.fechaVencimiento < hoy
        ? Math.floor((hoy.getTime() - o.fechaVencimiento.getTime()) / 86_400_000)
        : 0;
    return {
      id: o.id,
      clienteNombre: o.cliente.nombre,
      clienteWhatsapp: o.cliente.whatsapp,
      montoCapital: Number(o.montoCapital),
      saldoPendiente: Number(o.saldoPendienteCalc),
      estado: o.estado,
      fechaVencimiento: o.fechaVencimiento,
      diasAtraso,
    };
  });
}

export async function getPrestamoById(id: string) {
  const operacion = await prisma.operacionCredito.findFirst({
    where: { id, origen: "prestamo", deletedAt: null },
    include: {
      cliente: true,
      cuotas: { orderBy: { numeroCuota: "asc" } },
      pagos: { where: { deletedAt: null }, orderBy: { fechaPago: "desc" } },
    },
  });
  return operacion;
}
