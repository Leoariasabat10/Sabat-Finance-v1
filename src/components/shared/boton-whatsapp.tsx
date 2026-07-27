import { Button, type ButtonProps } from "@/components/ui/button";
import { construirLinkWhatsapp } from "@/lib/whatsapp/mensajes";

interface BotonWhatsAppProps extends Omit<ButtonProps, "asChild"> {
  numero: string;
  mensaje: string;
  /** Por defecto "WhatsApp" — se puede personalizar, ej. "Enviar WhatsApp". */
  etiqueta?: string;
}

/**
 * Botón de un clic: abre WhatsApp (Web en computador, app en celular) con el
 * chat del cliente y el mensaje ya escrito. Sin modal, sin copiar texto, sin
 * pasos intermedios — la única acción disponible en cualquier pantalla donde
 * aparece un cliente (Cobrar, Clientes, Expediente, Préstamos, Mi dinero).
 */
export function BotonWhatsApp({ numero, mensaje, etiqueta = "WhatsApp", variant = "ghost", size = "sm", ...props }: BotonWhatsAppProps) {
  return (
    <Button asChild variant={variant} size={size} {...props}>
      <a href={construirLinkWhatsapp(numero, mensaje)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
        {etiqueta ? `💬 ${etiqueta}` : "💬"}
      </a>
    </Button>
  );
}
