import { Badge } from "@/components/ui/badge";

export function HolidayStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "success" : "neutral"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

