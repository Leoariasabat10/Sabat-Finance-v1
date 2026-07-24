import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-wrap items-center justify-between gap-4",
        className,
      )}
    >
      <div>
        <h1 className="text-[22px]">{title}</h1>
        {subtitle ? (
          <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2.5">{actions}</div> : null}
    </header>
  );
}
