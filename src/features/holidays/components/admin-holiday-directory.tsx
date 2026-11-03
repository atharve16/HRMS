"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CreateHolidayDialog } from "@/features/holidays/components/create-holiday-dialog";
import { HolidayCard } from "@/features/holidays/components/holiday-card";
import {
  HolidayEmptyState,
  HolidayErrorState,
  HolidaySkeleton,
} from "@/features/holidays/components/holiday-query-state";
import { HolidayTable } from "@/features/holidays/components/holiday-table";
import { useAdminHolidays } from "@/features/holidays/hooks/use-holidays";
import type { HolidaySearchParams } from "@/features/holidays/types/holiday-types";
import { getHolidayErrorMessage } from "@/features/holidays/utils/holiday-errors";

export function AdminHolidayDirectory() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | "">(currentYear);
  const [active, setActive] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const limit = 20;

  const searchParams: HolidaySearchParams = {
    year: year !== "" ? Number(year) : undefined,
    active: active === "true" ? true : active === "false" ? false : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    sortDirection,
    page,
    limit,
  };

  const holidaysQuery = useAdminHolidays(searchParams);

  const handleResetFilters = () => {
    setYear(currentYear);
    setActive("");
    setFromDate("");
    setToDate("");
    setSortDirection("asc");
    setPage(0);
  };

  const pageData = holidaysQuery.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Company Holidays"
          description="Declare and manage company-wide paid holidays. Active holidays are excluded from leave calculations."
          actions={<CreateHolidayDialog />}
        />

        {/* Filters Card */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-1">
                <Label htmlFor="holidayYearFilter" className="text-xs">
                  Year
                </Label>
                <Select
                  id="holidayYearFilter"
                  value={String(year)}
                  onChange={(e) => {
                    setYear(e.target.value === "" ? "" : Number(e.target.value));
                    setPage(0);
                  }}
                >
                  <option value="">All Years</option>
                  {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(
                    (yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ),
                  )}
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="holidayStatusFilter" className="text-xs">
                  Status
                </Label>
                <Select
                  id="holidayStatusFilter"
                  value={active}
                  onChange={(e) => {
                    setActive(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="holidayFromDate" className="text-xs">
                  From date
                </Label>
                <Input
                  id="holidayFromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="holidayToDate" className="text-xs">
                  To date
                </Label>
                <Input
                  id="holidayToDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="holidaySortDirection" className="text-xs">
                  Sort
                </Label>
                <Select
                  id="holidaySortDirection"
                  value={sortDirection}
                  onChange={(e) => {
                    setSortDirection(e.target.value as "asc" | "desc");
                    setPage(0);
                  }}
                >
                  <option value="asc">Earliest date first</option>
                  <option value="desc">Latest date first</option>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResetFilters}
                >
                  <RotateCcw className="mr-1.5 size-3.5" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Directory Content */}
        {holidaysQuery.isLoading ? (
          <HolidaySkeleton />
        ) : holidaysQuery.isError ? (
          <HolidayErrorState
            message={getHolidayErrorMessage(holidaysQuery.error)}
            retry={() => holidaysQuery.refetch()}
          />
        ) : !pageData || pageData.content.length === 0 ? (
          <HolidayEmptyState
            title="No holidays found"
            description="No company holidays match the selected criteria."
            action={<CreateHolidayDialog />}
          />
        ) : (
          <div className="space-y-4">
            <div className="hidden md:block">
              <HolidayTable holidays={pageData.content} />
            </div>

            <div className="space-y-3 md:hidden">
              {pageData.content.map((holiday) => (
                <HolidayCard key={holiday.id} holiday={holiday} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {pageData.content.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {pageData.totalElements}
                </span>{" "}
                holidays (Page {pageData.page + 1} of{" "}
                {Math.max(pageData.totalPages, 1)})
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={pageData.first || page === 0}
                >
                  <ChevronLeft className="mr-1 size-3.5" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={pageData.last || page + 1 >= pageData.totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

