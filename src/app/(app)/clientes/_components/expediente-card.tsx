import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EtiquetaComportamiento, ExpedienteFinanciero } from "@/lib/clientes/expediente";
import { ContextoHistoricoForm } from "./contexto-historico-form";

const CONFIANZA_TEXTO = { alta: "Confianza alta", media: "Confianza media — fecha estimada", baja: "Confianza baja — sin fecha confirmada" } as const;

const formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const TONO_BORDE: Record<ExpedienteFinanciero["recomendacion"]["tono"], string> = {
  success: "border-l-success",
  warning: "border-l-warning",
  danger: "border-l-danger",
  info: "border-l-accent",
};

const TONO_BOTON: Record<ExpedienteFinanciero["recomendacion"]["tono"], string> = {
  success: "bg-success text-white hover:opacity-90",
  warning: "bg-warning text-white hover:opacity-90",
  danger: "bg-danger text-white hover:opacity-90",
  info: "bg-accent text-white hover:opacity-90",
};

const ETIQUETA_TEXTO: Record<EtiquetaComportamiento, string> = {
  puntual: "✅ Siempre puntual",
  tardio: "🐢 Paga tarde seguido",
  "solo-intereses": "🔒 Solo intereses",
  "alto-riesgo": "⚠️ Alto riesgo",
  nuevo: "🆕 Cliente nuevo",
};

const ETIQUETA_VARIANTE: Record<EtiquetaComportamiento, "success" | "warning" | "danger" | "info"> = {
  puntual: "success",
  tardio: "warning",
  "solo-intereses": "warning",
  "alto-riesgo": "danger",
  nuevo: "info",
};

/**
 * Visión final del producto — Clientes: en menos de 10 segundos hay que
 * poder responder "¿vale la pena seguir prestándole a esta persona?". Los
 * números crudos (préstamos, ventas) siguen abajo como evidencia; esta
 * tarjeta es la respuesta, no el dato.
 */
export function ExpedienteCard({
  expediente,
  clienteId,
  nombreCliente,
}: {
  expediente: ExpedienteFinanciero;
  clienteId: string;
  nombreCliente: string;
}) {
  const { recomendacion } = expediente;

  return (
    <Card className={`border-l-4 p-5 ${TONO_BORDE[recomendacion.tono]}`}>
      {expediente.etiquetas.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {expediente.etiquetas.map((e) => (
            <Badge key={e} variant={ETIQUETA_VARIANTE[e]}>
              {ETIQUETA_TEXTO[e]}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold text-muted">Prestado históricamente</p>
          <p className="font-mono text-[15px] font-bold tabular-nums">{formatoMoneda.format(expediente.prestadoHistorico)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted">Pagado históricamente</p>
          <p className="font-mono text-[15px] font-bold tabular-nums">{formatoMoneda.format(expediente.pagadoHistorico)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted">Debe hoy</p>
          <p className={`font-mono text-[15px] font-bold tabular-nums ${expediente.saldoActual > 0 ? "text-accent" : ""}`}>
            {formatoMoneda.format(expediente.saldoActual)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted">Puntualidad</p>
          <p className="font-mono text-[15px] font-bold tabular-nums">
            {expediente.puntualidadPct === null ? "—" : `${expediente.puntualidadPct}%`}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted">Te ha generado</p>
          <p className="font-mono text-[15px] font-bold tabular-nums text-success">{formatoMoneda.format(expediente.utilidadGenerada)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted">Cliente desde</p>
          <p className="text-[15px] font-bold">{expediente.antiguedadTexto ?? "—"}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted">Refinanciaciones</p>
          <p className="text-[15px] font-bold">{expediente.vecesRefinanciado}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] pt-4">
        <div>
          <p className="text-[13.5px] text-foreground">{recomendacion.texto}</p>
          {recomendacion.confianza && recomendacion.confianza !== "alta" ? (
            <p className="mt-1 text-[11.5px] font-semibold text-muted">🔵 {CONFIANZA_TEXTO[recomendacion.confianza]}</p>
          ) : null}
        </div>
        {recomendacion.boton ? (
          <Link
            href={recomendacion.boton.href}
            className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-opacity duration-premium ${TONO_BOTON[recomendacion.tono]}`}
          >
            {recomendacion.boton.texto}
          </Link>
        ) : null}
      </div>

      {expediente.operacionParaContexto ? (
        <div className="mt-3 border-t border-[color:var(--border)] pt-3">
          <ContextoHistoricoForm
            clienteId={clienteId}
            operacionId={expediente.operacionParaContexto.id}
            yaConfirmado={expediente.operacionParaContexto.confianzaFecha !== "exacta"}
            nombreCliente={nombreCliente}
          />
        </div>
      ) : null}
    </Card>
  );
}
