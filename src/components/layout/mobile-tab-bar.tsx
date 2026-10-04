"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navPrimaria } from "@/config/nav";
import { cn } from "@/lib/utils";

const ALIAS: Record<string, string[]> = {
  "/creditos": ["/prestamos", "/cartera"],
  "/cobrar": ["/pagos"],
  "/configuracion": ["/dinero", "/caja", "/reportes", "/auditoria", "/whatsapp", "/calendario", "/notificaciones"],
};

/**
 * Barra inferior del teléfono: los seis destinos siempre a un toque, sin menú escondido. Cada destino mide al
 * menos 44 px de alto y respeta el borde inferior de los iPhone (safe-area). El activo lleva el filete de oro.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) => [href, ...(ALIAS[href] ?? [])].some((r) => pathname === r || pathname.startsWith(`${r}/`));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-[color:var(--border-md)] bg-card pb-[max(env(safe-area-inset-bottom),6px)] lg:hidden"
      aria-label="Navegación principal"
    >
      {navPrimaria.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-[56px] flex-col items-center justify-center gap-1 pt-1 text-[12px] transition-colors duration-150",
              active ? "font-medium text-foreground" : "text-faint",
            )}
          >
            {active ? <span aria-hidden className="absolute inset-x-3 top-0 h-[2px] bg-[color:var(--gold)]" /> : null}
            <item.icon className="h-5 w-5" aria-hidden />
            <span>{item.shortTitle ?? item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
