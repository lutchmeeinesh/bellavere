import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

/** Site-wide route skeleton: mirrors the page-header + card-grid rhythm. */
export default function SiteLoading() {
  return (
    <div className="pt-32 pb-24 lg:pt-40 lg:pb-32">
      <Container>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-6 h-12 w-2/3 max-w-lg" />
        <Skeleton className="mt-5 h-5 w-1/2 max-w-md" />

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="hidden h-72 sm:block" />
        </div>
      </Container>
    </div>
  );
}
