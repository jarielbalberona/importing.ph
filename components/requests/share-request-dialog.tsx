"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  absolutePublicRequestUrl,
  publicRequestPath,
} from "@/lib/public-request-links";
import type { ShipmentRequestStatus } from "@/db/schema";

type ShareAction = (formData: FormData) => void | Promise<void>;

type ShareRequestDialogProps = {
  requestId: string;
  requestStatus: ShipmentRequestStatus;
  publicShareToken: string | null;
  publicSummary: string | null;
  preview: Array<{ label: string; value: string }>;
  saveAction: ShareAction;
  rotateAction: ShareAction;
  disableAction: ShareAction;
};

export function ShareRequestDialog({
  requestId,
  requestStatus,
  publicShareToken,
  publicSummary,
  preview,
  saveAction,
  rotateAction,
  disableAction,
}: ShareRequestDialogProps) {
  const [summary, setSummary] = useState(publicSummary ?? "");
  const isPosted = requestStatus === "posted";
  const publicPath = publicShareToken
    ? publicRequestPath(publicShareToken)
    : null;

  async function shareLink() {
    if (!publicShareToken) return;

    const url = absolutePublicRequestUrl(
      window.location.origin,
      publicShareToken,
    );

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shipment quotation request",
          text: summary,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Public request link copied.");
    } catch {
      toast.error("Could not copy the link. Open it and copy the address instead.");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Share request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share this quotation request</DialogTitle>
          <DialogDescription>
            This unlisted public page hides your identity, private shipment
            details, attachments, and quotations.
          </DialogDescription>
        </DialogHeader>

        {publicPath ? (
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Active public link
            </p>
            <Link
              href={publicPath}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all font-medium underline underline-offset-4"
            >
              {publicPath}
            </Link>
            <Button type="button" size="sm" className="mt-3" onClick={shareLink}>
              Share or copy link
            </Button>
          </div>
        ) : null}

        {isPosted ? (
          <form action={saveAction} className="grid gap-3">
            <input type="hidden" name="requestId" value={requestId} />
            <div className="grid gap-2">
              <label htmlFor="publicSummary" className="text-sm font-medium">
                Public summary
              </label>
              <Textarea
                id="publicSummary"
                name="publicSummary"
                required
                minLength={10}
                maxLength={280}
                rows={4}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Describe the shipment at a high level for prospective forwarders."
              />
              <p className="text-xs text-muted-foreground">
                {summary.length}/280 characters. Do not include phone numbers,
                email addresses, supplier names, or confidential details.
              </p>
            </div>
            <Button type="submit" className="w-fit">
              {publicShareToken ? "Update public summary" : "Create public link"}
            </Button>
          </form>
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            This request is closed. Its existing link can be copied or disabled,
            but it cannot be edited or rotated.
          </p>
        )}

        <section aria-labelledby="public-preview-heading" className="grid gap-3">
          <div>
            <h3 id="public-preview-heading" className="font-medium">
              Exact public preview
            </h3>
            <p className="text-xs text-muted-foreground">
              Only these values and the open or closed state will be public.
            </p>
          </div>
          <div className="rounded-lg border">
            <div className="border-b p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Public summary
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {summary.trim() || "Enter a public summary above."}
              </p>
            </div>
            <dl className="grid sm:grid-cols-2">
              {preview.map((item) => (
                <div key={item.label} className="border-b p-3 sm:odd:border-r">
                  <dt className="text-xs font-medium uppercase text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {publicShareToken ? (
          <DialogFooter className="sm:justify-between">
            <form action={disableAction}>
              <input type="hidden" name="requestId" value={requestId} />
              <ConfirmSubmitButton
                type="submit"
                variant="destructive"
                title="Disable this public link?"
                message="The current URL will immediately return a generic not-found page. The saved public summary will be retained."
                confirmLabel="Disable link"
              >
                Disable link
              </ConfirmSubmitButton>
            </form>
            {isPosted ? (
              <form action={rotateAction}>
                <input type="hidden" name="requestId" value={requestId} />
                <ConfirmSubmitButton
                  type="submit"
                  variant="outline"
                  title="Replace the public link?"
                  message="The current URL will stop working immediately. Anyone with the old link will see a generic not-found page."
                  confirmLabel="Replace link"
                >
                  Rotate link
                </ConfirmSubmitButton>
              </form>
            ) : null}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
