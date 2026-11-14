"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavigationItem, NavigationSection } from "@/types/navigation";

import { DashboardBrand } from "./dashboard-brand";

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isItemActive(pathname: string, item: NavigationItem) {
  return isRouteActive(pathname, item.href)
    || Boolean(item.children?.some((child) => isRouteActive(pathname, child.href)));
}

export function DashboardSidebar({
  navigation,
  collapsed,
  onCollapsedChange,
}: {
  navigation: NavigationSection[];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const activeExpandableItems = navigation
      .flatMap((section) => section.items)
      .filter((item) => item.children?.some((child) => isRouteActive(pathname, child.href)))
      .map((item) => item.href);

    if (activeExpandableItems.length > 0) {
      setExpandedItems((current) => Array.from(new Set([...current, ...activeExpandableItems])));
    }
  }, [navigation, pathname]);

  function toggleItem(href: string) {
    setExpandedItems((current) => current.includes(href)
      ? current.filter((item) => item !== href)
      : [...current, href]);
  }

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
                const active = isItemActive(pathname, item);
                const Icon = item.icon;
                const expandable = Boolean(item.children?.length);
                const expanded = expandedItems.includes(item.href);

                return (
                  <li key={item.href}>
                    {expandable ? (
                      <>
                        <button
                          aria-controls={`navigation-${item.href.replaceAll("/", "-")}`}
                          aria-expanded={expanded}
                          aria-label={collapsed ? item.label : undefined}
                          className={cn(
                            "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                            active && "bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary",
                            collapsed && "justify-center px-0",
                          )}
                          onClick={() => toggleItem(item.href)}
                          title={collapsed ? item.label : undefined}
                          type="button"
                        >
                          <Icon aria-hidden="true" className="size-[1.125rem] shrink-0" />
                          {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                          {!collapsed && (
                            <ChevronDown
                              aria-hidden="true"
                              className={cn("size-4 shrink-0 transition-transform", expanded && "rotate-180")}
                            />
                          )}
                        </button>
                        {expanded && (
                          <ul
                            className={cn("mt-1 space-y-1", collapsed ? "pl-0" : "ml-4 border-l border-border pl-3")}
                            id={`navigation-${item.href.replaceAll("/", "-")}`}
                          >
                            {item.children?.map((child) => {
                              const ChildIcon = child.icon;
                              const childActive = pathname === child.href;
                              return (
                                <li key={child.href}>
                                  <Link
                                    aria-current={childActive ? "page" : undefined}
                                    className={cn(
                                      "flex min-h-10 items-center gap-3 rounded-lg px-3 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                                      childActive && "bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary",
                                      collapsed && "justify-center px-0",
                                    )}
                                    href={child.href}
                                    title={collapsed ? child.label : undefined}
                                  >
                                    <ChildIcon aria-hidden="true" className="size-4 shrink-0" />
                                    {!collapsed && <span className="truncate">{child.label}</span>}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </>
                    ) : (
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
                    )}
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
