"use client";

import { useEffect, useRef } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { useAtlas } from "./atlas-provider";

export function AtlasCommandPanel() {
  const { isOpen, closeAtlas, input, setInput, messages, sendMessage } = useAtlas();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/30 bg-background">
              <img
                src="/ATLAS-logo.png"
                alt="ATLAS"
                className="h-6 w-6 object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">ATLAS</div>
              <div className="text-xs text-muted-foreground">
                Command palette and conversation shell
              </div>
            </div>
          </div>

          <button
            onClick={closeAtlas}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:text-foreground"
            aria-label="Close ATLAS"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="max-h-[420px] space-y-4 overflow-y-auto px-5 py-5"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-auto bg-accent/15 text-foreground"
                  : "bg-background text-foreground border border-border"
              }`}
            >
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {message.role === "user" ? "You" : "ATLAS"}
              </div>
              <div>{message.content}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Ask ATLAS anything about BuildPod OS..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={sendMessage}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-black transition hover:opacity-90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Send
            </button>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            Esc closes · session memory persists while the browser tab stays open
          </div>
        </div>
      </div>
    </div>
  );
}