"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toaster temático: usa las variables CSS del sistema (STYLEGUIDE.md), nunca
 * colores literales, para que se vea correcto en claro y oscuro sin duplicar
 * estilos.
 */
export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group toast flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-card px-4 py-3.5 text-[13.5px] font-semibold text-foreground shadow-lg data-[type=success]:border-[color:var(--success)]/30 data-[type=error]:border-[color:var(--danger)]/30",
          description: "text-[12.5px] font-normal text-muted",
          actionButton:
            "rounded-sm bg-accent px-2.5 py-1.5 text-[12px] font-bold text-white",
          cancelButton:
            "rounded-sm bg-hover-bg px-2.5 py-1.5 text-[12px] font-bold text-muted",
          icon: "data-[type=success]:text-success data-[type=error]:text-danger data-[type=info]:text-info",
        },
      }}
      {...props}
    />
  );
}
