import { WorkingHoursReport } from "@/features/attendance/components/working-hours-report";

export const metadata = {
  title: "Working Hours Report | HRMS Admin",
  description: "Daily and monthly employee working hours report.",
};

export default function Page() {
  return <WorkingHoursReport />;
}
