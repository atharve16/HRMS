import { describe, expect, it } from "vitest";

import {
  createAssignmentSchema,
  endAssignmentSchema,
} from "@/features/work-assignments/schemas/work-assignment-schemas";

describe("work assignment validation schemas", () => {
  describe("createAssignmentSchema", () => {
    it("accepts valid input without effectiveTo", () => {
      const result = createAssignmentSchema.safeParse({
        shiftId: "shift-123",
        officeLocationId: "office-456",
        effectiveFrom: "2026-11-01",
        effectiveTo: "",
        reason: "Initial assignment",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with effectiveTo on or after effectiveFrom", () => {
      const result = createAssignmentSchema.safeParse({
        shiftId: "shift-123",
        officeLocationId: "office-456",
        effectiveFrom: "2026-11-01",
        effectiveTo: "2026-11-01",
        reason: "Single day assignment",
      });
      expect(result.success).toBe(true);

      const resultFuture = createAssignmentSchema.safeParse({
        shiftId: "shift-123",
        officeLocationId: "office-456",
        effectiveFrom: "2026-11-01",
        effectiveTo: "2026-12-31",
      });
      expect(resultFuture.success).toBe(true);
    });

    it("rejects when shiftId or officeLocationId or effectiveFrom is missing", () => {
      const noShift = createAssignmentSchema.safeParse({
        shiftId: "",
        officeLocationId: "office-456",
        effectiveFrom: "2026-11-01",
      });
      expect(noShift.success).toBe(false);

      const noOffice = createAssignmentSchema.safeParse({
        shiftId: "shift-123",
        officeLocationId: "",
        effectiveFrom: "2026-11-01",
      });
      expect(noOffice.success).toBe(false);

      const noFrom = createAssignmentSchema.safeParse({
        shiftId: "shift-123",
        officeLocationId: "office-456",
        effectiveFrom: "",
      });
      expect(noFrom.success).toBe(false);
    });

    it("rejects invalid date format", () => {
      const result = createAssignmentSchema.safeParse({
        shiftId: "shift-123",
        officeLocationId: "office-456",
        effectiveFrom: "11/01/2026",
      });
      expect(result.success).toBe(false);
    });

    it("rejects effectiveTo earlier than effectiveFrom", () => {
      const result = createAssignmentSchema.safeParse({
        shiftId: "shift-123",
        officeLocationId: "office-456",
        effectiveFrom: "2026-11-10",
        effectiveTo: "2026-11-05",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Effective end date cannot be earlier than start date.",
        );
      }
    });

    it("rejects reason exceeding 500 characters", () => {
      const result = createAssignmentSchema.safeParse({
        shiftId: "shift-123",
        officeLocationId: "office-456",
        effectiveFrom: "2026-11-01",
        reason: "x".repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("endAssignmentSchema", () => {
    it("accepts valid effectiveTo and optional reason", () => {
      const result = endAssignmentSchema.safeParse({
        effectiveTo: "2026-11-30",
        reason: "Transferring to a different office branch",
      });
      expect(result.success).toBe(true);
    });

    it("requires effectiveTo", () => {
      const result = endAssignmentSchema.safeParse({
        effectiveTo: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid date format", () => {
      const result = endAssignmentSchema.safeParse({
        effectiveTo: "not-a-date",
      });
      expect(result.success).toBe(false);
    });

    it("rejects reason over 500 characters", () => {
      const result = endAssignmentSchema.safeParse({
        effectiveTo: "2026-11-30",
        reason: "x".repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });
});

