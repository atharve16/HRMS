"use client";

import type { ReactNode } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceReportFilters } from "@/features/attendance/components/attendance-report-filters";

export type AttendanceReportMetric = {
  label: string;
  value: string;
  description?: string;
  tone?: "default" | "blue" | "red" | "amber";
};

type AttendanceReportShellProps = {
  title: string;
  description: string;
  month: string;
  departmentId: string;
  employeeCode: string;
  onMonthChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onEmployeeCodeChange: (value: string) => void;
  metrics: AttendanceReportMetric[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  hasData: boolean;
  onRetry: () => void;
  children: ReactNode;
};

const toneClasses = {
  default: "text-foreground",
  blue: "text-blue-600 dark:text-blue-400",
  red: "text-rose-600 dark:text-rose-400",
  amber: "text-amber-600 dark:text-amber-400",
};

export function AttendanceReportShell({
  title,
  description,
  month,
  departmentId,
  employeeCode,
  onMonthChange,
  onDepartmentChange,
  onEmployeeCodeChange,
  metrics,
  isLoading,
  isError,
  errorMessage,
  hasData,
  onRetry,
  children,
}: AttendanceReportShellProps) {
  return (
    <PageContainer>
      <PageHeader
        description={description}
        eyebrow="Attendance reporting"
        title={title}
      />

      <div className="space-y-6">
        <AttendanceReportFilters
          departmentId={departmentId}
          employeeCode={employeeCode}
          month={month}
          onDepartmentChange={onDepartmentChange}
          onEmployeeCodeChange={onEmployeeCodeChange}
          onMonthChange={onMonthChange}
        />

        {hasData && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <Card className="border-border" key={metric.label}>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                  <p className={`mt-2 text-2xl font-bold tracking-tight ${toneClasses[metric.tone ?? "default"]}`}>
                    {metric.value}
                  </p>
                  {metric.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isLoading && !hasData ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
            <div className="h-72 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : isError && !hasData ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
            <p className="font-semibold text-foreground">Could not load this report</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {errorMessage || "The report service is temporarily unavailable."}
            </p>
            <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
              Try again
            </Button>
          </div>
        ) : (
          children
        )}
      </div>
    </PageContainer>
  );
}
