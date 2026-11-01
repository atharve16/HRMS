import { AlertCircle, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ShiftErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-destructive-soft text-destructive">
          <AlertCircle aria-hidden="true" className="size-6" />
        </span>
        <div>
          <h2 className="font-semibold">Shift information is unavailable</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
        </div>
        <Button onClick={retry} type="button" variant="outline">
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

export function ShiftEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <CalendarClock aria-hidden="true" className="size-6" />
      </span>
      <h2 className="mt-4 font-semibold">
        {filtered ? "No matching shifts" : "No shifts yet"}
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {filtered
          ? "Adjust the search or clear the filters to see more results."
          : "Create a work shift to configure schedules, grace periods, and break policies."}
      </p>
    </div>
  );
}

