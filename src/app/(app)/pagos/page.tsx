import type { Metadata } from "next";
import Link from "next/link";
import { HandCoins } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaggerList, StaggerItem } from "@/components/shared/motion";
import { OrigenIcon } from "@/components/shared/origen-icon";
import { listCartera } from "@/lib/pagos/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";

export const metadata: Metadata = { title: "Registrar pago · Sabat Finance" };

export default async function Page() {
  const cartera = await listCartera();

  return (
    <div className="animate-fade-up">
      <PageHeader title="Registrar pago" subtitle="Elige el cliente para registrar su pago" />

      {cartera.length === 0 ? (
        <EmptyState
          icon={<HandCoins className="h-10 w-10 text-faint" />}
          title="No hay operaciones activas"
          description="Cuando haya préstamos o ventas a crédito activos, aparecerán aquí para registrar pagos."
        />
      ) : (
        <StaggerList className="flex flex-col gap-2.5">
          {cartera.map((c) => (
            <StaggerItem key={c.id}>
              <Card className="flex items-center justify-between gap-3 p-4 transition-all duration-premium ease-premium hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <OrigenIcon origen={c.origen} className="h-5 w-5" />
                  <div>
                    <p className="font-bold text-foreground">{c.clienteNombre}</p>
                    <p className="text-[12.5px] text-muted">
                      {formatearMoneda(c.saldoPendiente)} · vence {formatearFecha(c.fechaVencimiento)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {c.diasAtraso > 0 ? <Badge variant="danger">{c.diasAtraso}d</Badge> : null}
                  <Button asChild size="sm">
                    <Link href={`/pagos/nuevo?operacion=${c.id}`}>Pagar</Link>
                  </Button>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  );
}
