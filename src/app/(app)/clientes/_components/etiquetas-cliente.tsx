"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  asignarEtiqueta,
  quitarEtiqueta,
  crearEtiqueta,
} from "@/lib/clientes/actions";

interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
}

interface EtiquetasClienteProps {
  clienteId: string;
  asignadas: Etiqueta[];
  disponibles: Etiqueta[];
}

const COLORES_SUGERIDOS = [
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#ec4899",
];

export function EtiquetasCliente({
  clienteId,
  asignadas,
  disponibles,
}: EtiquetasClienteProps) {
  const [open, setOpen] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [colorNueva, setColorNueva] = useState(COLORES_SUGERIDOS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const idsAsignadas = new Set(asignadas.map((e) => e.id));
  const paraAsignar = disponibles.filter((e) => !idsAsignadas.has(e.id));

  function quitar(etiquetaId: string) {
    startTransition(async () => {
      await quitarEtiqueta(clienteId, etiquetaId);
    });
  }

  function asignar(etiquetaId: string) {
    startTransition(async () => {
      await asignarEtiqueta(clienteId, etiquetaId);
    });
  }

  function crearYAsignar() {
    if (!nombreNueva.trim()) {
      setError("Escribe el nombre de la etiqueta");
      return;
    }
    setError(null);
    startTransition(async () => {
      const resultado = await crearEtiqueta({
        nombre: nombreNueva.trim(),
        color: colorNueva ?? COLORES_SUGERIDOS[0]!,
      });
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      await asignarEtiqueta(clienteId, resultado.data.id);
      setNombreNueva("");
      setOpen(false);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {asignadas.map((et) => (
        <Badge
          key={et.id}
          style={{ backgroundColor: `${et.color}22`, color: et.color }}
          className="gap-1"
        >
          {et.nombre}
          <button
            type="button"
            onClick={() => quitar(et.id)}
            disabled={isPending}
            aria-label={`Quitar etiqueta ${et.nombre}`}
            className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-pill border-[1.5px] border-dashed border-[color:var(--border-md)] px-2.5 py-1 text-[11px] font-bold text-faint transition-colors duration-premium hover:border-accent hover:text-accent-dark"
        >
          <Plus className="h-3 w-3" />
          Etiqueta
        </button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar etiqueta</DialogTitle>
            <DialogDescription>
              Elige una etiqueta existente o crea una nueva.
            </DialogDescription>
          </DialogHeader>

          {paraAsignar.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {paraAsignar.map((et) => (
                <button
                  key={et.id}
                  type="button"
                  onClick={() => {
                    asignar(et.id);
                    setOpen(false);
                  }}
                  disabled={isPending}
                  className="cursor-pointer disabled:cursor-not-allowed"
                >
                  <Badge style={{ backgroundColor: `${et.color}22`, color: et.color }}>
                    {et.nombre}
                  </Badge>
                </button>
              ))}
            </div>
          ) : null}

          <div className="space-y-3 border-t border-[color:var(--border)] pt-4">
            <div>
              <Label htmlFor="nueva-etiqueta">Nueva etiqueta</Label>
              <Input
                id="nueva-etiqueta"
                value={nombreNueva}
                onChange={(e) => setNombreNueva(e.target.value)}
                placeholder="ej. Buen pagador"
              />
            </div>
            <div className="flex gap-1.5">
              {COLORES_SUGERIDOS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  onClick={() => setColorNueva(c)}
                  className="h-6 w-6 cursor-pointer rounded-full transition-transform duration-premium hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: colorNueva === c ? `2px solid ${c}` : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
            {error ? <p className="text-[12px] text-danger">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={crearYAsignar} disabled={isPending}>
              {isPending ? "Creando…" : "Crear y asignar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
