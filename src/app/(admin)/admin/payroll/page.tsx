import { AdminPayrollDirectory } from "@/features/payroll/components/admin-payroll-directory";

export const metadata = {
  title: "Payroll Management | HRMS Admin",
  description: "Generate, review, and manage monthly employee payroll records.",
};

export default function Page() {
  return <AdminPayrollDirectory />;
}
