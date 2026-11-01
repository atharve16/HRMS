import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { OfficeLocationEditScreen } from "@/features/office-locations/components/office-location-edit-screen";

export default function EditOfficeLocationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <OfficeLocationEditScreen />
    </Suspense>
  );
}

