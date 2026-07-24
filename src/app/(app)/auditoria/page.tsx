import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Auditoría · Sabat Finance" };

const nombreTabla: Record<string, string> = {
  clientes: "Cliente",
  operaciones_credito: "Operación de crédito",
  cuotas: "Cuota",
  pagos: "Pago",
  ventas: "Venta",
  venta_items: "Artículo de venta",
  movimientos_caja: "Movimiento de caja",
  refinanciaciones: "Refinanciación",
  configuracion: "Configuración",
  whatsapp_plantillas: "Plantilla WhatsApp",
  whatsapp_mensajes: "Mensaje WhatsApp",
};

const nombreAccion: Record<string, { texto: string; variante: "success" | "info" | "danger" }> = {
  INSERT: { texto: "Creación", variante: "success" },
  UPDATE: { texto: "Modificación", variante: "info" },
  DELETE: { texto: "Borrado", variante: "danger" },
};

export default async function Page() {
  const eventos = await prisma.auditoria.findMany({
    orderBy: { fecha: "desc" },
    take: 100,
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Auditoría"
        subtitle="Cada creación, cambio o borrado queda registrado automáticamente"
      />

      {eventos.length === 0 ? (
        <EmptyState
          icon="🕵️"
          title="Sin actividad registrada todavía"
          description="Cuando crees o modifiques préstamos, ventas, pagos o clientes, cada cambio aparecerá aquí."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col divide-y divide-[color:var(--border)]">
              {eventos.map((e) => {
                const accion = nombreAccion[e.accion] ?? { texto: e.accion, variante: "info" as const };
                return (
                  <div key={String(e.id)} className="flex flex-wrap items-center justify-between gap-3 px-[18px] py-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={accion.variante}>{accion.texto}</Badge>
                      <span className="text-[13px] font-semibold text-foreground">
                        {nombreTabla[e.tabla] ?? e.tabla}
                      </span>
                    </div>
                    <span className="text-[12px] text-muted">
                      {e.fecha.toLocaleString("es-CO", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
