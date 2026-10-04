import { CONTENIDO } from "@/lib/sistema/contenido";
import { CLIPS, FOTOS } from "@/lib/sistema/media";
import { Ventana } from "../_components/ventana";
import { Encabezado } from "../_components/encabezado";
import { Bloques } from "../_components/bloques";

export const metadata = { title: "Reglas · Mi Sistema" };

const REGLAS = [
  "La misión es una sola. Si no está escrita, el día no ha empezado.",
  "Solo la misión cuenta para la racha. Las casillas no la salvan.",
  "El día mínimo cuenta: 10 minutos de las dos primeras series, 6.000 pasos, proteína en tres comidas y cama a hora.",
  "No se compensa con hambre. No hay doble entrenamiento. No hay castigo.",
  "Se mide una vez por semana, el domingo. Entre domingos no hay datos que revisar.",
  "Fallar un día no es el problema. Lo que haces después, sí.",
];

export default function Page() {
  return (
    <div className="flex flex-col gap-10 pb-8">
      <Encabezado titulo="Reglas" lead="Sin negociación." clip={CLIPS.piedra} />
      <section aria-labelledby="reglas">
        <h2 id="reglas" className="text-[28px]">
          Las del sistema
        </h2>
        <ul className="mt-3">
          {REGLAS.map((r) => (
            <li key={r} className="border-t border-[color:var(--border)] py-4 font-display text-[22px] leading-snug sm:text-[26px]">
              {r}
            </li>
          ))}
        </ul>
        <div className="border-t border-[color:var(--border)]" />
      </section>
      <Ventana foto={FOTOS.vendas} className="h-44 sm:h-72" sizes="(min-width: 1024px) 1100px, 100vw" />
      <section aria-labelledby="si-pasa">
        <h2 id="si-pasa" className="text-[28px]">
          Si pasa esto
        </h2>
        <p className="lead-italic mb-3 mt-1 text-[18px] text-muted">La respuesta ya está decidida. No se piensa en el momento.</p>
        <Bloques bloques={CONTENIDO.reglas.filter((b) => !(b.t === "aviso"))} abiertos={["Psicología · reglas, no frases"]} />
      </section>
    </div>
  );
}
