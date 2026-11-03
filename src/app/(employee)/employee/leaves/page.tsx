import { EmployeeLeaveScreen } from "@/features/leaves/components/employee-leave-screen";

export const metadata = {
  title: "My Leaves | HRMS",
  description: "View leave balances and manage leave requests.",
};

export default function Page() {
  return <EmployeeLeaveScreen />;
}
