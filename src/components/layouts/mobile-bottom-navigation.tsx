"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavigationItem, NavigationSection } from "@/types/navigation";

function flattenNavigation(sections: NavigationSection[]) {
  return sections.flatMap((section) =>
    section.items.flatMap((item) => item.children?.length ? item.children : [item]),
  );
}

export function MobileBottomNavigation({
  navigation,
}: {
  navigation: NavigationSection[];
}) {
  const pathname = usePathname();
  const items = flattenNavigation(navigation);

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(16_24_40_/_0.06)] backdrop-blur lg:hidden"
    >
      <ul className="flex h-14 items-stretch gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item: NavigationItem) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li className="shrink-0" key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "flex size-14 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  active && "bg-primary-soft text-primary",
                )}
                href={item.href}
                title={item.label}
              >
                <Icon aria-hidden="true" className="size-5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
