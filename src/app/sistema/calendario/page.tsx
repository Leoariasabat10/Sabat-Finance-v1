import { FOTOS } from "@/lib/sistema/media";
import { Encabezado } from "../_components/encabezado";
import { CalendarioVista } from "../_components/calendario";

export const metadata = { title: "Calendario · Mi Sistema" };

export default function Page() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <Encabezado titulo="Calendario" lead="Treinta y nueve días, del 5 de octubre al 12 de noviembre." foto={FOTOS.niebla} />
      <CalendarioVista />
    </div>
  );
}
