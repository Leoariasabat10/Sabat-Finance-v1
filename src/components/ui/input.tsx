import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "w-full rounded-sm border-[1.5px] border-[color:var(--border)] bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-all duration-premium ease-premium placeholder:text-faint focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--accent-glow,rgba(14,165,233,.15))] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
