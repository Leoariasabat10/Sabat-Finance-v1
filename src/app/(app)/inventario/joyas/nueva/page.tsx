import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getInventario } from "@/lib/inventario/queries";
import { crearJoya } from "@/lib/inventario/actions";
import { formatearMoneda } from "@/lib/formato";
import { JoyaForm } from "../../_components/joya-form";

export const metadata: Metadata = { title: "Nueva joya · Sabat Finance" };

export default async function Page({ searchParams }: { searchParams: Promise<{ piedra?: string }> }) {
  const { piedra: id } = await searchParams;
  const piedra = (await getInventario()).flatMap((l) => l.piedras).find((p) => p.id === id);
  if (!piedra) notFound();
  if (piedra.joya) redirect(`/inventario/joyas/${piedra.joya.id}`);

  return (
    <>
      <PageHeader title="Nueva joya" subtitle={`Esmeralda ${piedra.codigo} · ${formatearMoneda(piedra.fila.costo)} de costo asignado`} />
      <JoyaForm action={crearJoya.bind(null, piedra.id)} costoPiedra={piedra.fila.costo} etiqueta="Crear joya" inicial={{ nombre: "", margen: 60, prima: 0, precioSabat: 0, costos: {} }} />
    </>
  );
}
