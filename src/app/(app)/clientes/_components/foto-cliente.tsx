"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { subirFotoCliente } from "@/lib/clientes/actions";

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  const primera = partes[0]?.[0] ?? "";
  const segunda = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? "" : "";
  return (primera + segunda).toUpperCase();
}

interface FotoClienteProps {
  clienteId: string;
  nombre: string;
  fotoUrl: string | null;
}

export function FotoCliente({ clienteId, nombre, fotoUrl }: FotoClienteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(fotoUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setError(null);
    const localUrl = URL.createObjectURL(archivo);
    setPreview(localUrl);

    const formData = new FormData();
    formData.set("foto", archivo);

    startTransition(async () => {
      const resultado = await subirFotoCliente(clienteId, formData);
      if (!resultado.ok) {
        setError(resultado.error);
        setPreview(fotoUrl);
      }
    });
  }

  return (
    <div className="relative">
      <Avatar className="h-20 w-20 border-2 border-card shadow-sm">
        <AvatarImage src={preview ?? undefined} alt={nombre} />
        <AvatarFallback className="text-xl">{iniciales(nombre)}</AvatarFallback>
      </Avatar>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-label="Cambiar foto"
        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-accent text-white shadow-sm transition-transform duration-premium ease-premium hover:scale-105 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Camera className="h-3.5 w-3.5" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {error ? (
        <p className="absolute top-full mt-1.5 w-40 text-[11px] font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
