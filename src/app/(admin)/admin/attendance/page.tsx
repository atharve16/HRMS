import { AdminAttendanceDirectory } from "@/features/attendance/components/admin-attendance-directory";

export const metadata = {
  title: "Attendance Management | HRMS Admin",
  description: "Monitor organization-wide punches, geofence validations, and attendance corrections.",
};

export default function Page() {
  return <AdminAttendanceDirectory />;
}
