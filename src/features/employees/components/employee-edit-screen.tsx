"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeErrorState } from "@/features/employees/components/employee-query-state";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { useEmployee } from "@/features/employees/hooks/use-employee";
import { employeeFullName } from "@/features/employees/utils/employee-display";
import { getEmployeeErrorMessage, isEmployeeNotFoundError } from "@/features/employees/utils/employee-errors";

export function EmployeeEditScreen() {
  const params = useParams<{ employeeId: string }>();
  const query = useEmployee(params.employeeId);
  return (
    <PageContainer>
      <PageHeader
        description="Update only the fields supported by the employee API."
        eyebrow="Employee record"
        title={query.data ? `Edit ${employeeFullName(query.data)}` : "Edit employee"}
      />
      {query.isLoading ? <div className="space-y-6" role="status"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-72 rounded-xl" /><span className="sr-only">Loading employee form...</span></div> : query.isError ? (
        isEmployeeNotFoundError(query.error) ? <Card><CardContent className="flex min-h-64 flex-col items-center justify-center text-center"><h2 className="text-lg font-semibold">Employee not found</h2><Link className={buttonVariants({ variant: "outline" }) + " mt-5"} href="/admin/employees">Return to directory</Link></CardContent></Card> : <EmployeeErrorState message={getEmployeeErrorMessage(query.error)} retry={() => query.refetch()} />
      ) : query.data ? <EmployeeForm employee={query.data} mode="edit" /> : null}
    </PageContainer>
  );
}
