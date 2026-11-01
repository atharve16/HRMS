"use client";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeInformation } from "@/features/employees/components/employee-information";
import { EmployeeErrorState } from "@/features/employees/components/employee-query-state";
import { useMyEmployeeProfile } from "@/features/employees/hooks/use-employee";
import { employeeFullName } from "@/features/employees/utils/employee-display";
import { getEmployeeErrorMessage } from "@/features/employees/utils/employee-errors";

export function EmployeeProfileScreen() {
  const query = useMyEmployeeProfile();
  return (
    <PageContainer>
      <PageHeader
        description="View the employment and contact information held in your HRMS profile."
        eyebrow="My account"
        title={query.data ? employeeFullName(query.data) : "My profile"}
      />
      {query.isLoading ? <div className="space-y-6" role="status"><Skeleton className="h-36 rounded-xl" /><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-56 rounded-xl" /><Skeleton className="h-56 rounded-xl" /></div><span className="sr-only">Loading profile...</span></div> : query.isError ? <EmployeeErrorState message={getEmployeeErrorMessage(query.error)} retry={() => query.refetch()} /> : query.data ? (
        <>
          <div className="mb-6 rounded-lg border border-info/20 bg-info-soft p-4 text-sm text-info">This profile is read-only. Contact an administrator if information needs to be changed.</div>
          <EmployeeInformation employee={query.data} />
        </>
      ) : null}
    </PageContainer>
  );
}
