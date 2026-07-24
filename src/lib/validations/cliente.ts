import { z } from "zod";

/**
 * Regla dura (CLAUDE.md #6): clientes solo exige nombre + whatsapp.
 * Todo lo demás es opcional y nunca bloquea el registro de una venta o préstamo.
 */
export const clienteSchema = z.object({
  nombre: z
    .string()
    .min(1, "Escribe el nombre del cliente")
    .max(150, "El nombre es muy largo"),
  whatsapp: z
    .string()
    .min(1, "Escribe el WhatsApp del cliente")
    .regex(/^[0-9+()\s-]{7,20}$/, "Ese número no parece válido"),
  cedula: z
    .string()
    .trim()
    .max(30, "La cédula es muy larga")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  telefono: z
    .string()
    .trim()
    .max(20, "Ese teléfono es muy largo")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  direccion: z
    .string()
    .trim()
    .max(200, "La dirección es muy larga")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  barrio: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  ciudad: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  referencia: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  notas: z
    .string()
    .trim()
    .max(2000, "La nota es muy larga")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});

export type ClienteInput = z.infer<typeof clienteSchema>;

export const notaClienteSchema = z.object({
  clienteId: z.string().uuid(),
  texto: z.string().min(1, "Escribe una nota").max(2000, "La nota es muy larga"),
});

export type NotaClienteInput = z.infer<typeof notaClienteSchema>;

export const etiquetaSchema = z.object({
  nombre: z.string().min(1, "Escribe el nombre de la etiqueta").max(40),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Elige un color válido"),
});

export type EtiquetaInput = z.infer<typeof etiquetaSchema>;
