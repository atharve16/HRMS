import { NotificationInboxScreen } from "@/features/notifications/components/notification-inbox-screen";

export const metadata = {
  title: "Notifications | HRMS",
  description: "View announcements, approvals, and notices.",
};

export default function Page() {
  return <NotificationInboxScreen />;
}
