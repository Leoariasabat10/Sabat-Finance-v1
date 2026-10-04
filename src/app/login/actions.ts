"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { destinoSeguro, esAdministrador } from "@/lib/auth/acceso";

/** `email` se devuelve para que el formulario no lo borre después de un error. */
export type LoginState = { error: string | null; email?: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña.", email };
  }

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos.", email };
  }

  // Una cuenta válida que no es de administrador no entra (el registro abierto de Supabase no da acceso).
  if (!esAdministrador(data.user)) {
    await supabase.auth.signOut();
    return { error: "Esta cuenta no tiene acceso al área administrativa.", email };
  }

  redirect(destinoSeguro(next));
}

/** Sitio público de la marca. Al cerrar sesión, el administrador vuelve ahí
 * (no se queda atrapado dentro del back-office). */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sabat-joyeria.vercel.app";

export async function signOut() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect(SITE_URL);
}
