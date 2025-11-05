"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [...messages, newMsg] }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    setLoading(false);
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed  z-50 flex h-20 w-20 items-center justify-center bg-[#7B2CBF] text-white rounded-full  hover:bg-[#6922a7] transition-transform hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Janela do chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl border border-[#E3D2F5] bg-white shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-[#7B2CBF] text-white p-3 font-semibold text-center">
            Assistente Açaí Coleta 🌿
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm max-h-96">
            {messages.length === 0 && (
              <p className="text-gray-400 text-center text-xs">
                Olá 👋 Sou o assistente da Açaí Coleta.  
                Pergunte sobre coletas, pagamentos e certificações!
              </p>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[90%] ${
                  m.role === "user"
                    ? "ml-auto bg-[#F6F1FF] text-right text-[#2B0141]"
                    : "mr-auto bg-[#F2E9FF] text-left text-[#4B0D66]"
                }`}
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <p className="text-xs text-gray-400 animate-pulse">Digitando...</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="flex border-t border-[#E3D2F5]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre o Açaí Coleta..."
              className="flex-1 p-2 text-sm outline-none text-[#2B0141]"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#7B2CBF] text-white px-3 rounded-r-lg hover:bg-[#6922a7] disabled:opacity-50"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
