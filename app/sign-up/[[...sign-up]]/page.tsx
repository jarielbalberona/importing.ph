import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <main className="grid min-h-screen overflow-x-hidden bg-muted px-4 py-8 sm:place-items-center sm:px-6 sm:py-12">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <div className="text-center">
          <Link href="/" className="text-lg font-semibold">
            importing.ph
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start posting shipment requests or sending private shipping quotes.
          </p>
        </div>
        <div className="w-full overflow-hidden">
          <SignUp
            fallbackRedirectUrl="/after-auth"
            forceRedirectUrl="/after-auth"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </main>
  );
}
