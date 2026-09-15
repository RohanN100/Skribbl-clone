import React from "react";
import type { Player } from "../types";
import { User, Paintbrush, Trophy } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  currentSocketId?: string;
  drawerId?: string;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentSocketId,
  drawerId,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span>Players ({players.length})</span>
        <Trophy className="w-3.5 h-3.5 text-amber-400" />
      </div>

      <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
        {players.map((p, index) => {
          const isCurrent = p.id === currentSocketId;
          const isDrawer = p.id === drawerId || p.isDrawing;

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isDrawer
                  ? "bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-500/10"
                  : isCurrent
                  ? "bg-indigo-950/40 border-indigo-500/50"
                  : "bg-slate-800/60 border-slate-700/60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar Icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                    isDrawer
                      ? "bg-gradient-to-tr from-amber-500 to-orange-400"
                      : "bg-slate-700"
                  }`}
                >
                  {isDrawer ? (
                    <Paintbrush className="w-5 h-5 text-slate-950 animate-bounce" />
                  ) : (
                    <User className="w-5 h-5 text-slate-300" />
                  )}
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-slate-100 text-sm truncate">
                      {p.username}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    #{index + 1} Place
                  </div>
                </div>
              </div>

              {/* Right Side - Score & Role */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="font-mono font-extrabold text-amber-300 text-sm">
                    {p.score} <span className="text-[10px] text-amber-400/80 font-normal">pts</span>
                  </div>
                  {isDrawer && (
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Drawing
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
