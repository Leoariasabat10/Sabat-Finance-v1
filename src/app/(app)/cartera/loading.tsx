import { SkeletonHeader, SkeletonTarjetasMetricas, SkeletonListaFilas } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader conAccion={false} />
      <div className="mb-5">
        <SkeletonTarjetasMetricas cantidad={2} />
      </div>
      <SkeletonListaFilas />
    </div>
  );
}
