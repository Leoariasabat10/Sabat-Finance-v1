import Link from "next/link";
import { AlertTriangle, TrendingUp, CheckCircle2, Lock, RefreshCw, type LucideIcon } from "lucide-react";
import type { InsightsNegocio, InsightCliente } from "@/lib/inteligencia/insights";

const ICONO_TIPO: Record<InsightCliente["tipo"], LucideIcon> = {
  riesgo: AlertTriangle,
  rentable: TrendingUp,
  puntual: CheckCircle2,
  retenido: Lock,
  reendeudamiento: RefreshCw,
};

const COLOR_TIPO: Record<InsightCliente["tipo"], string> = {
  riesgo: "text-danger",
  rentable: "text-success",
  puntual: "text-success",
  retenido: "text-warning",
  reendeudamiento: "text-warning",
};

/**
 * "Clientes" responde ¿a quién le puedo volver a prestar y a quién no? —
 * esta franja es la interpretación agregada de esa pregunta, no una
 * repetición del listado de abajo. Solo se muestran las tarjetas que
 * tienen un candidato real; nunca se rellena con "sin datos".
 */
export function InsightsStrip({ insights }: { insights: InsightsNegocio }) {
  const tarjetas = [
    insights.mayorRiesgo,
    insights.masRentable,
    insights.masPuntual,
    insights.capitalRetenidoMasAntiguo,
    insights.reendeudamientoActivo,
  ].filter((i): i is NonNullable<typeof i> => i !== null);

  if (tarjetas.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap gap-2.5">
      {tarjetas.map((t) => {
        const Icon = ICONO_TIPO[t.tipo];
        return (
          <Link
            key={t.etiqueta}
            href={t.href}
            className="flex min-w-[190px] flex-1 flex-col gap-0.5 rounded-xl border border-[color:var(--border)] bg-card px-3.5 py-2.5 transition-colors duration-premium hover:bg-hover-bg"
          >
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${COLOR_TIPO[t.tipo]}`}>
              <Icon className="h-3 w-3" aria-hidden /> {t.etiqueta}
            </span>
            <span className="text-[13.5px] font-bold text-foreground">{t.nombre}</span>
            <span className="text-[12px] text-muted">{t.detalle}</span>
          </Link>
        );
      })}
    </div>
  );
}
