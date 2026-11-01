"use client";

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShiftEmptyState,
  ShiftErrorState,
} from "@/features/shifts/components/shift-query-state";
import { ShiftStatusBadge } from "@/features/shifts/components/shift-status-badge";
import { useShifts } from "@/features/shifts/hooks/use-shifts";
import type { Shift } from "@/features/shifts/types/shift-types";
import {
  parseShiftDirectoryState,
  updateShiftSearchParams,
} from "@/features/shifts/utils/directory-state";
import { formatShiftTimestamp } from "@/features/shifts/utils/shift-display";
import { getShiftErrorMessage } from "@/features/shifts/utils/shift-errors";
import {
  calculateShiftDurationMinutes,
  formatMinutesDuration,
  formatShiftTimeRange,
  formatWorkingDaysSummary,
  isOvernightShift,
} from "@/features/shifts/utils/time-utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

function RowActions({ shift }: { shift: Shift }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Actions for ${shift.name}`}
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{shift.shiftCode}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/shifts/${shift.id}`}>
            <Eye aria-hidden="true" className="size-4" />
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/shifts/${shift.id}/edit`}>
            <Pencil aria-hidden="true" className="size-4" />
            Edit shift
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DirectorySkeleton() {
  return (
    <div
      aria-label="Loading shifts"
      className="space-y-3 p-4"
      role="status"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div className="flex items-center gap-4" key={index}>
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
          <Skeleton className="hidden h-8 w-24 sm:block" />
        </div>
      ))}
      <span className="sr-only">Loading shift directory...</span>
    </div>
  );
}

export function ShiftDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(
    () => parseShiftDirectoryState(searchParams),
    [searchParams],
  );
  const [search, setSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const query = useShifts({
    page: state.page,
    limit: state.limit,
    search: state.search || undefined,
    status: state.status,
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
  });

  function navigate(updates: Record<string, string | number | undefined>) {
    const next = updateShiftSearchParams(
      new URLSearchParams(searchParams.toString()),
      updates,
    );
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  useEffect(() => {
    if (debouncedSearch !== state.search) {
      navigate({ search: debouncedSearch || undefined, page: 0 });
    }
    // Always merge into the latest URL snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, state.search]);

  const filtered = Boolean(state.search || state.status);
  const data = query.data;
  const sortValue = `${state.sortBy}:${state.sortDirection}`;

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link className={buttonVariants()} href="/admin/shifts/new">
            <Plus aria-hidden="true" className="size-4" />
            Add shift
          </Link>
        }
        description="Configure shift schedules, timing tolerances, break policies, and active work days."
        eyebrow="Workforce"
        title="Shift directory"
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_12rem_13rem_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="shift-search">Search shifts</Label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  className="pl-9"
                  id="shift-search"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Code, name, or description"
                  type="search"
                  value={search}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift-status">Status</Label>
              <Select
                id="shift-status"
                onChange={(event) =>
                  navigate({ status: event.target.value || undefined, page: 0 })
                }
                value={state.status ?? ""}
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift-sort">Sort</Label>
              <Select
                id="shift-sort"
                onChange={(event) => {
                  const [sortBy, sortDirection] = event.target.value.split(":");
                  navigate({ sortBy, sortDirection, page: 0 });
                }}
                value={sortValue}
              >
                <option value="createdAt:desc">Newest first</option>
                <option value="createdAt:asc">Oldest first</option>
                <option value="name:asc">Name A-Z</option>
                <option value="name:desc">Name Z-A</option>
                <option value="shiftCode:asc">Code A-Z</option>
                <option value="startTime:asc">Start time</option>
                <option value="status:asc">Status</option>
              </Select>
            </div>

            <Button
              disabled={!filtered}
              onClick={() => {
                setSearch("");
                navigate({ search: undefined, status: undefined, page: 0 });
              }}
              type="button"
              variant="outline"
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Clear filters
            </Button>
          </div>
        </div>

        {query.isLoading ? (
          <DirectorySkeleton />
        ) : query.isError ? (
          <div className="p-4">
            <ShiftErrorState
              message={getShiftErrorMessage(query.error)}
              retry={() => query.refetch()}
            />
          </div>
        ) : !data?.content.length ? (
          <ShiftEmptyState filtered={filtered} />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift</TableHead>
                    <TableHead>Timings</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Grace & Breaks</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.map((shift) => {
                    const isOvernight = isOvernightShift(
                      shift.startTime,
                      shift.endTime,
                    );
                    const duration = calculateShiftDurationMinutes(
                      shift.startTime,
                      shift.endTime,
                    );
                    return (
                      <TableRow key={shift.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                              <CalendarClock
                                aria-hidden="true"
                                className="size-5"
                              />
                            </span>
                            <div>
                              <Link
                                className="font-semibold hover:text-primary"
                                href={`/admin/shifts/${shift.id}`}
                              >
                                {shift.name}
                              </Link>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-muted-foreground font-mono">
                                  {shift.shiftCode}
                                </span>
                                {isOvernight && (
                                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                                    <Moon aria-hidden="true" className="size-2.5" />
                                    Overnight
                                  </span>
                                )}
                                {shift.flexible && (
                                  <span className="inline-flex items-center gap-0.5 rounded bg-indigo-500/10 px-1.5 py-0.2 text-[10px] font-medium text-indigo-700 dark:text-indigo-400">
                                    <Sparkles aria-hidden="true" className="size-2.5" />
                                    Flex
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm font-medium text-foreground">
                            {formatShiftTimeRange(
                              shift.startTime,
                              shift.endTime,
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatMinutesDuration(duration)} duration
                          </p>
                        </TableCell>

                        <TableCell className="max-w-xs">
                          <p className="text-sm text-foreground">
                            {formatWorkingDaysSummary(shift.workingDays)}
                          </p>
                        </TableCell>

                        <TableCell>
                          <p className="text-sm text-foreground">
                            Grace: {shift.gracePeriodMinutes}m in / {shift.earlyDepartureGraceMinutes}m out
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Break: {shift.expectedBreakMinutes}m
                            {shift.minimumBreakMinutes
                              ? ` (min ${shift.minimumBreakMinutes}m)`
                              : ""}
                          </p>
                        </TableCell>

                        <TableCell>
                          {formatShiftTimestamp(shift.createdAt)}
                        </TableCell>

                        <TableCell>
                          <ShiftStatusBadge status={shift.status} />
                        </TableCell>

                        <TableCell className="text-right">
                          <RowActions shift={shift} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card Layout */}
            <div className="divide-y divide-border md:hidden">
              {data.content.map((shift) => {
                const isOvernight = isOvernightShift(
                  shift.startTime,
                  shift.endTime,
                );
                const duration = calculateShiftDurationMinutes(
                  shift.startTime,
                  shift.endTime,
                );
                return (
                  <article className="p-4" key={shift.id}>
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                        <CalendarClock aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          className="font-semibold text-foreground hover:text-primary"
                          href={`/admin/shifts/${shift.id}`}
                        >
                          {shift.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-muted-foreground font-mono">
                            {shift.shiftCode}
                          </span>
                          {isOvernight && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                              <Moon aria-hidden="true" className="size-2.5" />
                              Overnight
                            </span>
                          )}
                          {shift.flexible && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-indigo-500/10 px-1.5 py-0.2 text-[10px] font-medium text-indigo-700 dark:text-indigo-400">
                              <Sparkles aria-hidden="true" className="size-2.5" />
                              Flex
                            </span>
                          )}
                        </div>
                      </div>
                      <RowActions shift={shift} />
                    </div>

                    <div className="mt-3 text-sm font-medium text-foreground">
                      {formatShiftTimeRange(shift.startTime, shift.endTime)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({formatMinutesDuration(duration)})
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatWorkingDaysSummary(shift.workingDays)}
                    </p>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">Grace</dt>
                        <dd className="font-medium text-foreground">
                          {shift.gracePeriodMinutes}m / {shift.earlyDepartureGraceMinutes}m
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Status</dt>
                        <dd className="mt-1">
                          <ShiftStatusBadge status={shift.status} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Created</dt>
                        <dd>{formatShiftTimestamp(shift.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Updated</dt>
                        <dd>{formatShiftTimestamp(shift.updatedAt)}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {data && data.totalElements > 0 && (
          <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {data.totalElements.toLocaleString()} result
              {data.totalElements === 1 ? "" : "s"} - page {data.page + 1} of{" "}
              {Math.max(data.totalPages, 1)}
            </p>
            <div className="flex items-center gap-2">
              <Label className="sr-only" htmlFor="shift-page-size">
                Results per page
              </Label>
              <Select
                className="w-24"
                id="shift-page-size"
                onChange={(event) =>
                  navigate({ limit: event.target.value, page: 0 })
                }
                value={state.limit}
              >
                {[10, 20, 50, 100].map((limit) => (
                  <option key={limit} value={limit}>
                    {limit} / page
                  </option>
                ))}
              </Select>
              <Button
                aria-label="Previous page"
                disabled={data.first}
                onClick={() => navigate({ page: Math.max(data.page - 1, 0) })}
                size="icon"
                type="button"
                variant="outline"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </Button>
              <Button
                aria-label="Next page"
                disabled={data.last}
                onClick={() => navigate({ page: data.page + 1 })}
                size="icon"
                type="button"
                variant="outline"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {!query.isLoading &&
        !query.isError &&
        data?.totalElements === 0 &&
        !filtered && (
          <Link
            className={cn(buttonVariants(), "mx-auto mt-5 flex w-fit")}
            href="/admin/shifts/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            Create first shift
          </Link>
        )}
    </PageContainer>
  );
}
