import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInventario } from "@/lib/inventario/queries";
import { formatearMoneda } from "@/lib/formato";
import { ct, ESTADO_PIEDRA, VARIANTE_ESTADO } from "../_components/fmt";

export const metadata: Metadata = { title: "Piedras · Sabat Finance" };

export default async function Page() {
  const piedras = (await getInventario()).flatMap((l) => l.piedras.map((p) => ({ ...p, lote: l.codigo })));
  return (
    <>
      <PageHeader title="Piedras" subtitle="Cada esmeralda, con su costo." />
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {piedras.map((p) => (
          <Link key={p.id} href={`/inventario/piedras/${p.id}`}>
            <Card className="h-full p-4 transition-colors hover:border-[color:var(--gold)]">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-[20px]">{p.codigo}</p>
                <Badge variant={VARIANTE_ESTADO[p.estado]}>{ESTADO_PIEDRA[p.estado]}</Badge>
              </div>
              <p className="mt-1 text-[14px] text-muted">{p.forma ?? "Talla sin definir"}</p>
              <p className="mt-0.5 text-[13px] text-faint">{p.dimensiones ?? "Sin medidas"}</p>
              <div className="mt-4 flex items-end justify-between">
                <p className="text-[14px]">{ct(p.fila.pesoReal ?? p.fila.pesoEstimado)}{p.fila.pesoReal == null ? " est." : ""}</p>
                <p className="font-medium">{formatearMoneda(p.fila.costo)}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
