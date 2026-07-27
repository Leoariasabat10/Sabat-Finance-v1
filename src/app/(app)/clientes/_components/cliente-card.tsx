import Link from "next/link";
import { MessageCircle, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BotonWhatsApp } from "@/components/shared/boton-whatsapp";
import type { ClienteListItem } from "@/lib/clientes/queries";

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  const primera = partes[0]?.[0] ?? "";
  const segunda = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? "" : "";
  return (primera + segunda).toUpperCase();
}

export function ClienteCard({ cliente }: { cliente: ClienteListItem }) {
  return (
    <Card className="flex items-center gap-3.5 p-4 transition-all duration-premium ease-premium hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/clientes/${cliente.id}`} className="flex min-w-0 flex-1 items-center gap-3.5">
        <Avatar className="h-11 w-11">
          <AvatarImage src={cliente.fotoUrl ?? undefined} alt={cliente.nombre} />
          <AvatarFallback>{iniciales(cliente.nombre)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-[14px] font-bold text-foreground">
            {cliente.nombre}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-muted">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {cliente.whatsapp}
            </span>
            {cliente.ciudad ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {cliente.ciudad}
              </span>
            ) : null}
          </div>
          {cliente.etiquetas.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cliente.etiquetas.map((et) => (
                <Badge
                  key={et.id}
                  variant="info"
                  style={{
                    backgroundColor: `${et.color}22`,
                    color: et.color,
                  }}
                >
                  {et.nombre}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        {cliente.estado === "inactivo" ? (
          <Badge variant="warning">Inactivo</Badge>
        ) : null}
      </Link>

      <BotonWhatsApp
        numero={cliente.whatsapp}
        mensaje={`Hola ${cliente.nombre}.`}
        etiqueta=""
        aria-label={`Enviar WhatsApp a ${cliente.nombre}`}
      />
    </Card>
  );
}
