import { prisma } from "@/lib/db";

export async function listPlantillas() {
  return prisma.whatsappPlantilla.findMany({ orderBy: { nombre: "asc" } });
}

export async function listMensajes(limite = 50) {
  return prisma.whatsappMensaje.findMany({
    orderBy: { createdAt: "desc" },
    take: limite,
    include: { cliente: { select: { nombre: true } }, plantilla: { select: { nombre: true } } },
  });
}
