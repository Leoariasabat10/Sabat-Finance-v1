import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  const primera = partes[0]?.[0] ?? "";
  const segunda = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? "" : "";
  return (primera + segunda).toUpperCase();
}

export interface AvatarGroupItem {
  id: string;
  nombre: string;
}

/**
 * Pila de avatares superpuestos con desborde "+N" — usado donde antes solo
 * había una lista de nombres en texto plano (ej. "clientes que requieren
 * atención"), para dar identidad visual rápida sin necesitar fotos reales
 * (la mayoría de clientes no tiene `fotoUrl`, así que esto vive de iniciales).
 */
export function AvatarGroup({ items, max = 5, className }: { items: AvatarGroupItem[]; max?: number; className?: string }) {
  const visibles = items.slice(0, max);
  const restantes = items.length - visibles.length;

  return (
    <div className={cn("flex items-center -space-x-2.5", className)}>
      {visibles.map((item) => (
        <Avatar key={item.id} className="h-8 w-8 border-2 border-[color:var(--bg-card)]">
          <AvatarFallback className="text-[11px]">{iniciales(item.nombre)}</AvatarFallback>
        </Avatar>
      ))}
      {restantes > 0 ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[color:var(--bg-card)] bg-subtle text-[11px] font-bold text-muted">
          +{restantes}
        </div>
      ) : null}
    </div>
  );
}
