import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Simulador } from "../_components/simulador";

export const metadata: Metadata = { title: "Analizar compra · Sabat Finance" };

export default function Page() {
  return (
    <>
      <PageHeader title="Analizar compra" subtitle="Antes de pagar un lote: cuánto cuesta de verdad cada quilate." />
      <Simulador />
    </>
  );
}
