"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentForm } from "@/features/departments/components/department-form";
import { DepartmentErrorState } from "@/features/departments/components/department-query-state";
import { useDepartment } from "@/features/departments/hooks/use-department";
import { getDepartmentErrorMessage, isDepartmentNotFoundError } from "@/features/departments/utils/department-errors";

export function DepartmentEditScreen() {
  const params = useParams<{ departmentId: string }>();
  const query = useDepartment(params.departmentId);
  return (
    <PageContainer>
      <PageHeader description="Update only the fields supported by the department API." eyebrow="Department record" title={query.data ? `Edit ${query.data.name}` : "Edit department"} />
      {query.isLoading ? <div className="space-y-6" role="status"><Skeleton className="h-96 rounded-xl" /><span className="sr-only">Loading department form...</span></div> : query.isError ? (
        isDepartmentNotFoundError(query.error)
          ? <Card><CardContent className="flex min-h-64 flex-col items-center justify-center text-center"><h2 className="text-lg font-semibold">Department not found</h2><Link className={buttonVariants({ variant: "outline" }) + " mt-5"} href="/admin/departments">Return to directory</Link></CardContent></Card>
          : <DepartmentErrorState message={getDepartmentErrorMessage(query.error)} retry={() => query.refetch()} />
      ) : query.data ? <DepartmentForm department={query.data} mode="edit" /> : null}
    </PageContainer>
  );
}
