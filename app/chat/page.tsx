"use client";
import { useState } from "react";
export default function ChatPage(){
  const [chatId,setChatId]=useState<string|null>(null);
  const [input,setInput]=useState(""); const [msgs,setMsgs]=useState<{role:"user"|"assistant";content:string}[]>([]);
  async function send(){
    if(!input.trim())return;
    const r=await fetch("/api/chat",{method:"POST",body:JSON.stringify({chatId,message:input})});
    const data=await r.json();
    setChatId(data.chatId);
    setMsgs(m=>[...m,{role:"user",content:input},{role:"assistant",content:data.reply}]);
    setInput("");
  }
  return (<div className="max-w-2xl mx-auto p-6 space-y-4">
    <div className="border rounded p-4 h-[60vh] overflow-auto">
      {msgs.map((m,i)=>(<div key={i} className={m.role==="user"?"text-right":""}>
        <div className="inline-block border rounded px-3 py-2 my-1">{m.content}</div></div>))}
    </div>
    <div className="flex gap-2">
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} className="border p-2 flex-1" placeholder="Say something…" />
      <button onClick={send} className="border px-3">Send</button>
    </div></div>);
}
