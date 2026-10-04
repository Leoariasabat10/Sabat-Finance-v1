/**
 * Quién puede entrar a Sabat Finance.
 *
 * Sabat Finance comparte proyecto de Supabase con SABAT Joyería. En Supabase Auth el registro de usuarios suele estar
 * abierto (cualquiera con la clave pública puede crear una cuenta), así que "tener una sesión" NO basta: cualquier
 * persona podría registrarse y ver los clientes y las deudas. Entra solo quien sea administrador:
 *   - `app_metadata.rol === "admin"` (solo se puede escribir con la clave de servicio o desde el panel de Supabase;
 *     un usuario no puede ponérselo a sí mismo), o
 *   - su correo está en la variable de entorno `ADMIN_EMAILS` (lista separada por comas).
 */
export interface UsuarioMinimo {
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
}

export function esAdministrador(user: UsuarioMinimo | null | undefined, adminEmails = process.env.ADMIN_EMAILS ?? ""): boolean {
  if (!user) return false;
  if (user.app_metadata?.rol === "admin") return true;
  const email = (user.email ?? "").trim().toLowerCase();
  if (!email) return false;
  return adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email);
}

/**
 * Mi Sistema es personal: no basta con ser administrador de Finance (también lo es quien lleva el negocio). Solo entra
 * quien figure en `SISTEMA_EMAILS` (lista separada por comas). Sin esa variable, nadie entra: cerrado por defecto.
 * No existe forma de otorgarse el acceso desde el navegador; el correo viene de la sesión verificada en el servidor.
 */
export function esDuenoDelSistema(user: UsuarioMinimo | null | undefined, correos = process.env.SISTEMA_EMAILS ?? ""): boolean {
  if (!user) return false;
  const email = (user.email ?? "").trim().toLowerCase();
  if (!email) return false;
  return correos
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email);
}

/**
 * Solo se acepta redirigir a una ruta interna. `//sitio.com` y `/\sitio.com` los interpreta el navegador como otro
 * sitio (redirección abierta), así que se descartan.
 */
export function destinoSeguro(next: string | null | undefined, porDefecto = "/dashboard"): string {
  if (!next) return porDefecto;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\") || /[\u0000-\u001f]/.test(next)) return porDefecto;
  return next;
}
