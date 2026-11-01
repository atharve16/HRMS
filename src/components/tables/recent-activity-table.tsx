import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const sampleActivity = [
  { event: "Checked in", detail: "Main office · 09:04", when: "Today", status: "On time" },
  { event: "Leave request", detail: "Personal leave · 1 day", when: "Oct 28", status: "Approved" },
  { event: "Profile review", detail: "Contact details confirmed", when: "Oct 24", status: "Complete" },
];

export function RecentActivityTable() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Example activity entries for layout demonstration.</CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Activity</TableHead>
            <TableHead className="hidden sm:table-cell">When</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleActivity.map((item) => (
            <TableRow key={item.event}>
              <TableCell>
                <span className="block font-medium">{item.event}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">{item.when}</TableCell>
              <TableCell className="text-right">
                <Badge variant={item.status === "On time" ? "info" : "success"}>{item.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
