import { SkeletonHeader, SkeletonListaFilas } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonListaFilas filas={5} />
    </div>
  );
}
