"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Último recurso: se activa solo si el root layout mismo falla (por eso
 * define su propio <html>/<body> y no puede depender de ThemeProvider).
 * Estilos inline con los mismos tokens de STYLEGUIDE.md en modo claro.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
          background: "#f8f9fb",
          color: "#0f172a",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 360, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <AlertTriangle size={36} color="#f59e0b" />
          </div>
          <h1 style={{ fontSize: 16, fontWeight: 800 }}>Algo salió mal</h1>
          <p style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>
            Sabat Finance no pudo cargar. Tus datos están a salvo — intenta de
            nuevo.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 20,
              borderRadius: 12,
              background: "#0ea5e9",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13.5,
              padding: "10px 16px",
              border: "none",
              cursor: "pointer",
            }}

          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
