"use client";

import { DIAS, PLAN_FIN, PLAN_INICIO } from "@/lib/sistema/plan";
import { diferenciaDias } from "@/lib/sistema/calculos";
import { useSistema } from "./store";
import { cn } from "@/lib/utils";

/** Las cinco fases, con el tramo en que estás marcado. Las fechas salen del propio plan, no de un texto aparte. */
const FASES = (() => {
  const out: { nombre: string; desde: string; hasta: string; label: string }[] = [];
  for (const d of DIAS) {
    const u = out[out.length - 1];
    if (u && u.nombre === d.ph) {
      u.hasta = d.d;
      u.label = `${u.label.split("–")[0]}–${d.label}`;
    } else out.push({ nombre: d.ph, desde: d.d, hasta: d.d, label: d.label });
  }
  return out;
})();

export function PlanAhora() {
  const { listo, hoy } = useSistema();
  const dentro = hoy >= PLAN_INICIO && hoy <= PLAN_FIN;
  const dia = DIAS.find((d) => d.d === hoy);
  const faltan = diferenciaDias(PLAN_FIN, hoy || PLAN_INICIO);
  const antes = listo && hoy < PLAN_INICIO;

  return (
    <section aria-labelledby="ahora" className="border-y border-[color:var(--border)] py-6">
      <h2 id="ahora" className="text-[14px] font-medium text-faint">
        Dónde estoy
      </h2>
      <p className="mt-1 font-display text-[30px] leading-[1.1] sm:text-[40px]">
        {!listo ? " " : antes ? `Empieza en ${diferenciaDias(PLAN_INICIO, hoy)} ${diferenciaDias(PLAN_INICIO, hoy) === 1 ? "día" : "días"}.` : dentro && dia ? dia.ph : "El plan terminó."}
      </p>
      {listo && dentro ? (
        <p className="mt-1 text-[16px] text-muted">
          Faltan {faltan} {faltan === 1 ? "día" : "días"} para Cartagena.
        </p>
      ) : null}
      <ol className="mt-6 grid gap-x-6 sm:grid-cols-5">
        {FASES.map((f) => {
          const actual = listo && hoy >= f.desde && hoy <= f.hasta;
          const pasada = listo && hoy > f.hasta;
          return (
            <li key={f.nombre} className={cn("border-t py-3", actual ? "border-[color:var(--gold)]" : "border-[color:var(--border)]")}>
              <p className={cn("text-[15px] leading-snug", actual ? "font-medium text-foreground" : pasada ? "text-faint" : "text-muted")}>{f.nombre.replace(/^Fase \d · /, "")}</p>
              <p className="mt-0.5 text-[13px] text-faint">{f.label}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
