"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
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
        toast.error(resultado.error);
        return;
      }
      toast.success("Cliente eliminado");
      router.push("/clientes");
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Eliminar cliente">
        <Trash2 className="h-4 w-4 text-danger" />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar a {nombre}?</AlertDialogTitle>
          <AlertDialogDescription>
            El cliente se quitará de tus listados, pero su historial queda guardado
            y puede recuperarse — nunca se borra de verdad de la base de datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p className="text-[12px] text-danger">{error}</p> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmar} disabled={isPending}>
            {isPending ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
