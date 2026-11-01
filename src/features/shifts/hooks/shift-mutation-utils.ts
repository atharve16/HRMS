import type { QueryClient } from "@tanstack/react-query";

import { shiftKeys } from "@/features/shifts/hooks/shift-query-keys";
import type { Shift } from "@/features/shifts/types/shift-types";

export function synchronizeShiftQueries(
  queryClient: QueryClient,
  shift: Shift,
) {
  queryClient.setQueryData(shiftKeys.detail(shift.id), shift);
  void queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: shiftKeys.options() });
}

