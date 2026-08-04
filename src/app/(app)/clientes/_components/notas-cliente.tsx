"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { crearNotaCliente, eliminarNotaCliente } from "@/lib/clientes/actions";

interface Nota {
  id: string;
  texto: string;
  createdAt: Date | string;
}

interface NotasClienteProps {
  clienteId: string;
  notas: Nota[];
}

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function NotasCliente({ clienteId, notas }: NotasClienteProps) {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function agregar() {
    if (!texto.trim()) {
      setError("Escribe una nota");
      return;
    }
    setError(null);
    startTransition(async () => {
      const resultado = await crearNotaCliente({ clienteId, texto: texto.trim() });
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setTexto("");
    });
  }

  function eliminar(notaId: string) {
    startTransition(async () => {
      await eliminarNotaCliente(notaId, clienteId);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe una nota sobre este cliente..."
          rows={3}
        />
        {error ? <p className="text-[12px] text-danger">{error}</p> : null}
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={agregar} disabled={isPending}>
            {isPending ? "Guardando…" : "Agregar nota"}
          </Button>
        </div>
      </div>

      {notas.length === 0 ? (
        <EmptyState title="Sin notas todavía" description="Las notas que agregues aparecerán aquí." />
      ) : (
        <ul className="flex flex-col gap-3">
          {notas.map((nota) => (
            <li
              key={nota.id}
              className="rounded-md border border-[color:var(--border)] bg-subtle p-3.5"
            >
              <p className="whitespace-pre-wrap text-[13.5px] text-foreground">
                {nota.texto}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-faint">
                  {formatoFecha.format(new Date(nota.createdAt))}
                </span>
                <button
                  type="button"
                  onClick={() => eliminar(nota.id)}
                  disabled={isPending}
                  aria-label="Eliminar nota"
                  className="cursor-pointer rounded-sm p-1 text-faint transition-colors duration-premium hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
