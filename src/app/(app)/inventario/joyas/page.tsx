import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { getInventario } from "@/lib/inventario/queries";
import { formatearMoneda } from "@/lib/formato";

export const metadata: Metadata = { title: "Joyas · Sabat Finance" };

export default async function Page() {
  const joyas = (await getInventario()).flatMap((l) => l.piedras.filter((p) => p.joya).map((p) => ({ ...p.joya!, piedra: p.codigo })));
  return (
    <>
      <PageHeader title="Joyas" subtitle="Lo que cuesta construir cada pieza y a cuánto venderla." />
      {joyas.length === 0 ? (
        <EmptyState title="Aún no hay joyas" description="Abre una piedra y conviértela en joya para ver su costo completo." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {joyas.map((j) => (
            <Link key={j.id} href={`/inventario/joyas/${j.id}`}>
              <Card className="grid gap-3 p-4 transition-colors hover:border-[color:var(--gold)] sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <p className="font-medium">{j.nombre}</p>
                  <p className="text-[13px] text-muted">Piedra {j.piedra}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted">Costo total</p>
                  <p>{formatearMoneda(j.calc.costoTotal)}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[13px] text-muted">Mínimo → precio</p>
                  <p className="font-medium">
                    {formatearMoneda(Math.ceil(j.calc.precioMinimo))} → {j.calc.precioSabat ? formatearMoneda(j.calc.precioSabat) : "—"}
                  </p>
                  {j.vendida ? <Badge variant="info">Vendida</Badge> : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
