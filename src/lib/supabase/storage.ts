import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase solo para Storage, con la service role key.
 *
 * Esta aplicación no usa Supabase Auth (uso privado, un solo computador,
 * sin usuarios ni sesiones — ver DECISIONS.md). Sin Auth no existe
 * `auth.uid()`, así que no tiene sentido proteger el bucket con políticas
 * RLS basadas en sesión. En su lugar, todas las escrituras de Storage pasan
 * por este cliente con la service role key, que solo vive en el servidor
 * (variable de entorno sin prefijo NEXT_PUBLIC, nunca llega al navegador) y
 * que Supabase deja pasar sin pasar por RLS. La lectura de archivos sigue
 * siendo pública porque el bucket está marcado `public: true`.
 */
export function getSupabaseStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
