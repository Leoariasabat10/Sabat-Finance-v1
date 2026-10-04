import { CONTENIDO } from "@/lib/sistema/contenido";
import { CLIPS } from "@/lib/sistema/media";
import { Encabezado } from "../_components/encabezado";
import { Bloques } from "../_components/bloques";
import { CuerpoRegistro } from "../_components/cuerpo";

export const metadata = { title: "Cuerpo · Mi Sistema" };

export default function Page() {
  return (
    <div className="flex flex-col gap-10 pb-8">
      <Encabezado titulo="Cuerpo" lead="Peso y cintura, una vez por semana. Lo demás es agua, sueño y piel, hechos todos los días." clip={CLIPS.camino} />
      <CuerpoRegistro />
      <div>
        <h2 className="mb-2 text-[28px]">El cuidado de cada día</h2>
        <Bloques bloques={CONTENIDO.cuerpo} abiertos={["Hidratación"]} />
      </div>
    </div>
  );
}
