"use client";

import * as React from "react";
import { Input } from "./input";

/**
 * Input de dinero con separador de miles en vivo (es-CO): el usuario escribe
 * "2000000" y ve "2.000.000". Compatible con react-hook-form: se registra con
 * `setValueAs: limpiarMoneda` para que el form reciba un número limpio.
 */
export function limpiarMoneda(v: unknown): number {
  const digitos = String(v ?? "").replace(/\D/g, "");
  return digitos === "" ? 0 : Number(digitos);
}

export function formatearMiles(v: unknown): string {
  const digitos = String(v ?? "").replace(/\D/g, "");
  return digitos === "" ? "" : Number(digitos).toLocaleString("es-CO");
}

export const MoneyInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ onChange, ...props }, ref) => {
  // Auditoría Sprint 1: los montos nunca son negativos, pero en vez de
  // corregir el signo "-" en silencio, se lo hacemos saber al usuario.
  const [intentoNegativo, setIntentoNegativo] = React.useState(false);

  return (
    <div>
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        onChange={(e) => {
          setIntentoNegativo(e.target.value.includes("-"));
          e.target.value = formatearMiles(e.target.value);
          onChange?.(e);
        }}
        {...props}
      />
      {intentoNegativo ? (
        <p className="mt-1 text-[11.5px] font-medium text-danger">
          Los valores no pueden ser negativos — se quitó el signo &quot;-&quot;.
        </p>
      ) : null}
    </div>
  );
});
MoneyInput.displayName = "MoneyInput";
