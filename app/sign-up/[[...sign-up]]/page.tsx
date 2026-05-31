import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted px-6 py-12">
      <SignUp
        fallbackRedirectUrl="/after-auth"
        forceRedirectUrl="/after-auth"
        signInUrl="/sign-in"
      />
    </main>
  );
}
