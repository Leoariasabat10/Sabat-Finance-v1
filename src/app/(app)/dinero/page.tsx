import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSaldoActual, listMovimientos, getResumenHoy } from "@/lib/caja/queries";
import { getPosicionActual, capturarSnapshotHoy, getVariacionCapital } from "@/lib/posicion/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { MovimientoForm } from "../caja/_components/movimiento-form";

export const metadata: Metadata = { title: "Mi dinero · Sabat Finance" };

function segmento(porcentaje: number, color: string) {
  const ancho = Math.max(0, Math.min(100, porcentaje));
  return <div className={`h-full ${color}`} style={{ width: `${ancho}%` }} />;
}

export default async function Page() {
  const posicion = await getPosicionActual();
  await capturarSnapshotHoy(posicion);
  const [variacion, saldoCaja, movimientos, resumenHoy] = await Promise.all([
    getVariacionCapital(posicion.capitalDisponible),
    getSaldoActual(),
    listMovimientos(30),
    getResumenHoy(),
  ]);

  const total = posicion.capitalTotal > 0 ? posicion.capitalTotal : 1;
  const pctPrestado = (posicion.capitalPrestado / total) * 100;
  const pctMercancia = (posicion.capitalInvertidoMercancia / total) * 100;
  const pctDisponible = (posicion.capitalDisponible / total) * 100;

  const variacionPct = variacion.disponible.variacionPct;

  return (
    <div className="animate-fade-up flex flex-col gap-5">
      <PageHeader title="Mi dinero" subtitle="Dónde está cada peso de tu capital" actions={<MovimientoForm />} />

      <Card className="p-5">
        <p className="mb-1 text-[11px] font-semibold text-muted">Capital total</p>
        <p className="mb-4 font-mono text-2xl font-bold tabular-nums">{formatearMoneda(posicion.capitalTotal)}</p>

        {posicion.capitalTotal > 0 ? (
          <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full bg-hover-bg">
            {segmento(pctPrestado, "bg-accent")}
            {segmento(pctMercancia, "bg-warning")}
            {segmento(pctDisponible, "bg-success")}
          </div>
        ) : (
          <p className="mb-3 text-[12.5px] text-muted">
            Configura el capital inicial del negocio en Configuración para ver esta barra.
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <p className="text-[11px] font-semibold text-muted">🏦 Prestado</p>
            </div>
            <p className="font-mono text-lg font-bold tabular-nums">{formatearMoneda(posicion.capitalPrestado)}</p>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <p className="text-[11px] font-semibold text-muted">🛍 Invertido en mercancía</p>
            </div>
            <p className="font-mono text-lg font-bold tabular-nums">{formatearMoneda(posicion.capitalInvertidoMercancia)}</p>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              <p className="text-[11px] font-semibold text-muted">💰 Disponible para prestar</p>
            </div>
            {posicion.capitalTotal > 0 ? (
              <p
                className={`font-mono text-lg font-bold tabular-nums ${posicion.capitalDisponible < 0 ? "text-danger" : ""}`}
              >
                {formatearMoneda(posicion.capitalDisponible)}
              </p>
            ) : (
              // Auditoría Sprint 1 (Build→Measure→Learn, probado con datos
              // reales): sin capital_inicial configurado, capitalDisponible
              // da negativo por diseño (0 − prestado). Mostrar ese número en
              // rojo alarma sin razón — es un dato sin sentido todavía, no
              // una posición negativa real.
              <p className="font-mono text-lg font-bold tabular-nums text-faint">— sin configurar</p>
            )}
          </div>
        </div>

        {posicion.capitalTotal > 0 && variacionPct !== null ? (
          <p className="mt-4 border-t border-[color:var(--border)] pt-3 text-[12.5px] text-muted">
            Hace 7 días tenías {formatearMoneda(variacion.disponible.hace7Dias ?? 0)} disponibles —{" "}
            <span className={variacionPct >= 0 ? "font-semibold text-success" : "font-semibold text-danger"}>
              {variacionPct >= 0 ? "+" : ""}
              {variacionPct.toFixed(0)}%
            </span>
          </p>
        ) : null}
      </Card>

      {posicion.clientesRetenidos.length > 0 ? (
        <Card className="border-warning/40 bg-warning-bg p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-bold text-foreground">
                ⚠ {formatearMoneda(posicion.capitalRetenido)} en capital retenido
                {posicion.capitalTotal > 0 ? ` (${((posicion.capitalRetenido / posicion.capitalTotal) * 100).toFixed(0)}% del capital total)` : ""}
              </p>
              <p className="text-[12px] text-muted">
                {posicion.clientesRetenidos.length === 1
                  ? "1 cliente lleva más de un año pagando solo intereses, sin abonar capital."
                  : `${posicion.clientesRetenidos.length} clientes llevan más de un año pagando solo intereses, sin abonar capital.`}
              </p>
            </div>
            <Badge variant="warning">Revisar</Badge>
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {posicion.clientesRetenidos.slice(0, 5).map((c) => (
              <Link
                key={c.operacionId}
                href={`/prestamos/${c.operacionId}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-[12.5px] transition-colors hover:bg-hover-bg"
              >
                <span className="font-semibold text-foreground">
                  {c.clienteNombre} ·{" "}
                  {c.antiguedadDias !== null ? `${Math.floor(c.antiguedadDias / 30)} meses` : "patrón de pago, sin fecha confirmada"}
                </span>
                <span className="font-mono tabular-nums">{formatearMoneda(c.montoCapital)}</span>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Movimientos de caja</h3>
            <span className="text-[12px] text-muted">Saldo en efectivo: {formatearMoneda(saldoCaja)}</span>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold text-muted">Ingresos de hoy</p>
              <p className="font-mono text-[15px] font-bold tabular-nums text-success">{formatearMoneda(resumenHoy.ingresos)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted">Egresos de hoy</p>
              <p className="font-mono text-[15px] font-bold tabular-nums text-danger">{formatearMoneda(resumenHoy.egresos)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted">Neto de hoy</p>
              <p
                className={`font-mono text-[15px] font-bold tabular-nums ${
                  resumenHoy.neto < 0 ? "text-danger" : resumenHoy.neto > 0 ? "text-success" : ""
                }`}
              >
                {formatearMoneda(resumenHoy.neto)}
              </p>
            </div>
          </div>

          {movimientos.length === 0 ? (
            <EmptyState icon="🏦" title="Sin movimientos todavía" />
          ) : (
            <div className="flex max-h-[420px] flex-col divide-y divide-[color:var(--border)] overflow-y-auto">
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
