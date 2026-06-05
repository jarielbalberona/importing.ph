import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteOrigin } from "@/features/public-content/seo/routes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "Importing PH - A simpler way to find the right shipment quote.",
  description: "A simpler way to find the right shipment quote.",
  openGraph: {
    title: "Importing PH - A simpler way to find the right shipment quote.",
    description: "A simpler way to find the right shipment quote.",
    type: "website",
    url: siteOrigin,
    images: ["/assets/importingph-logo-bg-blue.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Importing PH - A simpler way to find the right shipment quote.",
    description: "A simpler way to find the right shipment quote.",
    images: ["/assets/importingph-logo-bg-blue.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full bg-background text-foreground">
          <TooltipProvider>{children}</TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
