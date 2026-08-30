import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  SunMedium, 
  Contrast, 
  Maximize2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  AlertCircle
} from 'lucide-react';
import { Radiograph, RadiographFinding } from '../../../../lib/dental/types';

interface RadiographViewerProps {
  radiograph: Radiograph;
  onAcceptFinding?: (radiographId: string, findingId: string) => void;
  onRejectFinding?: (radiographId: string, findingId: string) => void;
  onDelete?: (id: string) => void;
}

export const RadiographViewer: React.FC<RadiographViewerProps> = ({
  radiograph,
  onAcceptFinding,
  onRejectFinding,
  onDelete
}) => {
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col space-y-3 p-4 shadow-xl">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-white">{radiograph.name}</h4>
            <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded">
              {radiograph.type}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Study ID: {radiograph.metadata.studyId} • Acquired: {radiograph.date} • {radiograph.metadata.institution}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(radiograph.id)}
              className="text-xs text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Remove Scan"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* DICOM Radiographic Viewport with Hardware-Accelerated Filters */}
      <div className="relative bg-black rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center border border-slate-800 select-none">
        {radiograph.imageUrl ? (
          <div
            className="w-full h-full flex items-center justify-center p-2 transition-transform duration-150 ease-out"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={radiograph.imageUrl}
              alt={radiograph.name}
              className="max-h-[380px] w-auto object-contain rounded"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`
              }}
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="text-slate-600 text-center py-12">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No radiograph image loaded</p>
          </div>
        )}

        {/* Viewport Overlay Controls (DICOM Windowing Toolbar) */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-2 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3">
            {/* Brightness */}
            <div className="flex items-center gap-1.5" title="Window Level (Brightness)">
              <SunMedium className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="range"
                min="50"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-16 accent-cyan-500 h-1"
              />
            </div>

            {/* Contrast */}
            <div className="flex items-center gap-1.5" title="Window Width (Contrast)">
              <Contrast className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="range"
                min="50"
                max="250"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-16 accent-cyan-500 h-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsInverted(!isInverted)}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                isInverted ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title="Invert Grayscale (Negative/Positive)"
            >
              Invert
            </button>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(2.5, z + 0.25))}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded border border-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.75, z - 0.25))}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded border border-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded border border-slate-800"
              title="Rotate 90°"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-900 rounded border border-slate-800"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* AI Automated Diagnostic Findings & Clinician Verification Flow */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Detected Pathologies & Clinician Review</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {radiograph.findings.filter(f => f.reviewed).length} / {radiograph.findings.length} Reviewed
          </span>
        </div>

        {radiograph.aiAnalysis && (
          <p className="text-xs text-slate-300 bg-cyan-950/30 border border-cyan-900/40 p-2.5 rounded-xl leading-relaxed">
            {radiograph.aiAnalysis}
          </p>
        )}

        <div className="space-y-2">
          {radiograph.findings.map((f: RadiographFinding) => (
            <div
              key={f.id}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
                f.reviewed
                  ? f.accepted
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{f.location}:</span>
                  <span>{f.description}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                    {Math.round(f.confidence * 100)}% Confidence
                  </span>
                </div>
                {f.clinicalNote && (
                  <p className="text-[11px] text-slate-400 italic">Note: {f.clinicalNote}</p>
                )}
              </div>

              {/* Clinician Accept / Reject Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onAcceptFinding && onAcceptFinding(radiograph.id, f.id)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    f.reviewed && f.accepted
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 text-slate-400 hover:text-emerald-300 border-slate-800 hover:border-emerald-700'
                  }`}
                  title="Accept and add to diagnosis"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[10px] font-bold">Accept</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRejectFinding && onRejectFinding(radiograph.id, f.id)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    f.reviewed && !f.accepted
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-slate-900 text-slate-400 hover:text-rose-400 border-slate-800 hover:border-rose-800'
                  }`}
                  title="Reject AI proposal"
                >
                  <XCircle className="h-4 w-4" />
                  <span className="text-[10px]">Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
