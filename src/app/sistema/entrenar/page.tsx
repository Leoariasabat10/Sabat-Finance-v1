import { CONTENIDO } from "@/lib/sistema/contenido";
import { RUTINAS } from "@/lib/sistema/plan";
import { CLIPS, FOTOS } from "@/lib/sistema/media";
import { Ventana } from "../_components/ventana";
import { Encabezado } from "../_components/encabezado";
import { Bloques, Plegable } from "../_components/bloques";
import { EntrenarHoy, Ejercicios } from "../_components/entrenar";

export const metadata = { title: "Entrenar · Mi Sistema" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <Encabezado titulo="Entrenar" lead="Peso corporal, una mancuerna de 18 lb y una banda. Se progresa con repeticiones, tempo y pausas." clip={CLIPS.barra} />
      <EntrenarHoy />
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <Ventana foto={FOTOS.tiza} className="h-40 sm:h-60" />
        <Ventana foto={FOTOS.dominadas} className="h-40 sm:h-60" />
      </div>
      <div>
        <h2 className="mb-2 text-[28px]">Todas las rutinas</h2>
        {RUTINAS.map((r) => (
          <Plegable key={r.titulo} titulo={r.titulo}>
            <p className="-mt-2 text-[15px] text-faint">{r.cuando}</p>
            <Ejercicios r={r} />
          </Plegable>
        ))}
        <div className="border-t border-[color:var(--border)]" />
      </div>
      <Bloques bloques={CONTENIDO.entrenar} omitir={["Rutinas"]} abiertos={["Semana a semana"]} />
    </div>
  );
}
