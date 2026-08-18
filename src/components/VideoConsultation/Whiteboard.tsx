import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pencil, Eraser, Square, Circle, Undo, Redo, Download, Trash2 } from 'lucide-react';

export interface WhiteboardProps {
  isShared?: boolean;
  onShare?: (canvas: HTMLCanvasElement) => void;
  tools?: ('pencil' | 'eraser' | 'rectangle' | 'circle')[];
}

export const Whiteboard: React.FC<WhiteboardProps> = ({
  isShared = true,
  onShare,
  tools = ['pencil', 'eraser', 'rectangle', 'circle']
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pencil' | 'eraser' | 'rectangle' | 'circle'>('pencil');
  const [color, setColor] = useState('#FFFFFF');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSharing, setIsSharing] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const saveState = useCallback((ctx: CanvasRenderingContext2D) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), imageData]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    saveState(ctx);
  }, [color, strokeWidth, saveState]);

  const undo = useCallback(() => {
    if (historyIndex > 0 && ctxRef.current) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      ctxRef.current.putImageData(history[newIndex], 0, 0);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1 && ctxRef.current) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      ctxRef.current.putImageData(history[newIndex], 0, 0);
    }
  }, [history, historyIndex]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState(ctx);
  }, [saveState]);

  const getPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPosition(e);
    const ctx = ctxRef.current;
    if (!ctx) return;

    setIsDrawing(true);
    startPosRef.current = pos;

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = currentTool === 'eraser' ? '#0F172A' : color;
      ctx.lineWidth = currentTool === 'eraser' ? 20 : strokeWidth;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctxRef.current) return;

    const ctx = ctxRef.current;
    const pos = getPosition(e);

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (currentTool === 'rectangle' && startPosRef.current) {
      const start = startPosRef.current;
      const width = pos.x - start.x;
      const height = pos.y - start.y;

      if (historyIndex >= 0 && history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }

      ctx.beginPath();
      ctx.rect(start.x, start.y, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    } else if (currentTool === 'circle' && startPosRef.current) {
      const start = startPosRef.current;
      const radius = Math.sqrt(
        Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2)
      );

      if (historyIndex >= 0 && history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }

      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing && ctxRef.current) {
      saveState(ctxRef.current);
    }
    setIsDrawing(false);
    startPosRef.current = null;
  };

  const handleShare = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSharing(true);
    if (onShare) {
      onShare(canvas);
    }
    setTimeout(() => setIsSharing(false), 1000);
  }, [onShare]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `clinical_whiteboard_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <div id="clinical-whiteboard" className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {tools.includes('pencil') && (
            <button
              id="btn-wb-pencil"
              type="button"
              onClick={() => setCurrentTool('pencil')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                currentTool === 'pencil' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
              title="Pencil"
              aria-label="Select Pencil"
            >
              <Pencil className="h-4 w-4 text-white" />
            </button>
          )}
          {tools.includes('eraser') && (
            <button
              id="btn-wb-eraser"
              type="button"
              onClick={() => setCurrentTool('eraser')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                currentTool === 'eraser' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
              title="Eraser"
              aria-label="Select Eraser"
            >
              <Eraser className="h-4 w-4 text-white" />
            </button>
          )}
          {tools.includes('rectangle') && (
            <button
              id="btn-wb-rect"
              type="button"
              onClick={() => setCurrentTool('rectangle')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                currentTool === 'rectangle' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
              title="Rectangle"
              aria-label="Select Rectangle"
            >
              <Square className="h-4 w-4 text-white" />
            </button>
          )}
          {tools.includes('circle') && (
            <button
              id="btn-wb-circle"
              type="button"
              onClick={() => setCurrentTool('circle')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                currentTool === 'circle' ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
              title="Circle"
              aria-label="Select Circle"
            >
              <Circle className="h-4 w-4 text-white" />
            </button>
          )}
        </div>

        <input
          id="input-wb-color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-800 bg-transparent"
          disabled={currentTool === 'eraser'}
          aria-label="Select Color"
        />

        <input
          id="input-wb-width"
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseInt(e.target.value, 10))}
          className="w-20 accent-blue-500 cursor-pointer"
          disabled={currentTool === 'eraser'}
          aria-label="Stroke Width"
        />

        <div className="flex gap-1 ml-auto">
          <button
            id="btn-wb-undo"
            type="button"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
            title="Undo"
            aria-label="Undo action"
          >
            <Undo className="h-4 w-4 text-white" />
          </button>
          <button
            id="btn-wb-redo"
            type="button"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
            title="Redo"
            aria-label="Redo action"
          >
            <Redo className="h-4 w-4 text-white" />
          </button>
          <button
            id="btn-wb-clear"
            type="button"
            onClick={clearCanvas}
            className="p-2 rounded-lg hover:bg-rose-600/20 transition-all cursor-pointer"
            title="Clear"
            aria-label="Clear Canvas"
          >
            <Trash2 className="h-4 w-4 text-rose-400" />
          </button>
          <button
            id="btn-wb-download"
            type="button"
            onClick={downloadCanvas}
            className="p-2 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
            title="Download"
            aria-label="Download Drawing"
          >
            <Download className="h-4 w-4 text-white" />
          </button>
          {isShared && (
            <button
              id="btn-wb-share"
              type="button"
              onClick={handleShare}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all cursor-pointer"
              title="Share to consultation"
              aria-label="Share Whiteboard"
            >
              <div className="flex items-center gap-1 text-xs font-bold text-white">
                <span>Share</span>
                {isSharing && <span>✓</span>}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Tooltip */}
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>Draw clinical diagrams and anatomic notes on the interactive canvas</span>
        <span className="font-mono">
          {currentTool} • {strokeWidth}px
        </span>
      </div>
    </div>
  );
};
