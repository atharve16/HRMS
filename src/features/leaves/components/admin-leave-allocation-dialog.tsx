"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  History,
  LoaderCircle,
  Settings2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import React, { useState } from "react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEmployeeOptions } from "@/features/employees/hooks/use-employee-references";
import {
  useAllocateMonthlyLeave,
  useEmployeeLeaveAllocationHistory,
  useEmployeeMonthlyLeaveBalances,
  useLeaveDashboard,
  useSaveLeavePolicy,
} from "@/features/leaves/hooks/use-leaves";
import type { LeaveType } from "@/features/leaves/types/leave-types";
import { LEAVE_TYPE_LABELS } from "@/features/leaves/utils/leave-display";

const TYPES: Exclude<LeaveType, "LWP">[] = ["CL", "SL", "EL", "CO"];

export interface AdminLeaveAllocationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AdminLeaveAllocationDialog({
  open,
  onOpenChange,
  trigger,
}: AdminLeaveAllocationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) {
      onOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState<Exclude<LeaveType, "LWP">>("CL");
  const [days, setDays] = useState(0);
  const [reason, setReason] = useState("");
  const [allocationSuccess, setAllocationSuccess] = useState<string | null>(null);

  const [policyDays, setPolicyDays] = useState(0);
  const [carryLimit, setCarryLimit] = useState<number | "">("");
  const [policySuccess, setPolicySuccess] = useState<string | null>(null);

  const employees = useEmployeeOptions();
  const balances = useEmployeeMonthlyLeaveBalances(employeeId, month);
  const history = useEmployeeLeaveAllocationHistory(employeeId, month);
  const dashboard = useLeaveDashboard(month);

  const mutation = useAllocateMonthlyLeave();
  const policyMutation = useSaveLeavePolicy();

  async function handleAllocationSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAllocationSuccess(null);
    if (!employeeId || !reason.trim() || days === 0) return;

    try {
      await mutation.mutateAsync({
        employeeId,
        request: { leaveType, month, days, reason: reason.trim() },
      });
      setAllocationSuccess(`Successfully allocated ${days > 0 ? `+${days}` : days} ${leaveType} days.`);
      setDays(0);
      setReason("");
    } catch {
      // Error handled by mutation.isError
    }
  }

  async function handlePolicySubmit(event: React.FormEvent) {
    event.preventDefault();
    setPolicySuccess(null);

    try {
      await policyMutation.mutateAsync({
        employeeId: employeeId || undefined,
        request: {
          leaveType,
          monthlyEntitlement: policyDays,
          maxCarryForwardDays: carryLimit === "" ? null : carryLimit,
        },
      });
      setPolicySuccess(
        employeeId
          ? `Saved ${leaveType} policy override for selected employee.`
          : `Saved company-wide ${leaveType} policy entitlement.`
      );
    } catch {
      // Error handled by policyMutation.isError
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : !isControlled ? (
        <AlertDialogTrigger asChild>
          <Button variant="default">
            <Settings2 className="mr-1.5 size-4" />
            Manage Leave Allocation
          </Button>
        </AlertDialogTrigger>
      ) : null}

      <AlertDialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
        <AlertDialogTitle>Manage Leave Allocation & Policies</AlertDialogTitle>
        <AlertDialogDescription>
          Configure monthly leave entitlements, adjust employee balances, and audit allocation ledgers.
        </AlertDialogDescription>

        <div className="mt-4 space-y-6">
          {/* Month Filter & Dashboard Stats */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Organization Leave Dashboard
              </span>
              <div className="flex items-center gap-2">
                <Label htmlFor="dialog-month" className="text-xs">
                  Target Month:
                </Label>
                <Input
                  id="dialog-month"
                  className="h-8 w-36 text-xs"
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <p className="text-[11px] font-medium">Allocated</p>
                    <TrendingUp className="size-3.5 text-primary" />
                  </div>
                  <p className="mt-1 text-xl font-bold">
                    {dashboard.data?.totalAllocated ?? "—"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <p className="text-[11px] font-medium">Consumed</p>
                    <TrendingDown className="size-3.5 text-info" />
                  </div>
                  <p className="mt-1 text-xl font-bold">
                    {dashboard.data?.totalConsumed ?? "—"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <p className="text-[11px] font-medium">Pending Apps</p>
                    <Clock className="size-3.5 text-warning" />
                  </div>
                  <p className="mt-1 text-xl font-bold">
                    {dashboard.data?.pendingApplications ?? "—"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <p className="text-[11px] font-medium">Low Balance</p>
                    <Users className="size-3.5 text-destructive" />
                  </div>
                  <p className="mt-1 text-xl font-bold">
                    {dashboard.data?.lowBalanceEmployees ?? "—"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="rounded-lg border border-border bg-card/60 p-4 space-y-3">
            <Label htmlFor="dialog-employee" className="text-sm font-semibold flex items-center gap-1.5">
              <User className="size-4 text-primary" />
              Select Employee
            </Label>
            <Select
              id="dialog-employee"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setAllocationSuccess(null);
                setPolicySuccess(null);
              }}
            >
              <option value="">— Select an employee to view balances & allocate —</option>
              {employees.data?.content.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeCode} — {emp.firstName} {emp.lastName}
                </option>
              ))}
            </Select>
          </div>

          {/* Employee Balances & History if selected */}
          {employeeId && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CalendarDays className="size-4 text-primary" />
                    {month} Monthly Leave Balances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {balances.isLoading ? (
                    <div className="h-16 animate-pulse rounded bg-muted" />
                  ) : balances.isError ? (
                    <p className="text-xs text-destructive">Failed to load balances.</p>
                  ) : !balances.data?.length ? (
                    <p className="text-xs text-muted-foreground">No balance record found for this period.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {balances.data.map((bal) => (
                        <div key={bal.id} className="rounded-lg border bg-muted/20 p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{bal.leaveType}</span>
                            <span className="text-lg font-bold text-foreground">
                              {bal.availableDays}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {LEAVE_TYPE_LABELS[bal.leaveType]}
                          </p>
                          <div className="mt-2 space-y-0.5 text-[10px] text-muted-foreground border-t pt-1.5">
                            <div className="flex justify-between">
                              <span>Allocated:</span>
                              <span>{bal.allocatedDays}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Used:</span>
                              <span>{bal.usedDays}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pending:</span>
                              <span>{bal.pendingDays}</span>
                            </div>
                            {bal.expiredDays > 0 && (
                              <div className="flex justify-between text-warning">
                                <span>Expired:</span>
                                <span>{bal.expiredDays}</span>
                              </div>
                            )}
                            {bal.leaveType === "EL" && bal.carriedForwardDays > 0 && (
                              <div className="flex justify-between text-primary font-medium">
                                <span>Carried forward:</span>
                                <span>+{bal.carriedForwardDays}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Allocation Ledger History */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <History className="size-4 text-primary" />
                    Allocation Ledger & Audit History ({month})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {history.isLoading ? (
                    <div className="h-16 animate-pulse rounded bg-muted" />
                  ) : !history.data?.length ? (
                    <p className="text-xs text-muted-foreground py-2 italic">
                      No ledger adjustments recorded for this employee in {month}.
                    </p>
                  ) : (
                    <div className="divide-y max-h-48 overflow-y-auto pr-1">
                      {history.data.map((entry) => (
                        <div key={entry.id} className="py-2 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-semibold">{entry.entryType}</span> ·{" "}
                            <span className="text-muted-foreground">{entry.leaveType}</span>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {entry.reason} · {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}
                            </p>
                          </div>
                          <span
                            className={`font-semibold text-sm ${
                              entry.days > 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {entry.days > 0 ? `+${entry.days}` : entry.days}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Form 1: Record Allocation or Adjustment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Record Allocation or Balance Adjustment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAllocationSubmit} className="space-y-4">
                {allocationSuccess && (
                  <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-xs text-success flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{allocationSuccess}</span>
                  </div>
                )}
                {mutation.isError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>
                      Unable to save allocation.{" "}
                      {mutation.error instanceof Error
                        ? mutation.error.message
                        : "Please check your inputs."}
                    </span>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label htmlFor="alloc-emp" className="text-xs">
                      Employee
                    </Label>
                    <Select
                      id="alloc-emp"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    >
                      <option value="">Select employee</option>
                      {employees.data?.content.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.employeeCode} — {emp.firstName}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="alloc-type" className="text-xs">
                      Leave type
                    </Label>
                    <Select
                      id="alloc-type"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as typeof leaveType)}
                    >
                      {TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type} — {LEAVE_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="alloc-days" className="text-xs">
                      Days (+ / −)
                    </Label>
                    <Input
                      id="alloc-days"
                      type="number"
                      step="0.5"
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="alloc-reason" className="text-xs">
                      Audit Reason
                    </Label>
                    <Textarea
                      id="alloc-reason"
                      rows={1}
                      placeholder="Required reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    disabled={mutation.isPending || !employeeId || !reason.trim() || days === 0}
                    type="submit"
                  >
                    {mutation.isPending && (
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                    )}
                    Save allocation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Form 2: Leave Policy Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Configure Leave Policy</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Scope:{" "}
                  <strong className="text-foreground">
                    {employeeId ? "Employee Override" : "Company-wide Policy"}
                  </strong>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePolicySubmit} className="space-y-4">
                {policySuccess && (
                  <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-xs text-success flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{policySuccess}</span>
                  </div>
                )}
                {policyMutation.isError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>Failed to save policy settings.</span>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="pol-type" className="text-xs">
                      Leave type
                    </Label>
                    <Select
                      id="pol-type"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as typeof leaveType)}
                    >
                      {TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type} ({LEAVE_TYPE_LABELS[type]})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pol-days" className="text-xs">
                      Monthly entitlement (days)
                    </Label>
                    <Input
                      id="pol-days"
                      type="number"
                      min="0"
                      step="0.5"
                      value={policyDays}
                      onChange={(e) => setPolicyDays(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pol-carry" className="text-xs">
                      EL max carry-forward (days)
                    </Label>
                    <Input
                      id="pol-carry"
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Unlimited"
                      value={carryLimit}
                      onChange={(e) =>
                        setCarryLimit(e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button size="sm" variant="secondary" disabled={policyMutation.isPending} type="submit">
                    {policyMutation.isPending && (
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                    )}
                    {employeeId ? "Save employee override" : "Save company policy"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <AlertDialogClose asChild>
            <Button variant="outline">Close</Button>
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
