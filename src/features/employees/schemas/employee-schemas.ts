import { z } from "zod";

const phonePattern = /^$|\+?[0-9]{10,15}$/;
const requiredPhonePattern = /^\+?[0-9]{10,15}$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum, `Must be ${maximum} characters or fewer.`);

const employeeFormBase = z
  .object({
    firstName: z.string().trim().min(1, "First name is required.").max(80),
    lastName: z.string().trim().min(1, "Last name is required.").max(80),
    email: z.string().trim().min(1, "Email is required.").max(254).email(),
    phone: optionalText(16).regex(phonePattern, "Use 10–15 digits with an optional leading +."),
    dateOfBirth: z.string(),
    gender: z.enum(["", "MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]),
    profileImageUrl: optionalText(500),
    addressLine1: optionalText(200),
    addressLine2: optionalText(200),
    city: optionalText(100),
    state: optionalText(100),
    postalCode: optionalText(20),
    country: optionalText(100),
    designation: optionalText(120),
    departmentId: optionalText(100),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]),
    joiningDate: z.string(),
    reportingManagerId: optionalText(100),
    workLocation: optionalText(150),
    emergencyName: optionalText(150),
    emergencyRelationship: optionalText(80),
    emergencyPhone: optionalText(16),
    terminationDate: z.string(),
  })
  .superRefine((values, context) => {
    if (values.dateOfBirth) {
      if (!isoDatePattern.test(values.dateOfBirth)) {
        context.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Enter a valid date." });
      } else if (new Date(`${values.dateOfBirth}T00:00:00Z`) >= new Date()) {
        context.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Date of birth must be in the past." });
      }
    }

    const addressStarted = [
      values.addressLine1,
      values.addressLine2,
      values.city,
      values.state,
      values.postalCode,
      values.country,
    ].some(Boolean);
    if (addressStarted) {
      (["addressLine1", "city", "state", "postalCode", "country"] as const).forEach(
        (field) => {
          if (!values[field]) {
            context.addIssue({ code: "custom", path: [field], message: "Complete this address field." });
          }
        },
      );
    }

    const emergencyStarted = [
      values.emergencyName,
      values.emergencyRelationship,
      values.emergencyPhone,
    ].some(Boolean);
    if (emergencyStarted) {
      if (!values.emergencyName) {
        context.addIssue({ code: "custom", path: ["emergencyName"], message: "Contact name is required." });
      }
      if (!values.emergencyRelationship) {
        context.addIssue({ code: "custom", path: ["emergencyRelationship"], message: "Relationship is required." });
      }
      if (!requiredPhonePattern.test(values.emergencyPhone)) {
        context.addIssue({ code: "custom", path: ["emergencyPhone"], message: "Use 10–15 digits with an optional leading +." });
      }
    }
  });

export const createEmployeeSchema = employeeFormBase.superRefine((values, context) => {
  if (!values.joiningDate || !isoDatePattern.test(values.joiningDate)) {
    context.addIssue({ code: "custom", path: ["joiningDate"], message: "Joining date is required." });
  }
});

export const updateEmployeeSchema = employeeFormBase.superRefine((values, context) => {
  if (values.terminationDate && !isoDatePattern.test(values.terminationDate)) {
    context.addIssue({ code: "custom", path: ["terminationDate"], message: "Enter a valid termination date." });
  }
  if (
    values.terminationDate &&
    values.joiningDate &&
    values.terminationDate < values.joiningDate
  ) {
    context.addIssue({
      code: "custom",
      path: ["terminationDate"],
      message: "Termination date cannot be earlier than joining date.",
    });
  }
});

export type EmployeeFormValues = z.input<typeof employeeFormBase>;
