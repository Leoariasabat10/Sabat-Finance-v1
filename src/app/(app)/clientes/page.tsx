import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { UserPlus, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { listClientes } from "@/lib/clientes/queries";
import { getInsightsNegocio } from "@/lib/inteligencia/insights";
import { BuscadorClientes } from "./_components/buscador-clientes";
import { ClienteCard } from "./_components/cliente-card";
import { Paginacion } from "./_components/paginacion";
import { InsightsStrip } from "./_components/insights-strip";

export const metadata: Metadata = { title: "Clientes · Sabat Finance" };

interface PageProps {
  searchParams: Promise<{ q?: string; pagina?: string }>;
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const busqueda = params.q ?? "";
  const pagina = Number(params.pagina) || 1;

  const [{ clientes, total, totalPaginas }, insights] = await Promise.all([
    listClientes({ busqueda, pagina }),
    getInsightsNegocio(),
  ]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Clientes"
        subtitle={`${total} cliente${total === 1 ? "" : "s"} registrado${total === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link href="/clientes/nuevo">
              <UserPlus className="h-4 w-4" />
              Nuevo cliente
            </Link>
          </Button>
        }
      />

      {!busqueda ? <InsightsStrip insights={insights} /> : null}

      <div className="mb-5">
        <Suspense fallback={<div className="h-10 w-full max-w-sm" />}>
          <BuscadorClientes valorInicial={busqueda} />
        </Suspense>
      </div>

      {clientes.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10 text-faint" />}
          title={busqueda ? "No encontramos ese cliente" : "Todavía no tienes clientes"}
          description={
            busqueda
              ? "Prueba con otro nombre o número de WhatsApp."
              : "Registra tu primer cliente — solo necesitas su nombre y WhatsApp, todo lo demás es opcional."
          }
          action={
            !busqueda ? (
              <Button asChild>
                <Link href="/clientes/nuevo">
                  <UserPlus className="h-4 w-4" />
                  Nuevo cliente
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {clientes.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </div>
      )}

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        buildHref={(p) => {
          const sp = new URLSearchParams();
          if (busqueda) sp.set("q", busqueda);
          sp.set("pagina", String(p));
          return `/clientes?${sp.toString()}`;
        }}
      />
    </div>
  );
}
