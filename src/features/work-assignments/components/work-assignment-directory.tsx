"use client";

import { Info, Search, UserCheck, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeOptions } from "@/features/employees/hooks/use-employee-references";
import { employeeFullName } from "@/features/employees/utils/employee-display";
import { EmployeeWorkAssignmentsPanel } from "@/features/work-assignments/components/employee-work-assignments-panel";

export function WorkAssignmentDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmployeeId = searchParams.get("employeeId") || "";

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(initialEmployeeId);
  const [searchTerm, setSearchTerm] = useState("");

  const employeesQuery = useEmployeeOptions();
  const employeeSelectId = useId();
  const searchInputId = useId();

  const employees = useMemo(() => {
    return employeesQuery.data?.content.filter(
      (e) => e.employmentStatus === "ACTIVE",
    ) ?? [];
  }, [employeesQuery.data]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(
      (e) =>
        e.firstName.toLowerCase().includes(term) ||
        e.lastName.toLowerCase().includes(term) ||
        (e.employeeCode && e.employeeCode.toLowerCase().includes(term)) ||
        (e.designation && e.designation.toLowerCase().includes(term)),
    );
  }, [employees, searchTerm]);

  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  function handleSelectEmployee(employeeId: string) {
    setSelectedEmployeeId(employeeId);
    const params = new URLSearchParams(searchParams.toString());
    if (employeeId) {
      params.set("employeeId", employeeId);
    } else {
      params.delete("employeeId");
    }
    router.replace(`/admin/work-assignments?${params.toString()}`);
  }

  return (
    <PageContainer>
      <PageHeader
        description="Assign employees to shifts and office locations to enforce attendance schedules and geofences."
        eyebrow="Workforce management"
        title="Work assignments"
      />

      {/* Backend Contract Clarification Banner */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-info/20 bg-info-soft p-4 text-xs text-info">
        <Info aria-hidden="true" className="size-4 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-sm">Employee-centric assignment architecture</p>
          <p>
            The backend HRMS API queries work assignments per employee via{" "}
            <code className="font-mono bg-info/10 px-1 py-0.5 rounded">
              GET /api/v1/admin/employees/&#123;employeeId&#125;/work-assignments
            </code>
            . Select an employee below to view, manage, and create their work assignments.
          </p>
        </div>
      </div>

      {/* Employee Selector Bar */}
      <Card className="mb-6 border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold" htmlFor={employeeSelectId}>
                Select employee
              </Label>
              {employeesQuery.isLoading ? (
                <Skeleton className="mt-1.5 h-10 w-full rounded-md" />
              ) : (
                <Select
                  className="mt-1.5"
                  id={employeeSelectId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  value={selectedEmployeeId}
                >
                  <option value="">Choose an employee...</option>
                  {filteredEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {employeeFullName(emp)} ({emp.employeeCode})
                      {emp.designation ? ` — ${emp.designation}` : ""}
                    </option>
                  ))}
                </Select>
              )}
            </div>

            <div>
              <Label className="text-xs font-semibold" htmlFor={searchInputId}>
                Filter employee list
              </Label>
              <div className="relative mt-1.5">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  className="pl-9"
                  id={searchInputId}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by name or employee code..."
                  value={searchTerm}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Employee Context Header & Assignments Panel */}
      {selectedEmployeeId ? (
        <div className="space-y-6">
          {selectedEmployee && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {selectedEmployee.firstName[0]}
                  {selectedEmployee.lastName[0]}
                </span>
                <div>
                  <h2 className="font-semibold text-sm text-foreground">
                    {employeeFullName(selectedEmployee)}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Code: <span className="font-mono font-medium">{selectedEmployee.employeeCode}</span>
                    {selectedEmployee.designation ? ` • ${selectedEmployee.designation}` : ""}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                <UserCheck aria-hidden="true" className="size-3.5" />
                Active Employee
              </span>
            </div>
          )}

          <EmployeeWorkAssignmentsPanel
            employeeId={selectedEmployeeId}
            employeeName={selectedEmployee ? employeeFullName(selectedEmployee) : undefined}
          />
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Users aria-hidden="true" className="size-6" />
            </span>
            <h3 className="mt-4 font-semibold text-foreground">
              No employee selected
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Choose an employee from the dropdown above to view their active shift, office location, and assignment history.
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

