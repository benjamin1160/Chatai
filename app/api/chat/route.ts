import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { Database } from "@/supabase/types"

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json("Unauthorized", { status: 401 })

  const { chatId, message } = await req.json()

  let cid = chatId
  if (!cid) {
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title: message.slice(0, 40) } as any)
      .select("id")
      .single()
    if (error) return NextResponse.json(error.message, { status: 400 })
    cid = data!.id
  }

  await supabase
    .from("messages")
    .insert({ chat_id: cid, role: "user", content: message } as any)
  const reply = `Echo: ${message}`
  await supabase
    .from("messages")
    .insert({ chat_id: cid, role: "assistant", content: reply } as any)
  return NextResponse.json({ chatId: cid, reply })
}
