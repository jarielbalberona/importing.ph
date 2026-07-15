"use client";

import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  ChartNoAxesCombined,
  Building2,
  ClipboardList,
  Home,
  Menu,
  MessageSquare,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RefObject } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { AppBadgeState } from "@/lib/app-badges";
import type { UserRole } from "@/db/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealtime } from "@/components/realtime-provider";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  startsWith?: string;
  exclude?: string[];
  badgeKey?: "messages" | "notifications";
};

const navByRole: Record<UserRole, NavItem[]> = {
  importer: [
    {
      href: "/app/requests",
      label: "Requests",
      icon: ClipboardList,
      startsWith: "/app/requests",
      exclude: ["/app/requests/messages"],
    },
    {
      href: "/app/requests/messages",
      label: "Messages",
      icon: MessageSquare,
      startsWith: "/app/requests/messages",
      badgeKey: "messages",
    },
    {
      href: "/app/notifications",
      label: "Notifications",
      icon: Bell,
      badgeKey: "notifications",
    },
    { href: "/app/profile", label: "Profile", icon: UserRound },
  ],
  forwarder: [
    {
      href: "/app/forwarder/requests",
      label: "Open requests",
      icon: ClipboardList,
      startsWith: "/app/forwarder/requests",
    },
    {
      href: "/app/forwarder/messages",
      label: "Messages",
      icon: MessageSquare,
      startsWith: "/app/forwarder/messages",
      badgeKey: "messages",
    },
    {
      href: "/app/notifications",
      label: "Notifications",
      icon: Bell,
      badgeKey: "notifications",
    },
    { href: "/app/forwarder/company", label: "Company profile", icon: Building2 },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: Home },
    { href: "/admin#funnels", label: "Funnels", icon: ChartNoAxesCombined },
    { href: "/admin#activity", label: "Activity", icon: ClipboardList },
    { href: "/admin#users", label: "Users", icon: UsersRound },
    { href: "/admin#requests", label: "Requests", icon: ClipboardList },
    { href: "/admin#quotes", label: "Quotes", icon: MessageSquare },
    { href: "/admin#forwarders", label: "Forwarders", icon: Building2 },
  ],
};

export function AppNavigation({
  role,
  initialBadgeState,
}: {
  role: UserRole;
  initialBadgeState: AppBadgeState | null;
}) {
  const pathname = usePathname();
  const drawerId = useId();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousPathnameRef = useRef(pathname);
  const isMobile = useIsMobile();
  const navItems = navByRole[role];
  const badgeState = useAppBadgeState(initialBadgeState);

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
    <>
      {!isMobile ? (
        <Sidebar collapsible="icon" className="bg-background">
          <SidebarHeader className="h-20 justify-center px-3 py-0 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
            <div className="flex w-full min-w-0 items-center gap-2 group-data-[collapsible=icon]:justify-center">
              <SidebarTrigger
                aria-label="Toggle main navigation"
                className="h-9 w-9 shrink-0"
              />
              <Link
                href="/"
                className="min-w-0 shrink-0 group-data-[collapsible=icon]:hidden"
                aria-label="importing.ph home"
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
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="px-2 py-0 group-data-[collapsible=icon]:px-2">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  <DesktopNavLinks
                    items={navItems}
                    pathname={pathname}
                    badgeState={badgeState}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="mt-auto border-t px-5 py-5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
            <div className="flex min-w-0 items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <UserButton />
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium">{roleLabel(role)}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Account
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
      ) : null}

      <header className="sticky top-0 z-40 border-b bg-background lg:hidden">
        <div className="flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 sm:px-6">
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
          <div className="flex h-10 w-10 items-center justify-center">
            <UserButton />
          </div>
        </div>
      </header>

      <MobileNavigationDrawer
        closeRef={closeRef}
        drawerId={drawerId}
        isOpen={isDrawerOpen}
        items={navItems}
        pathname={pathname}
        badgeState={badgeState}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}

function useAppBadgeState(initialBadgeState: AppBadgeState | null) {
  const realtime = useRealtime();
  const pathname = usePathname();
  const [badgeState, setBadgeState] = useState(initialBadgeState);
  const badgeOwnerId = initialBadgeState?.currentUserProfileId ?? null;

  useEffect(() => {
    if (!initialBadgeState) {
      return;
    }

    let cancelled = false;

    async function refreshBadges() {
      const response = await fetch("/api/app-badges", { cache: "no-store" });

      if (!response.ok || cancelled) {
        return;
      }

      setBadgeState((await response.json()) as AppBadgeState | null);
    }

    void refreshBadges();

    const interval = window.setInterval(() => {
      void refreshBadges();
    }, 30_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshBadges();
      }
    };

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [initialBadgeState, badgeOwnerId]);

  useEffect(() => {
    if (!badgeState) {
      return;
    }

    for (const conversationId of badgeState.accessibleConversationIds) {
      realtime.subscribe(conversationId);
    }

    return () => {
      for (const conversationId of badgeState.accessibleConversationIds) {
        realtime.unsubscribe(conversationId);
      }
    };
  }, [badgeState, realtime]);

  useEffect(() => {
    if (!badgeState) {
      return;
    }

    return realtime.addListener((event) => {
      setBadgeState((current) => {
        if (!current) {
          return current;
        }

        if (event.type === "conversation.message.created") {
          if (
            event.message.senderUserProfileId === current.currentUserProfileId ||
            !current.accessibleConversationIds.includes(event.conversationId) ||
            isActiveConversationPath(pathname, event.conversationId)
          ) {
            return current;
          }

          if (current.unreadConversationIds.includes(event.conversationId)) {
            return current;
          }

          const unreadConversationIds = [
            ...current.unreadConversationIds,
            event.conversationId,
          ];

          return {
            ...current,
            unreadConversationIds,
            unreadMessageConversationCount: unreadConversationIds.length,
          };
        }

        if (
          event.type === "conversation.read_state.updated" &&
          event.readerUserProfileId === current.currentUserProfileId
        ) {
          if (!current.unreadConversationIds.includes(event.conversationId)) {
            return current;
          }

          const unreadConversationIds = current.unreadConversationIds.filter(
            (conversationId) => conversationId !== event.conversationId,
          );

          return {
            ...current,
            unreadConversationIds,
            unreadMessageConversationCount: unreadConversationIds.length,
          };
        }

        return current;
      });
    });
  }, [badgeState, pathname, realtime]);

  return badgeState;
}

function MobileNavigationDrawer({
  closeRef,
  drawerId,
  isOpen,
  items,
  pathname,
  badgeState,
  onClose,
}: {
  closeRef: RefObject<HTMLButtonElement | null>;
  drawerId: string;
  isOpen: boolean;
  items: NavItem[];
  pathname: string;
  badgeState: AppBadgeState | null;
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
            badgeState={badgeState}
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
  badgeState,
  onNavigate,
}: {
  items: NavItem[];
  isInteractive?: boolean;
  pathname: string;
  variant: "desktop" | "drawer";
  badgeState: AppBadgeState | null;
  onNavigate?: () => void;
}) {
  return items.map((item) => {
    const isActive = isNavItemActive(item, pathname);
    const Icon = item.icon;
    const badgeCount = getBadgeCount(item, badgeState);

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        tabIndex={isInteractive ? undefined : -1}
        className={cn(
          "inline-flex h-10 min-w-0 items-center gap-3 rounded-md px-3 text-sm font-medium leading-none text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          variant === "desktop"
            ? "w-full justify-start text-left"
            : "w-full justify-start text-left",
          isActive &&
            "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={onNavigate}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{item.label}</span>
        {badgeCount > 0 ? (
          <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-md bg-muted px-1 text-xs font-medium tabular-nums text-foreground">
            {formatBadgeCount(badgeCount)}
          </span>
        ) : null}
      </Link>
    );
  });
}

function DesktopNavLinks({
  items,
  pathname,
  badgeState,
}: {
  items: NavItem[];
  pathname: string;
  badgeState: AppBadgeState | null;
}) {
  return items.map((item) => {
    const isActive = isNavItemActive(item, pathname);
    const Icon = item.icon;
    const badgeCount = getBadgeCount(item, badgeState);

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.label}
          className="h-10 px-3 font-medium"
        >
          <Link href={item.href} aria-current={isActive ? "page" : undefined}>
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
        {badgeCount > 0 ? (
          <SidebarMenuBadge>{formatBadgeCount(badgeCount)}</SidebarMenuBadge>
        ) : null}
      </SidebarMenuItem>
    );
  });
}

function getBadgeCount(item: NavItem, badgeState: AppBadgeState | null) {
  if (!badgeState || !item.badgeKey) {
    return 0;
  }

  return item.badgeKey === "messages"
    ? badgeState.unreadMessageConversationCount
    : badgeState.unreadNotificationCount;
}

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

function isActiveConversationPath(pathname: string, conversationId: string) {
  return pathname.endsWith(`/messages/${conversationId}`);
}

function isNavItemActive(item: NavItem, pathname: string) {
  return (
    (pathname === item.href ||
      Boolean(item.startsWith && pathname.startsWith(item.startsWith))) &&
    !item.exclude?.some((path) => pathname.startsWith(path))
  );
}

function roleLabel(role: UserRole) {
  switch (role) {
    case "importer":
      return "Importer workspace";
    case "forwarder":
      return "Forwarder workspace";
    case "admin":
      return "Admin workspace";
  }
}
