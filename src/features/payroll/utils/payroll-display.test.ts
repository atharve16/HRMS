import { describe, expect, it } from "vitest";

import {
  canEditDraft,
  canFinalize,
  canPay,
  canReview,
  formatCurrency,
  formatPayrollPeriod,
  getPayrollStatusBadgeVariant,
} from "./payroll-display";

describe("payroll-display", () => {
  describe("formatCurrency", () => {
    it("formats Indian rupees correctly", () => {
      const formatted = formatCurrency(75000);
      expect(formatted).toContain("75,000.00");
      expect(formatCurrency(0)).toContain("0.00");
      expect(formatCurrency(null)).toContain("0.00");
      expect(formatCurrency(undefined)).toContain("0.00");
    });
  });

  describe("formatPayrollPeriod", () => {
    it("formats month and year correctly", () => {
      expect(formatPayrollPeriod(1, 2026)).toBe("January 2026");
      expect(formatPayrollPeriod(10, 2026)).toBe("October 2026");
      expect(formatPayrollPeriod(12, 2025)).toBe("December 2025");
    });
  });

  describe("lifecycle permission helpers", () => {
    it("canEditDraft is only true for DRAFT", () => {
      expect(canEditDraft("DRAFT")).toBe(true);
      expect(canEditDraft("REVIEWED")).toBe(false);
      expect(canEditDraft("FINALIZED")).toBe(false);
      expect(canEditDraft("PAID")).toBe(false);
    });

    it("canReview is only true for DRAFT", () => {
      expect(canReview("DRAFT")).toBe(true);
      expect(canReview("REVIEWED")).toBe(false);
      expect(canReview("FINALIZED")).toBe(false);
      expect(canReview("PAID")).toBe(false);
    });

    it("canFinalize is only true for REVIEWED", () => {
      expect(canFinalize("DRAFT")).toBe(false);
      expect(canFinalize("REVIEWED")).toBe(true);
      expect(canFinalize("FINALIZED")).toBe(false);
      expect(canFinalize("PAID")).toBe(false);
    });

    it("canPay is only true for FINALIZED", () => {
      expect(canPay("DRAFT")).toBe(false);
      expect(canPay("REVIEWED")).toBe(false);
      expect(canPay("FINALIZED")).toBe(true);
      expect(canPay("PAID")).toBe(false);
    });
  });

  describe("getPayrollStatusBadgeVariant", () => {
    it("returns appropriate badge variant and colors for each status", () => {
      expect(getPayrollStatusBadgeVariant("DRAFT").label).toBe("Draft");
      expect(getPayrollStatusBadgeVariant("REVIEWED").label).toBe("Reviewed");
      expect(getPayrollStatusBadgeVariant("FINALIZED").label).toBe("Finalized");
      expect(getPayrollStatusBadgeVariant("PAID").label).toBe("Paid");
    });
  });
});

