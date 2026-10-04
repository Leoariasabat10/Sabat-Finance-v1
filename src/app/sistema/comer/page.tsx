import { CONTENIDO } from "@/lib/sistema/contenido";
import { FOTOS } from "@/lib/sistema/media";
import { Encabezado } from "../_components/encabezado";
import { Bloques } from "../_components/bloques";
import { ComerHoy } from "../_components/comer";

export const metadata = { title: "Comer · Mi Sistema" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <Encabezado titulo="Comer" lead="Barato, colombiano y sin suplementos. La regla: proteína en cada comida y verdura en el plato." foto={FOTOS.hoja} />
      <ComerHoy />
      <Bloques bloques={CONTENIDO.comer} abiertos={["Cómo armar el plato"]} />
    </div>
  );
}
