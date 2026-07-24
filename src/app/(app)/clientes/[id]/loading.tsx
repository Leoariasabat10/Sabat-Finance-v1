import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent>
            <Skeleton className="mb-3 h-3 w-32" />
            <Skeleton className="h-7 w-28" />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Skeleton className="mb-3 h-3 w-32" />
            <Skeleton className="h-7 w-28" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
