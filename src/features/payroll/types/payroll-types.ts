export type PayrollStatus = "DRAFT" | "REVIEWED" | "FINALIZED" | "PAID";

export type PayrollAdjustmentType =
  | "BONUS"
  | "OVERTIME_PAY"
  | "OTHER_EARNING"
  | "OTHER_DEDUCTION";

export interface PayrollAdjustment {
  type: PayrollAdjustmentType;
  description: string;
  amount: number;
  createdBy?: string;
  createdAt?: string; // ISO 8601
}

export interface PayrollAdjustmentInput {
  type: PayrollAdjustmentType;
  description: string;
  amount: number;
}

export interface PayrollCalculationDetails {
  employmentPeriodStart?: string;
  employmentPeriodEnd?: string;
  scheduledDates: string[];
  attendedDates: string[];
  paidLeaveDates: string[];
  unpaidLeaveDates: string[];
  unexcusedAbsenceDates: string[];
  holidayDates: string[];
  weeklyOffDates: string[];
  formula?: string;
}

export interface PayrollResponse {
  id: string;
  employeeId: string;
  employeeCodeSnapshot: string;
  employeeNameSnapshot: string;
  departmentIdSnapshot: string;
  departmentSnapshot: string;
  payrollMonth: number;
  payrollYear: number;
  monthlyFixedSalarySnapshot: number;
  scheduledWorkingDays: number;
  attendedDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  unexcusedAbsenceDays: number;
  totalUnpaidDays: number;
  dailySalaryRate: number;
  salaryDeduction: number;
  earnings: PayrollAdjustment[];
  deductions: PayrollAdjustment[];
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  calculationDetails: PayrollCalculationDetails;
  reviewedBy: string | null;
  reviewedAt: string | null; // ISO 8601
  finalizedBy: string | null;
  finalizedAt: string | null; // ISO 8601
  paidBy: string | null;
  paidAt: string | null; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  version: number;
}

export interface EmployeePayrollResponse {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  payrollMonth: number;
  payrollYear: number;
  monthlyFixedSalary: number;
  scheduledWorkingDays: number;
  attendedDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  unexcusedAbsenceDays: number;
  totalUnpaidDays: number;
  dailySalaryRate: number;
  salaryDeduction: number;
  earnings: PayrollAdjustment[];
  deductions: PayrollAdjustment[];
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  calculationDetails: PayrollCalculationDetails;
  finalizedAt: string | null; // ISO 8601
  paidAt: string | null; // ISO 8601
}

export interface PayrollPageResponse {
  items: PayrollResponse[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface EmployeePayrollPageResponse {
  items: EmployeePayrollResponse[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GeneratePayrollRequest {
  month: number;
  year: number;
}

export interface PayrollGenerationItem {
  employeeId: string;
  employeeCode: string;
  payrollId: string | null;
  reason: string | null;
}

export interface PayrollGenerationSummary {
  month: number;
  year: number;
  generated: PayrollGenerationItem[];
  skipped: PayrollGenerationItem[];
  failed: PayrollGenerationItem[];
}

export interface UpdateDraftPayrollRequest {
  earnings?: PayrollAdjustmentInput[];
  deductions?: PayrollAdjustmentInput[];
}

export interface UpsertSalaryRequest {
  monthlyFixedSalary: number;
  effectiveFrom: string; // YYYY-MM-DD
}

export interface SalaryStructureResponse {
  id: string;
  employeeId: string;
  monthlyFixedSalary: number;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo: string | null; // YYYY-MM-DD
  active: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface AdminPayrollParams {
  month?: number;
  year?: number;
  employeeId?: string;
  employeeCode?: string;
  departmentId?: string;
  status?: PayrollStatus;
  page?: number;
  limit?: number;
  sortDirection?: "asc" | "desc";
}

export interface EmployeePayrollParams {
  year?: number;
  page?: number;
  limit?: number;
}

