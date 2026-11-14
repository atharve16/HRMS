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

function WorkedTimeCell({ entry }: { entry: AttendanceReportDay }) {
  if (["LEAVE", "HOLIDAY", "WEEKLY_OFF", "UPCOMING", "UNASSIGNED", "NOT_EMPLOYED"].includes(entry.status)) {
    const label = entry.status === "LEAVE" ? "L"
      : entry.status === "HOLIDAY" ? "HD"
      : entry.status === "WEEKLY_OFF" ? "WO"
      : "—";
    return <span className="text-xs text-muted-foreground" title={entry.status.replaceAll("_", " ")}>{label}</span>;
  }

  if (entry.status === "IN_PROGRESS" && entry.workedMinutes === 0) {
    return <span className="text-xs font-medium text-blue-600 dark:text-blue-400">In progress</span>;
  }

  return (
    <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-foreground">
      {formatReportMinutes(entry.workedMinutes)}
    </span>
  );
}

function WorkedTotal({ employee }: { employee: AttendanceReportEmployee }) {
  return (
    <span className="whitespace-nowrap text-sm font-bold tabular-nums text-foreground">
      {formatReportMinutes(employee.totalWorkedMinutes)}
    </span>
  );
}

export function WorkingHoursReport() {
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
  const averageHours = summary && summary.employeeCount > 0
    ? formatReportMinutes(Math.round(summary.totalWorkedMinutes / summary.employeeCount))
    : "00:00";

  return (
    <AttendanceReportShell
      description="Compare daily working time across employees and review each employee's monthly total."
      departmentId={departmentId}
      employeeCode={employeeCode}
      errorMessage={query.error ? getAttendanceErrorMessage(query.error) : undefined}
      hasData={Boolean(report)}
      isError={query.isError}
      isLoading={query.isLoading}
      metrics={summary ? [
        { label: "Total hours worked", value: formatReportMinutes(summary.totalWorkedMinutes), description: "Combined hours for the selected month" },
        { label: "Employees", value: String(summary.employeeCount), description: "Included in this report" },
        { label: "Average per employee", value: averageHours, description: "Monthly average, HH:MM" },
      ] : []}
      month={month}
      onDepartmentChange={setDepartmentId}
      onEmployeeCodeChange={setEmployeeCode}
      onMonthChange={setMonth}
      onRetry={() => void query.refetch()}
      title="Working hours report"
    >
      {report && (
        <AttendanceReportTable
          dates={report.dates}
          employees={report.employees}
          emptyMessage="No working-hours data found."
          renderCell={(employee, date) => {
            const entry = employee.days[date];
            return entry ? <WorkedTimeCell entry={entry} /> : <span className="text-muted-foreground">—</span>;
          }}
          renderTotal={(employee) => <WorkedTotal employee={employee} />}
          totalHeader="Total hours"
        />
      )}
    </AttendanceReportShell>
  );
}
