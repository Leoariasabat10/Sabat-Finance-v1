"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/inventario", t: "Resumen", exacto: true },
  { href: "/inventario/lotes", t: "Lotes" },
  { href: "/inventario/piedras", t: "Piedras" },
  { href: "/inventario/joyas", t: "Joyas" },
  { href: "/inventario/simulador", t: "Analizar compra" },
];

export function InventarioSubnav() {
  const path = usePathname();
  return (
    <nav aria-label="Inventario" className="-mx-1 mb-6 flex gap-1 overflow-x-auto border-b border-[color:var(--border-md)] px-1">
      {ITEMS.map((i) => {
        const on = i.exacto ? path === i.href : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={on ? "page" : undefined}
            className={cn("relative whitespace-nowrap px-3 py-3 text-[14px]", on ? "font-medium text-foreground" : "text-faint hover:text-foreground")}
          >
            {i.t}
            {on ? <span aria-hidden className="absolute inset-x-2 bottom-0 h-[2px] bg-[color:var(--gold)]" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
