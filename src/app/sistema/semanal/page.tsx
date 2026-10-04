import { CONTENIDO } from "@/lib/sistema/contenido";
import { CLIPS } from "@/lib/sistema/media";
import { Encabezado } from "../_components/encabezado";
import { Bloques } from "../_components/bloques";
import { SemanalVista } from "../_components/semanal";

export const metadata = { title: "Semanal · Mi Sistema" };

export default function Page() {
  return (
    <div className="flex flex-col gap-10 pb-8">
      <Encabezado titulo="Semanal" lead="Una vez por semana, el domingo por la mañana. No te pesas a diario." clip={CLIPS.bosque} />
      <SemanalVista />
      <div>
        <h2 className="mb-2 text-[28px]">Cómo se mide</h2>
        <Bloques bloques={CONTENIDO.semanal} omitir={["Tabla de progreso"]} abiertos={["Cómo ajustar, solo con datos"]} />
      </div>
    </div>
  );
}
