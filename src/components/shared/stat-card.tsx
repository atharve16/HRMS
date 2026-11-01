import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info";
};

const toneClasses = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "primary",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
          </div>
          <span className={cn("flex size-11 items-center justify-center rounded-lg", toneClasses[tone])}>
            <Icon aria-hidden="true" className="size-5" />
          </span>
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
