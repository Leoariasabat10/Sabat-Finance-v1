import type { ReactElement, SVGProps } from "react";
import { Home, Target, Users, Landmark, ShoppingBag, Settings, Gem, HandCoins, UserPlus, type LucideIcon } from "lucide-react";

/** lucide-react no trae logos de marca (WhatsAppIcon es SVG propio) — unión amplia para admitir ambos como NavItem.icon. */
export type NavIcon = LucideIcon | ((props: SVGProps<SVGSVGElement>) => ReactElement);

export interface NavItem {
  title: string;
  /** versión corta para la barra inferior del teléfono */
  shortTitle?: string;
  href: string;
  icon: NavIcon;
  /** No cabe en la barra inferior del teléfono (6 columnas); se llega por Administración. */
  soloEscritorio?: boolean;
}

/**
 * Navegación de Sabat Finance: seis destinos, en el orden en que se usa el negocio durante el día.
 *   Hoy → qué tengo y a quién cobro · Ventas · Créditos (lo que me deben, separado por origen) · Cobros · Clientes ·
 *   Administración (dinero inicial, reportes, auditoría, WhatsApp, cerrar sesión).
 * No se agregan módulos aquí sin que respondan una pregunta que alguien se hace de verdad en el día.
 */
export const navPrimaria: NavItem[] = [
  { title: "Hoy", href: "/dashboard", icon: Home },
  { title: "Ventas", href: "/ventas", icon: ShoppingBag },
  { title: "Créditos", href: "/creditos", icon: Landmark },
  { title: "Cobros", href: "/cobrar", icon: Target },
  { title: "Clientes", href: "/clientes", icon: Users },
  { title: "Inventario", href: "/inventario", icon: Gem, soloEscritorio: true },
  { title: "Administración", shortTitle: "Admin", href: "/configuracion", icon: Settings },
];

/** Las cuatro acciones del día (botón flotante en las pantallas que no son "Hoy", donde ya están a la vista). */
export const accionesRapidas: NavItem[] = [
  { title: "Nueva venta", href: "/ventas/nueva", icon: ShoppingBag },
  { title: "Nuevo crédito", href: "/prestamos/nuevo", icon: Landmark },
  // "/pagos" (no "/pagos/nuevo"): esa ruta exige un ?operacion=<id> ya elegido — el punto de entrada es el buscador.
  { title: "Registrar pago", href: "/pagos", icon: HandCoins },
  { title: "Nuevo cliente", href: "/clientes/nuevo", icon: UserPlus },
];
