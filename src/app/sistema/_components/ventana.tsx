import Image from "next/image";
import type { Foto } from "@/lib/sistema/media";
import { cn } from "@/lib/utils";

/** Una ventana fotográfica: cuadrada, con filete. Acompaña; nunca va detrás de algo que se marque o se lea con cuidado. */
export function Ventana({ foto, className, sizes = "(min-width: 1024px) 360px, 50vw" }: { foto: Foto; className?: string; sizes?: string }) {
  return (
    <div className={cn("relative overflow-hidden border border-[color:var(--border)] bg-[#0a0a0a]", className)}>
      <Image src={foto.src} alt={foto.alt} fill sizes={sizes} className="object-cover" style={{ objectPosition: foto.pos ?? "50% 50%" }} />
    </div>
  );
}
