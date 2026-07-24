import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listCobrar } from "@/lib/cobrar/queries";
import { prisma } from "@/lib/db";
import { formatearMoneda } from "@/lib/formato";

export const metadata: Metadata = { title: "Cobrar · Sabat Finance" };

function badgeSemaforo(semaforo: string, diasAtraso: number) {
  if (semaforo === "vencido") return <Badge variant="danger">Vencido · {diasAtraso}d</Badge>;
  if (semaforo === "hoy") return <Badge variant="warning">Vence hoy</Badge>;
  return <Badge variant="info">Próximo</Badge>;
}

function linkWhatsapp(whatsapp: string, nombre: string, saldo: number) {
  const numero = whatsapp.replace(/[^0-9]/g, "");
  const texto = encodeURIComponent(
    `Hola ${nombre}, te recordamos tu pago pendiente de ${formatearMoneda(saldo)}. ¡Gracias!`,
  );
  return `https://wa.me/${numero}?text=${texto}`;
}

export default async function Page() {
  const config = await prisma.configuracion.findUnique({ where: { id: 1 } });
  const items = await listCobrar(config?.diasAlertaVencimiento ?? 3);

  const vencidos = items.filter((i) => i.semaforo === "vencido");
  const hoy = items.filter((i) => i.semaforo === "hoy");
  const proximos = items.filter((i) => i.semaforo === "proximo");

  return (
    <div className="animate-fade-up">
      <PageHeader title="Cobrar" subtitle="Vencidos primero, luego hoy, luego próximos" />

      {items.length === 0 ? (
        <EmptyState icon="🎯" title="Nada por cobrar en este momento" description="Vuelve cuando haya cuotas próximas a vencer." />
      ) : (
        <div className="flex flex-col gap-6">
          {[
            { titulo: "🔴 Vencidos", data: vencidos },
            { titulo: "🟡 Vencen hoy", data: hoy },
            { titulo: "🟢 Próximos", data: proximos },
          ]
            .filter((s) => s.data.length > 0)
            .map((seccion) => (
              <section key={seccion.titulo}>
                <h2 className="mb-2.5 text-sm font-bold text-foreground">{seccion.titulo}</h2>
                <div className="flex flex-col gap-2.5">
                  {seccion.data.map((c) => (
                    <Card key={c.operacionId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{c.origen === "prestamo" ? "🏦" : "🛍"}</span>
                        <div>
                          <p className="font-bold text-foreground">{c.clienteNombre}</p>
                          <p className="text-[12.5px] text-muted">
                            {c.producto ? `${c.producto} · ` : ""}
                            {c.clienteWhatsapp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-mono font-bold tabular-nums">{formatearMoneda(c.saldoCuota)}</p>
                          {badgeSemaforo(c.semaforo, c.diasAtraso)}
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <a href={linkWhatsapp(c.clienteWhatsapp, c.clienteNombre, c.saldoCuota)} target="_blank" rel="noopener noreferrer">
                            WhatsApp
                          </a>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/pagos/nuevo?operacion=${c.operacionId}`}>Registrar pago</Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
