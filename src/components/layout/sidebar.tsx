"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, ArrowUpRight } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { signOut } from "@/app/login/actions";

/** URL pública de la joyería. Configurable por si cambia el dominio. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sabat-joyeria.vercel.app";

/**
 * La barra lateral es la "bóveda" de la casa: siempre negra (como las salas de SABAT Joyería), con el logo en oro y
 * el destino activo marcado por un filete de oro. El contenido de la herramienta queda sobre papel.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-[248px] flex-col bg-[#0a0a0a] pb-5 pt-7 text-[#ece9e2] dark:border-r dark:border-[color:var(--border)] dark:bg-[#131110]">
      <Link href="/dashboard" onClick={onNavigate} aria-label="SABAT Finanzas, ir a Hoy" className="mb-1 block px-6 pb-8">
        <Image src="/sabat-logo-mark.png" alt="SABAT" width={556} height={188} priority className="h-auto w-[150px]" />
        <span className="lead-italic mt-3 block text-[15px] text-[#ece9e2]/60">Finanzas de la casa</span>
      </Link>

      <SidebarNav onNavigate={onNavigate} />

      <div className="mt-auto flex flex-col gap-0.5 border-t border-[#ece9e2]/12 pt-3">
        <a
          href={SITE_URL}
          className="flex min-h-11 items-center gap-3 px-6 text-[15px] text-[#ece9e2]/65 transition-colors hover:text-[#ece9e2]"
        >
          <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
          Ir a la joyería
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="flex min-h-11 w-full cursor-pointer items-center gap-3 px-6 text-[15px] text-[#ece9e2]/65 transition-colors hover:text-[#ece9e2]"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
