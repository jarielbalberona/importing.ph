import Image from "next/image";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function AuthPageShell({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden bg-primary px-12 py-14 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="w-fit rounded-md bg-background p-3" aria-label="Importing PH home">
          <Image src="/assets/importingph.png" alt="Importing PH" width={173} height={50} className="h-9 w-auto" priority />
        </Link>
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/65">One organized workspace</p>
          <p className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-[-0.04em]">Post once. Compare private quotes. Continue clearly.</p>
          <ul className="mt-8 space-y-4 text-sm text-primary-foreground/80">
            {["Keep cargo details in one request.", "Receive quotes privately.", "Keep follow-up messages tied to the shipment."].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-primary-foreground text-primary"><Check aria-hidden="true" className="size-4" /></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-2 text-xs text-primary-foreground/65"><ShieldCheck aria-hidden="true" className="size-4" /> Importing Philippines is a quote platform, not a cargo forwarder.</p>
      </section>

      <section className="grid px-4 py-8 sm:place-items-center sm:px-6 sm:py-12">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="text-center">
            <Link href="/" className="inline-block rounded-md bg-background p-2 lg:hidden" aria-label="Importing PH home">
              <Image src="/assets/importingph.png" alt="Importing PH" width={173} height={50} className="h-9 w-auto" priority />
            </Link>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary">Account workspace</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
          <Link href="/" className="text-center text-sm font-semibold text-primary underline-offset-4 hover:underline">Back to importing.ph</Link>
        </div>
      </section>
    </main>
  );
}
