import React from "react";
import { Trash2, Eraser, Palette } from "lucide-react";

interface DrawingControlsProps {
  currentColor: string;
  setCurrentColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  onClearCanvas: () => void;
}

const PALETTE_COLORS = [
  "#0f172a", // Black
  "#64748b", // Gray
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Yellow
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#78350f", // Brown
  "#ffffff", // White / Eraser
];

const STROKE_SIZES = [
  { label: "S", value: 3, size: 6 },
  { label: "M", value: 8, size: 10 },
  { label: "L", value: 16, size: 16 },
  { label: "XL", value: 28, size: 22 },
];

export const DrawingControls: React.FC<DrawingControlsProps> = ({
  currentColor,
  setCurrentColor,
  lineWidth,
  setLineWidth,
  onClearCanvas,
}) => {
  const isEraserActive = currentColor.toLowerCase() === "#ffffff";

  return (
    <div className="glass-panel p-3.5 flex flex-wrap items-center justify-between gap-4 border border-slate-700/80 shadow-xl">
      {/* Left: Color Swatches */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 text-xs font-bold text-indigo-300 mr-1 uppercase tracking-wider">
          <Palette className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Palette</span>
        </div>

        {PALETTE_COLORS.map((color) => {
          const isSelected = currentColor.toLowerCase() === color.toLowerCase();
          const isWhite = color === "#ffffff";

          return (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all border-2 flex items-center justify-center relative ${
                isSelected
                  ? "scale-110 border-amber-400 ring-2 ring-amber-400/40 shadow-lg"
                  : "border-slate-800 hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              title={isWhite ? "Eraser" : color}
            >
              {isWhite && <Eraser className="w-3.5 h-3.5 text-slate-800" />}
            </button>
          );
        })}
      </div>

      {/* Right: Brush Thickness & Tools */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Stroke Size Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80">
          {STROKE_SIZES.map((stroke) => {
            const isSelected = lineWidth === stroke.value;

            return (
              <button
                key={stroke.value}
                onClick={() => setLineWidth(stroke.value)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title={`Brush size ${stroke.label}`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: `${stroke.size}px`, height: `${stroke.size}px` }}
                />
              </button>
            );
          })}
        </div>

        {/* Quick Eraser Toggle */}
        <button
          onClick={() => setCurrentColor("#ffffff")}
          className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
            isEraserActive
              ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
          }`}
          title="Eraser"
        >
          <Eraser className="w-4 h-4" />
          <span className="hidden xs:inline">Eraser</span>
        </button>

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          className="p-2 sm:px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
          title="Clear Canvas"
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </div>
  );
};
