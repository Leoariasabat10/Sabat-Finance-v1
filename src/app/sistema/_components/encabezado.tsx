import Image from "next/image";
import type { ReactNode } from "react";
import type { Clip, Foto } from "@/lib/sistema/media";
import { LoopVideo } from "./loop-video";

/**
 * Cabecera de cada sección de Mi Sistema. Con `clip`: una franja con el bucle de fondo y el título encima (velo oscuro
 * para que se lea siempre). Con `foto`: título a la izquierda y una ventana fotográfica a la derecha. Nunca hay
 * imagen detrás de algo que se tenga que marcar o leer con cuidado: eso va debajo, sobre negro.
 */
export function Encabezado({
  titulo,
  lead,
  clip,
  foto,
  children,
}: {
  titulo: string;
  lead?: string;
  clip?: Clip;
  foto?: Foto;
  children?: ReactNode;
}) {
  if (clip) {
    return (
      <header className="relative isolate -mx-5 overflow-hidden sm:-mx-8 lg:mx-0">
        <div className="absolute inset-0 -z-10">
          <LoopVideo clip={clip} className="h-full w-full" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(10,10,10,0.9),rgba(10,10,10,0.25)_75%)]" />
        <div className="flex min-h-[230px] flex-col justify-end px-5 pb-7 pt-20 sm:min-h-[280px] sm:px-8 lg:px-10">
          <h1 className="text-[44px] leading-none sm:text-[60px]">{titulo}</h1>
          {lead ? <p className="lead-italic mt-3 max-w-[48ch] text-[19px] text-foreground/80">{lead}</p> : null}
          <div className="gold-rule mt-5 w-32" aria-hidden />
          {children}
        </div>
      </header>
    );
  }
  return (
    <header className="grid gap-5 pt-6 lg:grid-cols-[1fr_300px] lg:items-end lg:gap-10 lg:pt-10">
      {foto ? (
        <div className="relative h-28 overflow-hidden border border-[color:var(--border)] sm:h-32 lg:order-last lg:h-[150px]">
          <Image src={foto.src} alt={foto.alt} fill sizes="(min-width: 1024px) 300px, 100vw" className="object-cover" style={{ objectPosition: foto.pos ?? "50% 50%" }} />
        </div>
      ) : null}
      <div>
        <h1 className="text-[40px] leading-[1.02] sm:text-[52px]">{titulo}</h1>
        {lead ? <p className="lead-italic mt-3 max-w-[48ch] text-[19px] text-muted">{lead}</p> : null}
        <div className="gold-rule mt-5 w-28" aria-hidden />
        {children}
      </div>
    </header>
  );
}
