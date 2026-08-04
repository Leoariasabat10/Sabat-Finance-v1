import type { MesSerie } from "@/lib/dashboard/queries";
import { formatearMoneda } from "@/lib/formato";

function points(values: number[], maximo: number, width: number, height: number, padding: number) {
  return values
    .map((valor, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
      const y = height - padding - (valor / maximo) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Gráfica financiera SVG: legible, ligera y sin dependencia de una librería de charts. */
export function FinanzasChart({ datos }: { datos: MesSerie[] }) {
  const width = 640;
  const height = 220;
  const padding = 20;
  const maximo = Math.max(1, ...datos.flatMap((d) => [d.ingresos, d.egresos]));
  const ingresos = points(datos.map((d) => d.ingresos), maximo, width, height, padding);
  const egresos = points(datos.map((d) => d.egresos), maximo, width, height, padding);

  return (
    <div className="overflow-x-auto pb-1">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[510px] w-full" role="img" aria-label="Ingresos y egresos de caja de los últimos seis meses">
        <defs>
          <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--danger)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.2, 0.5, 0.8].map((ratio) => (
          <line key={ratio} x1={padding} x2={width - padding} y1={height * ratio} y2={height * ratio} stroke="var(--border)" strokeDasharray="3 5" />
        ))}
        <polygon points={`${padding},${height - padding} ${ingresos} ${width - padding},${height - padding}`} fill="url(#incomeFill)" />
        <polygon points={`${padding},${height - padding} ${egresos} ${width - padding},${height - padding}`} fill="url(#expenseFill)" />
        <polyline points={ingresos} fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={egresos} fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {datos.map((d, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(datos.length - 1, 1);
          const yIngreso = height - padding - (d.ingresos / maximo) * (height - padding * 2);
          const yEgreso = height - padding - (d.egresos / maximo) * (height - padding * 2);
          return (
            <g key={d.mes}>
              <title>{`${d.mes}: ingresos ${formatearMoneda(d.ingresos)}, egresos ${formatearMoneda(d.egresos)}`}</title>
              <circle cx={x} cy={yIngreso} r="4" fill="var(--bg-card)" stroke="var(--success)" strokeWidth="2.5" />
              <circle cx={x} cy={yEgreso} r="3.5" fill="var(--bg-card)" stroke="var(--danger)" strokeWidth="2" />
              <text x={x} y={height - 1} textAnchor="middle" fill="var(--text-3)" fontSize="12" className="capitalize">{d.mes}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
