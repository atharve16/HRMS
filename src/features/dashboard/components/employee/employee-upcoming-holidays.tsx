import { ArrowRight, CalendarDays, PartyPopper } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { useEmployeeDashboard } from "@/features/dashboard/hooks/use-employee-dashboard";
import { formatDateShort, formatDayOfWeek } from "@/features/dashboard/utils/dashboard-time";
import { cn } from "@/lib/utils";

type EmployeeUpcomingHolidaysProps = {
  dashboard: ReturnType<typeof useEmployeeDashboard>;
};

export function EmployeeUpcomingHolidays({ dashboard }: EmployeeUpcomingHolidaysProps) {
  const { upcomingHolidaysQuery } = dashboard;
  const holidays = upcomingHolidaysQuery.data ?? [];
  const isLoading = upcomingHolidaysQuery.isLoading;
  const isError = upcomingHolidaysQuery.isError;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Upcoming holidays</CardTitle>
          <CardDescription>Upcoming official company closures and holidays.</CardDescription>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
          href="/employee/holidays"
        >
          View calendar
          <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="text-xs text-destructive">Failed to load holidays.</p>
        ) : holidays.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            <PartyPopper aria-hidden="true" className="mx-auto size-6 text-muted-foreground/60 mb-2" />
            <p className="font-medium text-foreground">No upcoming holidays</p>
            <p className="mt-1">Check back later for updated company announcements.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {holidays.slice(0, 5).map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground text-sm">{holiday.name}</p>
                  <p className="text-xs text-muted-foreground">{holiday.description || "Company holiday"}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 font-medium text-xs text-primary">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    {formatDateShort(holiday.date)}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{formatDayOfWeek(holiday.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

