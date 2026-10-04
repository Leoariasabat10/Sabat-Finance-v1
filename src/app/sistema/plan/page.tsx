import { CONTENIDO } from "@/lib/sistema/contenido";
import { FOTOS } from "@/lib/sistema/media";
import { Encabezado } from "../_components/encabezado";
import { Bloques } from "../_components/bloques";
import { PlanAhora } from "../_components/plan-ahora";

export const metadata = { title: "Plan · Mi Sistema" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <Encabezado titulo="Plan" lead="Llegar mejor que hoy. Menos grasa, menos hinchazón, más fuerza, mejor piel. Sin castigo." foto={FOTOS.cumbre} />
      <PlanAhora />
      <div>
        <h2 className="mb-1 text-[28px]">Cinco palancas</h2>
        <p className="lead-italic mb-3 text-[18px] text-muted">Ordenadas por impacto. Todo lo demás es ruido.</p>
        <Bloques bloques={CONTENIDO.plan} abiertos={["Fases"]} />
      </div>
    </div>
  );
}
