import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { ShiftForm } from "@/features/shifts/components/shift-form";

export default function NewShiftPage() {
  return (
    <PageContainer>
      <PageHeader
        description="Configure a new work shift with schedule timings, working days, and grace policies."
        eyebrow="Shift directory"
        title="Add shift"
      />
      <ShiftForm mode="create" />
    </PageContainer>
  );
}

