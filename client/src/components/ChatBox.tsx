import React, { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../types";
import { Send, MessageSquare, Sparkles, AlertCircle } from "lucide-react";

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSendGuess?: (guess: string) => void;
  isDrawer: boolean;
  isPlaying: boolean;
  error?: string | null;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  onSendGuess,
  isDrawer,
  isPlaying,
  error,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    if (isPlaying && !isDrawer && onSendGuess) {
      // Non-drawer during active game sends guess
      onSendGuess(clean);
    } else {
      // Lobby or Drawer sends general chat
      onSendMessage(clean);
    }

    setInputText("");
  };

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden border border-slate-700/80 shadow-xl">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-700/80 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-sm text-slate-100">
            {isPlaying && !isDrawer ? "Guesses & Chat" : "Room Chat"}
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          {messages.length} messages
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-2.5 text-xs sm:text-sm min-h-[220px]">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5 p-4 text-center">
            <Sparkles className="w-5 h-5 text-indigo-400/60" />
            <span>No messages yet. Start chatting!</span>
          </div>
        ) : (
          messages.map((m) => {
            if (m.type === "system") {
              return (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{m.message}</span>
                </div>
              );
            }

            if (m.type === "correct") {
              return (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900/80 to-teal-950 border border-emerald-500/60 text-emerald-200 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-spin" />
                  <span>{m.message}</span>
                </div>
              );
            }

            if (m.type === "error") {
              return (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{m.message}</span>
                </div>
              );
            }

            if (m.type === "guess") {
              return (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-slate-200"
                >
                  <span className="font-bold text-amber-300 mr-1.5">
                    {m.username}:
                  </span>
                  <span className="text-slate-100">{m.message}</span>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 text-slate-200"
              >
                <span className="font-bold text-indigo-300 mr-1.5">
                  {m.username || "Player"}:
                </span>
                <span className="text-slate-100">{m.message}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error banner inside chat if any */}
      {error && (
        <div className="px-3.5 py-1.5 bg-rose-950/90 text-rose-300 text-xs border-t border-rose-800 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form Area */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900/90 border-t border-slate-700/80">
        <div className="flex gap-2">
          <input
            type="text"
            maxLength={isPlaying && !isDrawer ? 50 : 200}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isPlaying
                ? isDrawer
                  ? "You are drawing! Chat here..."
                  : "Type your guess here..."
                : "Type a message..."
            }
            className="flex-1 h-12 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all leading-normal"
          />
          <button
            type="button"
            onClick={handleSubmit}
            className={`h-12 px-4 rounded-xl font-heading text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 border ${
              isPlaying && !isDrawer
                ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border-amber-400/30 shadow-amber-600/20"
                : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 border-indigo-400/30 shadow-indigo-600/20"
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isPlaying && !isDrawer ? "Guess" : "Send"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
