import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-sm border-[1.5px] border-[color:var(--border)] bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors duration-premium ease-premium focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--accent-glow,rgba(14,165,233,.15))] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

export { Select };
