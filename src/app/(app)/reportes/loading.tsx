import { SkeletonHeader, SkeletonTarjetasMetricas } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonHeader />
      <Card>
        <CardContent>
          <Skeleton className="mb-3 h-4 w-24" />
          <SkeletonTarjetasMetricas cantidad={6} />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Skeleton className="mb-3 h-4 w-24" />
          <SkeletonTarjetasMetricas cantidad={4} />
        </CardContent>
      </Card>
    </div>
  );
}
