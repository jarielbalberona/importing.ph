import { NextResponse } from "next/server";

import { getPublishedGuideMarkdown } from "@/features/public-content/ai-readable/registry";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const markdown = getPublishedGuideMarkdown(slug);

  if (!markdown) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
    },
  });
}
