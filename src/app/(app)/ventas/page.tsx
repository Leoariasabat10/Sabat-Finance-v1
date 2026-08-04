import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StaggerList, StaggerItem } from "@/components/shared/motion";
import { listVentas } from "@/lib/ventas/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";

export const metadata: Metadata = { title: "Ventas · Sabat Finance" };

export default async function Page() {
  const ventas = await listVentas();

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Ventas"
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-success" aria-hidden /> Comercial
          </span>
        }
        actions={
          <Button asChild>
            <Link href="/ventas/nueva">+ Nueva venta</Link>
          </Button>
        }
      />

      {ventas.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10 text-faint" />}
          title="Aún no hay ventas"
          description="Registra la primera venta de contado o a crédito."
          action={
            <Button asChild>
              <Link href="/ventas/nueva">+ Nueva venta</Link>
            </Button>
          }
        />
      ) : (
        <StaggerList className="flex flex-col gap-2.5">
          {ventas.map((v) => (
            <StaggerItem key={v.id}>
              <Link href={`/ventas/${v.id}`}>
                <Card className="p-4 transition-all duration-premium ease-premium hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 shrink-0 text-success" aria-hidden />
                      <div>
                        <p className="font-bold text-foreground">{v.clienteNombre}</p>
                        <p className="text-[12.5px] text-muted">{formatearFecha(v.fecha)}</p>
                      </div>
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
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  );
}
