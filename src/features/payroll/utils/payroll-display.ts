import type {
  PayrollAdjustmentType,
  PayrollStatus,
} from "@/features/payroll/types/payroll-types";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTH_OPTIONS = MONTH_NAMES.map((name, index) => ({
  label: name,
  value: index + 1,
}));

export const PAYROLL_STATUS_LABELS: Record<PayrollStatus, string> = {
  DRAFT: "Draft",
  REVIEWED: "Reviewed",
  FINALIZED: "Finalized",
  PAID: "Paid",
};

export const ADJUSTMENT_TYPE_LABELS: Record<PayrollAdjustmentType, string> = {
  BONUS: "Bonus",
  OVERTIME_PAY: "Overtime Pay",
  OTHER_EARNING: "Other Earning",
  OTHER_DEDUCTION: "Other Deduction",
};

export function formatCurrency(amount?: number | null): string {
  const value = amount ?? 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPayrollPeriod(month: number, year: number): string {
  const monthName = MONTH_NAMES[month - 1] ?? `Month ${month}`;
  return `${monthName} ${year}`;
}

export function canEditDraft(status: PayrollStatus): boolean {
  return status === "DRAFT";
}

export function canReview(status: PayrollStatus): boolean {
  return status === "DRAFT";
}

export function canFinalize(status: PayrollStatus): boolean {
  return status === "REVIEWED";
}

export function canPay(status: PayrollStatus): boolean {
  return status === "FINALIZED";
}

export function getPayrollStatusBadgeVariant(status: PayrollStatus): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  switch (status) {
    case "DRAFT":
      return {
        label: "Draft",
        variant: "outline",
        className:
          "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
      };
    case "REVIEWED":
      return {
        label: "Reviewed",
        variant: "secondary",
        className:
          "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
      };
    case "FINALIZED":
      return {
        label: "Finalized",
        variant: "secondary",
        className:
          "border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
      };
    case "PAID":
      return {
        label: "Paid",
        variant: "secondary",
        className:
          "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
      };
  }
}

