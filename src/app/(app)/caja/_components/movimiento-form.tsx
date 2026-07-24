"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrarMovimientoManual } from "@/lib/caja/actions";
import { movimientoCajaSchema, type MovimientoCajaInput } from "@/lib/caja/validations";
import { fechaHoyIso } from "@/lib/formato";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MoneyInput, limpiarMoneda } from "@/components/ui/money-input";

export function MovimientoForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);

  const { register, handleSubmit, reset } = useForm<MovimientoCajaInput>({
    resolver: zodResolver(movimientoCajaSchema),
    defaultValues: { tipo: "egreso", monto: "" as unknown as number, fecha: fechaHoyIso() },
  });

  const onSubmit = (values: MovimientoCajaInput) => {
    setServerError(null);
    startTransition(async () => {
      const resultado = await registrarMovimientoManual(values);
      if (!resultado.ok) {
        setServerError(resultado.error);
        return;
      }
      reset({ tipo: "egreso", monto: "" as unknown as number, fecha: fechaHoyIso() });
      setAbierto(false);
      router.refresh();
    });
  };

  if (!abierto) {
    return (
      <Button onClick={() => setAbierto(true)} size="sm">
        + Movimiento manual
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-wrap items-end gap-3 rounded-sm border border-[color:var(--border)] p-3">
      <div>
        <Label htmlFor="tipo">Tipo</Label>
        <Select id="tipo" {...register("tipo")}>
          <option value="egreso">Egreso</option>
          <option value="ingreso">Ingreso</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="monto">Monto</Label>
        <MoneyInput id="monto" placeholder="50.000" autoFocus {...register("monto", { setValueAs: limpiarMoneda })} />
      </div>
      <div>
        <Label htmlFor="fecha">Fecha</Label>
        <Input id="fecha" type="date" {...register("fecha")} />
      </div>
      <div className="min-w-[160px] flex-1">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input id="descripcion" placeholder="Ej. pago de arriendo" {...register("descripcion")} />
      </div>
      {serverError ? <p className="text-[12px] text-danger">{serverError}</p> : null}
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setAbierto(false)} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
