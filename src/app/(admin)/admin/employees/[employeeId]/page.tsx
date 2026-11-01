import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeDetailScreen } from "@/features/employees/components/employee-detail-screen";

export default function EmployeeDetailPage() {
  return <Suspense fallback={<div className="p-8"><Skeleton className="h-96 rounded-xl" /></div>}><EmployeeDetailScreen /></Suspense>;
}
