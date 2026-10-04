"use client";

import Link from "next/link";
import { useState } from "react";
import { PLAN_FIN, PLAN_INICIO } from "@/lib/sistema/plan";
import { diferenciaDias } from "@/lib/sistema/calculos";
import type { Revision } from "@/lib/sistema/storage";
import { useSistema } from "./store";
import { cn } from "@/lib/utils";

const SEMANAS = [
  { n: "1", etiqueta: "Semana 1", cuando: "5–11 oct" },
  { n: "2", etiqueta: "Semana 2", cuando: "12–18 oct" },
  { n: "3", etiqueta: "Semana 3", cuando: "19–25 oct" },
  { n: "4", etiqueta: "Semana 4", cuando: "26 oct–1 nov" },
  { n: "5", etiqueta: "Semana 5", cuando: "2–8 nov" },
  { n: "6", etiqueta: "Cartagena", cuando: "9–12 nov" },
] as const;

const PREGUNTAS: { k: keyof Revision; pregunta: string; ayuda: string }[] = [
  { k: "hice", pregunta: "¿Qué hice?", ayuda: "Lo que cumpliste, sin adornos." },
  { k: "noHice", pregunta: "¿Qué no hice?", ayuda: "Lo que quedó sin hacer, sin excusas." },
  { k: "corregir", pregunta: "¿Qué corrijo?", ayuda: "Un solo ajuste para la semana que viene." },
  { k: "funciono", pregunta: "¿Qué funcionó?", ayuda: "Lo que se repite." },
];

export function SemanalVista() {
  const { listo, hoy, datos, setRevision } = useSistema();
  const base = !hoy ? PLAN_INICIO : hoy < PLAN_INICIO ? PLAN_INICIO : hoy > PLAN_FIN ? PLAN_FIN : hoy;
  const actual = Math.min(6, Math.floor(diferenciaDias(base, PLAN_INICIO) / 7) + 1);
  const [elegida, setElegida] = useState<string | null>(null);
  const n = elegida ?? String(actual);
  const rev = datos.revisiones[n] ?? {};
  const respondidas = PREGUNTAS.filter((p) => (rev[p.k] ?? "").trim() !== "").length;

  return (
    <section aria-labelledby="revision">
      <h2 id="revision" className="text-[28px]">
        La revisión
      </h2>
      <p className="lead-italic mt-1 text-[18px] text-muted">Cuatro preguntas, cada domingo. Corto y honesto.</p>

      <div role="group" aria-label="Semana del plan" className="-mx-5 mt-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {SEMANAS.map((s) => {
          const on = s.n === n;
          const llena = Object.values(datos.revisiones[s.n] ?? {}).some((v) => (v ?? "").trim() !== "");
          return (
            <button
              key={s.n}
              aria-pressed={on}
              onClick={() => setElegida(s.n)}
              className={cn(
                "relative min-h-12 shrink-0 border-b px-4 text-left transition-colors duration-150",
                on ? "border-[color:var(--gold)] text-foreground" : "border-[color:var(--border)] text-muted",
              )}
            >
              <span className="block text-[15px] leading-tight">{s.etiqueta}</span>
              <span className="block text-[12px] text-faint">
                {s.cuando}
                {llena ? " · escrita" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <div className={cn("mt-6 flex flex-col gap-6", !listo && "opacity-60")}>
        {PREGUNTAS.map((p) => (
          <div key={p.k} className="flex flex-col gap-1.5">
            <label htmlFor={`rev-${p.k}`} className="font-display text-[22px] leading-tight">
              {p.pregunta}
            </label>
            <p id={`rev-${p.k}-ayuda`} className="text-[14px] text-faint">
              {p.ayuda}
            </p>
            <textarea
              id={`rev-${p.k}`}
              aria-describedby={`rev-${p.k}-ayuda`}
              value={rev[p.k] ?? ""}
              onChange={(e) => setRevision(n, { [p.k]: e.target.value })}
              rows={3}
              maxLength={600}
              className="mt-1 w-full resize-y border border-[color:var(--border-md)] bg-transparent px-4 py-3 text-[17px] leading-relaxed text-foreground outline-none transition-colors focus-visible:border-[color:var(--gold)]"
            />
          </div>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-faint" aria-live="polite">
        {respondidas} de 4 respondidas · se guarda sola. Peso y cintura van en{" "}
        <Link href="/sistema/cuerpo" className="text-accent underline-offset-4 hover:underline">
          Cuerpo
        </Link>
        .
      </p>
    </section>
  );
}
