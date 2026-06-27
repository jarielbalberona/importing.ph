import type { Metadata } from "next";

import { HomeMarketingPage } from "@/components/public/home-marketing-page";

export const metadata: Metadata = {
  title: "Importing PH - China-to-Philippines shipping quotes",
  description:
    "Post your shipment once, receive private quotes from cargo forwarders, and compare options in one organized workspace.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <HomeMarketingPage />;
}
