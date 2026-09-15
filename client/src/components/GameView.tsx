import React, { useState } from "react";
import type { Player, ChatMessage } from "../types";
import { CanvasBoard } from "./CanvasBoard";
import { DrawingControls } from "./DrawingControls";
import { PlayerList } from "./PlayerList";
import { ChatBox } from "./ChatBox";
import { Clock, Paintbrush, HelpCircle, Trophy, MessageSquare } from "lucide-react";

interface GameViewProps {
  currentRound: number;
  totalRounds: number;
  drawerId: string;
  isDrawer: boolean;
  secretWord: string;
  timeLeft: number;
  players: Player[];
  currentSocketId: string;
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSendGuess: (guess: string) => void;
  error: string | null;
}

export const GameView: React.FC<GameViewProps> = ({
  currentRound,
  totalRounds,
  drawerId,
  isDrawer,
  secretWord,
  timeLeft,
  players,
  currentSocketId,
  chatMessages,
  onSendMessage,
  onSendGuess,
  error,
}) => {
  const [currentColor, setCurrentColor] = useState("#0f172a");
  const [lineWidth, setLineWidth] = useState(6);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [mobileTab, setMobileTab] = useState<"game" | "players" | "chat">("game");

  const handleClearCanvas = () => {
    setClearTrigger((prev) => prev + 1);
  };

  const drawerPlayer = players.find((p) => p.id === drawerId);

  // Timer urgency color
  const getTimerColorClass = () => {
    if (timeLeft > 5) return "text-emerald-400 border-emerald-700/80 bg-emerald-950/60";
    if (timeLeft > 2) return "text-amber-400 border-amber-700/80 bg-amber-950/60";
    return "text-rose-400 border-rose-700/80 bg-rose-950/80 animate-pulse";
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
      {/* Top Status Banner */}
      <div className="glass-panel p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 border border-indigo-500/20 shadow-xl">
        {/* Round Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Round
          </span>
          <span className="px-3 py-1 rounded-xl bg-indigo-950/90 border border-indigo-600/60 font-mono font-extrabold text-indigo-300 text-sm sm:text-base">
            {currentRound} / {totalRounds}
          </span>
        </div>

        {/* Word Display (Secret for drawer, drawer name for guessers) */}
        <div className="flex-1 text-center min-w-[200px]">
          {isDrawer ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/60 text-amber-300 shadow-lg shadow-amber-500/10">
              <Paintbrush className="w-5 h-5 text-amber-400 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Your Word:
              </span>
              <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-widest text-amber-200">
                {secretWord ? secretWord.toUpperCase() : "..."}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-200 shadow-md">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Drawer:
              </span>
              <span className="font-bold text-indigo-300 text-sm sm:text-base">
                {drawerPlayer ? drawerPlayer.username : "Player"}
              </span>
            </div>
          )}
        </div>

        {/* Timer Badge */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl border font-mono font-extrabold text-lg sm:text-xl transition-colors shadow-md ${getTimerColorClass()}`}>
          <Clock className="w-5 h-5" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden rounded-xl bg-slate-900/90 p-1 border border-slate-800">
        <button
          onClick={() => setMobileTab("game")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === "game"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Paintbrush className="w-4 h-4" />
          <span>Canvas</span>
        </button>

        <button
          onClick={() => setMobileTab("players")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === "players"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Scores ({players.length})</span>
        </button>

        <button
          onClick={() => setMobileTab("chat")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === "chat"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>
      </div>

      {/* Main Game Grid (3 columns on Desktop, Tabbed on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[480px]">
        {/* Left Column: Player List */}
        <div className={`lg:col-span-1 glass-panel p-4 flex-col justify-between ${
          mobileTab === "players" ? "flex" : "hidden lg:flex"
        }`}>
          <PlayerList
            players={players}
            currentSocketId={currentSocketId}
            drawerId={drawerId}
          />
        </div>

        {/* Center Column: Canvas Board + Drawing Controls */}
        <div className={`lg:col-span-2 flex-col gap-3 ${
          mobileTab === "game" ? "flex" : "hidden lg:flex"
        }`}>
          <CanvasBoard
            isDrawer={isDrawer}
            currentColor={currentColor}
            lineWidth={lineWidth}
            clearTrigger={clearTrigger}
          />

          {isDrawer && (
            <DrawingControls
              currentColor={currentColor}
              setCurrentColor={setCurrentColor}
              lineWidth={lineWidth}
              setLineWidth={setLineWidth}
              onClearCanvas={handleClearCanvas}
            />
          )}
        </div>

        {/* Right Column: Chat Box */}
        <div className={`lg:col-span-1 flex-col min-h-[380px] ${
          mobileTab === "chat" ? "flex" : "hidden lg:flex"
        }`}>
          <ChatBox
            messages={chatMessages}
            onSendMessage={onSendMessage}
            onSendGuess={onSendGuess}
            isDrawer={isDrawer}
            isPlaying={true}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};
