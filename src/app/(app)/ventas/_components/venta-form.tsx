"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearVenta } from "@/lib/ventas/actions";
import { ventaSchema, type VentaInput } from "@/lib/ventas/validations";
import { formatearMoneda, fechaHoyIso } from "@/lib/formato";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MoneyInput, limpiarMoneda } from "@/components/ui/money-input";

const ITEM_VACIO = {
  nombreProducto: "",
  descripcion: "",
  costo: "" as unknown as number,
  precioVenta: "" as unknown as number,
};

const VALORES_INICIALES: VentaInput = {
  nombreCliente: "",
  whatsappCliente: "",
  tipoPago: "contado",
  fecha: fechaHoyIso(),
  items: [ITEM_VACIO],
};

export function VentaForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VentaInput>({
    resolver: zodResolver(ventaSchema),
    defaultValues: VALORES_INICIALES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const valores = watch();

  const totales = useMemo(() => {
    const total = (valores.items ?? []).reduce((acc, i) => acc + (Number(i.precioVenta) || 0), 0);
    const utilidad = (valores.items ?? []).reduce(
      (acc, i) => acc + ((Number(i.precioVenta) || 0) - (Number(i.costo) || 0)),
      0,
    );
    const cuota =
      valores.tipoPago === "credito" && valores.numeroCuotas
        ? total / Number(valores.numeroCuotas)
        : null;
    return { total, utilidad, cuota };
  }, [valores]);

  const onSubmit = (values: VentaInput) => {
    setServerError(null);
    startTransition(async () => {
      const resultado = await crearVenta(values);
      if (!resultado.ok) {
        setServerError(resultado.error);
        return;
      }
      router.push(`/ventas/${resultado.data.id}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nombreCliente">Nombre del cliente *</Label>
              <Input id="nombreCliente" placeholder="María Pérez" autoComplete="name" autoFocus aria-invalid={!!errors.nombreCliente} {...register("nombreCliente")} />
              {errors.nombreCliente ? <p className="mt-1.5 text-[12px] text-danger">{errors.nombreCliente.message}</p> : null}
            </div>
            <div>
              <Label htmlFor="whatsappCliente">WhatsApp *</Label>
              <Input id="whatsappCliente" placeholder="3001234567" inputMode="tel" aria-invalid={!!errors.whatsappCliente} {...register("whatsappCliente")} />
              {errors.whatsappCliente ? <p className="mt-1.5 text-[12px] text-danger">{errors.whatsappCliente.message}</p> : null}
            </div>
            <div>
              <Label htmlFor="tipoPago">Tipo de pago *</Label>
              <Select id="tipoPago" {...register("tipoPago")}>
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="fecha">Fecha *</Label>
              <Input id="fecha" type="date" {...register("fecha")} />
            </div>

            {valores.tipoPago === "credito" ? (
              <>
                <div>
                  <Label htmlFor="numeroCuotas">Número de cuotas *</Label>
                  <Input id="numeroCuotas" type="number" min={1} {...register("numeroCuotas")} />
                </div>
                <div>
                  <Label htmlFor="plazoDias">Plazo total (días) *</Label>
                  <Input id="plazoDias" type="number" min={1} {...register("plazoDias")} />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Artículos</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => append(ITEM_VACIO)}
              >
                + Agregar artículo
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-3 rounded-sm border border-[color:var(--border)] p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <div>
                  <Label htmlFor={`items.${index}.nombreProducto`}>Artículo *</Label>
                  <Input
                    id={`items.${index}.nombreProducto`}
                    placeholder="Ej. Perfume Carolina Herrera"
                    {...register(`items.${index}.nombreProducto` as const)}
                  />
                  {errors.items?.[index]?.nombreProducto ? (
                    <p className="mt-1.5 text-[12px] text-danger">{errors.items[index]?.nombreProducto?.message}</p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor={`items.${index}.costo`}>Costo</Label>
                  <MoneyInput
                    id={`items.${index}.costo`}
                    placeholder="0"
                    {...register(`items.${index}.costo` as const, { setValueAs: limpiarMoneda })}
                  />
                </div>
                <div>
                  <Label htmlFor={`items.${index}.precioVenta`}>Precio de venta *</Label>
                  <MoneyInput
                    id={`items.${index}.precioVenta`}
                    placeholder="100.000"
                    {...register(`items.${index}.precioVenta` as const, { setValueAs: limpiarMoneda })}
                  />
                </div>
                <div className="flex items-end">
                  {fields.length > 1 ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                      Quitar
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {errors.items?.message ? <p className="text-[12px] text-danger">{errors.items.message}</p> : null}
          </CardContent>
        </Card>

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
            {isPending ? "Guardando…" : "Crear venta"}
          </Button>
        </div>
      </div>

      <div>
        <Card className="sticky top-4">
          <CardContent className="flex flex-col gap-3">
            <h3 className="text-sm font-bold">Resumen</h3>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">Total de la venta</span>
              <span className="font-mono font-bold tabular-nums text-accent">{formatearMoneda(totales.total)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted">Utilidad</span>
              <span className="font-mono font-bold tabular-nums">{formatearMoneda(totales.utilidad)}</span>
            </div>
            {totales.cuota !== null ? (
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">Cuota (sin interés)</span>
                <span className="font-mono font-bold tabular-nums">{formatearMoneda(totales.cuota)}</span>
              </div>
            ) : null}
            <p className="mt-1 text-[11px] text-muted">
              Las ventas a crédito nunca cobran interés — el total se reparte en partes iguales.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
