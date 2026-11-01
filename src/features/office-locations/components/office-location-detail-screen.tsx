"use client";

import { CheckCircle2, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OfficeLocationInformation } from "@/features/office-locations/components/office-location-information";
import { OfficeLocationLifecycleDialog } from "@/features/office-locations/components/office-location-lifecycle-dialog";
import { OfficeLocationErrorState } from "@/features/office-locations/components/office-location-query-state";
import { useOfficeLocation } from "@/features/office-locations/hooks/use-office-location";
import {
  getOfficeLocationErrorMessage,
  isOfficeLocationNotFoundError,
} from "@/features/office-locations/utils/office-location-errors";

function DetailSkeleton() {
  return (
    <div
      aria-label="Loading office location"
      className="space-y-6"
      role="status"
    >
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
      <span className="sr-only">Loading office location details...</span>
    </div>
  );
}

export function OfficeLocationDetailScreen() {
  const params = useParams<{ officeLocationId: string }>();
  const searchParams = useSearchParams();
  const query = useOfficeLocation(params.officeLocationId);
  const officeLocation = query.data;

  const successMessage =
    searchParams.get("created") === "1"
      ? "Office location created successfully."
      : searchParams.get("updated") === "1"
        ? "Office location information updated successfully."
        : null;

  return (
    <PageContainer>
      <PageHeader
        actions={
          officeLocation ? (
            <div className="flex flex-wrap gap-2">
              <Link
                className={buttonVariants({ variant: "outline" })}
                href={`/admin/office-locations/${officeLocation.id}/edit`}
              >
                <Pencil aria-hidden="true" className="size-4" />
                Edit
              </Link>
              <OfficeLocationLifecycleDialog officeLocation={officeLocation} />
            </div>
          ) : undefined
        }
        description="Review physical address, geographic coordinates, and geofence parameters."
        eyebrow="Office location record"
        title={officeLocation?.name ?? "Office location details"}
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
        isOfficeLocationNotFoundError(query.error) ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <h2 className="text-lg font-semibold">Office location not found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The office location may no longer exist or the link is invalid.
              </p>
              <Link
                className={buttonVariants({ variant: "outline" }) + " mt-5"}
                href="/admin/office-locations"
              >
                Return to directory
              </Link>
            </CardContent>
          </Card>
        ) : (
          <OfficeLocationErrorState
            message={getOfficeLocationErrorMessage(query.error)}
            retry={() => query.refetch()}
          />
        )
      ) : officeLocation ? (
        <OfficeLocationInformation officeLocation={officeLocation} />
      ) : null}
    </PageContainer>
  );
}

