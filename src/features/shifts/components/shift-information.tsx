import {
  CalendarClock,
  Clock,
  Hourglass,
  Moon,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShiftStatusBadge } from "@/features/shifts/components/shift-status-badge";
import type { Shift } from "@/features/shifts/types/shift-types";
import { formatShiftTimestamp } from "@/features/shifts/utils/shift-display";
import {
  ALL_DAYS_OF_WEEK,
  calculateShiftDurationMinutes,
  dayOfWeekLabels,
  formatMinutesDuration,
  formatShiftTimeRange,
  formatTimeDisplay,
  formatWorkingDaysSummary,
  isOvernightShift,
} from "@/features/shifts/utils/time-utils";

function Value({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-foreground">
        {value !== undefined && value !== null && value !== ""
          ? String(value)
          : "Not configured"}
      </dd>
    </div>
  );
}

export function ShiftInformation({ shift }: { shift: Shift }) {
  const isOvernight = isOvernightShift(shift.startTime, shift.endTime);
  const durationMinutes = calculateShiftDurationMinutes(
    shift.startTime,
    shift.endTime,
  );
  const workingDaysSet = new Set(shift.workingDays);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <CalendarClock aria-hidden="true" className="size-8" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold">{shift.name}</h2>
              <ShiftStatusBadge status={shift.status} />
              {isOvernight && (
                <Badge className="gap-1 border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400" variant="neutral">
                  <Moon aria-hidden="true" className="size-3" />
                  Overnight Shift
                </Badge>
              )}
              {shift.flexible && (
                <Badge className="gap-1 border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" variant="neutral">
                  <Zap aria-hidden="true" className="size-3" />
                  Flexible Hours
                </Badge>
              )}
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">
              {shift.shiftCode}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatShiftTimeRange(shift.startTime, shift.endTime)} ({formatMinutesDuration(durationMinutes)}) • {formatWorkingDaysSummary(shift.workingDays)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Timing and Working Days */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock aria-hidden="true" className="size-5 text-primary" />
              Timing & Work Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Value
                label="Start time"
                value={`${formatTimeDisplay(shift.startTime)} (${shift.startTime})`}
              />
              <Value
                label="End time"
                value={`${formatTimeDisplay(shift.endTime)} (${shift.endTime})`}
              />
              <Value
                label="Gross scheduled duration"
                value={`${formatMinutesDuration(durationMinutes)} (${durationMinutes} mins)`}
              />
              <Value
                label="Schedule type"
                value={shift.flexible ? "Flexible attendance" : "Fixed schedule"}
              />
            </dl>

            {isOvernight && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-300">
                <p className="font-semibold flex items-center gap-1.5">
                  <Moon aria-hidden="true" className="size-3.5" />
                  Overnight Shift Window
                </p>
                <p className="mt-1">
                  This shift begins at {formatTimeDisplay(shift.startTime)} and ends the next calendar day at {formatTimeDisplay(shift.endTime)}.
                </p>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Scheduled Working Days
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ALL_DAYS_OF_WEEK.map((day) => {
                  const active = workingDaysSet.has(day);
                  return (
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                        active
                          ? "bg-primary-soft text-primary font-semibold ring-1 ring-inset ring-primary/20"
                          : "bg-muted/40 text-muted-foreground/60 line-through"
                      }`}
                      key={day}
                    >
                      {dayOfWeekLabels[day].short}
                    </span>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grace Periods & Break Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hourglass aria-hidden="true" className="size-5 text-primary" />
              Grace Periods & Breaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Value
                label="Check-in grace period"
                value={`${shift.gracePeriodMinutes} minutes`}
              />
              <Value
                label="Early departure grace"
                value={`${shift.earlyDepartureGraceMinutes} minutes`}
              />
              <Value
                label="Expected break duration"
                value={`${shift.expectedBreakMinutes} minutes (${formatMinutesDuration(shift.expectedBreakMinutes)})`}
              />
              <Value
                label="Minimum break required"
                value={
                  shift.minimumBreakMinutes !== undefined &&
                  shift.minimumBreakMinutes !== null
                    ? `${shift.minimumBreakMinutes} minutes`
                    : "Not specified"
                }
              />
            </dl>

            <div className="mt-5 border-t border-border pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {shift.description || "No description provided."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Record Metadata */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
              Record Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
              <Value label="Shift ID" value={shift.id} />
              <Value label="Status" value={shift.status} />
              <Value
                label="Created"
                value={formatShiftTimestamp(shift.createdAt)}
              />
              <Value
                label="Last updated"
                value={formatShiftTimestamp(shift.updatedAt)}
              />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
