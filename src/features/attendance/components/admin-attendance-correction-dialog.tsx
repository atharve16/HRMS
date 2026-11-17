"use client";

import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  LoaderCircle,
  RotateCcw,
  X,
  XCircle,
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminAttendanceCorrections,
  useReviewAttendanceCorrection,
} from "@/features/attendance/hooks/use-attendance";
import type {
  AttendanceCorrectionResponse,
  AttendanceCorrectionStatus,
} from "@/features/attendance/types/attendance-types";
import {
  formatAttendanceDate,
  formatAttendanceTime,
  formatDurationMinutes,
} from "@/features/attendance/utils/attendance-display";
import { useDepartments } from "@/features/departments/hooks/use-departments";
import { useEmployeeOptions } from "@/features/employees/hooks/use-employee-references";

export interface AdminAttendanceCorrectionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AdminAttendanceCorrectionDialog({
  open,
  onOpenChange,
  trigger,
}: AdminAttendanceCorrectionDialogProps) {
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

  // Filters
  const [status, setStatus] = useState<AttendanceCorrectionStatus | "">("PENDING");
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Review action modal state
  const [reviewingRequest, setReviewingRequest] = useState<{
    request: AttendanceCorrectionResponse;
    action: "approve" | "reject";
  } | null>(null);
  const [reviewResponse, setReviewResponse] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const employees = useEmployeeOptions();
  const departments = useDepartments({ page: 0, limit: 100, status: "ACTIVE" });

  const query = useAdminAttendanceCorrections({
    status: status || undefined,
    employeeId: employeeId || undefined,
    departmentId: departmentId || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page: 0,
    limit: 100,
  });

  const approveMutation = useReviewAttendanceCorrection("approve");
  const rejectMutation = useReviewAttendanceCorrection("reject");

  function handleResetFilters() {
    setStatus("PENDING");
    setEmployeeId("");
    setDepartmentId("");
    setFromDate("");
    setToDate("");
  }

  async function handleConfirmReview() {
    if (!reviewingRequest) return;
    const { request, action } = reviewingRequest;
    setActionError(null);

    if (action === "reject" && !reviewResponse.trim()) {
      setActionError("A reason is required when rejecting a correction request.");
      return;
    }

    try {
      if (action === "approve") {
        await approveMutation.mutateAsync({
          id: request.id,
          request: reviewResponse.trim() ? { response: reviewResponse.trim() } : undefined,
        });
      } else {
        await rejectMutation.mutateAsync({
          id: request.id,
          request: { response: reviewResponse.trim() },
        });
      }
      setReviewingRequest(null);
      setReviewResponse("");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to process request. Please try again."
      );
    }
  }

  const isReviewPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : !isControlled ? (
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <Clock className="mr-1.5 size-4" />
            Attendance Correction Requests
          </Button>
        </AlertDialogTrigger>
      ) : null}

      <AlertDialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <AlertDialogTitle>Attendance Correction Requests</AlertDialogTitle>
        <AlertDialogDescription>
          Review and audit missing check-in/check-out punch correction requests.
          Approvals recalculate working hours and update attendance records safely.
        </AlertDialogDescription>

        <div className="mt-4 space-y-5">
          {/* Filter Bar */}
          <Card className="bg-muted/20">
            <CardContent className="p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Filter className="size-3.5" />
                  Filter Requests
                </span>
                {(status || employeeId || departmentId || fromDate || toDate) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleResetFilters}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="mr-1 size-3" />
                    Reset filters
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <Label htmlFor="req-status" className="text-xs">
                    Status
                  </Label>
                  <Select
                    id="req-status"
                    className="h-8 text-xs"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as AttendanceCorrectionStatus | "")
                    }
                  >
                    <option value="">All statuses</option>
                    <option value="PENDING">Pending review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="req-emp" className="text-xs">
                    Employee
                  </Label>
                  <Select
                    id="req-emp"
                    className="h-8 text-xs"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  >
                    <option value="">All employees</option>
                    {employees.data?.content.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode} — {emp.firstName}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="req-dept" className="text-xs">
                    Department
                  </Label>
                  <Select
                    id="req-dept"
                    className="h-8 text-xs"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <option value="">All departments</option>
                    {departments.data?.content.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="req-from" className="text-xs">
                    From date
                  </Label>
                  <Input
                    id="req-from"
                    type="date"
                    className="h-8 text-xs"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="req-to" className="text-xs">
                    To date
                  </Label>
                  <Input
                    id="req-to"
                    type="date"
                    className="h-8 text-xs"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Dialog / Confirmation Overlay when reviewing a request */}
          {reviewingRequest && (
            <div className="rounded-xl border-2 border-primary/40 bg-card p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-2">
                  {reviewingRequest.action === "approve" ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                  {reviewingRequest.action === "approve"
                    ? "Approve Attendance Correction"
                    : "Reject Attendance Correction"}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-7 p-0"
                  onClick={() => {
                    setReviewingRequest(null);
                    setReviewResponse("");
                    setActionError(null);
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Employee:{" "}
                <strong className="text-foreground">
                  {reviewingRequest.request.employeeName || reviewingRequest.request.employeeCode}
                </strong>{" "}
                ({reviewingRequest.request.employeeCode}) · Date:{" "}
                <strong className="text-foreground">
                  {formatAttendanceDate(reviewingRequest.request.attendanceDate)}
                </strong>
              </p>

              {actionError && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div>
                <Label htmlFor="review-note" className="text-xs">
                  {reviewingRequest.action === "reject"
                    ? "Rejection Reason (Required)*"
                    : "Admin Note / Response (Optional)"}
                </Label>
                <Textarea
                  id="review-note"
                  rows={2}
                  className="mt-1 text-xs"
                  placeholder={
                    reviewingRequest.action === "reject"
                      ? "Explain why the correction request is rejected"
                      : "Optional note recorded in audit log"
                  }
                  value={reviewResponse}
                  onChange={(e) => setReviewResponse(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isReviewPending}
                  onClick={() => {
                    setReviewingRequest(null);
                    setReviewResponse("");
                    setActionError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant={reviewingRequest.action === "approve" ? "default" : "destructive"}
                  disabled={isReviewPending}
                  onClick={handleConfirmReview}
                >
                  {isReviewPending && (
                    <LoaderCircle className="mr-1.5 size-3.5 animate-spin" />
                  )}
                  {reviewingRequest.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                </Button>
              </div>
            </div>
          )}

          {/* List of Requests */}
          {query.isLoading ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
            </div>
          ) : query.isError ? (
            <p className="text-sm text-destructive">
              Unable to load attendance correction requests.
            </p>
          ) : !query.data?.content.length ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No correction requests match the selected filters.
            </div>
          ) : (
            <div className="divide-y rounded-xl border border-border bg-card overflow-hidden">
              {query.data.content.map((request) => {
                const isIncompleteCheckoutRequest =
                  request.missingPunch === "CHECK_OUT" &&
                  (request.existingAttendance?.attendanceStatus === "HALF_DAY" ||
                    request.existingAttendance?.sessions.some(
                      (s) => s.status === "INCOMPLETE_CHECKOUT"
                    ));

                const autoClosedSession = request.existingAttendance?.sessions.find(
                  (s) => s.status === "INCOMPLETE_CHECKOUT"
                );

                const existingFirstIn = request.existingAttendance?.sessions[0]?.checkInAt;

                const reqInTime = request.requestedCheckInAt
                  ? formatAttendanceTime(request.requestedCheckInAt)
                  : null;
                const reqOutTime = request.requestedCheckOutAt
                  ? formatAttendanceTime(request.requestedCheckOutAt)
                  : null;

                return (
                  <div
                    key={request.id}
                    className="p-4 transition-colors hover:bg-muted/10 space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {request.employeeName || request.employeeCode}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          ({request.employeeCode})
                        </span>
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                          {formatAttendanceDate(request.attendanceDate)}
                        </span>
                        {isIncompleteCheckoutRequest && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 font-semibold text-[11px] text-destructive">
                            <AlertTriangle className="size-3" />
                            Missing Checkout (Auto-closed)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold rounded-full px-2.5 py-0.5 text-[11px] ${
                            request.status === "APPROVED"
                              ? "bg-success/15 text-success"
                              : request.status === "REJECTED"
                              ? "bg-destructive/15 text-destructive"
                              : request.status === "PENDING"
                              ? "bg-warning/15 text-warning"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {request.status}
                        </span>

                        {request.status === "PENDING" && !reviewingRequest && (
                          <div className="flex items-center gap-1.5 ml-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs px-2.5"
                              onClick={() => {
                                setReviewingRequest({ request, action: "approve" });
                                setReviewResponse("");
                                setActionError(null);
                              }}
                            >
                              <Check className="mr-1 size-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2.5 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setReviewingRequest({ request, action: "reject" });
                                setReviewResponse("");
                                setActionError(null);
                              }}
                            >
                              <X className="mr-1 size-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Request Details & Comparison */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 rounded-lg bg-muted/30 p-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                          Requested Timing ({request.missingPunch})
                        </span>
                        <p className="mt-0.5 font-medium text-foreground">
                          {reqInTime && <span>Check-in: <strong>{reqInTime}</strong> </span>}
                          {reqOutTime && <span>Check-out: <strong>{reqOutTime}</strong></span>}
                          {!reqInTime && !reqOutTime && "—"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                          Existing Attendance & Assigned Shift
                        </span>
                        <p className="mt-0.5 text-foreground">
                          Shift:{" "}
                          <strong>{request.shift?.shiftName || "Standard shift"}</strong>{" "}
                          {request.shift?.startTime && (
                            <span className="text-muted-foreground text-[11px]">
                              ({request.shift.startTime.slice(0, 5)} –{" "}
                              {request.shift.endTime.slice(0, 5)})
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          First check-in:{" "}
                          <strong>{existingFirstIn ? formatAttendanceTime(existingFirstIn) : "None"}</strong>
                          {request.existingAttendance && (
                            <span> · {formatDurationMinutes(request.existingAttendance.totalWorkedMinutes)} worked</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                          Reason for Request
                        </span>
                        <p className="mt-0.5 text-foreground italic">
                          &ldquo;{request.reason}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Auto-closure & Audit info */}
                    {(autoClosedSession?.closureReason || request.adminResponse || request.reviewedBy) && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground border-t pt-2">
                        {autoClosedSession && (
                          <span className="text-warning">
                            Auto-closure: {autoClosedSession.closureReason || "System midnight closure"}
                            {autoClosedSession.autoClosedAt && (
                              <span> ({new Date(autoClosedSession.autoClosedAt).toLocaleTimeString()})</span>
                            )}
                          </span>
                        )}
                        {request.reviewedBy && (
                          <span>
                            Reviewed by: <strong>{request.reviewedBy}</strong>
                            {request.reviewedAt && (
                              <span> on {new Date(request.reviewedAt).toLocaleString()}</span>
                            )}
                          </span>
                        )}
                        {request.adminResponse && (
                          <span>
                            Admin response: <strong>&ldquo;{request.adminResponse}&rdquo;</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
