import { FlaskConical } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-info/20 bg-info-soft px-4 py-3 text-sm text-info" role="note">
      <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-semibold">Demonstration data.</span>{" "}
        Every value on this dashboard is static sample content and is not connected to company records.
      </p>
    </div>
  );
}
