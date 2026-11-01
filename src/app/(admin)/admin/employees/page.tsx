import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeDirectory } from "@/features/employees/components/employee-directory";

export default function EmployeesPage() {
  return <Suspense fallback={<div className="p-8"><Skeleton className="h-96 rounded-xl" /></div>}><EmployeeDirectory /></Suspense>;
}
