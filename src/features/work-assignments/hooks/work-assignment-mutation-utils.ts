import type { QueryClient } from "@tanstack/react-query";

import { workAssignmentKeys } from "@/features/work-assignments/hooks/work-assignment-query-keys";
import type { WorkAssignment } from "@/features/work-assignments/types/work-assignment-types";

export function synchronizeWorkAssignmentQueries(
  queryClient: QueryClient,
  assignment: WorkAssignment,
) {
  queryClient.setQueryData(workAssignmentKeys.detail(assignment.id), assignment);
  void queryClient.invalidateQueries({
    queryKey: workAssignmentKeys.byEmployee(assignment.employeeId),
  });
  void queryClient.invalidateQueries({
    queryKey: workAssignmentKeys.all,
  });
}

