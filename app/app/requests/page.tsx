import { UserButton } from "@clerk/nextjs";

import { requireRole } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function ImporterRequestsPage() {
  const profile = await requireRole(["importer"]);

  return (
    <main className="min-h-screen bg-muted px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-700">Importer</p>
            <h1 className="text-3xl font-semibold">Requests</h1>
          </div>
          <UserButton />
        </header>
        <section className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Proof route</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {profile.fullName} can access this page because PostgreSQL says the
            role is importer.
          </p>
        </section>
      </div>
    </main>
  );
}
