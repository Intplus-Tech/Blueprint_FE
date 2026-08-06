"use client";

import { useState, type FormEvent } from "react";
import { Globe, X, Send, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const QUICK_START = [
  "Summarize this document in 3 bullet points",
  "Highlight any offer clauses (e.g. non-compete/termination)",
  "List all obligations for both parties with deadlines",
];

// TODO: replace with a real call to your AI review backend / model.
function getCannedReply(prompt: string): string {
  return (
    `Here's a quick read on that:\n\n` +
    `1. The document appears to be a standard bilateral agreement with defined obligations for both parties.\n` +
    `2. No unusual termination or non-compete language stands out on an initial pass — worth a closer legal review before signing.\n` +
    `3. Key dates and deliverables should be double-checked against your internal calendar.\n\n` +
    `This is a placeholder response — wire up a real model call here to replace it.`
  );
}

export function AITorneyChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: getCannedReply(trimmed) }]);
      setIsThinking(false);
    }, 900);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="absolute right-0 top-full z-30 mt-2 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="text-sm font-bold text-gray-900">AI TORNEY</span>
        <div className="flex items-center gap-3">
          <a href="https://www.torney.cc" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600">
            <Globe className="h-3.5 w-3.5" />
            www.torney.cc
          </a>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close chat">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400">Quick Start</p>
            {QUICK_START.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)} className="block w-full rounded-md bg-brand-50 px-3 py-2 text-left text-xs text-brand-700 hover:bg-brand-100">
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white", msg.role === "user" ? "bg-gray-700" : "bg-brand-600")}>
              {msg.role === "user" ? "AJ" : "AI"}
            </div>
            <div className={cn("max-w-[75%] space-y-1", msg.role === "user" ? "items-end" : "items-start")}>
              <div className={cn("whitespace-pre-line rounded-lg px-3 py-2 text-xs leading-relaxed", msg.role === "user" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-700")}>
                {msg.text}
              </div>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 px-1 text-gray-300">
                  <button type="button" className="hover:text-gray-500" aria-label="Good response"><ThumbsUp className="h-3 w-3" /></button>
                  <button type="button" className="hover:text-gray-500" aria-label="Bad response"><ThumbsDown className="h-3 w-3" /></button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">AI</div>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message to AI Torney..."
          className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button type="submit" disabled={!input.trim()} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40" aria-label="Send">
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}