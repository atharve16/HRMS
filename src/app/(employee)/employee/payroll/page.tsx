import { EmployeePayrollScreen } from "@/features/payroll/components/employee-payroll-screen";

export const metadata = {
  title: "My Payslips | HRMS",
  description: "View and review monthly salary payslips and payment history.",
};

export default function Page() {
  return <EmployeePayrollScreen />;
}

