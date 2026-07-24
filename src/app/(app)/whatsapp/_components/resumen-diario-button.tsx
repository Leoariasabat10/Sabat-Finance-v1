"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generarResumenDiario } from "@/lib/whatsapp/actions";
import { Button } from "@/components/ui/button";

export function ResumenDiarioButton() {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generar() {
    setError(null);
    startTransition(async () => {
      const resultado = await generarResumenDiario();
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setMensaje(resultado.data.mensaje);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={generar} disabled={isPending}>
        {isPending ? "Generando…" : "Generar resumen de hoy"}
      </Button>
      {error ? <p className="text-[12px] text-danger">{error}</p> : null}
      {mensaje ? (
        <p className="max-w-sm rounded-sm bg-hover-bg p-2.5 text-[12px] text-foreground">{mensaje}</p>
      ) : null}
    </div>
  );
}
