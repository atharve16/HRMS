"use client";

import { useState } from "react";

import { AttendanceReportShell } from "@/features/attendance/components/attendance-report-shell";
import { AttendanceReportTable } from "@/features/attendance/components/attendance-report-table";
import { useAttendanceMonthlyReport } from "@/features/attendance/hooks/use-attendance-reports";
import type {
  AttendanceReportDay,
  AttendanceReportEmployee,
} from "@/features/attendance/types/attendance-report-types";
import { getAttendanceErrorMessage } from "@/features/attendance/utils/attendance-errors";
import { formatReportMinutes } from "@/features/attendance/utils/attendance-report-display";

function currentMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function OvertimeLateCell({ entry }: { entry: AttendanceReportDay }) {
  if (entry.overtimeMinutes <= 0 && entry.lateByMinutes <= 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex min-w-20 flex-col items-center gap-1 text-[0.6875rem] font-semibold tabular-nums">
      {entry.overtimeMinutes > 0 && (
        <span className="whitespace-nowrap text-blue-600 dark:text-blue-400">
          +{formatReportMinutes(entry.overtimeMinutes)} OT
        </span>
      )}
      {entry.lateByMinutes > 0 && (
        <span className="whitespace-nowrap text-rose-600 dark:text-rose-400">
          {formatReportMinutes(entry.lateByMinutes)} late
        </span>
      )}
    </div>
  );
}

function OvertimeLateTotal({ employee }: { employee: AttendanceReportEmployee }) {
  return (
    <div className="flex flex-col items-end gap-1 text-xs font-bold tabular-nums">
      <span className="whitespace-nowrap text-blue-600 dark:text-blue-400">
        +{formatReportMinutes(employee.totalOvertimeMinutes)} OT
      </span>
      <span className="whitespace-nowrap text-rose-600 dark:text-rose-400">
        {formatReportMinutes(employee.totalLateMinutes)} late
      </span>
    </div>
  );
}

export function OvertimeLateReport() {
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
      description="Identify extra working time and late arrivals for every employee and day. Overtime is blue; late time is red."
      departmentId={departmentId}
      employeeCode={employeeCode}
      errorMessage={query.error ? getAttendanceErrorMessage(query.error) : undefined}
      hasData={Boolean(report)}
      isError={query.isError}
      isLoading={query.isLoading}
      metrics={summary ? [
        { label: "Total overtime", value: formatReportMinutes(summary.totalOvertimeMinutes), tone: "blue", description: "Combined overtime duration" },
        { label: "Total late time", value: formatReportMinutes(summary.totalLateMinutes), tone: "red", description: "Combined late-arrival duration" },
        { label: "Employees", value: String(summary.employeeCount), description: "Included in this report" },
      ] : []}
      month={month}
      onDepartmentChange={setDepartmentId}
      onEmployeeCodeChange={setEmployeeCode}
      onMonthChange={setMonth}
      onRetry={() => void query.refetch()}
      title="Overtime & late report"
    >
      {report && (
        <div className="space-y-3">
          <AttendanceReportTable
            dates={report.dates}
            employees={report.employees}
            emptyMessage="No overtime or late-arrival data found."
            renderCell={(employee, date) => {
              const entry = employee.days[date];
              return entry ? <OvertimeLateCell entry={entry} /> : <span className="text-muted-foreground">—</span>;
            }}
            renderTotal={(employee) => <OvertimeLateTotal employee={employee} />}
            totalHeader="Monthly totals"
          />
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-xs">
            <span className="font-semibold text-foreground">Legend</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Blue: overtime</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">Red: late arrival</span>
          </div>
        </div>
      )}
    </AttendanceReportShell>
  );
}
