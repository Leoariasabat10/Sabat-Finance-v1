/**
 * Mapa ruta -> módulo del roadmap aprobado (07-roadmap.md).
 * Alimenta los estados vacíos del shell del Módulo 1.
 */
export interface ModuleInfo {
  numero: number;
  nombre: string;
}

export const moduleByRoute: Record<string, ModuleInfo> = {
  "/clientes": { numero: 2, nombre: "Clientes" },
  "/prestamos/nuevo": { numero: 4, nombre: "Préstamos (flujo rápido)" },
  "/prestamos": { numero: 4, nombre: "Préstamos (flujo rápido)" },
  "/ventas/nueva": { numero: 5, nombre: "Ventas sin catálogo" },
  "/pagos": { numero: 6, nombre: "Pagos, caja y cartera" },
  "/cartera": { numero: 6, nombre: "Pagos, caja y cartera" },
  "/caja": { numero: 6, nombre: "Pagos, caja y cartera" },
  "/cobrar": { numero: 7, nombre: "Calendario y Cobrar" },
  "/calendario": { numero: 7, nombre: "Calendario y Cobrar" },
  "/notificaciones": { numero: 7, nombre: "Calendario y Cobrar" },
  "/whatsapp": { numero: 8, nombre: "WhatsApp + resumen diario" },
  "/dashboard": { numero: 9, nombre: "Dashboard Ejecutivo" },
  "/reportes": { numero: 10, nombre: "Reportes y exportación" },
  "/auditoria": { numero: 12, nombre: "Ficha 360° y configuración" },
  "/configuracion": { numero: 12, nombre: "Ficha 360° y configuración" },
};
