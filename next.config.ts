import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
