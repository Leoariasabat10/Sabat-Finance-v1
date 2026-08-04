"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { List, CalendarDays, ClipboardList, Target, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BotonWhatsApp } from "@/components/shared/boton-whatsapp";
import { EmptyState } from "@/components/shared/empty-state";
import { StaggerList, StaggerItem } from "@/components/shared/motion";
import { OrigenIcon } from "@/components/shared/origen-icon";
import { CobroInlineSheet } from "./cobro-inline-sheet";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { mensajeSegunSemaforo } from "@/lib/whatsapp/mensajes";
import { cn } from "@/lib/utils";
import type { CobroItem } from "@/lib/cobrar/queries";
import type { CarteraItem } from "@/lib/pagos/queries";
import type { EventoAgenda } from "@/lib/calendario/queries";

function badgeSemaforo(semaforo: string, diasAtraso: number) {
  if (semaforo === "vencido") return <Badge variant="danger">Vencido · {diasAtraso}d</Badge>;
  if (semaforo === "hoy") return <Badge variant="warning">Vence hoy</Badge>;
  return <Badge variant="info">Próximo</Badge>;
}

interface CobrarViewProps {
  cobrar: CobroItem[];
  cartera: CarteraItem[];
  eventos: EventoAgenda[];
}

/**
 * Auditoría Sprint 2: Cartera, Cobrar y Calendario eran tres pantallas que
 * mostraban esencialmente el mismo universo de datos (operaciones de
 * crédito activas) desde tres ángulos distintos. Se fusionan en un solo
 * módulo con un selector Lista/Calendario, en vez de obligar a saltar entre
 * tres rutas del sidebar para responder "¿qué me deben y cuándo?".
 */
export function CobrarView({ cobrar, cartera, eventos }: CobrarViewProps) {
  const [vista, setVista] = useState<"lista" | "calendario">("lista");
  const [agruparPorBarrio, setAgruparPorBarrio] = useState(false);

  const vencidos = cobrar.filter((i) => i.semaforo === "vencido");
  const hoy = cobrar.filter((i) => i.semaforo === "hoy");
  const proximos = cobrar.filter((i) => i.semaforo === "proximo");

  const idsEnCobrar = new Set(cobrar.map((c) => c.operacionId));
  const restoCartera = cartera.filter((c) => !idsEnCobrar.has(c.id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="inline-flex w-fit rounded-full border border-[color:var(--border)] bg-card p-1">
          <button
            type="button"
            onClick={() => setVista("lista")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors duration-premium",
              vista === "lista" ? "bg-accent text-white" : "text-muted hover:text-foreground",
            )}
          >
            <List className="h-3.5 w-3.5" aria-hidden /> Lista
          </button>
          <button
            type="button"
            onClick={() => setVista("calendario")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors duration-premium",
              vista === "calendario" ? "bg-accent text-white" : "text-muted hover:text-foreground",
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Calendario
          </button>
        </div>

        {vista === "lista" ? (
          <button
            type="button"
            onClick={() => setAgruparPorBarrio((v) => !v)}
            aria-pressed={agruparPorBarrio}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors duration-premium",
              agruparPorBarrio
                ? "border-accent bg-accent-light text-accent-dark"
                : "border-[color:var(--border)] bg-card text-muted hover:text-foreground",
            )}
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden /> Agrupar por barrio
          </button>
        ) : null}
      </div>

      {vista === "lista" ? (
        <VistaLista
          cobrar={cobrar}
          vencidos={vencidos}
          hoy={hoy}
          proximos={proximos}
          restoCartera={restoCartera}
          agruparPorBarrio={agruparPorBarrio}
        />
      ) : (
        <VistaCalendario eventos={eventos} />
      )}
    </div>
  );
}

function CobroRow({ c }: { c: CobroItem }) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition-all duration-premium ease-premium hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <OrigenIcon origen={c.origen} className="h-5 w-5" />
        <div>
          <p className="font-bold text-foreground">{c.clienteNombre}</p>
          <p className="text-[12.5px] text-muted">
            {c.producto ? `${c.producto} · ` : ""}
            {c.clienteWhatsapp}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-mono font-bold tabular-nums">{formatearMoneda(c.saldoCuota)}</p>
          {badgeSemaforo(c.semaforo, c.diasAtraso)}
        </div>
        <BotonWhatsApp
          numero={c.clienteWhatsapp}
          mensaje={mensajeSegunSemaforo({
            semaforo: c.semaforo,
            cliente: c.clienteNombre,
            valor: c.saldoCuota,
            fecha: c.fechaVencimiento,
          })}
        />
        <CobroInlineSheet item={c} />
      </div>
    </Card>
  );
}

function VistaLista({
  cobrar,
  vencidos,
  hoy,
  proximos,
  restoCartera,
  agruparPorBarrio,
}: {
  cobrar: CobroItem[];
  vencidos: CobroItem[];
  hoy: CobroItem[];
  proximos: CobroItem[];
  restoCartera: CarteraItem[];
  agruparPorBarrio: boolean;
}) {
  const sinNadaUrgente = vencidos.length === 0 && hoy.length === 0 && proximos.length === 0;

  const gruposPorBarrio = useMemo(() => {
    if (!agruparPorBarrio) return [];
    const mapa = new Map<string, CobroItem[]>();
    // `cobrar` ya llega ordenado por urgencia (vencido→hoy→próximo, más
    // atrasado primero) — al agrupar preservando ese orden, cada barrio
    // queda internamente ordenado igual, sin resolver el semáforo dos veces.
    for (const c of cobrar) {
      const clave = c.clienteBarrio?.trim() || "Sin barrio";
      if (!mapa.has(clave)) mapa.set(clave, []);
      mapa.get(clave)!.push(c);
    }
    return Array.from(mapa.entries());
  }, [agruparPorBarrio, cobrar]);

  return (
    <div className="flex flex-col gap-6">
      {sinNadaUrgente && restoCartera.length === 0 ? (
        <EmptyState
          icon={<Target className="h-10 w-10 text-faint" />}
          title="Nada por cobrar en este momento"
          description="Vuelve cuando haya cuotas próximas a vencer."
        />
      ) : (
        <>
          {sinNadaUrgente ? (
            <p className="text-[13px] text-muted">Sin cuotas vencidas ni próximas a vencer en los próximos días.</p>
          ) : agruparPorBarrio ? (
            gruposPorBarrio.map(([barrio, items]) => (
              <section key={barrio}>
                <h2 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-faint" aria-hidden /> {barrio}
                </h2>
                <StaggerList className="flex flex-col gap-2.5">
                  {items.map((c) => (
                    <StaggerItem key={c.operacionId}>
                      <CobroRow c={c} />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </section>
            ))
          ) : (
            [
              { titulo: "Vencidos", dot: "bg-danger", data: vencidos },
              { titulo: "Vencen hoy", dot: "bg-warning", data: hoy },
              { titulo: "Próximos", dot: "bg-info", data: proximos },
            ]
              .filter((s) => s.data.length > 0)
              .map((seccion) => (
                <section key={seccion.titulo}>
                  <h2 className="mb-2.5 flex items-center gap-2 text-sm font-bold text-foreground">
                    <span className={cn("h-2 w-2 rounded-full", seccion.dot)} aria-hidden />
                    {seccion.titulo}
                  </h2>
                  <StaggerList className="flex flex-col gap-2.5">
                    {seccion.data.map((c) => (
                      <StaggerItem key={c.operacionId}>
                        <CobroRow c={c} />
                      </StaggerItem>
                    ))}
                  </StaggerList>
                </section>
              ))
          )}

          {restoCartera.length > 0 ? (
            <section>
              <h2 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-foreground">
                <ClipboardList className="h-4 w-4 text-faint" aria-hidden /> Resto de la cartera activa
              </h2>
              <StaggerList className="flex flex-col gap-2">
                {restoCartera.map((c) => (
                  <StaggerItem key={c.id}>
                    <Link href={c.origen === "prestamo" ? `/prestamos/${c.id}` : "/ventas"}>
                      <Card className="flex items-center justify-between gap-3 p-3.5 transition-all duration-premium ease-premium hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center gap-2.5">
                          <OrigenIcon origen={c.origen} />
                          <div>
                            <p className="text-[13px] font-semibold text-foreground">{c.clienteNombre}</p>
                            <p className="text-[11.5px] text-muted">vence {formatearFecha(c.fechaVencimiento)}</p>
                          </div>
                        </div>
                        <span className="font-mono text-[13px] font-bold tabular-nums">{formatearMoneda(c.saldoPendiente)}</span>
                      </Card>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerList>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function VistaCalendario({ eventos }: { eventos: EventoAgenda[] }) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const eventosPorDia = useMemo(() => {
    const mapa = new Map<string, EventoAgenda[]>();
    for (const e of eventos) {
      const clave = e.fecha.toISOString().slice(0, 10);
      if (!mapa.has(clave)) mapa.set(clave, []);
      mapa.get(clave)!.push(e);
    }
    return mapa;
  }, [eventos]);

  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(hoy.toISOString().slice(0, 10));

  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  const primerDiaMes = new Date(anio, mes, 1);
  const ultimoDiaMes = new Date(anio, mes + 1, 0);
  const offsetInicio = primerDiaMes.getDay(); // 0 = domingo

  const celdas: (string | null)[] = [
    ...Array.from({ length: offsetInicio }, () => null),
    ...Array.from({ length: ultimoDiaMes.getDate() }, (_, i) => {
      const d = new Date(anio, mes, i + 1);
      return d.toISOString().slice(0, 10);
    }),
  ];

  const eventosDelDia = eventosPorDia.get(diaSeleccionado) ?? [];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_320px]">
      <Card className="p-4">
        <p className="mb-3 text-[13px] font-bold text-foreground">
          {primerDiaMes.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
        </p>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10.5px] font-bold uppercase text-faint">
          {["D", "L", "M", "X", "J", "V", "S"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {celdas.map((clave, i) => {
            if (!clave) return <div key={`vacio-${i}`} />;
            const diaEventos = eventosPorDia.get(clave) ?? [];
            const esHoy = clave === hoy.toISOString().slice(0, 10);
            const seleccionado = clave === diaSeleccionado;
            return (
              <button
                key={clave}
                type="button"
                onClick={() => setDiaSeleccionado(clave)}
                className={cn(
                  "flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md text-[12px] font-semibold transition-colors duration-premium",
                  seleccionado
                    ? "bg-accent text-white"
                    : esHoy
                      ? "bg-accent-light text-accent-dark"
                      : "text-foreground hover:bg-hover-bg",
                )}
              >
                <span>{Number(clave.slice(8, 10))}</span>
                {diaEventos.length > 0 ? (
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", seleccionado ? "bg-white" : "bg-accent")}
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-faint">Datos disponibles: próximos 30 días.</p>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-[13px] font-bold text-foreground">{formatearFecha(diaSeleccionado)}</p>
        {eventosDelDia.length === 0 ? (
          <p className="text-[12.5px] text-muted">Sin eventos este día.</p>
        ) : (
          <StaggerList className="flex flex-col gap-2">
            {eventosDelDia.map((e, i) =>
              e.href ? (
                <StaggerItem key={i}>
                  <Link href={e.href}>
                    <div className="flex items-center gap-2 rounded-md border border-[color:var(--border)] p-2.5 transition-all duration-premium ease-premium hover:-translate-y-0.5 hover:shadow-md">
                      {e.origen ? <OrigenIcon origen={e.origen} /> : null}
                      <div>
                        <p className="text-[12.5px] font-semibold text-foreground">{e.titulo}</p>
                        <p className="text-[11.5px] text-muted">{e.subtitulo}</p>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ) : (
                <StaggerItem key={i}>
                  <div className="rounded-md border border-[color:var(--border)] p-2.5">
                    <p className="text-[12.5px] font-semibold text-foreground">{e.titulo}</p>
                    <p className="text-[11.5px] text-muted">{e.subtitulo}</p>
                  </div>
                </StaggerItem>
              ),
            )}
          </StaggerList>
        )}
      </Card>
    </div>
  );
}
