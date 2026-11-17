export type AttendanceReportDayStatus =
  | "PRESENT"
  | "HALF_DAY"
  | "ABSENT"
  | "LEAVE"
  | "HOLIDAY"
  | "WEEKLY_OFF"
  | "IN_PROGRESS"
  | "UPCOMING"
  | "UNASSIGNED"
  | "NOT_EMPLOYED";

export type AttendanceReportDay = {
  status: AttendanceReportDayStatus;
  workedMinutes: number;
  overtimeMinutes: number;
  lateByMinutes: number;
  scheduledMinutes: number;
};

export type AttendanceReportEmployee = {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentId: string | null;
  days: Record<string, AttendanceReportDay>;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalWorkedMinutes: number;
  totalOvertimeMinutes: number;
  totalLateMinutes: number;
};

export type AttendanceMonthlyReport = {
  month: string;
  dates: string[];
  employees: AttendanceReportEmployee[];
  summary: {
    employeeCount: number;
    presentDays: number;
    halfDays: number;
    absentDays: number;
    totalWorkedMinutes: number;
    totalOvertimeMinutes: number;
    totalLateMinutes: number;
  };
};

export type AttendanceMonthlyReportParams = {
  month: string;
  departmentId?: string;
  employeeCode?: string;
};
