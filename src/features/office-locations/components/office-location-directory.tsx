"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
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
  OfficeLocationEmptyState,
  OfficeLocationErrorState,
} from "@/features/office-locations/components/office-location-query-state";
import { OfficeLocationStatusBadge } from "@/features/office-locations/components/office-location-status-badge";
import { useOfficeLocations } from "@/features/office-locations/hooks/use-office-locations";
import type { OfficeLocation } from "@/features/office-locations/types/office-location-types";
import {
  parseOfficeLocationDirectoryState,
  updateOfficeLocationSearchParams,
} from "@/features/office-locations/utils/directory-state";
import { formatCoordinatesDisplay } from "@/features/office-locations/utils/geo-utils";
import {
  formatOfficeLocationAddress,
  formatOfficeLocationTimestamp,
} from "@/features/office-locations/utils/office-location-display";
import { getOfficeLocationErrorMessage } from "@/features/office-locations/utils/office-location-errors";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

function RowActions({ officeLocation }: { officeLocation: OfficeLocation }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Actions for ${officeLocation.name}`}
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{officeLocation.locationCode}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/office-locations/${officeLocation.id}`}>
            <Eye aria-hidden="true" className="size-4" />
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/office-locations/${officeLocation.id}/edit`}>
            <Pencil aria-hidden="true" className="size-4" />
            Edit location
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DirectorySkeleton() {
  return (
    <div
      aria-label="Loading office locations"
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
      <span className="sr-only">Loading office location directory...</span>
    </div>
  );
}

export function OfficeLocationDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(
    () => parseOfficeLocationDirectoryState(searchParams),
    [searchParams],
  );
  const [search, setSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const query = useOfficeLocations({
    page: state.page,
    limit: state.limit,
    search: state.search || undefined,
    status: state.status,
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
  });

  function navigate(updates: Record<string, string | number | undefined>) {
    const next = updateOfficeLocationSearchParams(
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
          <Link
            className={buttonVariants()}
            href="/admin/office-locations/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add office location
          </Link>
        }
        description="Manage physical office locations, geofence perimeters, and GPS attendance requirements."
        eyebrow="Workplaces"
        title="Office location directory"
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_12rem_13rem_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="office-search">Search locations</Label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  className="pl-9"
                  id="office-search"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Code, name, or city"
                  type="search"
                  value={search}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="office-status">Status</Label>
              <Select
                id="office-status"
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
              <Label htmlFor="office-sort">Sort</Label>
              <Select
                id="office-sort"
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
                <option value="locationCode:asc">Code A-Z</option>
                <option value="city:asc">City A-Z</option>
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
            <OfficeLocationErrorState
              message={getOfficeLocationErrorMessage(query.error)}
              retry={() => query.refetch()}
            />
          </div>
        ) : !data?.content.length ? (
          <OfficeLocationEmptyState filtered={filtered} />
        ) : (
          <>
            {/* Desktop Table Layout */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Geofence / Accuracy</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                            <MapPin aria-hidden="true" className="size-5" />
                          </span>
                          <div>
                            <Link
                              className="font-semibold hover:text-primary"
                              href={`/admin/office-locations/${location.id}`}
                            >
                              {location.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {location.locationCode}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="line-clamp-2 text-sm text-foreground">
                          {formatOfficeLocationAddress(location)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono">
                          <p>{formatCoordinatesDisplay(location.latitude, location.longitude)}</p>
                          <p className="text-muted-foreground">
                            [{location.longitude}, {location.latitude}]
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">
                          {location.geofenceRadiusMeters} m
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Max acc: ±{location.maximumGpsAccuracyMeters} m
                        </p>
                      </TableCell>
                      <TableCell>
                        {formatOfficeLocationTimestamp(location.createdAt)}
                      </TableCell>
                      <TableCell>
                        <OfficeLocationStatusBadge status={location.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <RowActions officeLocation={location} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card Layout */}
            <div className="divide-y divide-border md:hidden">
              {data.content.map((location) => (
                <article className="p-4" key={location.id}>
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                      <MapPin aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        className="font-semibold text-foreground hover:text-primary"
                        href={`/admin/office-locations/${location.id}`}
                      >
                        {location.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {location.locationCode}
                      </p>
                    </div>
                    <RowActions officeLocation={location} />
                  </div>

                  <p className="mt-2.5 text-xs text-muted-foreground">
                    {formatOfficeLocationAddress(location)}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Geofence</dt>
                      <dd className="font-medium text-foreground">
                        {location.geofenceRadiusMeters} m radius
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Status</dt>
                      <dd className="mt-1">
                        <OfficeLocationStatusBadge status={location.status} />
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-muted-foreground">Coordinates</dt>
                      <dd className="font-mono text-xs text-foreground">
                        {formatCoordinatesDisplay(
                          location.latitude,
                          location.longitude,
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Created</dt>
                      <dd>{formatOfficeLocationTimestamp(location.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Updated</dt>
                      <dd>{formatOfficeLocationTimestamp(location.updatedAt)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
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
              <Label className="sr-only" htmlFor="office-page-size">
                Results per page
              </Label>
              <Select
                className="w-24"
                id="office-page-size"
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
            href="/admin/office-locations/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            Create first office location
          </Link>
        )}
    </PageContainer>
  );
}
