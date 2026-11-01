import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ShiftDetailScreen } from "@/features/shifts/components/shift-detail-screen";

export default function ShiftDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <ShiftDetailScreen />
    </Suspense>
  );
}

