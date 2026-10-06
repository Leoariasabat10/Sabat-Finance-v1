import type { ReactNode } from "react";
import { InventarioSubnav } from "./_components/subnav";

export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="animate-fade-up">
      <InventarioSubnav />
      {children}
    </div>
  );
}
