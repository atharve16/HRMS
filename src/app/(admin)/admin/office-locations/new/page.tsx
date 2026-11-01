import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { OfficeLocationForm } from "@/features/office-locations/components/office-location-form";

export default function NewOfficeLocationPage() {
  return (
    <PageContainer>
      <PageHeader
        description="Define a new physical workplace with geographic coordinates and geofence boundary."
        eyebrow="Office location directory"
        title="Add office location"
      />
      <OfficeLocationForm mode="create" />
    </PageContainer>
  );
}

