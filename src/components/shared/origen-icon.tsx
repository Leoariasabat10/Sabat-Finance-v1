import { Landmark, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ícono único para origen='prestamo'|'venta' (antes 🏦/🛍 en texto).
 * Color por defecto respeta la convención de STYLEGUIDE.md: accent =
 * Financiero/préstamo, success = Comercial/venta — nunca mezclar.
 */
export function OrigenIcon({ origen, className }: { origen: string; className?: string }) {
  const esPrestamo = origen === "prestamo";
  const Icon = esPrestamo ? Landmark : ShoppingBag;
  return (
    <Icon
      className={cn("h-4 w-4 shrink-0", esPrestamo ? "text-accent" : "text-success", className)}
      aria-hidden
    />
  );
}
