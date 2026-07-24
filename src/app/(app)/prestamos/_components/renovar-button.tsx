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
import { renovar } from "@/lib/refinanciacion/actions";

export function RenovarButton({ operacionId }: { operacionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmar() {
    startTransition(async () => {
      const resultado = await renovar(operacionId);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Renovar
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renovar préstamo</DialogTitle>
          <DialogDescription>
            Se registra el pago del interés del período actual, el capital se
            mantiene igual y el plazo se extiende un período más.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-[12px] text-danger">{error}</p> : null}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={isPending}>
            {isPending ? "Renovando…" : "Confirmar renovación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
