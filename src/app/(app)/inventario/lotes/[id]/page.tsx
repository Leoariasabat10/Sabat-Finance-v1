import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInventario } from "@/lib/inventario/queries";
import { formatearMoneda } from "@/lib/formato";
import { ct, pct, ESTADO_PIEDRA, VARIANTE_ESTADO } from "../../_components/fmt";

export const metadata: Metadata = { title: "Lote · Sabat Finance" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lote = (await getInventario()).find((l) => l.id === id);
  if (!lote) notFound();
  const r = lote.resumen;

  return (
    <>
      <PageHeader title={lote.nombre} subtitle={`${lote.codigo} · ${lote.piedras.length} piedras`} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-[13px] text-muted">Costo del lote</p>
          <p className="mt-1.5 font-display text-[26px] leading-none">{formatearMoneda(lote.costoTotal)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] text-muted">Costo por ct {lote.ctReal != null ? "(peso real)" : "(declarado)"}</p>
          <p className="mt-1.5 font-display text-[26px] leading-none">{formatearMoneda(r.costoPorCtReal ?? r.costoPorCtDeclarado)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] text-muted">Peso declarado</p>
          <p className="mt-1.5 font-display text-[26px] leading-none">{ct(lote.ctDeclarados, 1)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] text-muted">Peso real del lote</p>
          <p className="mt-1.5 font-display text-[26px] leading-none">{lote.ctReal != null ? ct(lote.ctReal, 1) : "— pendiente —"}</p>
        </Card>
      </div>

      <Card className="mt-3 p-5 text-[14px] text-muted">
        <p>
          <span className="text-foreground">Estimado por dimensiones: {ct(r.sumEstimado)}</span> · diferencia con el lote {r.diferenciaEstimadoVsLote >= 0 ? "+" : ""}
          {r.diferenciaEstimadoVsLote.toFixed(2)} ct. {r.piedrasSinPesar} de {lote.piedras.length} piedras sin pesar individualmente.
        </p>
        <p className="mt-1.5">
          Mientras no pesemos cada piedra, su peso es el estimado ajustado al peso real del lote, y el costo se reparte según ese peso. Al pesar una piedra, todo se recalcula solo.
        </p>
      </Card>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead className="text-[13px] text-muted">
            <tr className="border-b border-[color:var(--border-md)]">
              <th className="py-2 pr-3 font-medium">Piedra</th>
              <th className="py-2 pr-3 font-medium">Talla</th>
              <th className="py-2 pr-3 text-right font-medium">Estimado</th>
              <th className="py-2 pr-3 text-right font-medium">Real</th>
              <th className="py-2 pr-3 text-right font-medium">Del lote</th>
              <th className="py-2 pr-3 text-right font-medium">Costo</th>
              <th className="py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {lote.piedras.map((p) => (
              <tr key={p.id} className="border-b border-[color:var(--border)]">
                <td className="py-2.5 pr-3">
                  <Link href={`/inventario/piedras/${p.id}`} className="font-medium underline-offset-4 hover:underline">
                    {p.codigo}
                  </Link>
                </td>
                <td className="py-2.5 pr-3 text-muted">{p.forma ?? "—"}</td>
                <td className="py-2.5 pr-3 text-right">{ct(p.fila.pesoEstimado)}</td>
                <td className="py-2.5 pr-3 text-right text-muted">{p.fila.pesoReal != null ? ct(p.fila.pesoReal) : "pendiente"}</td>
                <td className="py-2.5 pr-3 text-right text-muted">{pct(p.fila.participacion, 1)}</td>
                <td className="py-2.5 pr-3 text-right font-medium">{formatearMoneda(p.fila.costo)}</td>
                <td className="py-2.5">
                  <Badge variant={VARIANTE_ESTADO[p.estado]}>{ESTADO_PIEDRA[p.estado]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="py-3 font-medium" colSpan={5}>
                Total
              </td>
              <td className="py-3 text-right font-medium">{formatearMoneda(lote.piedras.reduce((s, p) => s + p.fila.costo, 0))}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
