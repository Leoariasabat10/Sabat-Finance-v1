import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/db";
import { esDuenoDelSistema } from "@/lib/auth/acceso";
import { getSupabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { ConfiguracionForm } from "./_components/configuracion-form";

export const metadata: Metadata = { title: "Administración · Sabat Finance" };

const SISTEMA = { href: "/sistema", titulo: "Mi sistema", detalle: "Misión del día, Cartagena Reset y tu semana." };

const ENLACES = [
  { href: "/dinero", titulo: "Dinero y caja", detalle: "Cuánto entró, cuánto salió y dónde está el capital." },
  { href: "/reportes", titulo: "Reportes", detalle: "Ventas, préstamos y cartera; descarga en CSV." },
  { href: "/whatsapp", titulo: "Mensajes de WhatsApp", detalle: "Los textos de recordatorio que se envían a los clientes." },
  { href: "/auditoria", titulo: "Historial de cambios", detalle: "Quién cambió qué y cuándo." },
];

export default async function Page() {
  const config = await prisma.configuracion.findUnique({ where: { id: 1 } });
  const {
    data: { user },
  } = await (await getSupabaseServer()).auth.getUser();
  const enlaces = esDuenoDelSistema(user) ? [SISTEMA, ...ENLACES] : ENLACES;

  const valoresIniciales = {
    nombreNegocio: config?.nombreNegocio ?? "Sabat Finance",
    moneda: config?.moneda ?? "COP",
    tasaInteresDefecto: Number(config?.tasaInteresDefecto ?? 10),
    diasAlertaVencimiento: config?.diasAlertaVencimiento ?? 3,
    tasaMoraDefecto: Number(config?.tasaMoraDefecto ?? 0),
    tipoMora: config?.tipoMora ?? ("porcentaje_diario" as const),
    ordenAplicacionPago: config?.ordenAplicacionPago ?? ("interes_primero" as const),
    capitalInicial: Number(config?.capitalInicial ?? 0),
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Administración" subtitle="Dinero inicial, reglas del negocio y acceso." />

      <ul className="mb-12 border-t border-[color:var(--border)]">
        {enlaces.map((e) => (
          <li key={e.href} className="border-b border-[color:var(--border)]">
            <Link href={e.href} className="flex flex-col gap-0.5 px-1 py-4 transition-colors hover:bg-subtle sm:flex-row sm:items-baseline sm:justify-between">
              <span className="text-[17px] font-medium">{e.titulo}</span>
              <span className="text-[14px] text-muted">{e.detalle}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mb-4 text-[26px]">Reglas del negocio</h2>
      <ConfiguracionForm valoresIniciales={valoresIniciales} />

      <form action={signOut} className="mt-14 border-t border-[color:var(--border)] pt-8">
        <Button type="submit" variant="ghost">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
