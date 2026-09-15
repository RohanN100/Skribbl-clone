import React, { useEffect } from "react";
import type { Player } from "../types";
import confetti from "canvas-confetti";
import { Trophy, Crown, RotateCcw, Home, Medal, Sparkles, Award } from "lucide-react";

interface GameOverViewProps {
  players: Player[];
  currentSocketId: string;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export const GameOverView: React.FC<GameOverViewProps> = ({
  players,
  currentSocketId,
  onPlayAgain,
  onBackToHome,
}) => {
  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  useEffect(() => {
    // Fire celebratory confetti bursts
    const count = 200;
    const defaults = { origin: { y: 0.65 } };

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    fire(0.25, { spread: 30, startVelocity: 55 });
    fire(0.2, { spread: 70 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-2xl flex flex-col gap-6 animate-fadeIn">
        {/* Header Title Section */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 border border-amber-300/50 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/30 animate-bounce">
            <Crown className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent">
              Game Over!
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1 font-medium">
              Congratulations to all players for an amazing match!
            </p>
          </div>
        </div>

        {/* Winner Hero Showcase Card */}
        {winner && (
          <div className="relative rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-amber-950/60 border border-amber-500/50 p-6 shadow-2xl shadow-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shrink-0">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 1st Place Winner
                  </span>
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-extrabold text-amber-200 mt-0.5">
                  {winner.username}
                </div>
              </div>
            </div>

            <div className="px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-lg font-extrabold shrink-0 shadow-inner">
              {winner.score} <span className="text-xs font-sans font-semibold text-amber-400">PTS</span>
            </div>
          </div>
        )}

        {/* Final Leaderboard Card */}
        <div className="glass-panel p-5 sm:p-7 flex flex-col gap-5 border border-slate-700/80 shadow-2xl">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-heading font-bold text-slate-100 text-lg sm:text-xl">
                Final Leaderboard
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {players.length} Players Total
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            {sortedPlayers.map((p, index) => {
              const isCurrent = p.id === currentSocketId;
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isFirst
                      ? "bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-500/10"
                      : isSecond
                      ? "bg-slate-800/80 border-slate-600/60"
                      : isThird
                      ? "bg-amber-950/20 border-amber-800/40"
                      : isCurrent
                      ? "bg-indigo-950/40 border-indigo-500/50"
                      : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Rank Badge */}
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {isFirst ? (
                        <Crown className="w-5 h-5 text-amber-400" />
                      ) : isSecond ? (
                        <Medal className="w-5 h-5 text-slate-300" />
                      ) : isThird ? (
                        <Medal className="w-5 h-5 text-amber-600" />
                      ) : (
                        <span className="text-slate-400 text-xs font-mono font-bold">#{index + 1}</span>
                      )}
                    </div>

                    <div className="truncate">
                      <div className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2 truncate">
                        <span className="truncate">{p.username}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="font-mono font-extrabold text-amber-300 text-base sm:text-lg shrink-0">
                    {p.score} <span className="text-xs font-sans text-amber-400/80 font-normal">pts</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Responsive Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            {/* Play Again (Primary Button) */}
            <button
              onClick={onPlayAgain}
              className="w-full h-14 rounded-xl font-heading text-lg font-bold text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] shadow-lg shadow-emerald-600/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>Play Again</span>
            </button>

            {/* Back to Home (Secondary Button) */}
            <button
              onClick={onBackToHome}
              className="w-full h-14 rounded-xl font-heading text-lg font-bold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-slate-600 active:scale-[0.98] shadow-md focus:outline-none focus:ring-4 focus:ring-slate-700/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <Home className="w-5 h-5 text-slate-400" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
