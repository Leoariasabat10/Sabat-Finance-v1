import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listCartera } from "@/lib/pagos/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";

export const metadata: Metadata = { title: "Registrar pago · Sabat Finance" };

export default async function Page() {
  const cartera = await listCartera();

  return (
    <div className="animate-fade-up">
      <PageHeader title="Registrar pago" subtitle="Elige el cliente para registrar su pago" />

      {cartera.length === 0 ? (
        <EmptyState icon="💵" title="No hay operaciones activas" description="Cuando haya préstamos o ventas a crédito activos, aparecerán aquí para registrar pagos." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {cartera.map((c) => (
            <Card key={c.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.origen === "prestamo" ? "🏦" : "🛍"}</span>
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
          ))}
        </div>
      )}
    </div>
  );
}
