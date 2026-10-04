"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { isoDe } from "@/lib/sistema/calculos";
import {
  CLAVE,
  NUM_CHECKS,
  datosVacios,
  escribir,
  importar as importarTexto,
  leer,
  type Datos,
  type DiaRegistro,
  type Estado,
  type Medida,
  type Revision,
} from "@/lib/sistema/storage";

/**
 * Los datos de Mi Sistema viven SOLO en este navegador (localStorage), por dispositivo. El servidor nunca los ve.
 * Hasta que el cliente los lee (`listo`), las pantallas muestran su estructura sin datos para no desajustar la
 * hidratación con la fecha del servidor.
 */
interface Ctx {
  listo: boolean;
  /** "YYYY-MM-DD" de hoy en este dispositivo */
  hoy: string;
  datos: Datos;
  estado: Estado | null;
  /** false si el navegador no dejó guardar (almacenamiento lleno o bloqueado) */
  guardado: boolean;
  setDia: (iso: string, patch: Partial<DiaRegistro>) => void;
  alternarCheck: (iso: string, i: number) => void;
  setMedida: (fila: string, patch: Partial<Medida>) => void;
  setRevision: (semana: string, patch: Partial<Revision>) => void;
  reemplazar: (d: Datos) => void;
  restablecer: () => void;
  importar: (texto: string) => boolean;
  descartarAviso: () => void;
}

const Contexto = createContext<Ctx | null>(null);

export function useSistema(): Ctx {
  const c = useContext(Contexto);
  if (!c) throw new Error("useSistema fuera de <SistemaProvider>");
  return c;
}

const sinVacios = <T extends object>(o: T): T => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === "" || v === false) continue;
    out[k] = v;
  }
  return out as T;
};

export function SistemaProvider({ children }: { children: ReactNode }) {
  const [datos, setDatosEstado] = useState<Datos>(datosVacios);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [hoy, setHoy] = useState("");
  const [guardado, setGuardado] = useState(true);
  const [aviso, setAviso] = useState(true);
  const ref = useRef<Datos>(datos);

  const aplicar = useCallback((n: Datos) => {
    ref.current = n;
    setDatosEstado(n);
    setGuardado(escribir(window.localStorage, n));
  }, []);

  useEffect(() => {
    const r = leer(window.localStorage);
    ref.current = r.datos;
    setDatosEstado(r.datos);
    setEstado(r.estado);
    if (r.estado === "migrado") setGuardado(escribir(window.localStorage, r.datos));
    setHoy(isoDe(new Date()));

    const alVolver = () => {
      if (!document.hidden) setHoy(isoDe(new Date()));
    };
    const alCambiar = (e: StorageEvent) => {
      if (e.key !== CLAVE) return;
      const n = leer(window.localStorage);
      ref.current = n.datos;
      setDatosEstado(n.datos);
    };
    document.addEventListener("visibilitychange", alVolver);
    window.addEventListener("storage", alCambiar);
    return () => {
      document.removeEventListener("visibilitychange", alVolver);
      window.removeEventListener("storage", alCambiar);
    };
  }, []);

  const setDia = useCallback(
    (iso: string, patch: Partial<DiaRegistro>) => {
      const actual = ref.current;
      const dia = sinVacios({ ...actual.dias[iso], ...patch });
      const dias = { ...actual.dias };
      if (Object.keys(dia).length) dias[iso] = dia;
      else delete dias[iso];
      aplicar({ ...actual, dias });
    },
    [aplicar],
  );

  const alternarCheck = useCallback(
    (iso: string, i: number) => {
      const checks = Array.from({ length: NUM_CHECKS }, (_, k) => ref.current.dias[iso]?.checks?.[k] === true);
      checks[i] = !checks[i];
      setDia(iso, { checks: checks.some(Boolean) ? checks : undefined });
    },
    [setDia],
  );

  const setMedida = useCallback(
    (fila: string, patch: Partial<Medida>) => {
      const actual = ref.current;
      const m = sinVacios({ ...actual.medidas[fila], ...patch });
      const medidas = { ...actual.medidas };
      if (Object.keys(m).length) medidas[fila] = m;
      else delete medidas[fila];
      aplicar({ ...actual, medidas });
    },
    [aplicar],
  );

  const setRevision = useCallback(
    (semana: string, patch: Partial<Revision>) => {
      const actual = ref.current;
      const r = sinVacios({ ...actual.revisiones[semana], ...patch });
      const revisiones = { ...actual.revisiones };
      if (Object.keys(r).length) revisiones[semana] = r;
      else delete revisiones[semana];
      aplicar({ ...actual, revisiones });
    },
    [aplicar],
  );

  const reemplazar = useCallback((d: Datos) => aplicar(d), [aplicar]);
  const restablecer = useCallback(() => aplicar(datosVacios()), [aplicar]);
  const importar = useCallback(
    (texto: string) => {
      const d = importarTexto(texto);
      if (!d) return false;
      aplicar(d);
      return true;
    },
    [aplicar],
  );
  const descartarAviso = useCallback(() => setAviso(false), []);

  const valor = useMemo<Ctx>(
    () => ({
      listo: hoy !== "",
      hoy,
      datos,
      estado: aviso ? estado : null,
      guardado,
      setDia,
      alternarCheck,
      setMedida,
      setRevision,
      reemplazar,
      restablecer,
      importar,
      descartarAviso,
    }),
    [hoy, datos, estado, aviso, guardado, setDia, alternarCheck, setMedida, setRevision, reemplazar, restablecer, importar, descartarAviso],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
