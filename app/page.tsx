import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-muted">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold">
            importing.ph
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/sign-up">Create account</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Import operations, not brochureware
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-foreground md:text-6xl">
            Match Philippine importers with forwarders who can actually move the cargo.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            A lean marketplace foundation: Clerk for identity, PostgreSQL for
            roles and onboarding state, and server-side gates for every
            workspace route.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">Start onboarding</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="grid gap-4">
            {[
              ["Importer", "Create requests and manage quotes."],
              ["Forwarder", "Receive requests and respond as a company."],
              ["Admin", "Separate control plane, DB-role gated."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-md border p-4">
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
