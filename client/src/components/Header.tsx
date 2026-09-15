import React from "react";
import { Paintbrush, Wifi, WifiOff, Users, Key } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  username: string;
  roomCode: string;
  onLeaveRoom?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  username,
  roomCode,
  onLeaveRoom,
}) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/30 transform -rotate-3 hover:rotate-0 transition-transform">
            <Paintbrush className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300 bg-clip-text text-transparent tracking-tight">
              Skribbl<span className="text-indigo-400">.io</span>
            </h1>
          </div>
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {roomCode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 text-xs sm:text-sm">
              <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden md:inline text-slate-400 font-medium">Room:</span>
              <span className="font-mono font-bold tracking-wider text-amber-300 text-xs sm:text-sm">
                {roomCode}
              </span>
            </div>
          )}

          {username && (
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-semibold text-slate-100 truncate">{username}</span>
            </div>
          )}

          {/* Connection status badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold border ${
            isConnected
              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
              : "bg-rose-950/80 text-rose-400 border-rose-800/80"
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {onLeaveRoom && roomCode && (
            <button
              onClick={onLeaveRoom}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/80 transition-all cursor-pointer"
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
