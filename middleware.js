import { NextResponse } from "next/server";

export function middleware(req) {
  if(req.nextUrl.pathname.startsWith("/admin") && !req.nextUrl.pathname.startsWith("/admin/login")){
    const auth = req.cookies.get("admin_auth")?.value;
    if(auth !== "ok"){
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
