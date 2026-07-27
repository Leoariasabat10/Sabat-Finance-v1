import { prisma } from "@/lib/db";
import { obtenerSaldoActual } from "@/lib/caja/motor";

export interface ActividadItem {
  id: string;
  tipo: "prestamo" | "venta" | "pago";
  titulo: string;
  detalle: string;
  monto: number;
  fecha: Date;
}

export interface MesSerie {
  mes: string;
  ingresos: number;
  egresos: number;
}

export interface ClienteAtencion {
  clienteId: string;
  nombre: string;
  whatsapp: string;
  origen: "prestamo" | "venta";
  diasMora: number;
  montoVencido: number;
}

export interface Alerta {
  nivel: "danger" | "warning" | "info";
  icono: string;
  mensaje: string;
  href?: string;
}

export async function getDashboardData() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const hace6Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);

  const [
    dineroDisponible,
    operacionesActivas,
    ventasDelMes,
    ultimosPrestamos,
    ultimasVentas,
    ultimosPagos,
    movimientos6Meses,
    cuotasVencidas,
  ] = await Promise.all([
    obtenerSaldoActual(prisma),
    prisma.operacionCredito.findMany({
      where: { deletedAt: null, estado: { in: ["activo", "vencido"] }, cliente: { deletedAt: null } },
      select: { origen: true, montoCapital: true, saldoPendienteCalc: true, fechaVencimiento: true, interesTotalCalc: true },
    }),
    prisma.venta.findMany({
      where: { deletedAt: null, fecha: { gte: inicioMes } },
      select: { totalCalc: true, utilidadCalc: true, tipoPago: true },
    }),
    prisma.operacionCredito.findMany({
      // Un cliente borrado (deletedAt) no debe seguir apareciendo en la
      // Actividad reciente del dueño del negocio — encontrado simulando un
      // día real de uso, 27 jul 2026: un cliente de prueba eliminado seguía
      // saliendo en "Actividad reciente" con su préstamo y su pago.
      where: { origen: "prestamo", deletedAt: null, cliente: { deletedAt: null } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { cliente: { select: { nombre: true } } },
    }),
    prisma.venta.findMany({
      where: { deletedAt: null, cliente: { deletedAt: null } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { cliente: { select: { nombre: true } } },
    }),
    prisma.pago.findMany({
      where: { deletedAt: null, operacion: { cliente: { deletedAt: null } } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { operacion: { include: { cliente: { select: { nombre: true } } } } },
    }),
    prisma.movimientoCaja.findMany({ where: { fecha: { gte: hace6Meses } }, select: { tipo: true, monto: true, fecha: true } }),
    prisma.cuota.findMany({
      where: {
        estado: { in: ["pendiente", "parcial"] },
        fechaVencimiento: { lt: hoy },
        operacion: { deletedAt: null, estado: { in: ["activo", "vencido"] }, cliente: { deletedAt: null } },
      },
      select: {
        fechaVencimiento: true,
        saldoCalc: true,
        operacion: {
          select: {
            origen: true,
            cliente: { select: { id: true, nombre: true, whatsapp: true } },
          },
        },
      },
    }),
  ]);

  const financiero = operacionesActivas.filter((o) => o.origen === "prestamo");
  const comercial = operacionesActivas.filter((o) => o.origen === "venta");

  const bloqueFinanciero = {
    capitalActivo: financiero.reduce((a, o) => a + Number(o.montoCapital), 0),
    porCobrar: financiero.reduce((a, o) => a + Number(o.saldoPendienteCalc), 0),
    vencido: financiero
      .filter((o) => o.fechaVencimiento < hoy)
      .reduce((a, o) => a + Number(o.saldoPendienteCalc), 0),
    interesEsperado: financiero.reduce((a, o) => a + Number(o.interesTotalCalc), 0),
    cantidadActivos: financiero.length,
  };

  const bloqueComercial = {
    totalVendidoMes: ventasDelMes.reduce((a, v) => a + Number(v.totalCalc), 0),
    utilidadMes: ventasDelMes.reduce((a, v) => a + Number(v.utilidadCalc), 0),
    porCobrarCredito: comercial.reduce((a, o) => a + Number(o.saldoPendienteCalc), 0),
    ventasDelMes: ventasDelMes.length,
    cantidadCreditoActivo: comercial.length,
  };

  const dineroPorCobrarTotal = bloqueFinanciero.porCobrar + bloqueComercial.porCobrarCredito;

  const actividad: ActividadItem[] = [
    ...ultimosPrestamos.map((p) => ({
      id: p.id,
      tipo: "prestamo" as const,
      titulo: p.cliente.nombre,
      detalle: "Nuevo préstamo",
      monto: Number(p.montoCapital),
      fecha: p.createdAt,
    })),
    ...ultimasVentas.map((v) => ({
      id: v.id,
      tipo: "venta" as const,
      titulo: v.cliente.nombre,
      detalle: v.tipoPago === "credito" ? "Venta a crédito" : "Venta de contado",
      monto: Number(v.totalCalc),
      fecha: v.createdAt,
    })),
    ...ultimosPagos.map((p) => ({
      id: p.id,
      tipo: "pago" as const,
      titulo: p.operacion.cliente.nombre,
      detalle: "Pago recibido",
      monto: Number(p.valor),
      fecha: p.createdAt,
    })),
  ]
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .slice(0, 8);

  const serieMeses: MesSerie[] = [];
  for (let i = 5; i >= 0; i--) {
    const mesInicio = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const mesFin = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 0, 23, 59, 59);
    const delMes = movimientos6Meses.filter((m) => m.fecha >= mesInicio && m.fecha <= mesFin);
    serieMeses.push({
      mes: mesInicio.toLocaleDateString("es-CO", { month: "short" }),
      ingresos: delMes.filter((m) => m.tipo === "ingreso").reduce((a, m) => a + Number(m.monto), 0),
      egresos: delMes.filter((m) => m.tipo === "egreso").reduce((a, m) => a + Number(m.monto), 0),
    });
  }

  // Clientes que requieren atención: agrupa cuotas vencidas por cliente,
  // se queda con la mora más antigua (mayor días vencido) de cada uno.
  const porCliente = new Map<string, ClienteAtencion>();
  for (const c of cuotasVencidas) {
    const dias = Math.floor((hoy.getTime() - c.fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));
    const existente = porCliente.get(c.operacion.cliente.id);
    if (existente) {
      existente.montoVencido += Number(c.saldoCalc);
      existente.diasMora = Math.max(existente.diasMora, dias);
    } else {
      porCliente.set(c.operacion.cliente.id, {
        clienteId: c.operacion.cliente.id,
        nombre: c.operacion.cliente.nombre,
        whatsapp: c.operacion.cliente.whatsapp,
        origen: c.operacion.origen,
        diasMora: dias,
        montoVencido: Number(c.saldoCalc),
      });
    }
  }
  const clientesAtencion = Array.from(porCliente.values())
    .sort((a, b) => b.diasMora - a.diasMora)
    .slice(0, 6);

  // Alertas: señales operativas que la dueña debe ver de un vistazo.
  const alertas: Alerta[] = [];
  if (bloqueFinanciero.vencido + bloqueComercial.porCobrarCredito > 0 && clientesAtencion.length > 0) {
    const totalVencido = clientesAtencion.reduce((a, c) => a + c.montoVencido, 0);
    alertas.push({
      nivel: "danger",
      icono: "⚠️",
      mensaje: `${clientesAtencion.length} cliente${clientesAtencion.length === 1 ? "" : "s"} con cuotas vencidas por ${formatearMonedaAlerta(totalVencido)}`,
      href: "/cobrar",
    });
  }
  const moraLarga = clientesAtencion.filter((c) => c.diasMora >= 15);
  if (moraLarga.length > 0) {
    alertas.push({
      nivel: "danger",
      icono: "🔴",
      mensaje: `${moraLarga.length} cliente${moraLarga.length === 1 ? "" : "s"} con más de 15 días de mora`,
      href: "/cobrar",
    });
  }
  if (dineroDisponible <= 0) {
    alertas.push({
      nivel: "warning",
      icono: "💰",
      mensaje: "La caja está en cero o negativa — revisa antes de prestar o vender a crédito",
      href: "/dinero",
    });
  }
  return {
    dineroDisponible,
    dineroPorCobrarTotal,
    bloqueFinanciero,
    bloqueComercial,
    actividad,
    serieMeses,
    clientesAtencion,
    alertas,
  };
}

function formatearMonedaAlerta(valor: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
}
