import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { BarrasMensuales } from "@/components/shared/barras-mensuales";
import { getDashboardData } from "@/lib/dashboard/queries";
import { listCobrar } from "@/lib/cobrar/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";

export const metadata: Metadata = { title: "Dashboard · Sabat Finance" };

const iconoActividad: Record<string, string> = { prestamo: "🏦", venta: "🛍", pago: "💵" };

function fechaLarga(): string {
  const texto = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default async function DashboardPage() {
  const [data, cobrarHoy] = await Promise.all([getDashboardData(), listCobrar(0)]);
  const agendaHoy = cobrarHoy.filter((c) => c.semaforo === "hoy" || c.semaforo === "vencido").slice(0, 5);

  const alertas =
    agendaHoy.length > 0
      ? [
          ...data.alertas,
          {
            nivel: "info" as const,
            icono: "🗓",
            mensaje: `${agendaHoy.length} cobro${agendaHoy.length === 1 ? "" : "s"} programado${agendaHoy.length === 1 ? "" : "s"} para hoy`,
            href: "/cobrar",
          },
        ]
      : data.alertas;

  const colorAlerta: Record<string, string> = {
    danger: "border-danger/25 bg-danger-bg/60 text-danger",
    warning: "border-warning/25 bg-warning-bg/60 text-warning",
    info: "border-accent/25 bg-accent-light/60 text-accent-dark",
  };

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <PageHeader
        title="Hola 👋"
        subtitle={fechaLarga()}
        actions={
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        }
      />

      {alertas.length > 0 && (
        <div className="flex flex-col gap-2">
          {alertas.map((a, i) => (
            <Link
              key={i}
              href={a.href ?? "#"}
              className={`flex items-center gap-2.5 rounded-md border px-4 py-2.5 text-[13px] font-medium transition-colors ${colorAlerta[a.nivel]}`}
            >
              <span>{a.icono}</span>
              <span>{a.mensaje}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-[11px] font-semibold text-muted">Dinero disponible (caja)</p>
          <p
            className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
              data.dineroDisponible < 0 ? "text-danger" : "text-accent"
            }`}
          >
            {formatearMoneda(data.dineroDisponible)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-[11px] font-semibold text-muted">Dinero por cobrar (total)</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums">{formatearMoneda(data.dineroPorCobrarTotal)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="mb-3 text-sm font-bold">🏦 Financiero</h3>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-muted">Capital activo</p>
                <p className="font-mono font-bold tabular-nums">{formatearMoneda(data.bloqueFinanciero.capitalActivo)}</p>
              </div>
              <div>
                <p className="text-muted">Por cobrar</p>
                <p className="font-mono font-bold tabular-nums">{formatearMoneda(data.bloqueFinanciero.porCobrar)}</p>
              </div>
              <div>
                <p className="text-muted">Vencido</p>
                <p className="font-mono font-bold tabular-nums text-danger">{formatearMoneda(data.bloqueFinanciero.vencido)}</p>
              </div>
              <div>
                <p className="text-muted">Préstamos activos</p>
                <p className="font-bold">{data.bloqueFinanciero.cantidadActivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="mb-3 text-sm font-bold">🛍 Comercial</h3>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-muted">Vendido este mes</p>
                <p className="font-mono font-bold tabular-nums">{formatearMoneda(data.bloqueComercial.totalVendidoMes)}</p>
              </div>
              <div>
                <p className="text-muted">Utilidad del mes</p>
                <p className="font-mono font-bold tabular-nums text-success">{formatearMoneda(data.bloqueComercial.utilidadMes)}</p>
              </div>
              <div>
                <p className="text-muted">Por cobrar (crédito)</p>
                <p className="font-mono font-bold tabular-nums">{formatearMoneda(data.bloqueComercial.porCobrarCredito)}</p>
              </div>
              <div>
                <p className="text-muted">Ventas del mes</p>
                <p className="font-bold">{data.bloqueComercial.ventasDelMes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardContent>
            <h3 className="mb-3 text-sm font-bold">Caja — últimos 6 meses</h3>
            <BarrasMensuales datos={data.serieMeses} />
            <div className="mt-3 flex gap-4 text-[11.5px] text-muted">
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
            <h3 className="mb-3 text-sm font-bold">Agenda del día</h3>
            {agendaHoy.length === 0 ? (
              <p className="text-[13px] text-muted">✅ Nada por cobrar hoy — todo al día.</p>
            ) : (
              <div className="flex flex-col divide-y divide-[color:var(--border)]">
                {agendaHoy.map((c) => (
                  <Link
                    key={c.operacionId}
                    href={`/pagos/nuevo?operacion=${c.operacionId}`}
                    className="flex items-center justify-between py-2 text-[13px] hover:text-accent"
                  >
                    <span>
                      {c.origen === "prestamo" ? "🏦" : "🛍"} {c.clienteNombre}
                    </span>
                    <span className="font-mono font-semibold tabular-nums">{formatearMoneda(c.saldoCuota)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {data.clientesAtencion.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="mb-3 text-sm font-bold">⚠️ Clientes que requieren atención</h3>
            <div className="flex flex-col divide-y divide-[color:var(--border)]">
              {data.clientesAtencion.map((c) => (
                <Link
                  key={c.clienteId}
                  href={`/clientes/${c.clienteId}`}
                  className="flex items-center justify-between py-2.5 text-[13px] hover:text-accent"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${c.diasMora >= 15 ? "bg-danger" : "bg-warning"}`}
                    />
                    {c.origen === "prestamo" ? "🏦" : "🛍"} {c.nombre}
                    <span className="text-muted">· {c.diasMora}d de mora</span>
                  </span>
                  <span className="font-semibold text-danger">{formatearMoneda(c.montoVencido)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <h3 className="mb-3 text-sm font-bold">Actividad reciente</h3>
          {data.actividad.length === 0 ? (
            <EmptyState icon="📊" title="Todavía no hay actividad" description="Crea tu primer préstamo o venta para empezar." />
          ) : (
            <div className="flex flex-col divide-y divide-[color:var(--border)]">
              {data.actividad.map((a) => (
                <div key={`${a.tipo}-${a.id}`} className="flex items-center justify-between py-2.5 text-[13px]">
                  <span>
                    {iconoActividad[a.tipo]} <strong>{a.titulo}</strong> · {a.detalle}
                  </span>
                  <div className="text-right">
                    <p className="font-mono font-semibold tabular-nums">{formatearMoneda(a.monto)}</p>
                    <p className="text-[11px] text-muted">{formatearFecha(a.fecha)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
