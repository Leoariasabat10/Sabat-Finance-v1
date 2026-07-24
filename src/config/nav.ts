/**
 * Navegación oficial aprobada (02-mockups.html). No modificar la estructura
 * sin pasar por el proceso de decisión de arquitectura.
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

export const navSections: NavSection[] = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", emoji: "📊" },
      { title: "Cobrar", href: "/cobrar", emoji: "🎯" },
      { title: "Clientes", href: "/clientes", emoji: "👥" },
    ],
  },
  {
    label: "Crédito",
    items: [
      { title: "Nuevo préstamo", href: "/prestamos/nuevo", emoji: "➕" },
      { title: "Préstamos", href: "/prestamos", emoji: "💰" },
      { title: "Registrar pago", href: "/pagos", emoji: "💵" },
      { title: "Cartera", href: "/cartera", emoji: "📋" },
    ],
  },
  {
    label: "Comercial",
    items: [
      { title: "Nueva venta", href: "/ventas/nueva", emoji: "🛍" },
      { title: "Caja", href: "/caja", emoji: "🏦" },
    ],
  },
  {
    label: "Operación",
    items: [
      { title: "Calendario", href: "/calendario", emoji: "🗓️" },
      { title: "WhatsApp", href: "/whatsapp", emoji: "💬" },
      { title: "Reportes", href: "/reportes", emoji: "📈" },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { title: "Notificaciones", href: "/notificaciones", emoji: "🔔" },
      { title: "Auditoría", href: "/auditoria", emoji: "🕵️" },
      { title: "Configuración", href: "/configuracion", emoji: "⚙️" },
    ],
  },
];
