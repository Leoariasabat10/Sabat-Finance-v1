"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { accionesRapidas } from "@/config/nav";
import { cn } from "@/lib/utils";

/**
 * Botón flotante de acciones rápidas (visión final del producto, sección
 * 1): registrar un pago, prestar o vender son las tareas más frecuentes
 * del día — nunca deberían exigir entrar a un módulo. Vive en todas las
 * pantallas, sobre la barra de navegación móvil.
 */
export function QuickActionFab() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={ref}
      className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2.5 lg:bottom-6 lg:right-6"
    >
      {open ? (
        <div className="animate-fade-up flex flex-col items-end gap-2">
          {accionesRapidas.map((accion) => (
            <Link
              key={accion.href}
              href={accion.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-full border border-[color:var(--border)] bg-card py-2 pl-4 pr-3 text-[13px] font-semibold text-foreground shadow-lg transition-colors duration-premium hover:bg-hover-bg"
            >
              {accion.title}
              <span className="text-base" aria-hidden>
                {accion.emoji}
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        aria-label={open ? "Cerrar acciones rápidas" : "Acciones rápidas"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-dark))] text-white shadow-lg transition-transform duration-premium ease-premium",
          open ? "rotate-45" : "hover:scale-105",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>
  );
}
