import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { DashboardBrand } from "@/components/layouts/dashboard-brand";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh grid-cols-[minmax(0,1fr)] bg-background lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.82fr)]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          aria-hidden="true"
          className="absolute -right-36 -top-32 size-[30rem] rounded-full border border-white/10 bg-white/5"
        />
        <div className="relative rounded-xl bg-white p-4 shadow-card [&_span]:text-foreground">
          <DashboardBrand />
        </div>

        <div className="relative max-w-xl py-16">
          <span className="mb-6 flex size-12 items-center justify-center rounded-xl bg-white/12">
            <ShieldCheck aria-hidden="true" className="size-6" />
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Your people workspace, protected by passwordless sign-in.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
            Access attendance, leave, payroll, and workforce tools with a secure code sent to your registered work email.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
          <span className="flex items-center gap-2">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            No password to remember
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            Secure session management
          </span>
        </div>
      </section>

      <section className="flex min-w-0 items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <DashboardBrand />
          </div>
          {children}
          <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
            Access is limited to authorized PeopleFlow accounts. Contact your HR administrator if you need help.
          </p>
        </div>
      </section>
    </main>
  );
}
