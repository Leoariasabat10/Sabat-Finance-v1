"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registrarPago } from "@/lib/pagos/actions";
import { pagoSchema, type PagoInput } from "@/lib/pagos/validations";
import { fechaHoyIso, formatearMoneda } from "@/lib/formato";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput, limpiarMoneda, formatearMiles } from "@/components/ui/money-input";

interface PagoFormProps {
  operacionId: string;
  /** Tope real — el pago nunca puede superarlo (bloqueo financiero crítico). */
  saldoPendiente: number;
  /**
   * Valor con el que se prellena el campo. Por defecto es igual a
   * `saldoPendiente` (comportamiento original: liquidar el saldo completo).
   * El Sheet inline de Cobrar pasa aquí el valor de la cuota del día en vez
   * del saldo total de la operación — en el cobro diario de calle lo normal
   * es pagar la cuota de hoy, no todo el préstamo de una vez.
   */
  valorSugerido?: number;
  origen: string;
  /**
   * Cuando se usa dentro de un Sheet inline (ej. cobro-inline-sheet.tsx) no
   * queremos navegar fuera de la pantalla actual al registrar el pago — solo
   * cerrar el panel y refrescar. Si no se pasa, conserva el comportamiento
   * original (navegar a la operación).
   */
  onSuccess?: () => void;
  /** Reemplaza el "Cancelar" (que por defecto hace router.back()) cuando el form vive dentro de un panel que no navegó. */
  onCancel?: () => void;
}

export function PagoForm({
  operacionId,
  saldoPendiente,
  valorSugerido,
  origen,
  onSuccess,
  onCancel,
}: PagoFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PagoInput>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      operacionCreditoId: operacionId,
      // Prellenado con el saldo, ya formateado con miles ("2.200.000") —
      // limpiarMoneda lo convierte a número al validar/enviar.
      valor: formatearMiles(valorSugerido ?? saldoPendiente) as unknown as number,
      fechaPago: fechaHoyIso(),
      metodoPago: "efectivo",
      tipoAbono: "cuota_completa",
    },
  });

  // Bloqueo financiero crítico (auditoría Sprint 1): no dejar avanzar al
  // usuario si el valor tecleado ya supera el saldo pendiente, antes
  // incluso de tocar el servidor. El servidor vuelve a validar esto mismo
  // como última línea de defensa (ver lib/pagos/actions.ts).
  const valorTexto = watch("valor");
  const valorNumerico = limpiarMoneda(valorTexto);
  const excedeSaldo = valorNumerico > saldoPendiente + 1;

  const onSubmit = (values: PagoInput) => {
    setServerError(null);
    startTransition(async () => {
      const resultado = await registrarPago(values);
      if (!resultado.ok) {
        setServerError(resultado.error);
        toast.error(resultado.error);
        return;
      }
      toast.success("Pago registrado");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(origen === "prestamo" ? `/prestamos/${operacionId}` : `/ventas`);
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <input type="hidden" {...register("operacionCreditoId")} />

      <div>
        <Label htmlFor="valor">Valor recibido *</Label>
        <MoneyInput id="valor" autoFocus aria-invalid={!!errors.valor || excedeSaldo} {...register("valor", { setValueAs: limpiarMoneda })} />
        {errors.valor ? <p className="mt-1.5 text-[12px] text-danger">{errors.valor.message}</p> : null}
        {!errors.valor && excedeSaldo ? (
          <p className="mt-1.5 text-[12px] font-semibold text-danger">
            El pago no puede superar el saldo pendiente ({formatearMoneda(saldoPendiente)}). Ajusta el valor.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fechaPago">Fecha *</Label>
          <Controller
            name="fechaPago"
            control={control}
            render={({ field }) => <DatePicker id="fechaPago" value={field.value} onChange={field.onChange} />}
          />
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
        <Button type="button" variant="ghost" onClick={onCancel ?? (() => router.back())} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || excedeSaldo}>
          {isPending ? "Registrando…" : "Registrar pago"}
        </Button>
      </div>
    </form>
  );
}
