"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editarPrestamo } from "@/lib/prestamos/actions";
import { prestamoEditSchema, type PrestamoEditInput } from "@/lib/prestamos/validations";
import { calcularInteres, generarCalendarioCuotas } from "@/lib/calculos";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent } from "@/components/ui/card";
import { MoneyInput, limpiarMoneda, formatearMiles } from "@/components/ui/money-input";

function diasPorPeriodoFormaPago(formaPago: PrestamoEditInput["formaPago"], plazoDias: number): number {
  switch (formaPago) {
    case "pago_unico":
      return plazoDias || 1;
    case "semanal":
      return 7;
    case "quincenal":
      return 15;
    case "mensual":
      return 30;
  }
}

interface EditarPrestamoFormProps {
  prestamoId: string;
  valoresIniciales: PrestamoEditInput;
}

/**
 * Formulario de edición (auditoría Sprint 1, punto #2). Misma simulación
 * en vivo que crear-préstamo, para que corregir un error de digitación se
 * sienta igual de confiable que crear el préstamo desde cero.
 */
export function EditarPrestamoForm({ prestamoId, valoresIniciales }: EditarPrestamoFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PrestamoEditInput>({
    resolver: zodResolver(prestamoEditSchema),
    defaultValues: valoresIniciales,
  });

  const valores = watch();

  const simulacion = useMemo(() => {
    if (!valores.montoCapital || valores.montoCapital <= 0 || !valores.plazoDias || valores.plazoDias <= 0) {
      return null;
    }
    try {
      const interes = calcularInteres({
        montoCapital: Number(valores.montoCapital),
        tasaInteres: (Number(valores.tasaInteres) || 0) / 100,
        tipoInteres: valores.tipoInteres,
        plazoDias: Number(valores.plazoDias),
        diasBasePersonalizado: valores.diasBasePersonalizado,
      });
      const diasPorCuota = diasPorPeriodoFormaPago(valores.formaPago, Number(valores.plazoDias));
      const numeroCuotas = Math.max(1, Math.round(Number(valores.plazoDias) / diasPorCuota));
      const cuotas = generarCalendarioCuotas({
        montoCapital: Number(valores.montoCapital),
        interesTotal: interes.interesTotal,
        numeroCuotas,
        fechaOperacion: valores.fechaOperacion,
        diasPorPeriodo: diasPorCuota,
      });
      return { interes, cuotas };
    } catch {
      return null;
    }
  }, [valores]);

  const onSubmit = (values: PrestamoEditInput) => {
    setServerError(null);
    startTransition(async () => {
      const resultado = await editarPrestamo(prestamoId, { ...values, tasaInteres: values.tasaInteres / 100 });
      if (!resultado.ok) {
        setServerError(resultado.error);
        return;
      }
      router.push(`/prestamos/${prestamoId}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-5">
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="montoCapital">Valor prestado *</Label>
              <MoneyInput
                id="montoCapital"
                defaultValue={formatearMiles(valoresIniciales.montoCapital)}
                aria-invalid={!!errors.montoCapital}
                {...register("montoCapital", { setValueAs: limpiarMoneda })}
              />
              {errors.montoCapital ? (
                <p className="mt-1.5 text-[12px] text-danger">{errors.montoCapital.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="fechaOperacion">Fecha del préstamo *</Label>
              <Controller
                name="fechaOperacion"
                control={control}
                render={({ field }) => <DatePicker id="fechaOperacion" value={field.value} onChange={field.onChange} />}
              />
            </div>

            <div>
              <Label htmlFor="tipoInteres">Tipo de interés *</Label>
              <Select id="tipoInteres" {...register("tipoInteres")}>
                <option value="mensual">Mensual</option>
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="personalizado">Personalizado</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="tasaInteres">Tasa de interés (%) *</Label>
              <Input
                id="tasaInteres"
                type="number"
                min={0}
                step="0.5"
                aria-invalid={!!errors.tasaInteres}
                {...register("tasaInteres", {
                  setValueAs: (v) => (v === "" ? 0 : Number(v)),
                })}
              />
              {errors.tasaInteres ? (
                <p className="mt-1.5 text-[12px] text-danger">{errors.tasaInteres.message}</p>
              ) : null}
            </div>

            {valores.tipoInteres === "personalizado" ? (
              <div>
                <Label htmlFor="diasBasePersonalizado">Días base del periodo *</Label>
                <Input
                  id="diasBasePersonalizado"
                  type="number"
                  min={1}
                  placeholder="ej. 10 para '3% cada 10 días'"
                  {...register("diasBasePersonalizado")}
                />
              </div>
            ) : null}

            <div>
              <Label htmlFor="plazoDias">Plazo (días) *</Label>
              <Input
                id="plazoDias"
                type="number"
                min={1}
                aria-invalid={!!errors.plazoDias}
                {...register("plazoDias")}
              />
              {errors.plazoDias ? (
                <p className="mt-1.5 text-[12px] text-danger">{errors.plazoDias.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="formaPago">Forma de pago *</Label>
              <Select id="formaPago" {...register("formaPago")}>
                <option value="pago_unico">Pago único</option>
                <option value="semanal">Cuotas semanales</option>
                <option value="quincenal">Cuotas quincenales</option>
                <option value="mensual">Cuotas mensuales</option>
              </Select>
            </div>
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
            {isPending ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <div>
        <Card className="sticky top-4">
          <CardContent className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-foreground">Simulación en vivo</h3>
            {simulacion ? (
              <>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted">Interés total</span>
                  <span className="font-mono font-bold tabular-nums">{formatearMoneda(simulacion.interes.interesTotal)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted">Total a pagar</span>
                  <span className="font-mono font-bold tabular-nums text-accent">{formatearMoneda(simulacion.interes.totalAPagar)}</span>
                </div>
                <div className="mt-2 border-t border-[color:var(--border)] pt-3">
                  <p className="mb-2 text-[12px] font-semibold text-muted">
                    Calendario de cuotas ({simulacion.cuotas.length})
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {simulacion.cuotas.map((c) => (
                      <li key={c.numeroCuota} className="flex justify-between text-[12.5px]">
                        <span className="text-muted">
                          #{c.numeroCuota} · {formatearFecha(c.fechaVencimiento)}
                        </span>
                        <span className="font-mono font-semibold tabular-nums">{formatearMoneda(c.total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-muted">Completa valor y plazo para ver la simulación.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
