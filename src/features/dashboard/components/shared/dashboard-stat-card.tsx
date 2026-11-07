import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStatTone } from "@/features/dashboard/types/dashboard-types";
import { cn } from "@/lib/utils";

const toneClasses: Record<DashboardStatTone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  neutral: "bg-muted text-muted-foreground",
  destructive: "bg-destructive-soft text-destructive",
};

export type DashboardStatCardProps = {
  label: string;
  value?: string | number | null;
  helper: string;
  icon: LucideIcon;
  tone?: DashboardStatTone;
  isLoading?: boolean;
  isError?: boolean;
  unavailable?: boolean;
  href?: string;
  ariaLabel?: string;
};

export function DashboardStatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "primary",
  isLoading = false,
  isError = false,
  unavailable = false,
  href,
  ariaLabel,
}: DashboardStatCardProps) {
  const cardContent = (
    <Card className={cn("transition-colors", href && "hover:border-primary/50 cursor-pointer")}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
            {isLoading ? (
              <div className="mt-2 space-y-1">
                <Skeleton className="h-8 w-20" />
              </div>
            ) : isError ? (
              <p className="mt-2 text-sm font-semibold text-destructive">Failed to load</p>
            ) : unavailable ? (
              <p className="mt-2 text-xl font-semibold text-muted-foreground">Unavailable</p>
            ) : (
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {value ?? "—"}
              </p>
            )}
          </div>
          <span
            aria-hidden="true"
            className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}
          >
            <Icon className="size-5" />
          </span>
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );

  if (href && !isLoading && !isError) {
    return (
      <Link aria-label={ariaLabel ?? label} className="block no-underline" href={href}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

