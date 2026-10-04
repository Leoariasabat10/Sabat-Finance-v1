import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión · Sabat Finance",
  robots: { index: false, follow: false },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sabat-joyeria.vercel.app";

const AVISOS: Record<string, string> = {
  "no-autorizado": "Esa cuenta no tiene acceso al área administrativa.",
  servicio: "No pudimos verificar tu sesión. Intenta de nuevo en un momento.",
};

/**
 * La puerta de la parte administrativa de la casa: la misma sala negra de SABAT Joyería, con el logo en oro, un título
 * en Fraunces y el botón de contorno dorado que se rellena al pasar. Sin brillos ni degradados.
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const aviso = error ? AVISOS[error] : undefined;

  return (
    <main className="flex min-h-screen flex-col justify-center bg-[#0a0a0a] px-6 py-12 text-[#ece9e2] sm:px-16">
      <div className="mx-auto w-full max-w-[420px] sm:mx-0 sm:max-w-[440px]">
        <Image src="/sabat-logo-mark.png" alt="SABAT" width={556} height={188} priority className="h-auto w-[170px]" />

        <h1 className="mt-14 text-[40px] leading-[1.05] sm:text-[48px]">Área administrativa</h1>
        <p className="lead-italic mt-3 text-[19px] text-[#ece9e2]/65">Las finanzas de la casa SABAT.</p>
        <div className="gold-rule mt-6 w-32" aria-hidden />

        {aviso ? (
          <p role="status" className="mt-8 border border-[#d5af34]/40 px-4 py-3 text-[15px] text-[#ece9e2]">
            {aviso}
          </p>
        ) : null}

        <div className="mt-10">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <a
          href={SITE_URL}
          className="mt-10 inline-block min-h-11 py-2.5 text-[15px] text-[#ece9e2]/60 underline-offset-4 transition-colors hover:text-[#ece9e2] hover:underline"
        >
          Volver a la joyería
        </a>
      </div>
    </main>
  );
}
