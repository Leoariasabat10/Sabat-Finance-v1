import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPrestamoById } from "@/lib/prestamos/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { BotonWhatsApp } from "@/components/shared/boton-whatsapp";
import { mensajeRecordatorio } from "@/lib/whatsapp/mensajes";
import { RenovarButton } from "../_components/renovar-button";
import { RefinanciarDialog } from "../_components/refinanciar-dialog";
import { AnularPrestamoButton } from "../_components/anular-prestamo-button";

export const metadata: Metadata = { title: "Detalle del préstamo · Sabat Finance" };

function badgeEstadoCuota(estado: string) {
  switch (estado) {
    case "pagada":
      return <Badge variant="success">Pagada</Badge>;
    case "parcial":
      return <Badge variant="warning">Abono parcial</Badge>;
    case "vencida":
      return <Badge variant="danger">Vencida</Badge>;
    default:
      return <Badge variant="info">Pendiente</Badge>;
  }
}

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
      <PageHeader
        title={operacion.cliente.nombre}
        subtitle={`🏦 Financiero · ${operacion.cliente.whatsapp}`}
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
            <p className="text-lg font-bold">{formatearMoneda(operacion.montoCapital)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-[11px] font-semibold text-muted">Interés total</p>
            <p className="text-lg font-bold">{formatearMoneda(operacion.interesTotalCalc)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-[11px] font-semibold text-muted">Total a pagar</p>
            <p className="text-lg font-bold">{formatearMoneda(operacion.totalAPagarCalc)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-[11px] font-semibold text-muted">Saldo pendiente</p>
            <p className="text-lg font-bold text-accent">{formatearMoneda(operacion.saldoPendienteCalc)}</p>
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
                {badgeEstadoCuota(c.estado)}
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
