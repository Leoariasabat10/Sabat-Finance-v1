import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getInventario } from "@/lib/inventario/queries";
import { guardarJoya, marcarJoyaVendida } from "@/lib/inventario/actions";
import { JoyaForm } from "../../_components/joya-form";
import { VendidaToggle } from "../../_components/vendida-toggle";

export const metadata: Metadata = { title: "Joya · Sabat Finance" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const piedra = (await getInventario()).flatMap((l) => l.piedras).find((p) => p.joya?.id === id);
  const joya = piedra?.joya;
  if (!piedra || !joya) notFound();
  const c = joya.calc;

  return (
    <>
      <PageHeader
        title={joya.nombre}
        subtitle={`Piedra ${piedra.codigo} → joya → costos → precio`}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link href={`/inventario/piedras/${piedra.id}`}>Ver piedra</Link>
            </Button>
            <VendidaToggle action={marcarJoyaVendida.bind(null, joya.id, !joya.vendida)} vendida={joya.vendida} />
          </>
        }
      />
      <JoyaForm
        action={guardarJoya.bind(null, joya.id)}
        costoPiedra={c.costoPiedra}
        etiqueta="Guardar cambios"
        inicial={{
          nombre: joya.nombre,
          margen: Math.round(joya.margen * 1000) / 10,
          prima: Math.round(joya.prima * 1000) / 10,
          precioSabat: c.precioSabat ?? 0,
          costos: c.porConcepto,
        }}
      />
    </>
  );
}
