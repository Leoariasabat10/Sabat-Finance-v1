import type { Datos, DiaRegistro } from "./storage";

const DIA = 86_400_000;
export const pd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
};
export const isoDe = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const sumarDias = (iso: string, n: number) => isoDe(new Date(pd(iso).getTime() + n * DIA));
export const diferenciaDias = (a: string, b: string) => Math.round((pd(a).getTime() - pd(b).getTime()) / DIA);

const hay = (v: string | undefined) => typeof v === "string" && v.trim() !== "";
const dia = (d: Datos, iso: string): DiaRegistro => d.dias[iso] ?? {};

export interface Pilares {
  /** días seguidos con la misión cumplida (si hoy aún no está, cuenta desde ayer) */
  racha: number;
  motor7: number;
  capital7: number;
  /** días seguidos hasta hoy sin tocar el motor / el capital, desde que hay registros */
  sinMotor: number;
  sinCapital: number;
  hayRegistros: boolean;
  checksHoy: number;
}

export function calcularPilares(datos: Datos, hoy: string): Pilares {
  const primero = Object.keys(datos.dias).sort()[0] ?? null;
  const actual = dia(datos, hoy);
  let racha = 0;
  for (let k = actual.hecha ? 0 : 1; k <= 400; k++) {
    if (dia(datos, sumarDias(hoy, -k)).hecha) racha++;
    else break;
  }
  const semana = Array.from({ length: 7 }, (_, i) => dia(datos, sumarDias(hoy, -i)));
  const sin = (pred: (x: DiaRegistro) => boolean) => {
    if (!primero) return 0;
    let n = 0;
    for (let i = 0; i <= 400; i++) {
      const iso = sumarDias(hoy, -i);
      if (iso < primero) break;
      if (pred(dia(datos, iso))) break;
      n++;
    }
    return n;
  };
  return {
    racha,
    motor7: semana.filter((x) => hay(x.motor)).length,
    capital7: semana.filter((x) => hay(x.cap1) || hay(x.cap2)).length,
    sinMotor: sin((x) => hay(x.motor)),
    sinCapital: sin((x) => hay(x.cap1) || hay(x.cap2)),
    hayRegistros: primero !== null,
    checksHoy: (actual.checks ?? []).filter(Boolean).length,
  };
}

export type Tono = "hecho" | "pendiente" | "alerta";
export interface Lectura {
  tono: Tono;
  /** una frase humana con datos reales; sin números inventados */
  texto: string;
}

const dias = (n: number) => `${n} ${n === 1 ? "día" : "días"}`;

export function lecturaEjecucion(p: Pilares, hecha: boolean, totalChecks: number): Lectura {
  const c = `${p.checksHoy} de ${totalChecks} casillas hoy.`;
  if (hecha) return { tono: "hecho", texto: `Misión cumplida. Racha de ${dias(Math.max(p.racha, 1))}. ${c}` };
  if (p.racha === 0) return { tono: "alerta", texto: `La racha está en cero. Se reconstruye hoy, con una acción. ${c}` };
  return { tono: "pendiente", texto: `Misión pendiente. Racha de ${dias(p.racha)} en juego. ${c}` };
}

export function lecturaMotor(p: Pilares, motorHoy: string | undefined): Lectura {
  if (hay(motorHoy)) return { tono: "hecho", texto: `Hoy moviste el motor: ${motorHoy!.trim()}.` };
  if (p.sinMotor >= 3) return { tono: "alerta", texto: `${dias(p.sinMotor)} sin mover el motor económico. Un motor parado no produce.` };
  return { tono: "pendiente", texto: p.hayRegistros ? `Falta una acción económica hoy. Esta semana: ${p.motor7} de 7 días.` : "Falta una acción económica hoy." };
}

export function lecturaCapital(p: Pilares, hayCapitalHoy: boolean, entrenoHoy: string, luces: string): Lectura {
  if (hayCapitalHoy) return { tono: "hecho", texto: `Hoy sumaste conocimiento o relación. Esta semana: ${p.capital7} de 7 días.` };
  if (p.sinCapital >= 5) return { tono: "alerta", texto: `${dias(p.sinCapital)} sin sumar conocimiento ni relaciones. No crecen solos.` };
  return { tono: "pendiente", texto: `Hoy toca ${entrenoHoy}. Luces apagadas a las ${luces}.` };
}

export interface PuntoMedida {
  fila: string;
  valor: number;
}
/** Convierte "76,5" o "76.5" en número; vacío o ilegible → null. */
export function aNumero(s: string | undefined): number | null {
  if (!s || s.trim() === "") return null;
  const n = Number(s.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}
export function serie(datos: Datos, campo: "peso" | "cintura"): PuntoMedida[] {
  const puntos: PuntoMedida[] = [];
  for (const fila of Object.keys(datos.medidas).sort()) {
    const valor = aNumero(datos.medidas[fila]?.[campo]);
    if (valor !== null) puntos.push({ fila, valor });
  }
  return puntos;
}
/** Diferencia entre el primer y el último punto; null si hay menos de dos. */
export function tendencia(puntos: PuntoMedida[]): number | null {
  if (puntos.length < 2) return null;
  return Math.round((puntos[puntos.length - 1]!.valor - puntos[0]!.valor) * 10) / 10;
}
