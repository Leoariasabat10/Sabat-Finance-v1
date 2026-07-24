import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listCartera } from "@/lib/pagos/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";

export const metadata: Metadata = { title: "Cartera · Sabat Finance" };

export default async function Page() {
  const cartera = await listCartera();
  const financiero = cartera.filter((c) => c.origen === "prestamo");
  const comercial = cartera.filter((c) => c.origen === "venta");
  const totalFinanciero = financiero.reduce((a, c) => a + c.saldoPendiente, 0);
  const totalComercial = comercial.reduce((a, c) => a + c.saldoPendiente, 0);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Cartera unificada" subtitle="🏦 Financiero + 🛍 Comercial, siempre desagregados" />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-muted">🏦 Saldo por cobrar — Financiero</p>
          <p className="font-mono text-xl font-bold tabular-nums">{formatearMoneda(totalFinanciero)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-muted">🛍 Saldo por cobrar — Comercial</p>
          <p className="font-mono text-xl font-bold tabular-nums">{formatearMoneda(totalComercial)}</p>
        </Card>
      </div>

      {cartera.length === 0 ? (
        <EmptyState icon="📋" title="Cartera vacía" description="Aún no hay préstamos ni ventas a crédito activos." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {cartera.map((c) => (
            <Link key={c.id} href={c.origen === "prestamo" ? `/prestamos/${c.id}` : `/ventas`}>
              <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-hover-bg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.origen === "prestamo" ? "🏦" : "🛍"}</span>
                  <div>
                    <p className="font-bold text-foreground">{c.clienteNombre}</p>
                    <p className="text-[12.5px] text-muted">vence {formatearFecha(c.fechaVencimiento)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold tabular-nums">{formatearMoneda(c.saldoPendiente)}</span>
                  {c.diasAtraso > 0 ? <Badge variant="danger">{c.diasAtraso}d</Badge> : <Badge variant="warning">Activo</Badge>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
