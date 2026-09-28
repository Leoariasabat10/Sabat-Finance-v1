import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Guardia de acceso de Sabat Finance (integración con Sabat Joyería,
 * 28 sep 2026).
 *
 * Antes: la app no verificaba sesión en ningún lado ("uso privado, un solo
 * computador" — ver historial de commits). Eso significaba que cualquier
 * persona con la URL de producción podía abrir /dashboard, /clientes,
 * /prestamos, etc. directamente, sin ningún control del servidor.
 *
 * Ahora: todo lo que no sea /login (o assets públicos) exige una sesión de
 * Supabase Auth verificada aquí, en el servidor, antes de que la petición
 * llegue a cualquier página o Route Handler. Un usuario no autenticado que
 * escriba /dashboard es redirigido a /login — nunca ve el HTML de la página
 * protegida (a diferencia de un guard solo en el cliente, que sí la
 * descarga y luego la oculta con JS).
 */

const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    /\.(?:svg|png|jpg|jpeg|webp|ico|json|webmanifest|txt|xml)$/.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: getUser() (no getSession()) — revalida el token contra el
  // servidor de Supabase Auth en cada request, no confía en la cookie sin
  // más. Es la verificación server-side real que pide la auditoría.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
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
