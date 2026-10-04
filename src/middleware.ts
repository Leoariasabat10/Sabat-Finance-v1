import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { esAdministrador } from "@/lib/auth/acceso";

/**
 * Guardia de acceso de Sabat Finance. Todo lo que no sea /login (o assets públicos) exige, ANTES de que la petición
 * llegue a cualquier página o Route Handler:
 *   1. una sesión de Supabase Auth verificada contra el servidor (`getUser()`, no solo la cookie), y
 *   2. que esa cuenta sea de administrador (ver lib/auth/acceso.ts: el registro abierto de Supabase no debe dar acceso).
 * Un visitante sin sesión que escriba /dashboard va a /login y nunca recibe el HTML de la página protegida.
 *
 * Si Supabase no contesta en 4 s, se trata como "sin sesión" (va a /login con un aviso) en lugar de dejar la
 * petición colgada hasta que Vercel la corte a los 25 s (pasó en producción: 10 timeouts).
 */

// "/dev-preview" (datos ficticios para revisar el diseño) solo existe fuera de producción; en producción la ruta da 404.
const PUBLIC_PATHS = process.env.NODE_ENV === "production" ? ["/login"] : ["/login", "/dev-preview"];
const ESPERA_MAXIMA_MS = 4000;

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    /\.(?:svg|png|jpg|jpeg|webp|ico|json|webmanifest|txt|xml)$/.test(pathname)
  );
}

function aLogin(request: NextRequest, motivo?: "no-autorizado" | "servicio") {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  if (motivo) url.searchParams.set("error", motivo);
  else url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Sin cookie de sesión no hace falta preguntarle nada a Supabase.
  const hayCookieDeSesion = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  if (hayCookieDeSesion) {
    try {
      const resultado = await Promise.race([
        supabase.auth.getUser(),
        new Promise<never>((_, rechazar) => setTimeout(() => rechazar(new Error("timeout")), ESPERA_MAXIMA_MS)),
      ]);
      user = resultado.data.user;
    } catch {
      if (isPublicPath(pathname)) return response;
      return aLogin(request, "servicio");
    }
  }

  if (isPublicPath(pathname)) {
    if (user && esAdministrador(user) && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (!user) return aLogin(request);

  if (!esAdministrador(user)) {
    // Cuenta válida pero sin permiso (p. ej. alguien que se registró solo): se cierra su sesión y se explica.
    await supabase.auth.signOut();
    return aLogin(request, "no-autorizado");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Corre en todo excepto _next/static, _next/image y archivos con
     * extensión (favicons, manifest, service worker de la PWA, etc.).
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
