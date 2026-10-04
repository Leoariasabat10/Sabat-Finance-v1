import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listCreditos, type CreditoItem, type OrigenCredito } from "@/lib/creditos/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Créditos · Sabat Finance" };
export const dynamic = "force-dynamic";

const FILTROS: { clave: "todos" | OrigenCredito; etiqueta: string }[] = [
  { clave: "todos", etiqueta: "Todos" },
  { clave: "prestamo", etiqueta: "Préstamos" },
  { clave: "venta", etiqueta: "Mercancía" },
];

function EstadoPago({ c }: { c: CreditoItem }) {
  if (c.estadoPago === "atrasado") return <Badge variant="danger">{c.diasAtraso} {c.diasAtraso === 1 ? "día" : "días"} de atraso</Badge>;
  if (c.estadoPago === "hoy") return <Badge variant="warning">Vence hoy</Badge>;
  return <Badge variant="success">Al día</Badge>;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ origen?: string }> }) {
  const { origen } = await searchParams;
  const filtro: "todos" | OrigenCredito = origen === "prestamo" || origen === "venta" ? origen : "todos";
  const todos = await listCreditos();
  const lista = filtro === "todos" ? todos : todos.filter((c) => c.origen === filtro);

  const resumen = (o: OrigenCredito) => {
    const xs = todos.filter((c) => c.origen === o);
    return { monto: xs.reduce((a, c) => a + c.saldo, 0), cantidad: xs.length };
  };
  const prestamos = resumen("prestamo");
  const mercancia = resumen("venta");

  return (
    <div className="animate-fade-up mx-auto max-w-5xl pb-24">
      <PageHeader
        title="Créditos"
        subtitle="Lo que te deben, separado por origen."
        actions={
          <>
            <Button asChild>
              <Link href="/prestamos/nuevo">+ Nuevo préstamo</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/ventas/nueva">+ Venta a crédito</Link>
            </Button>
          </>
        }
      />

      <dl className="mb-8 grid grid-cols-1 border-y border-[color:var(--border)] sm:grid-cols-2">
        <div className="border-b border-[color:var(--border)] py-5 sm:border-b-0 sm:border-r sm:pr-6">
          <dt className="text-[15px] text-muted">Préstamos en la calle</dt>
          <dd className="metric-value mt-1 text-[34px]">{formatearMoneda(prestamos.monto)}</dd>
          <dd className="text-[14px] text-faint">{prestamos.cantidad} {prestamos.cantidad === 1 ? "préstamo" : "préstamos"}</dd>
        </div>
        <div className="py-5 sm:pl-6">
          <dt className="text-[15px] text-muted">Mercancía en la calle</dt>
          <dd className="metric-value mt-1 text-[34px]">{formatearMoneda(mercancia.monto)}</dd>
          <dd className="text-[14px] text-faint">{mercancia.cantidad} {mercancia.cantidad === 1 ? "venta a crédito" : "ventas a crédito"}</dd>
        </div>
      </dl>

      <nav aria-label="Filtrar por origen" className="mb-2 flex gap-1 border-b border-[color:var(--border)]">
        {FILTROS.map((f) => {
          const activo = f.clave === filtro;
          return (
            <Link
              key={f.clave}
              href={f.clave === "todos" ? "/creditos" : `/creditos?origen=${f.clave}`}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "-mb-px border-b-2 px-4 py-3 text-[15px] font-medium transition-colors",
                activo ? "border-[color:var(--gold)] text-foreground" : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {f.etiqueta}
            </Link>
          );
        })}
      </nav>

      {lista.length === 0 ? (
        <p className="lead-italic py-10 text-[18px] text-muted">
          {filtro === "todos" ? "No hay nada en la calle." : filtro === "prestamo" ? "No hay préstamos en la calle." : "No hay mercancía a crédito en la calle."}
        </p>
      ) : (
        <ul>
          {lista.map((c) => (
            <li key={c.id} className="border-b border-[color:var(--border)]">
              <Link
                href={c.origen === "venta" && c.ventaId ? `/ventas/${c.ventaId}` : `/prestamos/${c.id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-4 transition-colors hover:bg-subtle sm:grid-cols-[1fr_auto_auto] sm:px-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-medium">{c.clienteNombre}</p>
                  <p className="text-[14px] text-muted">
                    <span className="font-medium text-foreground">{c.origen === "prestamo" ? "Préstamo" : "Mercancía"}</span>
                    {c.producto ? ` · ${c.producto}` : ""} · próximo pago {formatearFecha(c.proximaFecha)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="money text-[19px] font-medium">{formatearMoneda(c.saldo)}</p>
                  <p className="text-[13px] text-faint">saldo</p>
                </div>
                <div className="col-span-2 sm:col-span-1 sm:justify-self-end">
                  <EstadoPago c={c} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
