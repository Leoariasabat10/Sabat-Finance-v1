import { SkeletonHeader, SkeletonListaFilas } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader conAccion={false} />
      <SkeletonListaFilas filas={5} />
    </div>
  );
}
