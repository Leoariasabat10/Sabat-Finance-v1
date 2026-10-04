"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, X } from "lucide-react";
import { accionesRapidas } from "@/config/nav";
import { cn } from "@/lib/utils";

/**
 * Atajo a las cuatro acciones del día desde cualquier pantalla. En "Hoy" no aparece: ahí las acciones ya están a la
 * vista. Rectangular y negro (como el botón principal); el menú se abre y cierra con una transición corta.
 */
export function QuickActionFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  if (pathname === "/dashboard") return null;

  return (
    <div ref={ref} className="fixed bottom-[76px] right-4 z-40 flex flex-col items-end gap-2 lg:bottom-6 lg:right-6">
      {open ? (
        <ul className="animate-fade-up flex flex-col items-end gap-2">
          {accionesRapidas.map((accion) => (
            <li key={accion.href}>
              <Link
                href={accion.href}
                className="flex min-h-11 items-center gap-2.5 border border-[color:var(--border-md)] bg-card px-4 text-[15px] text-foreground shadow-md transition-colors hover:border-[color:var(--gold)]"
              >
                <accion.icon className="h-4 w-4 text-accent" aria-hidden />
                {accion.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        aria-label={open ? "Cerrar acciones rápidas" : "Acciones rápidas"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-12 w-12 cursor-pointer items-center justify-center bg-foreground text-background shadow-md transition-[background-color,color,transform] duration-150 ease-premium hover:bg-[color:var(--gold)] hover:text-[#0a0a0a] active:scale-95",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
    </div>
  );
}
