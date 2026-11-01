import { WorkAssignmentDirectory } from "@/features/work-assignments/components/work-assignment-directory";

export const metadata = {
  title: "Work Assignments | HRMS Admin",
  description: "Manage employee work schedules and office location assignments.",
};

export default function Page() {
  return <WorkAssignmentDirectory />;
}
