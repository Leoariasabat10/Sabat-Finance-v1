import { prisma } from "@/lib/db";

export async function getResumenReportes() {
  const [prestamos, ventas, clientesConSaldo] = await Promise.all([
    prisma.operacionCredito.findMany({
      where: { origen: "prestamo", deletedAt: null },
      select: { montoCapital: true, interesTotalCalc: true, saldoPendienteCalc: true, estado: true, fechaVencimiento: true },
    }),
    prisma.venta.findMany({
      where: { deletedAt: null },
      select: { totalCalc: true, utilidadCalc: true, tipoPago: true },
    }),
    prisma.cliente.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        nombre: true,
        whatsapp: true,
        operaciones: { where: { deletedAt: null, estado: { in: ["activo", "vencido"] } }, select: { saldoPendienteCalc: true, origen: true } },
      },
    }),
  ]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const financiero = {
    capitalPrestadoHistorico: prestamos.reduce((a, p) => a + Number(p.montoCapital), 0),
    interesGanadoEsperado: prestamos.reduce((a, p) => a + Number(p.interesTotalCalc), 0),
    saldoPendienteActivo: prestamos
      .filter((p) => p.estado === "activo" || p.estado === "vencido")
      .reduce((a, p) => a + Number(p.saldoPendienteCalc), 0),
    saldoVencido: prestamos
      .filter((p) => (p.estado === "activo" || p.estado === "vencido") && p.fechaVencimiento < hoy)
      .reduce((a, p) => a + Number(p.saldoPendienteCalc), 0),
    prestamosPagados: prestamos.filter((p) => p.estado === "pagado").length,
    prestamosActivos: prestamos.filter((p) => p.estado === "activo" || p.estado === "vencido").length,
  };

  const comercial = {
    totalVendidoHistorico: ventas.reduce((a, v) => a + Number(v.totalCalc), 0),
    utilidadHistorica: ventas.reduce((a, v) => a + Number(v.utilidadCalc), 0),
    ventasContado: ventas.filter((v) => v.tipoPago === "contado").length,
    ventasCredito: ventas.filter((v) => v.tipoPago === "credito").length,
  };

  const topClientes = clientesConSaldo
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      whatsapp: c.whatsapp,
      saldoPrestamos: c.operaciones.filter((o) => o.origen === "prestamo").reduce((a, o) => a + Number(o.saldoPendienteCalc), 0),
      saldoVentas: c.operaciones.filter((o) => o.origen === "venta").reduce((a, o) => a + Number(o.saldoPendienteCalc), 0),
    }))
    .map((c) => ({ ...c, saldoTotal: c.saldoPrestamos + c.saldoVentas }))
    .filter((c) => c.saldoTotal > 0)
    .sort((a, b) => b.saldoTotal - a.saldoTotal)
    .slice(0, 10);

  return { financiero, comercial, topClientes };
}
