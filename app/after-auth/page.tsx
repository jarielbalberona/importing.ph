import { AfterAuthResolver } from "./resolver";

export const dynamic = "force-dynamic";

export default async function AfterAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string; intent?: string }>;
}) {
  const params = await searchParams;

  return (
    <AfterAuthResolver
      redirectUrl={params.redirect_url}
      intent={params.intent}
    />
  );
}
