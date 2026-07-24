"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSupabaseStorage } from "@/lib/supabase/storage";
import {
  clienteSchema,
  notaClienteSchema,
  etiquetaSchema,
  type ClienteInput,
  type NotaClienteInput,
  type EtiquetaInput,
} from "@/lib/validations/cliente";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const BUCKET_FOTOS = "fotos-clientes";

export async function crearCliente(
  input: ClienteInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = clienteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const cliente = await prisma.cliente.create({ data: parsed.data });
    revalidatePath("/clientes");
    return { ok: true, data: { id: cliente.id } };
  } catch {
    return { ok: false, error: "No se pudo crear el cliente. Intenta de nuevo." };
  }
}

export async function actualizarCliente(
  id: string,
  input: ClienteInput,
): Promise<ActionResult> {
  const parsed = clienteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await prisma.cliente.update({ where: { id }, data: parsed.data });
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "No se pudo guardar el cliente. Intenta de nuevo." };
  }
}

export async function eliminarCliente(id: string): Promise<ActionResult> {
  try {
    await prisma.cliente.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/clientes");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "No se pudo eliminar el cliente. Intenta de nuevo." };
  }
}

const TIPOS_FOTO_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024; // 5MB

export async function subirFotoCliente(
  clienteId: string,
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const archivo = formData.get("foto");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, error: "Selecciona una foto" };
  }
  if (!TIPOS_FOTO_PERMITIDOS.includes(archivo.type)) {
    return { ok: false, error: "La foto debe ser JPG, PNG o WEBP" };
  }
  if (archivo.size > TAMANO_MAXIMO_FOTO) {
    return { ok: false, error: "La foto no puede pesar más de 5MB" };
  }

  const storage = getSupabaseStorage();
  const extension = archivo.name.split(".").pop() ?? "jpg";
  const ruta = `${clienteId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await storage.storage
    .from(BUCKET_FOTOS)
    .upload(ruta, archivo, { upsert: true, contentType: archivo.type });

  if (uploadError) {
    return { ok: false, error: "No se pudo subir la foto. Intenta de nuevo." };
  }

  const { data } = storage.storage.from(BUCKET_FOTOS).getPublicUrl(ruta);

  try {
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { fotoUrl: data.publicUrl },
    });
  } catch {
    return { ok: false, error: "La foto se subió pero no se pudo guardar. Intenta de nuevo." };
  }

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/clientes");
  return { ok: true, data: { url: data.publicUrl } };
}

export async function crearNotaCliente(
  input: NotaClienteInput,
): Promise<ActionResult> {
  const parsed = notaClienteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await prisma.notaCliente.create({ data: parsed.data });
    revalidatePath(`/clientes/${parsed.data.clienteId}`);
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "No se pudo guardar la nota. Intenta de nuevo." };
  }
}

export async function eliminarNotaCliente(
  id: string,
  clienteId: string,
): Promise<ActionResult> {
  try {
    await prisma.notaCliente.delete({ where: { id } });
    revalidatePath(`/clientes/${clienteId}`);
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "No se pudo eliminar la nota. Intenta de nuevo." };
  }
}

export async function crearEtiqueta(
  input: EtiquetaInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = etiquetaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const etiqueta = await prisma.etiqueta.create({ data: parsed.data });
    revalidatePath("/clientes");
    return { ok: true, data: { id: etiqueta.id } };
  } catch {
    return { ok: false, error: "Ya existe una etiqueta con ese nombre" };
  }
}

export async function asignarEtiqueta(
  clienteId: string,
  etiquetaId: string,
): Promise<ActionResult> {
  try {
    await prisma.clienteEtiqueta.create({ data: { clienteId, etiquetaId } });
    revalidatePath(`/clientes/${clienteId}`);
    revalidatePath("/clientes");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "No se pudo asignar la etiqueta" };
  }
}

export async function quitarEtiqueta(
  clienteId: string,
  etiquetaId: string,
): Promise<ActionResult> {
  try {
    await prisma.clienteEtiqueta.delete({
      where: { clienteId_etiquetaId: { clienteId, etiquetaId } },
    });
    revalidatePath(`/clientes/${clienteId}`);
    revalidatePath("/clientes");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "No se pudo quitar la etiqueta" };
  }
}
