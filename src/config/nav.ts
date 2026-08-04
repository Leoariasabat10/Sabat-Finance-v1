import type { ReactElement, SVGProps } from "react";
import {
  Home,
  Target,
  Users,
  Wallet,
  HandCoins,
  Landmark,
  ShoppingBag,
  History,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/icons";

/** lucide-react no trae logos de marca (WhatsAppIcon es SVG propio) — unión amplia para admitir ambos como NavItem.icon. */
export type NavIcon = LucideIcon | ((props: SVGProps<SVGSVGElement>) => ReactElement);

/**
 * Navegación oficial aprobada. Ver visión final del producto (26 jul
 * 2026): la navegación se organiza alrededor de las preguntas del negocio
 * (Hoy / Cobrar / Clientes / Mi dinero), no de los módulos técnicos.
 * No modificar la estructura sin pasar por el proceso de decisión de
 * arquitectura.
 *
 * 2 ago 2026 — íconos migrados de emoji a Lucide (ver STYLEGUIDE.md).
 */
export interface NavItem {
  title: string;
  href: string;
  icon: NavIcon;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

/**
 * Las cuatro preguntas del negocio (visión final, sección 1): también
 * usadas por la barra de navegación móvil y como base del acceso rápido.
 * No cambiar el orden sin actualizar mobile-tab-bar.tsx.
 */
export const navPrimaria: NavItem[] = [
  { title: "Hoy", href: "/dashboard", icon: Home },
  { title: "Cobrar", href: "/cobrar", icon: Target },
  { title: "Clientes", href: "/clientes", icon: Users },
  { title: "Mi dinero", href: "/dinero", icon: Wallet },
];

/** Las tres acciones rápidas del botón flotante (FAB) — visión final, sección 1. */
export const accionesRapidas: NavItem[] = [
  // "/pagos" (no "/pagos/nuevo"): esa ruta exige un ?operacion=<id> ya
  // elegido — el punto de entrada rápido siempre es el buscador de cliente.
  { title: "Registrar pago", href: "/pagos", icon: HandCoins },
  { title: "Nuevo préstamo", href: "/prestamos/nuevo", icon: Landmark },
  { title: "Nueva venta", href: "/ventas/nueva", icon: ShoppingBag },
];

export const navSections: NavSection[] = [
  { items: navPrimaria },
  {
    label: "Acceso rápido",
    items: accionesRapidas,
  },
  {
    // "Más" (visión final, sección 1 y 3): administración del sistema, no
    // preguntas de negocio — nunca compite por atención con las cuatro de
    // arriba. Incluye los listados planos de Préstamos/Ventas/Pagos, que
    // ahora son secundarios frente a Cobrar y la búsqueda global (Ctrl+K).
    label: "Más",
    items: [
      { title: "Préstamos", href: "/prestamos", icon: Landmark },
      { title: "Ventas", href: "/ventas", icon: ShoppingBag },
      { title: "WhatsApp", href: "/whatsapp", icon: WhatsAppIcon },
      { title: "Reportes", href: "/reportes", icon: BarChart3 },
      { title: "Auditoría", href: "/auditoria", icon: History },
      { title: "Configuración", href: "/configuracion", icon: Settings },
    ],
  },
];
