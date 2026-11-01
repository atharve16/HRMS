"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { NavigationSection } from "@/types/navigation";

import { DashboardBrand } from "./dashboard-brand";

export function MobileNavigation({ navigation }: { navigation: NavigationSection[] }) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button aria-label="Open navigation" className="lg:hidden" size="icon" variant="ghost">
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="border-b border-border px-5 py-5 pr-16">
          <DashboardBrand />
          <SheetTitle className="sr-only">Main navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to another section of PeopleFlow.
          </SheetDescription>
        </div>
        <nav aria-label="Mobile navigation" className="h-[calc(100svh-5.0625rem)] overflow-y-auto px-3 py-5">
          {navigation.map((section) => (
            <div className="mb-5 last:mb-0" key={section.label}>
              <p className="mb-2 px-3 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <Link
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                            active && "bg-primary-soft text-primary",
                          )}
                          href={item.href}
                        >
                          <Icon aria-hidden="true" className="size-[1.125rem]" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
