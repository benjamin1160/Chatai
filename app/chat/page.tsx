"use client"

import { useState } from "react"

type Message = { role: "user" | "assistant"; content: string }

export default function ChatPage() {
  const [chatId, setChatId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [msgs, setMsgs] = useState<Message[]>([])

  async function send() {
    if (!input.trim()) return
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ chatId, message: input })
    })
    const data = await res.json()
    setChatId(data.chatId)
    setMsgs(m => [
      ...m,
      { role: "user", content: input },
      { role: "assistant", content: data.reply }
    ])
    setInput("")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div className="h-[60vh] overflow-auto rounded border p-4">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div className="my-1 inline-block rounded border px-3 py-2">
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          className="flex-1 border p-2"
          placeholder="Say something…"
        />
        <button onClick={send} className="border px-3">
          Send
        </button>
      </div>
    </div>
  )
}
