import type { LucideIcon } from "lucide-react";

export type DashboardStatTone = "primary" | "success" | "warning" | "info" | "neutral" | "destructive";

export type StatMetric = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: DashboardStatTone;
  isLoading?: boolean;
  isError?: boolean;
  unavailable?: boolean;
  href?: string;
};

export type DepartmentDistributionItem = {
  departmentId: string;
  departmentCode: string;
  name: string;
  employeeCount: number;
  percentage: number;
};

