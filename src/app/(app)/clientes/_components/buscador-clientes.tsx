"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Buscador con debounce que empuja el término a la URL (?q=...). El listado
 * en sí vive en el Server Component de la página, así que aquí solo se
 * dispara la navegación — evita duplicar el fetch de clientes en el cliente.
 */
export function BuscadorClientes({ valorInicial }: { valorInicial: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(valorInicial);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValor(valorInicial);
  }, [valorInicial]);

  function actualizar(nuevoValor: string) {
    setValor(nuevoValor);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (nuevoValor.trim()) {
        params.set("q", nuevoValor.trim());
      } else {
        params.delete("q");
      }
      params.delete("pagina");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
      <Input
        value={valor}
        onChange={(e) => actualizar(e.target.value)}
        placeholder="Buscar por nombre o WhatsApp..."
        className="pl-9 pr-9"
        aria-label="Buscar clientes"
      />
      {isPending ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-faint" />
      ) : null}
    </div>
  );
}
