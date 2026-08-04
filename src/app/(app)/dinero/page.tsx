import type { Metadata } from "next";
import Link from "next/link";
import { Landmark, ShoppingBag, Wallet, Lightbulb, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InsightBanner } from "@/components/shared/insight-banner";
import { StaggerList, StaggerItem } from "@/components/shared/motion";
import { getSaldoActual, listMovimientos, getResumenHoy } from "@/lib/caja/queries";
import { getPosicionActual, capturarSnapshotHoy, getVariacionCapital } from "@/lib/posicion/queries";
import { calcularCupoSeguro, simularRecuperarCapital, narrativaImpactoCapitalRetenido } from "@/lib/inteligencia/cfo";
import { BotonWhatsApp } from "@/components/shared/boton-whatsapp";
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

  // Fase 2 (27 jul 2026): "disponible para prestar" dejó de ser solo un
  // número — es la pregunta que Geisa hace más seguido. Si no configuró el
  // capital inicial todavía, no la dejamos bloqueada con "sin configurar":
  // le damos un cupo aproximado calculado sobre su caja real, dejándolo
  // claro con la palabra "aproximado" en vez de fingir precisión que no
  // tenemos.
  const cupoSeguro = calcularCupoSeguro({
    capitalTotalConfigurado: posicion.capitalTotal,
    capitalDisponible: posicion.capitalDisponible,
    saldoCaja,
  });

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
              <p className="flex items-center gap-1 text-[11px] font-semibold text-muted"><Landmark className="h-3 w-3" aria-hidden /> Prestado</p>
            </div>
            <p className="font-mono text-lg font-bold tabular-nums">{formatearMoneda(posicion.capitalPrestado)}</p>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <p className="flex items-center gap-1 text-[11px] font-semibold text-muted"><ShoppingBag className="h-3 w-3" aria-hidden /> Invertido en mercancía</p>
            </div>
            <p className="font-mono text-lg font-bold tabular-nums">{formatearMoneda(posicion.capitalInvertidoMercancia)}</p>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              <p className="flex items-center gap-1 text-[11px] font-semibold text-muted"><Wallet className="h-3 w-3" aria-hidden /> Disponible para prestar</p>
            </div>
            {posicion.capitalTotal > 0 ? (
              <p
                className={`font-mono text-lg font-bold tabular-nums ${posicion.capitalDisponible < 0 ? "text-danger" : ""}`}
              >
                {formatearMoneda(posicion.capitalDisponible)}
              </p>
            ) : (
              // Fase 2 (27 jul 2026): antes esto quedaba en "— sin
              // configurar" y bloqueaba la respuesta a "¿cuánto puedo
              // prestar?" hasta que alguien cargara el capital inicial en
              // Configuración — fricción real encontrada simulando un día de
              // uso. Ahora usamos la caja real como aproximación honesta.
              <p className="font-mono text-lg font-bold tabular-nums text-faint">
                ≈ {formatearMoneda(saldoCaja)}
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 flex items-start gap-1.5 border-t border-[color:var(--border)] pt-3 text-[12.5px] font-semibold text-foreground">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden /> {cupoSeguro.mensaje}
        </p>

        {posicion.capitalTotal > 0 && variacionPct !== null ? (
          <p className="mt-2 text-[12.5px] text-muted">
            Hace 7 días tenías {formatearMoneda(variacion.disponible.hace7Dias ?? 0)} disponibles —{" "}
            <span className={variacionPct >= 0 ? "font-semibold text-success" : "font-semibold text-danger"}>
              {variacionPct >= 0 ? "+" : ""}
              {variacionPct.toFixed(0)}%
            </span>
          </p>
        ) : null}
      </Card>

      {posicion.clientesRetenidos.length > 0 ? (
        <Card className="p-4">
          <InsightBanner
            tono="warning"
            icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
            title={`${formatearMoneda(posicion.capitalRetenido)} en capital retenido${
              posicion.capitalTotal > 0 ? ` (${((posicion.capitalRetenido / posicion.capitalTotal) * 100).toFixed(0)}% del capital total)` : ""
            }`}
            description={narrativaImpactoCapitalRetenido({
              clienteNombre: posicion.clientesRetenidos[0]!.clienteNombre,
              montoCapital: posicion.clientesRetenidos[0]!.montoCapital,
              antiguedadDias: posicion.clientesRetenidos[0]!.antiguedadDias,
              pctDelCapitalTotal:
                posicion.capitalTotal > 0 ? (posicion.clientesRetenidos[0]!.montoCapital / posicion.capitalRetenido) * 100 : null,
            })}
            action={<Badge variant="warning">Revisar</Badge>}
          />
          {posicion.capitalTotal > 0 ? (
            <Progress
              value={Math.min(100, (posicion.capitalRetenido / posicion.capitalTotal) * 100)}
              className="mt-3 bg-warning-bg"
              indicatorClassName="bg-warning"
            />
          ) : null}
          <p className="mt-3 flex items-start gap-1.5 text-[12px] font-semibold text-accent">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {
              simularRecuperarCapital({
                montoARecuperar: posicion.clientesRetenidos[0]!.montoCapital,
                capitalTotalConfigurado: posicion.capitalTotal,
                capitalDisponible: posicion.capitalDisponible,
                saldoCaja,
              }).mensaje
            }
          </p>
          <StaggerList className="mt-3 flex flex-col gap-1.5">
            {posicion.clientesRetenidos.slice(0, 5).map((c) => (
              <StaggerItem key={c.operacionId}>
                <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[12.5px] transition-colors duration-premium hover:bg-hover-bg">
                  <Link href={`/prestamos/${c.operacionId}`} className="min-w-0 flex-1 transition-colors hover:text-accent">
                    <span className="font-semibold text-foreground">
                      {c.clienteNombre} ·{" "}
                      {c.antiguedadDias !== null ? `${Math.floor(c.antiguedadDias / 30)} meses` : "patrón de pago, sin fecha confirmada"}
                    </span>
                  </Link>
                  <span className="font-mono tabular-nums">{formatearMoneda(c.montoCapital)}</span>
                  <BotonWhatsApp
                    numero={c.clienteWhatsapp}
                    mensaje={`Hola ${c.clienteNombre}.\nQuiero conversar contigo sobre el préstamo de ${formatearMoneda(c.montoCapital)} — llevas un tiempo pagando solo intereses. ¿Podemos acordar una devolución de capital?`}
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
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
            <EmptyState icon={<Wallet className="h-10 w-10 text-faint" />} title="Sin movimientos todavía" />
          ) : (
            <StaggerList className="flex max-h-[420px] flex-col divide-y divide-[color:var(--border)] overflow-y-auto">
              {movimientos.map((m) => (
                <StaggerItem key={m.id}>
                  <div className="flex items-center justify-between py-2.5 text-[13px] transition-colors duration-premium hover:bg-hover-bg">
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
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
