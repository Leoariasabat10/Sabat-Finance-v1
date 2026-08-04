import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Landmark, ShoppingBag, HandCoins, CheckCircle2, AlertTriangle, ArrowUpRight, CircleDollarSign, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { FinanzasChart } from "@/components/shared/finanzas-chart";
import { DistribucionCartera } from "@/components/shared/distribucion-cartera";
import { FadeIn, StaggerList, StaggerItem } from "@/components/shared/motion";
import { AnimatedNumber, AnimatedMoneda } from "@/components/shared/animated-number";
import { OrigenIcon } from "@/components/shared/origen-icon";
import { AvatarGroup } from "@/components/shared/avatar-group";
import { getDashboardData } from "@/lib/dashboard/queries";
import { listCobrar } from "@/lib/cobrar/queries";
import { getPosicionActual } from "@/lib/posicion/queries";
import { construirColaDecisiones } from "@/lib/dashboard/colaDecisiones";
import { ColaDecisiones } from "./_components/cola-decisiones";
import { formatearMoneda, formatearFecha } from "@/lib/formato";

export const metadata: Metadata = { title: "Dashboard · Sabat Finance" };

const iconoActividad: Record<string, typeof Landmark> = { prestamo: Landmark, venta: ShoppingBag, pago: HandCoins };

function fechaLarga(): string {
  const texto = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default async function DashboardPage() {
  const [data, cobrarHoy, posicion] = await Promise.all([getDashboardData(), listCobrar(0), getPosicionActual()]);
  const agendaHoy = cobrarHoy.filter((c) => c.semaforo === "hoy" || c.semaforo === "vencido").slice(0, 5);

  // Visión final del producto, sección 2: "Hoy" entrega un cupo fijo de
  // máximo 4 decisiones ya priorizadas — reemplaza la lista de alertas
  // sueltas y las dos tarjetas de dinero que había antes en este mismo
  // lugar. El resto de las tarjetas de abajo quedan como evidencia de
  // apoyo, no como el mensaje principal.
  const colaDecisiones = construirColaDecisiones({
    clientesAtencion: data.clientesAtencion,
    cobrarHoy,
    clientesRetenidos: posicion.clientesRetenidos,
    dineroDisponible: data.dineroDisponible,
    capitalTotalConfigurado: posicion.capitalTotal,
    capitalDisponible: posicion.capitalDisponible,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tu día en Sabat"
        subtitle={<span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden /> {fechaLarga()}</span>}
        actions={
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        }
      />

      <FadeIn>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="eyebrow">Centro de decisiones</p>
            <p className="mt-1 text-[14px] font-semibold text-foreground">Prioriza lo importante y actúa sin perder tiempo.</p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-card px-3 py-1.5 text-[11.5px] font-semibold text-muted shadow-sm">
            <CircleDollarSign className="h-3.5 w-3.5 text-accent" aria-hidden /> Datos actualizados hoy
          </div>
        </div>
        {colaDecisiones.length > 0 ? (
          <p className="mb-2.5 text-[13px] font-semibold text-muted">
            {colaDecisiones.length === 1
              ? "Hoy deberías hacer solamente esto:"
              : `Hoy deberías hacer solamente estas ${colaDecisiones.length} cosas:`}
          </p>
        ) : null}
        <ColaDecisiones tarjetas={colaDecisiones} />
      </FadeIn>

      <FadeIn delay={0.05} className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card className="group overflow-hidden border-accent/20 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
          <CardContent>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="eyebrow">Financiero</p>
                <h3 className="mt-1 flex items-center gap-1.5 text-base font-bold"><Landmark className="h-4 w-4 text-accent" aria-hidden /> Préstamos activos</h3>
              </div>
              <span className="rounded-full bg-accent-light px-2.5 py-1 text-[11px] font-bold text-accent">Crédito</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-muted">Capital activo</p>
                <p className="metric-value font-mono text-[18px] font-bold tabular-nums">
                  <AnimatedMoneda valor={data.bloqueFinanciero.capitalActivo} />
                </p>
              </div>
              <div>
                <p className="text-muted">Por cobrar</p>
                <p className="metric-value font-mono text-[18px] font-bold tabular-nums">
                  <AnimatedMoneda valor={data.bloqueFinanciero.porCobrar} />
                </p>
              </div>
              <div>
                <p className="text-muted">Vencido</p>
                <p className="metric-value font-mono text-[18px] font-bold tabular-nums text-danger">
                  <AnimatedMoneda valor={data.bloqueFinanciero.vencido} />
                </p>
              </div>
              <div>
                <p className="text-muted">Préstamos activos</p>
                <p className="metric-value text-[18px] font-bold">
                  <AnimatedNumber value={data.bloqueFinanciero.cantidadActivos} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-success/20 hover:-translate-y-0.5 hover:border-success/40 hover:shadow-md">
          <CardContent>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="eyebrow">Comercial</p>
                <h3 className="mt-1 flex items-center gap-1.5 text-base font-bold"><ShoppingBag className="h-4 w-4 text-success" aria-hidden /> Ventas y utilidad</h3>
              </div>
              <span className="rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-bold text-success">Ventas</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-muted">Vendido este mes</p>
                <p className="metric-value font-mono text-[18px] font-bold tabular-nums">
                  <AnimatedMoneda valor={data.bloqueComercial.totalVendidoMes} />
                </p>
              </div>
              <div>
                <p className="text-muted">Utilidad del mes</p>
                <p className="metric-value font-mono text-[18px] font-bold tabular-nums text-success">
                  <AnimatedMoneda valor={data.bloqueComercial.utilidadMes} />
                </p>
              </div>
              <div>
                <p className="text-muted">Por cobrar (crédito)</p>
                <p className="metric-value font-mono text-[18px] font-bold tabular-nums">
                  <AnimatedMoneda valor={data.bloqueComercial.porCobrarCredito} />
                </p>
              </div>
              <div>
                <p className="text-muted">Ventas del mes</p>
                <p className="metric-value text-[18px] font-bold">
                  <AnimatedNumber value={data.bloqueComercial.ventasDelMes} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.1} className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card className="overflow-hidden">
          <CardContent>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Flujo de caja</p>
                <h3 className="mt-1 text-base font-bold">Ingresos y egresos — 6 meses</h3>
              </div>
              <span className="rounded-full bg-subtle px-2.5 py-1 font-mono text-[11px] font-bold text-muted">COP</span>
            </div>
            <div className="hairline-grid rounded-xl px-2 pt-3 sm:px-4">
              <FinanzasChart datos={data.serieMeses} />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11.5px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-success" /> Ingresos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-danger" /> Egresos
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="eyebrow">Composición</p>
            <h3 className="mb-4 mt-1 text-base font-bold">Cartera por origen</h3>
            <DistribucionCartera financiero={data.bloqueFinanciero.porCobrar} comercial={data.bloqueComercial.porCobrarCredito} />
            <div className="my-4 border-t border-[color:var(--border)]" />
            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Agenda del día</h3><Link href="/cobrar" className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-accent hover:text-accent-dark">Ver cobrar <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></Link></div>
            {agendaHoy.length === 0 ? (
              <p className="flex items-center gap-1.5 text-[13px] text-muted">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> Nada por cobrar hoy — todo al día.
              </p>
            ) : (
              <StaggerList className="flex flex-col divide-y divide-[color:var(--border)]">
                {agendaHoy.map((c) => (
                  <StaggerItem key={c.operacionId}>
                    <Link
                      href={`/pagos/nuevo?operacion=${c.operacionId}`}
                      className="flex items-center justify-between rounded-md px-1 py-2 text-[13px] transition-colors duration-premium hover:bg-hover-bg hover:text-accent"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <OrigenIcon origen={c.origen} /> {c.clienteNombre}
                      </span>
                      <span className="font-mono font-semibold tabular-nums">{formatearMoneda(c.saldoCuota)}</span>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {data.clientesAtencion.length > 0 && (
        <FadeIn delay={0.15}>
          <Card className="overflow-hidden">
            <CardContent>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-1.5 text-sm font-bold"><AlertTriangle className="h-4 w-4 text-warning" aria-hidden /> Clientes que requieren atención</h3>
                <AvatarGroup items={data.clientesAtencion.map((c) => ({ id: c.clienteId, nombre: c.nombre }))} max={5} />
              </div>
              <StaggerList className="flex flex-col divide-y divide-[color:var(--border)]">
                {data.clientesAtencion.map((c) => (
                  <StaggerItem key={c.clienteId}>
                    <Link
                      href={`/clientes/${c.clienteId}`}
                      className="flex items-center justify-between rounded-md px-1 py-2.5 text-[13px] transition-colors duration-premium hover:bg-hover-bg hover:text-accent"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${c.diasMora >= 15 ? "bg-danger" : "bg-warning"}`}
                        />
                        <OrigenIcon origen={c.origen} /> {c.nombre}
                        <span className="text-muted">· {c.diasMora}d de mora</span>
                      </span>
                      <span className="font-semibold text-danger">{formatearMoneda(c.montoVencido)}</span>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerList>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <FadeIn delay={0.2}>
        <Card className="overflow-hidden">
          <CardContent>
            <h3 className="mb-3 text-sm font-bold">Actividad reciente</h3>
            {data.actividad.length === 0 ? (
              <EmptyState
                icon={<BarChart3 className="h-10 w-10 text-faint" />}
                title="Todavía no hay actividad"
                description="Crea tu primer préstamo o venta para empezar."
              />
            ) : (
              <StaggerList className="flex flex-col divide-y divide-[color:var(--border)]">
                {data.actividad.map((a) => (
                  <StaggerItem key={`${a.tipo}-${a.id}`}>
                    <div className="flex items-center justify-between rounded-md px-1 py-2.5 text-[13px] transition-colors duration-premium hover:bg-hover-bg">
                      <span className="inline-flex items-center gap-1.5">
                        {(() => {
                          const Icon = iconoActividad[a.tipo];
                          return Icon ? <Icon className="h-4 w-4 shrink-0 text-faint" aria-hidden /> : null;
                        })()}
                        <strong>{a.titulo}</strong> · {a.detalle}
                      </span>
                      <div className="text-right">
                        <p className="font-mono font-semibold tabular-nums">{formatearMoneda(a.monto)}</p>
                        <p className="text-[11px] text-muted">{formatearFecha(a.fecha)}</p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
