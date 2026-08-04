import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getVentaById } from "@/lib/ventas/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { BadgeEstadoCuota } from "@/components/shared/badge-estado-cuota";
import { AnularVentaButton } from "../_components/anular-venta-button";

export const metadata: Metadata = { title: "Detalle de venta · Sabat Finance" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venta = await getVentaById(id);
  if (!venta) notFound();

  return (
    <div className="animate-fade-up flex flex-col gap-5">
      <Breadcrumb items={[{ label: "Ventas", href: "/ventas" }, { label: venta.cliente.nombre }]} />
      <PageHeader
        title={venta.cliente.nombre}
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-success" aria-hidden /> Comercial · {venta.cliente.whatsapp} · {formatearFecha(venta.fecha)}
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            {venta.estado !== "anulada" ? (
              <AnularVentaButton ventaId={venta.id} total={Number(venta.totalCalc)} tipoPago={venta.tipoPago} />
            ) : (
              <Badge variant="danger">Anulada</Badge>
            )}
            {venta.operacionCredito && venta.estado !== "anulada" ? (
              <Button asChild>
                <Link href={`/pagos/nuevo?operacion=${venta.operacionCredito.id}`}>Registrar pago</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-[11px] font-semibold text-muted">Total</p>
            <p className="font-mono text-lg font-bold tabular-nums">{formatearMoneda(venta.totalCalc)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-[11px] font-semibold text-muted">Utilidad</p>
            <p className="font-mono text-lg font-bold tabular-nums">{formatearMoneda(venta.utilidadCalc)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-[11px] font-semibold text-muted">Tipo de pago</p>
            <Badge variant={venta.tipoPago === "credito" ? "warning" : "success"}>
              {venta.tipoPago === "credito" ? "Crédito" : "Contado"}
            </Badge>
          </CardContent>
        </Card>
        {venta.operacionCredito ? (
          <Card>
            <CardContent>
              <p className="text-[11px] font-semibold text-muted">Saldo pendiente</p>
              <p className="font-mono text-lg font-bold tabular-nums text-accent">
                {formatearMoneda(venta.operacionCredito.saldoPendienteCalc)}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardContent>
          <h3 className="mb-3 text-sm font-bold">Artículos</h3>
          <div className="flex flex-col divide-y divide-[color:var(--border)]">
            {venta.items.map((i) => (
              <div key={i.id} className="flex items-center justify-between py-2.5 text-[13px]">
                <span>{i.nombreProducto}</span>
                <span className="font-mono font-semibold tabular-nums">{formatearMoneda(i.precioVenta)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {venta.operacionCredito ? (
        <Card>
          <CardContent>
            <h3 className="mb-3 text-sm font-bold">Cuotas (sin interés)</h3>
            <div className="flex flex-col divide-y divide-[color:var(--border)]">
              {venta.operacionCredito.cuotas.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5 text-[13px]">
                  <span className="text-muted">
                    #{c.numeroCuota} · vence {formatearFecha(c.fechaVencimiento)}
                  </span>
                  <span className="font-mono font-semibold tabular-nums">{formatearMoneda(c.total)}</span>
                  <BadgeEstadoCuota estado={c.estado} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
