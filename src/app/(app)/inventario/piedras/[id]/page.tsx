import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInventario } from "@/lib/inventario/queries";
import { guardarPiedra } from "@/lib/inventario/actions";
import { formatearMoneda } from "@/lib/formato";
import { ct, pct, ESTADO_PIEDRA, VARIANTE_ESTADO } from "../../_components/fmt";

export const metadata: Metadata = { title: "Piedra · Sabat Finance" };

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[13px] text-muted">{k}</dt>
      <dd className="mt-0.5 text-[17px]">{v}</dd>
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lotes = await getInventario();
  const lote = lotes.find((l) => l.piedras.some((p) => p.id === id));
  const p = lote?.piedras.find((x) => x.id === id);
  if (!lote || !p) notFound();

  return (
    <>
      <PageHeader
        title={`Esmeralda ${p.codigo.replace("ESM-", "#")}`}
        subtitle={<Badge variant={VARIANTE_ESTADO[p.estado]}>{ESTADO_PIEDRA[p.estado]}</Badge>}
        actions={
          p.joya ? (
            <Button asChild variant="ghost">
              <Link href={`/inventario/joyas/${p.joya.id}`}>Ver joya</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/inventario/joyas/nueva?piedra=${p.id}`}>Convertir en joya</Link>
            </Button>
          )
        }
      />

      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <Dato k="Talla" v={p.forma ?? "Sin definir"} />
        <Dato k="Dimensiones" v={p.dimensiones ?? "—"} />
        <Dato k="Peso estimado (por medidas)" v={ct(p.fila.pesoEstimado)} />
        <Dato k="Peso real" v={p.fila.pesoReal != null ? ct(p.fila.pesoReal) : "— pendiente —"} />
        <Dato k="Peso con el que se reparte el costo" v={`${ct(p.fila.pesoAjustado)} · ${pct(p.fila.participacion, 1)} del lote`} />
        <Dato k="Lote" v={`${lote.codigo} · ${lote.nombre}`} />
        <Dato k="Costo asignado" v={formatearMoneda(p.fila.costo)} />
        <Dato k="Costo por ct" v={formatearMoneda(p.fila.costoPorCt)} />
      </dl>

      {p.joya ? (
        <Card className="mt-8 p-5">
          <p className="text-[13px] text-muted">Trazabilidad</p>
          <p className="mt-2 text-[15px]">
            Piedra {p.codigo} → <Link className="underline underline-offset-4" href={`/inventario/joyas/${p.joya.id}`}>{p.joya.nombre}</Link> → costo total {formatearMoneda(p.joya.calc.costoTotal)} → mínimo{" "}
            {formatearMoneda(Math.ceil(p.joya.calc.precioMinimo))}
            {p.joya.calc.precioSabat ? ` → precio ${formatearMoneda(p.joya.calc.precioSabat)}` : ""}
          </p>
        </Card>
      ) : null}

      <h2 className="mb-3 mt-10 text-[22px]">Peso y características</h2>
      <p className="mb-4 max-w-xl text-[14px] text-muted">
        Al guardar el peso real, se recalculan la participación en el lote, el costo de esta piedra y de las demás, y la joya (costo, mínimo y margen).
      </p>
      <form action={guardarPiedra.bind(null, p.id)} className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ctReal">Peso real (ct)</Label>
          <Input id="ctReal" name="ctReal" inputMode="decimal" defaultValue={p.fila.pesoReal ?? ""} placeholder="Cuando la peses" />
        </div>
        <div>
          <Label htmlFor="forma">Talla</Label>
          <Input id="forma" name="forma" defaultValue={p.forma ?? ""} />
        </div>
        <div>
          <Label htmlFor="calidad">Calidad</Label>
          <Input id="calidad" name="calidad" defaultValue={p.calidad ?? ""} />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" defaultValue={p.color ?? ""} />
        </div>
        <div>
          <Label htmlFor="transparencia">Transparencia</Label>
          <Input id="transparencia" name="transparencia" defaultValue={p.transparencia ?? ""} />
        </div>
        <div>
          <Label htmlFor="tratamiento">Tratamiento</Label>
          <Input id="tratamiento" name="tratamiento" defaultValue={p.tratamiento ?? ""} />
        </div>
        <div>
          <Label htmlFor="origen">Origen</Label>
          <Input id="origen" name="origen" defaultValue={p.origen ?? ""} />
        </div>
        <div>
          <Label htmlFor="notas">Notas</Label>
          <Input id="notas" name="notas" defaultValue={p.notas ?? ""} />
        </div>
        <div>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </>
  );
}
