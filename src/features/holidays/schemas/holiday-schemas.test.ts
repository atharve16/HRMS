import { describe, expect, it } from "vitest";

import {
  createHolidaySchema,
  updateHolidaySchema,
} from "@/features/holidays/schemas/holiday-schemas";

describe("holiday-schemas", () => {
  describe("createHolidaySchema", () => {
    it("accepts valid holiday creation input", () => {
      const result = createHolidaySchema.safeParse({
        name: "Independence Day",
        description: "National day of independence",
        date: "2026-08-15",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty holiday name", () => {
      const result = createHolidaySchema.safeParse({
        name: "   ",
        date: "2026-08-15",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("name");
      }
    });

    it("rejects invalid date format", () => {
      const result = createHolidaySchema.safeParse({
        name: "Independence Day",
        date: "15/08/2026",
      });
      expect(result.success).toBe(false);
    });

    it("allows omitting description", () => {
      const result = createHolidaySchema.safeParse({
        name: "Gandhi Jayanti",
        date: "2026-10-02",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateHolidaySchema", () => {
    it("accepts updating just the name", () => {
      const result = updateHolidaySchema.safeParse({
        name: "Revised Holiday Name",
      });
      expect(result.success).toBe(true);
    });

    it("accepts updating just the date", () => {
      const result = updateHolidaySchema.safeParse({
        date: "2026-10-03",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty update when all fields are omitted or blank", () => {
      const result = updateHolidaySchema.safeParse({
        name: "",
        description: "",
        date: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/at least one holiday field/i);
      }
    });
  });
});

