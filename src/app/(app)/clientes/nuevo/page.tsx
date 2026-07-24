import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ClienteForm } from "../_components/cliente-form";

export const metadata: Metadata = { title: "Nuevo cliente · Sabat Finance" };

export default function NuevoClientePage() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <PageHeader
        title="Nuevo cliente"
        subtitle="Solo el nombre y el WhatsApp son obligatorios."
      />
      <ClienteForm />
    </div>
  );
}
