"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatearMoneda } from "@/lib/formato";
import { resumenJoya, type Concepto } from "@/lib/inventario/costos";
import { CONCEPTOS } from "./fmt";

export interface JoyaFormInicial {
  nombre: string;
  margen: number; // 60 = 60 %
  prima: number; // 25 = +25 %
  precioSabat: number;
  costos: Partial<Record<Concepto, number>>;
}

const miles = (v: string) => (v.replace(/\D/g, "") === "" ? "" : Number(v.replace(/\D/g, "")).toLocaleString("es-CO"));
const aNum = (v: string) => Number(v.replace(/\D/g, "") || 0);

function Fila({ k, v, fuerte, aviso }: { k: string; v: string; fuerte?: boolean; aviso?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-1.5 ${fuerte ? "border-t border-[color:var(--border-md)] pt-3 text-[18px] font-medium" : "text-[15px]"}`}>
      <span className={aviso ? "text-danger" : "text-muted"}>{k}</span>
      <span className={aviso ? "text-danger" : ""}>{v}</span>
    </div>
  );
}

/** Joya: piedra + montaje + plata + cadena + mano de obra + caja + otros → costo, mínimo, recomendado y margen real, en vivo. */
export function JoyaForm({
  action,
  costoPiedra,
  inicial,
  etiqueta,
}: {
  action: (fd: FormData) => Promise<void>;
  costoPiedra: number;
  inicial: JoyaFormInicial;
  etiqueta: string;
}) {
  const [costos, setCostos] = useState<Record<string, string>>(
    Object.fromEntries(CONCEPTOS.map(([c]) => [c, inicial.costos[c] ? miles(String(inicial.costos[c])) : ""])),
  );
  const [margen, setMargen] = useState(String(inicial.margen));
  const [prima, setPrima] = useState(String(inicial.prima));
  const [precio, setPrecio] = useState(inicial.precioSabat ? miles(String(inicial.precioSabat)) : "");

  const m = Math.min(Math.max(Number(margen) || 0, 0), 95) / 100;
  const r = resumenJoya({
    costoPiedra,
    costos: CONCEPTOS.map(([c]) => ({ concepto: c as Concepto, monto: aNum(costos[c] ?? "") })),
    margenObjetivo: m,
    primaPct: Math.max(Number(prima) || 0, 0) / 100,
    precioSabat: aNum(precio) || null,
  });

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="grid content-start gap-4">
        <div>
          <Label htmlFor="nombre">Nombre de la joya</Label>
          <Input id="nombre" name="nombre" required defaultValue={inicial.nombre} placeholder="Anillo Zümrüt" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {CONCEPTOS.map(([c, t]) => (
            <div key={c}>
              <Label htmlFor={`costo_${c}`}>{t}</Label>
              <Input
                id={`costo_${c}`}
                name={`costo_${c}`}
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={costos[c]}
                onChange={(e) => setCostos({ ...costos, [c]: miles(e.target.value) })}
              />
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="margen">Margen objetivo (%)</Label>
            <Input id="margen" name="margen" inputMode="decimal" value={margen} onChange={(e) => setMargen(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="prima">Prima por calidad, diseño y marca (%)</Label>
            <Input id="prima" name="prima" inputMode="decimal" value={prima} onChange={(e) => setPrima(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="precioSabat">Precio SABAT</Label>
          <Input id="precioSabat" name="precioSabat" inputMode="numeric" autoComplete="off" placeholder="Lo decides tú" value={precio} onChange={(e) => setPrecio(miles(e.target.value))} />
          <p className="mt-1.5 text-[13px] text-faint">
            El precio no sale de quilates × precio por ct: pesan calidad, color, transparencia, talla, origen, diseño, artesanía y marca. Aquí decides cuánto valen.
          </p>
        </div>
        <div>
          <Button type="submit">{etiqueta}</Button>
        </div>
      </div>

      <aside className="h-fit border border-[color:var(--border-md)] bg-card p-5 lg:sticky lg:top-6" aria-live="polite">
        <Fila k="Esmeralda" v={formatearMoneda(r.costoPiedra)} />
        {CONCEPTOS.map(([c, t]) => (r.porConcepto[c as Concepto] > 0 ? <Fila key={c} k={t} v={formatearMoneda(r.porConcepto[c as Concepto])} /> : null))}
        <Fila k="Costo total SABAT" v={formatearMoneda(r.costoTotal)} fuerte />
        <Fila k={`Precio mínimo (${Math.round(m * 100)} % margen)`} v={formatearMoneda(Math.ceil(r.precioMinimo))} />
        <Fila k="Precio recomendado" v={formatearMoneda(Math.ceil(r.precioRecomendado))} />
        <Fila k="Precio SABAT" v={r.precioSabat ? formatearMoneda(r.precioSabat) : "—"} fuerte />
        <Fila k="Margen real" v={r.margenReal != null ? `${(r.margenReal * 100).toFixed(1)} %` : "—"} aviso={r.bajoMinimo} />
        <Fila k="Rentabilidad sobre costo" v={r.rentabilidad != null ? `${(r.rentabilidad * 100).toFixed(0)} %` : "—"} />
        {r.bajoMinimo ? <p className="mt-3 text-[13px] text-danger">Este precio está por debajo del mínimo para tu margen objetivo.</p> : null}
      </aside>
    </form>
  );
}
