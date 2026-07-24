import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginacionProps {
  pagina: number;
  totalPaginas: number;
  buildHref: (pagina: number) => string;
}

export function Paginacion({ pagina, totalPaginas, buildHref }: PaginacionProps) {
  if (totalPaginas <= 1) return null;

  const anterior = Math.max(1, pagina - 1);
  const siguiente = Math.min(totalPaginas, pagina + 1);

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-3"
      aria-label="Paginación de clientes"
    >
      <Link
        href={buildHref(anterior)}
        aria-disabled={pagina === 1}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md border-[1.5px] border-[color:var(--border)] text-foreground transition-colors duration-premium hover:bg-hover-bg",
          pagina === 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="text-[13px] text-muted">
        Página {pagina} de {totalPaginas}
      </span>
      <Link
        href={buildHref(siguiente)}
        aria-disabled={pagina === totalPaginas}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md border-[1.5px] border-[color:var(--border)] text-foreground transition-colors duration-premium hover:bg-hover-bg",
          pagina === totalPaginas && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
