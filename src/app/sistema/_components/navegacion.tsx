"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, Ellipsis, Sun, Utensils } from "lucide-react";
import { useSistema } from "./store";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "/sistema", etiqueta: "Hoy" },
  { href: "/sistema/semana", etiqueta: "Semana" },
  { href: "/sistema/entrenar", etiqueta: "Entrenar" },
  { href: "/sistema/comer", etiqueta: "Comer" },
  { href: "/sistema/cuerpo", etiqueta: "Cuerpo" },
  { href: "/sistema/plan", etiqueta: "Plan" },
  { href: "/sistema/calendario", etiqueta: "Calendario" },
  { href: "/sistema/reglas", etiqueta: "Reglas" },
  { href: "/sistema/semanal", etiqueta: "Semanal" },
] as const;

const MOVIL = [
  { href: "/sistema", etiqueta: "Hoy", Icono: Sun },
  { href: "/sistema/semana", etiqueta: "Semana", Icono: CalendarDays },
  { href: "/sistema/entrenar", etiqueta: "Entrenar", Icono: Dumbbell },
  { href: "/sistema/comer", etiqueta: "Comer", Icono: Utensils },
  { href: "/sistema/mas", etiqueta: "Más", Icono: Ellipsis },
] as const;
const EN_MAS = ["/sistema/mas", "/sistema/cuerpo", "/sistema/plan", "/sistema/calendario", "/sistema/reglas", "/sistema/semanal"];

function activa(pathname: string, href: string) {
  return href === "/sistema" ? pathname === "/sistema" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Cabecera fija: marca, nombre del espacio y vuelta a Administración; en escritorio, las nueve secciones. */
export function Cabecera() {
  const pathname = usePathname();
  const { guardado } = useSistema();
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/sistema" aria-label="Mi Sistema, ir a Hoy" className="flex items-center gap-3">
          <Image src="/sabat-logo-mark.png" alt="SABAT" width={556} height={188} className="h-auto w-[74px]" priority />
          <span className="hidden text-[13px] font-medium tracking-[0.18em] text-faint sm:inline">MI SISTEMA</span>
        </Link>
        <div className="flex items-center gap-5">
          {!guardado ? (
            <span role="status" className="text-[13px] text-danger">
              No se está guardando
            </span>
          ) : null}
          <Link href="/configuracion" className="flex min-h-11 items-center text-[14px] text-muted transition-colors hover:text-foreground">
            Administración
          </Link>
        </div>
      </div>
      <nav aria-label="Secciones de Mi Sistema" className="mx-auto hidden w-full max-w-[1100px] gap-1 px-8 lg:flex">
        {SECCIONES.map((s) => {
          const on = activa(pathname, s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "-mb-px border-b px-3 py-3 text-[15px] transition-colors duration-150",
                on ? "border-[color:var(--gold)] text-foreground" : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {s.etiqueta}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

/** Teléfono: cinco destinos a un toque con el pulgar; el resto vive en «Más». */
export function BarraInferior() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación de Mi Sistema"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[color:var(--border-md)] bg-background pb-[max(env(safe-area-inset-bottom),6px)] lg:hidden"
    >
      {MOVIL.map(({ href, etiqueta, Icono }) => {
        const on = href === "/sistema/mas" ? EN_MAS.some((r) => activa(pathname, r)) : activa(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "relative flex min-h-[58px] flex-col items-center justify-center gap-1 pt-1 text-[12px] transition-colors duration-150 active:scale-[0.97]",
              on ? "font-medium text-foreground" : "text-faint",
            )}
          >
            {on ? <span aria-hidden className="absolute inset-x-4 top-0 h-[2px] bg-[color:var(--gold)]" /> : null}
            <Icono className="h-5 w-5" aria-hidden />
            <span>{etiqueta}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Aviso corto cuando el almacén se migró o estaba dañado. */
export function AvisoDatos() {
  const { estado, descartarAviso } = useSistema();
  if (estado !== "migrado" && estado !== "corrupto") return null;
  return (
    <div role="status" className="mx-auto mt-4 flex w-full max-w-[1100px] items-start justify-between gap-4 border border-[color:var(--gold)]/50 px-4 py-3 text-[15px] text-muted sm:mx-8 lg:mx-auto">
      <p>
        {estado === "migrado"
          ? "Traje a esta versión lo que tenías guardado de la anterior."
          : "No se pudieron leer los datos guardados. Dejé una copia intacta y empiezo en limpio."}
      </p>
      <button type="button" onClick={descartarAviso} className="min-h-11 shrink-0 px-2 text-accent">
        Entendido
      </button>
    </div>
  );
}
