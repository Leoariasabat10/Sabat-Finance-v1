import { SidebarNav } from "@/components/layout/sidebar-nav";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full flex-col gap-1 border-r border-[color:var(--border)] bg-card p-[14px] pt-5">
      <div className="flex items-center gap-2.5 px-2.5 pb-5 pt-2">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--accent),var(--accent-dark))] font-display font-extrabold text-white">
          S
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-extrabold">Sabat Finance</p>
          <p className="text-[11px] text-faint">Tu asistente del negocio</p>
        </div>
      </div>

      <SidebarNav onNavigate={onNavigate} />
    </aside>
  );
}
