"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { navSections, type NavItem } from "@/config/nav";

const COLLAPSED_KEY = "sabat:sidebar-collapsed";
const RECIENTES_KEY = "sabat:sidebar-recientes";
const MAX_RECIENTES = 3;

const TODOS_LOS_ITEMS: NavItem[] = navSections.flatMap((s) => s.items);

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  recientes: NavItem[];
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Estado del sidebar (colapsado + recientes) vive en un provider aparte, no
 * en layout.tsx, para que el layout siga siendo un Server Component — solo
 * el <aside> y su rail de iconos necesitan reactividad de cliente.
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [recientesHrefs, setRecientesHrefs] = useState<string[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const guardado = window.localStorage.getItem(COLLAPSED_KEY);
    if (guardado === "1") setCollapsed(true);
    const recientes = window.localStorage.getItem(RECIENTES_KEY);
    if (recientes) {
      try {
        setRecientesHrefs(JSON.parse(recientes));
      } catch {
        // ignorar valor corrupto
      }
    }
  }, []);

  useEffect(() => {
    const item = TODOS_LOS_ITEMS.find((i) => i.href === pathname);
    if (!item) return;
    setRecientesHrefs((prev) => {
      const siguiente = [item.href, ...prev.filter((h) => h !== item.href)].slice(0, MAX_RECIENTES);
      window.localStorage.setItem(RECIENTES_KEY, JSON.stringify(siguiente));
      return siguiente;
    });
  }, [pathname]);

  const toggle = () => {
    setCollapsed((prev) => {
      const siguiente = !prev;
      window.localStorage.setItem(COLLAPSED_KEY, siguiente ? "1" : "0");
      return siguiente;
    });
  };

  const recientes = useMemo(
    () =>
      recientesHrefs
        .filter((h) => h !== pathname)
        .map((h) => TODOS_LOS_ITEMS.find((i) => i.href === h))
        .filter((i): i is NavItem => Boolean(i)),
    [recientesHrefs, pathname],
  );

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, recientes }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar debe usarse dentro de <SidebarProvider>");
  return ctx;
}
