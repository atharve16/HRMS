"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavigationSection } from "@/types/navigation";

import {
  MOBILE_BOTTOM_NAVIGATION_SAFE_AREA_CLASS,
  MOBILE_NAVIGATION_VISIBILITY_CLASS,
  flattenNavigationItems,
  getActiveNavigationHref,
} from "./navigation-model";

export function MobileBottomNavigation({ navigation }: { navigation: NavigationSection[] }) {
  const pathname = usePathname();
  const items = flattenNavigationItems(navigation);
  const activeHref = getActiveNavigationHref(pathname, items);

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        MOBILE_BOTTOM_NAVIGATION_SAFE_AREA_CLASS,
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-overlay backdrop-blur",
        MOBILE_NAVIGATION_VISIBILITY_CLASS,
      )}
    >
      <div className="flex min-w-max gap-1 overflow-x-auto px-2 pt-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === activeHref;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                active && "bg-primary-soft text-primary",
              )}
              href={item.href}
              key={item.href}
              title={item.label}
            >
              <Icon aria-hidden="true" className="size-5" />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
