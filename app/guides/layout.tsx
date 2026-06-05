import { PublicSiteHeader } from "@/components/public/site-header";

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicSiteHeader />
      {children}
    </>
  );
}
