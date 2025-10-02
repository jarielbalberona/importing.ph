import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
  ],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: [
    "/api/health",
    "/api/csrf-token",
  ],
  // Custom logic for role-based routing
  afterAuth(auth, req) {
    const { userId, sessionClaims } = auth;
    const { pathname } = req.nextUrl;

    // If user is not signed in and trying to access protected routes
    if (!userId && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // If user is signed in, check role-based access
    if (userId && sessionClaims) {
      const userRole = sessionClaims.publicMetadata?.role as string;

      // Redirect to role selection if no role is set
      if (pathname.startsWith("/dashboard") && !userRole) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Role-based access control
      if (pathname.startsWith("/dashboard/importer") && userRole !== "importer") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (pathname.startsWith("/dashboard/forwarder") && userRole !== "forwarder") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
});

export const config = {
  // Protects all routes including api/trpc routes
  // Please edit this to allow other routes to be public as needed.
  // See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
