"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actualizarConfiguracion } from "@/lib/configuracion/actions";
import { configuracionSchema, type ConfiguracionInput } from "@/lib/configuracion/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MoneyInput, limpiarMoneda, formatearMiles } from "@/components/ui/money-input";

export function ConfiguracionForm({ valoresIniciales }: { valoresIniciales: ConfiguracionInput }) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit } = useForm<ConfiguracionInput>({
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
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="tasaInteresDefecto">Tasa de interés por defecto (%)</Label>
            <Input id="tasaInteresDefecto" type="number" step="0.1" min={0} {...register("tasaInteresDefecto")} />
          </div>
          <div>
            <Label htmlFor="diasAlertaVencimiento">Días de alerta antes de vencer</Label>
            <Input id="diasAlertaVencimiento" type="number" min={0} {...register("diasAlertaVencimiento")} />
          </div>
          <div>
            <Label htmlFor="tipoMora">Tipo de mora</Label>
            <Select id="tipoMora" {...register("tipoMora")}>
              <option value="porcentaje_diario">Porcentaje diario</option>
              <option value="fijo">Fijo por día</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="tasaMoraDefecto">Tasa de mora por defecto</Label>
            <Input id="tasaMoraDefecto" type="number" step="0.1" min={0} {...register("tasaMoraDefecto")} />
          </div>
          <div>
            <Label htmlFor="ordenAplicacionPago">Orden de aplicación de pagos</Label>
            <Select id="ordenAplicacionPago" {...register("ordenAplicacionPago")}>
              <option value="interes_primero">Interés primero, luego capital</option>
              <option value="proporcional">Proporcional</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="capitalInicial">Capital inicial de caja</Label>
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
