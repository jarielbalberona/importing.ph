import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-muted">
      <header className="border-b bg-background">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="shrink-0" aria-label="importing.ph home">
            <Image
              src="/assets/importingph.png"
              alt="importing.ph"
              width={173}
              height={50}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href="/sign-up">Create account</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl content-center gap-8 px-4 py-10 sm:px-6 sm:py-16 md:min-h-[calc(100vh-4rem)] md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            China to Philippines importing
          </p>
          <h1 className="mt-4 max-w-3xl break-words text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-6xl">
            Get shipping quotes for China-to-Philippines imports
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Post your shipment details once and receive private quotes from
            forwarders who can move your cargo.
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/sign-up">Create account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
          <div className="grid gap-4">
            {[
              ["Importer", "Post shipment requests and compare quotes."],
              ["Forwarder", "Find open shipment requests and send private quotes."],
              ["Messaging", "Ask follow-up questions after a quote is sent."],
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
