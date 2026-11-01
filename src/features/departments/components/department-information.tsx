import { Building2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentStatusBadge } from "@/features/departments/components/department-status-badge";
import type { Department } from "@/features/departments/types/department-types";
import { formatDepartmentTimestamp } from "@/features/departments/utils/department-display";

function Value({ label, value }: { label: string; value?: string }) {
  return <div className="min-w-0"><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm text-foreground">{value || "Not provided"}</dd></div>;
}

export function DepartmentInformation({
  department,
  managerName,
}: {
  department: Department;
  managerName?: string;
}) {
  return (
    <div className="space-y-6">
      <Card><CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center"><span className="grid size-16 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Building2 aria-hidden="true" className="size-8" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold">{department.name}</h2><DepartmentStatusBadge status={department.status} /></div><p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">{department.departmentCode}</p></div></CardContent></Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Department overview</CardTitle></CardHeader><CardContent><dl className="grid gap-5 sm:grid-cols-2"><Value label="Department code" value={department.departmentCode} /><Value label="Department name" value={department.name} /><Value label="Manager" value={department.managerEmployeeId ? managerName || department.managerEmployeeId : undefined} /><Value label="Status" value={department.status} /></dl><div className="mt-5 border-t border-border pt-5"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{department.description || "No description provided."}</p></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Record information</CardTitle></CardHeader><CardContent><dl className="grid gap-5 sm:grid-cols-2"><Value label="Department ID" value={department.id} /><Value label="Manager employee ID" value={department.managerEmployeeId} /><Value label="Created" value={formatDepartmentTimestamp(department.createdAt)} /><Value label="Last updated" value={formatDepartmentTimestamp(department.updatedAt)} /></dl></CardContent></Card>
      </div>
    </div>
  );
}
