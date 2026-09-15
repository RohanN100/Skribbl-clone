import React, { useState } from "react";
import type { Player, ChatMessage } from "../types";
import { PlayerList } from "./PlayerList";
import { ChatBox } from "./ChatBox";
import { Copy, Check, Play, Users, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";

interface LobbyViewProps {
  roomCode: string;
  players: Player[];
  currentSocketId: string;
  onStartGame: () => void;
  onSendMessage: (message: string) => void;
  chatMessages: ChatMessage[];
  error: string | null;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomCode,
  players,
  currentSocketId,
  onStartGame,
  onSendMessage,
  chatMessages,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = players.length >= 2;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Top Banner Card */}
      <div className="glass-panel p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 border border-indigo-400/40 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
                Lobby Room Code
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-amber-300">
                {roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Start Game Action Button */}
        <div className="flex flex-col items-center sm:items-end gap-2 w-full md:w-auto">
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`w-full sm:w-auto h-16 px-10 rounded-2xl font-heading text-xl font-extrabold text-white flex items-center justify-center gap-3 transition-all cursor-pointer ${
              canStart
                ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-xl shadow-emerald-600/30 active:scale-[0.98] border border-emerald-400/40 animate-pulse-glow"
                : "bg-slate-800/90 text-slate-500 border border-slate-700 cursor-not-allowed opacity-70"
            }`}
          >
            <Play className="w-6 h-6 fill-current" />
            <span>Start Game</span>
          </button>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {canStart ? `${players.length} Players Ready!` : `Need at least 2 players (${players.length}/2)`}
          </span>
        </div>
      </div>

      {/* Global Lobby Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Player List + Chat Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[460px]">
        {/* Left Column: Player List */}
        <div className="lg:col-span-1 glass-panel p-5 flex flex-col justify-between gap-4 border border-slate-700/80 shadow-xl">
          <PlayerList
            players={players}
            currentSocketId={currentSocketId}
          />

          {!canStart && (
            <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-800/50 text-amber-300 text-xs flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Invite a friend using code [{roomCode}] to start the game!</span>
            </div>
          )}
        </div>

        {/* Right Column: Chat Box */}
        <div className="lg:col-span-2 min-h-[380px]">
          <ChatBox
            messages={chatMessages}
            onSendMessage={onSendMessage}
            isDrawer={false}
            isPlaying={false}
          />
        </div>
      </div>
    </div>
  );
};
