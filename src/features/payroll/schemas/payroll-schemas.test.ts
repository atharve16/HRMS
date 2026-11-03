import { describe, expect, it } from "vitest";

import {
  generatePayrollSchema,
  payrollAdjustmentInputSchema,
  updateDraftPayrollSchema,
  upsertSalarySchema,
} from "./payroll-schemas";

describe("payroll-schemas", () => {
  describe("generatePayrollSchema", () => {
    it("validates valid month and year", () => {
      const result = generatePayrollSchema.safeParse({
        month: 10,
        year: 2026,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.month).toBe(10);
        expect(result.data.year).toBe(2026);
      }
    });

    it("rejects invalid month numbers", () => {
      expect(generatePayrollSchema.safeParse({ month: 0, year: 2026 }).success).toBe(
        false,
      );
      expect(
        generatePayrollSchema.safeParse({ month: 13, year: 2026 }).success,
      ).toBe(false);
    });

    it("rejects invalid year numbers", () => {
      expect(
        generatePayrollSchema.safeParse({ month: 10, year: 1999 }).success,
      ).toBe(false);
      expect(
        generatePayrollSchema.safeParse({ month: 10, year: 2101 }).success,
      ).toBe(false);
    });
  });

  describe("upsertSalarySchema", () => {
    it("validates valid salary and effective date", () => {
      const result = upsertSalarySchema.safeParse({
        monthlyFixedSalary: 75000,
        effectiveFrom: "2026-04-01",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.monthlyFixedSalary).toBe(75000);
        expect(result.data.effectiveFrom).toBe("2026-04-01");
      }
    });

    it("rejects non-positive salary amounts", () => {
      expect(
        upsertSalarySchema.safeParse({
          monthlyFixedSalary: 0,
          effectiveFrom: "2026-04-01",
        }).success,
      ).toBe(false);
      expect(
        upsertSalarySchema.safeParse({
          monthlyFixedSalary: -500,
          effectiveFrom: "2026-04-01",
        }).success,
      ).toBe(false);
    });

    it("rejects invalid date format", () => {
      expect(
        upsertSalarySchema.safeParse({
          monthlyFixedSalary: 50000,
          effectiveFrom: "01-04-2026",
        }).success,
      ).toBe(false);
      expect(
        upsertSalarySchema.safeParse({
          monthlyFixedSalary: 50000,
          effectiveFrom: "invalid",
        }).success,
      ).toBe(false);
    });
  });

  describe("payrollAdjustmentInputSchema", () => {
    it("validates valid adjustment input", () => {
      const result = payrollAdjustmentInputSchema.safeParse({
        type: "BONUS",
        description: "Festival bonus",
        amount: 5000,
      });
      expect(result.success).toBe(true);
    });

    it("rejects unknown adjustment type", () => {
      expect(
        payrollAdjustmentInputSchema.safeParse({
          type: "INVALID_TYPE",
          description: "Bonus",
          amount: 5000,
        }).success,
      ).toBe(false);
    });

    it("rejects empty description or negative amount", () => {
      expect(
        payrollAdjustmentInputSchema.safeParse({
          type: "BONUS",
          description: "   ",
          amount: 5000,
        }).success,
      ).toBe(false);
      expect(
        payrollAdjustmentInputSchema.safeParse({
          type: "BONUS",
          description: "Valid",
          amount: 0,
        }).success,
      ).toBe(false);
    });
  });

  describe("updateDraftPayrollSchema", () => {
    it("validates empty adjustments", () => {
      const result = updateDraftPayrollSchema.safeParse({
        earnings: [],
        deductions: [],
      });
      expect(result.success).toBe(true);
    });

    it("validates populated earnings and deductions", () => {
      const result = updateDraftPayrollSchema.safeParse({
        earnings: [
          { type: "BONUS", description: "Performance bonus", amount: 10000 },
          { type: "OVERTIME_PAY", description: "Weekend shift", amount: 2500 },
        ],
        deductions: [
          { type: "OTHER_DEDUCTION", description: "Damage recovery", amount: 1200 },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.earnings).toHaveLength(2);
        expect(result.data.deductions).toHaveLength(1);
      }
    });
  });
});
