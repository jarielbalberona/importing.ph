import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f4] px-6 text-[#202020]">
      <div className="max-w-md rounded-lg border bg-card p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Access not available</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This page is not available for your account type.
        </p>
        <Button asChild className="mt-6">
          <Link href="/after-auth">Go to your account</Link>
        </Button>
      </div>
    </main>
  );
}
