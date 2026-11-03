import { Card, CardContent } from "@/components/ui/card";
import { DeactivateHolidayDialog } from "@/features/holidays/components/deactivate-holiday-dialog";
import { EditHolidayDialog } from "@/features/holidays/components/edit-holiday-dialog";
import { HolidayStatusBadge } from "@/features/holidays/components/holiday-status-badge";
import type { AdminHolidayResponse } from "@/features/holidays/types/holiday-types";
import { formatHolidayDate } from "@/features/holidays/utils/holiday-display";

export function HolidayCard({
  holiday,
}: {
  holiday: AdminHolidayResponse;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">{holiday.name}</h3>
            <p className="text-xs font-medium text-muted-foreground">
              {formatHolidayDate(holiday.date)}
            </p>
          </div>
          <HolidayStatusBadge active={holiday.active} />
        </div>

        {holiday.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {holiday.description}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t pt-3">
          <EditHolidayDialog holiday={holiday} />
          {holiday.active && <DeactivateHolidayDialog holiday={holiday} />}
        </div>
      </CardContent>
    </Card>
  );
}

