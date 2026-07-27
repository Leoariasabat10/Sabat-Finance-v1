import { redirect } from "next/navigation";

// Auditoría Sprint 2: Cartera se fusionó dentro de Cobrar (vista Lista
// incluye ahora "Resto de la cartera activa"). Se conserva la ruta como
// redirect para no romper enlaces o marcadores existentes.
export default function Page() {
  redirect("/cobrar");
}
