"use client";

import { useState, type ReactNode } from "react";

import type { DashboardIdentity, NavigationSection } from "@/types/navigation";

import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { MobileBottomNavigation } from "./mobile-bottom-navigation";

type DashboardShellProps = {
  children: ReactNode;
  navigation: NavigationSection[];
  identity: DashboardIdentity;
};

export function DashboardShell({ children, navigation, identity }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-svh bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        navigation={navigation}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div className="min-w-0 flex-1">
        <DashboardHeader identity={identity} navigation={navigation} />
        <main className="pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </main>
      </div>
      <MobileBottomNavigation navigation={navigation} />
    </div>
  );
}
