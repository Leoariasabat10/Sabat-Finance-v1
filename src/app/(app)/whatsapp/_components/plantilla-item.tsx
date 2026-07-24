"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarPlantilla } from "@/lib/whatsapp/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PlantillaItem({
  id,
  nombre,
  evento,
  cuerpoInicial,
  activaInicial,
}: {
  id: string;
  nombre: string;
  evento: string;
  cuerpoInicial: string;
  activaInicial: boolean;
}) {
  const router = useRouter();
  const [cuerpo, setCuerpo] = useState(cuerpoInicial);
  const [activa, setActiva] = useState(activaInicial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function guardar() {
    setError(null);
    startTransition(async () => {
      const resultado = await actualizarPlantilla({ id, cuerpo, activa });
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">{nombre}</p>
          <div className="flex items-center gap-2">
            <Badge variant={activa ? "success" : "danger"}>{activa ? "Activa" : "Inactiva"}</Badge>
            <button
              type="button"
              onClick={() => setActiva((a) => !a)}
              className="text-[11.5px] font-semibold text-accent hover:underline"
            >
              {activa ? "Desactivar" : "Activar"}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-muted">Evento: {evento}</p>
        <Textarea rows={2} value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} />
        {error ? <p className="text-[12px] text-danger">{error}</p> : null}
        <div className="flex justify-end">
          <Button size="sm" onClick={guardar} disabled={isPending}>
            {isPending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
