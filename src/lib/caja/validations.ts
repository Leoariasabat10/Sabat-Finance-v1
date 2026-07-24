import { z } from "zod";

export const movimientoCajaSchema = z.object({
  tipo: z.enum(["ingreso", "egreso"]),
  monto: z.coerce.number().positive("El monto debe ser mayor que cero"),
  categoria: z.string().trim().max(60).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  fecha: z.string().min(1, "Elige la fecha"),
  descripcion: z.string().trim().max(300).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
});

export type MovimientoCajaInput = z.infer<typeof movimientoCajaSchema>;
