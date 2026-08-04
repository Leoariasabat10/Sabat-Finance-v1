import type { Metadata } from "next";
import { Landmark } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db";
import { PrestamoForm } from "../_components/prestamo-form";

export const metadata: Metadata = { title: "Nuevo préstamo · Sabat Finance" };

export default async function Page() {
  // La tasa por defecto sale de Configuración — un solo lugar de verdad.
  const config = await prisma.configuracion.findUnique({
    where: { id: 1 },
    select: { tasaInteresDefecto: true },
  });
  const tasaDefecto = Number(config?.tasaInteresDefecto ?? 10);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Nuevo préstamo"
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <Landmark className="h-3.5 w-3.5 text-accent" aria-hidden /> Financiero
          </span>
        }
      />
      <PrestamoForm tasaDefecto={tasaDefecto} />
    </div>
  );
}
