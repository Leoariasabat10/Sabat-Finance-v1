import { redirect } from "next/navigation";

// Sprint 1 (visión final del producto, 26 jul 2026): Caja se renombra a
// "Mi dinero" y pasa a mostrar la Posición del Negocio, no solo el libro
// de movimientos. Se conserva la ruta como redirect para no romper
// enlaces o marcadores existentes.
export default function Page() {
  redirect("/dinero");
}
