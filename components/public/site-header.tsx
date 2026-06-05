import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PublicSiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="shrink-0" aria-label="importing.ph home">
          <Image src="/assets/importingph.png" alt="importing.ph" width={173} height={50} priority className="h-10 w-auto" />
        </Link>
        <nav aria-label="Account links" className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <Button asChild variant="ghost" className="w-full sm:w-auto">
            <Link href="/guides">Guides</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full sm:w-auto">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/sign-up">Create free account</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
