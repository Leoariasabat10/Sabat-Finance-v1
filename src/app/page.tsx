import { redirect } from "next/navigation";

// Sin autenticación (uso privado): "/" siempre abre el Dashboard directo.
export default function RootPage() {
  redirect("/dashboard");
}
