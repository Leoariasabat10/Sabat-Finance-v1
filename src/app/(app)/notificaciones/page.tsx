import { redirect } from "next/navigation";

/**
 * Simplificación (visión final, "menos pantallas, más inteligencia"): esta
 * pantalla era un subconjunto de Cobrar — mostraba las mismas cuotas
 * vencidas/que vencen hoy calculadas con listCobrar(), sin ninguna acción
 * propia. Se elimina y se redirige a Cobrar, que ya es la vista viva de
 * "quién me debe preocupar hoy".
 */
export default function Page() {
  redirect("/cobrar");
}
