"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DIAS, PLAN_FIN, PLAN_INICIO, type DiaPlan } from "@/lib/sistema/plan";
import { calcularPilares, diferenciaDias, lecturaCapital, lecturaEjecucion, lecturaMotor, pd, sumarDias, type Lectura, type Pilares } from "@/lib/sistema/calculos";
import { NUM_CHECKS } from "@/lib/sistema/storage";
import { CLIPS } from "@/lib/sistema/media";
import { LoopVideo } from "./loop-video";
import { useSistema } from "./store";
import { cn } from "@/lib/utils";

export interface Finanzas {
  cobrosHoy: number;
  atrasados: number;
}

const nf = new Intl.NumberFormat("es-CO");
const fechaLarga = (iso: string) => {
  const t = pd(iso).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const textoAntes = (hoy: string) => {
  const d = diferenciaDias(PLAN_INICIO, hoy);
  return d === 1 ? "El plan empieza mañana, lunes 5 de octubre. Este es el Día 1." : `El plan empieza el lunes 5 de octubre, en ${d} días. Este es el Día 1.`;
};

function casillas(d: DiaPlan): [string, string][] {
  return [
    ["Agua al despertar", "400 ml, antes de cualquier otra cosa"],
    ["Piel de mañana", "Limpiar · hidratar · protector solar"],
    [`Entrenar: ${d.wo}`, d.woWhen],
    ["Proteína en cada comida", `${nf.format(d.kcal)} kcal · ≥ ${d.prot} g`],
    [`Pasos: ${nf.format(d.steps)}`, "En un día difícil, 6.000"],
    ["Agua total", "3 botellas de 750 ml y un vaso"],
    ["Piel de noche", d.skinPM],
    [`Pantallas fuera ${d.scr} · luces ${d.lights}`, `Mañana despiertas ${d.wakeTomorrow}`],
  ];
}

const TONO: Record<Lectura["tono"], string> = {
  hecho: "bg-success",
  pendiente: "bg-[color:var(--gold)]",
  alerta: "bg-danger",
};

function Trazo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" aria-hidden>
      <path className="sis-trazo" d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}

function Pilar({
  nombre,
  lectura,
  anotar,
  extra,
}: {
  nombre: string;
  lectura: Lectura;
  anotar?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <li className="border-t border-[color:var(--border)] py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2.5 text-[14px] font-medium text-faint">
            <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", TONO[lectura.tono])} />
            {nombre}
          </p>
          <p className="lead-italic mt-1.5 text-[20px] leading-snug text-foreground sm:text-[22px]">{lectura.texto}</p>
          {extra}
        </div>
        {anotar ? (
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            className="min-h-11 shrink-0 px-1 text-[15px] text-accent underline-offset-4 hover:underline"
          >
            {abierto ? "Cerrar" : "Anotar"}
          </button>
        ) : null}
      </div>
      {anotar && abierto ? <div className="sis-asentar mt-4 flex flex-col gap-3">{anotar}</div> : null}
    </li>
  );
}

function Campo({ id, etiqueta, valor, onChange, ejemplo }: { id: string; etiqueta: string; valor: string; onChange: (v: string) => void; ejemplo: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14px] text-muted">
        {etiqueta}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        maxLength={140}
        placeholder={ejemplo}
        autoComplete="off"
        className="min-h-12 w-full border border-[color:var(--border-md)] bg-transparent px-4 text-[17px] text-foreground outline-none transition-colors placeholder:text-faint focus-visible:border-[color:var(--gold)]"
      />
    </div>
  );
}

function Casilla({ hecha, titulo, detalle, onClick }: { hecha: boolean; titulo: string; detalle: string; onClick: () => void }) {
  return (
    <li className="border-t border-[color:var(--border)]">
      <button
        type="button"
        role="checkbox"
        aria-checked={hecha}
        onClick={onClick}
        className="flex min-h-[68px] w-full items-center gap-4 py-3 text-left transition-colors duration-150 active:bg-[color:var(--bg-subtle)]"
      >
        <span
          aria-hidden
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center border transition-[background-color,border-color] duration-200 ease-premium",
            hecha ? "border-success bg-success text-[#0a0a0a]" : "border-[color:var(--border-md)]",
          )}
        >
          {hecha ? <Trazo className="h-4 w-4" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-[17px] leading-snug transition-colors duration-200", hecha ? "text-faint" : "text-foreground")}>{titulo}</span>
          <span className="mt-0.5 block text-[14px] leading-snug text-faint">{detalle}</span>
        </span>
        <span className={cn("shrink-0 text-[13px] font-medium", hecha ? "text-success" : "text-accent")}>{hecha ? "Hecho" : "Pendiente"}</span>
      </button>
    </li>
  );
}

export function HoyVista({ finanzas }: { finanzas: Finanzas | null }) {
  const { listo, hoy, datos, setDia, alternarCheck } = useSistema();
  const [elegido, setElegido] = useState<string | null>(null);
  const [guerra, setGuerra] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const fuera = hoy && hoy < PLAN_INICIO ? "antes" : hoy && hoy > PLAN_FIN ? "despues" : null;
  const porDefecto = !hoy ? PLAN_INICIO : hoy < PLAN_INICIO ? PLAN_INICIO : hoy > PLAN_FIN ? PLAN_FIN : hoy;
  const sel = elegido ?? porDefecto;
  const dia = DIAS.find((d) => d.d === sel) ?? DIAS[0]!;
  const reg = datos.dias[sel] ?? {};
  const idx = diferenciaDias(sel, PLAN_INICIO) + 1;
  const faltan = diferenciaDias(PLAN_FIN, sel);
  const lista = casillas(dia);
  const checks = reg.checks ?? [];
  const hechas = checks.filter(Boolean).length;

  const pilares: Pilares = useMemo(() => calcularPilares(datos, sel), [datos, sel]);
  const lEje = lecturaEjecucion(pilares, !!reg.hecha, NUM_CHECKS);
  const lMot = lecturaMotor(pilares, reg.motor);
  const lCap = lecturaCapital(pilares, !!(reg.cap1?.trim() || reg.cap2?.trim()), dia.wo, dia.lights);

  // el vídeo sigue el paso del día; por defecto (servidor y primer pintado) es la mañana
  const [hora, setHora] = useState<number | null>(null);
  useEffect(() => {
    setHora(new Date().getHours());
  }, []);
  const clip = hora === null || hora < 12 ? CLIPS.alba : hora < 18 ? CLIPS.cima : CLIPS.noche;

  // la misión crece con el texto (sin barras de desplazamiento)
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [reg.mision, sel, listo]);

  const identidad =
    pilares.racha >= 14
      ? "Ya no dependes de la motivación. Ejecutar es quien eres."
      : pilares.racha >= 5
        ? "Estás construyendo una identidad de ejecución. No la rompas hoy por comodidad."
        : "Hoy decides otra vez: ejecutas o lo piensas. Solo cuenta lo que haces.";

  const cumplir = () => {
    if (!reg.mision?.trim()) {
      areaRef.current?.focus();
      return;
    }
    const nueva = !reg.hecha;
    setDia(sel, { hecha: nueva });
    if (nueva && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(14);
  };

  const esHoy = sel === hoy;
  const ayer = sumarDias(sel, -1);
  const manana = sumarDias(sel, 1);

  return (
    <div className="pb-6">
      {/* ── LA MISIÓN ───────────────────────────────────────────── */}
      <section aria-labelledby="mision" className="relative isolate -mx-5 flex min-h-[calc(100dvh-8.5rem)] flex-col justify-between overflow-hidden sm:-mx-8 lg:mx-0 lg:min-h-[640px]">
        <div className="absolute inset-0 -z-10">
          <LoopVideo key={clip.src} clip={clip} className="h-full w-full" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.7),rgba(10,10,10,0.15)_32%,rgba(10,10,10,0.55)_62%,rgba(10,10,10,0.94))]" />
        <div aria-hidden className={cn("absolute inset-0 -z-10 bg-success transition-opacity duration-700 ease-out", reg.hecha ? "opacity-[0.10]" : "opacity-0")} />

        <div className="flex items-start justify-between gap-4 px-5 pt-6 sm:px-8 lg:px-10 lg:pt-8">
          <div>
            <p className="lead-italic text-[18px] text-foreground/85">{listo ? fechaLarga(sel) : " "}</p>
            <p className="mt-1 text-[14px] text-foreground/65">{listo ? `Día ${idx} de ${DIAS.length} · ${dia.ph}` : " "}</p>
          </div>
          <p className="text-right text-[14px] leading-tight text-foreground/65">
            <span className="block font-display text-[34px] leading-none text-foreground">{listo ? faltan : " "}</span>
            días para Cartagena
          </p>
        </div>

        <div className="relative px-5 pb-7 sm:px-8 lg:px-10 lg:pb-10">
          <h1 id="mision" className="text-[14px] font-medium tracking-[0.04em] text-foreground/70">
            {reg.hecha ? "Misión cumplida" : "Misión de hoy"}
          </h1>
          <textarea
            ref={areaRef}
            aria-label="Misión de hoy: la única acción que cambia el día"
            value={reg.mision ?? ""}
            onChange={(e) => setDia(sel, { mision: e.target.value.replace(/\n/g, " ") })}
            maxLength={140}
            rows={2}
            placeholder="La única acción que cambia el día"
            className={cn(
              "mt-2 block w-full resize-none overflow-hidden bg-transparent font-display text-[32px] leading-[1.08] tracking-[-0.015em] outline-none transition-colors duration-500 placeholder:text-foreground/35 sm:text-[48px]",
              reg.hecha ? "text-success" : "text-foreground",
            )}
          />

          <button
            type="button"
            onClick={cumplir}
            aria-pressed={!!reg.hecha}
            className={cn(
              "mt-5 flex min-h-14 w-full items-center justify-center gap-3 border text-[17px] font-medium transition-[background-color,border-color,color,transform] duration-200 ease-premium active:scale-[0.98] sm:max-w-sm",
              reg.hecha
                ? "border-success bg-success/15 text-success"
                : "border-[color:var(--gold)] text-accent hover:bg-[color:var(--gold)] hover:text-[#0a0a0a] focus-visible:bg-[color:var(--gold)] focus-visible:text-[#0a0a0a]",
            )}
          >
            {reg.hecha ? <Trazo key="ok" /> : null}
            {reg.hecha ? "Cumplido" : reg.mision?.trim() ? "Marcar como cumplida" : "Escribe primero la misión"}
          </button>
          {reg.hecha ? (
            <button type="button" onClick={() => setDia(sel, { hecha: false })} className="mt-1 min-h-11 text-[14px] text-foreground/60 underline-offset-4 hover:underline">
              Deshacer
            </button>
          ) : (
            <button type="button" onClick={() => setGuerra((v) => !v)} aria-expanded={guerra} className="mt-1 min-h-11 text-[14px] text-foreground/60 underline-offset-4 hover:underline">
              Modo guerra
            </button>
          )}
          {guerra && !reg.hecha ? (
            <p className="sis-asentar mt-2 max-w-md border-l border-[color:var(--gold)] pl-4 text-[15px] leading-relaxed text-foreground/85">
              Hoy solo importan tres cosas: la misión, una acción mínima del motor económico y dormir a la hora. Lo demás espera.
            </p>
          ) : null}
          {reg.hecha ? <span key="barrido" aria-hidden className="sis-barrido pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[color:var(--gold)]" /> : null}
        </div>
      </section>

      {/* ── NAVEGACIÓN DE DÍAS ──────────────────────────────────── */}
      {listo ? (
        <div className="mt-2 flex items-center justify-between gap-2 border-b border-[color:var(--border)] py-1">
          <button
            type="button"
            onClick={() => setElegido(ayer)}
            disabled={ayer < PLAN_INICIO}
            aria-label="Día anterior"
            className="grid min-h-11 min-w-11 place-items-center text-muted transition-colors enabled:hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <p className="text-center text-[15px] text-muted">
            {elegido !== null ? fechaLarga(sel) : fuera === "antes" ? textoAntes(hoy) : fuera === "despues" ? "El plan terminó. Lo que construiste se queda." : "Hoy"}
            {elegido !== null ? (
              <button type="button" onClick={() => setElegido(null)} className="ml-3 min-h-11 text-accent underline-offset-4 hover:underline">
                Volver a hoy
              </button>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => setElegido(manana)}
            disabled={manana > PLAN_FIN}
            aria-label="Día siguiente"
            className="grid min-h-11 min-w-11 place-items-center text-muted transition-colors enabled:hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : null}

      {/* ── LA VERDAD DE HOY ────────────────────────────────────── */}
      <section aria-labelledby="verdad" className="mt-12">
        <h2 id="verdad" className="text-[28px] sm:text-[32px]">
          La verdad de hoy
        </h2>
        <p className="lead-italic mt-1 text-[18px] text-muted">{identidad}</p>
        <ul className="mt-5">
          <Pilar nombre="Ejecución" lectura={lEje} />
          <Pilar
            nombre="Motor económico"
            lectura={lMot}
            extra={
              finanzas ? (
                <p className="mt-2 text-[15px] text-muted">
                  En Finance:{" "}
                  <Link href="/cobrar" className="text-accent underline-offset-4 hover:underline">
                    {finanzas.cobrosHoy + finanzas.atrasados === 0
                      ? "nada por cobrar hoy"
                      : `${plural(finanzas.cobrosHoy, "cobro hoy", "cobros hoy")}${finanzas.atrasados ? ` · ${plural(finanzas.atrasados, "atrasado", "atrasados")}` : ""}`}
                  </Link>
                </p>
              ) : null
            }
            anotar={<Campo id="motor" etiqueta="Qué moviste hoy" valor={reg.motor ?? ""} onChange={(v) => setDia(sel, { motor: v })} ejemplo="vender, contenido, proveedor, propuesta…" />}
          />
          <Pilar
            nombre="Capital personal"
            lectura={lCap}
            anotar={
              <>
                <Campo id="cap1" etiqueta="Conocimiento" valor={reg.cap1 ?? ""} onChange={(v) => setDia(sel, { cap1: v })} ejemplo="IA, política, ventas, inglés, negociación…" />
                <Campo id="cap2" etiqueta="Relación" valor={reg.cap2 ?? ""} onChange={(v) => setDia(sel, { cap2: v })} ejemplo="a quién escribí o con quién hablé" />
              </>
            }
          />
        </ul>
        <div className="border-t border-[color:var(--border)]" />
      </section>

      {/* ── LO QUE TOCA ─────────────────────────────────────────── */}
      <section aria-labelledby="toca" className="mt-14">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="toca" className="text-[28px] sm:text-[32px]">
            Lo que toca hoy
          </h2>
          <p className="text-[15px] text-muted" aria-live="polite">
            {hechas} de {NUM_CHECKS}
          </p>
        </div>
        <p className="lead-italic mt-1 text-[18px] text-muted">{dia.goal}</p>
        <div className="mt-4 h-px w-full bg-[color:var(--border-md)]" role="progressbar" aria-valuemin={0} aria-valuemax={NUM_CHECKS} aria-valuenow={hechas} aria-label="Casillas hechas hoy">
          <div className="h-px origin-left bg-[color:var(--gold)] transition-transform duration-300 ease-premium" style={{ transform: `scaleX(${hechas / NUM_CHECKS})` }} />
        </div>
        <ul className="mt-1">
          {lista.map(([titulo, detalle], i) => (
            <Casilla key={`${sel}-${i}`} hecha={!!checks[i]} titulo={titulo} detalle={detalle} onClick={() => alternarCheck(sel, i)} />
          ))}
        </ul>
        <div className="border-t border-[color:var(--border)]" />
        <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-muted">
          <strong className="font-medium text-foreground">Día difícil:</strong> la versión mínima también cuenta. 10 minutos de las dos primeras series, 6.000 pasos, proteína en tres comidas y cama a hora.
        </p>
        <p className="lead-italic mt-6 text-[22px] text-foreground/80">No necesito perfecto. Necesito ejecutar hoy.</p>
      </section>
    </div>
  );
}
