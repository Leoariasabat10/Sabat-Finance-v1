"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearCliente, actualizarCliente } from "@/lib/clientes/actions";
import { clienteSchema, type ClienteInput } from "@/lib/validations/cliente";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface ClienteFormProps {
  clienteId?: string;
  defaultValues?: Partial<ClienteInput>;
}

const VALORES_VACIOS: ClienteInput = {
  nombre: "",
  whatsapp: "",
  cedula: undefined,
  telefono: undefined,
  direccion: undefined,
  barrio: undefined,
  ciudad: undefined,
  referencia: undefined,
  notas: undefined,
};

export function ClienteForm({ clienteId, defaultValues }: ClienteFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const esEdicion = Boolean(clienteId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteInput>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { ...VALORES_VACIOS, ...defaultValues },
  });

  const onSubmit = (values: ClienteInput) => {
    setServerError(null);
    startTransition(async () => {
      if (esEdicion) {
        const resultado = await actualizarCliente(clienteId as string, values);
        if (!resultado.ok) {
          setServerError(resultado.error);
          return;
        }
        router.push(`/clientes/${clienteId}`);
      } else {
        const resultado = await crearCliente(values);
        if (!resultado.ok) {
          setServerError(resultado.error);
          return;
        }
        router.push(`/clientes/${resultado.data.id}`);
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              placeholder="María Pérez"
              autoComplete="name"
              aria-invalid={!!errors.nombre}
              {...register("nombre")}
            />
            {errors.nombre ? (
              <p className="mt-1.5 text-[12px] text-danger">{errors.nombre.message}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              placeholder="3001234567"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={!!errors.whatsapp}
              {...register("whatsapp")}
            />
            {errors.whatsapp ? (
              <p className="mt-1.5 text-[12px] text-danger">{errors.whatsapp.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cedula">Cédula (opcional)</Label>
            <Input id="cedula" {...register("cedula")} />
          </div>
          <div>
            <Label htmlFor="telefono">Otro teléfono (opcional)</Label>
            <Input id="telefono" {...register("telefono")} />
          </div>
          <div>
            <Label htmlFor="direccion">Dirección (opcional)</Label>
            <Input id="direccion" {...register("direccion")} />
          </div>
          <div>
            <Label htmlFor="barrio">Barrio (opcional)</Label>
            <Input id="barrio" {...register("barrio")} />
          </div>
          <div>
            <Label htmlFor="ciudad">Ciudad (opcional)</Label>
            <Input id="ciudad" {...register("ciudad")} />
          </div>
          <div>
            <Label htmlFor="referencia">Referencia (opcional)</Label>
            <Input id="referencia" placeholder="Quién lo recomendó" {...register("referencia")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea id="notas" rows={3} {...register("notas")} />
          </div>
        </CardContent>
      </Card>

      {serverError ? (
        <div
          role="alert"
          className="rounded-sm bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
        >
          {serverError}
        </div>
      ) : null}

      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </div>
    </form>
  );
}
