// Tipos compartidos del motor financiero. Reflejan los enums de Prisma
// (prisma/schema.prisma) pero como unions de string planos, para que estas
// funciones sean puras y no dependan del cliente de Prisma.

export type TipoInteres = "mensual" | "diario" | "semanal" | "quincenal" | "personalizado";

export type FormaPago = "pago_unico" | "semanal" | "quincenal" | "mensual";

export type OrdenAplicacionPago = "interes_primero" | "proporcional";

export type TipoAbono = "cuota_completa" | "abono_capital" | "abono_interes" | "mora";

export type TipoMora = "porcentaje_diario" | "fijo";

export type Origen = "prestamo" | "venta";

export interface ParametrosInteres {
  montoCapital: number;
  tasaInteres: number; // ej. 0.10 = 10%
  tipoInteres: TipoInteres;
  plazoDias: number;
  /** Solo requerido cuando tipoInteres === 'personalizado' (ej. "cada 10 días" → 10). */
  diasBasePersonalizado?: number;
}

export interface ResultadoInteres {
  interesTotal: number;
  totalAPagar: number;
  numeroPeriodos: number;
  diasPorPeriodo: number;
}

export interface CuotaCalculada {
  numeroCuota: number;
  fechaVencimiento: string; // YYYY-MM-DD
  capital: number;
  interes: number;
  total: number;
}

export interface ParametrosCalendario {
  montoCapital: number;
  interesTotal: number;
  numeroCuotas: number;
  fechaOperacion: string; // YYYY-MM-DD
  diasPorPeriodo: number;
}

export interface EstadoPago {
  interesPendiente: number;
  capitalPendiente: number;
}

export interface ParametrosAplicarPago extends EstadoPago {
  montoAbono: number;
  tipoAbono: TipoAbono;
  ordenAplicacionPago: OrdenAplicacionPago;
}

export interface ResultadoAplicarPago {
  aplicadoInteres: number;
  aplicadoCapital: number;
  interesPendiente: number;
  capitalPendiente: number;
  saldoPendiente: number;
  pagadoCompleto: boolean;
}

export interface ParametrosMora {
  valorCuota: number;
  diasAtraso: number;
  tipoMora: TipoMora;
  tasaMora: number; // porcentaje (0.01 = 1%) si tipoMora=porcentaje_diario, o valor fijo por día si tipoMora=fijo
}

export interface ParametrosRefinanciacion {
  saldoPendienteConsolidado: number;
  nuevaTasaInteres: number;
  nuevoTipoInteres: TipoInteres;
  nuevoPlazoDias: number;
  numeroCuotas: number;
  fechaOperacion: string;
  diasBasePersonalizado?: number;
}

export interface ResultadoRefinanciacion {
  montoCapital: number;
  interes: ResultadoInteres;
  cuotas: CuotaCalculada[];
}

export interface ParametrosRenovacion {
  capitalPendiente: number;
  tasaInteres: number;
  tipoInteres: TipoInteres;
  fechaVencimientoActual: string;
  diasBasePersonalizado?: number;
}

export interface ResultadoRenovacion {
  interesPeriodo: number;
  nuevaFechaVencimiento: string;
  capitalPendiente: number;
}
