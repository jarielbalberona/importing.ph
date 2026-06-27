import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

import {
  appendAuthRedirectParams,
  buildAfterAuthRedirectUrl,
} from "@/lib/auth-redirect";

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

  return (
    <main className="grid min-h-screen overflow-x-hidden bg-[#f7f7f4] px-4 py-8 text-[#202020] sm:place-items-center sm:px-6 sm:py-12">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <div className="text-center">
          <Link href="/" className="text-lg font-semibold">
            importing.ph
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue to your import or forwarding account.
          </p>
        </div>
        <div className="w-full overflow-hidden">
          <SignIn
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
