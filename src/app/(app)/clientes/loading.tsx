import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingClientes() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
      <Skeleton className="mb-5 h-10 w-full max-w-sm rounded-sm" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[74px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
