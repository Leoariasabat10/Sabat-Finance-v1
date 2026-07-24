import { z } from "zod";

export const configuracionSchema = z.object({
  nombreNegocio: z.string().min(1, "Escribe el nombre del negocio").max(150),
  moneda: z.string().min(1).max(10),
  tasaInteresDefecto: z.coerce.number().min(0),
  diasAlertaVencimiento: z.coerce.number().int().min(0),
  tasaMoraDefecto: z.coerce.number().min(0),
  tipoMora: z.enum(["porcentaje_diario", "fijo"]),
  ordenAplicacionPago: z.enum(["interes_primero", "proporcional"]),
  capitalInicial: z.coerce.number(),
});

export type ConfiguracionInput = z.infer<typeof configuracionSchema>;
