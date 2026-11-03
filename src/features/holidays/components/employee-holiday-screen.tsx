"use client";

import { Calendar, Sparkles } from "lucide-react";
import { useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  HolidayEmptyState,
  HolidayErrorState,
  HolidaySkeleton,
} from "@/features/holidays/components/holiday-query-state";
import {
  useEmployeeHolidays,
  useUpcomingHolidays,
} from "@/features/holidays/hooks/use-holidays";
import {
  formatHolidayDayNumber,
  formatHolidayWeekday,
  groupHolidaysByMonth,
  isPastHoliday,
} from "@/features/holidays/utils/holiday-display";
import { getHolidayErrorMessage } from "@/features/holidays/utils/holiday-errors";

export function EmployeeHolidayScreen() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const upcomingQuery = useUpcomingHolidays();
  const holidaysQuery = useEmployeeHolidays({ year: selectedYear });

  const upcomingHolidays = upcomingQuery.data || [];
  const holidays = holidaysQuery.data || [];
  const groupedByMonth = groupHolidaysByMonth(holidays);

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Company Holidays"
          description="View official paid company holidays. Holidays are excluded from leave calculations."
          actions={
            <div className="flex items-center gap-2">
              <Select
                value={String(selectedYear)}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-32"
                aria-label="Filter holidays by year"
              >
                {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(
                  (yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ),
                )}
              </Select>
            </div>
          }
        />

        {/* Upcoming Holidays Highlight */}
        {upcomingHolidays.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              Upcoming Holidays
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingHolidays.slice(0, 3).map((holiday) => (
                <Card
                  key={holiday.id}
                  className="relative overflow-hidden border-primary/20 bg-primary/5 transition-shadow hover:shadow-md"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-card border shadow-xs text-center">
                      <span className="text-[10px] font-bold uppercase text-primary">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                        }).format(new Date(holiday.date + "T00:00:00"))}
                      </span>
                      <span className="text-xl font-extrabold text-foreground leading-none">
                        {formatHolidayDayNumber(holiday.date)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-foreground">
                        {holiday.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatHolidayWeekday(holiday.date)} •{" "}
                        <span className="text-primary font-medium">Paid off</span>
                      </p>
                      {holiday.description && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {holiday.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Holidays by Month */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              Calendar for {selectedYear}
            </h2>
            <span className="text-xs text-muted-foreground">
              {holidays.length} {holidays.length === 1 ? "holiday" : "holidays"}{" "}
              scheduled
            </span>
          </div>

          {holidaysQuery.isLoading ? (
            <HolidaySkeleton />
          ) : holidaysQuery.isError ? (
            <HolidayErrorState
              message={getHolidayErrorMessage(holidaysQuery.error)}
              retry={() => holidaysQuery.refetch()}
            />
          ) : holidays.length === 0 ? (
            <HolidayEmptyState
              title={`No holidays scheduled for ${selectedYear}`}
              description="No active company holidays have been declared for this calendar year yet."
            />
          ) : (
            <div className="space-y-6">
              {groupedByMonth.map((group) => (
                <div key={group.monthYear} className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.monthYear}
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.holidays.map((holiday) => {
                      const isPast = isPastHoliday(holiday.date);

                      return (
                        <Card
                          key={holiday.id}
                          className={`transition-shadow hover:shadow-xs ${
                            isPast ? "opacity-70 bg-card/60" : "bg-card"
                          }`}
                        >
                          <CardContent className="flex items-start gap-3.5 p-4">
                            <div
                              className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border text-center ${
                                isPast
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-primary-soft text-primary"
                              }`}
                            >
                              <span className="text-[9px] font-bold uppercase">
                                {new Intl.DateTimeFormat("en-US", {
                                  month: "short",
                                }).format(new Date(holiday.date + "T00:00:00"))}
                              </span>
                              <span className="text-lg font-bold leading-none">
                                {formatHolidayDayNumber(holiday.date)}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="truncate font-semibold text-foreground">
                                  {holiday.name}
                                </h4>
                                <Badge
                                  variant={isPast ? "neutral" : "success"}
                                  className="text-[10px]"
                                >
                                  {isPast ? "Passed" : "Upcoming"}
                                </Badge>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                {formatHolidayWeekday(holiday.date)}
                              </p>

                              {holiday.description && (
                                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                                  {holiday.description}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

