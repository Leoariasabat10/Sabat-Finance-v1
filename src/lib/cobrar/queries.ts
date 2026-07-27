import { prisma } from "@/lib/db";

export type SemaforoCobro = "vencido" | "hoy" | "proximo";

export interface CobroItem {
  operacionId: string;
  origen: string;
  clienteNombre: string;
  clienteWhatsapp: string;
  producto: string | null;
  saldoCuota: number;
  saldoOperacion: number;
  fechaVencimiento: Date;
  diasAtraso: number;
  semaforo: SemaforoCobro;
}

/**
 * Pantalla Cobrar (doc 07 Módulo 7): lista priorizada por semáforo de la
 * cuota más próxima/vencida de cada operación activa — el punto de entrada
 * diario del negocio.
 */
export async function listCobrar(diasAlerta = 3): Promise<CobroItem[]> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const operaciones = await prisma.operacionCredito.findMany({
    where: { deletedAt: null, estado: { in: ["activo", "vencido"] }, cliente: { deletedAt: null } },
    include: {
      cliente: { select: { nombre: true, whatsapp: true } },
      venta: { include: { items: { select: { nombreProducto: true } } } },
      cuotas: {
        where: { estado: { in: ["pendiente", "parcial", "vencida"] } },
        orderBy: { numeroCuota: "asc" },
        take: 1,
      },
    },
  });

  const items: CobroItem[] = [];

  for (const o of operaciones) {
    const cuota = o.cuotas[0];
    const fechaVencimiento = cuota?.fechaVencimiento ?? o.fechaVencimiento;
    const diasAtraso = Math.floor((hoy.getTime() - fechaVencimiento.getTime()) / 86_400_000);

    let semaforo: SemaforoCobro;
    if (diasAtraso > 0) semaforo = "vencido";
    else if (diasAtraso === 0) semaforo = "hoy";
    else if (diasAtraso >= -diasAlerta) semaforo = "proximo";
    else continue; // fuera de la ventana de alerta, no aparece en Cobrar todavía

    items.push({
      operacionId: o.id,
      origen: o.origen,
      clienteNombre: o.cliente.nombre,
      clienteWhatsapp: o.cliente.whatsapp,
      producto: o.venta?.items.map((i) => i.nombreProducto).join(", ") ?? null,
      saldoCuota: Number(cuota?.saldoCalc ?? o.saldoPendienteCalc),
      saldoOperacion: Number(o.saldoPendienteCalc),
      fechaVencimiento,
      diasAtraso: Math.max(0, diasAtraso),
      semaforo,
    });
  }

  const orden: Record<SemaforoCobro, number> = { vencido: 0, hoy: 1, proximo: 2 };
  return items.sort((a, b) => orden[a.semaforo] - orden[b.semaforo] || b.diasAtraso - a.diasAtraso);
}
