import { prisma } from "@/lib/db";

export async function getResumenReportes() {
  const [prestamos, ventas] = await Promise.all([
    // "anulado"/"anulada" se excluyen explícitamente: desde que anular ya
    // no oculta el registro con deletedAt (bug real de QA, 26 jul 2026, ver
    // anularPrestamo/anularVenta), un préstamo o venta anulada sigue
    // apareciendo en deletedAt:null pero nunca debe sumar como histórico.
    prisma.operacionCredito.findMany({
      where: { origen: "prestamo", deletedAt: null, estado: { not: "anulado" } },
      select: { montoCapital: true, interesTotalCalc: true, saldoPendienteCalc: true, estado: true, fechaVencimiento: true },
    }),
    prisma.venta.findMany({
      where: { deletedAt: null, estado: { not: "anulada" } },
      select: { totalCalc: true, utilidadCalc: true, tipoPago: true },
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

  return { financiero, comercial };
}
