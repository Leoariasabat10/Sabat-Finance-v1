import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function csvEscape(valor: string | number): string {
  const texto = String(valor);
  return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** Exporta la cartera activa (préstamos + ventas a crédito) como CSV. */
export async function GET() {
  const operaciones = await prisma.operacionCredito.findMany({
    where: { deletedAt: null, estado: { in: ["activo", "vencido"] } },
    include: { cliente: { select: { nombre: true, whatsapp: true } } },
    orderBy: { fechaVencimiento: "asc" },
  });

  const encabezado = [
    "Origen",
    "Cliente",
    "WhatsApp",
    "Capital",
    "Saldo pendiente",
    "Fecha vencimiento",
    "Estado",
  ];

  const filas = operaciones.map((o) =>
    [
      o.origen,
      o.cliente.nombre,
      o.cliente.whatsapp,
      Number(o.montoCapital),
      Number(o.saldoPendienteCalc),
      o.fechaVencimiento.toISOString().slice(0, 10),
      o.estado,
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = [encabezado.join(","), ...filas].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cartera-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
