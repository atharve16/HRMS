"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShiftForm } from "@/features/shifts/components/shift-form";
import { ShiftErrorState } from "@/features/shifts/components/shift-query-state";
import { useShift } from "@/features/shifts/hooks/use-shift";
import {
  getShiftErrorMessage,
  isShiftNotFoundError,
} from "@/features/shifts/utils/shift-errors";

export function ShiftEditScreen() {
  const params = useParams<{ shiftId: string }>();
  const query = useShift(params.shiftId);

  return (
    <PageContainer>
      <PageHeader
        description="Update only the fields supported by the shift API."
        eyebrow="Shift record"
        title={query.data ? `Edit ${query.data.name}` : "Edit shift"}
      />
      {query.isLoading ? (
        <div className="space-y-6" role="status">
          <Skeleton className="h-96 rounded-xl" />
          <span className="sr-only">Loading shift form...</span>
        </div>
      ) : query.isError ? (
        isShiftNotFoundError(query.error) ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <h2 className="text-lg font-semibold">Shift not found</h2>
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
      ) : query.data ? (
        <ShiftForm mode="edit" shift={query.data} />
      ) : null}
    </PageContainer>
  );
}

