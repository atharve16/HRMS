"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, type FieldError } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDepartment } from "@/features/departments/hooks/use-create-department";
import { useUpdateDepartment } from "@/features/departments/hooks/use-update-department";
import {
  departmentFormSchema,
  type DepartmentFormValues,
} from "@/features/departments/schemas/department-schemas";
import type { Department } from "@/features/departments/types/department-types";
import {
  applyDepartmentFieldErrors,
  getDepartmentErrorMessage,
} from "@/features/departments/utils/department-errors";
import {
  departmentToFormValues,
  emptyDepartmentFormValues,
  toCreateDepartmentRequest,
  toUpdateDepartmentRequest,
} from "@/features/departments/utils/department-form-utils";
import { useManagerOptions } from "@/features/employees/hooks/use-employee-references";
import { employeeFullName } from "@/features/employees/utils/employee-display";
import { cn } from "@/lib/utils";

function FormField({
  children,
  error,
  hint,
  htmlFor,
  label,
}: {
  children: ReactNode;
  error?: FieldError;
  hint?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive" id={`${htmlFor}-error`} role="alert">{error.message}</p> : hint ? <p className="text-xs text-muted-foreground" id={`${htmlFor}-hint`}>{hint}</p> : null}
    </div>
  );
}

export function DepartmentForm({
  department,
  mode,
}: {
  department?: Department;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const managers = useManagerOptions();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: department ? departmentToFormValues(department) : emptyDepartmentFormValues,
  });
  const mutation = mode === "create" ? createMutation : updateMutation;
  const currentManagerMissing = department?.managerEmployeeId &&
    !managers.data?.content.some((employee) => employee.id === department.managerEmployeeId);

  async function submit(values: DepartmentFormValues) {
    mutation.reset();
    setFormMessage(null);
    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync(toCreateDepartmentRequest(values));
        router.push(`/admin/departments/${created.id}?created=1`);
        return;
      }
      if (!department) return;
      const request = toUpdateDepartmentRequest(values, department);
      if (Object.keys(request).length === 0) {
        setFormMessage("No supported department fields have changed.");
        return;
      }
      const updated = await updateMutation.mutateAsync({ departmentId: department.id, request });
      router.push(`/admin/departments/${updated.id}?updated=1`);
    } catch (error) {
      applyDepartmentFieldErrors(error, form.setError);
    }
  }

  return (
    <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submit)}>
      <fieldset disabled={mutation.isPending}>
        <Card>
          <CardHeader>
            <CardTitle>Department information</CardTitle>
            <CardDescription>Codes and names must remain unique across the organization.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <FormField error={form.formState.errors.departmentCode} hint="2-20 letters, numbers, underscores, or hyphens. Saved in uppercase." htmlFor="departmentCode" label="Department code">
              <Input {...form.register("departmentCode")} aria-describedby={form.formState.errors.departmentCode ? "departmentCode-error" : "departmentCode-hint"} aria-invalid={Boolean(form.formState.errors.departmentCode)} className="uppercase" id="departmentCode" placeholder="ENG" />
            </FormField>
            <FormField error={form.formState.errors.name} htmlFor="name" label="Department name">
              <Input {...form.register("name")} aria-invalid={Boolean(form.formState.errors.name)} id="name" placeholder="Engineering" />
            </FormField>
            <div className="sm:col-span-2">
              <FormField error={form.formState.errors.description} hint="Optional, up to 1,000 characters." htmlFor="description" label="Description">
                <Textarea {...form.register("description")} aria-describedby={form.formState.errors.description ? "description-error" : "description-hint"} aria-invalid={Boolean(form.formState.errors.description)} id="description" placeholder="Describe the department's responsibilities." />
              </FormField>
            </div>
            <div className="sm:col-span-2">
              <FormField error={form.formState.errors.managerEmployeeId} hint={managers.isError ? "Manager options are temporarily unavailable." : "Only active employees can manage a department."} htmlFor="managerEmployeeId" label="Department manager">
                <Select {...form.register("managerEmployeeId")} aria-describedby={form.formState.errors.managerEmployeeId ? "managerEmployeeId-error" : "managerEmployeeId-hint"} aria-invalid={Boolean(form.formState.errors.managerEmployeeId)} disabled={mutation.isPending || managers.isLoading} id="managerEmployeeId">
                  <option value="">No department manager</option>
                  {currentManagerMissing && <option value={department?.managerEmployeeId}>Current manager (unavailable)</option>}
                  {managers.data?.content.map((employee) => <option key={employee.id} value={employee.id}>{employeeFullName(employee)} - {employee.employeeCode}</option>)}
                </Select>
              </FormField>
            </div>
          </CardContent>
        </Card>
      </fieldset>

      {formMessage && <div className="rounded-lg border border-info/20 bg-info-soft p-3 text-sm text-info" role="status">{formMessage}</div>}
      {mutation.error && <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-sm text-destructive" role="alert"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{getDepartmentErrorMessage(mutation.error)}</div>}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Link className={cn(buttonVariants({ variant: "outline" }), "sm:min-w-28")} href={department ? `/admin/departments/${department.id}` : "/admin/departments"}>Cancel</Link>
        <Button className="sm:min-w-40" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Save aria-hidden="true" className="size-4" />}
          {mutation.isPending ? "Saving..." : mode === "create" ? "Create department" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
