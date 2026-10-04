"use client";

import { DIAS, RUTINAS, type Rutina } from "@/lib/sistema/plan";
import { PLAN_FIN, PLAN_INICIO } from "@/lib/sistema/plan";
import { useSistema } from "./store";

const nf = new Intl.NumberFormat("es-CO");
/** Qué rutina corresponde a cada tipo de día del plan. Las demás (W, R, X, V) no llevan rutina. */
const RUTINA_DE: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, T: 4, L: 5 };

export function Ejercicios({ r }: { r: Rutina }) {
  return (
    <ul>
      {r.ejercicios.map((e, i) => (
        <li key={i} className="border-t border-[color:var(--border)] py-4">
          <p className="text-[18px] leading-snug text-foreground">{e.nombre}</p>
          <p className="money mt-1 text-[15px] text-accent">
            {e.series} <span className="text-faint">· descanso {e.descanso}</span>
          </p>
          <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-muted">{e.tecnica}</p>
          <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-faint">
            <span className="text-muted">Cuando te sobre:</span> {e.progresion}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function EntrenarHoy() {
  const { listo, hoy } = useSistema();
  const iso = !hoy ? PLAN_INICIO : hoy < PLAN_INICIO ? PLAN_INICIO : hoy > PLAN_FIN ? PLAN_FIN : hoy;
  const d = DIAS.find((x) => x.d === iso) ?? DIAS[0]!;
  const rutina = RUTINA_DE[d.key] !== undefined ? RUTINAS[RUTINA_DE[d.key]!] : null;
  const dentro = hoy >= PLAN_INICIO && hoy <= PLAN_FIN;

  return (
    <section aria-labelledby="toca-entrenar" className="border-y border-[color:var(--border)] py-6">
      <h2 id="toca-entrenar" className="text-[14px] font-medium text-faint">
        {!listo ? " " : dentro ? "Hoy toca" : hoy < PLAN_INICIO ? "El primer día toca" : "El último día tocó"}
      </h2>
      <p className="mt-1 font-display text-[34px] leading-[1.05] sm:text-[44px]">{listo ? d.wo : " "}</p>
      {listo ? (
        <>
          <p className="mt-2 text-[16px] text-muted">{d.woWhen}</p>
          <p className="mt-1 text-[15px] text-faint">
            {nf.format(d.steps)} pasos · {d.cardio}
          </p>
        </>
      ) : null}
      {listo && rutina ? (
        <details open className="group mt-6 border-t border-[color:var(--border)]">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between py-3 [&::-webkit-details-marker]:hidden">
            <span className="text-[20px]">La rutina de hoy</span>
            <span className="text-[14px] text-accent group-open:hidden">Ver</span>
            <span className="hidden text-[14px] text-accent group-open:inline">Ocultar</span>
          </summary>
          <Ejercicios r={rutina} />
        </details>
      ) : listo ? (
        <p className="lead-italic mt-5 text-[19px] text-muted">Hoy no hay rutina. Camina, mueve el cuerpo suave y descansa lo que toca.</p>
      ) : null}
    </section>
  );
}
