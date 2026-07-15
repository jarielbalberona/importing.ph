import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

import {
  appendAuthRedirectParams,
  buildAfterAuthRedirectUrl,
} from "@/lib/auth-redirect";
import { authEntryCopy } from "@/lib/auth-entry-copy";
import { FunnelEntryEvent } from "@/components/funnel-entry-event";
import { normalizeAuthRedirectIntent } from "@/lib/auth-redirect";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string; intent?: string }>;
}) {
  const params = await searchParams;
  const afterAuthUrl = buildAfterAuthRedirectUrl({
    redirectPath: params.redirect_url,
    intent: params.intent,
  });
  const copy = authEntryCopy("sign-in", params.intent);
  const intent = normalizeAuthRedirectIntent(params.intent);
  const role =
    intent === "post_shipment_request" ? "importer" : intent ? "forwarder" : undefined;

  return (
    <main className="grid min-h-screen overflow-x-hidden bg-[#f7f7f4] px-4 py-8 text-[#202020] sm:place-items-center sm:px-6 sm:py-12">
      <FunnelEntryEvent
        eventName="auth_started"
        role={role}
        authIntent={intent ?? undefined}
      />
      <div className="mx-auto grid w-full max-w-md gap-6">
        <div className="text-center">
          <Link href="/" className="text-lg font-semibold">
            importing.ph
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">{copy.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {copy.description}
          </p>
        </div>
        <div className="w-full overflow-hidden">
          <SignIn
            appearance={{
              elements: {
                header: "hidden",
                logoBox: "hidden",
                rootBox: "w-full",
                cardBox: "w-full",
                card: "w-full shadow-sm",
              },
            }}
            fallbackRedirectUrl={afterAuthUrl}
            forceRedirectUrl={afterAuthUrl}
            signUpUrl={appendAuthRedirectParams("/sign-up", {
              redirectPath: params.redirect_url,
              intent: params.intent,
            })}
          />
        </div>
      </div>
    </main>
  );
}
