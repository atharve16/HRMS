import { AdminLeaveDirectory } from "@/features/leaves/components/admin-leave-directory";

export const metadata = {
  title: "Leave Requests | HRMS Admin",
  description: "Review and manage employee leave applications.",
};

export default function Page() {
  return <AdminLeaveDirectory />;
}
