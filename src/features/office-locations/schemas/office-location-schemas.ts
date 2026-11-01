import { z } from "zod";

import {
  isValidLatitude,
  isValidLongitude,
} from "@/features/office-locations/utils/geo-utils";

export const locationCodePattern = /^[A-Za-z0-9_-]{2,20}$/;

export const officeLocationFormSchema = z.object({
  locationCode: z
    .string()
    .trim()
    .min(1, "Location code is required.")
    .regex(
      locationCodePattern,
      "Use 2-20 letters, numbers, underscores, or hyphens.",
    ),
  name: z
    .string()
    .trim()
    .min(1, "Location name is required.")
    .max(120, "Location name cannot exceed 120 characters."),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1,000 characters."),
  addressLine1: z
    .string()
    .trim()
    .min(1, "Address line 1 is required."),
  addressLine2: z.string().trim(),
  city: z.string().trim().min(1, "City is required."),
  state: z.string().trim().min(1, "State / Province is required."),
  postalCode: z.string().trim().min(1, "Postal code is required."),
  country: z.string().trim().min(1, "Country is required."),
  latitude: z
    .string()
    .trim()
    .min(1, "Latitude is required.")
    .refine((val) => {
      const num = Number(val);
      return !Number.isNaN(num) && isValidLatitude(num);
    }, "Latitude must be a valid number between -90.0 and 90.0."),
  longitude: z
    .string()
    .trim()
    .min(1, "Longitude is required.")
    .refine((val) => {
      const num = Number(val);
      return !Number.isNaN(num) && isValidLongitude(num);
    }, "Longitude must be a valid number between -180.0 and 180.0."),
  geofenceRadiusMeters: z
    .string()
    .trim()
    .refine((val) => {
      if (!val) return true;
      const num = Number(val);
      return Number.isFinite(num) && num > 0 && num <= 10000;
    }, "Geofence radius must be a positive number up to 10,000 meters."),
  maximumGpsAccuracyMeters: z
    .string()
    .trim()
    .refine((val) => {
      if (!val) return true;
      const num = Number(val);
      return Number.isFinite(num) && num > 0 && num <= 1000;
    }, "Maximum GPS accuracy must be a positive number up to 1,000 meters."),
});

export type OfficeLocationFormValues = z.input<typeof officeLocationFormSchema>;

