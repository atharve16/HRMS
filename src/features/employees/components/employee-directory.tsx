"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  UserPlus,
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
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import { EmployeeEmptyState, EmployeeErrorState } from "@/features/employees/components/employee-query-state";
import { EmployeeStatusBadge } from "@/features/employees/components/employee-status-badge";
import { useDepartmentOptions } from "@/features/departments/hooks/use-department";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import type { Employee } from "@/features/employees/types/employee-types";
import {
  parseEmployeeDirectoryState,
  updateDirectorySearchParams,
} from "@/features/employees/utils/directory-state";
import {
  employeeFullName,
  formatDate,
} from "@/features/employees/utils/employee-display";
import { getEmployeeErrorMessage } from "@/features/employees/utils/employee-errors";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

function RowActions({ employee }: { employee: Employee }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={`Actions for ${employeeFullName(employee)}`} size="icon" type="button" variant="ghost">
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{employee.employeeCode}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/employees/${employee.id}`}><Eye aria-hidden="true" className="size-4" />View details</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/employees/${employee.id}/edit`}><Pencil aria-hidden="true" className="size-4" />Edit employee</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DirectorySkeleton() {
  return (
    <div aria-label="Loading employees" className="space-y-3 p-4" role="status">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="flex items-center gap-4" key={index}>
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-64 max-w-full" /></div>
          <Skeleton className="hidden h-8 w-20 sm:block" />
        </div>
      ))}
      <span className="sr-only">Loading employee directory...</span>
    </div>
  );
}

export function EmployeeDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(() => parseEmployeeDirectoryState(searchParams), [searchParams]);
  const [search, setSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const departments = useDepartmentOptions();
  const query = useEmployees({
    page: state.page,
    limit: state.limit,
    search: state.search || undefined,
    employmentStatus: state.employmentStatus,
    departmentId: state.departmentId,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const departmentNames = useMemo(
    () => new Map(departments.data?.content.map((department) => [department.id, department.name]) ?? []),
    [departments.data],
  );

  function navigate(updates: Record<string, string | number | undefined>) {
    const next = updateDirectorySearchParams(new URLSearchParams(searchParams.toString()), updates);
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (debouncedSearch !== state.search) navigate({ search: debouncedSearch || undefined, page: 0 });
    // navigate is intentionally reconstructed from the latest URL on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, state.search]);

  const filtered = Boolean(state.search || state.employmentStatus || state.departmentId);
  const data = query.data;

  return (
    <PageContainer>
      <PageHeader
        actions={(
          <Link className={buttonVariants()} href="/admin/employees/new">
            <Plus aria-hidden="true" className="size-4" />Add employee
          </Link>
        )}
        description="Search, review, and manage employee records from one place."
        eyebrow="People"
        title="Employee directory"
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_12rem_15rem_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="employee-search">Search employees</Label>
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  id="employee-search"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, email, or employee code"
                  type="search"
                  value={search}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select id="status-filter" onChange={(event) => navigate({ status: event.target.value || undefined, page: 0 })} value={state.employmentStatus ?? ""}>
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-filter">Department</Label>
              <Select disabled={departments.isLoading || departments.isError} id="department-filter" onChange={(event) => navigate({ department: event.target.value || undefined, page: 0 })} value={state.departmentId ?? ""}>
                <option value="">All departments</option>
                {departments.data?.content.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </Select>
            </div>
            <Button
              disabled={!filtered}
              onClick={() => { setSearch(""); navigate({ search: undefined, status: undefined, department: undefined, page: 0 }); }}
              type="button"
              variant="outline"
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" />Clear filters
            </Button>
          </div>
          {departments.isError && <p className="mt-3 text-xs text-warning">Department filters are temporarily unavailable.</p>}
        </div>

        {query.isLoading ? <DirectorySkeleton /> : query.isError ? (
          <div className="p-4"><EmployeeErrorState message={getEmployeeErrorMessage(query.error)} retry={() => query.refetch()} /></div>
        ) : !data?.content.length ? <EmployeeEmptyState filtered={filtered} /> : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Employee</TableHead><TableHead>Contact</TableHead><TableHead>Department</TableHead><TableHead>Designation</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {data.content.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell><div className="flex items-center gap-3"><EmployeeAvatar employee={employee} /><div><Link className="font-semibold hover:text-primary" href={`/admin/employees/${employee.id}`}>{employeeFullName(employee)}</Link><p className="text-xs text-muted-foreground">{employee.employeeCode}</p></div></div></TableCell>
                      <TableCell><p>{employee.email}</p><p className="text-xs text-muted-foreground">{employee.phone || "No phone"}</p></TableCell>
                      <TableCell>{employee.departmentId ? departmentNames.get(employee.departmentId) ?? "Unavailable" : "Not assigned"}</TableCell>
                      <TableCell>{employee.designation || "Not provided"}</TableCell>
                      <TableCell>{formatDate(employee.joiningDate)}</TableCell>
                      <TableCell><EmployeeStatusBadge status={employee.employmentStatus} /></TableCell>
                      <TableCell className="text-right"><RowActions employee={employee} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y divide-border md:hidden">
              {data.content.map((employee) => (
                <article className="p-4" key={employee.id}>
                  <div className="flex items-start gap-3">
                    <EmployeeAvatar employee={employee} />
                    <div className="min-w-0 flex-1"><Link className="font-semibold" href={`/admin/employees/${employee.id}`}>{employeeFullName(employee)}</Link><p className="text-xs text-muted-foreground">{employee.employeeCode}</p></div>
                    <RowActions employee={employee} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="col-span-2 min-w-0"><dt className="text-xs text-muted-foreground">Email</dt><dd className="truncate">{employee.email}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Department</dt><dd>{employee.departmentId ? departmentNames.get(employee.departmentId) ?? "Unavailable" : "Not assigned"}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Status</dt><dd className="mt-1"><EmployeeStatusBadge status={employee.employmentStatus} /></dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </>
        )}

        {data && data.totalElements > 0 && (
          <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {data.totalElements.toLocaleString()} result{data.totalElements === 1 ? "" : "s"} - page {data.page + 1} of {Math.max(data.totalPages, 1)}
            </p>
            <div className="flex items-center gap-2">
              <Label className="sr-only" htmlFor="page-size">Results per page</Label>
              <Select className="w-24" id="page-size" onChange={(event) => navigate({ limit: event.target.value, page: 0 })} value={state.limit}>
                {[10, 20, 50, 100].map((limit) => <option key={limit} value={limit}>{limit} / page</option>)}
              </Select>
              <Button aria-label="Previous page" disabled={data.first} onClick={() => navigate({ page: Math.max(data.page - 1, 0) })} size="icon" type="button" variant="outline"><ChevronLeft aria-hidden="true" className="size-4" /></Button>
              <Button aria-label="Next page" disabled={data.last} onClick={() => navigate({ page: data.page + 1 })} size="icon" type="button" variant="outline"><ChevronRight aria-hidden="true" className="size-4" /></Button>
            </div>
          </div>
        )}
      </Card>

      {!query.isLoading && !query.isError && data?.totalElements === 0 && !filtered && (
        <Link className={cn(buttonVariants(), "mx-auto mt-5 flex w-fit")} href="/admin/employees/new"><UserPlus aria-hidden="true" className="size-4" />Create first employee</Link>
      )}
    </PageContainer>
  );
}
