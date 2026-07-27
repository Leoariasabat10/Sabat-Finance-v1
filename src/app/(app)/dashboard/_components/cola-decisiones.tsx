import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { TarjetaDecision } from "@/lib/dashboard/colaDecisiones";

const BORDE_TONO: Record<TarjetaDecision["tono"], string> = {
  danger: "border-l-danger",
  warning: "border-l-warning",
  success: "border-l-success",
  info: "border-l-accent",
};

const TEXTO_TONO: Record<TarjetaDecision["tono"], string> = {
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
  info: "text-accent",
};

const BOTON_TONO: Record<TarjetaDecision["tono"], string> = {
  danger: "bg-danger text-white hover:opacity-90",
  warning: "bg-warning text-white hover:opacity-90",
  success: "bg-success text-white hover:opacity-90",
  info: "bg-accent text-white hover:opacity-90",
};

/**
 * Visión final del producto, sección 2: "Hoy" no muestra datos — entrega
 * un cupo fijo de máximo 4 decisiones ya priorizadas, cada una resuelta en
 * un toque. Ver lib/dashboard/colaDecisiones.ts para el criterio de orden.
 */
export function ColaDecisiones({ tarjetas }: { tarjetas: TarjetaDecision[] }) {
  if (tarjetas.length === 0) {
    return (
      <Card className="p-5">
        <p className="text-[14px] font-semibold text-foreground">✅ Nada urgente hoy.</p>
        <p className="mt-1 text-[13px] text-muted">Sin cobros vencidos, sin capital retenido nuevo, todo al día.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {tarjetas.map((t, i) => {
        const esExterno = t.boton.href.startsWith("http");
        return (
          <Card key={i} className={`flex flex-wrap items-center justify-between gap-3 border-l-4 p-4 ${BORDE_TONO[t.tono]}`}>
            <div>
              <p className={`text-[13px] font-bold uppercase tracking-wide ${TEXTO_TONO[t.tono]}`}>{t.etiqueta}</p>
              <p className="mt-0.5 text-[14px] text-foreground">{t.texto}</p>
            </div>
            <Link
              href={t.boton.href}
              target={esExterno ? "_blank" : undefined}
              rel={esExterno ? "noopener noreferrer" : undefined}
              className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-opacity duration-premium ${BOTON_TONO[t.tono]}`}
            >
              {t.boton.texto}
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
