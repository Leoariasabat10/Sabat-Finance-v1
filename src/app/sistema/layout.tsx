import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { esDuenoDelSistema } from "@/lib/auth/acceso";
import { getSupabaseServer } from "@/lib/supabase/server";
import { SistemaProvider } from "./_components/store";
import { AvisoDatos, BarraInferior, Cabecera } from "./_components/navegacion";

export const metadata: Metadata = {
  title: "Mi Sistema · SABAT",
  robots: { index: false, follow: false },
};

// Cada petición verifica la sesión; nada de esto se genera en el build.
export const dynamic = "force-dynamic";

/**
 * Mi Sistema: el espacio personal dentro de la misma casa y el mismo acceso (Supabase Auth). El middleware ya exige
 * sesión de administrador y, para /sistema, que el correo figure en SISTEMA_EMAILS; aquí se vuelve a comprobar en el
 * servidor por si alguien llegara de otra forma. Va fuera del grupo (app) a propósito: sin barra lateral ni pestañas de
 * Finance, para que se sienta como un lugar aparte y no como una pantalla más del negocio. Siempre en la "bóveda"
 * oscura, sin importar el tema elegido en Finance.
 */
export default async function SistemaLayout({ children }: { children: ReactNode }) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!esDuenoDelSistema(user)) redirect("/configuracion");

  return (
    <div data-theme="dark" className="min-h-dvh bg-background text-foreground">
      <SistemaProvider>
        <Cabecera />
        <AvisoDatos />
        <main className="mx-auto w-full max-w-[1100px] px-5 pb-32 sm:px-8 lg:pb-20">{children}</main>
        <BarraInferior />
      </SistemaProvider>
    </div>
  );
}
