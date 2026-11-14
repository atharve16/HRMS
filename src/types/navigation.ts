import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavigationItem[];
};

export type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

export type DashboardIdentity = {
  name: string;
  role: string;
  initials: string;
};
