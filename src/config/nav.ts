/**
 * Navegación oficial aprobada. Ver visión final del producto (26 jul
 * 2026): la navegación se organiza alrededor de las preguntas del negocio
 * (Hoy / Cobrar / Clientes / Mi dinero), no de los módulos técnicos.
 * No modificar la estructura sin pasar por el proceso de decisión de
 * arquitectura.
 */
export interface NavItem {
  title: string;
  href: string;
  emoji: string;
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
  { title: "Hoy", href: "/dashboard", emoji: "📊" },
  { title: "Cobrar", href: "/cobrar", emoji: "🎯" },
  { title: "Clientes", href: "/clientes", emoji: "👥" },
  { title: "Mi dinero", href: "/dinero", emoji: "🏦" },
];

/** Las tres acciones rápidas del botón flotante (FAB) — visión final, sección 1. */
export const accionesRapidas: NavItem[] = [
  // "/pagos" (no "/pagos/nuevo"): esa ruta exige un ?operacion=<id> ya
  // elegido — el punto de entrada rápido siempre es el buscador de cliente.
  { title: "Registrar pago", href: "/pagos", emoji: "💵" },
  { title: "Nuevo préstamo", href: "/prestamos/nuevo", emoji: "💰" },
  { title: "Nueva venta", href: "/ventas/nueva", emoji: "🛍" },
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
      { title: "Préstamos", href: "/prestamos", emoji: "📋" },
      { title: "Ventas", href: "/ventas", emoji: "🧾" },
      { title: "WhatsApp", href: "/whatsapp", emoji: "💬" },
      { title: "Reportes", href: "/reportes", emoji: "📈" },
      { title: "Auditoría", href: "/auditoria", emoji: "🕵️" },
      { title: "Configuración", href: "/configuracion", emoji: "⚙️" },
    ],
  },
];
