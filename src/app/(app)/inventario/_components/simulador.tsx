"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatearMoneda } from "@/lib/formato";
import { AJUSTES_CALIDAD, simularCompraCompleta } from "@/lib/inventario/costos";
import { campo } from "./fmt";

const miles = (v: string) => (v.replace(/\D/g, "") === "" ? "" : Number(v.replace(/\D/g, "")).toLocaleString("es-CO"));
const dinero = (v: string) => Number(v.replace(/\D/g, "") || 0);
const dec = (v: string) => {
  const x = Number(v.replace(",", "."));
  return Number.isFinite(x) ? x : 0;
};

const OPCIONES: Record<keyof typeof AJUSTES_CALIDAD, [string, string][]> = {
  calidad: [["media", "Media"], ["alta", "Alta"], ["baja", "Baja"]],
  color: [["medio", "Medio"], ["intenso", "Intenso"], ["palido", "Pálido"]],
  transparencia: [["incluida", "Con inclusiones normales"], ["limpia", "Limpia"], ["muy_incluida", "Muy incluida"]],
  tratamiento: [["aceite_menor", "Aceite menor"], ["ninguno", "Sin tratamiento"], ["significativo", "Significativo"]],
};
const TITULOS = { calidad: "Calidad", color: "Color", transparencia: "Transparencia", tratamiento: "Tratamiento" } as const;

const VEREDICTO = {
  atractiva: { t: "🟢 Compra atractiva", c: "text-success" },
  aceptable: { t: "🟡 Compra aceptable", c: "text-warning" },
  no_recomendada: { t: "🔴 No recomendada", c: "text-danger" },
} as const;

export function Simulador() {
  const [precio, setPrecio] = useState("");
  const [declarado, setDeclarado] = useState("");
  const [n, setN] = useState("");
  const [medidas, setMedidas] = useState("");
  const [otros, setOtros] = useState("");
  const [maxCt, setMaxCt] = useState("");
  const [forma, setForma] = useState("");
  const [q, setQ] = useState({ calidad: "media", color: "medio", transparencia: "incluida", tratamiento: "aceite_menor" });

  const dimensiones = medidas
    .split("\n")
    .map((l) => l.split(/[,;x×]/).map((s) => dec(s.trim())))
    .filter((d) => d.length === 3 && d.every((x) => x > 0)) as [number, number, number][];

  const listo = dinero(precio) > 0 && dec(declarado) > 0 && dinero(maxCt) > 0;
  const r = listo
    ? simularCompraCompleta({
        precioPedido: dinero(precio),
        ctDeclarados: dec(declarado),
        costosAdicionales: dinero(otros),
        precioMaxCt: dinero(maxCt),
        numPiedras: Number(n) || undefined,
        dimensiones,
        ajustes: (Object.keys(q) as (keyof typeof q)[]).map((k) => (AJUSTES_CALIDAD[k] as Record<string, number>)[q[k]] ?? 0),
      })
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="grid content-start gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="precio">Precio del lote (COP)</Label>
            <Input id="precio" inputMode="numeric" value={precio} onChange={(e) => setPrecio(miles(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="decl">Peso declarado (ct)</Label>
            <Input id="decl" inputMode="decimal" value={declarado} onChange={(e) => setDeclarado(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="n">Número de piedras</Label>
            <Input id="n" inputMode="numeric" value={n} onChange={(e) => setN(e.target.value.replace(/\D/g, ""))} />
          </div>
          <div>
            <Label htmlFor="otros">Otros costos (envío, comisión…)</Label>
            <Input id="otros" inputMode="numeric" value={otros} onChange={(e) => setOtros(miles(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="max">Máximo que pagarías por ct</Label>
            <Input id="max" inputMode="numeric" value={maxCt} onChange={(e) => setMaxCt(miles(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="forma">Forma / talla</Label>
            <Input id="forma" value={forma} onChange={(e) => setForma(e.target.value)} placeholder="Opcional" />
          </div>
        </div>

        <div>
          <Label htmlFor="medidas">Medidas: una piedra por línea, largo, ancho, alto (mm)</Label>
          <textarea id="medidas" rows={5} className={campo} value={medidas} onChange={(e) => setMedidas(e.target.value)} placeholder={"12.4, 13.3, 8.0\n10.7, 8.8, 7.0"} />
          <p className="mt-1.5 text-[13px] text-faint">{dimensiones.length} piedras con medidas válidas. Con ellas se estima el peso real que traería el lote.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(OPCIONES) as (keyof typeof OPCIONES)[]).map((k) => (
            <div key={k}>
              <Label htmlFor={k}>{TITULOS[k]}</Label>
              <select id={k} className={campo} value={q[k]} onChange={(e) => setQ({ ...q, [k]: e.target.value })}>
                {OPCIONES[k].map(([v, t]) => (
                  <option key={v} value={v}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <aside className="h-fit border border-[color:var(--border-md)] bg-card p-5 lg:sticky lg:top-6" aria-live="polite">
        {!r ? (
          <p className="text-[14px] text-muted">Completa precio, peso declarado y tu máximo por ct para ver el análisis.</p>
        ) : (
          <>
            <p className={`font-display text-[24px] ${VEREDICTO[r.veredicto].c}`}>{VEREDICTO[r.veredicto].t}</p>
            <dl className="mt-4 grid gap-1 text-[15px]">
              {(
                [
                  ["Costo declarado / ct", formatearMoneda(r.declaradoCt)],
                  ["Peso estimado", `${r.pesoEstimado.toFixed(2)} ct (${r.diferenciaPeso >= 0 ? "+" : ""}${r.diferenciaPeso.toFixed(2)} vs declarado)`],
                  ["Costo efectivo estimado / ct", formatearMoneda(r.efectivoCt)],
                  ["Diferencia / ct", `${r.diferenciaCt >= 0 ? "+" : ""}${formatearMoneda(r.diferenciaCt)}`],
                  ["Máximo objetivo / ct (ajustado)", formatearMoneda(Math.round(r.precioMaxCtAjustado))],
                  ["Holgura frente al máximo", `${(r.margenPotencial * 100).toFixed(0)} %`],
                  ...(r.costoPorPiedra ? ([["Costo por piedra", formatearMoneda(Math.round(r.costoPorPiedra))]] as [string, string][]) : []),
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 py-1">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        <p className="mt-5 border-t border-[color:var(--border)] pt-3 text-[12px] leading-relaxed text-faint">
          Herramienta interna de decisión de compra. No es una tasación gemológica ni certifica peso, calidad ni origen.
        </p>
      </aside>
    </div>
  );
}
