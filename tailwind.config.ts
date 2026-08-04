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
        // Tipografías nativas: cargan de inmediato y dan un tono sobrio de
        // software financiero sin bloquear el primer render con fuentes remotas.
        sans: ["Segoe UI", "Arial", "Helvetica", "sans-serif"],
        display: ["Segoe UI", "Arial", "Helvetica", "sans-serif"],
        mono: ["Cascadia Mono", "Consolas", "Courier New", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        pill: "100px",
      },
      boxShadow: {
        sm: "0 2px 8px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
        md: "0 4px 16px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)",
        lg: "0 8px 32px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.04)",
      },
      transitionTimingFunction: { premium: "cubic-bezier(.4,0,.2,1)" },
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
