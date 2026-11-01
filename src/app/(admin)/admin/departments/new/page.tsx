import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { DepartmentForm } from "@/features/departments/components/department-form";

export default function NewDepartmentPage() {
  return (
    <PageContainer>
      <PageHeader description="Create an organizational department and optionally assign an active employee as its manager." eyebrow="Department directory" title="Add department" />
      <DepartmentForm mode="create" />
    </PageContainer>
  );
}
