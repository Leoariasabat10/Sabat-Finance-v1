import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Minimalista a propósito: solo aparece en pantallas de detalle anidadas
 * (cliente, préstamo, venta) para no repetir la navegación que ya da el
 * sidebar — nunca es la forma principal de moverse por la app.
 */
export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Ruta de navegación" className={cn("mb-2 flex items-center gap-1.5 text-[12.5px] text-faint", className)}>
      {items.map((item, i) => {
        const esUltimo = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight className="h-3 w-3" aria-hidden /> : null}
            {item.href && !esUltimo ? (
              <Link href={item.href} className="transition-colors duration-premium hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className={esUltimo ? "font-semibold text-muted" : undefined} aria-current={esUltimo ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
