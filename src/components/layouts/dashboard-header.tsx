"use client";

import { ChevronDown, CircleHelp, LoaderCircle, LogOut, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardIdentity, NavigationSection } from "@/types/navigation";
import { NotificationHeaderDropdown } from "@/features/notifications/components/notification-header-dropdown";
import { useAuth } from "@/providers/auth-provider";

import { InstallAppButton } from "../pwa/install-app";
import { MobileNavigation } from "./mobile-navigation";

function getPageTitle(pathname: string, navigation: NavigationSection[]) {
  const match = navigation
    .flatMap((section) => section.items)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return match?.label ?? "PeopleFlow";
}

type DashboardHeaderProps = {
  navigation: NavigationSection[];
  identity: DashboardIdentity;
};

export function DashboardHeader({ navigation, identity }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, session } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const pageTitle = getPageTitle(pathname, navigation);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // The provider clears local state even when the backend cannot be reached.
    } finally {
      router.replace("/login");
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <MobileNavigation navigation={navigation} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground sm:text-base">{pageTitle}</p>
          <p className="hidden text-xs text-muted-foreground sm:block">People operations workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button aria-label="Help and support" className="hidden sm:inline-flex" size="icon" variant="ghost">
          <CircleHelp aria-hidden="true" className="size-5" />
        </Button>
        <InstallAppButton />
        <NotificationHeaderDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="ml-1 gap-2 px-1.5 sm:px-2" variant="ghost">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                {identity.initials}
              </span>
              <span className="hidden min-w-0 text-left md:block">
                <span className="block max-w-32 truncate text-xs font-semibold text-foreground">
                  {identity.name}
                </span>
                <span className="block text-[0.6875rem] font-normal text-muted-foreground">
                  {identity.role}
                </span>
              </span>
              <ChevronDown aria-hidden="true" className="hidden size-4 text-muted-foreground md:block" />
              <span className="sr-only">Open user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              Signed in
              <span className="mt-0.5 block max-w-64 truncate font-normal">
                {session?.user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={session?.user.role !== "EMPLOYEE"}>
              <UserRound aria-hidden="true" className="size-4" />
              {session?.user.role === "EMPLOYEE" ? "Employee profile" : "Profile unavailable"}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={loggingOut} onSelect={handleLogout}>
              {loggingOut ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <LogOut aria-hidden="true" className="size-4" />
              )}
              {loggingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
