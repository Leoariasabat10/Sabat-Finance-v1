import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getClienteById } from "@/lib/clientes/queries";
import { ClienteForm } from "../../_components/cliente-form";

export const metadata: Metadata = { title: "Editar cliente · Sabat Finance" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({ params }: PageProps) {
  const { id } = await params;
  const cliente = await getClienteById(id);

  if (!cliente) notFound();

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <PageHeader title={`Editar a ${cliente.nombre}`} />
      <ClienteForm
        clienteId={cliente.id}
        defaultValues={{
          nombre: cliente.nombre,
          whatsapp: cliente.whatsapp,
          cedula: cliente.cedula ?? undefined,
          telefono: cliente.telefono ?? undefined,
          direccion: cliente.direccion ?? undefined,
          barrio: cliente.barrio ?? undefined,
          ciudad: cliente.ciudad ?? undefined,
          referencia: cliente.referencia ?? undefined,
          notas: cliente.notas ?? undefined,
        }}
      />
    </div>
  );
}
