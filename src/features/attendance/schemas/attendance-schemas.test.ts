import { describe, expect, it } from "vitest";

import {
  attendanceCorrectionSchema,
  gpsRequestSchema,
} from "@/features/attendance/schemas/attendance-schemas";

describe("attendance validation schemas", () => {
  describe("gpsRequestSchema", () => {
    it("accepts valid GPS coordinates and accuracy", () => {
      const valid = { latitude: 12.9716, longitude: 77.5946, accuracyMeters: 15 };
      expect(gpsRequestSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects invalid latitude and longitude bounds", () => {
      expect(
        gpsRequestSchema.safeParse({
          latitude: 95,
          longitude: 77,
          accuracyMeters: 10,
        }).success,
      ).toBe(false);

      expect(
        gpsRequestSchema.safeParse({
          latitude: 12,
          longitude: 190,
          accuracyMeters: 10,
        }).success,
      ).toBe(false);

      expect(
        gpsRequestSchema.safeParse({
          latitude: 12,
          longitude: 77,
          accuracyMeters: -5,
        }).success,
      ).toBe(false);
    });
  });

  describe("attendanceCorrectionSchema", () => {
    it("accepts valid session correction with check-out after check-in", () => {
      const valid = {
        sessionId: "sess-1",
        correctedCheckInAt: "2026-11-02T09:00:00Z",
        correctedCheckOutAt: "2026-11-02T17:00:00Z",
        reason: "Admin manual correction for missed punch",
      };
      expect(attendanceCorrectionSchema.safeParse(valid).success).toBe(true);
    });

    it("accepts open session correction without check-out time", () => {
      const validOpen = {
        sessionId: "sess-1",
        correctedCheckInAt: "2026-11-02T09:00:00Z",
        correctedCheckOutAt: "",
        reason: "Corrected punch in time",
      };
      expect(attendanceCorrectionSchema.safeParse(validOpen).success).toBe(true);
    });

    it("rejects check-out before or equal to check-in", () => {
      const invalidTime = {
        sessionId: "sess-1",
        correctedCheckInAt: "2026-11-02T17:00:00Z",
        correctedCheckOutAt: "2026-11-02T09:00:00Z",
        reason: "Valid reason",
      };
      const result = attendanceCorrectionSchema.safeParse(invalidTime);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "Check-out time must be strictly after check-in time",
        );
      }
    });

    it("requires reason", () => {
      const noReason = {
        sessionId: "sess-1",
        correctedCheckInAt: "2026-11-02T09:00:00Z",
        correctedCheckOutAt: "2026-11-02T17:00:00Z",
        reason: "",
      };
      expect(attendanceCorrectionSchema.safeParse(noReason).success).toBe(false);
    });
  });
});

