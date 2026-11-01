import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentEditScreen } from "@/features/departments/components/department-edit-screen";

export default function EditDepartmentPage() {
  return <Suspense fallback={<div className="p-8"><Skeleton className="h-96 rounded-xl" /></div>}><DepartmentEditScreen /></Suspense>;
}
