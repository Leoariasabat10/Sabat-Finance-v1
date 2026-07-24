import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listVentas } from "@/lib/ventas/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";

export const metadata: Metadata = { title: "Ventas · Sabat Finance" };

export default async function Page() {
  const ventas = await listVentas();

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Ventas"
        subtitle="🛍 Comercial"
        actions={
          <Button asChild>
            <Link href="/ventas/nueva">+ Nueva venta</Link>
          </Button>
        }
      />

      {ventas.length === 0 ? (
        <EmptyState
          icon="🛍"
          title="Aún no hay ventas"
          description="Registra la primera venta de contado o a crédito."
          action={
            <Button asChild>
              <Link href="/ventas/nueva">+ Nueva venta</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {ventas.map((v) => (
            <Link key={v.id} href={`/ventas/${v.id}`}>
              <Card className="p-4 transition-colors hover:bg-hover-bg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground">{v.clienteNombre}</p>
                    <p className="text-[12.5px] text-muted">{formatearFecha(v.fecha)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatearMoneda(v.total)}</p>
                    <p className="text-[12px] text-muted">utilidad {formatearMoneda(v.utilidad)}</p>
                  </div>
                  <Badge variant={v.tipoPago === "credito" ? "warning" : "success"}>
                    {v.tipoPago === "credito" ? "Crédito" : "Contado"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
