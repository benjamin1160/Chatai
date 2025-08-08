import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { chatId, message } = await req.json();

  let cid = chatId;
  if (!cid) {
    const { data, error } = await supabase
      .from("chats").insert({ user_id: user.id, title: message.slice(0,40) })
      .select("id").single();
    if (error) return new Response(error.message, { status: 400 });
    cid = data!.id;
  }

  await supabase.from("messages").insert({ chat_id: cid, role: "user", content: message });
  const reply = `Echo: ${message}`;
  await supabase.from("messages").insert({ chat_id: cid, role: "assistant", content: reply });
  return Response.json({ chatId: cid, reply });
}
