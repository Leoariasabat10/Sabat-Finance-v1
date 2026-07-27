"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { buscarGlobal, type ResultadoBusqueda } from "@/lib/busqueda/actions";

const ICONO_TIPO: Record<ResultadoBusqueda["tipo"], string> = {
  cliente: "👤",
  prestamo: "🏦",
  venta: "🛍",
};

/**
 * Búsqueda global (auditoría Sprint 2, punto de navegación): un solo
 * cuadro — Ctrl/Cmd+K desde cualquier pantalla — para encontrar un cliente,
 * préstamo o venta sin tener que adivinar en qué módulo vive.
 */
export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    // pequeño delay para que el diálogo termine de montar antes del foco
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }
    const t = setTimeout(() => {
      startTransition(async () => {
        const r = await buscarGlobal(query);
        setResultados(r);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const irA = (href: string) => {
    setOpen(false);
    setQuery("");
    setResultados([]);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-[360px] items-center gap-2 rounded-full border border-[color:var(--border)] bg-card px-3.5 text-[13px] text-muted transition-colors duration-premium hover:border-accent hover:text-foreground"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Buscar cliente, préstamo o venta…</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-[color:var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[18%] max-w-lg translate-y-0 p-0">
          <div className="flex items-center gap-2.5 border-b border-[color:var(--border)] px-4 py-3.5">
            <Search className="h-4 w-4 shrink-0 text-faint" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o WhatsApp…"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-faint"
            />
          </div>

          <div className="max-h-[360px] overflow-y-auto p-2">
            {query.trim().length < 2 ? (
              <p className="px-3 py-6 text-center text-[13px] text-muted">Escribe al menos 2 letras para buscar.</p>
            ) : isPending && resultados.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-muted">Buscando…</p>
            ) : resultados.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-muted">Sin resultados para &quot;{query}&quot;.</p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {resultados.map((r) => (
                  <li key={`${r.tipo}-${r.id}`}>
                    <button
                      type="button"
                      onClick={() => irA(r.href)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors duration-premium hover:bg-hover-bg"
                    >
                      <span className="text-lg">{ICONO_TIPO[r.tipo]}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold text-foreground">{r.titulo}</span>
                        <span className="block truncate text-[12px] text-muted">{r.subtitulo}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
