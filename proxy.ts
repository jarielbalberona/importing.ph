import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/after-auth(.*)",
  "/onboarding(.*)",
  "/app(.*)",
  "/admin(.*)",
  "/api/app-badges(.*)",
  "/api/media(.*)",
]);

const isProtectedApiRoute = createRouteMatcher([
  "/api/app-badges(.*)",
  "/api/media(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedApiRoute(req)) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(
          { error: "unauthenticated", message: "Authentication is required." },
          { status: 401 },
        );
      }
    } else if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    frontendApiProxy: {
      enabled: true,
    },
    contentSecurityPolicy: {
      strict: true,
      directives: {
        "default-src": ["'self'"],
        "connect-src": ["'self'", "wss:"],
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "https://img.clerk.com",
          "https://images.clerkstage.dev",
        ],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
      },
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
