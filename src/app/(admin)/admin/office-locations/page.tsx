import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { OfficeLocationDirectory } from "@/features/office-locations/components/office-location-directory";

export default function OfficeLocationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <OfficeLocationDirectory />
    </Suspense>
  );
}
