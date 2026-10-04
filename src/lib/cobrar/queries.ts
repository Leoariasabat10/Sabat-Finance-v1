import { prisma } from "@/lib/db";
import { calcularMora } from "@/lib/calculos";
import { hoyFecha } from "@/lib/fecha";

export type SemaforoCobro = "vencido" | "hoy" | "proximo";

export interface CobroItem {
  operacionId: string;
  origen: string;
  clienteNombre: string;
  clienteWhatsapp: string;
  clienteBarrio: string | null;
  producto: string | null;
  saldoCuota: number;
  saldoOperacion: number;
  fechaVencimiento: Date;
  diasAtraso: number;
  /**
   * Mora informativa calculada en vivo con la tasa configurada
   * (Configuración > Reglas financieras). Bug real de auditoría (2 ago
   * 2026): el usuario podía configurar una tasa de mora que nunca se
   * aplicaba en ningún lugar de la app — `calcularMora()` existía, tenía
   * pruebas, pero nadie la llamaba. Se muestra aquí como referencia; no se
   * suma a `saldoCuota`/`saldoOperacion` (el saldo real que se cobra sigue
   * siendo el que vive en `cuotas`/`operaciones_credito`, sin modificar el
   * motor de pagos).
   */
  montoMora: number;
  semaforo: SemaforoCobro;
}

/**
 * Pantalla Cobrar (doc 07 Módulo 7): lista priorizada por semáforo de la
 * cuota más próxima/vencida de cada operación activa — el punto de entrada
 * diario del negocio.
 */
export async function listCobrar(diasAlerta = 3): Promise<CobroItem[]> {
  const hoy = hoyFecha();

  const [config, operaciones] = await Promise.all([
    prisma.configuracion.findUnique({ where: { id: 1 } }),
    prisma.operacionCredito.findMany({
      where: { deletedAt: null, estado: { in: ["activo", "vencido"] }, cliente: { deletedAt: null } },
      include: {
        cliente: { select: { nombre: true, whatsapp: true, barrio: true } },
        venta: { include: { items: { select: { nombreProducto: true } } } },
        cuotas: {
          where: { estado: { in: ["pendiente", "parcial", "vencida"] } },
          orderBy: { numeroCuota: "asc" },
          take: 1,
        },
      },
    }),
  ]);

  const tasaMora = Number(config?.tasaMoraDefecto ?? 0);
  const tipoMora = config?.tipoMora ?? "porcentaje_diario";

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

    const saldoCuota = Number(cuota?.saldoCalc ?? o.saldoPendienteCalc);
    const montoMora =
      tasaMora > 0 && diasAtraso > 0
        ? calcularMora({ valorCuota: saldoCuota, diasAtraso, tipoMora, tasaMora })
        : 0;

    items.push({
      operacionId: o.id,
      origen: o.origen,
      clienteNombre: o.cliente.nombre,
      clienteWhatsapp: o.cliente.whatsapp,
      clienteBarrio: o.cliente.barrio,
      producto: o.venta?.items.map((i) => i.nombreProducto).join(", ") ?? null,
      saldoCuota,
      saldoOperacion: Number(o.saldoPendienteCalc),
      fechaVencimiento,
      diasAtraso: Math.max(0, diasAtraso),
      montoMora,
      semaforo,
    });
  }

  const orden: Record<SemaforoCobro, number> = { vencido: 0, hoy: 1, proximo: 2 };
  return items.sort((a, b) => orden[a.semaforo] - orden[b.semaforo] || b.diasAtraso - a.diasAtraso);
}
