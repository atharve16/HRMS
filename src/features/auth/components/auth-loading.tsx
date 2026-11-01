import { LoaderCircle } from "lucide-react";

export function AuthLoading({ label = "Restoring your session" }: { label?: string }) {
  return (
    <div
      aria-live="polite"
      className="flex min-h-svh items-center justify-center bg-background px-4"
      role="status"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-primary" />
        {label}
      </div>
    </div>
  );
}
