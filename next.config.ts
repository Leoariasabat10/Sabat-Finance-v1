import path from "node:path";
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // sabat-finance vive dentro de PAGINA CARTAGENA (proyecto Cartagena, un
  // servidor Node distinto con su propio package-lock.json) — sin esto,
  // Next.js sube un nivel, encuentra ese lockfile ajeno y adivina mal la
  // raíz del workspace para el file tracing.
  outputFileTracingRoot: path.join(__dirname),
};

// Service worker solo para consulta offline (páginas y estáticos ya
// visitados) — las mutaciones son Server Actions (POST), que Workbox no
// intercepta por defecto, así que nunca quedan "offline-first" por accidente.
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

export default withPWA(nextConfig);
