import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GlobalSearch } from "@/components/layout/global-search";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { QuickActionFab } from "@/components/layout/quick-action-fab";

// Todas las pantallas de la app muestran datos del día: siempre se calculan al pedirlas, nunca en el build.
export const dynamic = "force-dynamic";

/**
 * Estructura de Sabat Finance: barra lateral negra en escritorio, barra inferior de seis pestañas en el teléfono, y
 * una franja superior mínima con la búsqueda y el tema. El acceso lo protege `src/middleware.ts` (sesión de Supabase
 * Auth verificada en el servidor antes de que llegue cualquier página de este grupo).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
        <div className="sticky top-0 hidden h-screen lg:block">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[color:var(--border)] bg-background/95 px-4 py-2.5 backdrop-blur sm:px-7">
            <Link href="/dashboard" aria-label="SABAT, ir a Hoy" className="flex shrink-0 items-center rounded-none bg-[#0a0a0a] px-2.5 py-1.5 lg:hidden">
              <Image src="/sabat-logo-mark.png" alt="SABAT" width={556} height={188} className="h-auto w-[72px]" />
            </Link>

            <div className="flex flex-1 justify-center lg:justify-start">
              <GlobalSearch />
            </div>

            <ThemeToggle />
          </header>

          <main className="min-w-0 flex-1 px-5 py-8 pb-28 sm:px-7 lg:px-10 lg:pb-12">
            <div className="mx-auto w-full max-w-[1180px]">{children}</div>
          </main>
        </div>

        <QuickActionFab />
        <MobileTabBar />
      </div>
    </>
  );
}
