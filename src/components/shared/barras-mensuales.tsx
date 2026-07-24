import type { MesSerie } from "@/lib/dashboard/queries";

/**
 * Gráfica simple de ingresos vs egresos por mes, en SVG puro (sin librería
 * externa) — evita depender de un paquete de charts para una sola vista.
 */
export function BarrasMensuales({ datos }: { datos: MesSerie[] }) {
  const maximo = Math.max(1, ...datos.flatMap((d) => [d.ingresos, d.egresos]));
  const alturaMax = 120;

  return (
    <div className="flex items-end justify-between gap-3" style={{ height: alturaMax + 40 }}>
      {datos.map((d) => (
        <div key={d.mes} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex h-[120px] items-end gap-1">
            <div
              className="w-3.5 rounded-t-sm bg-success"
              style={{ height: Math.max(2, (d.ingresos / maximo) * alturaMax) }}
              title={`Ingresos: ${d.ingresos.toLocaleString("es-CO")}`}
            />
            <div
              className="w-3.5 rounded-t-sm bg-danger"
              style={{ height: Math.max(2, (d.egresos / maximo) * alturaMax) }}
              title={`Egresos: ${d.egresos.toLocaleString("es-CO")}`}
            />
          </div>
          <span className="text-[11px] capitalize text-muted">{d.mes}</span>
        </div>
      ))}
    </div>
  );
}
