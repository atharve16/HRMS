import { EmployeeAttendanceScreen } from "@/features/attendance/components/employee-attendance-screen";

export const metadata = {
  title: "My Attendance | HRMS",
  description: "Punch in/out and view daily attendance history.",
};

export default function Page() {
  return <EmployeeAttendanceScreen />;
}
