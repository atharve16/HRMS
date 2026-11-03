import { AlertCircle, PartyPopper } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HolidayErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center p-6">
        <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle aria-hidden="true" className="size-6" />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">
            Holiday information is unavailable
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
        </div>
        {retry && (
          <Button onClick={retry} type="button" variant="outline">
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function HolidayEmptyState({
  title = "No holidays found",
  description = "No company holidays match the selected criteria.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center border rounded-xl border-dashed border-border bg-card/40">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <PartyPopper aria-hidden="true" className="size-6" />
      </span>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function HolidaySkeleton() {
  return (
    <div aria-label="Loading holiday data" className="space-y-4" role="status">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

