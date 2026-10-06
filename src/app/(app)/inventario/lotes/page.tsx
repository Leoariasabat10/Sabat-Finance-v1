import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getInventario } from "@/lib/inventario/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { ct } from "../_components/fmt";

export const metadata: Metadata = { title: "Lotes · Sabat Finance" };

export default async function Page() {
  const lotes = await getInventario();
  return (
    <>
      <PageHeader
        title="Lotes"
        subtitle="Cada compra, con lo que costó."
        actions={
          <Button asChild>
            <Link href="/inventario/lotes/nuevo">+ Nuevo lote</Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-2.5">
        {lotes.map((l) => (
          <Link key={l.id} href={`/inventario/lotes/${l.id}`}>
            <Card className="grid gap-3 p-4 transition-colors hover:border-[color:var(--gold)] sm:grid-cols-4">
              <div className="sm:col-span-2">
                <p className="font-medium">{l.nombre}</p>
                <p className="text-[13px] text-muted">
                  {l.codigo}
                  {l.fecha ? ` · ${formatearFecha(l.fecha)}` : ""}
                  {l.proveedor ? ` · ${l.proveedor}` : ""}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-muted">{l.piedras.length} piedras</p>
                <p>{ct(l.ctReal ?? l.ctDeclarados, 1)}</p>
              </div>
              <div className="sm:text-right">
                <p className="font-medium">{formatearMoneda(l.costoTotal)}</p>
                <p className="text-[13px] text-muted">{formatearMoneda(l.resumen.costoPorCtReal ?? l.resumen.costoPorCtDeclarado)} / ct</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
