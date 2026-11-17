import { describe, expect, it } from "vitest";
import { attendanceCorrectionRequestSchema } from "@/features/attendance/schemas/attendance-schemas";

describe("attendance correction request schema", () => {
  it("requires only the relevant punch times", () => {
    expect(attendanceCorrectionRequestSchema.safeParse({ attendanceDate: "2026-11-14", missingPunch: "CHECK_IN", requestedCheckInTime: "09:15", reason: "Forgot to check in" }).success).toBe(true);
    expect(attendanceCorrectionRequestSchema.safeParse({ attendanceDate: "2026-11-14", missingPunch: "CHECK_OUT", requestedCheckOutTime: "18:30", reason: "Forgot to check out" }).success).toBe(true);
  });

  it("rejects missing or reversed times", () => {
    const missing = attendanceCorrectionRequestSchema.safeParse({ attendanceDate: "2026-11-14", missingPunch: "BOTH", reason: "Forgot both" });
    expect(missing.success).toBe(false);
    const reversed = attendanceCorrectionRequestSchema.safeParse({ attendanceDate: "2026-11-14", missingPunch: "BOTH", requestedCheckInTime: "18:30", requestedCheckOutTime: "09:15", reason: "Forgot both" });
    expect(reversed.success).toBe(false);
  });
});
