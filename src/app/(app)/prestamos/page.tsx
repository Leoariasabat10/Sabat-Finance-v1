import type { Metadata } from "next";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StaggerList, StaggerItem } from "@/components/shared/motion";
import { listPrestamos } from "@/lib/prestamos/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";

export const metadata: Metadata = { title: "Préstamos · Sabat Finance" };

function badgeEstado(estado: string, diasAtraso: number) {
  if (estado === "pagado") return <Badge variant="success">Pagado</Badge>;
  if (estado === "refinanciado") return <Badge variant="info">Refinanciado</Badge>;
  if (estado === "anulado") return <Badge variant="danger">Anulado</Badge>;
  if (diasAtraso > 0) return <Badge variant="danger">{diasAtraso}d de atraso</Badge>;
  return <Badge variant="warning">Activo</Badge>;
}

export default async function Page() {
  const prestamos = await listPrestamos();

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Préstamos"
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <Landmark className="h-3.5 w-3.5 text-accent" aria-hidden /> Financiero
          </span>
        }
        actions={
          <Button asChild>
            <Link href="/prestamos/nuevo">+ Nuevo préstamo</Link>
          </Button>
        }
      />

      {prestamos.length === 0 ? (
        <EmptyState
          icon={<Landmark className="h-10 w-10 text-faint" />}
          title="Aún no hay préstamos"
          description="Crea el primero en menos de 20 segundos."
          action={
            <Button asChild>
              <Link href="/prestamos/nuevo">+ Nuevo préstamo</Link>
            </Button>
          }
        />
      ) : (
        <StaggerList className="flex flex-col gap-2.5">
          {prestamos.map((p) => (
            <StaggerItem key={p.id}>
              <Link href={`/prestamos/${p.id}`}>
                <Card className="p-4 transition-all duration-premium ease-premium hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Landmark className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                      <div>
                        <p className="font-bold text-foreground">{p.clienteNombre}</p>
                        <p className="text-[12.5px] text-muted">{p.clienteWhatsapp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatearMoneda(p.saldoPendiente)}</p>
                      <p className="text-[12px] text-muted">vence {formatearFecha(p.fechaVencimiento)}</p>
                    </div>
                    {badgeEstado(p.estado, p.diasAtraso)}
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  );
}
