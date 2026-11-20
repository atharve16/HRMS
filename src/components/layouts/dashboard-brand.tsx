import Image from "next/image";

import { cn } from "@/lib/utils";

export function DashboardBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center", compact && "justify-center")}>
      <Image
        alt="HRMS"
        className={cn("object-contain", compact ? "size-10" : "h-10 w-40")}
        height={compact ? 40 : 349}
        priority
        src={compact ? "/icons/hrms-192.png" : "/icons/hrms-brand.png"}
        width={compact ? 40 : 640}
      />
    </div>
  );
}
