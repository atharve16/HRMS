import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sampleWeek = [
  { day: "Mon", present: 86, absent: 14 },
  { day: "Tue", present: 92, absent: 8 },
  { day: "Wed", present: 88, absent: 12 },
  { day: "Thu", present: 95, absent: 5 },
  { day: "Fri", present: 90, absent: 10 },
];

export function AttendanceOverview() {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Attendance overview</CardTitle>
          <CardDescription>Sample attendance rate for a demonstration work week.</CardDescription>
        </div>
        <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
          Demo week
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex h-56 items-end justify-between gap-3 rounded-lg bg-muted/60 px-4 pb-4 pt-8 sm:gap-5 sm:px-6">
          {sampleWeek.map((item) => (
            <div className="flex h-full min-w-0 flex-1 flex-col justify-end" key={item.day}>
              <div className="flex min-h-0 flex-1 items-end justify-center">
                <div
                  aria-label={`${item.day}: ${item.present}% sample attendance`}
                  className="w-full max-w-12 rounded-t-md bg-primary"
                  role="img"
                  style={{ height: `${item.present}%` }}
                />
              </div>
              <span className="mt-3 text-center text-xs font-medium text-muted-foreground">{item.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-sm bg-primary" /> Present rate
          </span>
          <span>Values are illustrative percentages</span>
        </div>
      </CardContent>
    </Card>
  );
}
