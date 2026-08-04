import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPrestamoById } from "@/lib/prestamos/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { BotonWhatsApp } from "@/components/shared/boton-whatsapp";
import { BadgeEstadoCuota } from "@/components/shared/badge-estado-cuota";
import { mensajeRecordatorio } from "@/lib/whatsapp/mensajes";
import { RenovarButton } from "../_components/renovar-button";
import { RefinanciarDialog } from "../_components/refinanciar-dialog";
import { AnularPrestamoButton } from "../_components/anular-prestamo-button";

export const metadata: Metadata = { title: "Detalle del préstamo · Sabat Finance" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const operacion = await getPrestamoById(id);
  if (!operacion) notFound();

  // Auditoría Sprint 1, punto #2: editar/anular solo tiene sentido antes
  // de que haya pagos reales sobre el préstamo — después de eso, tocar
  // capital/tasa/plazo dejaría el historial de pagos sin sentido.
  const esEditable = operacion.estado === "activo" && operacion.pagos.length === 0;
  const proximaCuota = operacion.cuotas.find((c) => c.estado !== "pagada");

  return (
    <div className="animate-fade-up flex flex-col gap-5">
      <Breadcrumb
        items={[
          { label: "Préstamos", href: "/prestamos" },
          { label: operacion.cliente.nombre },
        ]}
      />
      <PageHeader
        title={operacion.cliente.nombre}
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <Landmark className="h-3.5 w-3.5 text-accent" aria-hidden /> Financiero · {operacion.cliente.whatsapp}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            {proximaCuota ? (
              <BotonWhatsApp
                numero={operacion.cliente.whatsapp}
                mensaje={mensajeRecordatorio(operacion.cliente.nombre, Number(proximaCuota.total), proximaCuota.fechaVencimiento)}
              />
            ) : null}
            {operacion.estado === "activo" ? (
              <>
                <RenovarButton operacionId={operacion.id} />
                <RefinanciarDialog operacionId={operacion.id} saldoPendiente={Number(operacion.saldoPendienteCalc)} />
              </>
            ) : null}
            {esEditable ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href={`/prestamos/${operacion.id}/editar`}>Editar</Link>
                </Button>
                <AnularPrestamoButton prestamoId={operacion.id} montoCapital={Number(operacion.montoCapital)} />
              </>
            ) : null}
            <Button asChild>
              <Link href={`/pagos/nuevo?operacion=${operacion.id}`}>Registrar pago</Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-[11px] font-semibold text-muted">Capital</p>
            <p className="font-mono text-lg font-bold tabular-nums">{formatearMoneda(operacion.montoCapital)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-[11px] font-semibold text-muted">Interés total</p>
            <p className="font-mono text-lg font-bold tabular-nums">{formatearMoneda(operacion.interesTotalCalc)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-[11px] font-semibold text-muted">Total a pagar</p>
            <p className="font-mono text-lg font-bold tabular-nums">{formatearMoneda(operacion.totalAPagarCalc)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-[11px] font-semibold text-muted">Saldo pendiente</p>
            <p className="font-mono text-lg font-bold tabular-nums text-accent">{formatearMoneda(operacion.saldoPendienteCalc)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h3 className="mb-3 text-sm font-bold">Cuotas</h3>
          <div className="flex flex-col divide-y divide-[color:var(--border)]">
            {operacion.cuotas.map((c) => (
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

      <Card>
        <CardContent>
          <h3 className="mb-3 text-sm font-bold">Pagos registrados</h3>
          {operacion.pagos.length === 0 ? (
            <p className="text-[13px] text-muted">Sin pagos todavía.</p>
          ) : (
            <div className="flex flex-col divide-y divide-[color:var(--border)]">
              {operacion.pagos.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 text-[13px]">
                  <span className="text-muted">{formatearFecha(p.fechaPago)}</span>
                  <span className="font-mono font-semibold tabular-nums">{formatearMoneda(p.valor)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
