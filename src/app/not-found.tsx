import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <EmptyState
        icon={<Compass className="h-10 w-10 text-faint" />}
        title="Página no encontrada"
        description="La ruta que buscas no existe dentro de Sabat Finance."
        action={
          <Button asChild>
            <Link href="/dashboard">Volver al Dashboard</Link>
          </Button>
        }
        className="max-w-md"
      />
    </main>
  );
}
