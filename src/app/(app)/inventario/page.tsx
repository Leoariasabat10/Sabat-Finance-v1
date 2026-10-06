import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTablero } from "@/lib/inventario/queries";
import { formatearMoneda } from "@/lib/formato";
import { ct } from "./_components/fmt";

export const metadata: Metadata = { title: "Inventario · Sabat Finance" };

function Cifra({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <Card className="p-5">
      <p className="text-[13px] text-muted">{etiqueta}</p>
      <p className="mt-1.5 font-display text-[28px] leading-none text-foreground">{valor}</p>
      {nota ? <p className="mt-2 text-[13px] text-faint">{nota}</p> : null}
    </Card>
  );
}

export default async function Page() {
  const t = await getTablero();
  return (
    <>
      <PageHeader
        title="Inventario"
        subtitle="Cuánto hay invertido en piedras y cuánto cuesta cada joya."
        actions={
          <Button asChild variant="ghost">
            <Link href="/inventario/simulador">Analizar compra</Link>
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cifra etiqueta="Capital en piedras" valor={formatearMoneda(t.capitalEnPiedras)} nota={`${t.disponibles} disponibles · ${ct(t.ctDisponibles)}`} />
        <Cifra etiqueta="Capital en joyas" valor={formatearMoneda(t.capitalEnJoyas)} nota={`${t.enJoya} piedras transformadas`} />
        <Cifra etiqueta="Piedras y quilates" valor={`${t.piedras} · ${ct(t.ct, 1)}`} nota={`${t.vendidas} vendidas`} />
        <Cifra etiqueta="Costo promedio por ct" valor={formatearMoneda(t.costoPromedioCt)} nota={`Compras: ${formatearMoneda(t.totalCompra)}`} />
      </div>

      <h2 className="mb-3 mt-10 text-[22px]">Lotes</h2>
      <div className="flex flex-col gap-2.5">
        {t.lotes.length === 0 ? <p className="text-muted">Aún no hay lotes.</p> : null}
        {t.lotes.map((l) => (
          <Link key={l.id} href={`/inventario/lotes/${l.id}`}>
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-[color:var(--gold)]">
              <div>
                <p className="font-medium">{l.nombre}</p>
                <p className="text-[13px] text-muted">
                  {l.codigo} · {l.piedras.length} piedras · {ct(l.ctReal ?? l.ctDeclarados, 1)} {l.ctReal != null ? "reales" : "declarados"}
                </p>
              </div>
              <div className="text-right">
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
