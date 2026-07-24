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
import { anularVenta } from "@/lib/ventas/actions";
import { formatearMoneda } from "@/lib/formato";

export function AnularVentaButton({
  ventaId,
  total,
  tipoPago,
}: {
  ventaId: string;
  total: number;
  tipoPago: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmar = () => {
    setError(null);
    startTransition(async () => {
      const resultado = await anularVenta(ventaId);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setOpen(false);
      router.push("/ventas");
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Anular venta
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Anular esta venta?</DialogTitle>
          <DialogDescription>
            {tipoPago === "contado"
              ? `Se registrará un egreso de ${formatearMoneda(total)} en caja para reversar el ingreso.`
              : "Las cuotas pendientes de esta venta quedarán anuladas y saldrán de la cartera."}{" "}
            La venta quedará marcada como anulada — no se borra del historial.
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
