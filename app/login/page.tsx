"use client"
import { FormEvent } from "react"
import { createClient } from "@supabase/supabase-js"

export default function Page() {
  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get("email") as string
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` }
    })
    alert("Magic link sent.")
  }

  return (
    <form onSubmit={signIn} className="mx-auto max-w-sm p-6">
      <input
        name="email"
        type="email"
        placeholder="you@email.com"
        className="mb-2 w-full border p-2"
      />
      <button className="w-full border px-3 py-2">Send magic link</button>
    </form>
  )
}
