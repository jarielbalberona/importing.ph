import { cn } from "@/lib/utils";
import type { UserRole } from "@/db/schema";
import { AppHeader, AppSidebar } from "@/components/app-nav";
import { RealtimeProvider } from "@/components/realtime-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  return (
    <RealtimeProvider>
      <SidebarProvider className="h-screen overflow-hidden bg-muted">
        <AppSidebar role={role} />
        <SidebarInset className="h-svh min-w-0 overflow-y-auto bg-muted">
          <AppHeader role={role} />
          <div className="w-full px-2 py-4 sm:px-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RealtimeProvider>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-lg font-semibold sm:text-md">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl break-words text-sm leading-6 text-muted-foreground">
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="max-w-xl leading-6">
          {description}
        </CardDescription>
      </CardHeader>
      {action ? <CardContent>{action}</CardContent> : null}
    </Card>
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
    <Card id={id} className={cn("min-w-0", className)}>
      {title ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription className="leading-6">
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent>{children}</CardContent>
    </Card>
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
    <Badge variant="outline" className="uppercase text-muted-foreground">
      {children}
    </Badge>
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
    <Card>
      <CardHeader>
        {step ? (
          <p className="text-sm font-medium text-primary">{step}</p>
        ) : null}
        <CardTitle>{title}</CardTitle>
        {description ? (
          <CardDescription className="leading-6">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );
}
