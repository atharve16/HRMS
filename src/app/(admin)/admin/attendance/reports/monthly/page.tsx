import { MonthlyAttendanceReport } from "@/features/attendance/components/monthly-attendance-report";

export const metadata = {
  title: "Monthly Attendance Reports | HRMS Admin",
  description: "Monthly employee attendance status matrix and attendance totals.",
};

export default function Page() {
  return <MonthlyAttendanceReport />;
}
