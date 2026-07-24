import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { listCobrar } from "@/lib/cobrar/queries";
import { formatearMoneda } from "@/lib/formato";

export const metadata: Metadata = { title: "Notificaciones · Sabat Finance" };

/**
 * Centro de avisos: combina las notificaciones guardadas con los avisos
 * operativos vivos (cuotas vencidas y que vencen hoy) para que esta pantalla
 * siempre refleje lo que necesita atención ahora mismo.
 */
export default async function Page() {
  const [guardadas, cobrar] = await Promise.all([
    prisma.notificacion.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    listCobrar(0),
  ]);

  const avisosVivos = cobrar
    .filter((c) => c.semaforo === "vencido" || c.semaforo === "hoy")
    .map((c) => ({
      id: c.operacionId,
      icono: c.semaforo === "vencido" ? "🔴" : "🟡",
      titulo:
        c.semaforo === "vencido"
          ? `${c.clienteNombre} está vencido (${c.diasAtraso}d)`
          : `${c.clienteNombre} vence hoy`,
      detalle: `${c.origen === "prestamo" ? "🏦 Préstamo" : "🛍 Venta"} · ${formatearMoneda(c.saldoCuota)}`,
      href: `/pagos/nuevo?operacion=${c.operacionId}`,
    }));

  const hayContenido = avisosVivos.length > 0 || guardadas.length > 0;

  return (
    <div className="animate-fade-up">
      <PageHeader title="Notificaciones" subtitle="Avisos que requieren tu atención" />

      {!hayContenido ? (
        <EmptyState
          icon="🔔"
          title="Todo al día"
          description="No hay cuotas vencidas ni avisos pendientes. Cuando algo requiera tu atención, aparecerá aquí."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {avisosVivos.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="flex flex-col divide-y divide-[color:var(--border)]">
                  {avisosVivos.map((a) => (
                    <Link
                      key={a.id}
                      href={a.href}
                      className="flex flex-wrap items-center justify-between gap-2 px-[18px] py-3 transition-colors duration-premium hover:bg-hover-bg"
                    >
                      <span className="text-[13px] font-semibold text-foreground">
                        {a.icono} {a.titulo}
                      </span>
                      <span className="text-[12.5px] text-muted">{a.detalle}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {guardadas.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="flex flex-col divide-y divide-[color:var(--border)]">
                  {guardadas.map((n) => (
                    <div key={n.id} className="px-[18px] py-3">
                      <p className="text-[13px] font-semibold text-foreground">{n.titulo}</p>
                      <p className="text-[12.5px] text-muted">{n.mensaje}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
