import { SkeletonHeader, SkeletonTarjetasMetricas, SkeletonListaFilas } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <SkeletonHeader />
      <SkeletonTarjetasMetricas />
      <SkeletonListaFilas filas={5} />
    </div>
  );
}
