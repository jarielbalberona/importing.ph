"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export function AfterAuthResolver() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      window.location.replace("/sign-in");
      return;
    }

    window.location.replace(`/after-auth/resolve?t=${Date.now()}`);
  }, [isLoaded, isSignedIn]);

  return (
    <main className="grid min-h-screen place-items-center bg-muted px-6">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold">Opening your account</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We are checking your setup and sending you to the right place.
        </p>
      </section>
    </main>
  );
}
