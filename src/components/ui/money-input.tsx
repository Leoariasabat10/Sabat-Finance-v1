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
>(({ onChange, ...props }, ref) => (
  <Input
    ref={ref}
    type="text"
    inputMode="numeric"
    autoComplete="off"
    onChange={(e) => {
      e.target.value = formatearMiles(e.target.value);
      onChange?.(e);
    }}
    {...props}
  />
));
MoneyInput.displayName = "MoneyInput";
