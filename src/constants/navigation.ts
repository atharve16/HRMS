import {
  BadgeDollarSign,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  MapPin,
  PartyPopper,
  Settings,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

import type { NavigationSection } from "@/types/navigation";

export const adminNavigation: NavigationSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Workforce",
    items: [
      { label: "Employees", href: "/admin/employees", icon: Users },
      { label: "Departments", href: "/admin/departments", icon: Building2 },
      { label: "Attendance", href: "/admin/attendance", icon: Clock3 },
      { label: "Shifts", href: "/admin/shifts", icon: CalendarClock },
      { label: "Office locations", href: "/admin/office-locations", icon: MapPin },
      {
        label: "Work assignments",
        href: "/admin/work-assignments",
        icon: BriefcaseBusiness,
      },
    ],
  },
  {
    label: "Time & pay",
    items: [
      { label: "Leaves", href: "/admin/leaves", icon: CalendarDays },
      { label: "Holidays", href: "/admin/holidays", icon: PartyPopper },
      { label: "Payroll", href: "/admin/payroll", icon: WalletCards },
      { label: "Bonuses", href: "/admin/bonuses", icon: BadgeDollarSign },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

export const employeeNavigation: NavigationSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
      { label: "Attendance", href: "/employee/attendance", icon: CalendarCheck },
      { label: "Leaves", href: "/employee/leaves", icon: CalendarDays },
      { label: "Holidays", href: "/employee/holidays", icon: PartyPopper },
      { label: "Salary", href: "/employee/salary", icon: WalletCards },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Notifications", href: "/employee/notifications", icon: Bell },
      { label: "Profile", href: "/employee/profile", icon: UserRound },
    ],
  },
];
