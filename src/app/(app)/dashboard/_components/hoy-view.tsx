import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotonWhatsApp } from "@/components/shared/boton-whatsapp";
import type { CobroDelDia, DatosHoy } from "@/lib/hoy/queries";
import { formatearMoneda, formatearFecha } from "@/lib/formato";
import { mensajeSegunSemaforo, tieneWhatsapp } from "@/lib/whatsapp/mensajes";

function fechaLarga(hoy: Date): string {
  const texto = hoy.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const etiquetaOrigen = (o: "prestamo" | "venta") => (o === "prestamo" ? "Préstamo" : "Mercancía");

function plural(n: number, uno: string, varios: string) {
  return `${n} ${n === 1 ? uno : varios}`;
}

/** Una fila de cobro: quién, cuánto, cuándo y la acción. Sin tarjetas: filetes. */
function FilaCobro({ cobro }: { cobro: CobroDelDia }) {
  const atrasado = cobro.diasAtraso > 0;
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-t border-[color:var(--border)] py-4 sm:grid-cols-[1fr_auto_auto]">
      <div className="min-w-0">
        <Link href={`/clientes/${cobro.clienteId}`} className="block truncate text-[17px] font-medium text-foreground hover:text-accent">
          {cobro.clienteNombre}
        </Link>
        <p className="text-[14px] text-muted">
          {etiquetaOrigen(cobro.origen)} ·{" "}
          {atrasado ? (
            <span className="font-medium text-danger">
              {plural(cobro.diasAtraso, "día", "días")} de atraso
            </span>
          ) : (
            <span>vence hoy, {formatearFecha(cobro.fecha)}</span>
          )}
        </p>
      </div>
      <p className="money text-right text-[19px] font-medium">{formatearMoneda(cobro.monto)}</p>
      <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
        <Button asChild>
          <Link href={`/pagos/nuevo?operacion=${cobro.operacionId}`}>Cobrar</Link>
        </Button>
        {tieneWhatsapp(cobro.clienteWhatsapp) ? (
          <BotonWhatsApp
            numero={cobro.clienteWhatsapp}
            mensaje={mensajeSegunSemaforo({
              semaforo: atrasado ? "vencido" : "hoy",
              cliente: cobro.clienteNombre,
              valor: cobro.monto,
              fecha: cobro.fecha,
            })}
            etiqueta="WhatsApp"
          />
        ) : (
          <span className="text-[13px] text-faint">Sin WhatsApp</span>
        )}
      </div>
    </li>
  );
}

function Bloque({ titulo, vacio, filas, total }: { titulo: string; vacio: string; filas: CobroDelDia[]; total?: number }) {
  return (
    <section aria-labelledby={`h-${titulo}`}>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={`h-${titulo}`} className="text-[24px] sm:text-[26px]">
          {titulo}
        </h2>
        {filas.length > 0 && total !== undefined ? (
          <p className="money text-[15px] text-muted">
            {plural(filas.length, "cobro", "cobros")} · {formatearMoneda(total)}
          </p>
        ) : null}
      </div>
      {filas.length === 0 ? (
        <p className="lead-italic border-t border-[color:var(--border)] py-6 text-[18px] text-muted">{vacio}</p>
      ) : (
        <ul>{filas.map((f) => <FilaCobro key={f.operacionId} cobro={f} />)}</ul>
      )}
    </section>
  );
}

export function HoyView({ d }: { d: DatosHoy }) {
  const totalCobrarHoy = d.cobrarHoy.reduce((a, c) => a + c.monto, 0);
  const totalAtrasado = d.atrasados.reduce((a, c) => a + c.monto, 0);

  return (
    <div className="animate-fade-up mx-auto flex max-w-5xl flex-col gap-14 pb-24">
      <header>
        <p className="lead-italic text-[18px] text-muted">{fechaLarga(d.hoy)}</p>
        <h1 className="mt-1 text-[48px] leading-none sm:text-[64px]">Hoy</h1>
        <div className="gold-rule mt-5 w-40" aria-hidden />
      </header>

      <nav aria-label="Acciones rápidas" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button asChild size="lg">
          <Link href="/ventas/nueva">+ Nueva venta</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/prestamos/nuevo">+ Nuevo crédito</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/pagos">Registrar pago</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/clientes/nuevo">+ Nuevo cliente</Link>
        </Button>
      </nav>

      <section aria-labelledby="h-disponible">
        <h2 id="h-disponible" className="eyebrow">
          Dinero disponible
        </h2>
        {d.faltaSaldoInicial && d.dineroDisponible < 0 ? (
          <>
            <p className="metric-value mt-2 text-[40px] text-muted sm:text-[56px]">Falta un dato</p>
            <p className="lead-italic mt-3 max-w-xl text-[18px] text-muted">
              Para saber cuánto dinero hay, dinos con cuánto empezó el negocio. Los movimientos registrados suman{" "}
              <span className="money">{formatearMoneda(d.dineroDisponible)}</span> sin ese punto de partida.{" "}
              <Link href="/configuracion" className="text-accent underline underline-offset-4">
                Registrarlo ahora
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="metric-value mt-2 text-[52px] sm:text-[84px]">{formatearMoneda(d.dineroDisponible)}</p>
            {d.faltaSaldoInicial ? (
              <p className="lead-italic mt-3 max-w-xl text-[17px] text-muted">
                Todavía no dijiste con cuánto dinero empezó el negocio, así que este número puede no ser el real.{" "}
                <Link href="/configuracion" className="text-accent underline underline-offset-4">
                  Registrarlo ahora
                </Link>
              </p>
            ) : null}
          </>
        )}
      </section>

      <section aria-labelledby="h-calle">
        <h2 id="h-calle" className="eyebrow">
          Dinero en la calle
        </h2>
        <p className="metric-value mt-2 text-[44px] sm:text-[64px]">{formatearMoneda(d.enLaCalle.total)}</p>
        <dl className="mt-6 grid grid-cols-1 border-t border-[color:var(--border)] sm:grid-cols-2">
          <div className="border-b border-[color:var(--border)] py-4 sm:border-r sm:pr-6">
            <dt className="text-[15px] text-muted">
              <Link href="/creditos?origen=venta" className="hover:text-accent">
                Mercancía <span className="text-faint">· {plural(d.enLaCalle.mercancia.cantidad, "venta a crédito", "ventas a crédito")}</span>
              </Link>
            </dt>
            <dd className="money mt-1 text-[26px]">{formatearMoneda(d.enLaCalle.mercancia.monto)}</dd>
          </div>
          <div className="border-b border-[color:var(--border)] py-4 sm:pl-6">
            <dt className="text-[15px] text-muted">
              <Link href="/creditos?origen=prestamo" className="hover:text-accent">
                Préstamos <span className="text-faint">· {plural(d.enLaCalle.prestamos.cantidad, "préstamo", "préstamos")}</span>
              </Link>
            </dt>
            <dd className="money mt-1 text-[26px]">{formatearMoneda(d.enLaCalle.prestamos.monto)}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="h-hoy-mov">
        <h2 id="h-hoy-mov" className="eyebrow">
          Lo de hoy
        </h2>
        <dl className="mt-3 grid grid-cols-3 border-y border-[color:var(--border)]">
          {(
            [
              ["Ventas", d.hoyMovimiento.ventas, "venta", "ventas"],
              ["Préstamos", d.hoyMovimiento.prestamos, "préstamo", "préstamos"],
              ["Cobros", d.hoyMovimiento.cobros, "pago", "pagos"],
            ] as const
          ).map(([nombre, dato, uno, varios], i) => (
            <div key={nombre} className={`px-3 py-5 sm:px-6 ${i > 0 ? "border-l border-[color:var(--border)]" : "pl-0 sm:pl-0"}`}>
              <dt className="text-[14px] text-muted sm:text-[15px]">{nombre}</dt>
              <dd className="money mt-1 text-[20px] sm:text-[30px]">{formatearMoneda(dato.monto)}</dd>
              <dd className="text-[13px] text-faint">{dato.cantidad === 0 ? "ninguno" : plural(dato.cantidad, uno, varios)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Bloque titulo="Cobros de hoy" vacio="Hoy no vence ningún pago." filas={d.cobrarHoy} total={totalCobrarHoy} />
      <Bloque titulo="Pagos atrasados" vacio="Nadie está atrasado." filas={d.atrasados} total={totalAtrasado} />
    </div>
  );
}
