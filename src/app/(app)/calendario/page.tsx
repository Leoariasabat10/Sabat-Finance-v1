import { redirect } from "next/navigation";

// Auditoría Sprint 2: Calendario se fusionó dentro de Cobrar (toggle
// Lista/Calendario). Se conserva la ruta como redirect para no romper
// enlaces o marcadores existentes.
export default function Page() {
  redirect("/cobrar");
}
