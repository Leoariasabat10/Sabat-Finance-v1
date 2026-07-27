"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { anularPrestamo } from "@/lib/prestamos/actions";
import { formatearMoneda } from "@/lib/formato";

/**
 * Paridad con AnularVentaButton (auditoría Sprint 1, punto #2): antes de
 * este componente, Préstamos era el único módulo del motor de crédito
 * unificado sin capacidad de anular una operación mal creada.
 */
export function AnularPrestamoButton({
  prestamoId,
  montoCapital,
}: {
  prestamoId: string;
  montoCapital: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmar = () => {
    setError(null);
    startTransition(async () => {
      const resultado = await anularPrestamo(prestamoId);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setOpen(false);
      router.push("/prestamos");
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Anular
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Anular este préstamo?</DialogTitle>
          <DialogDescription>
            Se registrará un ingreso de {formatearMoneda(montoCapital)} en caja para devolver el capital
            desembolsado. El préstamo quedará marcado como anulado — no se borra del historial.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-[12px] text-danger">{error}</p> : null}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmar} disabled={isPending}>
            {isPending ? "Anulando…" : "Sí, anular"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
