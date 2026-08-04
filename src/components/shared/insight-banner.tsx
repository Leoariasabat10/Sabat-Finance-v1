import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONO = {
  info: "from-accent-light",
  warning: "from-warning-bg",
  danger: "from-danger-bg",
  success: "from-success-bg",
} as const;

const TONO_TEXTO = {
  info: "text-accent-dark",
  warning: "text-warning",
  danger: "text-danger",
  success: "text-success",
} as const;

/**
 * Variante en tarjeta del `.suggestion-bar` de STYLEGUIDE.md (gradiente
 * sutil color-semántico → transparente) — el pill original asume una sola
 * línea; esto adapta el mismo lenguaje visual para title+detalle+acción
 * (insights de negocio: capital retenido, ciclo de reendeudamiento, etc.).
 */
export function InsightBanner({
  tono = "info",
  icon,
  title,
  description,
  action,
  className,
}: {
  tono?: keyof typeof TONO;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r to-transparent px-4 py-3",
        TONO[tono],
        className,
      )}
    >
      {icon ? <span className={cn("shrink-0", TONO_TEXTO[tono])}>{icon}</span> : null}
      <div className="min-w-0 flex-1">
        <p className={cn("text-[13px] font-bold", TONO_TEXTO[tono])}>{title}</p>
        {description ? <p className="text-[12px] text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
