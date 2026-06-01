"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RefObject } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { UserRole } from "@/db/schema";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  startsWith?: string;
  exclude?: string[];
};

const navByRole: Record<UserRole, NavItem[]> = {
  importer: [
    {
      href: "/app/requests",
      label: "Requests",
      startsWith: "/app/requests",
      exclude: ["/app/requests/messages"],
    },
    {
      href: "/app/requests/messages",
      label: "Messages",
      startsWith: "/app/requests/messages",
    },
    { href: "/app/notifications", label: "Notifications" },
    { href: "/app/profile", label: "Profile" },
  ],
  forwarder: [
    {
      href: "/app/forwarder/requests",
      label: "Open requests",
      startsWith: "/app/forwarder/requests",
    },
    {
      href: "/app/forwarder/messages",
      label: "Messages",
      startsWith: "/app/forwarder/messages",
    },
    { href: "/app/notifications", label: "Notifications" },
    { href: "/app/forwarder/company", label: "Company profile" },
  ],
  admin: [
    { href: "/admin", label: "Overview" },
    { href: "/admin#users", label: "Users" },
    { href: "/admin#requests", label: "Requests" },
    { href: "/admin#quotes", label: "Quotes" },
    { href: "/admin#forwarders", label: "Forwarders" },
  ],
};

export function AppHeader({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const drawerId = useId();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousPathnameRef = useRef(pathname);
  const navItems = navByRole[role];

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;

    if (!isDrawerOpen) {
      return;
    }

    queueMicrotask(() => setIsDrawerOpen(false));
  }, [isDrawerOpen, pathname]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const returnFocusTo = toggleRef.current;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      returnFocusTo?.focus();
    };
  }, [isDrawerOpen]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto grid min-h-16 w-full max-w-6xl grid-cols-1 gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex min-w-0 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              ref={toggleRef}
              type="button"
              aria-label="Open main navigation"
              aria-controls={drawerId}
              aria-expanded={isDrawerOpen}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
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
          </div>
          <div className="flex h-10 w-10 items-center justify-center lg:hidden">
            <UserButton />
          </div>
        </div>
        <nav
          aria-label="Main navigation"
          className="hidden w-full lg:flex lg:h-10 lg:flex-nowrap lg:items-center lg:justify-center lg:gap-2"
        >
          <NavLinks items={navItems} pathname={pathname} variant="desktop" />
        </nav>
        <div className="hidden h-10 w-10 items-center justify-center lg:flex">
          <UserButton />
        </div>
      </div>
      <MobileNavigationDrawer
        closeRef={closeRef}
        drawerId={drawerId}
        isOpen={isDrawerOpen}
        items={navItems}
        pathname={pathname}
        onClose={() => setIsDrawerOpen(false)}
      />
    </header>
  );
}

function MobileNavigationDrawer({
  closeRef,
  drawerId,
  isOpen,
  items,
  pathname,
  onClose,
}: {
  closeRef: RefObject<HTMLButtonElement | null>;
  drawerId: string;
  isOpen: boolean;
  items: NavItem[];
  pathname: string;
  onClose: () => void;
}) {
  const drawerTabIndex = isOpen ? undefined : -1;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close main navigation"
        className={cn(
          "absolute inset-0 bg-foreground/35 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        id={drawerId}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className={cn(
          "absolute left-0 top-0 flex h-dvh w-[280px] max-w-[calc(100vw-2rem)] flex-col border-r bg-background shadow-xl transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex min-h-16 items-center justify-between gap-3 border-b px-4">
          <Link
            href="/"
            className="shrink-0"
            aria-label="importing.ph home"
            tabIndex={drawerTabIndex}
            onClick={onClose}
          >
            <Image
              src="/assets/importingph.png"
              alt="importing.ph"
              width={173}
              height={50}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close main navigation"
            tabIndex={drawerTabIndex}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Main navigation" className="grid gap-2 p-4">
          <NavLinks
            items={items}
            isInteractive={isOpen}
            pathname={pathname}
            variant="drawer"
            onNavigate={onClose}
          />
        </nav>
      </aside>
    </div>
  );
}

function NavLinks({
  items,
  isInteractive = true,
  pathname,
  variant,
  onNavigate,
}: {
  items: NavItem[];
  isInteractive?: boolean;
  pathname: string;
  variant: "desktop" | "drawer";
  onNavigate?: () => void;
}) {
  return items.map((item) => {
    const isActive = isNavItemActive(item, pathname);

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        tabIndex={isInteractive ? undefined : -1}
        className={cn(
          "inline-flex h-10 min-w-0 items-center rounded-md px-3 text-sm font-medium leading-none text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          variant === "desktop"
            ? "w-36 justify-center text-center whitespace-nowrap"
            : "w-full justify-start text-left",
          isActive &&
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        )}
        onClick={onNavigate}
      >
        <span className="truncate">{item.label}</span>
      </Link>
    );
  });
}

function isNavItemActive(item: NavItem, pathname: string) {
  return (
    (pathname === item.href ||
      Boolean(item.startsWith && pathname.startsWith(item.startsWith))) &&
    !item.exclude?.some((path) => pathname.startsWith(path))
  );
}
