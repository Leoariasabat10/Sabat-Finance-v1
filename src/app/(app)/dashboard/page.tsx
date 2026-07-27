import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { BarrasMensuales } from "@/components/shared/barras-mensuales";
import { getDashboardData } from "@/lib/dashboard/queries";
import { listCobrar } from "@/lib/cobrar/queries";
import { getPosicionActual } from "@/lib/posicion/queries";
import { construirColaDecisiones } from "@/lib/dashboard/colaDecisiones";
import { ColaDecisiones } from "./_components/cola-decisiones";
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
  });

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

      <div>
        {colaDecisiones.length > 0 ? (
          <p className="mb-2.5 text-[13px] font-semibold text-muted">
            {colaDecisiones.length === 1
              ? "Hoy deberías hacer solamente esto:"
              : `Hoy deberías hacer solamente estas ${colaDecisiones.length} cosas:`}
          </p>
        ) : null}
        <ColaDecisiones tarjetas={colaDecisiones} />
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
