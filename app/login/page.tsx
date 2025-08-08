"use client";
import { createClient } from "@supabase/supabase-js";
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export default function Page() {
  async function signin(e:any){ e.preventDefault();
    const email = new FormData(e.currentTarget).get("email") as string;
    await s.auth.signInWithOtp({ email }); alert("Magic link sent."); }
  return (<form onSubmit={signin} className="max-w-sm mx-auto p-6">
    <input name="email" type="email" placeholder="you@email.com" className="border p-2 w-full mb-2" />
    <button className="border px-3 py-2 w-full">Send magic link</button>
  </form>);
}
