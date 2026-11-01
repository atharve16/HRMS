import { Blocks } from "lucide-react";

import { cn } from "@/lib/utils";

export function DashboardBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", compact && "justify-center")}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Blocks aria-hidden="true" className="size-5" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold tracking-tight">PeopleFlow</span>
          <span className="block truncate text-xs text-muted-foreground">HR Management</span>
        </span>
      )}
    </div>
  );
}
