import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Tokens heredados 1:1 de STYLEGUIDE.md (proyecto Cartagena -> Sabat Finance).
 * Los colores viven como variables CSS en globals.css para soportar dark mode
 * via [data-theme="dark"] sin duplicar clases.
 */
const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        card: "var(--bg-card)",
        subtle: "var(--bg-subtle)",
        "hover-bg": "var(--bg-hover)",
        foreground: "var(--text)",
        muted: "var(--text-2)",
        faint: "var(--text-3)",
        accent: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
          light: "var(--accent-light)",
        },
        success: { DEFAULT: "var(--success)", bg: "var(--success-bg)" },
        warning: { DEFAULT: "var(--warning)", bg: "var(--warning-bg)" },
        danger: { DEFAULT: "var(--danger)", bg: "var(--danger-bg)" },
        info: "var(--info)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
        strong: "var(--border-md)",
      },
      fontFamily: {
        // Las mismas tres familias de SABAT Joyería (cargadas con next/font en layout.tsx).
        sans: ["var(--font-inter-tight)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["Cascadia Mono", "Consolas", "Courier New", "monospace"],
      },
      // Esquinas rectas, como la joyería. Solo los puntos y avatares son redondos (rounded-full).
      borderRadius: {
        none: "0",
        sm: "0",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        pill: "0",
      },
      boxShadow: {
        sm: "none",
        md: "0 10px 28px -14px rgba(20,17,15,.28)",
        lg: "0 24px 56px -24px rgba(20,17,15,.38)",
      },
      transitionTimingFunction: { premium: "cubic-bezier(0.23,1,0.32,1)" },
      transitionDuration: { premium: "180ms" },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Para el modal centrado con translate(-50%,-50%): la animación debe
        // conservar ese transform o el modal queda descentrado.
        "dialog-in": {
          "0%": { opacity: "0", transform: "translate(-50%, -48%) scale(.97)" },
          "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        "overlay-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s infinite",
        "fade-up": "fade-up 320ms cubic-bezier(.4,0,.2,1) both",
        "dialog-in": "dialog-in 200ms cubic-bezier(.4,0,.2,1) both",
        "overlay-in": "overlay-in 200ms cubic-bezier(.4,0,.2,1) both",
      },
    },
  },
  plugins: [animate],
};

export default config;
