import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PublicSiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Importing PH home"
        >
          <Image
            src="/assets/importingph.png"
            alt="Importing PH"
            width={173}
            height={50}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm font-semibold sm:flex">
          <PublicNavigationLinks />
          <Button asChild variant="outline" className="rounded-md px-5 font-semibold">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="rounded-md px-5 font-semibold shadow-lg shadow-primary/15">
            <Link href="/sign-up">Create account</Link>
          </Button>
        </nav>

        <details className="group relative sm:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" className="size-5" />
            <span className="sr-only">Open menu</span>
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 top-12 grid w-56 gap-2 rounded-lg border border-border bg-background p-3 text-sm font-semibold shadow-xl"
          >
            <PublicNavigationLinks />
            <Button asChild variant="outline" className="mt-1 justify-center">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="justify-center">
              <Link href="/sign-up">Create account</Link>
            </Button>
          </nav>
        </details>
      </div>
    </header>
  );
}

function PublicNavigationLinks() {
  const className = "rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-0 sm:hover:bg-transparent";

  return (
    <>
      <Link href="/" className={className}>Home</Link>
      <Link href="/guides" className={className}>Guides</Link>
      <Link href="/about" className={className}>About</Link>
    </>
  );
}
