"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { crearPrestamo } from "@/lib/prestamos/actions";
import { buscarClientesRapido, type ClienteSugerido } from "@/lib/busqueda/actions";
import { prestamoSchema, type PrestamoInput } from "@/lib/prestamos/validations";
import { calcularInteres, generarCalendarioCuotas } from "@/lib/calculos";
import { formatearMoneda, formatearFecha, fechaHoyIso } from "@/lib/formato";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MoneyInput, limpiarMoneda } from "@/components/ui/money-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Auditoría Sprint 1, punto #5: a partir de este monto se pide una
// segunda confirmación explícita antes de crear el préstamo, para atajar
// errores de digitación (un cero de más) antes de que muevan dinero real.
const UMBRAL_DOBLE_CONFIRMACION = 10_000_000;

// El campo de tasa vive en espacio de PORCENTAJE (el usuario escribe "10"
// para 10%); se convierte a fracción (0.10) solo al simular y al enviar.
function valoresIniciales(tasaDefecto: number): PrestamoInput {
  return {
    nombreCliente: "",
    whatsappCliente: "",
    montoCapital: "" as unknown as number,
    tasaInteres: tasaDefecto,
    tipoInteres: "mensual",
    plazoDias: 30,
    formaPago: "mensual",
    fechaOperacion: fechaHoyIso(),
  };
}

function diasPorPeriodoFormaPago(formaPago: PrestamoInput["formaPago"], plazoDias: number): number {
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

export function PrestamoForm({ tasaDefecto = 10 }: { tasaDefecto?: number }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [valoresPendientesConfirmacion, setValoresPendientesConfirmacion] = useState<PrestamoInput | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PrestamoInput>({
    resolver: zodResolver(prestamoSchema),
    defaultValues: valoresIniciales(tasaDefecto),
  });

  const valores = watch();

  // Fricción real encontrada simulando un día de uso (27 jul 2026): escribir
  // el nombre de un cliente que ya existe no sugería nada — obligaba a
  // recordar de memoria su WhatsApp exacto para no crear un duplicado.
  const [sugerencias, setSugerencias] = useState<ClienteSugerido[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const clienteSeleccionadoRef = useRef<string | null>(null);

  useEffect(() => {
    const nombre = valores.nombreCliente;
    if (!nombre || nombre.length < 2 || nombre === clienteSeleccionadoRef.current) {
      setSugerencias([]);
      return;
    }
    const t = setTimeout(() => {
      buscarClientesRapido(nombre).then(setSugerencias);
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valores.nombreCliente]);

  const seleccionarCliente = (c: ClienteSugerido) => {
    clienteSeleccionadoRef.current = c.nombre;
    setValue("nombreCliente", c.nombre, { shouldValidate: true });
    setValue("whatsappCliente", c.whatsapp, { shouldValidate: true });
    setSugerencias([]);
    setMostrarSugerencias(false);
  };

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
        fechaOperacion: valores.fechaOperacion || fechaHoyIso(),
        diasPorPeriodo: diasPorCuota,
      });
      return { interes, cuotas };
    } catch {
      return null;
    }
  }, [valores]);

  const crear = (values: PrestamoInput) => {
    setServerError(null);
    startTransition(async () => {
      const resultado = await crearPrestamo({ ...values, tasaInteres: values.tasaInteres / 100 });
      if (!resultado.ok) {
        setServerError(resultado.error);
        toast.error(resultado.error);
        return;
      }
      toast.success("Préstamo creado");
      router.push(`/prestamos/${resultado.data.id}`);
      router.refresh();
    });
  };

  const onSubmit = (values: PrestamoInput) => {
    // Auditoría Sprint 1, punto #5: monto inusualmente alto -> se pide
    // confirmar antes de tocar la base de datos.
    if (Number(values.montoCapital) >= UMBRAL_DOBLE_CONFIRMACION) {
      setValoresPendientesConfirmacion(values);
      return;
    }
    crear(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-5">
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
              <Label htmlFor="nombreCliente">Nombre del cliente *</Label>
              <Input
                id="nombreCliente"
                placeholder="María Pérez"
                autoComplete="off"
                autoFocus
                aria-invalid={!!errors.nombreCliente}
                {...register("nombreCliente")}
                onFocus={() => setMostrarSugerencias(true)}
                onBlur={(e) => {
                  register("nombreCliente").onBlur(e);
                  setTimeout(() => setMostrarSugerencias(false), 150);
                }}
              />
              {errors.nombreCliente ? (
                <p className="mt-1.5 text-[12px] text-danger">{errors.nombreCliente.message}</p>
              ) : null}
              {mostrarSugerencias && sugerencias.length > 0 ? (
                <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-[color:var(--border)] bg-card shadow-lg">
                  {sugerencias.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => seleccionarCliente(c)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition-colors duration-premium hover:bg-hover-bg"
                      >
                        <span className="font-semibold text-foreground">{c.nombre}</span>
                        <span className="text-muted">{c.whatsapp}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div>
              <Label htmlFor="whatsappCliente">WhatsApp *</Label>
              <Input
                id="whatsappCliente"
                placeholder="3001234567"
                inputMode="tel"
                aria-invalid={!!errors.whatsappCliente}
                {...register("whatsappCliente")}
              />
              {errors.whatsappCliente ? (
                <p className="mt-1.5 text-[12px] text-danger">{errors.whatsappCliente.message}</p>
              ) : null}
              <p className="mt-1 text-[11px] text-muted">
                Si ya existe un cliente con este WhatsApp, se usa el mismo — no se duplica.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="montoCapital">Valor prestado *</Label>
              <MoneyInput
                id="montoCapital"
                placeholder="500.000"
                aria-invalid={!!errors.montoCapital}
                {...register("montoCapital", { setValueAs: limpiarMoneda })}
              />
              {errors.montoCapital ? (
                <p className="mt-1.5 text-[12px] text-danger">{errors.montoCapital.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="fechaOperacion">Fecha del préstamo *</Label>
              <Input id="fechaOperacion" type="date" {...register("fechaOperacion")} />
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
            {isPending ? "Guardando…" : "Crear préstamo"}
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

      <Dialog
        open={valoresPendientesConfirmacion !== null}
        onOpenChange={(open) => !open && setValoresPendientesConfirmacion(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirma este monto</DialogTitle>
            <DialogDescription>
              Vas a prestar{" "}
              <strong className="text-foreground">
                {valoresPendientesConfirmacion ? formatearMoneda(valoresPendientesConfirmacion.montoCapital) : ""}
              </strong>
              . Es un monto alto — revisa que no tenga un cero de más antes de continuar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setValoresPendientesConfirmacion(null)} disabled={isPending}>
              Revisar de nuevo
            </Button>
            <Button
              onClick={() => valoresPendientesConfirmacion && crear(valoresPendientesConfirmacion)}
              disabled={isPending}
            >
              {isPending ? "Guardando…" : "Sí, el monto es correcto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
