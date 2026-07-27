import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getResumenReportes } from "@/lib/reportes/queries";
import { formatearMoneda } from "@/lib/formato";

export const metadata: Metadata = { title: "Reportes · Sabat Finance" };

/**
 * Simplificación (visión final, "menos pantallas, más inteligencia"): se
 * quitó "Top clientes por saldo" — es el mismo dato que ya se ve ordenando
 * Clientes o desde el expediente financiero de cada cliente, y no traía
 * ninguna acción propia. Reportes se queda con lo que ningún otro módulo
 * cubre: el acumulado histórico y la exportación de cartera.
 */
export default async function Page() {
  const { financiero, comercial } = await getResumenReportes();

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <PageHeader
        title="Reportes"
        subtitle="Resumen histórico financiero y comercial"
        actions={
          <Button asChild variant="ghost">
            <a href="/api/reportes/cartera-csv" download>
              Exportar cartera (CSV)
            </a>
          </Button>
        }
      />

      <Card>
        <CardContent>
          <h3 className="mb-3 text-sm font-bold">🏦 Financiero</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold text-muted">Capital prestado (histórico)</p>
              <p className="text-lg font-bold">{formatearMoneda(financiero.capitalPrestadoHistorico)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted">Interés esperado</p>
              <p className="text-lg font-bold">{formatearMoneda(financiero.interesGanadoEsperado)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted">Saldo activo por cobrar</p>
              <p className="text-lg font-bold">{formatearMoneda(financiero.saldoPendienteActivo)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted">Saldo vencido</p>
              <p className="text-lg font-bold text-danger">{formatearMoneda(financiero.saldoVencido)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted">Préstamos activos</p>
              <p className="text-lg font-bold">{financiero.prestamosActivos}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted">Préstamos pagados (paz y salvo)</p>
              <p className="text-lg font-bold">{financiero.prestamosPagados}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="mb-3 text-sm font-bold">🛍 Comercial</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-[11px] font-semibold text-muted">Total vendido (histórico)</p>
              <p className="text-lg font-bold">{formatearMoneda(comercial.totalVendidoHistorico)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted">Utilidad histórica</p>
              <p className="text-lg font-bold text-success">{formatearMoneda(comercial.utilidadHistorica)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted">Ventas de contado</p>
              <p className="text-lg font-bold">{comercial.ventasContado}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted">Ventas a crédito</p>
              <p className="text-lg font-bold">{comercial.ventasCredito}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
