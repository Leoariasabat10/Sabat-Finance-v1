import Link from "next/link";
import type { InsightsNegocio } from "@/lib/inteligencia/insights";

/**
 * "Clientes" responde ¿a quién le puedo volver a prestar y a quién no? —
 * esta franja es la interpretación agregada de esa pregunta, no una
 * repetición del listado de abajo. Solo se muestran las tarjetas que
 * tienen un candidato real; nunca se rellena con "sin datos".
 */
export function InsightsStrip({ insights }: { insights: InsightsNegocio }) {
  const tarjetas = [insights.mayorRiesgo, insights.masRentable, insights.masPuntual, insights.capitalRetenidoMasAntiguo].filter(
    (i): i is NonNullable<typeof i> => i !== null,
  );

  if (tarjetas.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap gap-2.5">
      {tarjetas.map((t) => (
        <Link
          key={t.etiqueta}
          href={t.href}
          className="flex min-w-[190px] flex-1 flex-col gap-0.5 rounded-xl border border-[color:var(--border)] bg-card px-3.5 py-2.5 transition-colors duration-premium hover:bg-hover-bg"
        >
          <span className="text-[11px] font-bold text-muted">{t.etiqueta}</span>
          <span className="text-[13.5px] font-bold text-foreground">{t.nombre}</span>
          <span className="text-[12px] text-muted">{t.detalle}</span>
        </Link>
      ))}
    </div>
  );
}
