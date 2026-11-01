"use client";

import { CheckCircle2, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShiftInformation } from "@/features/shifts/components/shift-information";
import { ShiftLifecycleDialog } from "@/features/shifts/components/shift-lifecycle-dialog";
import { ShiftErrorState } from "@/features/shifts/components/shift-query-state";
import { useShift } from "@/features/shifts/hooks/use-shift";
import {
  getShiftErrorMessage,
  isShiftNotFoundError,
} from "@/features/shifts/utils/shift-errors";

function DetailSkeleton() {
  return (
    <div aria-label="Loading shift" className="space-y-6" role="status">
      <Card>
        <CardContent className="flex gap-4 p-6">
          <Skeleton className="size-16 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-36" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <span className="sr-only">Loading shift details...</span>
    </div>
  );
}

export function ShiftDetailScreen() {
  const params = useParams<{ shiftId: string }>();
  const searchParams = useSearchParams();
  const query = useShift(params.shiftId);
  const shift = query.data;

  const successMessage =
    searchParams.get("created") === "1"
      ? "Shift created successfully."
      : searchParams.get("updated") === "1"
        ? "Shift information updated successfully."
        : null;

  return (
    <PageContainer>
      <PageHeader
        actions={
          shift ? (
            <div className="flex flex-wrap gap-2">
              <Link
                className={buttonVariants({ variant: "outline" })}
                href={`/admin/shifts/${shift.id}/edit`}
              >
                <Pencil aria-hidden="true" className="size-4" />
                Edit
              </Link>
              <ShiftLifecycleDialog shift={shift} />
            </div>
          ) : undefined
        }
        description="Review scheduled timings, active working days, grace periods, and break allowances."
        eyebrow="Shift record"
        title={shift?.name ?? "Shift details"}
      />

      {successMessage && (
        <div
          className="mb-6 flex gap-3 rounded-lg border border-success/20 bg-success-soft p-4 text-sm text-success"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
          {successMessage}
        </div>
      )}

      {query.isLoading ? (
        <DetailSkeleton />
      ) : query.isError ? (
        isShiftNotFoundError(query.error) ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <h2 className="text-lg font-semibold">Shift not found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The shift may no longer exist or the link is invalid.
              </p>
              <Link
                className={buttonVariants({ variant: "outline" }) + " mt-5"}
                href="/admin/shifts"
              >
                Return to directory
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ShiftErrorState
            message={getShiftErrorMessage(query.error)}
            retry={() => query.refetch()}
          />
        )
      ) : shift ? (
        <ShiftInformation shift={shift} />
      ) : null}
    </PageContainer>
  );
}

