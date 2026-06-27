"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function PublicSiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex min-h-10 items-center justify-between gap-4">
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

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="sm:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="public-site-navigation"
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>

          <PublicNavigation className="hidden sm:flex sm:items-center" />
        </div>

        <div
          id="public-site-navigation"
          className={
            isMenuOpen
              ? "absolute inset-x-4 top-full mt-2 rounded-md border border-slate-200 bg-white p-3 shadow-lg sm:hidden"
              : "hidden"
          }
        >
          <PublicNavigation
            className="grid gap-3"
            onNavigate={() => setIsMenuOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}

function PublicNavigation({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Account links" className={className}>
      <Button asChild variant="ghost" className="w-full sm:w-auto">
        <Link href="/guides" onClick={onNavigate}>
          Guides
        </Link>
      </Button>
      <Button asChild variant="ghost" className="w-full sm:w-auto">
        <Link href="/about" onClick={onNavigate}>
          About
        </Link>
      </Button>
      <Button asChild variant="ghost" className="w-full sm:w-auto">
        <Link href="/sign-in" onClick={onNavigate}>
          Sign in
        </Link>
      </Button>
      <Button asChild className="w-full sm:w-auto">
        <Link href="/sign-up" onClick={onNavigate}>
          Create free account
        </Link>
      </Button>
    </nav>
  );
}
