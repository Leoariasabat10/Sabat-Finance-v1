import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/**
 * Sabat Finance es una aplicación de uso privado (un solo negocio, sin
 * multiusuario), así que no hay sesión que verificar aquí: todas las
 * pantallas están disponibles directamente. Ver DECISIONS.md.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px_1fr]">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] bg-card/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-2.5">
            <MobileNav />
            <span className="font-display text-[15px] font-extrabold">
              Sabat Finance
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-7 sm:py-7">
          <div className="mx-auto w-full max-w-[1100px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
