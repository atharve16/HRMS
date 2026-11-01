import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ShiftDirectory } from "@/features/shifts/components/shift-directory";

export default function ShiftsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <ShiftDirectory />
    </Suspense>
  );
}
