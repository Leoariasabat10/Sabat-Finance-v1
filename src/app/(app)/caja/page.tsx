import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getSaldoActual, listMovimientos, getResumenHoy } from "@/lib/caja/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { MovimientoForm } from "./_components/movimiento-form";

export const metadata: Metadata = { title: "Caja · Sabat Finance" };

export default async function Page() {
  const [saldo, movimientos, resumenHoy] = await Promise.all([
    getSaldoActual(),
    listMovimientos(),
    getResumenHoy(),
  ]);

  return (
    <div className="animate-fade-up flex flex-col gap-5">
      <PageHeader title="Caja" subtitle="Libro de ingresos y egresos" actions={<MovimientoForm />} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-muted">Saldo actual</p>
          <p className={`font-mono text-xl font-bold tabular-nums ${saldo < 0 ? "text-danger" : "text-accent"}`}>
            {formatearMoneda(saldo)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-muted">Ingresos de hoy</p>
          <p className="font-mono text-xl font-bold tabular-nums text-success">{formatearMoneda(resumenHoy.ingresos)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-muted">Egresos de hoy</p>
          <p className="font-mono text-xl font-bold tabular-nums text-danger">{formatearMoneda(resumenHoy.egresos)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-muted">Neto de hoy</p>
          <p
            className={`font-mono text-xl font-bold tabular-nums ${
              resumenHoy.neto < 0 ? "text-danger" : resumenHoy.neto > 0 ? "text-success" : ""
            }`}
          >
            {formatearMoneda(resumenHoy.neto)}
          </p>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h3 className="mb-3 text-sm font-bold">Historial</h3>
          {movimientos.length === 0 ? (
            <EmptyState icon="🏦" title="Sin movimientos todavía" />
          ) : (
            <div className="flex flex-col divide-y divide-[color:var(--border)]">
              {movimientos.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2.5 text-[13px]">
                  <div>
                    <p className="font-semibold">{m.descripcion ?? m.categoria ?? "Movimiento"}</p>
                    <p className="text-[11.5px] text-muted">{formatearFecha(m.fecha)}</p>
                  </div>
                  <div className="text-right">
                    <p className={m.tipo === "ingreso" ? "font-bold text-success" : "font-bold text-danger"}>
                      {m.tipo === "ingreso" ? "+" : "−"}
                      {formatearMoneda(m.monto)}
                    </p>
                    <p className="text-[11px] text-muted">saldo {formatearMoneda(m.saldoResultante)}</p>
                  </div>
                  <Badge variant={m.tipo === "ingreso" ? "success" : "danger"}>{m.tipo}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
