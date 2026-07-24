"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/config/nav";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
      {navSections.map((section, index) => (
        <div key={section.label ?? `section-${index}`} className="flex flex-col gap-1">
          {section.label ? (
            <>
              <div className="mx-1 my-2.5 h-px bg-[color:var(--border)]" />
              <span className="px-3 pb-1 pt-2.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-faint">
                {section.label}
              </span>
            </>
          ) : null}
          {section.items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13.5px] font-semibold transition-colors duration-premium ease-premium",
                  active
                    ? "bg-accent-light text-accent-dark"
                    : "text-muted hover:bg-hover-bg hover:text-foreground",
                )}
              >
                <span className="w-[18px] text-center" aria-hidden>
                  {item.emoji}
                </span>
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
