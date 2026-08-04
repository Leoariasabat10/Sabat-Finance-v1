"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Landmark, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { buscarGlobal, type ResultadoBusqueda } from "@/lib/busqueda/actions";
import { navPrimaria, accionesRapidas, type NavIcon } from "@/config/nav";
import { cn } from "@/lib/utils";

const ICONO_TIPO: Record<ResultadoBusqueda["tipo"], typeof User> = {
  cliente: User,
  prestamo: Landmark,
  venta: ShoppingBag,
};

interface Comando {
  clave: string;
  titulo: string;
  subtitulo: string;
  href: string;
  icon: NavIcon;
  grupo: "acción" | "resultado";
}

/** Ir a… + acciones rápidas, siempre disponibles como comandos de teclado (estilo Raycast/Linear). */
const COMANDOS_BASE: Comando[] = [
  ...accionesRapidas.map((a) => ({ clave: `accion-${a.href}`, titulo: a.title, subtitulo: "Acción rápida", href: a.href, icon: a.icon, grupo: "acción" as const })),
  ...navPrimaria.map((n) => ({ clave: `ir-${n.href}`, titulo: `Ir a ${n.title}`, subtitulo: "Navegación", href: n.href, icon: n.icon, grupo: "acción" as const })),
];

const LISTBOX_ID = "global-search-listbox";
const optionId = (i: number) => `global-search-option-${i}`;

/**
 * Búsqueda global (auditoría Sprint 2) + comandos de acción (2 ago 2026,
 * rediseño premium): un solo cuadro — Ctrl/Cmd+K desde cualquier pantalla —
 * para encontrar un cliente, préstamo o venta, o disparar una acción rápida
 * sin soltar el teclado. Con el campo vacío se listan las acciones/atajos de
 * navegación; al escribir 2+ letras se filtran junto a los resultados reales.
 */
export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
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
    setActiveIndex(-1);
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

  const termino = query.trim().toLowerCase();

  const comandosFiltrados = useMemo(() => {
    if (termino.length === 0) return COMANDOS_BASE;
    return COMANDOS_BASE.filter((c) => c.titulo.toLowerCase().includes(termino));
  }, [termino]);

  const items: Comando[] = useMemo(() => {
    const deResultados: Comando[] = resultados.map((r) => ({
      clave: `${r.tipo}-${r.id}`,
      titulo: r.titulo,
      subtitulo: r.subtitulo,
      href: r.href,
      icon: ICONO_TIPO[r.tipo],
      grupo: "resultado" as const,
    }));
    return [...comandosFiltrados, ...deResultados];
  }, [comandosFiltrados, resultados]);

  const irA = (href: string) => {
    setOpen(false);
    setQuery("");
    setResultados([]);
    router.push(href);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const elegido = items[activeIndex] ?? items[0];
      if (elegido) irA(elegido.href);
    }
  };

  const buscandoEntidades = termino.length >= 2;
  const mostrarSeparador = comandosFiltrados.length > 0 && resultados.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-[390px] cursor-pointer items-center gap-2.5 rounded-full border border-[color:var(--border)] bg-subtle/70 px-4 text-[13px] text-muted shadow-[inset_0_1px_0_var(--surface-highlight)] transition-all duration-premium hover:border-accent hover:bg-card hover:text-foreground hover:shadow-sm"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Buscar o ejecutar una acción…</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-[color:var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] max-w-lg overflow-hidden p-0">
          <div className="flex items-center gap-2.5 border-b border-[color:var(--border)] px-4 py-3.5">
            <Search className="h-4 w-4 shrink-0 text-faint" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Buscar cliente, préstamo, venta o una acción…"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-faint"
              role="combobox"
              aria-expanded={items.length > 0}
              aria-controls={LISTBOX_ID}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            />
          </div>

          <div className="max-h-[360px] overflow-y-auto p-2">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-muted">
                {buscandoEntidades && isPending ? "Buscando…" : `Sin resultados para "${query}".`}
              </p>
            ) : (
              <ul id={LISTBOX_ID} role="listbox" className="flex flex-col gap-0.5">
                {comandosFiltrados.length > 0 ? (
                  <li role="presentation" className="px-3 pb-1 pt-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-faint">
                    Acciones
                  </li>
                ) : null}
                {items.map((item, i) => {
                  if (item.grupo === "resultado" && i === comandosFiltrados.length && mostrarSeparador) {
                    return (
                      <li key={`sep-${item.clave}`} role="presentation">
                        <p className="px-3 pb-1 pt-2.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-faint">Resultados</p>
                        <ItemBoton item={item} index={i} activo={i === activeIndex} onHover={setActiveIndex} onSeleccionar={irA} />
                      </li>
                    );
                  }
                  return (
                    <li key={item.clave} role="presentation">
                      <ItemBoton item={item} index={i} activo={i === activeIndex} onHover={setActiveIndex} onSeleccionar={irA} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ItemBoton({
  item,
  index,
  activo,
  onHover,
  onSeleccionar,
}: {
  item: Comando;
  index: number;
  activo: boolean;
  onHover: (i: number) => void;
  onSeleccionar: (href: string) => void;
}) {
  return (
    <button
      id={optionId(index)}
      type="button"
      role="option"
      aria-selected={activo}
      onMouseEnter={() => onHover(index)}
      onClick={() => onSeleccionar(item.href)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors duration-premium hover:bg-hover-bg",
        activo && "bg-hover-bg",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0 text-faint" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold text-foreground">{item.titulo}</span>
        <span className="block truncate text-[12px] text-muted">{item.subtitulo}</span>
      </span>
    </button>
  );
}
