import React, { useState } from "react";
import { PlusCircle, LogIn, AlertCircle, Loader2, Palette, Sparkles, User, Key } from "lucide-react";

interface HomeViewProps {
  username: string;
  setUsername: (name: string) => void;
  onCreateRoom: (username: string) => void;
  onJoinRoom: (code: string, username: string) => void;
  error: string | null;
  isLoading: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  username,
  setUsername,
  onCreateRoom,
  onJoinRoom,
  error,
  isLoading,
}) => {
  const [roomCode, setRoomCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!username.trim()) {
      setLocalError("Please enter your nickname to continue!");
      return;
    }
    onCreateRoom(username.trim());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!username.trim()) {
      setLocalError("Please enter your nickname first!");
      return;
    }
    if (!roomCode.trim()) {
      setLocalError("Please enter a room code!");
      return;
    }
    onJoinRoom(roomCode.trim().toUpperCase(), username.trim());
  };

  const activeError = error || localError;

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Banner Section */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 border border-indigo-400/30 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 transform -rotate-3 hover:rotate-0 transition-transform">
            <Palette className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
          </div>
          <div>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Skribbl<span className="text-indigo-400">.io</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1 font-medium leading-relaxed">
              Draw, guess, and compete with friends in real-time!
            </p>
          </div>
        </div>

        {/* Form Container Card */}
        <div className="glass-panel p-6 sm:p-8 flex flex-col gap-6 border border-slate-700/80 shadow-2xl relative">
          {/* Global / Local Error display */}
          {activeError && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-sm font-semibold animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="leading-normal">{activeError}</span>
            </div>
          )}

          {/* Nickname Input Section */}
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 leading-normal pb-0.5">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Your Nickname</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. PicassoMaster"
                className="w-full h-14 px-4 pr-16 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder:text-slate-500 font-semibold text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all leading-normal"
                disabled={isLoading}
              />
              <span className="absolute right-4 text-xs font-mono font-bold text-slate-500 pointer-events-none">
                {username.length}/20
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-800/80 w-full" />

          {/* Actions Section */}
          <div className="flex flex-col gap-4">
            {/* Create Room Button */}
            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full h-14 rounded-xl font-heading text-lg font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:from-indigo-500 hover:to-pink-500 active:scale-[0.98] shadow-lg shadow-indigo-600/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-6 h-6 stroke-[2.5]" />
                  <span>Create New Room</span>
                </>
              )}
            </button>

            {/* Join Room Section */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 leading-normal">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Join Existing Room</span>
              </label>

              <form onSubmit={handleJoin} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  className="flex-1 h-14 px-4 rounded-xl bg-slate-900/90 border border-slate-700 text-amber-300 placeholder:text-slate-500 font-mono font-bold text-center tracking-widest text-lg uppercase focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40 transition-all leading-normal"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 px-7 rounded-xl font-heading text-base font-bold text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-[0.98] shadow-lg shadow-amber-600/25 focus:outline-none focus:ring-4 focus:ring-amber-500/40 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer border border-amber-400/30 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Join Room</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Multiplayer Canvas • Real-time Socket.IO Sync</span>
        </div>
      </div>
    </div>
  );
};
