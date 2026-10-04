/**
 * Almacenamiento de Mi Sistema: SOLO en el navegador (localStorage), por dispositivo. No hay sincronización entre
 * teléfono y computador ni copia en la nube: por eso existe "Exportar" para llevarse los datos.
 *
 * Un único registro con versión (`sabat:sistema`) en lugar de una clave suelta por día:
 *  - versión + `normalizar` → si el esquema cambia, se migra; lo que no cumple la forma se descarta, nunca rompe.
 *  - JSON ilegible → se guarda una copia intacta del texto en `sabat:sistema:corrupto:<fecha>` antes de empezar de
 *    cero, para que nada se pierda en silencio.
 *  - Migración v1: la versión anterior (HTML) guardaba claves `cr26:*`; se leen una vez y se conservan (no se borran).
 */
export const CLAVE = "sabat:sistema";
export const VERSION = 2;

export interface DiaRegistro {
  mision?: string;
  hecha?: boolean;
  guerra?: boolean;
  motor?: string;
  cap1?: string;
  cap2?: string;
  /** las 8 casillas de Cartagena Reset, en orden */
  checks?: boolean[];
}
export interface Medida {
  peso?: string;
  cintura?: string;
  entrenos?: string;
  pasos?: string;
  sueno?: string;
  adherencia?: string;
  notas?: string;
}
export interface Revision {
  hice?: string;
  noHice?: string;
  corregir?: string;
  funciono?: string;
}
export interface Datos {
  version: number;
  dias: Record<string, DiaRegistro>;
  /** por fila del check-in: "0" (inicio) … "6" (Cartagena) */
  medidas: Record<string, Medida>;
  /** por semana del plan: "1" … "6" */
  revisiones: Record<string, Revision>;
}
export type Estado = "nuevo" | "ok" | "migrado" | "corrupto";

export const NUM_CHECKS = 8;
export const datosVacios = (): Datos => ({ version: VERSION, dias: {}, medidas: {}, revisiones: {} });

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const texto = (v: unknown, max = 600): string | undefined => (typeof v === "string" && v.length > 0 ? v.slice(0, max) : undefined);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

function limpiarDia(v: unknown): DiaRegistro | null {
  if (!esObjeto(v)) return null;
  const d: DiaRegistro = {};
  for (const k of ["mision", "motor", "cap1", "cap2"] as const) {
    const s = texto(v[k], 200);
    if (s) d[k] = s;
  }
  if (v.hecha === true) d.hecha = true;
  if (v.guerra === true) d.guerra = true;
  if (Array.isArray(v.checks)) {
    const crudo = v.checks as unknown[];
    const c = Array.from({ length: NUM_CHECKS }, (_, i) => crudo[i] === true);
    if (c.some(Boolean)) d.checks = c;
  }
  return Object.keys(d).length ? d : null;
}

function limpiarMapa<T extends object>(v: unknown, campos: string[], clave: (k: string) => boolean): Record<string, T> {
  const out: Record<string, T> = {};
  if (!esObjeto(v)) return out;
  for (const [k, fila] of Object.entries(v)) {
    if (!clave(k) || !esObjeto(fila)) continue;
    const o: Record<string, string> = {};
    for (const c of campos) {
      const s = texto(fila[c], 1000);
      if (s) o[c] = s;
    }
    if (Object.keys(o).length) out[k] = o as T;
  }
  return out;
}

/** Deja pasar solo lo que tiene la forma esperada. Acepta cualquier cosa sin lanzar. */
export function normalizar(raw: unknown): Datos {
  const base = datosVacios();
  if (!esObjeto(raw)) return base;
  if (esObjeto(raw.dias)) {
    for (const [iso, d] of Object.entries(raw.dias)) {
      if (!ISO.test(iso)) continue;
      const dia = limpiarDia(d);
      if (dia) base.dias[iso] = dia;
    }
  }
  base.medidas = limpiarMapa<Medida>(raw.medidas, ["peso", "cintura", "entrenos", "pasos", "sueno", "adherencia", "notas"], (k) => /^[0-6]$/.test(k));
  base.revisiones = limpiarMapa<Revision>(raw.revisiones, ["hice", "noHice", "corregir", "funciono"], (k) => /^[1-6]$/.test(k));
  return base;
}

/** Lector mínimo de storage, para poder probar sin navegador. */
export interface Almacen {
  length: number;
  key(i: number): string | null;
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

const COLUMNAS_V1: (keyof Medida)[] = ["peso", "cintura", "entrenos", "pasos", "sueno", "adherencia", "notas"];

/** Versión anterior (HTML): `cr26:<iso>` casillas · `cr26:sys:<iso>` misión/motor/capital · `cr26:prog` tabla. */
export function migrarV1(a: Almacen): Datos | null {
  const datos = datosVacios();
  let hay = false;
  const leerClave = (k: string): unknown => {
    try {
      const s = a.getItem(k);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  };
  for (let i = 0; i < a.length; i++) {
    const k = a.key(i);
    if (!k || !k.startsWith("cr26:")) continue;
    const resto = k.slice(5);
    if (resto.startsWith("sys:")) {
      const iso = resto.slice(4);
      const v = leerClave(k);
      if (ISO.test(iso) && esObjeto(v)) {
        const d = limpiarDia({ mision: v.mision, hecha: v.done, guerra: v.guerra, motor: v.motor, cap1: v.cap1, cap2: v.cap2 });
        if (d) {
          datos.dias[iso] = { ...datos.dias[iso], ...d };
          hay = true;
        }
      }
    } else if (ISO.test(resto)) {
      const d = limpiarDia({ checks: leerClave(k) });
      if (d) {
        datos.dias[resto] = { ...datos.dias[resto], ...d };
        hay = true;
      }
    } else if (resto === "prog") {
      const p = leerClave(k);
      if (esObjeto(p)) {
        for (const [celda, val] of Object.entries(p)) {
          const m = /^(\d)-(\d)$/.exec(celda);
          const s = texto(val, 1000);
          const col = m ? COLUMNAS_V1[Number(m[2])] : undefined;
          if (!m || !s || !col) continue;
          datos.medidas[m[1]!] = { ...datos.medidas[m[1]!], [col]: s };
          hay = true;
        }
      }
    }
  }
  return hay ? normalizar(datos) : null;
}

export function leer(a: Almacen): { datos: Datos; estado: Estado } {
  let crudo: string | null = null;
  try {
    crudo = a.getItem(CLAVE);
  } catch {
    return { datos: datosVacios(), estado: "nuevo" };
  }
  if (crudo === null) {
    const migrado = migrarV1(a);
    return migrado ? { datos: migrado, estado: "migrado" } : { datos: datosVacios(), estado: "nuevo" };
  }
  try {
    return { datos: normalizar(JSON.parse(crudo)), estado: "ok" };
  } catch {
    try {
      a.setItem(`${CLAVE}:corrupto:${Date.now()}`, crudo);
    } catch {
      /* sin espacio: no hay nada más que hacer */
    }
    return { datos: datosVacios(), estado: "corrupto" };
  }
}

export function escribir(a: Almacen, datos: Datos): boolean {
  try {
    a.setItem(CLAVE, JSON.stringify({ ...datos, version: VERSION }));
    return true;
  } catch {
    return false;
  }
}

/** Texto para descargar y volver a importar. */
export function exportar(datos: Datos): string {
  return JSON.stringify({ ...datos, version: VERSION, exportado: new Date().toISOString() }, null, 2);
}
export function importar(contenido: string): Datos | null {
  try {
    const v: unknown = JSON.parse(contenido);
    if (!esObjeto(v) || !esObjeto(v.dias)) return null;
    return normalizar(v);
  } catch {
    return null;
  }
}
