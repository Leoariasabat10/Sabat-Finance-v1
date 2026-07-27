import type { Metadata } from "next";
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
      <PageHeader title="Cobrar" subtitle="Vencidos, próximos y calendario — cartera 🏦 Financiero + 🛍 Comercial, siempre desagregada" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-muted">🏦 Saldo por cobrar — Financiero</p>
          <p className="font-mono text-xl font-bold tabular-nums">{formatearMoneda(totalFinanciero)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-muted">🛍 Saldo por cobrar — Comercial</p>
          <p className="font-mono text-xl font-bold tabular-nums">{formatearMoneda(totalComercial)}</p>
        </Card>
      </div>

      <CobrarView cobrar={cobrar} cartera={cartera} eventos={eventos} />
    </div>
  );
}
