"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavigationSection } from "@/types/navigation";

import { DashboardBrand } from "./dashboard-brand";

type DashboardSidebarProps = {
  navigation: NavigationSection[];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({
  navigation,
  collapsed,
  onCollapsedChange,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 border-r border-border bg-card transition-[width] duration-200 lg:flex lg:flex-col",
        collapsed ? "w-[5.25rem]" : "w-[16.5rem]",
      )}
    >
      <div className="flex h-20 items-center border-b border-border px-5">
        <DashboardBrand compact={collapsed} />
      </div>

      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((section) => (
          <div className="mb-5 last:mb-0" key={section.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {section.label}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isRouteActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                        active && "bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary",
                        collapsed && "justify-center px-0",
                      )}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon aria-hidden="true" className="size-[1.125rem] shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className={cn("w-full", collapsed && "px-0")}
          onClick={() => onCollapsedChange(!collapsed)}
          type="button"
          variant="ghost"
        >
          {collapsed ? (
            <ChevronRight aria-hidden="true" className="size-4" />
          ) : (
            <>
              <ChevronLeft aria-hidden="true" className="size-4" />
              Collapse sidebar
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
