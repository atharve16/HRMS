"use client";

import { useState } from "react";

import { AttendanceReportShell } from "@/features/attendance/components/attendance-report-shell";
import { AttendanceReportTable } from "@/features/attendance/components/attendance-report-table";
import { useAttendanceMonthlyReport } from "@/features/attendance/hooks/use-attendance-reports";
import type {
  AttendanceReportDay,
  AttendanceReportDayStatus,
  AttendanceReportEmployee,
} from "@/features/attendance/types/attendance-report-types";
import { getAttendanceErrorMessage } from "@/features/attendance/utils/attendance-errors";

function currentMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const statusPresentation: Record<AttendanceReportDayStatus, { label: string; title: string; className: string }> = {
  PRESENT: { label: "P", title: "Present", className: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900" },
  HALF_DAY: { label: "H", title: "Half-day", className: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900" },
  ABSENT: { label: "A", title: "Absent", className: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900" },
  LEAVE: { label: "L", title: "Approved leave", className: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900" },
  HOLIDAY: { label: "HD", title: "Company holiday", className: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900" },
  WEEKLY_OFF: { label: "WO", title: "Weekly off", className: "bg-muted text-muted-foreground ring-border" },
  IN_PROGRESS: { label: "…", title: "Shift in progress", className: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900" },
  UPCOMING: { label: "—", title: "Upcoming shift", className: "bg-muted/60 text-muted-foreground ring-border" },
  UNASSIGNED: { label: "—", title: "No work assignment", className: "bg-muted/60 text-muted-foreground ring-border" },
  NOT_EMPLOYED: { label: "—", title: "Outside employment dates", className: "bg-muted/60 text-muted-foreground ring-border" },
};

function StatusCell({ entry }: { entry: AttendanceReportDay }) {
  const presentation = statusPresentation[entry.status];
  return (
    <span
      aria-label={presentation.title}
      className={`inline-flex h-7 min-w-8 items-center justify-center rounded-md px-1.5 text-xs font-bold ring-1 ring-inset ${presentation.className}`}
      title={presentation.title}
    >
      {presentation.label}
    </span>
  );
}

function EmployeeAttendanceTotal({ employee }: { employee: AttendanceReportEmployee }) {
  return (
    <div className="whitespace-nowrap text-xs font-semibold">
      <span className="text-emerald-700 dark:text-emerald-400">P {employee.presentDays}</span>
      <span className="mx-1 text-muted-foreground">·</span>
      <span className="text-amber-700 dark:text-amber-400">H {employee.halfDays}</span>
      <span className="mx-1 text-muted-foreground">·</span>
      <span className="text-rose-700 dark:text-rose-400">A {employee.absentDays}</span>
    </div>
  );
}

export function MonthlyAttendanceReport() {
  const [month, setMonth] = useState(currentMonth);
  const [departmentId, setDepartmentId] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");

  const query = useAttendanceMonthlyReport({
    month,
    departmentId: departmentId || undefined,
    employeeCode: employeeCode.trim() || undefined,
  });
  const report = query.data;
  const summary = report?.summary;

  return (
    <AttendanceReportShell
      description="Review each employee's attendance status for every scheduled day in the selected month."
      departmentId={departmentId}
      employeeCode={employeeCode}
      errorMessage={query.error ? getAttendanceErrorMessage(query.error) : undefined}
      hasData={Boolean(report)}
      isError={query.isError}
      isLoading={query.isLoading}
      metrics={summary ? [
        { label: "Employees", value: String(summary.employeeCount), description: "Included in this report" },
        { label: "Present days", value: String(summary.presentDays), tone: "default" },
        { label: "Half-days", value: String(summary.halfDays), tone: "amber" },
        { label: "Absent days", value: String(summary.absentDays), tone: "red" },
      ] : []}
      month={month}
      onDepartmentChange={setDepartmentId}
      onEmployeeCodeChange={setEmployeeCode}
      onMonthChange={setMonth}
      onRetry={() => void query.refetch()}
      title="Monthly attendance reports"
    >
      {report && (
        <div className="space-y-3">
          <AttendanceReportTable
            dates={report.dates}
            employees={report.employees}
            emptyMessage="No attendance data found."
            renderCell={(employee, date) => {
              const entry = employee.days[date];
              return entry ? <StatusCell entry={entry} /> : <span className="text-muted-foreground">—</span>;
            }}
            renderTotal={(employee) => <EmployeeAttendanceTotal employee={employee} />}
            totalHeader="Monthly total"
          />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Legend</span>
            {(["PRESENT", "HALF_DAY", "ABSENT", "LEAVE", "HOLIDAY", "WEEKLY_OFF"] as AttendanceReportDayStatus[]).map((status) => {
              const item = statusPresentation[status];
              return (
                <span className="inline-flex items-center gap-1.5" key={status}>
                  <span className={`inline-flex h-5 min-w-6 items-center justify-center rounded px-1 font-bold ring-1 ring-inset ${item.className}`}>
                    {item.label}
                  </span>
                  {item.title}
                </span>
              );
            })}
            <span>Upcoming shifts and in-progress shifts are not marked absent.</span>
          </div>
        </div>
      )}
    </AttendanceReportShell>
  );
}
