import { prisma } from "@/lib/db";

const PAGE_SIZE = 20;

export interface ClienteListItem {
  id: string;
  nombre: string;
  whatsapp: string;
  ciudad: string | null;
  fotoUrl: string | null;
  estado: string;
  etiquetas: { id: string; nombre: string; color: string }[];
}

interface ListClientesParams {
  busqueda?: string;
  pagina?: number;
}

interface ListClientesResult {
  clientes: ClienteListItem[];
  total: number;
  totalPaginas: number;
  pagina: number;
}

/**
 * Listado de clientes activos con búsqueda tolerante a errores de tipeo
 * (pg_trgm, ver prisma/sql/setup.sql sección 2) cuando hay término de búsqueda,
 * y orden alfabético simple cuando no lo hay.
 */
export async function listClientes({
  busqueda,
  pagina = 1,
}: ListClientesParams): Promise<ListClientesResult> {
  const paginaSegura = Math.max(1, pagina);
  const skip = (paginaSegura - 1) * PAGE_SIZE;
  const termino = busqueda?.trim();

  if (termino) {
    const [rows, countRows] = await Promise.all([
      prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM clientes
        WHERE deleted_at IS NULL
          AND (nombre ILIKE ${"%" + termino + "%"}
               OR whatsapp ILIKE ${"%" + termino + "%"}
               OR similarity(nombre, ${termino}) > 0.2)
        ORDER BY similarity(nombre, ${termino}) DESC, nombre ASC
        LIMIT ${PAGE_SIZE} OFFSET ${skip}
      `,
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count FROM clientes
        WHERE deleted_at IS NULL
          AND (nombre ILIKE ${"%" + termino + "%"}
               OR whatsapp ILIKE ${"%" + termino + "%"}
               OR similarity(nombre, ${termino}) > 0.2)
      `,
    ]);

    const ids = rows.map((r) => r.id);
    const clientes = ids.length
      ? await prisma.cliente.findMany({
          where: { id: { in: ids } },
          select: {
            id: true,
            nombre: true,
            whatsapp: true,
            ciudad: true,
            fotoUrl: true,
            estado: true,
            etiquetas: { include: { etiqueta: true } },
          },
        })
      : [];

    const porId = new Map(clientes.map((c) => [c.id, c]));
    const ordenados = ids
      .map((id) => porId.get(id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));

    const total = Number(countRows[0]?.count ?? 0n);

    return {
      clientes: ordenados.map(mapCliente),
      total,
      totalPaginas: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      pagina: paginaSegura,
    };
  }

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where: { deletedAt: null },
      orderBy: { nombre: "asc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        nombre: true,
        whatsapp: true,
        ciudad: true,
        fotoUrl: true,
        estado: true,
        etiquetas: { include: { etiqueta: true } },
      },
    }),
    prisma.cliente.count({ where: { deletedAt: null } }),
  ]);

  return {
    clientes: clientes.map(mapCliente),
    total,
    totalPaginas: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pagina: paginaSegura,
  };
}

function mapCliente(c: {
  id: string;
  nombre: string;
  whatsapp: string;
  ciudad: string | null;
  fotoUrl: string | null;
  estado: string;
  etiquetas: { etiqueta: { id: string; nombre: string; color: string } }[];
}): ClienteListItem {
  return {
    id: c.id,
    nombre: c.nombre,
    whatsapp: c.whatsapp,
    ciudad: c.ciudad,
    fotoUrl: c.fotoUrl,
    estado: c.estado,
    etiquetas: c.etiquetas.map((e) => e.etiqueta),
  };
}

/**
 * Ficha 360°: datos del cliente, etiquetas, notas y resumen de operaciones.
 * Los conteos de préstamos/ventas ya funcionan contra el modelo real (Módulo 1),
 * aunque hoy siempre den 0 hasta que existan los módulos 4 y 5.
 */
export async function getClienteById(id: string) {
  const cliente = await prisma.cliente.findFirst({
    where: { id, deletedAt: null },
    include: {
      etiquetas: { include: { etiqueta: true } },
      notasList: { orderBy: { createdAt: "desc" } },
      operaciones: {
        where: { deletedAt: null },
        select: { id: true, origen: true, estado: true, saldoPendienteCalc: true },
      },
      ventas: {
        where: { deletedAt: null },
        select: { id: true, tipoPago: true, estado: true },
      },
    },
  });

  if (!cliente) return null;

  // "anulado"/"anulada" ya no se ocultan con deletedAt (bug real de QA, 26
  // jul 2026, ver anularPrestamo/anularVenta) — siguen en `cliente.operaciones`
  // y `cliente.ventas` para que el historial las muestre, pero no deben
  // sumar saldo ni contar como actividad real del cliente.
  const prestamos = cliente.operaciones.filter((o) => o.origen === "prestamo" && o.estado !== "anulado");
  const ventasCredito = cliente.operaciones.filter((o) => o.origen === "venta" && o.estado !== "anulado");
  const saldoPrestamos = prestamos.reduce(
    (acc, o) => acc + Number(o.saldoPendienteCalc),
    0,
  );
  const saldoVentas = ventasCredito.reduce(
    (acc, o) => acc + Number(o.saldoPendienteCalc),
    0,
  );

  return {
    ...cliente,
    resumen: {
      prestamosActivos: prestamos.filter((o) => o.estado === "activo").length,
      ventasActivas: ventasCredito.filter((o) => o.estado === "activo").length,
      totalVentas: cliente.ventas.filter((v) => v.estado !== "anulada").length,
      saldoPrestamos,
      saldoVentas,
    },
  };
}

export async function listEtiquetas() {
  return prisma.etiqueta.findMany({ orderBy: { nombre: "asc" } });
}

export interface EventoLineaTiempo {
  tipo: "prestamo" | "venta" | "pago" | "nota";
  fecha: Date;
  titulo: string;
  detalle: string;
  href: string | null;
}

/**
 * Línea de tiempo completa del cliente (doc 07 Módulo 12): compras,
 * préstamos, pagos y notas como un solo feed cronológico.
 */
export async function getLineaTiempoCliente(clienteId: string): Promise<EventoLineaTiempo[]> {
  const [operaciones, ventas, pagos, notas] = await Promise.all([
    prisma.operacionCredito.findMany({
      where: { clienteId, origen: "prestamo", deletedAt: null },
      select: { id: true, montoCapital: true, createdAt: true, estado: true },
    }),
    prisma.venta.findMany({
      where: { clienteId, deletedAt: null },
      select: { id: true, totalCalc: true, tipoPago: true, createdAt: true },
    }),
    prisma.pago.findMany({
      where: { operacion: { clienteId }, deletedAt: null },
      select: { id: true, valor: true, createdAt: true, operacionCreditoId: true, operacion: { select: { origen: true } } },
    }),
    prisma.notaCliente.findMany({ where: { clienteId }, select: { id: true, texto: true, createdAt: true } }),
  ]);

  const eventos: EventoLineaTiempo[] = [
    ...operaciones.map((o) => ({
      tipo: "prestamo" as const,
      fecha: o.createdAt,
      titulo: "Nuevo préstamo",
      detalle: `${Number(o.montoCapital).toLocaleString("es-CO")} · ${o.estado}`,
      href: `/prestamos/${o.id}`,
    })),
    ...ventas.map((v) => ({
      tipo: "venta" as const,
      fecha: v.createdAt,
      titulo: v.tipoPago === "credito" ? "Venta a crédito" : "Venta de contado",
      detalle: `${Number(v.totalCalc).toLocaleString("es-CO")}`,
      href: `/ventas/${v.id}`,
    })),
    ...pagos.map((p) => ({
      tipo: "pago" as const,
      fecha: p.createdAt,
      titulo: "Pago recibido",
      detalle: `${Number(p.valor).toLocaleString("es-CO")}`,
      href: p.operacion.origen === "prestamo" ? `/prestamos/${p.operacionCreditoId}` : null,
    })),
    ...notas.map((n) => ({
      tipo: "nota" as const,
      fecha: n.createdAt,
      titulo: "Nota",
      detalle: n.texto,
      href: null,
    })),
  ];

  return eventos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}
