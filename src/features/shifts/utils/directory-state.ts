import type {
  ShiftSortField,
  ShiftStatus,
} from "@/features/shifts/types/shift-types";

type SearchParamsReader = { get(name: string): string | null };

const statuses = new Set<ShiftStatus>(["ACTIVE", "INACTIVE"]);
const limits = new Set([10, 20, 50, 100]);
const sortFields = new Set<ShiftSortField>([
  "shiftCode",
  "name",
  "status",
  "startTime",
  "createdAt",
]);

export type ShiftDirectoryState = {
  page: number;
  limit: number;
  search: string;
  status?: ShiftStatus;
  sortBy: ShiftSortField;
  sortDirection: "asc" | "desc";
};

export function parseShiftDirectoryState(
  params: SearchParamsReader,
): ShiftDirectoryState {
  const page = Number.parseInt(params.get("page") ?? "0", 10);
  const limit = Number.parseInt(params.get("limit") ?? "20", 10);
  const status = params.get("status") as ShiftStatus | null;
  const sortBy = params.get("sortBy") as ShiftSortField | null;
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

export function updateShiftSearchParams(
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

