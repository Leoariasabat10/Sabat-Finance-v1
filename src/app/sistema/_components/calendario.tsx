"use client";

import { useEffect, useRef } from "react";
import { DIAS } from "@/lib/sistema/plan";
import { useSistema } from "./store";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("es-CO");

/** Los 39 días en una lista: qué toca, y cuáles ya cumpliste. El de hoy aparece marcado y se centra al abrir. */
export function CalendarioVista() {
  const { listo, hoy, datos } = useSistema();
  const marca = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (listo) marca.current?.scrollIntoView({ block: "center" });
  }, [listo]);

  let semana = 0;
  return (
    <ol>
      {DIAS.map((d) => {
        const cab = d.wk !== semana ? ((semana = d.wk), true) : false;
        const esHoy = d.d === hoy;
        const pasado = listo && d.d < hoy;
        const cumplida = datos.dias[d.d]?.hecha === true;
        return (
          <li key={d.d} ref={esHoy ? marca : undefined} className="scroll-mt-32">
            {cab ? (
              <p className="mb-1 mt-9 text-[14px] font-medium text-accent first:mt-0">
                Semana {d.wk} · {d.ph.replace(/^Fase \d · /, "")}
              </p>
            ) : null}
            <div className={cn("grid grid-cols-[4.4rem_1fr_auto] items-baseline gap-x-3 border-t border-[color:var(--border)] py-3", esHoy && "border-l-2 border-l-[color:var(--gold)] bg-[color:var(--bg-subtle)] pl-3")}>
              <p className={cn("text-[15px]", esHoy ? "font-medium text-foreground" : pasado ? "text-faint" : "text-muted")}>
                {d.dn} {d.label}
              </p>
              <div className="min-w-0">
                <p className={cn("text-[16px] leading-snug", pasado ? "text-faint" : "text-foreground")}>{d.wo}</p>
                <p className="mt-0.5 text-[14px] leading-snug text-faint">
                  {nf.format(d.steps)} pasos · {d.goal}
                </p>
              </div>
              <p className={cn("text-[13px] font-medium", cumplida ? "text-success" : esHoy ? "text-accent" : "text-transparent")} aria-hidden={!cumplida && !esHoy}>
                {cumplida ? "Cumplido" : esHoy ? "Hoy" : "·"}
              </p>
            </div>
          </li>
        );
      })}
      <li className="border-t border-[color:var(--border)]" aria-hidden />
    </ol>
  );
}
