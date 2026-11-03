import { AdminAttendanceDetailScreen } from "@/features/attendance/components/admin-attendance-detail-screen";

export const metadata = {
  title: "Attendance Record Details | HRMS Admin",
  description: "View detailed punches, geofence validations, break calculations, and audit history.",
};

export default function Page() {
  return <AdminAttendanceDetailScreen />;
}

