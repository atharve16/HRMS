import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ShiftEditScreen } from "@/features/shifts/components/shift-edit-screen";

export default function EditShiftPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      <ShiftEditScreen />
    </Suspense>
  );
}

