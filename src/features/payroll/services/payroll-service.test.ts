import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  finalizePayroll,
  generatePayroll,
  getAdminPayrollDetail,
  getEmployeeSalary,
  getEmployeeSalaryHistory,
  getMyPayrollDetail,
  getMyPayrolls,
  listAdminPayrolls,
  payPayroll,
  reviewPayroll,
  updateDraftPayroll,
  upsertEmployeeSalary,
} from "@/features/payroll/services/payroll-service";
import type {
  EmployeePayrollPageResponse,
  EmployeePayrollResponse,
  GeneratePayrollRequest,
  PayrollGenerationSummary,
  PayrollPageResponse,
  PayrollResponse,
  SalaryStructureResponse,
  UpdateDraftPayrollRequest,
  UpsertSalaryRequest,
} from "@/features/payroll/types/payroll-types";

const sampleSalary: SalaryStructureResponse = {
  id: "sal-1",
  employeeId: "emp-101",
  monthlyFixedSalary: 75000,
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  active: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const samplePayroll: PayrollResponse = {
  id: "pay-1",
  employeeId: "emp-101",
  employeeCodeSnapshot: "EMP-001",
  employeeNameSnapshot: "Jane Doe",
  departmentIdSnapshot: "dept-1",
  departmentSnapshot: "Engineering",
  payrollMonth: 10,
  payrollYear: 2026,
  monthlyFixedSalarySnapshot: 75000,
  scheduledWorkingDays: 22,
  attendedDays: 20,
  paidLeaveDays: 2,
  unpaidLeaveDays: 0,
  unexcusedAbsenceDays: 0,
  totalUnpaidDays: 0,
  dailySalaryRate: 3409.09,
  salaryDeduction: 0,
  earnings: [],
  deductions: [],
  totalEarnings: 0,
  totalDeductions: 0,
  netSalary: 75000,
  status: "DRAFT",
  calculationDetails: {
    scheduledDates: [],
    attendedDates: [],
    paidLeaveDates: [],
    unpaidLeaveDates: [],
    unexcusedAbsenceDates: [],
    holidayDates: [],
    weeklyOffDates: [],
  },
  reviewedBy: null,
  reviewedAt: null,
  finalizedBy: null,
  finalizedAt: null,
  paidBy: null,
  paidAt: null,
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
  version: 0,
};

const sampleEmployeePayroll: EmployeePayrollResponse = {
  id: "pay-1",
  employeeCode: "EMP-001",
  employeeName: "Jane Doe",
  department: "Engineering",
  payrollMonth: 10,
  payrollYear: 2026,
  monthlyFixedSalary: 75000,
  scheduledWorkingDays: 22,
  attendedDays: 20,
  paidLeaveDays: 2,
  unpaidLeaveDays: 0,
  unexcusedAbsenceDays: 0,
  totalUnpaidDays: 0,
  dailySalaryRate: 3409.09,
  salaryDeduction: 0,
  earnings: [],
  deductions: [],
  totalEarnings: 0,
  totalDeductions: 0,
  netSalary: 75000,
  status: "FINALIZED",
  calculationDetails: {
    scheduledDates: [],
    attendedDates: [],
    paidLeaveDates: [],
    unpaidLeaveDates: [],
    unexcusedAbsenceDates: [],
    holidayDates: [],
    weeklyOffDates: [],
  },
  finalizedAt: "2026-11-02T10:00:00Z",
  paidAt: null,
};

const samplePage: PayrollPageResponse = {
  items: [samplePayroll],
  page: 0,
  limit: 20,
  totalItems: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

const sampleEmployeePage: EmployeePayrollPageResponse = {
  items: [sampleEmployeePayroll],
  page: 0,
  limit: 20,
  totalItems: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

describe("payroll-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("salary management", () => {
    it("upserts employee salary via PUT", async () => {
      const payload: UpsertSalaryRequest = {
        monthlyFixedSalary: 80000,
        effectiveFrom: "2026-11-01",
      };
      api.put.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Salary structure saved",
          data: { ...sampleSalary, monthlyFixedSalary: 80000 },
        },
      });

      const result = await upsertEmployeeSalary("emp-101", payload);
      expect(api.put).toHaveBeenCalledWith(
        "/admin/employees/emp-101/salary",
        payload,
      );
      expect(result.monthlyFixedSalary).toBe(80000);
    });

    it("gets current employee salary via GET", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Salary structure retrieved",
          data: sampleSalary,
        },
      });

      const result = await getEmployeeSalary("emp-101");
      expect(api.get).toHaveBeenCalledWith("/admin/employees/emp-101/salary");
      expect(result).toEqual(sampleSalary);
    });

    it("gets employee salary history via GET", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Salary history retrieved",
          data: [sampleSalary],
        },
      });

      const result = await getEmployeeSalaryHistory("emp-101");
      expect(api.get).toHaveBeenCalledWith(
        "/admin/employees/emp-101/salary/history",
      );
      expect(result).toEqual([sampleSalary]);
    });
  });

  describe("admin payroll operations", () => {
    it("generates payroll for month/year via POST", async () => {
      const payload: GeneratePayrollRequest = { month: 10, year: 2026 };
      const summary: PayrollGenerationSummary = {
        month: 10,
        year: 2026,
        generated: [
          {
            employeeId: "emp-101",
            employeeCode: "EMP-001",
            payrollId: "pay-1",
            reason: null,
          },
        ],
        skipped: [],
        failed: [],
      };
      api.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Payroll generation completed",
          data: summary,
        },
      });

      const result = await generatePayroll(payload);
      expect(api.post).toHaveBeenCalledWith(
        "/admin/payroll/generate",
        payload,
      );
      expect(result).toEqual(summary);
    });

    it("lists admin payrolls via GET with query params", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Payroll records retrieved",
          data: samplePage,
        },
      });

      const params = { month: 10, year: 2026, page: 0, limit: 10 };
      const result = await listAdminPayrolls(params);
      expect(api.get).toHaveBeenCalledWith("/admin/payroll", { params });
      expect(result).toEqual(samplePage);
    });

    it("gets admin payroll detail via GET", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Payroll record retrieved",
          data: samplePayroll,
        },
      });

      const result = await getAdminPayrollDetail("pay-1");
      expect(api.get).toHaveBeenCalledWith("/admin/payroll/pay-1");
      expect(result).toEqual(samplePayroll);
    });

    it("updates draft payroll adjustments via PATCH", async () => {
      const payload: UpdateDraftPayrollRequest = {
        earnings: [
          {
            type: "BONUS",
            description: "Diwali Bonus",
            amount: 5000,
          },
        ],
      };
      const updated = {
        ...samplePayroll,
        totalEarnings: 5000,
        netSalary: 80000,
      };
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Draft payroll updated",
          data: updated,
        },
      });

      const result = await updateDraftPayroll("pay-1", payload);
      expect(api.patch).toHaveBeenCalledWith("/admin/payroll/pay-1", payload);
      expect(result.netSalary).toBe(80000);
    });

    it("reviews payroll via PATCH /review", async () => {
      const reviewed = { ...samplePayroll, status: "REVIEWED" as const };
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Payroll reviewed",
          data: reviewed,
        },
      });

      const result = await reviewPayroll("pay-1");
      expect(api.patch).toHaveBeenCalledWith("/admin/payroll/pay-1/review");
      expect(result.status).toBe("REVIEWED");
    });

    it("finalizes payroll via PATCH /finalize", async () => {
      const finalized = { ...samplePayroll, status: "FINALIZED" as const };
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Payroll finalized",
          data: finalized,
        },
      });

      const result = await finalizePayroll("pay-1");
      expect(api.patch).toHaveBeenCalledWith("/admin/payroll/pay-1/finalize");
      expect(result.status).toBe("FINALIZED");
    });

    it("pays payroll via PATCH /pay", async () => {
      const paid = { ...samplePayroll, status: "PAID" as const };
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Payroll marked as paid",
          data: paid,
        },
      });

      const result = await payPayroll("pay-1");
      expect(api.patch).toHaveBeenCalledWith("/admin/payroll/pay-1/pay");
      expect(result.status).toBe("PAID");
    });
  });

  describe("employee payroll operations", () => {
    it("gets employee payroll list via GET /payroll/me", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Payroll records retrieved",
          data: sampleEmployeePage,
        },
      });

      const params = { year: 2026, page: 0, limit: 10 };
      const result = await getMyPayrolls(params);
      expect(api.get).toHaveBeenCalledWith("/payroll/me", { params });
      expect(result).toEqual(sampleEmployeePage);
    });

    it("gets employee payroll detail via GET /payroll/me/:payrollId", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Payroll record retrieved",
          data: sampleEmployeePayroll,
        },
      });

      const result = await getMyPayrollDetail("pay-1");
      expect(api.get).toHaveBeenCalledWith("/payroll/me/pay-1");
      expect(result).toEqual(sampleEmployeePayroll);
    });
  });
});

