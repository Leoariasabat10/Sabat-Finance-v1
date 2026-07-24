"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { refinanciar, type RefinanciarInput } from "@/lib/refinanciacion/actions";
import { formatearMoneda } from "@/lib/formato";

export function RefinanciarDialog({ operacionId, saldoPendiente }: { operacionId: string; saldoPendiente: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit } = useForm<RefinanciarInput>({
    defaultValues: {
      operacionOriginalId: operacionId,
      // En espacio de porcentaje: "10" = 10%. Se divide entre 100 al enviar.
      nuevaTasaInteres: 10,
      nuevoTipoInteres: "mensual",
      nuevoPlazoDias: 30,
      numeroCuotas: 1,
    },
  });

  const onSubmit = (values: RefinanciarInput) => {
    setError(null);
    startTransition(async () => {
      const resultado = await refinanciar({
        ...values,
        nuevaTasaInteres: Number(values.nuevaTasaInteres) / 100,
      });
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setOpen(false);
      router.push(`/prestamos/${resultado.data.id}`);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Refinanciar
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refinanciar préstamo</DialogTitle>
          <DialogDescription>
            El saldo pendiente ({formatearMoneda(saldoPendiente)}) se convierte en el capital de un préstamo nuevo. El original queda cerrado como "Refinanciado".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="nuevaTasaInteres">Nueva tasa (%)</Label>
              <Input id="nuevaTasaInteres" type="number" step="0.1" min={0} {...register("nuevaTasaInteres")} />
            </div>
            <div>
              <Label htmlFor="nuevoTipoInteres">Tipo</Label>
              <Select id="nuevoTipoInteres" {...register("nuevoTipoInteres")}>
                <option value="mensual">Mensual</option>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="nuevoPlazoDias">Plazo (días)</Label>
              <Input id="nuevoPlazoDias" type="number" min={1} {...register("nuevoPlazoDias")} />
            </div>
            <div>
              <Label htmlFor="numeroCuotas">Número de cuotas</Label>
              <Input id="numeroCuotas" type="number" min={1} {...register("numeroCuotas")} />
            </div>
          </div>
          <div>
            <Label htmlFor="motivo">Motivo (opcional)</Label>
            <Input id="motivo" {...register("motivo")} />
          </div>
          {error ? <p className="text-[12px] text-danger">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Refinanciando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
