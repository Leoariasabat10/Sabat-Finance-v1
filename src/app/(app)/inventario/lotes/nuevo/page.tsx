import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearLote } from "@/lib/inventario/actions";
import { campo } from "../../_components/fmt";

export const metadata: Metadata = { title: "Nuevo lote · Sabat Finance" };

export default function Page() {
  return (
    <>
      <PageHeader title="Nuevo lote" subtitle="Registra la compra y sus piedras." />
      <form action={crearLote} className="grid max-w-2xl gap-4">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" name="nombre" required placeholder="Lote Esmeraldas 002" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="costoTotal">Costo total (COP)</Label>
            <Input id="costoTotal" name="costoTotal" inputMode="numeric" required />
          </div>
          <div>
            <Label htmlFor="proveedor">Proveedor</Label>
            <Input id="proveedor" name="proveedor" />
          </div>
          <div>
            <Label htmlFor="ctDeclarados">Peso declarado (ct)</Label>
            <Input id="ctDeclarados" name="ctDeclarados" inputMode="decimal" required />
          </div>
          <div>
            <Label htmlFor="ctReal">Peso real del lote (ct, si lo pesaste)</Label>
            <Input id="ctReal" name="ctReal" inputMode="decimal" />
          </div>
          <div>
            <Label htmlFor="fecha">Fecha de compra</Label>
            <Input id="fecha" name="fecha" type="date" />
          </div>
        </div>
        <div>
          <Label htmlFor="piedras">Piedras: una por línea, “forma, largo, ancho, alto” en mm</Label>
          <textarea id="piedras" name="piedras" rows={8} className={campo} placeholder={"Corazón, 12.4, 13.3, 8.0\nÓvalo, 10.7, 8.8, 7.0"} />
          <p className="mt-1.5 text-[13px] text-faint">El peso de cada piedra se estima por sus medidas. El real lo agregas cuando la pesas.</p>
        </div>
        <div>
          <Button type="submit">Guardar lote</Button>
        </div>
      </form>
    </>
  );
}
