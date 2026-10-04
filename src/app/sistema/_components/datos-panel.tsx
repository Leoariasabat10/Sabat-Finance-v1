"use client";

import { useRef, useState } from "react";
import { exportar, CLAVE } from "@/lib/sistema/storage";
import { useSistema } from "./store";

/**
 * Los datos de Mi Sistema están SOLO en este navegador y en este dispositivo. No se sincronizan con el teléfono ni
 * con el computador y no hay copia en la nube. Este panel es la forma de llevarlos de un lado a otro y de empezar de
 * nuevo sin perderlos por accidente.
 */
export function DatosPanel() {
  const { datos, importar, restablecer, guardado } = useSistema();
  const archivo = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  const bajar = () => {
    const blob = new Blob([exportar(datos)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mi-sistema-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMensaje("Descargado. Guarda el archivo en un lugar seguro.");
  };

  const leerArchivo = async (f: File | undefined) => {
    if (!f) return;
    const texto = await f.text();
    setMensaje(importar(texto) ? "Importado. Reemplazó lo que había en este dispositivo." : "Ese archivo no es una copia de Mi Sistema. No cambié nada.");
    if (archivo.current) archivo.current.value = "";
  };

  const borrar = () => {
    try {
      // reset controlado: antes de vaciar queda una copia en el propio navegador
      window.localStorage.setItem(`${CLAVE}:copia:${Date.now()}`, JSON.stringify(datos));
    } catch {
      /* sin espacio: el borrado igualmente se pidió dos veces */
    }
    restablecer();
    setConfirmar(false);
    setMensaje("Listo. Empezaste en limpio; la copia anterior quedó guardada en este navegador.");
  };

  const boton = "min-h-12 border border-[color:var(--border-md)] px-5 text-[15px] text-foreground transition-colors hover:border-[color:var(--gold)] active:scale-[0.98]";

  return (
    <section aria-labelledby="datos" className="border-t border-[color:var(--border)] pt-8">
      <h2 id="datos" className="text-[28px]">
        Tus datos
      </h2>
      <p className="mt-2 max-w-[62ch] text-[16px] leading-relaxed text-muted">
        Viven solo en este navegador, en este dispositivo. No se sincronizan con otro teléfono ni con otro computador, y nadie más los ve: no se guardan en ningún servidor. Si cambias de dispositivo, exporta aquí e importa allá.
      </p>
      {!guardado ? (
        <p role="alert" className="mt-3 border-l border-danger pl-4 text-[15px] text-danger">
          Este navegador no está dejando guardar (almacenamiento lleno o bloqueado). Lo que escribas ahora se perderá al cerrar.
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={bajar} className={boton}>
          Exportar
        </button>
        <button type="button" onClick={() => archivo.current?.click()} className={boton}>
          Importar
        </button>
        <input ref={archivo} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Archivo de copia de Mi Sistema" onChange={(e) => void leerArchivo(e.target.files?.[0])} />
        {!confirmar ? (
          <button type="button" onClick={() => setConfirmar(true)} className={`${boton} text-danger`}>
            Empezar de cero
          </button>
        ) : null}
      </div>
      {confirmar ? (
        <div role="alertdialog" aria-label="Confirmar borrado" className="sis-asentar mt-4 max-w-md border border-danger/60 p-4">
          <p className="text-[16px] leading-relaxed text-foreground">Esto borra la misión, las casillas, las medidas y las revisiones de este dispositivo. Antes dejo una copia en el navegador. ¿Seguro?</p>
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={borrar} className="min-h-12 bg-danger px-5 text-[15px] font-medium text-white active:scale-[0.98]">
              Borrar todo
            </button>
            <button type="button" onClick={() => setConfirmar(false)} className={boton}>
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
      {mensaje ? (
        <p role="status" className="mt-4 text-[15px] text-muted">
          {mensaje}
        </p>
      ) : null}
    </section>
  );
}
