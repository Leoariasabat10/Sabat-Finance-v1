import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrigenIcon } from "@/components/shared/origen-icon";
import { getOperacionParaPago } from "@/lib/pagos/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { PagoForm } from "../_components/pago-form";

export const metadata: Metadata = { title: "Registrar pago · Sabat Finance" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ operacion?: string }>;
}) {
  const { operacion: operacionId } = await searchParams;
  if (!operacionId) notFound();

  const operacion = await getOperacionParaPago(operacionId);
  if (!operacion) notFound();

  return (
    <div className="animate-fade-up mx-auto flex max-w-lg flex-col gap-5">
      <PageHeader
        title="Registrar pago"
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <OrigenIcon origen={operacion.origen} />
            {operacion.origen === "prestamo" ? "Financiero" : "Comercial"}
          </span>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-2">
          <p className="text-xl font-bold">{operacion.clienteNombre}</p>
          <p className="text-[13px] text-muted">{operacion.clienteWhatsapp}</p>
          {operacion.producto ? <p className="text-[13px] text-muted">{operacion.producto}</p> : null}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px]">
            <span>
              Saldo: <strong>{formatearMoneda(operacion.saldoPendiente)}</strong>
            </span>
            {operacion.proximaCuota ? (
              <span>
                Cuota #{operacion.proximaCuota.numero}: <strong>{formatearMoneda(operacion.proximaCuota.saldo)}</strong>{" "}
                (vence {formatearFecha(operacion.proximaCuota.vencimiento)})
              </span>
            ) : null}
            {operacion.diasAtraso > 0 ? <Badge variant="danger">{operacion.diasAtraso}d de atraso</Badge> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <PagoForm operacionId={operacion.id} saldoPendiente={operacion.saldoPendiente} origen={operacion.origen} />
        </CardContent>
      </Card>
    </div>
  );
}
