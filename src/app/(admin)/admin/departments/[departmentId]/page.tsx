import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentDetailScreen } from "@/features/departments/components/department-detail-screen";

export default function DepartmentDetailPage() {
  return <Suspense fallback={<div className="p-8"><Skeleton className="h-96 rounded-xl" /></div>}><DepartmentDetailScreen /></Suspense>;
}
