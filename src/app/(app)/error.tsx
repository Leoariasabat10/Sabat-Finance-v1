"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Boundary de error para toda la app (dentro del shell con sidebar/topbar).
 * Nunca la traza genérica de Next — mismo lenguaje visual que EmptyState.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <EmptyState
        icon={<AlertTriangle className="h-10 w-10 text-warning" />}
        title="Algo salió mal"
        description="No se pudo cargar esta pantalla. Tus datos están a salvo — intenta de nuevo."
        action={
          <Button onClick={() => reset()}>Reintentar</Button>
        }
        className="max-w-md"
      />
    </div>
  );
}
