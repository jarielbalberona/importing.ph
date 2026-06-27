"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PublicSiteHeader() {
  return (
    <header className="relative z-30 mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2" aria-label="importing.ph home">
        <Image
          src="/assets/importingph.png"
          alt="importing.ph"
          width={173}
          height={50}
          priority
          className="h-8 w-auto"
        />
      </Link>

      <PublicNavigation className="hidden items-center gap-4 text-xs font-medium text-[#202020] sm:flex" />

      <details className="group relative sm:hidden">
        <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full bg-white text-[#202020] shadow-sm ring-1 ring-black/10 [&::-webkit-details-marker]:hidden">
          <Menu aria-hidden="true" className="size-4" />
          <span className="sr-only">Open menu</span>
        </summary>
        <PublicNavigation className="absolute right-0 top-12 grid w-56 gap-2 rounded-md border border-[#e7e2dd] bg-white p-3 text-sm font-medium shadow-xl" />
      </details>
    </header>
  );
}

function PublicNavigation({
  className,
}: {
  className?: string;
}) {
  return (
    <nav aria-label="Account links" className={className}>
      <Link href="/guides" className="rounded-md px-3 py-1 hover:bg-white/70 sm:p-0 sm:hover:bg-transparent sm:hover:text-cyan-700">
        Guides
      </Link>
      <Link href="/about" className="rounded-md px-3 py-1 hover:bg-white/70 sm:p-0 sm:hover:bg-transparent sm:hover:text-cyan-700">
        About
      </Link>
      <Button asChild variant="outline" className="rounded-full border-[#202020] bg-transparent px-4">
        <Link href="/sign-in">
          Sign in
        </Link>
      </Button>
      <Button asChild className="rounded-full bg-[#202020] px-4 text-white hover:bg-[#343434]">
        <Link href="/sign-up">
          Create account
        </Link>
      </Button>
    </nav>
  );
}
