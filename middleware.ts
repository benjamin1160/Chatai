import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: Request) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: () => null, set: () => {}, remove: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = new URL(req.url);
  const publicPaths = ["/login", "/auth/callback", "/auth/confirm"];

  if (!user && !publicPaths.includes(url.pathname))
    return NextResponse.redirect(new URL("/login", req.url));
  if (user && url.pathname === "/login")
    return NextResponse.redirect(new URL("/chat", req.url));
  return res;
}
export const config = { matcher: ["/((?!_next|.*\\.(?:png|jpg|svg|css|js|ico)).*)"] };
