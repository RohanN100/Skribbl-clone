import React, { useRef, useEffect, useCallback } from "react";
import { socket } from "../socket/socket";
import type { DrawStartPayload, DrawMovePayload } from "../types";

interface CanvasBoardProps {
  isDrawer: boolean;
  currentColor: string;
  lineWidth: number;
  clearTrigger: number; // Increment to clear canvas
}

export const CanvasBoard: React.FC<CanvasBoardProps> = ({
  isDrawer,
  currentColor,
  lineWidth,
  clearTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Clear internal canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Listen for clear triggers
  useEffect(() => {
    clearCanvas();
  }, [clearTrigger, clearCanvas]);

  // Set up high DPI canvas resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Socket listener for receiving draw events from drawer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isRemoteDrawing = false;
    let remoteLastPos: { x: number; y: number } | null = null;

    const handleRemoteDrawStart = (data: DrawStartPayload) => {
      isRemoteDrawing = true;
      const rect = canvas.getBoundingClientRect();
      remoteLastPos = {
        x: data.x * rect.width,
        y: data.y * rect.height,
      };
    };

    const handleRemoteDrawMove = (data: DrawMovePayload) => {
      if (!isRemoteDrawing || !remoteLastPos) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const currentX = data.x * rect.width;
      const currentY = data.y * rect.height;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "#0f172a"; // Crisp dark ink stroke
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(remoteLastPos.x, remoteLastPos.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      ctx.restore();

      remoteLastPos = { x: currentX, y: currentY };
    };

    const handleRemoteDrawEnd = () => {
      isRemoteDrawing = false;
      remoteLastPos = null;
    };

    socket.on("draw_start", handleRemoteDrawStart);
    socket.on("draw_move", handleRemoteDrawMove);
    socket.on("draw_end", handleRemoteDrawEnd);

    return () => {
      socket.off("draw_start", handleRemoteDrawStart);
      socket.off("draw_move", handleRemoteDrawMove);
      socket.off("draw_end", handleRemoteDrawEnd);
    };
  }, []);

  // Helper to get normalized coordinates (0.0 to 1.0)
  const getNormalizedPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    return { x, y, rectWidth: rect.width, rectHeight: rect.height };
  }, []);

  // Mouse & Touch Event Handlers for Drawer
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer) return;
    const pos = getNormalizedPos(e);
    if (!pos) return;

    isDrawingRef.current = true;
    lastPosRef.current = { x: pos.x * pos.rectWidth, y: pos.y * pos.rectHeight };

    // Emit to backend
    socket.emit("draw_start", { x: pos.x, y: pos.y });

    // Local draw point
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x * pos.rectWidth, pos.y * pos.rectHeight, lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = currentColor;
        ctx.fill();
        ctx.restore();
      }
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer || !isDrawingRef.current) return;
    const pos = getNormalizedPos(e);
    if (!pos || !lastPosRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const currentX = pos.x * pos.rectWidth;
    const currentY = pos.y * pos.rectHeight;

    if (ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      ctx.restore();
    }

    lastPosRef.current = { x: currentX, y: currentY };

    // Emit to backend
    socket.emit("draw_move", { x: pos.x, y: pos.y });
  };

  const handleEnd = () => {
    if (!isDrawer || !isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPosRef.current = null;

    // Emit to backend
    socket.emit("draw_end");
  };

  return (
    <div className="canvas-wrapper w-full h-full min-h-[350px] sm:min-h-[420px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl relative bg-white">
      <canvas
        ref={canvasRef}
        className={`canvas-element ${!isDrawer ? "read-only" : ""}`}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
      {!isDrawer && (
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 shadow-md pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Observing drawer...</span>
        </div>
      )}
    </div>
  );
};
