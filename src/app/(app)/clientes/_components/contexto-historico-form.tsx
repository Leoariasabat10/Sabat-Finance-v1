"use client";

import { useState, useTransition } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { actualizarContextoHistorico } from "@/lib/clientes/actions";

interface ContextoHistoricoFormProps {
  clienteId: string;
  operacionId: string;
  yaConfirmado: boolean;
  nombreCliente: string;
}

/**
 * Reconstrucción progresiva del negocio (visión final, 26 jul 2026): en vez
 * de exigir una migración masiva de datos perfectos, se le pregunta a mamá
 * — solo cuando hace falta y solo una vez por préstamo — lo que ya sabe de
 * memoria. `fecha_operacion` nunca se toca; esto guarda una estimación
 * aparte que el motor de inteligencia usa con confianza "media", nunca
 * "alta" (esa se reserva para fechas registradas desde el día uno).
 */
export function ContextoHistoricoForm({ clienteId, operacionId, yaConfirmado, nombreCliente }: ContextoHistoricoFormProps) {
  const [abierto, setAbierto] = useState(false);
  const [anos, setAnos] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (yaConfirmado || guardado) return null;

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted transition-colors duration-premium hover:text-accent-dark"
      >
        <Clock className="h-3.5 w-3.5" />
        ¿Desde cuándo le prestas a {nombreCliente}?
      </button>
    );
  }

  function guardar() {
    const anosNum = anos.trim() ? Number(anos) : null;
    if (anosNum !== null && (Number.isNaN(anosNum) || anosNum < 0)) {
      setError("Escribe un número de años válido (ej: 3)");
      return;
    }
    setError(null);
    startTransition(async () => {
      const resultado = await actualizarContextoHistorico(operacionId, clienteId, {
        anosAproximados: anosNum,
        nota,
      });
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setGuardado(true);
    });
  }

  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-subtle p-3.5">
      <p className="mb-2.5 text-[12.5px] font-semibold text-foreground">
        ¿Desde cuándo le prestas a {nombreCliente}, aproximadamente?
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="w-full sm:w-32">
          <Input
            type="number"
            min={0}
            step={0.5}
            placeholder="Años aprox."
            value={anos}
            onChange={(e) => setAnos(e.target.value)}
          />
        </div>
        <Textarea
          className="flex-1"
          rows={2}
          placeholder='Nota opcional, ej: "Existía antes de usar Sabat Finance"'
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
      </div>
      {error ? <p className="mt-2 text-[12px] text-danger">{error}</p> : null}
      <div className="mt-2.5 flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setAbierto(false)} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={guardar} disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
