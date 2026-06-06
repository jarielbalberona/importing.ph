import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ForwarderProfileNotFound() {
  return (
    <main className="grid min-h-screen bg-white px-4 py-16 text-slate-950 sm:px-6">
      <section className="mx-auto grid w-full max-w-2xl gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
          Forwarder profile
        </p>
        <div className="grid gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Profile not found
          </h1>
          <p className="text-base leading-7 text-slate-700">
            This forwarder profile is unavailable or no longer public.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild size="lg">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/guides">Browse guides</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
