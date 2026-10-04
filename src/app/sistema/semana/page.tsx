import { CONTENIDO } from "@/lib/sistema/contenido";
import { FOTOS } from "@/lib/sistema/media";
import { Encabezado } from "../_components/encabezado";
import { Plegable, Rico } from "../_components/bloques";
import { SemanaVista } from "../_components/semana";

export const metadata = { title: "Semana · Mi Sistema" };

export default function Page() {
  const cambios = CONTENIDO.semana.find((b) => b.t === "aviso");
  return (
    <div className="flex flex-col gap-8 pb-8">
      <Encabezado titulo="Semana" lead="Las clases no se mueven. Todo lo demás se acomoda alrededor." foto={FOTOS.corredor} />
      <SemanaVista />
      {cambios && cambios.t === "aviso" ? (
        <Plegable titulo="Qué cambió frente al Excel">
          <p className="max-w-[68ch] text-[15px] leading-relaxed text-muted">
            <Rico x={cambios.x} />
          </p>
        </Plegable>
      ) : null}
    </div>
  );
}
