import { EmployeeAttendanceScreen } from "@/features/attendance/components/employee-attendance-screen";

export const metadata = {
  title: "Check In / Out | HRMS",
  description: "Record attendance check-in and check-out punches.",
};

export default function Page() {
  return <EmployeeAttendanceScreen />;
}
