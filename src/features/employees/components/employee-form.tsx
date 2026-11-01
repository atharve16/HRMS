"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, type FieldError } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useDepartmentOptions } from "@/features/departments/hooks/use-department";
import { useCreateEmployee } from "@/features/employees/hooks/use-create-employee";
import { useManagerOptions } from "@/features/employees/hooks/use-employee-references";
import { useUpdateEmployee } from "@/features/employees/hooks/use-update-employee";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type EmployeeFormValues,
} from "@/features/employees/schemas/employee-schemas";
import type { Employee } from "@/features/employees/types/employee-types";
import {
  applyEmployeeFieldErrors,
  getEmployeeErrorMessage,
} from "@/features/employees/utils/employee-errors";
import {
  employeeToFormValues,
  emptyEmployeeFormValues,
  toCreateEmployeeRequest,
  toUpdateEmployeeRequest,
} from "@/features/employees/utils/employee-form-utils";
import { employeeFullName } from "@/features/employees/utils/employee-display";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  children: ReactNode;
  error?: FieldError;
  htmlFor: string;
  label: string;
  hint?: string;
};

function FormField({ children, error, htmlFor, label, hint }: FormFieldProps) {
  const descriptionId = `${htmlFor}-${error ? "error" : "hint"}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" id={descriptionId} role="alert">
          {error.message}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground" id={descriptionId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

export function EmployeeForm({
  mode,
  employee,
}: {
  mode: "create" | "edit";
  employee?: Employee;
}) {
  const router = useRouter();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const departmentsQuery = useDepartmentOptions();
  const managersQuery = useManagerOptions();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const schema = mode === "create" ? createEmployeeSchema : updateEmployeeSchema;
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: employee ? employeeToFormValues(employee) : emptyEmployeeFormValues,
  });
  const mutation = mode === "create" ? createMutation : updateMutation;
  const pending = mutation.isPending;
  const activeDepartments = departmentsQuery.data?.content.filter(
    (department) => department.status === "ACTIVE",
  );
  const activeManagers = managersQuery.data?.content.filter(
    (manager) => manager.id !== employee?.id,
  );
  const currentDepartmentMissing =
    employee?.departmentId &&
    !activeDepartments?.some((department) => department.id === employee.departmentId);
  const currentManagerMissing =
    employee?.reportingManagerId &&
    !activeManagers?.some((manager) => manager.id === employee.reportingManagerId);

  async function submit(values: EmployeeFormValues) {
    setFormMessage(null);
    mutation.reset();
    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync(
          toCreateEmployeeRequest(values),
        );
        router.push(`/admin/employees/${created.id}?created=1`);
        return;
      }
      if (!employee) return;
      const request = toUpdateEmployeeRequest(values, employee);
      if (Object.keys(request).length === 0) {
        setFormMessage("No supported employee fields have changed.");
        return;
      }
      const updated = await updateMutation.mutateAsync({
        employeeId: employee.id,
        request,
      });
      router.push(`/admin/employees/${updated.id}?updated=1`);
    } catch (error) {
      applyEmployeeFieldErrors(error, form.setError);
    }
  }

  const mutationError = mutation.error;
  const register = form.register;

  return (
    <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submit)}>
      <fieldset className="space-y-6" disabled={pending}>
        <Section
          description="Identity and personal information stored on the employee profile."
          title="Personal information"
        >
          <FormField error={form.formState.errors.firstName} htmlFor="firstName" label="First name">
            <Input {...register("firstName")} aria-invalid={Boolean(form.formState.errors.firstName)} id="firstName" />
          </FormField>
          <FormField error={form.formState.errors.lastName} htmlFor="lastName" label="Last name">
            <Input {...register("lastName")} aria-invalid={Boolean(form.formState.errors.lastName)} id="lastName" />
          </FormField>
          <FormField error={form.formState.errors.dateOfBirth} htmlFor="dateOfBirth" label="Date of birth">
            <Input {...register("dateOfBirth")} aria-invalid={Boolean(form.formState.errors.dateOfBirth)} id="dateOfBirth" type="date" />
          </FormField>
          <FormField error={form.formState.errors.gender} htmlFor="gender" label="Gender">
            <Select {...register("gender")} aria-invalid={Boolean(form.formState.errors.gender)} id="gender">
              <option value="">Not provided</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="NON_BINARY">Non-binary</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </Select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField
              error={form.formState.errors.profileImageUrl}
              hint="Optional profile image URL. The directory currently displays initials."
              htmlFor="profileImageUrl"
              label="Profile image URL"
            >
            <Input {...register("profileImageUrl")} aria-invalid={Boolean(form.formState.errors.profileImageUrl)} id="profileImageUrl" placeholder="https://example.com/photo.jpg" />
            </FormField>
          </div>
        </Section>

        <Section
          description="Primary work contact details. Email changes also update the linked login account."
          title="Contact information"
        >
          <FormField error={form.formState.errors.email} htmlFor="email" label="Work email">
            <Input {...register("email")} aria-invalid={Boolean(form.formState.errors.email)} autoComplete="email" id="email" type="email" />
          </FormField>
          <FormField error={form.formState.errors.phone} hint="10-15 digits; an initial + is allowed." htmlFor="phone" label="Phone">
            <Input {...register("phone")} aria-invalid={Boolean(form.formState.errors.phone)} autoComplete="tel" id="phone" inputMode="tel" />
          </FormField>
        </Section>

        <Section
          description="Role, organizational placement, and reporting information."
          title="Employment information"
        >
          <FormField error={form.formState.errors.employmentType} htmlFor="employmentType" label="Employment type">
            <Select {...register("employmentType")} aria-invalid={Boolean(form.formState.errors.employmentType)} id="employmentType">
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </Select>
          </FormField>
          <FormField error={form.formState.errors.designation} htmlFor="designation" label="Designation">
            <Input {...register("designation")} aria-invalid={Boolean(form.formState.errors.designation)} id="designation" />
          </FormField>
          <FormField error={form.formState.errors.joiningDate} hint={mode === "edit" ? "Joining date is not editable through the backend." : undefined} htmlFor="joiningDate" label="Joining date">
            <Input {...register("joiningDate")} aria-invalid={Boolean(form.formState.errors.joiningDate)} className={mode === "edit" ? "bg-muted" : undefined} id="joiningDate" readOnly={mode === "edit"} type="date" />
          </FormField>
          <FormField error={form.formState.errors.workLocation} htmlFor="workLocation" label="Work location">
            <Input {...register("workLocation")} aria-invalid={Boolean(form.formState.errors.workLocation)} id="workLocation" />
          </FormField>
          <FormField error={form.formState.errors.departmentId} hint={departmentsQuery.isError ? "Department options are temporarily unavailable." : undefined} htmlFor="departmentId" label="Department">
            <Select {...register("departmentId")} aria-invalid={Boolean(form.formState.errors.departmentId)} id="departmentId">
              <option value="">No department</option>
              {currentDepartmentMissing && <option value={employee?.departmentId}>Current department (unavailable)</option>}
              {activeDepartments?.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField error={form.formState.errors.reportingManagerId} hint={managersQuery.isError ? "Manager options are temporarily unavailable." : "Only active employees can be selected."} htmlFor="reportingManagerId" label="Reporting manager">
            <Select {...register("reportingManagerId")} aria-invalid={Boolean(form.formState.errors.reportingManagerId)} id="reportingManagerId">
              <option value="">No reporting manager</option>
              {currentManagerMissing && <option value={employee?.reportingManagerId}>Current manager (unavailable)</option>}
              {activeManagers?.map((manager) => (
                <option key={manager.id} value={manager.id}>{employeeFullName(manager)} - {manager.employeeCode}</option>
              ))}
            </Select>
          </FormField>
          {mode === "edit" && (
            <FormField error={form.formState.errors.terminationDate} hint="Setting a termination date does not itself change employment status." htmlFor="terminationDate" label="Termination date">
              <Input {...register("terminationDate")} aria-invalid={Boolean(form.formState.errors.terminationDate)} id="terminationDate" type="date" />
            </FormField>
          )}
          {mode === "create" && (
            <div className="rounded-lg border border-info/20 bg-info-soft p-4 text-sm leading-6 text-info sm:col-span-2">
              Employee code and login-account linkage are generated securely by the backend.
            </div>
          )}
        </Section>

        <Section
          description="Optional residential address. If started, all required address fields must be completed."
          title="Address"
        >
          <FormField error={form.formState.errors.addressLine1} htmlFor="addressLine1" label="Address line 1">
            <Input {...register("addressLine1")} aria-invalid={Boolean(form.formState.errors.addressLine1)} autoComplete="address-line1" id="addressLine1" />
          </FormField>
          <FormField error={form.formState.errors.addressLine2} htmlFor="addressLine2" label="Address line 2">
            <Input {...register("addressLine2")} aria-invalid={Boolean(form.formState.errors.addressLine2)} autoComplete="address-line2" id="addressLine2" />
          </FormField>
          <FormField error={form.formState.errors.city} htmlFor="city" label="City">
            <Input {...register("city")} aria-invalid={Boolean(form.formState.errors.city)} autoComplete="address-level2" id="city" />
          </FormField>
          <FormField error={form.formState.errors.state} htmlFor="state" label="State / province">
            <Input {...register("state")} aria-invalid={Boolean(form.formState.errors.state)} autoComplete="address-level1" id="state" />
          </FormField>
          <FormField error={form.formState.errors.postalCode} htmlFor="postalCode" label="Postal code">
            <Input {...register("postalCode")} aria-invalid={Boolean(form.formState.errors.postalCode)} autoComplete="postal-code" id="postalCode" />
          </FormField>
          <FormField error={form.formState.errors.country} htmlFor="country" label="Country">
            <Input {...register("country")} aria-invalid={Boolean(form.formState.errors.country)} autoComplete="country-name" id="country" />
          </FormField>
        </Section>

        <Section
          description="Optional person to contact in an emergency. All three fields are required when provided."
          title="Emergency contact"
        >
          <FormField error={form.formState.errors.emergencyName} htmlFor="emergencyName" label="Contact name">
            <Input {...register("emergencyName")} aria-invalid={Boolean(form.formState.errors.emergencyName)} id="emergencyName" />
          </FormField>
          <FormField error={form.formState.errors.emergencyRelationship} htmlFor="emergencyRelationship" label="Relationship">
            <Input {...register("emergencyRelationship")} aria-invalid={Boolean(form.formState.errors.emergencyRelationship)} id="emergencyRelationship" />
          </FormField>
          <FormField error={form.formState.errors.emergencyPhone} hint="10-15 digits; an initial + is allowed." htmlFor="emergencyPhone" label="Contact phone">
            <Input {...register("emergencyPhone")} aria-invalid={Boolean(form.formState.errors.emergencyPhone)} id="emergencyPhone" inputMode="tel" />
          </FormField>
        </Section>
      </fieldset>

      {mode === "edit" && (
        <p className="rounded-lg border border-border bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">
          The backend supports clearing text-based optional fields. Existing date, gender, address, and emergency-contact values cannot currently be cleared with a partial update; they can only be replaced.
        </p>
      )}

      {formMessage && (
        <div className="rounded-lg border border-info/20 bg-info-soft p-3 text-sm text-info" role="status">
          {formMessage}
        </div>
      )}
      {mutationError && (
        <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-sm text-destructive" role="alert">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {getEmployeeErrorMessage(mutationError)}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "sm:min-w-28")}
          href={employee ? `/admin/employees/${employee.id}` : "/admin/employees"}
        >
          Cancel
        </Link>
        <Button className="sm:min-w-36" disabled={pending} type="submit">
          {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Save aria-hidden="true" className="size-4" />}
          {pending ? "Saving..." : mode === "create" ? "Create employee" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
