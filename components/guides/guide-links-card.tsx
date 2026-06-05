"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { getGuidePath } from "@/features/public-content/seo/routes";
import { cn } from "@/lib/utils";

type GuideLinkItem = {
  description?: string;
  slug: string;
  title: string;
};

type GuideLinksCardProps = {
  defaultOpen?: boolean;
  description?: string;
  descriptionPlacement?: "collapsed" | "expanded";
  guides: GuideLinkItem[];
  title: string;
};

export function GuideLinksCard({
  title,
  description,
  guides,
  defaultOpen = false,
  descriptionPlacement = "expanded",
}: GuideLinksCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const showCollapsedDescription =
    description && descriptionPlacement === "collapsed";
  const showExpandedDescription =
    description && (descriptionPlacement === "expanded" || isOpen);

  return (
    <div className="rounded-md border bg-muted/40">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0 grid gap-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          {showCollapsedDescription ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-controls={contentId}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span>{isOpen ? "Hide guides" : "Show guides"}</span>
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              isOpen ? "rotate-180" : "rotate-0",
            )}
          />
        </button>
      </div>

      {isOpen ? (
        <div id={contentId} className="border-t px-4 py-3">
          <div className="grid gap-3">
            {showExpandedDescription ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
            <div className="grid gap-3">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={getGuidePath(guide.slug)}
                  className="grid gap-1 rounded-md border bg-background px-3 py-3 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <span className="text-sm font-medium">{guide.title}</span>
                  {guide.description ? (
                    <span className="text-xs leading-5 text-muted-foreground">
                      {guide.description}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
