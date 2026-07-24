import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { listAgenda } from "@/lib/calendario/queries";
import { formatearFecha } from "@/lib/formato";

export const metadata: Metadata = { title: "Calendario · Sabat Finance" };

export default async function Page() {
  const eventos = await listAgenda(30);

  const porFecha = new Map<string, typeof eventos>();
  for (const e of eventos) {
    const clave = e.fecha.toISOString().slice(0, 10);
    if (!porFecha.has(clave)) porFecha.set(clave, []);
    porFecha.get(clave)!.push(e);
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Calendario" subtitle="Próximos 30 días: cobros, ventas, préstamos y recordatorios" />

      {porFecha.size === 0 ? (
        <EmptyState icon="🗓️" title="Sin eventos próximos" />
      ) : (
        <div className="flex flex-col gap-4">
          {Array.from(porFecha.entries()).map(([fecha, items]) => (
            <div key={fecha}>
              <h3 className="mb-2 text-[13px] font-bold text-muted">{formatearFecha(fecha)}</h3>
              <div className="flex flex-col gap-2">
                {items.map((e, i) =>
                  e.href ? (
                    <Link key={i} href={e.href}>
                      <Card className="flex items-center justify-between p-3 transition-colors hover:bg-hover-bg">
                        <span className="font-semibold">{e.titulo}</span>
                        <span className="text-[12.5px] text-muted">{e.subtitulo}</span>
                      </Card>
                    </Link>
                  ) : (
                    <Card key={i} className="flex items-center justify-between p-3">
                      <span className="font-semibold">{e.titulo}</span>
                      <span className="text-[12.5px] text-muted">{e.subtitulo}</span>
                    </Card>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
