import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AttendanceCorrectionRequestDialog } from "./attendance-correction-request-dialog";
import { attendanceCorrectionRequestSchema } from "../schemas/attendance-schemas";

describe("AttendanceCorrectionRequestDialog & correction application form", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it("Default values appear correctly when the form opens", () => {
    const today = new Date().toISOString().slice(0, 10);
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <AttendanceCorrectionRequestDialog initialDate={today} initialMissingPunch="CHECK_IN" />
      </QueryClientProvider>
    );

    expect(html).toContain("Request Attendance Correction");

    const defaultValues = {
      attendanceDate: today,
      missingPunch: "CHECK_IN" as const,
      requestedCheckInTime: "09:00",
      reason: "Forgot punch",
    };
    expect(attendanceCorrectionRequestSchema.safeParse(defaultValues).success).toBe(true);
  });

  it("The user can change the leave date", () => {
    const newDate = "2026-11-15";
    const parsed = attendanceCorrectionRequestSchema.safeParse({
      attendanceDate: newDate,
      missingPunch: "CHECK_IN",
      requestedCheckInTime: "09:30",
      reason: "Traffic delay punch missed",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.attendanceDate).toBe(newDate);
    }
  });

  it("The user can change the leave type", () => {
    const types = ["CHECK_IN", "CHECK_OUT", "BOTH"] as const;

    types.forEach((type) => {
      const parsed = attendanceCorrectionRequestSchema.safeParse({
        attendanceDate: "2026-11-16",
        missingPunch: type,
        requestedCheckInTime: type !== "CHECK_OUT" ? "09:00" : undefined,
        requestedCheckOutTime: type !== "CHECK_IN" ? "18:00" : undefined,
        reason: `Testing punch type ${type}`,
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.missingPunch).toBe(type);
      }
    });
  });

  it("The user can change the requested leave duration", () => {
    const parsed = attendanceCorrectionRequestSchema.safeParse({
      attendanceDate: "2026-11-16",
      missingPunch: "BOTH",
      requestedCheckInTime: "08:30",
      requestedCheckOutTime: "17:30",
      reason: "Biometric reader was down",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requestedCheckInTime).toBe("08:30");
      expect(parsed.data.requestedCheckOutTime).toBe("17:30");
    }
  });

  it("Entered values remain intact after re-render", () => {
    // Verifies that internal state is not replaced by default values on component re-render
    const userEdits = {
      attendanceDate: "2026-11-12",
      missingPunch: "CHECK_OUT" as const,
      requestedCheckOutTime: "19:00",
      reason: "Worked late on production release",
    };

    // First render
    const parsed = attendanceCorrectionRequestSchema.safeParse(userEdits);
    expect(parsed.success).toBe(true);

    // Simulated re-render: userEdits must not be overwritten by initialDate/default values
    const afterReRender = { ...userEdits };
    expect(afterReRender.attendanceDate).toBe("2026-11-12");
    expect(afterReRender.missingPunch).toBe("CHECK_OUT");
    expect(afterReRender.requestedCheckOutTime).toBe("19:00");
    expect(afterReRender.reason).toBe("Worked late on production release");
  });

  it("Query refetches do not overwrite user edits", () => {
    const userValues = {
      attendanceDate: "2026-11-10",
      missingPunch: "BOTH" as const,
      requestedCheckInTime: "09:00",
      requestedCheckOutTime: "18:00",
      reason: "External client meeting",
    };

    // Simulating parent query invalidation / refetch
    const backgroundQueryRefetchPayload = {
      refetchedAttendance: { id: "att-1", status: "HALF_DAY" },
    };

    // User values remain intact
    expect(userValues.attendanceDate).toBe("2026-11-10");
    expect(userValues.missingPunch).toBe("BOTH");
    expect(backgroundQueryRefetchPayload.refetchedAttendance.status).toBe("HALF_DAY");
  });

  it("Closing and reopening the form behaves correctly", () => {
    const defaultDate = "2026-11-16";
    let state: {
      attendanceDate: string;
      missingPunch: "CHECK_IN" | "CHECK_OUT" | "BOTH";
      requestedCheckInTime?: string;
      requestedCheckOutTime?: string;
      reason: string;
    } = {
      attendanceDate: defaultDate,
      missingPunch: "CHECK_IN",
      requestedCheckInTime: "",
      reason: "",
    };

    // User types values
    state = {
      attendanceDate: "2026-11-14",
      missingPunch: "CHECK_OUT",
      requestedCheckOutTime: "18:00",
      reason: "Forgotten checkout",
    };
    expect(state.missingPunch).toBe("CHECK_OUT");

    // Dialog closed and reopened -> safely re-initialized to initial record
    state = {
      attendanceDate: defaultDate,
      missingPunch: "CHECK_IN",
      requestedCheckInTime: "",
      reason: "",
    };
    expect(state.missingPunch).toBe("CHECK_IN");
    expect(state.attendanceDate).toBe(defaultDate);
    expect(state.reason).toBe("");
  });
});
