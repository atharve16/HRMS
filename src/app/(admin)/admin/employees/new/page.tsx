import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { EmployeeForm } from "@/features/employees/components/employee-form";

export default function NewEmployeePage() {
  return (
    <PageContainer>
      <PageHeader
        description="Create the employee profile and linked login account using backend-validated information."
        eyebrow="Employee directory"
        title="Add employee"
      />
      <EmployeeForm mode="create" />
    </PageContainer>
  );
}
