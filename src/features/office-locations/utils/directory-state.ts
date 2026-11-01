import type {
  OfficeLocationSortField,
  OfficeStatus,
} from "@/features/office-locations/types/office-location-types";

type SearchParamsReader = { get(name: string): string | null };

const statuses = new Set<OfficeStatus>(["ACTIVE", "INACTIVE"]);
const limits = new Set([10, 20, 50, 100]);
const sortFields = new Set<OfficeLocationSortField>([
  "locationCode",
  "name",
  "city",
  "status",
  "createdAt",
]);

export type OfficeLocationDirectoryState = {
  page: number;
  limit: number;
  search: string;
  status?: OfficeStatus;
  sortBy: OfficeLocationSortField;
  sortDirection: "asc" | "desc";
};

export function parseOfficeLocationDirectoryState(
  params: SearchParamsReader,
): OfficeLocationDirectoryState {
  const page = Number.parseInt(params.get("page") ?? "0", 10);
  const limit = Number.parseInt(params.get("limit") ?? "20", 10);
  const status = params.get("status") as OfficeStatus | null;
  const sortBy = params.get("sortBy") as OfficeLocationSortField | null;
  const sortDirection = params.get("sortDirection");

  return {
    page: Number.isFinite(page) && page >= 0 ? page : 0,
    limit: limits.has(limit) ? limit : 20,
    search: (params.get("search") ?? "").trim(),
    status: status && statuses.has(status) ? status : undefined,
    sortBy: sortBy && sortFields.has(sortBy) ? sortBy : "createdAt",
    sortDirection: sortDirection === "asc" ? "asc" : "desc",
  };
}

export function updateOfficeLocationSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | number | undefined>,
) {
  const next = new URLSearchParams(current);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, String(value));
  });
  return next;
}

