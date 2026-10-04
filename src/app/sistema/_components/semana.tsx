"use client";

import { useEffect, useState } from "react";
import { LIBROS, PLAN_INICIO, SEMANA, type Categoria } from "@/lib/sistema/plan";
import { diferenciaDias } from "@/lib/sistema/calculos";
import { FOTOS } from "@/lib/sistema/media";
import { Ventana } from "./ventana";
import { useSistema } from "./store";
import { cn } from "@/lib/utils";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const CORTO = ["L", "M", "X", "J", "V", "S", "D"];

const ETIQUETA: Record<Categoria, string> = {
  fixed: "Clase",
  commute: "Camino",
  gym: "Cuerpo",
  sabat: "Sabat",
  uni: "Universidad",
  dev: "Desarrollo",
  multi: "Hábitos",
  meal: "Comida",
  rev: "Revisión",
  wake: "Rutina",
  libre: "Libre",
};

/** Lo que no se mueve (clases) y lo que se entrena se distinguen; el resto va en tono neutro. */
const BORDE: Partial<Record<Categoria, string>> = {
  fixed: "border-[color:var(--gold)]",
  gym: "border-success",
  sabat: "border-foreground/60",
};
const FONDO: Partial<Record<Categoria, string>> = {
  fixed: "bg-[color:var(--gold)]/10",
  gym: "bg-success/10",
};

const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
const dowDe = (d: Date) => (d.getDay() + 6) % 7;

export function SemanaVista() {
  const { listo, hoy } = useSistema();
  const [dia, setDia] = useState<number | null>(null);
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    const t = new Date();
    setAhora(t);
    const id = window.setInterval(() => setAhora(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const dowHoy = ahora ? dowDe(ahora) : 0;
  const elegido = dia ?? dowHoy;
  const base = hoy && hoy >= PLAN_INICIO ? hoy : PLAN_INICIO;
  const semanaN = Math.max(0, Math.floor(diferenciaDias(base, PLAN_INICIO) / 7));
  const libro = LIBROS[semanaN % LIBROS.length]!;
  const horaAhora = ahora ? ahora.getHours() : -1;

  return (
    <div>
      <section aria-labelledby="libro" className="grid grid-cols-[1fr_96px] items-center gap-4 border-y border-[color:var(--border)] py-5 sm:grid-cols-[1fr_140px]">
        <div>
          <h2 id="libro" className="text-[14px] font-medium text-faint">
            Libro de esta semana
          </h2>
          <p className="mt-1 font-display text-[26px] leading-tight sm:text-[32px]">{listo ? libro : " "}</p>
          <p className="mt-1 text-[15px] text-muted">Rota solo, una vez por semana. Quince minutos al día, sin decidir nada.</p>
        </div>
        <Ventana foto={FOTOS.lectura} className="aspect-[3/4] w-full" sizes="140px" />
      </section>

      {/* teléfono y tableta: un día a la vez */}
      <section aria-label="Horario del día" className="mt-6 lg:hidden">
        <div role="group" aria-label="Día de la semana" className="grid grid-cols-7 border-b border-[color:var(--border)]">
          {CORTO.map((c, i) => {
            const on = i === elegido;
            return (
              <button
                key={c}
                aria-pressed={on}
                aria-label={DIAS[i]}
                onClick={() => setDia(i)}
                className={cn(
                  "relative min-h-12 text-[16px] transition-colors duration-150",
                  on ? "font-medium text-foreground" : "text-muted",
                )}
              >
                {c}
                {listo && i === dowHoy ? <span aria-hidden className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[color:var(--gold)]" /> : null}
                {on ? <span aria-hidden className="absolute inset-x-1 bottom-0 h-[2px] bg-[color:var(--gold)]" /> : null}
              </button>
            );
          })}
        </div>
        <h2 className="mt-5 text-[26px]">{DIAS[elegido]}</h2>
        <ol className="mt-2">
          {SEMANA[elegido]!.map(([h, texto, cat, filas]) => {
            const ahoraMismo = elegido === dowHoy && horaAhora >= h && horaAhora < h + filas;
            return (
              <li key={h} className={cn("grid grid-cols-[3.6rem_1fr] gap-3 border-t border-[color:var(--border)] py-3", ahoraMismo && "bg-[color:var(--bg-subtle)]")}>
                <span className="money pt-0.5 text-[15px] text-faint">{hh(h)}</span>
                <div className={cn("border-l-2 pl-3", BORDE[cat] ?? "border-transparent", FONDO[cat])}>
                  <p className="text-[16px] leading-snug text-foreground">{texto}</p>
                  <p className="mt-0.5 text-[13px] text-faint">
                    {ETIQUETA[cat]}
                    {filas > 1 ? ` · ${hh(h)}–${hh(h + filas)}` : ""}
                    {ahoraMismo ? <span className="ml-2 font-medium text-accent">Ahora</span> : null}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* escritorio: la semana entera, con el día de hoy marcado */}
      <section aria-label="Horario de la semana" className="mt-8 hidden lg:block">
        <TablaSemana dowHoy={listo ? dowHoy : -1} horaAhora={horaAhora} />
      </section>
    </div>
  );
}

function TablaSemana({ dowHoy, horaAhora }: { dowHoy: number; horaAhora: number }) {
  const saltar: Record<string, true> = {};
  const filas: React.ReactNode[] = [];
  for (let h = 5; h <= 22; h++) {
    filas.push(
      <tr key={h} className={cn(h === horaAhora && "bg-[color:var(--bg-subtle)]")}>
        <th scope="row" className="money w-14 border-t border-[color:var(--border)] py-2 pr-2 text-left align-top text-[13px] font-normal text-faint">
          {hh(h)}
        </th>
        {SEMANA.map((col, ci) => {
          if (saltar[`${ci}-${h}`]) return null;
          const b = col.find((x) => x[0] === h);
          if (!b) return <td key={ci} className="border-t border-[color:var(--border)]" />;
          for (let k = 1; k < b[3]; k++) saltar[`${ci}-${h + k}`] = true;
          return (
            <td
              key={ci}
              rowSpan={b[3]}
              className={cn(
                "border-l border-t border-[color:var(--border)] px-2.5 py-2 align-top text-[13px] leading-snug text-muted",
                FONDO[b[2]],
                ci === dowHoy && "text-foreground",
              )}
            >
              {b[1]}
            </td>
          );
        })}
      </tr>,
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] table-fixed border-collapse">
        <thead>
          <tr>
            <th className="w-14" />
            {DIAS.map((d, i) => (
              <th key={d} scope="col" className={cn("px-2.5 pb-3 text-left text-[15px] font-medium", i === dowHoy ? "text-accent" : "text-foreground")}>
                {d}
                {i === dowHoy ? <span className="ml-2 text-[13px] font-normal">hoy</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{filas}</tbody>
      </table>
    </div>
  );
}
