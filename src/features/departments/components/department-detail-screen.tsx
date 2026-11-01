"use client";

import { CheckCircle2, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentInformation } from "@/features/departments/components/department-information";
import { DepartmentLifecycleDialog } from "@/features/departments/components/department-lifecycle-dialog";
import { DepartmentErrorState } from "@/features/departments/components/department-query-state";
import { useDepartment } from "@/features/departments/hooks/use-department";
import { getDepartmentErrorMessage, isDepartmentNotFoundError } from "@/features/departments/utils/department-errors";
import { useEmployee } from "@/features/employees/hooks/use-employee";
import { employeeFullName } from "@/features/employees/utils/employee-display";

function DetailSkeleton() {
  return <div aria-label="Loading department" className="space-y-6" role="status"><Card><CardContent className="flex gap-4 p-6"><Skeleton className="size-16 rounded-xl" /><div className="flex-1 space-y-3"><Skeleton className="h-6 w-56" /><Skeleton className="h-4 w-36" /></div></CardContent></Card><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div><span className="sr-only">Loading department details...</span></div>;
}

export function DepartmentDetailScreen() {
  const params = useParams<{ departmentId: string }>();
  const searchParams = useSearchParams();
  const query = useDepartment(params.departmentId);
  const department = query.data;
  const manager = useEmployee(department?.managerEmployeeId ?? "");
  const successMessage = searchParams.get("created") === "1" ? "Department created successfully." : searchParams.get("updated") === "1" ? "Department information updated successfully." : null;

  return (
    <PageContainer>
      <PageHeader
        actions={department ? <div className="flex flex-wrap gap-2"><Link className={buttonVariants({ variant: "outline" })} href={`/admin/departments/${department.id}/edit`}><Pencil aria-hidden="true" className="size-4" />Edit</Link><DepartmentLifecycleDialog department={department} /></div> : undefined}
        description="Review department ownership, status, and organizational information."
        eyebrow="Department record"
        title={department?.name ?? "Department details"}
      />
      {successMessage && <div className="mb-6 flex gap-3 rounded-lg border border-success/20 bg-success-soft p-4 text-sm text-success" role="status"><CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />{successMessage}</div>}
      {query.isLoading ? <DetailSkeleton /> : query.isError ? (
        isDepartmentNotFoundError(query.error)
          ? <Card><CardContent className="flex min-h-64 flex-col items-center justify-center text-center"><h2 className="text-lg font-semibold">Department not found</h2><p className="mt-2 text-sm text-muted-foreground">The department may no longer exist or the link is invalid.</p><Link className={buttonVariants({ variant: "outline" }) + " mt-5"} href="/admin/departments">Return to directory</Link></CardContent></Card>
          : <DepartmentErrorState message={getDepartmentErrorMessage(query.error)} retry={() => query.refetch()} />
      ) : department ? <DepartmentInformation department={department} managerName={manager.data ? employeeFullName(manager.data) : undefined} /> : null}
    </PageContainer>
  );
}
