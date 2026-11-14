import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AttendanceReportEmployee } from "@/features/attendance/types/attendance-report-types";

type AttendanceReportTableProps = {
  employees: AttendanceReportEmployee[];
  dates: string[];
  totalHeader: string;
  emptyMessage: string;
  renderCell: (employee: AttendanceReportEmployee, date: string) => ReactNode;
  renderTotal: (employee: AttendanceReportEmployee) => ReactNode;
};

function formatDateHeader(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return {
    day: new Intl.DateTimeFormat("en-IN", { day: "2-digit" }).format(date),
    weekday: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
  };
}

export function AttendanceReportTable({
  employees,
  dates,
  totalHeader,
  emptyMessage,
  renderCell,
  renderTotal,
}: AttendanceReportTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table className="min-w-max w-full">
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead className="sticky left-0 z-20 min-w-56 border-r border-border bg-muted/95">
              Employee
            </TableHead>
            {dates.map((date) => {
              const header = formatDateHeader(date);
              return (
                <TableHead className="min-w-[4.25rem] px-2 text-center" key={date}>
                  <span className="block text-xs font-bold text-foreground">{header.day}</span>
                  <span className="block text-[0.625rem] font-medium normal-case text-muted-foreground">
                    {header.weekday}
                  </span>
                </TableHead>
              );
            })}
            <TableHead className="sticky right-0 z-20 min-w-36 border-l border-border bg-muted/95 text-right">
              {totalHeader}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell className="py-12 text-center text-sm text-muted-foreground" colSpan={dates.length + 2}>
                No employees or report data match the selected filters.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.employeeId}>
                <TableCell className="sticky left-0 z-10 min-w-56 border-r border-border bg-card">
                  <span className="block max-w-48 truncate text-sm font-semibold text-foreground">
                    {employee.employeeName}
                  </span>
                  <span className="mt-0.5 block font-mono text-[0.6875rem] text-muted-foreground">
                    {employee.employeeCode}
                  </span>
                </TableCell>
                {dates.map((date) => (
                  <TableCell className="px-2 py-2 text-center" key={date}>
                    {renderCell(employee, date)}
                  </TableCell>
                ))}
                <TableCell className="sticky right-0 z-10 border-l border-border bg-card text-right">
                  {renderTotal(employee)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
