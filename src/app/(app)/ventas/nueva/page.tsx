import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { VentaForm } from "../_components/venta-form";

export const metadata: Metadata = { title: "Nueva venta · Sabat Finance" };

export default function Page() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Nueva venta"
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-success" aria-hidden /> Comercial
          </span>
        }
      />
      <VentaForm />
    </div>
  );
}
