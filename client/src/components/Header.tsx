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
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 transform -rotate-3 hover:rotate-0 transition-transform">
            <Paintbrush className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300 bg-clip-text text-transparent tracking-wide">
              Skribbl.io <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 font-sans border border-indigo-700/50">Clone</span>
            </h1>
          </div>
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-3">
          {roomCode && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-sm">
              <Key className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 font-medium">Room:</span>
              <span className="font-mono font-bold tracking-wider text-amber-300">{roomCode}</span>
            </div>
          )}

          {username && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-sm">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-100">{username}</span>
            </div>
          )}

          {/* Connection status badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            isConnected
              ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
              : "bg-rose-950/60 text-rose-400 border-rose-800/60"
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                <span>Offline</span>
              </>
            )}
          </div>

          {onLeaveRoom && roomCode && (
            <button
              onClick={onLeaveRoom}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700 transition-colors"
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
