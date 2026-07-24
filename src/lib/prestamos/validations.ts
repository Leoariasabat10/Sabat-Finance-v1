import { z } from "zod";

/**
 * Flujo rápido de préstamo (doc 07, Módulo 4): nombre + whatsapp del cliente,
 * valor, interés y plazo. Si el cliente no existe (por whatsapp) se crea
 * automáticamente al guardar — ver lib/prestamos/actions.ts.
 */
export const prestamoSchema = z.object({
  clienteId: z.string().uuid().optional(),
  nombreCliente: z.string().min(1, "Escribe el nombre del cliente").max(150),
  whatsappCliente: z
    .string()
    .min(1, "Escribe el WhatsApp del cliente")
    .regex(/^[0-9+()\s-]{7,20}$/, "Ese número no parece válido"),
  montoCapital: z.coerce.number().positive("El valor debe ser mayor que cero"),
  tasaInteres: z.coerce.number().min(0, "La tasa no puede ser negativa"),
  tipoInteres: z.enum(["mensual", "diario", "semanal", "quincenal", "personalizado"]),
  diasBasePersonalizado: z.coerce.number().positive().optional(),
  plazoDias: z.coerce.number().int().positive("El plazo debe ser mayor que cero"),
  formaPago: z.enum(["pago_unico", "semanal", "quincenal", "mensual"]),
  fechaOperacion: z.string().min(1, "Elige la fecha"),
});

export type PrestamoInput = z.infer<typeof prestamoSchema>;
