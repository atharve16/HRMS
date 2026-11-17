"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEmployeeOptions } from "@/features/employees/hooks/use-employee-references";
import { useAllocateMonthlyLeave, useEmployeeLeaveAllocationHistory, useEmployeeMonthlyLeaveBalances, useLeaveDashboard, useSaveLeavePolicy } from "@/features/leaves/hooks/use-leaves";
import type { LeaveType } from "@/features/leaves/types/leave-types";
import { LEAVE_TYPE_LABELS } from "@/features/leaves/utils/leave-display";

const TYPES: Exclude<LeaveType, "LWP">[] = ["CL", "SL", "EL", "CO"];

export function AdminLeaveAllocationScreen() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState<Exclude<LeaveType, "LWP">>("CL");
  const [days, setDays] = useState(0);
  const [reason, setReason] = useState("");
  const employees = useEmployeeOptions();
  const balances = useEmployeeMonthlyLeaveBalances(employeeId, month);
  const history = useEmployeeLeaveAllocationHistory(employeeId, month);
  const dashboard = useLeaveDashboard(month);
  const mutation = useAllocateMonthlyLeave();
  const policyMutation = useSaveLeavePolicy();
  const [policyDays, setPolicyDays] = useState(0);
  const [carryLimit, setCarryLimit] = useState<number | "">("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!employeeId || !reason.trim() || days === 0) return;
    await mutation.mutateAsync({ employeeId, request: { leaveType, month, days, reason: reason.trim() } });
    setDays(0); setReason("");
  }
  async function savePolicy(event: React.FormEvent) { event.preventDefault(); await policyMutation.mutateAsync({ employeeId: employeeId || undefined, request: { leaveType, monthlyEntitlement: policyDays, maxCarryForwardDays: carryLimit === "" ? null : carryLimit } }); }

  return <PageContainer><div className="space-y-6">
    <PageHeader title="Leave Allocation" description="Configure monthly entitlements and record every employee allocation or adjustment." />
    <div className="grid gap-4 sm:grid-cols-4">
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Allocated this month</p><p className="mt-1 text-2xl font-semibold">{dashboard.data?.totalAllocated ?? "—"}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Consumed this month</p><p className="mt-1 text-2xl font-semibold">{dashboard.data?.totalConsumed ?? "—"}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending applications</p><p className="mt-1 text-2xl font-semibold">{dashboard.data?.pendingApplications ?? "—"}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Low-balance employees</p><p className="mt-1 text-2xl font-semibold">{dashboard.data?.lowBalanceEmployees ?? "—"}</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle className="text-base">Record allocation or adjustment</CardTitle></CardHeader><CardContent><form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" onSubmit={submit}>
      <div><Label htmlFor="allocation-month">Month</Label><Input id="allocation-month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
      <div><Label htmlFor="allocation-employee">Employee</Label><Select id="allocation-employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}><option value="">Select employee</option>{employees.data?.content.map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeCode} — {employee.firstName} {employee.lastName}</option>)}</Select></div>
      <div><Label htmlFor="allocation-type">Leave type</Label><Select id="allocation-type" value={leaveType} onChange={(e) => setLeaveType(e.target.value as typeof leaveType)}>{TYPES.map((type) => <option key={type} value={type}>{type} — {LEAVE_TYPE_LABELS[type]}</option>)}</Select></div>
      <div><Label htmlFor="allocation-days">Days (+ / −)</Label><Input id="allocation-days" type="number" step="0.5" value={days} onChange={(e) => setDays(Number(e.target.value))} /></div>
      <div className="lg:col-span-1"><Label htmlFor="allocation-reason">Reason</Label><Textarea id="allocation-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required audit reason" /></div>
      <div className="sm:col-span-2 lg:col-span-5"><Button disabled={mutation.isPending || !employeeId || !reason.trim() || days === 0}>{mutation.isPending ? "Saving…" : "Save allocation"}</Button>{mutation.isError && <p className="mt-2 text-sm text-destructive">Unable to save allocation. {String(mutation.error instanceof Error ? mutation.error.message : "Please review the values.")}</p>}</div>
    </form></CardContent></Card>
    <Card><CardHeader><CardTitle className="text-base">Recurring monthly policy</CardTitle></CardHeader><CardContent><form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" onSubmit={savePolicy}><div><Label htmlFor="policy-scope">Scope</Label><p id="policy-scope" className="mt-2 text-sm text-muted-foreground">{employeeId ? "Employee override" : "Company-wide policy"}</p></div><div><Label htmlFor="policy-type">Leave type</Label><Select id="policy-type" value={leaveType} onChange={(e) => setLeaveType(e.target.value as typeof leaveType)}>{TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</Select></div><div><Label htmlFor="policy-days">Monthly entitlement</Label><Input id="policy-days" type="number" min="0" step="0.5" value={policyDays} onChange={(e) => setPolicyDays(Number(e.target.value))} /></div><div><Label htmlFor="policy-carry">EL max carry-forward</Label><Input id="policy-carry" type="number" min="0" step="0.5" value={carryLimit} onChange={(e) => setCarryLimit(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Unlimited" /></div><div className="flex items-end"><Button disabled={policyMutation.isPending}>{policyMutation.isPending ? "Saving…" : employeeId ? "Save employee override" : "Save company policy"}</Button></div></form></CardContent></Card>
    {employeeId && <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">{month} balances</CardTitle></CardHeader><CardContent><div className="space-y-3">{balances.data?.map((balance) => <div className="flex items-center justify-between rounded-lg border p-3" key={balance.id}><div><p className="font-semibold">{balance.leaveType} <span className="font-normal text-muted-foreground">{LEAVE_TYPE_LABELS[balance.leaveType]}</span></p><p className="text-xs text-muted-foreground">Allocated {balance.allocatedDays} · Used {balance.usedDays} · Pending {balance.pendingDays} · Expired {balance.expiredDays}</p></div><span className="text-lg font-semibold">{balance.availableDays}</span></div>)}</div></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Allocation history</CardTitle></CardHeader><CardContent>{history.data?.length ? <div className="space-y-3">{history.data.map((entry) => <div className="border-b pb-2 text-sm last:border-0" key={entry.id}><div className="flex justify-between"><span className="font-semibold">{entry.entryType} · {entry.leaveType}</span><span>{entry.days > 0 ? "+" : ""}{entry.days}</span></div><p className="text-xs text-muted-foreground">{entry.reason} · {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No ledger entries for this month.</p>}</CardContent></Card></div>}
  </div></PageContainer>;
}
