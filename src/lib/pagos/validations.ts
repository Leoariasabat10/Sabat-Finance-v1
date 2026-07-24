import { z } from "zod";

export const pagoSchema = z.object({
  operacionCreditoId: z.string().uuid(),
  valor: z.coerce.number().positive("El valor del pago debe ser mayor que cero"),
  fechaPago: z.string().min(1, "Elige la fecha"),
  metodoPago: z.enum(["efectivo", "transferencia", "otro"]).default("efectivo"),
  tipoAbono: z.enum(["cuota_completa", "abono_capital", "abono_interes"]).default("cuota_completa"),
  observaciones: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});

export type PagoInput = z.infer<typeof pagoSchema>;
