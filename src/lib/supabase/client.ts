import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para el navegador — usado solo por el formulario de
 * login (Supabase Auth). Usa la anon/publishable key, que es pública por
 * diseño y no requiere protección especial.
 */
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
