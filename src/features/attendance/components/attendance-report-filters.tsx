"use client";

import { CalendarDays, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useDepartments } from "@/features/departments/hooks/use-departments";

type AttendanceReportFiltersProps = {
  month: string;
  departmentId: string;
  employeeCode: string;
  onMonthChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onEmployeeCodeChange: (value: string) => void;
};

export function AttendanceReportFilters({
  month,
  departmentId,
  employeeCode,
  onMonthChange,
  onDepartmentChange,
  onEmployeeCodeChange,
}: AttendanceReportFiltersProps) {
  const departmentsQuery = useDepartments({ page: 0, limit: 100 });

  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <Label className="text-xs font-semibold" htmlFor="attendance-report-month">
          Report month
        </Label>
        <div className="relative mt-1.5">
          <CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            id="attendance-report-month"
            onChange={(event) => {
              if (event.target.value) onMonthChange(event.target.value);
            }}
            required
            type="month"
            value={month}
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold" htmlFor="attendance-report-department">
          Department
        </Label>
        <Select
          className="mt-1.5"
          id="attendance-report-department"
          onChange={(event) => onDepartmentChange(event.target.value)}
          value={departmentId}
        >
          <option value="">All departments</option>
          {departmentsQuery.data?.content.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold" htmlFor="attendance-report-employee">
          Employee code
        </Label>
        <div className="relative mt-1.5">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            id="attendance-report-employee"
            onChange={(event) => onEmployeeCodeChange(event.target.value)}
            placeholder="Search employee code"
            value={employeeCode}
          />
        </div>
      </div>
    </div>
  );
}
