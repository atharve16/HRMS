"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  admin: "Admin",
  employee: "Employee",
  dashboard: "Dashboard",
  employees: "Employees",
  edit: "Edit",
  departments: "Departments",
  attendance: "Attendance",
  shifts: "Shifts",
  "office-locations": "Office locations",
  "work-assignments": "Work assignments",
  leaves: "Leaves",
  holidays: "Holidays",
  payroll: "Payroll",
  bonuses: "Bonuses",
  settings: "Settings",
  "check-in": "Check in",
  salary: "Salary",
  notifications: "Notifications",
  profile: "Profile",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <li>
          <Link
            aria-label="Dashboard home"
            className="inline-flex min-h-8 items-center rounded-sm px-1 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            href={`/${segments[0] ?? "admin"}/dashboard`}
          >
            <Home aria-hidden="true" className="size-3.5" />
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const current = index === segments.length - 1;
          const parent = segments[index - 1];
          const isRecordId = (parent === "employees" || parent === "departments") && !labels[segment];
          const contextualLabel = segment === "new"
            ? parent === "departments" ? "Add department" : "Add employee"
            : isRecordId ? parent === "departments" ? "Department details" : "Employee details"
            : undefined;
          const label = labels[segment] ?? contextualLabel ?? segment;

          return (
            <li className="flex items-center gap-1" key={href}>
              <ChevronRight aria-hidden="true" className="size-3.5" />
              {current ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {label}
                </span>
              ) : (
                <Link className="rounded-sm px-1 py-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={href}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
