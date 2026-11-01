import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { OfficeLocationDetailScreen } from "@/features/office-locations/components/office-location-detail-screen";

export default function OfficeLocationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <OfficeLocationDetailScreen />
    </Suspense>
  );
}

