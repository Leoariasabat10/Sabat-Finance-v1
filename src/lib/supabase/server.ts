import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components / Server Actions / Route
 * Handlers. Lee y escribe la sesión desde las cookies HTTP-only que maneja
 * Supabase Auth — la verificación real de "¿hay una sesión válida?" ocurre
 * en el servidor, nunca en el navegador (por eso el middleware, no un guard
 * de React).
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Se llama desde un Server Component (no puede escribir cookies).
            // El middleware ya se encarga de refrescar la sesión en ese caso.
          }
        },
      },
    },
  );
}
