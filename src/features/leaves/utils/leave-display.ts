import type {
  LeaveStatus,
  LeaveType,
} from "@/features/leaves/types/leave-types";

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  CL: "Casual Leave",
  SL: "Sick Leave",
  EL: "Earned Leave",
  LWP: "Leave Without Pay",
  CO: "Compensatory Off",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export function isPaidLeave(type: LeaveType): boolean {
  return type !== "LWP";
}

export function canEmployeeCancel(status: LeaveStatus): boolean {
  return status === "PENDING";
}

export function canAdminReview(status: LeaveStatus): boolean {
  return status === "PENDING";
}

export function formatDays(days: number): string {
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function formatLeaveDateRange(
  startDate?: string | null,
  endDate?: string | null,
): string {
  if (!startDate) return "—";
  if (!endDate || startDate === endDate) return startDate;
  return `${startDate} to ${endDate}`;
}

export function getLeaveStatusBadgeVariant(status: LeaveStatus): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        variant: "outline",
        className:
          "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
      };
    case "APPROVED":
      return {
        label: "Approved",
        variant: "secondary",
        className:
          "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        variant: "destructive",
        className:
          "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        variant: "outline",
        className:
          "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
      };
  }
}

