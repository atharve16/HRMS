import { EmployeePayrollScreen } from "@/features/payroll/components/employee-payroll-screen";

export const metadata = {
  title: "My Salary & Payslips | HRMS",
  description: "View monthly payslips, salary structures, and payment history.",
};

export default function Page() {
  return <EmployeePayrollScreen />;
}
