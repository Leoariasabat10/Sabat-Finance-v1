import type { Metadata } from "next";
import { Landmark, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { listCobrar } from "@/lib/cobrar/queries";
import { listCartera } from "@/lib/pagos/queries";
import { listAgenda } from "@/lib/calendario/queries";
import { prisma } from "@/lib/db";
import { formatearMoneda } from "@/lib/formato";
import { CobrarView } from "./_components/cobrar-view";

export const metadata: Metadata = { title: "Cobrar · Sabat Finance" };

export default async function Page() {
  const config = await prisma.configuracion.findUnique({ where: { id: 1 } });

  const [cobrar, cartera, eventos] = await Promise.all([
    listCobrar(config?.diasAlertaVencimiento ?? 3),
    listCartera(),
    listAgenda(30),
  ]);

  const totalFinanciero = cartera.filter((c) => c.origen === "prestamo").reduce((a, c) => a + c.saldoPendiente, 0);
  const totalComercial = cartera.filter((c) => c.origen === "venta").reduce((a, c) => a + c.saldoPendiente, 0);

  return (
    <div className="animate-fade-up flex flex-col gap-5">
      <PageHeader
        title="Cobrar"
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-1">
            Vencidos, próximos y calendario — cartera
            <Landmark className="h-3.5 w-3.5 text-accent" aria-hidden /> Financiero +
            <ShoppingBag className="h-3.5 w-3.5 text-success" aria-hidden /> Comercial, siempre desagregada
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
            <Landmark className="h-3.5 w-3.5 text-accent" aria-hidden /> Saldo por cobrar — Financiero
          </p>
          <p className="font-mono text-xl font-bold tabular-nums">{formatearMoneda(totalFinanciero)}</p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
            <ShoppingBag className="h-3.5 w-3.5 text-success" aria-hidden /> Saldo por cobrar — Comercial
          </p>
          <p className="font-mono text-xl font-bold tabular-nums">{formatearMoneda(totalComercial)}</p>
        </Card>
      </div>

      <CobrarView cobrar={cobrar} cartera={cartera} eventos={eventos} />
    </div>
  );
}
