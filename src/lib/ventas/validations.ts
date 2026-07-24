import { z } from "zod";

/**
 * Regla dura #5 (CLAUDE.md): no hay catálogo de productos — cada ítem de la
 * venta describe su artículo en el momento de vender.
 */
export const ventaItemSchema = z.object({
  nombreProducto: z.string().min(1, "Escribe el nombre del artículo").max(200),
  descripcion: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  costo: z.coerce.number().min(0, "El costo no puede ser negativo"),
  precioVenta: z.coerce.number().positive("El precio debe ser mayor que cero"),
});

/**
 * Nueva Venta (doc 07 Módulo 5): único punto de entrada comercial, sin
 * catálogo. Regla dura #4: las ventas a crédito NUNCA calculan interés —
 * por eso este esquema ni siquiera tiene un campo de tasa de interés.
 */
export const ventaSchema = z
  .object({
    clienteId: z.string().uuid().optional(),
    nombreCliente: z.string().min(1, "Escribe el nombre del cliente").max(150),
    whatsappCliente: z
      .string()
      .min(1, "Escribe el WhatsApp del cliente")
      .regex(/^[0-9+()\s-]{7,20}$/, "Ese número no parece válido"),
    tipoPago: z.enum(["contado", "credito"]),
    fecha: z.string().min(1, "Elige la fecha"),
    items: z.array(ventaItemSchema).min(1, "Agrega al menos un artículo"),
    numeroCuotas: z.coerce.number().int().positive().optional(),
    plazoDias: z.coerce.number().int().positive().optional(),
  })
  .refine((v) => v.tipoPago !== "credito" || (v.numeroCuotas && v.plazoDias), {
    message: "Indica número de cuotas y plazo para la venta a crédito",
    path: ["numeroCuotas"],
  });

export type VentaInput = z.infer<typeof ventaSchema>;
export type VentaItemInput = z.infer<typeof ventaItemSchema>;
