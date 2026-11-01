import type {
  OfficeLocation,
  OfficeStatus,
} from "@/features/office-locations/types/office-location-types";

export const officeStatusLabels: Record<OfficeStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export function formatOfficeLocationTimestamp(value?: string) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatOfficeLocationAddress(
  office: Pick<
    OfficeLocation,
    "addressLine1" | "addressLine2" | "city" | "state" | "postalCode" | "country"
  >,
): string {
  const parts = [
    office.addressLine1,
    office.addressLine2,
    `${office.city}, ${office.state} ${office.postalCode}`.trim(),
    office.country,
  ].filter(Boolean);
  return parts.join(", ");
}

