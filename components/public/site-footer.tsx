import Image from "next/image";
import Link from "next/link";

import {
  JOIN_AS_FORWARDER_INTENT,
  POST_SHIPMENT_REQUEST_INTENT,
  appendAuthRedirectParams,
} from "@/lib/auth-redirect";

const footerGroups = [
  {
    title: "For importers",
    links: [
      {
        href: appendAuthRedirectParams("/sign-up", { intent: POST_SHIPMENT_REQUEST_INTENT }),
        label: "Post your shipment",
      },
      { href: "/how-it-works#importers", label: "How importing works" },
      { href: "/guides", label: "Beginner guides" },
    ],
  },
  {
    title: "For forwarders",
    links: [
      {
        href: appendAuthRedirectParams("/sign-up", { intent: JOIN_AS_FORWARDER_INTENT }),
        label: "Join as a forwarder",
      },
      { href: "/how-it-works#forwarders", label: "How quoting works" },
      { href: "/sign-in", label: "Sign in" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/guides", label: "Guides" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/privacy", label: "Privacy notice" },
      { href: "/sign-up", label: "Create account" },
    ],
  },
];

export function PublicSiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-5">
          <Link href="/" aria-label="Importing PH home">
            <Image src="/assets/importingph.png" alt="Importing PH" width={173} height={50} className="h-9 w-auto" />
          </Link>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Importing Philippines connects importers with cargo forwarders.
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">{group.title}</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.label}`}>
                  <Link href={link.href} className="transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Importing PH</p>
          <p>The platform organizes requests and quotes; forwarders provide shipping services.</p>
        </div>
      </div>
    </footer>
  );
}
