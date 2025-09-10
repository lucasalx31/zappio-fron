import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_NAME = "auth-token";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const protectedMatchers = ["/dashboard", "/settings", "/report", "/help"];

async function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get(JWT_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      { algorithms: ["HS256"] }
    );
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const authed = await isAuthenticated(req);

  if (protectedMatchers.some((p) => pathname.startsWith(p))) {
    if (!authed) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirectTo", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === "/login" && authed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*","/help/:path*","/report/:path*","/settings/:path*", "/login"],
};
