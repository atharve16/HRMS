import type { ShiftListParams } from "@/features/shifts/types/shift-types";

export const shiftKeys = {
  all: ["shifts"] as const,
  lists: () => [...shiftKeys.all, "list"] as const,
  list: (params: ShiftListParams) => [...shiftKeys.lists(), params] as const,
  details: () => [...shiftKeys.all, "detail"] as const,
  detail: (shiftId: string) => [...shiftKeys.details(), shiftId] as const,
  options: () => [...shiftKeys.all, "options"] as const,
};

