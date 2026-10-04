"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Botones de la casa SABAT: rectos, sin sombra. La acción principal es tinta sobre papel (hueso sobre negro en la
 * bóveda) y se vuelve oro al pasar o enfocar, igual que el botón de la joyería. Altura mínima 44 px: se usa con el
 * pulgar. Al presionar baja apenas (scale .98) para confirmar que el toque llegó.
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,border-color,transform] duration-150 ease-premium outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-[color:var(--gold)] hover:text-[#0a0a0a]",
        ghost:
          "border border-[color:var(--border-md)] bg-transparent text-foreground hover:border-[color:var(--gold)] hover:bg-accent-light",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        default: "min-h-11 px-5 py-2.5 text-[15px]",
        sm: "min-h-9 px-3.5 py-1.5 text-[14px]",
        lg: "min-h-12 px-6 py-3 text-[16px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
