import type { ReactNode } from "react";

import { GuestGuard } from "@/features/auth/components/guest-guard";

export default function AuthRouteLayout({ children }: { children: ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
