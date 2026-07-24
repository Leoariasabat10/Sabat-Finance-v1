import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db";
import { ConfiguracionForm } from "./_components/configuracion-form";

export const metadata: Metadata = { title: "Configuración · Sabat Finance" };

export default async function Page() {
  const config = await prisma.configuracion.findUnique({ where: { id: 1 } });

  const valoresIniciales = {
    nombreNegocio: config?.nombreNegocio ?? "Sabat Finance",
    moneda: config?.moneda ?? "COP",
    tasaInteresDefecto: Number(config?.tasaInteresDefecto ?? 10),
    diasAlertaVencimiento: config?.diasAlertaVencimiento ?? 3,
    tasaMoraDefecto: Number(config?.tasaMoraDefecto ?? 0),
    tipoMora: config?.tipoMora ?? ("porcentaje_diario" as const),
    ordenAplicacionPago: config?.ordenAplicacionPago ?? ("interes_primero" as const),
    capitalInicial: Number(config?.capitalInicial ?? 0),
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Configuración" subtitle="Parámetros del negocio" />
      <ConfiguracionForm valoresIniciales={valoresIniciales} />
    </div>
  );
}
