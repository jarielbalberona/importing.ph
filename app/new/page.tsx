import type { Metadata } from "next";

import { HomeMarketingPage } from "@/components/public/home-marketing-page";

export const metadata: Metadata = {
  title: "New Page Experiment | Importing PH",
  description: "An experimental Importing PH public landing page concept.",
  alternates: {
    canonical: "/new",
  },
};

export default function NewPage() {
  return <HomeMarketingPage />;
}
