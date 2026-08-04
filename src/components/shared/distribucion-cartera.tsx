import { Landmark, ShoppingBag } from "lucide-react";
import { formatearMoneda } from "@/lib/formato";

/** Anillo de cartera: mantiene visible la separación obligatoria entre préstamo y venta. */
export function DistribucionCartera({ financiero, comercial }: { financiero: number; comercial: number }) {
  const total = financiero + comercial;
  const porcentaje = total > 0 ? Math.round((financiero / total) * 100) : 0;
  const radio = 42;
  const circunferencia = 2 * Math.PI * radio;
  const tramo = (porcentaje / 100) * circunferencia;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 112 112" className="h-28 w-28 shrink-0" role="img" aria-label="Distribución de cartera entre financiero y comercial">
        <circle cx="56" cy="56" r={radio} fill="none" stroke="var(--bg-hover)" strokeWidth="13" />
        {total > 0 ? <circle cx="56" cy="56" r={radio} fill="none" stroke="var(--accent)" strokeWidth="13" strokeLinecap="round" strokeDasharray={`${tramo} ${circunferencia - tramo}`} transform="rotate(-90 56 56)" /> : null}
        <text x="56" y="53" textAnchor="middle" fill="var(--text)" fontSize="18" fontWeight="700">{porcentaje}%</text>
        <text x="56" y="69" textAnchor="middle" fill="var(--text-3)" fontSize="10">financiero</text>
      </svg>
      <div className="min-w-0 space-y-2 text-[12px]">
        <p className="flex items-center gap-1.5 font-semibold text-foreground"><Landmark className="h-3.5 w-3.5 text-accent" aria-hidden /> Financiero <span className="ml-auto font-mono tabular-nums">{formatearMoneda(financiero)}</span></p>
        <p className="flex items-center gap-1.5 font-semibold text-foreground"><ShoppingBag className="h-3.5 w-3.5 text-success" aria-hidden /> Comercial <span className="ml-auto font-mono tabular-nums">{formatearMoneda(comercial)}</span></p>
      </div>
    </div>
  );
}
