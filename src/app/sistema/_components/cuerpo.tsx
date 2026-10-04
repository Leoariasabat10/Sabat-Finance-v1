"use client";

import { useState } from "react";
import { aNumero, serie, tendencia, type PuntoMedida } from "@/lib/sistema/calculos";
import type { Medida } from "@/lib/sistema/storage";
import { useSistema } from "./store";
import { cn } from "@/lib/utils";

/** Las siete mediciones del plan: el domingo de cada semana, más el cierre. Son las que ya definía el sistema. */
export const FILAS = [
  { n: "0", etiqueta: "Inicio", fecha: "2026-10-05", cuando: "5 oct" },
  { n: "1", etiqueta: "Semana 1", fecha: "2026-10-11", cuando: "11 oct" },
  { n: "2", etiqueta: "Semana 2", fecha: "2026-10-18", cuando: "18 oct" },
  { n: "3", etiqueta: "Semana 3", fecha: "2026-10-25", cuando: "25 oct" },
  { n: "4", etiqueta: "Semana 4", fecha: "2026-11-01", cuando: "1 nov" },
  { n: "5", etiqueta: "Semana 5", fecha: "2026-11-08", cuando: "8 nov" },
  { n: "6", etiqueta: "Cartagena", fecha: "2026-11-12", cuando: "12 nov" },
] as const;

const EXTRA: { k: keyof Medida; etiqueta: string; ejemplo: string }[] = [
  { k: "entrenos", etiqueta: "Entrenamientos (de 4)", ejemplo: "4" },
  { k: "pasos", etiqueta: "Pasos promedio", ejemplo: "7.500" },
  { k: "sueno", etiqueta: "Sueño promedio (h)", ejemplo: "7" },
  { k: "adherencia", etiqueta: "Adherencia al plan", ejemplo: "80 %" },
];

const coma = (n: number) => String(n).replace(".", ",");

function Linea({ puntos, etiqueta, unidad }: { puntos: PuntoMedida[]; etiqueta: string; unidad: string }) {
  const dif = tendencia(puntos);
  const W = 300;
  const H = 70;
  const vals = puntos.map((p) => p.valor);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const xy = puntos.map((p, i) => {
    const x = puntos.length === 1 ? W / 2 : 6 + (i / (puntos.length - 1)) * (W - 12);
    const y = H - 8 - ((p.valor - min) / span) * (H - 16);
    return [x, y] as const;
  });
  const resumen =
    dif === null
      ? "Con dos registros aparece la tendencia."
      : dif === 0
        ? "Sin cambio desde el inicio."
        : `${dif < 0 ? "Bajó" : "Subió"} ${coma(Math.abs(dif))} ${unidad} desde el inicio.`;
  return (
    <div className="border-t border-[color:var(--border)] py-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[14px] font-medium text-faint">{etiqueta}</p>
        {puntos.length ? <p className="money text-[22px]">{coma(puntos[puntos.length - 1]!.valor)} <span className="text-[14px] text-faint">{unidad}</span></p> : null}
      </div>
      {puntos.length >= 2 ? (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${etiqueta}: ${resumen}`} className="mt-3 h-[70px] w-full overflow-visible">
          <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--border-md)" strokeWidth="1" />
          <polyline points={xy.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
          {xy.map(([x, y], i) => (
            <rect key={i} x={x - 2.5} y={y - 2.5} width="5" height="5" fill={i === xy.length - 1 ? "var(--gold)" : "var(--bg)"} stroke="var(--gold)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      ) : null}
      <p className="mt-2 text-[15px] text-muted">{resumen}</p>
    </div>
  );
}

function Fila({ f, pendiente }: { f: (typeof FILAS)[number]; pendiente: boolean }) {
  const { datos, setMedida } = useSistema();
  const m = datos.medidas[f.n] ?? {};
  const [mas, setMas] = useState(false);
  const campo = (k: keyof Medida, etiqueta: string, ejemplo: string, decimal = false) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`m-${f.n}-${k}`} className="text-[14px] text-muted">
        {etiqueta}
      </label>
      <input
        id={`m-${f.n}-${k}`}
        value={m[k] ?? ""}
        onChange={(e) => setMedida(f.n, { [k]: e.target.value })}
        inputMode={decimal ? "decimal" : "text"}
        maxLength={40}
        autoComplete="off"
        placeholder={ejemplo}
        className="money min-h-12 w-full border border-[color:var(--border-md)] bg-transparent px-4 text-[18px] text-foreground outline-none transition-colors placeholder:text-faint focus-visible:border-[color:var(--gold)]"
      />
    </div>
  );
  return (
    <li className="border-t border-[color:var(--border)] py-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[22px]">{f.etiqueta}</h3>
        <p className="text-[14px] text-faint">
          {pendiente ? <span className="font-medium text-accent">Toca registrar · </span> : null}
          {f.cuando}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4">
        {campo("peso", "Peso (kg)", "77,5", true)}
        {campo("cintura", "Cintura (cm)", "85", true)}
      </div>
      <button type="button" onClick={() => setMas((v) => !v)} aria-expanded={mas} className="mt-2 min-h-11 text-[14px] text-accent underline-offset-4 hover:underline">
        {mas ? "Menos medidas" : "Más medidas y notas"}
      </button>
      {mas ? (
        <div className="sis-asentar mt-2 grid gap-4 sm:grid-cols-2">
          {EXTRA.map((e) => campo(e.k, e.etiqueta, e.ejemplo))}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor={`m-${f.n}-notas`} className="text-[14px] text-muted">
              Notas
            </label>
            <textarea
              id={`m-${f.n}-notas`}
              value={m.notas ?? ""}
              onChange={(e) => setMedida(f.n, { notas: e.target.value })}
              rows={2}
              maxLength={300}
              className="w-full resize-y border border-[color:var(--border-md)] bg-transparent px-4 py-3 text-[16px] text-foreground outline-none transition-colors focus-visible:border-[color:var(--gold)]"
            />
          </div>
        </div>
      ) : null}
    </li>
  );
}

export function CuerpoRegistro() {
  const { listo, hoy, datos } = useSistema();
  const cintura = serie(datos, "cintura");
  const peso = serie(datos, "peso");
  // la fila "que toca" es la primera ya vencida sin peso ni cintura
  const pendiente = listo ? FILAS.find((f) => f.fecha <= hoy && aNumero(datos.medidas[f.n]?.peso) === null && aNumero(datos.medidas[f.n]?.cintura) === null)?.n : undefined;
  return (
    <div>
      <section aria-labelledby="tendencia" className="mb-10">
        <h2 id="tendencia" className="text-[28px]">
          Tendencia
        </h2>
        <p className="lead-italic mt-1 text-[18px] text-muted">La cintura es el indicador principal. El peso sube y baja con el agua.</p>
        <div className="mt-4">
          <Linea puntos={cintura} etiqueta="Cintura" unidad="cm" />
          <Linea puntos={peso} etiqueta="Peso" unidad="kg" />
          <div className="border-t border-[color:var(--border)]" />
        </div>
      </section>
      <section aria-labelledby="registro">
        <h2 id="registro" className="text-[28px]">
          Registro
        </h2>
        <p className="lead-italic mt-1 text-[18px] text-muted">Una vez por semana, el domingo al despertar. Entre domingos no hay nada que revisar.</p>
        <ol className={cn("mt-4", !listo && "opacity-60")}>
          {FILAS.map((f) => (
            <Fila key={f.n} f={f} pendiente={pendiente === f.n} />
          ))}
        </ol>
        <div className="border-t border-[color:var(--border)]" />
      </section>
    </div>
  );
}
