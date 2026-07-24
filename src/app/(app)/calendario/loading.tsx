import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonHeader } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader conAccion={false} />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-4 w-28" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
