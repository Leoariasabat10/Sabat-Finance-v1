import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { listPlantillas, listMensajes } from "@/lib/whatsapp/queries";
import { formatearFecha } from "@/lib/formato";
import { PlantillaItem } from "./_components/plantilla-item";
import { ResumenDiarioButton } from "./_components/resumen-diario-button";

export const metadata: Metadata = { title: "WhatsApp · Sabat Finance" };

export default async function Page() {
  const [plantillas, mensajes] = await Promise.all([listPlantillas(), listMensajes()]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="WhatsApp"
        subtitle="Plantillas, cola de mensajes y resumen diario"
        actions={<ResumenDiarioButton />}
      />

      <Card className="mb-5">
        <CardContent>
          <p className="text-[12.5px] text-foreground">
            Todavía no hay un proveedor de WhatsApp (Twilio/360dialog) conectado — los mensajes se registran en
            la cola como "pendiente" en vez de enviarse de verdad. Cuando tengas las credenciales del proveedor,
            se conectan en <code>lib/whatsapp/EnviadorMensajes.ts</code> sin tocar el resto de la app.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="plantillas">
        <TabsList>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="cola">Cola de mensajes ({mensajes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="plantillas" className="flex flex-col gap-3">
          {plantillas.map((p) => (
            <PlantillaItem key={p.id} id={p.id} nombre={p.nombre} evento={p.evento} cuerpoInicial={p.cuerpo} activaInicial={p.activa} />
          ))}
        </TabsContent>

        <TabsContent value="cola">
          <Card>
            <CardContent>
              {mensajes.length === 0 ? (
                <EmptyState icon="💬" title="Sin mensajes en cola" />
              ) : (
                <div className="flex flex-col divide-y divide-[color:var(--border)]">
                  {mensajes.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-2.5 text-[13px]">
                      <div>
                        <p className="font-semibold">{m.cliente?.nombre ?? "Resumen diario"}</p>
                        <p className="text-[12px] text-muted">{m.mensajeFinal}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={m.estadoEnvio === "enviado" ? "success" : m.estadoEnvio === "fallido" ? "danger" : "warning"}>
                          {m.estadoEnvio}
                        </Badge>
                        <p className="mt-1 text-[11px] text-muted">{formatearFecha(m.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
