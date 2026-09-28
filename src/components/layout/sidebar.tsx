"use client";

import { ChevronsLeft, ChevronsRight, LogOut, ArrowLeft } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useSidebar } from "@/components/layout/sidebar-provider";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/login/actions";

/** URL pública de la web de la marca. Configurable por si cambia el dominio. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sabat-joyeria.vercel.app";

interface SidebarProps {
  onNavigate?: () => void;
  /** El panel móvil (Sheet) siempre se ve expandido — colapsar no aplica ahí. */
  allowCollapse?: boolean;
}

export function Sidebar({ onNavigate, allowCollapse = true }: SidebarProps) {
  const { collapsed: collapsedPref, toggle } = useSidebar();
  const collapsed = allowCollapse && collapsedPref;

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-1 border-r border-[color:var(--border)] bg-card p-[14px] pt-5 transition-[width] duration-300 ease-premium",
        collapsed ? "w-[76px]" : "w-[240px]",
      )}
    >
      <div className={cn("flex items-center gap-2.5 pb-5 pt-2", collapsed ? "justify-center px-0" : "px-2.5")}>
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--accent),var(--accent-dark))] font-display font-extrabold text-white">
          S
        </div>
        {!collapsed ? (
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-[15px] font-extrabold">Sabat Finance</p>
            <p className="truncate text-[11px] text-faint">Tu asistente del negocio</p>
          </div>
        ) : null}
      </div>

      <SidebarNav onNavigate={onNavigate} />

      <div className="mt-auto flex flex-col gap-1 border-t border-[color:var(--border)] pt-2">
        <a
          href={SITE_URL}
          className={cn(
            "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md text-[12.5px] font-semibold text-faint transition-colors duration-premium hover:bg-hover-bg hover:text-foreground",
            collapsed ? "justify-center px-0" : "px-3",
          )}
          title="Volver a SABAT JOYERÍA"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          {!collapsed ? <span>Volver a SABAT JOYERÍA</span> : null}
        </a>

        <form action={signOut}>
          <button
            type="submit"
            className={cn(
              "flex h-9 w-full shrink-0 cursor-pointer items-center gap-2 rounded-md text-[12.5px] font-semibold text-faint transition-colors duration-premium hover:bg-danger-bg hover:text-danger",
              collapsed ? "justify-center px-0" : "px-3",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            {!collapsed ? <span>Cerrar sesión</span> : null}
          </button>
        </form>
      </div>

      {allowCollapse ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className={cn(
            "mt-1 flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md text-[12.5px] font-semibold text-faint transition-colors duration-premium hover:bg-hover-bg hover:text-foreground",
            collapsed ? "justify-center px-0" : "px-3",
          )}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" aria-hidden /> : <ChevronsLeft className="h-4 w-4" aria-hidden />}
          {!collapsed ? <span>Colapsar</span> : null}
        </button>
      ) : null}
    </aside>
  );
}
