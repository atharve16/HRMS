import { DeactivateHolidayDialog } from "@/features/holidays/components/deactivate-holiday-dialog";
import { EditHolidayDialog } from "@/features/holidays/components/edit-holiday-dialog";
import { HolidayStatusBadge } from "@/features/holidays/components/holiday-status-badge";
import type { AdminHolidayResponse } from "@/features/holidays/types/holiday-types";
import { formatHolidayDate } from "@/features/holidays/utils/holiday-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function HolidayTable({
  holidays,
}: {
  holidays: AdminHolidayResponse[];
}) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Holiday name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holidays.map((holiday) => (
            <TableRow key={holiday.id}>
              <TableCell className="font-semibold text-foreground whitespace-nowrap">
                {formatHolidayDate(holiday.date)}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {holiday.name}
              </TableCell>
              <TableCell className="max-w-[280px] truncate text-muted-foreground">
                {holiday.description || "—"}
              </TableCell>
              <TableCell>
                <HolidayStatusBadge active={holiday.active} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <EditHolidayDialog holiday={holiday} />
                  {holiday.active && (
                    <DeactivateHolidayDialog holiday={holiday} />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

