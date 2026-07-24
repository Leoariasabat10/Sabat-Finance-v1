import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { VentaForm } from "../_components/venta-form";

export const metadata: Metadata = { title: "Nueva venta · Sabat Finance" };

export default function Page() {
  return (
    <div className="animate-fade-up">
      <PageHeader title="Nueva venta" subtitle="🛍 Comercial" />
      <VentaForm />
    </div>
  );
}
