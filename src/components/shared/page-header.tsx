import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Encabezado de página: título en Fraunces, una línea de apoyo en cursiva y el filete de oro de la casa. */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h1 className="text-[34px] leading-[1.05] sm:text-[42px]">{title}</h1>
        {subtitle ? <p className="lead-italic mt-2 text-[17px] text-muted">{subtitle}</p> : null}
        <div className="gold-rule mt-4 w-28" aria-hidden />
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </header>
  );
}
