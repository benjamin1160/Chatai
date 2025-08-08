import { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { createServerClient, CookieOptions } from "@supabase/ssr"

export async function POST(req: NextRequest) {
  // Auth (server-side, cookie-based)
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  // Input
  let body: any
  try {
    body = await req.json()
  } catch {
    return new Response("Bad JSON", { status: 400 })
  }
  const { chatId, message } = body
  if (!message || typeof message !== "string")
    return new Response("Message required", { status: 400 })

  // Create chat if first message, else ensure the chat belongs to the user
  let cid: string | null = chatId ?? null
  if (!cid) {
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title: message.slice(0, 60) })
      .select("id")
      .single()
    if (error) return new Response(error.message, { status: 400 })
    cid = data!.id
  } else {
    const { data, error } = await supabase
      .from("chats")
      .select("id")
      .eq("id", cid)
      .eq("user_id", user.id)
      .single()
    if (error || !data) return new Response("Forbidden", { status: 403 })
  }

  // Persist user message
  await supabase.from("messages").insert({
    chat_id: cid,
    role: "user",
    content: message
  })

  // Stubbed assistant reply (replace with Llama later)
  const reply = `Echo: ${message}`
  await supabase.from("messages").insert({
    chat_id: cid,
    role: "assistant",
    content: reply
  })

  return Response.json({ chatId: cid, reply })
}

// Optional: health check
export async function GET() {
  return new Response("ok")
}
