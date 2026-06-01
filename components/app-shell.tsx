import { cn } from "@/lib/utils";
import type { UserRole } from "@/db/schema";
import { AppHeader } from "@/components/app-nav";

export function AppShell({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-muted">
      <AppHeader role={role} />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        {children}
      </div>
    </main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-sm font-medium text-cyan-700">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end [&>*]:w-full [&>*]:sm:w-auto">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}

export function DetailCard({
  id,
  title,
  description,
  className,
  children,
}: {
  id?: string;
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("min-w-0 rounded-lg border bg-card p-4 shadow-sm sm:p-6", className)}
    >
      {title ? (
        <div className="mb-5">
          <h2 className="break-words text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function InfoGrid({
  children,
  columns = 3,
}: {
  children: React.ReactNode;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

export function DetailValue({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="break-words text-sm leading-6 text-foreground">
        {value || "Not provided"}
      </div>
    </div>
  );
}

export function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border bg-background px-2 py-1 text-xs font-medium uppercase text-muted-foreground">
      {children}
    </span>
  );
}

export function FormSection({
  step,
  title,
  description,
  children,
}: {
  step?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
      {step ? <p className="text-sm font-medium text-cyan-700">{step}</p> : null}
      <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}
