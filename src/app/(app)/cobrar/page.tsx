import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { listCobrar } from "@/lib/cobrar/queries";
import { listCartera } from "@/lib/pagos/queries";
import { listAgenda } from "@/lib/calendario/queries";
import { prisma } from "@/lib/db";
import { CobrarView } from "./_components/cobrar-view";

export const metadata: Metadata = { title: "Cobros · Sabat Finance" };

export default async function Page() {
  const config = await prisma.configuracion.findUnique({ where: { id: 1 } });

  const [cobrar, cartera, eventos] = await Promise.all([
    listCobrar(config?.diasAlertaVencimiento ?? 3),
    listCartera(),
    listAgenda(30),
  ]);

  return (
    <div className="animate-fade-up flex flex-col gap-5">
      <PageHeader title="Cobros" subtitle="Quién debe pagar, cuánto y cuándo." />

      <CobrarView cobrar={cobrar} cartera={cartera} eventos={eventos} />
    </div>
  );
}
