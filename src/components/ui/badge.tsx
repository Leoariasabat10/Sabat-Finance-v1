import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Estado en una palabra: un punto de color (el color nunca va solo, siempre acompaña un texto) y el texto.
 * esmeralda = al día / cobrado · oro = vence hoy · granate = atrasado.
 */
const badgeVariants = cva("inline-flex items-center gap-1.5 px-2 py-0.5 text-[13px] font-medium", {
  variants: {
    variant: {
      success: "bg-success-bg text-success",
      warning: "bg-warning-bg text-warning",
      danger: "bg-danger-bg text-danger",
      info: "bg-subtle text-muted",
    },
  },
  defaultVariants: { variant: "info" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
