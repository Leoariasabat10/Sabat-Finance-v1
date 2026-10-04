"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navPrimaria, type NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  onNavigate?: () => void;
}

/** Rutas que pertenecen a cada destino aunque no cuelguen de su URL (p. ej. un préstamo vive bajo Créditos). */
const ALIAS: Record<string, string[]> = {
  "/creditos": ["/prestamos", "/cartera"],
  "/cobrar": ["/pagos"],
  "/configuracion": ["/dinero", "/caja", "/reportes", "/auditoria", "/whatsapp", "/calendario", "/notificaciones"],
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    const rutas = [item.href, ...(ALIAS[item.href] ?? [])];
    return rutas.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  };

  return (
    <nav aria-label="Principal" className="flex flex-1 flex-col gap-0.5">
      {navPrimaria.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 border-l-2 px-4 text-[16px] transition-colors duration-150 ease-premium",
              active
                ? "border-[color:var(--gold)] font-medium text-[#ece9e2]"
                : "border-transparent text-[#ece9e2]/65 hover:text-[#ece9e2]",
            )}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
