import { SignUp } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/public/auth-page-shell";
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
  const copy = authEntryCopy("sign-up", params.intent);
  const intent = normalizeAuthRedirectIntent(params.intent);
  const role =
    intent === "post_shipment_request" ? "importer" : intent ? "forwarder" : undefined;

  return (
    <AuthPageShell title={copy.title} description={copy.description}>
      <FunnelEntryEvent
        eventName="auth_started"
        role={role}
        authIntent={intent ?? undefined}
      />
      <div className="w-full overflow-hidden">
        <SignUp
          appearance={{
            variables: { colorPrimary: "var(--primary)" },
            elements: {
              header: "hidden",
              logoBox: "hidden",
              rootBox: "w-full",
              cardBox: "w-full",
              card: "w-full border border-border shadow-sm",
            },
          }}
          fallbackRedirectUrl={afterAuthUrl}
          forceRedirectUrl={afterAuthUrl}
          signInUrl={appendAuthRedirectParams("/sign-in", {
            redirectPath: params.redirect_url,
            intent: params.intent,
          })}
        />
      </div>
    </AuthPageShell>
  );
}
