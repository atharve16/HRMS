import { AdminHolidayDirectory } from "@/features/holidays/components/admin-holiday-directory";

export const metadata = {
  title: "Company Holidays | HRMS Admin",
  description: "Manage official company-wide paid holidays.",
};

export default function Page() {
  return <AdminHolidayDirectory />;
}
