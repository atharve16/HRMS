import type { EmploymentStatus } from "@/features/employees/types/employee-types";

type SearchParamsReader = { get(name: string): string | null };

const allowedStatuses = new Set<EmploymentStatus>([
  "ACTIVE",
  "INACTIVE",
  "TERMINATED",
]);
const allowedLimits = new Set([10, 20, 50, 100]);

export type EmployeeDirectoryState = {
  page: number;
  limit: number;
  search: string;
  employmentStatus?: EmploymentStatus;
  departmentId?: string;
};

export function parseEmployeeDirectoryState(
  params: SearchParamsReader,
): EmployeeDirectoryState {
  const pageValue = Number.parseInt(params.get("page") ?? "0", 10);
  const limitValue = Number.parseInt(params.get("limit") ?? "20", 10);
  const status = params.get("status") as EmploymentStatus | null;
  return {
    page: Number.isFinite(pageValue) && pageValue >= 0 ? pageValue : 0,
    limit: allowedLimits.has(limitValue) ? limitValue : 20,
    search: (params.get("search") ?? "").trim(),
    employmentStatus: status && allowedStatuses.has(status) ? status : undefined,
    departmentId: params.get("department") || undefined,
  };
}

export function updateDirectorySearchParams(
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
