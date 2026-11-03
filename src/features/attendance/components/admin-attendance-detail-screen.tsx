"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  History,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceCorrectionDialog } from "@/features/attendance/components/attendance-correction-dialog";
import {
  AttendanceErrorState,
  AttendanceSkeleton,
} from "@/features/attendance/components/attendance-query-state";
import { AttendanceSessionsCard } from "@/features/attendance/components/attendance-sessions-card";
import { AttendanceStatusBadge } from "@/features/attendance/components/attendance-status-badge";
import { useAttendanceDetail } from "@/features/attendance/hooks/use-attendance";
import {
  formatAttendanceDate,
  formatAttendanceDateTime,
  formatDurationMinutes,
} from "@/features/attendance/utils/attendance-display";
import { getAttendanceErrorMessage } from "@/features/attendance/utils/attendance-errors";

function ValueRow({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground break-words">{children || "—"}</dd>
    </div>
  );
}

export function AdminAttendanceDetailScreen() {
  const params = useParams<{ attendanceId: string }>();
  const query = useAttendanceDetail(params.attendanceId);
  const record = query.data;

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href="/admin/attendance"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Attendance directory
            </Link>
            {record && record.sessions.length > 0 && (
              <AttendanceCorrectionDialog attendance={record} />
            )}
          </div>
        }
        description="Detailed punch history, geofence validations, break calculations, and audit history."
        eyebrow="Attendance record"
        title={
          record
            ? `${record.employeeNameSnapshot} — ${formatAttendanceDate(record.workDate)}`
            : "Attendance details"
        }
      />

      {query.isLoading ? (
        <AttendanceSkeleton />
      ) : query.isError ? (
        <AttendanceErrorState
          message={getAttendanceErrorMessage(query.error)}
          retry={() => query.refetch()}
        />
      ) : record ? (
        <div className="space-y-6">
          {/* Top Overview Banner */}
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">
                    {record.employeeNameSnapshot}
                  </h2>
                  <AttendanceStatusBadge status={record.attendanceStatus} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Employee code: <span className="font-mono font-medium">{record.employeeCodeSnapshot}</span> • Work date:{" "}
                  <span className="font-medium text-foreground">{formatAttendanceDate(record.workDate)}</span>
                </p>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <span>Record ID: </span>
                <span className="font-mono">{record.id}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Employee Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <User aria-hidden="true" className="size-4 text-primary" />
                  Employee profile
                </CardTitle>
                <Link
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  href={`/admin/employees/${record.employeeId}`}
                >
                  View profile
                  <ExternalLink aria-hidden="true" className="size-3" />
                </Link>
              </CardHeader>
              <CardContent className="pt-2">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ValueRow label="Employee name">
                    {record.employeeNameSnapshot}
                  </ValueRow>
                  <ValueRow label="Employee code">
                    {record.employeeCodeSnapshot}
                  </ValueRow>
                  <ValueRow label="Employee ID">
                    <span className="font-mono text-xs">{record.employeeId}</span>
                  </ValueRow>
                  <ValueRow label="Created at">
                    {formatAttendanceDateTime(record.createdAt)}
                  </ValueRow>
                </dl>
              </CardContent>
            </Card>

            {/* Calculated Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Clock aria-hidden="true" className="size-4 text-primary" />
                  Calculated work time
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ValueRow label="Total worked time">
                    <span className="font-semibold text-foreground">
                      {formatDurationMinutes(record.totalWorkedMinutes)}
                    </span>
                  </ValueRow>
                  <ValueRow label="Total break time">
                    {formatDurationMinutes(record.totalBreakMinutes)}
                  </ValueRow>
                  <ValueRow label="Late arrival">
                    {record.lateByMinutes > 0 ? (
                      <span className="text-warning font-semibold">
                        +{record.lateByMinutes} minutes
                      </span>
                    ) : (
                      "On time"
                    )}
                  </ValueRow>
                  <ValueRow label="Early departure">
                    {record.earlyDepartureByMinutes > 0 ? (
                      <span className="text-warning font-semibold">
                        {record.earlyDepartureByMinutes} minutes early
                      </span>
                    ) : (
                      "None"
                    )}
                  </ValueRow>
                  <ValueRow label="Overtime">
                    {record.overtimeMinutes > 0 ? (
                      <span className="text-info font-semibold">
                        +{formatDurationMinutes(record.overtimeMinutes)}
                      </span>
                    ) : (
                      "None"
                    )}
                  </ValueRow>
                  <ValueRow label="Active session">
                    {record.activeSession ? (
                      <span className="text-warning font-semibold">Yes (Open)</span>
                    ) : (
                      "No (Closed)"
                    )}
                  </ValueRow>
                </dl>
              </CardContent>
            </Card>

            {/* Shift Snapshot */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Calendar aria-hidden="true" className="size-4 text-primary" />
                  Assigned shift snapshot
                </CardTitle>
                {record.shiftSnapshot?.shiftId && (
                  <Link
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    href={`/admin/shifts/${record.shiftSnapshot.shiftId}`}
                  >
                    View shift
                    <ExternalLink aria-hidden="true" className="size-3" />
                  </Link>
                )}
              </CardHeader>
              <CardContent className="pt-2">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ValueRow label="Shift name">
                    {record.shiftSnapshot?.shiftName}
                  </ValueRow>
                  <ValueRow label="Shift code">
                    {record.shiftSnapshot?.shiftCode}
                  </ValueRow>
                  <ValueRow label="Operating hours">
                    {record.shiftSnapshot
                      ? `${record.shiftSnapshot.startTime.slice(0, 5)} – ${record.shiftSnapshot.endTime.slice(0, 5)}`
                      : undefined}
                  </ValueRow>
                  <ValueRow label="Grace period">
                    {record.shiftSnapshot ? `${record.shiftSnapshot.gracePeriodMinutes} mins` : undefined}
                  </ValueRow>
                </dl>
              </CardContent>
            </Card>

            {/* Office Snapshot */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <MapPin aria-hidden="true" className="size-4 text-primary" />
                  Assigned office geofence snapshot
                </CardTitle>
                {record.officeSnapshot?.officeLocationId && (
                  <Link
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    href={`/admin/office-locations/${record.officeSnapshot.officeLocationId}`}
                  >
                    View location
                    <ExternalLink aria-hidden="true" className="size-3" />
                  </Link>
                )}
              </CardHeader>
              <CardContent className="pt-2">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ValueRow label="Office name">
                    {record.officeSnapshot?.name}
                  </ValueRow>
                  <ValueRow label="Location code">
                    {record.officeSnapshot?.locationCode}
                  </ValueRow>
                  <ValueRow label="Geofence radius">
                    {record.officeSnapshot ? `${record.officeSnapshot.geofenceRadiusMeters}m` : undefined}
                  </ValueRow>
                  <ValueRow label="Max GPS accuracy">
                    {record.officeSnapshot ? `${record.officeSnapshot.maximumGpsAccuracyMeters}m` : undefined}
                  </ValueRow>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Sessions List */}
          <AttendanceSessionsCard sessions={record.sessions} />

          {/* Correction History / Audit Log */}
          {record.correctionHistory && record.correctionHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <History aria-hidden="true" className="size-4 text-primary" />
                  Administrative correction history ({record.correctionHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {record.correctionHistory.map((item, index) => (
                  <div
                    className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1.5"
                    key={item.correctionId || index}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-1">
                      <span className="font-semibold text-foreground">
                        Correction #{index + 1}
                      </span>
                      <span className="text-muted-foreground">
                        {formatAttendanceDateTime(item.correctedAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground italic">
                      &quot;{item.reason}&quot;
                    </p>
                    <div className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
                      <span>Administrator ID: {item.actorId}</span>
                      <span>Session ID: {item.sessionId}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </PageContainer>
  );
}

