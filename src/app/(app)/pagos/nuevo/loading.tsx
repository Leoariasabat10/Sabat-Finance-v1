import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-sm" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
