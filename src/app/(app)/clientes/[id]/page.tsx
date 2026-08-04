import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Pencil,
  MessageCircle,
  MapPin,
  IdCard,
  Users2,
  Landmark,
  ShoppingBag,
  HandCoins,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getClienteById, listEtiquetas, getLineaTiempoCliente } from "@/lib/clientes/queries";
import { getExpedienteFinanciero } from "@/lib/clientes/expediente";
import { BotonWhatsApp } from "@/components/shared/boton-whatsapp";
import { construirLinkWhatsapp } from "@/lib/whatsapp/mensajes";
import { formatearFecha } from "@/lib/formato";
import { FotoCliente } from "../_components/foto-cliente";
import { EtiquetasCliente } from "../_components/etiquetas-cliente";
import { NotasCliente } from "../_components/notas-cliente";
import { EliminarClienteDialog } from "../_components/eliminar-cliente-dialog";
import { ExpedienteCard } from "../_components/expediente-card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cliente = await getClienteById(id);
  return { title: cliente ? `${cliente.nombre} · Sabat Finance` : "Cliente · Sabat Finance" };
}

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default async function ClienteDetallePage({ params }: PageProps) {
  const { id } = await params;

  const [cliente, etiquetasDisponibles] = await Promise.all([
    getClienteById(id),
    listEtiquetas(),
  ]);

  if (!cliente) notFound();

  const [lineaTiempo, expediente] = await Promise.all([
    getLineaTiempoCliente(cliente.id),
    getExpedienteFinanciero(cliente.id),
  ]);

  const iconoEvento: Record<string, LucideIcon> = { prestamo: Landmark, venta: ShoppingBag, pago: HandCoins, nota: StickyNote };

  const datosContacto = [
    { icono: IdCard, valor: cliente.cedula, etiqueta: "Cédula" },
    { icono: MapPin, valor: [cliente.direccion, cliente.barrio, cliente.ciudad].filter(Boolean).join(", "), etiqueta: "Dirección" },
    { icono: Users2, valor: cliente.referencia, etiqueta: "Referencia" },
  ].filter((d) => d.valor);

  return (
    <div className="animate-fade-up">
      <Breadcrumb items={[{ label: "Clientes", href: "/clientes" }, { label: cliente.nombre }]} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <FotoCliente
            clienteId={cliente.id}
            nombre={cliente.nombre}
            fotoUrl={cliente.fotoUrl}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px]">{cliente.nombre}</h1>
              {cliente.estado === "inactivo" ? (
                <Badge variant="warning">Inactivo</Badge>
              ) : null}
            </div>
            <a
              href={construirLinkWhatsapp(cliente.whatsapp, `Hola ${cliente.nombre}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors duration-premium hover:text-accent-dark"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {cliente.whatsapp}
            </a>
            <div className="mt-2">
              <EtiquetasCliente
                clienteId={cliente.id}
                asignadas={cliente.etiquetas.map((e) => e.etiqueta)}
                disponibles={etiquetasDisponibles}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BotonWhatsApp
            numero={cliente.whatsapp}
            mensaje={`Hola ${cliente.nombre}.`}
            etiqueta="Enviar WhatsApp"
            variant="ghost"
            size="default"
          />
          <Button variant="ghost" asChild>
            <Link href={`/clientes/${cliente.id}/editar`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <EliminarClienteDialog clienteId={cliente.id} nombre={cliente.nombre} />
        </div>
      </div>

      <div className="mb-5">
        <ExpedienteCard expediente={expediente} clienteId={cliente.id} nombreCliente={cliente.nombre} />
      </div>

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="historial">Historial ({lineaTiempo.length})</TabsTrigger>
          <TabsTrigger value="notas">Notas ({cliente.notasList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent>
                <p className="mb-3 flex items-center gap-1.5 text-[12px] font-bold text-muted">
                  <Landmark className="h-3.5 w-3.5 text-accent" aria-hidden /> Financiero — préstamos
                </p>
                <p className="font-display text-2xl text-foreground">
                  {formatoMoneda.format(cliente.resumen.saldoPrestamos)}
                </p>
                <p className="mt-1 text-[12.5px] text-faint">
                  {cliente.resumen.prestamosActivos} préstamo
                  {cliente.resumen.prestamosActivos === 1 ? "" : "s"} activo
                  {cliente.resumen.prestamosActivos === 1 ? "" : "s"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="mb-3 flex items-center gap-1.5 text-[12px] font-bold text-muted">
                  <ShoppingBag className="h-3.5 w-3.5 text-success" aria-hidden /> Comercial — ventas
                </p>
                <p className="font-display text-2xl text-foreground">
                  {formatoMoneda.format(cliente.resumen.saldoVentas)}
                </p>
                <p className="mt-1 text-[12.5px] text-faint">
                  {cliente.resumen.totalVentas} compra
                  {cliente.resumen.totalVentas === 1 ? "" : "s"} en total
                </p>
              </CardContent>
            </Card>
          </div>

          {datosContacto.length > 0 ? (
            <Card>
              <CardContent className="flex flex-col gap-3">
                {datosContacto.map((d) => (
                  <div key={d.etiqueta} className="flex items-center gap-2.5 text-[13.5px]">
                    <d.icono className="h-4 w-4 shrink-0 text-faint" />
                    <span className="text-muted">{d.etiqueta}:</span>
                    <span className="text-foreground">{d.valor}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {cliente.notas ? (
            <Card>
              <CardContent>
                <p className="mb-1.5 text-[12px] font-bold text-muted">
                  Nota de registro
                </p>
                <p className="whitespace-pre-wrap text-[13.5px] text-foreground">
                  {cliente.notas}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardContent>
              {lineaTiempo.length === 0 ? (
                <p className="text-[13px] text-muted">Sin actividad todavía.</p>
              ) : (
                <div className="flex flex-col divide-y divide-[color:var(--border)]">
                  {lineaTiempo.map((e, i) => {
                    const IconoEvento = iconoEvento[e.tipo];
                    const contenido = (
                      <div className="flex items-center justify-between py-2.5 text-[13px]">
                        <span className="inline-flex items-center gap-1.5">
                          {IconoEvento ? <IconoEvento className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden /> : null}
                          <strong>{e.titulo}</strong>
                          <span className="text-muted">· {e.detalle}</span>
                        </span>
                        <span className="text-[11.5px] text-muted">{formatearFecha(e.fecha)}</span>
                      </div>
                    );
                    return e.href ? (
                      <Link key={i} href={e.href} className="hover:text-accent">
                        {contenido}
                      </Link>
                    ) : (
                      <div key={i}>{contenido}</div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notas">
          <NotasCliente clienteId={cliente.id} notas={cliente.notasList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
