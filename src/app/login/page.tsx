import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión — Sabat Finance",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-6">
      {/* Mismo lenguaje visual que sabat-joyeria: negro absoluto + glow esmeralda */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(29,107,77,0.22), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[380px]">
        <div className="mb-10 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sabat-logo-mark.png"
            alt="SABAT"
            className="h-14 w-auto opacity-95"
          />
          <p className="v-ui mt-5 text-[10px] uppercase tracking-[0.32em] text-[#8a6d1c]">
            Acceso privado
          </p>
          <p className="mt-2 font-serif text-lg italic text-white/50">Sabat Finance</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p className="mt-10 text-center text-[11px] text-white/25">
          Uso exclusivo de administradores de SABAT.
        </p>
      </div>
    </main>
  );
}
