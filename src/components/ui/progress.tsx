import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  label: string;
  className?: string;
  indicatorClassName?: string;
};

export function Progress({
  value,
  label,
  className,
  indicatorClassName,
}: ProgressProps) {
  const boundedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={boundedValue}
      className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
    >
      <div
        className={cn("h-full rounded-full bg-primary transition-all", indicatorClassName)}
        style={{ width: `${boundedValue}%` }}
      />
    </div>
  );
}
