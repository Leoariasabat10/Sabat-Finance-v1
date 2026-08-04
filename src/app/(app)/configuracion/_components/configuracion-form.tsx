"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CalendarClock, CircleDollarSign, Percent, ShieldAlert, Wallet } from "lucide-react";
import { actualizarConfiguracion } from "@/lib/configuracion/actions";
import { configuracionSchema, type ConfiguracionInput } from "@/lib/configuracion/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyInput, limpiarMoneda, formatearMiles } from "@/components/ui/money-input";

export function ConfiguracionForm({ valoresIniciales }: { valoresIniciales: ConfiguracionInput }) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, control, handleSubmit } = useForm<ConfiguracionInput>({
    resolver: zodResolver(configuracionSchema),
    defaultValues: {
      ...valoresIniciales,
      capitalInicial: formatearMiles(valoresIniciales.capitalInicial) as unknown as number,
    },
  });

  const onSubmit = (values: ConfiguracionInput) => {
    setMensaje(null);
    startTransition(async () => {
      const resultado = await actualizarConfiguracion(values);
      if (!resultado.ok) {
        setMensaje({ tipo: "error", texto: resultado.error });
        return;
      }
      setMensaje({ tipo: "ok", texto: "Configuración guardada." });
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-accent" aria-hidden />
            Negocio
          </CardTitle>
          <p className="mt-1 text-[12.5px] text-muted">Los datos que identifican tu negocio en la aplicación.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nombreNegocio">Nombre del negocio</Label>
            <Input id="nombreNegocio" {...register("nombreNegocio")} />
          </div>
          <div>
            <Label htmlFor="moneda">Moneda</Label>
            <Input id="moneda" {...register("moneda")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-accent" aria-hidden />
            Reglas financieras
          </CardTitle>
          <p className="mt-1 text-[12.5px] text-muted">Valores usados como punto de partida en tus nuevos préstamos.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="tasaInteresDefecto" className="flex items-center gap-1.5"><Percent className="h-3.5 w-3.5 text-faint" aria-hidden />Tasa de interés por defecto (%)</Label>
            <Input id="tasaInteresDefecto" type="number" step="0.1" min={0} {...register("tasaInteresDefecto")} />
          </div>
          <div>
            <Label htmlFor="diasAlertaVencimiento" className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-faint" aria-hidden />Días de alerta antes de vencer</Label>
            <Input id="diasAlertaVencimiento" type="number" min={0} {...register("diasAlertaVencimiento")} />
          </div>
          <div>
            <Label htmlFor="tipoMora" className="flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5 text-faint" aria-hidden />Tipo de mora</Label>
            <Controller
              name="tipoMora"
              control={control}
              render={({ field }) => (
                <ToggleGroup type="single" value={field.value} onValueChange={(v) => v && field.onChange(v)} className="w-full">
                  <ToggleGroupItem value="porcentaje_diario" className="flex-1">Porcentaje diario</ToggleGroupItem>
                  <ToggleGroupItem value="fijo" className="flex-1">Fijo por día</ToggleGroupItem>
                </ToggleGroup>
              )}
            />
          </div>
          <div>
            <Label htmlFor="tasaMoraDefecto">Tasa de mora por defecto</Label>
            <Input id="tasaMoraDefecto" type="number" step="0.1" min={0} {...register("tasaMoraDefecto")} />
          </div>
          <div>
            <Label htmlFor="ordenAplicacionPago" className="flex items-center gap-1.5"><CircleDollarSign className="h-3.5 w-3.5 text-faint" aria-hidden />Orden de aplicación de pagos</Label>
            <Controller
              name="ordenAplicacionPago"
              control={control}
              render={({ field }) => (
                <ToggleGroup type="single" value={field.value} onValueChange={(v) => v && field.onChange(v)} className="w-full">
                  <ToggleGroupItem value="interes_primero" className="flex-1">Interés primero</ToggleGroupItem>
                  <ToggleGroupItem value="proporcional" className="flex-1">Proporcional</ToggleGroupItem>
                </ToggleGroup>
              )}
            />
          </div>
          <div>
            <Label htmlFor="capitalInicial" className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-faint" aria-hidden />Capital inicial de caja</Label>
            <MoneyInput id="capitalInicial" placeholder="0" {...register("capitalInicial", { setValueAs: limpiarMoneda })} />
          </div>
        </CardContent>
      </Card>

      {mensaje ? (
        <div
          role="alert"
          className={
            mensaje.tipo === "ok"
              ? "rounded-sm bg-success-bg px-3 py-2.5 text-[12.5px] font-semibold text-success"
              : "rounded-sm bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
          }
        >
          {mensaje.texto}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
