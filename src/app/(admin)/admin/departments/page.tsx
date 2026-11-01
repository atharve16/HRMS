import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentDirectory } from "@/features/departments/components/department-directory";

export default function DepartmentsPage() {
  return <Suspense fallback={<div className="p-8"><Skeleton className="h-96 rounded-xl" /></div>}><DepartmentDirectory /></Suspense>;
}
