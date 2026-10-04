import { prisma } from "@/lib/db";
import { hoyFecha, diasEntreFechas } from "@/lib/fecha";

export type OrigenCredito = "prestamo" | "venta";
export type EstadoPago = "atrasado" | "hoy" | "alDia";

export interface CreditoItem {
  id: string;
  /** solo en ventas a crédito: la ficha de la venta se abre con este id */
  ventaId: string | null;
  origen: OrigenCredito;
  clienteId: string;
  clienteNombre: string;
  clienteWhatsapp: string;
  producto: string | null;
  saldo: number;
  proximaFecha: Date;
  proximoMonto: number;
  diasAtraso: number;
  estadoPago: EstadoPago;
}

/**
 * Todo lo que hoy está "en la calle", en una sola lista y siempre con su origen a la vista:
 * Préstamo (dinero que se prestó) o Mercancía (venta a crédito). Nunca se mezclan sin decir cuál es cuál.
 */
export async function listCreditos(origen?: OrigenCredito): Promise<CreditoItem[]> {
  const hoy = hoyFecha();

  const operaciones = await prisma.operacionCredito.findMany({
    where: {
      deletedAt: null,
      estado: { in: ["activo", "vencido"] },
      cliente: { deletedAt: null },
      ...(origen ? { origen } : {}),
    },
    include: {
      cliente: { select: { id: true, nombre: true, whatsapp: true } },
      venta: { select: { id: true, items: { select: { nombreProducto: true } } } },
      cuotas: {
        where: { estado: { in: ["pendiente", "parcial", "vencida"] } },
        orderBy: { numeroCuota: "asc" },
        take: 1,
      },
    },
  });

  return operaciones
    .map((o): CreditoItem => {
      const cuota = o.cuotas[0];
      const proximaFecha = cuota?.fechaVencimiento ?? o.fechaVencimiento;
      const dias = diasEntreFechas(proximaFecha, hoy);
      return {
        id: o.id,
        ventaId: o.venta?.id ?? null,
        origen: o.origen,
        clienteId: o.cliente.id,
        clienteNombre: o.cliente.nombre,
        clienteWhatsapp: o.cliente.whatsapp,
        producto: o.venta?.items.map((i) => i.nombreProducto).join(", ") ?? null,
        saldo: Number(o.saldoPendienteCalc),
        proximaFecha,
        proximoMonto: Number(cuota?.saldoCalc ?? o.saldoPendienteCalc),
        diasAtraso: Math.max(0, dias),
        estadoPago: dias > 0 ? "atrasado" : dias === 0 ? "hoy" : "alDia",
      };
    })
    .sort((a, b) => b.diasAtraso - a.diasAtraso || a.proximaFecha.getTime() - b.proximaFecha.getTime());
}
