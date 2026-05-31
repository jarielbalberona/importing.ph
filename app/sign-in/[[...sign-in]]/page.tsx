import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted px-6 py-12">
      <SignIn
        fallbackRedirectUrl="/after-auth"
        forceRedirectUrl="/after-auth"
        signUpUrl="/sign-up"
      />
    </main>
  );
}
