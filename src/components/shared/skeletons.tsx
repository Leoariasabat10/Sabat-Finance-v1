import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/** Encabezado de página en carga (título + subtítulo + acción). */
export function SkeletonHeader({ conAccion = true }: { conAccion?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      {conAccion ? <Skeleton className="h-10 w-36 rounded-md" /> : null}
    </div>
  );
}

/** Lista de tarjetas tipo fila (préstamos, ventas, cartera, cobrar...). */
export function SkeletonListaFilas({ filas = 6 }: { filas?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: filas }).map((_, i) => (
        <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
      ))}
    </div>
  );
}

/** Grilla de tarjetas de métricas (dashboard, KPIs). */
export function SkeletonTarjetasMetricas({ cantidad = 4 }: { cantidad?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: cantidad }).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2.5 h-6 w-24" />
        </Card>
      ))}
    </div>
  );
}

/** Página de detalle (título + tarjetas + tabla). */
export function SkeletonDetalle() {
  return (
    <div className="flex flex-col gap-5">
      <SkeletonHeader />
      <SkeletonTarjetasMetricas />
      <Card>
        <CardContent>
          <Skeleton className="mb-3 h-4 w-24" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Formulario en carga (crear/editar). */
export function SkeletonFormulario() {
  return (
    <div>
      <SkeletonHeader conAccion={false} />
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-1.5 h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/** Dashboard completo en carga. */
export function SkeletonDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonHeader conAccion={false} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-[86px] rounded-lg" />
        <Skeleton className="h-[86px] rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-[160px] rounded-lg" />
        <Skeleton className="h-[160px] rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Skeleton className="h-[220px] rounded-lg" />
        <Skeleton className="h-[220px] rounded-lg" />
      </div>
      <Skeleton className="h-[200px] rounded-lg" />
    </div>
  );
}
