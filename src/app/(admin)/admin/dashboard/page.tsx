import { CalendarDays, Clock3, UserCheck, Users } from "lucide-react";

import { AttendanceOverview } from "@/components/charts/attendance-overview";
import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { DemoBanner } from "@/components/shared/demo-banner";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function AdminDashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        actions={<Badge variant="neutral">Static preview</Badge>}
        description="A clear view of workforce activity, requests, and attendance patterns."
        eyebrow="Admin workspace"
        title="Workforce overview"
      />
      <DemoBanner />

      <section aria-label="Sample workforce statistics" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard helper="Illustrative organization headcount" icon={Users} label="Total employees" value="248" />
        <StatCard helper="Sample count for today" icon={UserCheck} label="Present today" tone="success" value="221" />
        <StatCard helper="Sample requests awaiting review" icon={CalendarDays} label="Pending leave requests" tone="warning" value="12" />
        <StatCard helper="Illustrative average this week" icon={Clock3} label="Attendance rate" tone="info" value="91.4%" />
      </section>

      <section aria-label="Sample attendance insights" className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
        <AttendanceOverview />
        <Card>
          <CardHeader>
            <CardTitle>Today at a glance</CardTitle>
            <CardDescription>Illustrative workforce distribution for this preview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Present</span><span className="text-muted-foreground">89%</span>
              </div>
              <Progress indicatorClassName="bg-success" label="Sample present rate" value={89} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Remote</span><span className="text-muted-foreground">7%</span>
              </div>
              <Progress indicatorClassName="bg-info" label="Sample remote rate" value={7} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">On leave</span><span className="text-muted-foreground">4%</span>
              </div>
              <Progress indicatorClassName="bg-warning" label="Sample leave rate" value={4} />
            </div>
            <div className="rounded-lg bg-muted p-4 text-sm leading-6 text-muted-foreground">
              Dashboard analytics are visual placeholders. Live totals will be connected in a later phase.
            </div>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}
