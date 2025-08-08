import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const url = new URL(request.url);
  const publicPaths = ["/login", "/auth/callback", "/auth/confirm"];

  if (!user && !publicPaths.includes(url.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && url.pathname === "/login") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\.(?:png|jpg|svg|css|js|ico)).*)"]
};
