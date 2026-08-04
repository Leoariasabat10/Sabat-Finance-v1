import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { BotonWhatsApp } from "@/components/shared/boton-whatsapp";
import { StaggerList, StaggerItem } from "@/components/shared/motion";
import { getContactosHoy } from "@/lib/whatsapp/queries";
import { formatearMoneda } from "@/lib/formato";

export const metadata: Metadata = { title: "WhatsApp · Sabat Finance" };

/**
 * WhatsApp simplificado (27 jul 2026): esta pantalla ya no es una consola
 * técnica de plantillas y proveedores — responde una sola pregunta: "¿a
 * quién le escribo hoy y qué le digo?". El mensaje ya sale escrito; un clic
 * en "Abrir WhatsApp" abre el chat real del cliente (WhatsApp Web en
 * computador, la app en el celular) sin pasos intermedios.
 */
export default async function Page() {
  const contactos = await getContactosHoy();

  return (
    <div className="animate-fade-up flex flex-col gap-5">
      <PageHeader title="WhatsApp" subtitle="Clientes que deberías contactar hoy" />

      {contactos.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-10 w-10 text-faint" />}
          title="Nadie por contactar hoy"
          description="No hay pagos vencidos ni que venzan hoy."
        />
      ) : (
        <StaggerList className="flex flex-col gap-3">
          {contactos.map((c) => (
            <StaggerItem key={c.operacionId}>
              <Card className="flex flex-col gap-3 p-4 transition-all duration-premium ease-premium hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground">{c.clienteNombre}</p>
                    <Badge variant={c.motivo.startsWith("Pago vencido") ? "danger" : "warning"}>{c.motivo}</Badge>
                    <span className="font-mono text-[12.5px] font-semibold tabular-nums text-muted">{formatearMoneda(c.monto)}</span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-[12.5px] text-muted">{c.mensaje}</p>
                </div>
                <BotonWhatsApp numero={c.clienteWhatsapp} mensaje={c.mensaje} etiqueta="Abrir WhatsApp" variant="primary" size="default" />
              </Card>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  );
}
