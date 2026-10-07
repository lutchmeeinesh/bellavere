import { Skeleton } from "@/components/ui/Skeleton";

/** Route-level loading state shaped like the overview: KPI tiles + charts. */
export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2.5">
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-44" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-96 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
