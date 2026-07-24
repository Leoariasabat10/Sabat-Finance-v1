"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { eliminarCliente } from "@/lib/clientes/actions";

export function EliminarClienteDialog({
  clienteId,
  nombre,
}: {
  clienteId: string;
  nombre: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmar() {
    startTransition(async () => {
      const resultado = await eliminarCliente(clienteId);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.push("/clientes");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Eliminar cliente">
        <Trash2 className="h-4 w-4 text-danger" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar a {nombre}?</DialogTitle>
          <DialogDescription>
            El cliente se quitará de tus listados, pero su historial queda guardado
            y puede recuperarse — nunca se borra de verdad de la base de datos.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-[12px] text-danger">{error}</p> : null}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmar} disabled={isPending}>
            {isPending ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
