import Link from "next/link";
import { FOTOS } from "@/lib/sistema/media";
import { Encabezado } from "../_components/encabezado";
import { DatosPanel } from "../_components/datos-panel";

export const metadata = { title: "Más · Mi Sistema" };

const ENLACES = [
  { href: "/sistema/cuerpo", titulo: "Cuerpo", detalle: "Peso, cintura y el cuidado de cada día." },
  { href: "/sistema/semanal", titulo: "Semanal", detalle: "La revisión del domingo." },
  { href: "/sistema/reglas", titulo: "Reglas", detalle: "Sin negociación." },
  { href: "/sistema/plan", titulo: "Plan", detalle: "Qué intentas conseguir y en qué fase vas." },
  { href: "/sistema/calendario", titulo: "Calendario", detalle: "Los 39 días, uno por uno." },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-10 pb-8">
      <Encabezado titulo="Más" lead="Lo que se consulta menos que Hoy." foto={FOTOS.noche} />
      <ul>
        {ENLACES.map((e) => (
          <li key={e.href} className="border-t border-[color:var(--border)]">
            <Link href={e.href} className="flex min-h-[68px] flex-col justify-center gap-0.5 py-3 transition-colors active:bg-[color:var(--bg-subtle)] sm:flex-row sm:items-baseline sm:justify-between">
              <span className="font-display text-[24px] leading-tight">{e.titulo}</span>
              <span className="text-[15px] text-muted">{e.detalle}</span>
            </Link>
          </li>
        ))}
        <li className="border-t border-[color:var(--border)]" />
      </ul>
      <DatosPanel />
      <Link href="/configuracion" className="min-h-11 text-[15px] text-muted underline-offset-4 hover:text-foreground hover:underline">
        Volver a Administración
      </Link>
    </div>
  );
}
