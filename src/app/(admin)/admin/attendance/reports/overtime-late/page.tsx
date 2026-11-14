import { OvertimeLateReport } from "@/features/attendance/components/overtime-late-report";

export const metadata = {
  title: "Overtime & Late Report | HRMS Admin",
  description: "Monthly employee overtime and late arrival report.",
};

export default function Page() {
  return <OvertimeLateReport />;
}
