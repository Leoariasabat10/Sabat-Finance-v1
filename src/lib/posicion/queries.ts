import { prisma } from "@/lib/db";
import { evaluarOperacionRetenida, INCLUDE_OPERACION_DETALLE, type ConfianzaDato } from "@/lib/clientes/metricas";

/**
 * La Posición del Negocio (visión final del producto, 26 jul 2026): el eje
 * alrededor del cual gira "Mi dinero" — dónde está cada peso del capital,
 * en vez de una lista de préstamos o un libro de caja suelto.
 *
 * Nota deliberada: esto NO es lo mismo que `obtenerSaldoActual()` de
 * lib/caja/motor.ts. El saldo de caja es efectivo real (entra en la venta
 * de contado, en el cobro de una cuota, sale al desembolsar un préstamo).
 * El costo de la mercancía vendida a crédito nunca pasa por caja (no hay
 * movimiento de caja en una venta a crédito, ver ventas/actions.ts) — por
 * eso "capital invertido en mercancía" es una categoría aparte que el
 * saldo de caja no captura, y capital_disponible aquí puede ser menor que
 * el saldo de caja.
 */

export interface ClienteRetenido {
  operacionId: string;
  clienteId: string;
  clienteNombre: string;
  montoCapital: number;
  saldoPendiente: number;
  fechaOperacion: Date;
  /** null cuando la única evidencia es comportamiento de pago, sin fecha usable. */
  antiguedadDias: number | null;
  interesGeneradoEstimado: number;
  confianza: ConfianzaDato;
  origenDeteccion: "fecha" | "comportamiento" | "fecha+comportamiento";
}

export interface PosicionDelNegocio {
  capitalTotal: number;
  capitalPrestado: number;
  capitalInvertidoMercancia: number;
  capitalDisponible: number;
  capitalRetenido: number;
  clientesRetenidos: ClienteRetenido[];
}

// "Capital retenido" (visión final, sección 4-7, y ampliado 26 jul 2026 con
// el motor de confianza): usa el mismo detector que el expediente de cliente
// (lib/clientes/metricas.ts) — un préstamo con más de un año usando la
// fecha en la que de verdad confiamos, o con pagos reales registrados que
// nunca bajaron el capital, cualquiera de las dos señales que aplique.

export async function getPosicionActual(): Promise<PosicionDelNegocio> {
  const [config, prestamosActivos, ventaItemsCredito] = await Promise.all([
    prisma.configuracion.findUnique({ where: { id: 1 } }),
    prisma.operacionCredito.findMany({
      where: { deletedAt: null, origen: "prestamo", estado: { in: ["activo", "vencido"] }, cliente: { deletedAt: null } },
      include: { cliente: { select: { nombre: true } }, ...INCLUDE_OPERACION_DETALLE },
    }),
    prisma.ventaItem.findMany({
      where: {
        venta: {
          deletedAt: null,
          operacionCredito: { deletedAt: null, estado: { in: ["activo", "vencido"] }, cliente: { deletedAt: null } },
        },
      },
      select: { costo: true },
    }),
  ]);

  const capitalTotal = Number(config?.capitalInicial ?? 0);
  const capitalPrestado = prestamosActivos.reduce((acc, o) => acc + Number(o.saldoPendienteCalc), 0);
  const capitalInvertidoMercancia = ventaItemsCredito.reduce((acc, i) => acc + Number(i.costo), 0);
  const capitalDisponible = capitalTotal - capitalPrestado - capitalInvertidoMercancia;

  const clientesRetenidos: ClienteRetenido[] = prestamosActivos
    .map((o) => {
      const r = evaluarOperacionRetenida(o);
      if (!r) return null;
      const cr: ClienteRetenido = {
        operacionId: o.id,
        clienteId: o.clienteId,
        clienteNombre: o.cliente.nombre,
        montoCapital: r.montoCapital,
        saldoPendiente: r.saldoPendiente,
        fechaOperacion: o.fechaOperacion,
        antiguedadDias: r.antiguedadDias,
        interesGeneradoEstimado: Number(o.interesTotalCalc),
        confianza: r.confianza,
        origenDeteccion: r.origenDeteccion,
      };
      return cr;
    })
    .filter((c): c is ClienteRetenido => c !== null)
    .sort((a, b) => (b.antiguedadDias ?? -1) - (a.antiguedadDias ?? -1));

  const capitalRetenido = clientesRetenidos.reduce((acc, c) => acc + c.montoCapital, 0);

  return { capitalTotal, capitalPrestado, capitalInvertidoMercancia, capitalDisponible, capitalRetenido, clientesRetenidos };
}

/**
 * Guarda (o actualiza) la fotografía del día de hoy con la Posición del
 * Negocio actual. Se llama al cargar "Mi dinero" — captura bajo demanda,
 * sin necesidad de un cron — así que si nadie abre la pantalla un día, ese
 * día simplemente no queda fotografiado.
 */
export async function capturarSnapshotHoy(posicion: PosicionDelNegocio): Promise<void> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  await prisma.capitalSnapshot.upsert({
    where: { fecha: hoy },
    create: {
      fecha: hoy,
      capitalTotal: posicion.capitalTotal,
      capitalPrestado: posicion.capitalPrestado,
      capitalInvertidoMercancia: posicion.capitalInvertidoMercancia,
      capitalDisponible: posicion.capitalDisponible,
      capitalRetenido: posicion.capitalRetenido,
    },
    update: {
      capitalTotal: posicion.capitalTotal,
      capitalPrestado: posicion.capitalPrestado,
      capitalInvertidoMercancia: posicion.capitalInvertidoMercancia,
      capitalDisponible: posicion.capitalDisponible,
      capitalRetenido: posicion.capitalRetenido,
    },
  });
}

export interface VariacionCapital {
  disponible: { hace7Dias: number | null; variacionPct: number | null };
}

/**
 * Compara el capital disponible de hoy contra la fotografía de hace ~7
 * días (la más cercana disponible), para que "Mi dinero" pueda decir "tu
 * liquidez subió/bajó X%" en vez de mostrar solo el número de hoy.
 */
export async function getVariacionCapital(capitalDisponibleHoy: number): Promise<VariacionCapital> {
  const hace7Dias = new Date();
  hace7Dias.setHours(0, 0, 0, 0);
  hace7Dias.setDate(hace7Dias.getDate() - 7);

  const referencia = await prisma.capitalSnapshot.findFirst({
    where: { fecha: { lte: hace7Dias } },
    orderBy: { fecha: "desc" },
  });

  if (!referencia) return { disponible: { hace7Dias: null, variacionPct: null } };

  const valorAnterior = Number(referencia.capitalDisponible);
  const variacionPct = valorAnterior !== 0 ? ((capitalDisponibleHoy - valorAnterior) / Math.abs(valorAnterior)) * 100 : null;

  return { disponible: { hace7Dias: valorAnterior, variacionPct } };
}
