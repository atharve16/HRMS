import { CalendarDays, Clock3, LogIn, Timer } from "lucide-react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { DemoBanner } from "@/components/shared/demo-banner";
import { StatCard } from "@/components/shared/stat-card";
import { RecentActivityTable } from "@/components/tables/recent-activity-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function EmployeeDashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        actions={<Badge variant="neutral">Static preview</Badge>}
        description="Your daily attendance, time summary, leave balance, and recent activity in one place."
        eyebrow="Employee workspace"
        title="Your workday overview"
      />
      <DemoBanner />

      <section aria-label="Sample employee statistics" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard helper="Illustrative check-in state" icon={LogIn} label="Today's attendance" tone="success" value="On time" />
        <StatCard helper="Sample elapsed time today" icon={Timer} label="Working hours" value="6h 42m" />
        <StatCard helper="Illustrative annual balance" icon={CalendarDays} label="Leave balance" tone="info" value="14 days" />
        <StatCard helper="Sample expected end time" icon={Clock3} label="Shift ends" tone="warning" value="6:00 PM" />
      </section>

      <section aria-label="Sample personal insights" className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.6fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s working hours</CardTitle>
            <CardDescription>Demonstration progress against an 8-hour workday.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-3xl font-bold tracking-tight">6h 42m</p><p className="mt-1 text-xs text-muted-foreground">of 8h sample shift</p></div>
              <Badge variant="success">84% complete</Badge>
            </div>
            <Progress className="mt-5 h-2.5" label="Sample workday progress" value={84} />
            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 text-sm">
              <div><dt className="text-muted-foreground">Sample check-in</dt><dd className="mt-1 font-semibold">09:04 AM</dd></div>
              <div><dt className="text-muted-foreground">Sample break</dt><dd className="mt-1 font-semibold">38 min</dd></div>
            </dl>
          </CardContent>
        </Card>
        <RecentActivityTable />
      </section>
    </PageContainer>
  );
}
