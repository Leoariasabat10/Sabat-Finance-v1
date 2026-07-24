import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full resize-y rounded-sm border-[1.5px] border-[color:var(--border)] bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors duration-premium ease-premium placeholder:text-faint focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--accent-glow,rgba(14,165,233,.15))] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
