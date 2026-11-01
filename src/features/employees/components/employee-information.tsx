import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import { EmployeeStatusBadge } from "@/features/employees/components/employee-status-badge";
import type { Employee } from "@/features/employees/types/employee-types";
import {
  employeeFullName,
  employmentTypeLabels,
  formatDate,
  genderLabels,
} from "@/features/employees/utils/employee-display";

function Value({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm text-foreground">{children || "Not provided"}</dd>
    </div>
  );
}

function InformationCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent><dl className="grid gap-5 sm:grid-cols-2">{children}</dl></CardContent>
    </Card>
  );
}

export function EmployeeInformation({
  employee,
  departmentName,
  managerName,
}: {
  employee: Employee;
  departmentName?: string;
  managerName?: string;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <EmployeeAvatar className="size-16 text-lg" employee={employee} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold">{employeeFullName(employee)}</h2>
              <EmployeeStatusBadge status={employee.employmentStatus} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{employee.designation || "Designation not provided"}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">{employee.employeeCode}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <InformationCard title="Personal details">
          <Value label="First name">{employee.firstName}</Value>
          <Value label="Last name">{employee.lastName}</Value>
          <Value label="Date of birth">{formatDate(employee.dateOfBirth)}</Value>
          <Value label="Gender">{employee.gender ? genderLabels[employee.gender] : undefined}</Value>
        </InformationCard>
        <InformationCard title="Contact information">
          <Value label="Work email">{employee.email}</Value>
          <Value label="Phone">{employee.phone}</Value>
          <Value label="Work location">{employee.workLocation}</Value>
          <Value label="Profile image URL">{employee.profileImageUrl}</Value>
        </InformationCard>
        <InformationCard title="Employment details">
          <Value label="Employment type">{employmentTypeLabels[employee.employmentType]}</Value>
          <Value label="Designation">{employee.designation}</Value>
          <Value label="Department">{employee.departmentId ? departmentName || employee.departmentId : undefined}</Value>
          <Value label="Reporting manager">{employee.reportingManagerId ? managerName || employee.reportingManagerId : undefined}</Value>
          <Value label="Joining date">{formatDate(employee.joiningDate)}</Value>
          <Value label="Termination date">{formatDate(employee.terminationDate)}</Value>
        </InformationCard>
        <InformationCard title="Address">
          <Value label="Address line 1">{employee.address?.addressLine1}</Value>
          <Value label="Address line 2">{employee.address?.addressLine2}</Value>
          <Value label="City">{employee.address?.city}</Value>
          <Value label="State / province">{employee.address?.state}</Value>
          <Value label="Postal code">{employee.address?.postalCode}</Value>
          <Value label="Country">{employee.address?.country}</Value>
        </InformationCard>
        <InformationCard title="Emergency contact">
          <Value label="Name">{employee.emergencyContact?.name}</Value>
          <Value label="Relationship">{employee.emergencyContact?.relationship}</Value>
          <Value label="Phone">{employee.emergencyContact?.phone}</Value>
        </InformationCard>
        <InformationCard title="Record information">
          <Value label="Employee ID">{employee.id}</Value>
          <Value label="Account ID">{employee.userId}</Value>
          <Value label="Created">{employee.createdAt ? new Date(employee.createdAt).toLocaleString() : undefined}</Value>
          <Value label="Last updated">{employee.updatedAt ? new Date(employee.updatedAt).toLocaleString() : undefined}</Value>
        </InformationCard>
      </div>
    </div>
  );
}
