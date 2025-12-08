import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const sessionId = req.cookies.get("sessionId")?.value;

  const { pathname } = req.nextUrl;

  // Nếu đang ở trang login và đã có token → redirect dashboard
  if (pathname.startsWith("/auth/login")) {
    if (token || sessionId) {
      return NextResponse.redirect(new URL("/dashboard/job", req.url));
    }
    return NextResponse.next();
  }

  // Nếu vào dashboard mà không có token → redirect login
  if (pathname.startsWith("/dashboard")) {
    if (!token && !sessionId) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // Root path
  if (pathname === "/") {
    if (token || sessionId) {
      return NextResponse.redirect(new URL("/dashboard/job", req.url));
    }
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
