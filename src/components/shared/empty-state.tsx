import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-[color:var(--border-md)] bg-card px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? <div className="mb-3 text-4xl">{icon}</div> : null}
      <h3 className="font-sans text-base font-bold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] text-faint">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
