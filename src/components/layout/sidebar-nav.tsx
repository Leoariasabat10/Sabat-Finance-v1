"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History } from "lucide-react";
import { navSections, type NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar-provider";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { collapsed, recientes } = useSidebar();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13.5px] font-semibold transition-colors duration-premium ease-premium",
      collapsed && "justify-center px-0",
      active
        ? "bg-accent-light text-accent-dark"
        : "text-muted hover:bg-hover-bg hover:text-foreground",
    );

  const renderLink = (item: NavItem) => {
    const active = isActive(item.href);
    const link = (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={linkClass(active)}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
        {collapsed ? <span className="sr-only">{item.title}</span> : <span>{item.title}</span>}
      </Link>
    );
    if (!collapsed) return link;
    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
      {navSections.map((section, index) => (
        <div key={section.label ?? `section-${index}`} className="flex flex-col gap-1">
          {section.label ? (
            <>
              <div className="mx-1 my-2.5 h-px bg-[color:var(--border)]" />
              {!collapsed ? (
                <span className="px-3 pb-1 pt-2.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-faint">
                  {section.label}
                </span>
              ) : null}
            </>
          ) : null}
          {section.items.map((item) => renderLink(item))}
        </div>
      ))}

      {!collapsed && recientes.length > 0 ? (
        <div className="flex flex-col gap-1">
          <div className="mx-1 my-2.5 h-px bg-[color:var(--border)]" />
          <span className="flex items-center gap-1.5 px-3 pb-1 pt-2.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-faint">
            <History className="h-3 w-3" aria-hidden /> Recientes
          </span>
          {recientes.map((item) => renderLink(item))}
        </div>
      ) : null}
    </nav>
  );
}
