import { z } from "zod";

export const gpsRequestSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90.")
    .max(90, "Latitude must be between -90 and 90."),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180.")
    .max(180, "Longitude must be between -180 and 180."),
  accuracyMeters: z
    .number()
    .positive("Accuracy must be greater than 0.")
    .max(1000, "GPS accuracy exceeds acceptable threshold (1000m)."),
});

export const attendanceCorrectionSchema = z
  .object({
    sessionId: z.string().trim().min(1, "Session is required."),
    correctedCheckInAt: z
      .string()
      .trim()
      .min(1, "Corrected check-in time is required."),
    correctedCheckOutAt: z.string().trim().optional().or(z.literal("")),
    reason: z
      .string()
      .trim()
      .min(1, "Reason is required.")
      .max(1000, "Reason must be 1000 characters or fewer."),
  })
  .superRefine((data, ctx) => {
    if (data.correctedCheckInAt && data.correctedCheckOutAt) {
      const inTime = new Date(data.correctedCheckInAt).getTime();
      const outTime = new Date(data.correctedCheckOutAt).getTime();
      if (Number.isNaN(inTime) || Number.isNaN(outTime)) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid date/time format.",
          path: ["correctedCheckOutAt"],
        });
      } else if (outTime <= inTime) {
        ctx.addIssue({
          code: "custom",
          message: "Check-out time must be strictly after check-in time.",
          path: ["correctedCheckOutAt"],
        });
      }
    }
  });

export type GpsRequestFormValues = z.infer<typeof gpsRequestSchema>;
export type AttendanceCorrectionFormValues = z.infer<
  typeof attendanceCorrectionSchema
>;

export const attendanceCorrectionRequestSchema = z.object({
  attendanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date is required."),
  missingPunch: z.enum(["CHECK_IN", "CHECK_OUT", "BOTH"]),
  requestedCheckInTime: z.string().optional(),
  requestedCheckOutTime: z.string().optional(),
  reason: z.string().trim().min(1, "Reason is required.").max(1000, "Reason must be 1000 characters or fewer."),
}).superRefine((data, ctx) => {
  if ((data.missingPunch === "CHECK_IN" || data.missingPunch === "BOTH") && !data.requestedCheckInTime) ctx.addIssue({ code: "custom", path: ["requestedCheckInTime"], message: "Check-in time is required." });
  if ((data.missingPunch === "CHECK_OUT" || data.missingPunch === "BOTH") && !data.requestedCheckOutTime) ctx.addIssue({ code: "custom", path: ["requestedCheckOutTime"], message: "Check-out time is required." });
  if (data.requestedCheckInTime && data.requestedCheckOutTime && data.requestedCheckOutTime <= data.requestedCheckInTime) ctx.addIssue({ code: "custom", path: ["requestedCheckOutTime"], message: "Check-out must be later than check-in." });
});

export type AttendanceCorrectionRequestFormValues = z.infer<typeof attendanceCorrectionRequestSchema>;
