import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

const AUTH_ONLY_PREFIXES = ["/post", "/dashboard"];
const ADMIN_ONLY_PREFIXES = ["/admin"];
const GUEST_ONLY_ROUTES = ["/login", "/signup"];

// This is an OPTIMISTIC check only: Proxy runs in an isolated execution
// context (Next.js docs: "you should not attempt relying on shared modules
// or globals"), so we only check whether a session cookie is present, not
// whether it's valid. The real, secure check (signature + expiry + role)
// happens in requireUser()/requireAdmin() inside Server Components and
// Server Actions, which run in the normal Node.js process and always have
// reliable access to SESSION_SECRET. That's the actual security boundary;
// this just avoids flashing a protected page before redirecting.
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSessionCookie = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);

  const needsAuth = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  const guestOnly = GUEST_ONLY_ROUTES.includes(pathname);

  if ((needsAuth || needsAdmin) && !hasSessionCookie) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (guestOnly && hasSessionCookie) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/).*)"],
};
