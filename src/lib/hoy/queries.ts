import { prisma } from "@/lib/db";
import { obtenerSaldoActual } from "@/lib/caja/motor";
import { hoyFecha, diasEntreFechas } from "@/lib/fecha";

/**
 * Pantalla "Hoy": lo que hay que saber y hacer ahora, y nada más. Cada número responde una pregunta del negocio:
 *   ¿cuánto tengo?  ¿cuánto me deben (y por qué)?  ¿cuánto pasó hoy?  ¿a quién cobro hoy?  ¿quién está atrasado?
 * Todo se calcula con la fecha de Bogotá (lib/fecha.ts), no la del servidor.
 */

export interface CobroDelDia {
  operacionId: string;
  clienteId: string;
  clienteNombre: string;
  clienteWhatsapp: string;
  origen: "prestamo" | "venta";
  monto: number;
  fecha: Date;
  /** > 0 solo en atrasados */
  diasAtraso: number;
}

export interface DatosHoy {
  hoy: Date;
  dineroDisponible: number;
  /** El negocio todavía no registró con cuánto dinero empezó: el saldo de caja no es el real. */
  faltaSaldoInicial: boolean;
  enLaCalle: {
    total: number;
    mercancia: { monto: number; cantidad: number };
    prestamos: { monto: number; cantidad: number };
  };
  hoyMovimiento: {
    ventas: { monto: number; cantidad: number };
    prestamos: { monto: number; cantidad: number };
    cobros: { monto: number; cantidad: number };
  };
  cobrarHoy: CobroDelDia[];
  atrasados: CobroDelDia[];
}

export async function getHoy(): Promise<DatosHoy> {
  const hoy = hoyFecha();

  const [config, dineroDisponible, operaciones, ventasHoy, prestamosHoy, pagosHoy, cuotas] = await Promise.all([
    prisma.configuracion.findUnique({ where: { id: 1 } }),
    obtenerSaldoActual(prisma),
    prisma.operacionCredito.findMany({
      where: { deletedAt: null, estado: { in: ["activo", "vencido"] }, cliente: { deletedAt: null } },
      select: { origen: true, saldoPendienteCalc: true },
    }),
    prisma.venta.aggregate({
      where: { deletedAt: null, estado: "activa", fecha: hoy },
      _sum: { totalCalc: true },
      _count: true,
    }),
    prisma.operacionCredito.aggregate({
      where: { deletedAt: null, origen: "prestamo", estado: { not: "anulado" }, fechaOperacion: hoy },
      _sum: { montoCapital: true },
      _count: true,
    }),
    prisma.pago.aggregate({
      where: { deletedAt: null, fechaPago: hoy },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.cuota.findMany({
      where: {
        estado: { in: ["pendiente", "parcial", "vencida"] },
        fechaVencimiento: { lte: hoy },
        operacion: { deletedAt: null, estado: { in: ["activo", "vencido"] }, cliente: { deletedAt: null } },
      },
      select: {
        fechaVencimiento: true,
        saldoCalc: true,
        operacion: {
          select: { id: true, origen: true, cliente: { select: { id: true, nombre: true, whatsapp: true } } },
        },
      },
      orderBy: { fechaVencimiento: "asc" },
    }),
  ]);

  const prestamos = operaciones.filter((o) => o.origen === "prestamo");
  const mercancia = operaciones.filter((o) => o.origen === "venta");
  const suma = (xs: { saldoPendienteCalc: unknown }[]) => xs.reduce((a, o) => a + Number(o.saldoPendienteCalc), 0);

  // Una operación = una fila: se suma lo que debe de las cuotas que ya tocan y se muestra la fecha más antigua.
  const porOperacion = new Map<string, CobroDelDia>();
  for (const c of cuotas) {
    const dias = diasEntreFechas(c.fechaVencimiento, hoy);
    const existente = porOperacion.get(c.operacion.id);
    if (existente) {
      existente.monto += Number(c.saldoCalc);
      continue; // las cuotas vienen de la más antigua a la más reciente: la primera marca la fecha
    }
    porOperacion.set(c.operacion.id, {
      operacionId: c.operacion.id,
      clienteId: c.operacion.cliente.id,
      clienteNombre: c.operacion.cliente.nombre,
      clienteWhatsapp: c.operacion.cliente.whatsapp,
      origen: c.operacion.origen,
      monto: Number(c.saldoCalc),
      fecha: c.fechaVencimiento,
      diasAtraso: Math.max(0, dias),
    });
  }
  const filas = Array.from(porOperacion.values());

  return {
    hoy,
    dineroDisponible,
    faltaSaldoInicial: Number(config?.capitalInicial ?? 0) === 0,
    enLaCalle: {
      total: suma(operaciones),
      mercancia: { monto: suma(mercancia), cantidad: mercancia.length },
      prestamos: { monto: suma(prestamos), cantidad: prestamos.length },
    },
    hoyMovimiento: {
      ventas: { monto: Number(ventasHoy._sum.totalCalc ?? 0), cantidad: ventasHoy._count },
      prestamos: { monto: Number(prestamosHoy._sum.montoCapital ?? 0), cantidad: prestamosHoy._count },
      cobros: { monto: Number(pagosHoy._sum.valor ?? 0), cantidad: pagosHoy._count },
    },
    cobrarHoy: filas.filter((f) => f.diasAtraso === 0).sort((a, b) => b.monto - a.monto),
    atrasados: filas.filter((f) => f.diasAtraso > 0).sort((a, b) => b.diasAtraso - a.diasAtraso || b.monto - a.monto),
  };
}
