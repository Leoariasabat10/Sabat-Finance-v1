"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrarPago } from "@/lib/pagos/actions";
import { pagoSchema, type PagoInput } from "@/lib/pagos/validations";
import { fechaHoyIso } from "@/lib/formato";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput, limpiarMoneda, formatearMiles } from "@/components/ui/money-input";

interface PagoFormProps {
  operacionId: string;
  saldoPendiente: number;
  origen: string;
}

export function PagoForm({ operacionId, saldoPendiente, origen }: PagoFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PagoInput>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      operacionCreditoId: operacionId,
      // Prellenado con el saldo, ya formateado con miles ("2.200.000") —
      // limpiarMoneda lo convierte a número al validar/enviar.
      valor: formatearMiles(saldoPendiente) as unknown as number,
      fechaPago: fechaHoyIso(),
      metodoPago: "efectivo",
      tipoAbono: "cuota_completa",
    },
  });

  const onSubmit = (values: PagoInput) => {
    setServerError(null);
    startTransition(async () => {
      const resultado = await registrarPago(values);
      if (!resultado.ok) {
        setServerError(resultado.error);
        return;
      }
      router.push(origen === "prestamo" ? `/prestamos/${operacionId}` : `/ventas`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <input type="hidden" {...register("operacionCreditoId")} />

      <div>
        <Label htmlFor="valor">Valor recibido *</Label>
        <MoneyInput id="valor" autoFocus aria-invalid={!!errors.valor} {...register("valor", { setValueAs: limpiarMoneda })} />
        {errors.valor ? <p className="mt-1.5 text-[12px] text-danger">{errors.valor.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fechaPago">Fecha *</Label>
          <Input id="fechaPago" type="date" {...register("fechaPago")} />
        </div>
        <div>
          <Label htmlFor="metodoPago">Método</Label>
          <Select id="metodoPago" {...register("metodoPago")}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="otro">Otro</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="tipoAbono">Tipo de abono</Label>
        <Select id="tipoAbono" {...register("tipoAbono")}>
          <option value="cuota_completa">Pago normal (interés primero, luego capital)</option>
          <option value="abono_capital">Abono solo a capital</option>
          <option value="abono_interes">Abono solo a intereses</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="observaciones">Observaciones (opcional)</Label>
        <Textarea id="observaciones" rows={2} {...register("observaciones")} />
      </div>

      {serverError ? (
        <div role="alert" className="rounded-sm bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger">
          {serverError}
        </div>
      ) : null}

      <div className="flex justify-end gap-2.5">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Registrando…" : "Registrar pago"}
        </Button>
      </div>
    </form>
  );
}
