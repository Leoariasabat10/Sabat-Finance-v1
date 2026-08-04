"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navPrimaria } from "@/config/nav";
import { cn } from "@/lib/utils";

/**
 * Barra de navegación inferior (visión final del producto, sección 1):
 * las cuatro preguntas del negocio, siempre a un toque en el celular — el
 * patrón que ya reconoce cualquiera que use apps de pagos. Reemplaza a la
 * navegación por hamburguesa como forma principal de moverse en mobile.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[color:var(--border)] bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl lg:hidden"
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
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10.5px] font-semibold transition-colors duration-premium",
              active ? "text-accent" : "text-faint",
            )}
          >
            <item.icon className="h-[19px] w-[19px]" aria-hidden />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
