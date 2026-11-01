"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OfficeLocationForm } from "@/features/office-locations/components/office-location-form";
import { OfficeLocationErrorState } from "@/features/office-locations/components/office-location-query-state";
import { useOfficeLocation } from "@/features/office-locations/hooks/use-office-location";
import {
  getOfficeLocationErrorMessage,
  isOfficeLocationNotFoundError,
} from "@/features/office-locations/utils/office-location-errors";

export function OfficeLocationEditScreen() {
  const params = useParams<{ officeLocationId: string }>();
  const query = useOfficeLocation(params.officeLocationId);

  return (
    <PageContainer>
      <PageHeader
        description="Update only the fields supported by the office location API."
        eyebrow="Office location record"
        title={
          query.data ? `Edit ${query.data.name}` : "Edit office location"
        }
      />
      {query.isLoading ? (
        <div className="space-y-6" role="status">
          <Skeleton className="h-96 rounded-xl" />
          <span className="sr-only">Loading office location form...</span>
        </div>
      ) : query.isError ? (
        isOfficeLocationNotFoundError(query.error) ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <h2 className="text-lg font-semibold">Office location not found</h2>
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
      ) : query.data ? (
        <OfficeLocationForm
          mode="edit"
          officeLocation={query.data}
        />
      ) : null}
    </PageContainer>
  );
}

