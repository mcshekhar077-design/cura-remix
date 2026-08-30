import React from 'react';
import { Tooth, ToothSurface, SurfaceCondition } from '../../../../lib/dental/types';

interface SvgToothProps {
  tooth: Tooth;
  selected: boolean;
  onSelect: (toothNumber: number) => void;
  onSurfaceClick?: (toothNumber: number, surface: ToothSurface) => void;
  isMaxillary: boolean;
}

// Tooth morphology category
type ToothMorphology = 'incisor' | 'canine' | 'premolar' | 'molar';

const getToothMorphology = (num: number): ToothMorphology => {
  // Incisors: 7, 8, 9, 10 (upper) & 23, 24, 25, 26 (lower)
  if ([7, 8, 9, 10, 23, 24, 25, 26].includes(num)) return 'incisor';
  // Canines: 6, 11 (upper) & 22, 27 (lower)
  if ([6, 11, 22, 27].includes(num)) return 'canine';
  // Premolars: 4, 5, 12, 13 (upper) & 20, 21, 28, 29 (lower)
  if ([4, 5, 12, 13, 20, 21, 28, 29].includes(num)) return 'premolar';
  // Molars: 1, 2, 3, 14, 15, 16 (upper) & 17, 18, 19, 30, 31, 32 (lower)
  return 'molar';
};

const getConditionFill = (condition?: SurfaceCondition): string => {
  switch (condition) {
    case 'Caries':
      return '#f43f5e'; // rose-500
    case 'Restored':
      return '#38bdf8'; // sky-400
    case 'Fractured':
      return '#fb923c'; // orange-400
    case 'Worn':
      return '#fbbf24'; // amber-400
    case 'Cracked':
      return '#e879f9'; // fuchsia-400
    case 'Discolored':
      return '#a855f7'; // purple-500
    case 'Missing':
      return '#475569'; // slate-600
    default:
      return '#1e293b'; // slate-800 normal
  }
};

export const SvgTooth: React.FC<SvgToothProps> = ({
  tooth,
  selected,
  onSelect,
  onSurfaceClick,
  isMaxillary
}) => {
  const morphology = getToothMorphology(tooth.toothNumber);
  const isMissing = tooth.status === 'Missing';
  const isCrown = tooth.status === 'Crown';
  const isImplant = tooth.status === 'Implant';
  const isRootCanal = tooth.status === 'RootCanal';
  const isImpacted = tooth.status === 'Impacted';

  const handleSurface = (e: React.MouseEvent, surface: ToothSurface) => {
    e.stopPropagation();
    if (onSurfaceClick) {
      onSurfaceClick(tooth.toothNumber, surface);
    }
  };

  const getSurfaceFill = (surface: ToothSurface) => {
    const s = tooth.surfaces[surface];
    return getConditionFill(s?.condition);
  };

  return (
    <div
      onClick={() => onSelect(tooth.toothNumber)}
      className={`
        relative flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all cursor-pointer select-none group
        ${selected
          ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20 scale-105 z-20'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
        }
        ${isMissing ? 'opacity-40 grayscale' : ''}
      `}
      title={`Tooth #${tooth.toothNumber} (${morphology.toUpperCase()}) - ${tooth.status}: ${tooth.condition}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(tooth.toothNumber);
        }
      }}
      aria-label={`Tooth ${tooth.toothNumber}, status ${tooth.status}`}
    >
      {/* Tooth ID Label */}
      <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono font-bold">
        <span className={selected ? 'text-cyan-300' : 'text-slate-300'}>{tooth.toothNumber}</span>
        <span className={`text-[8px] px-1 rounded ${
          tooth.status === 'Healthy' ? 'text-emerald-400 bg-emerald-500/10' :
          tooth.status === 'Caries' ? 'text-rose-400 bg-rose-500/10 animate-pulse' :
          tooth.status === 'Crown' ? 'text-cyan-400 bg-cyan-500/10' :
          tooth.status === 'Restored' ? 'text-amber-400 bg-amber-500/10' :
          tooth.status === 'Impacted' ? 'text-purple-400 bg-purple-500/10' :
          'text-slate-400 bg-slate-800'
        }`}>
          {tooth.status.slice(0, 3)}
        </span>
      </div>

      {/* SVG Anatomical Graphic with Interactive Surfaces */}
      <div className="my-1 w-full aspect-[3/4] max-h-[85px] relative flex items-center justify-center">
        <svg
          viewBox="0 0 100 130"
          className={`w-full h-full drop-shadow ${isImpacted ? 'rotate-12 transition-transform' : ''}`}
        >
          <defs>
            <linearGradient id={`enamelGrad-${tooth.toothNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isCrown ? '#38bdf8' : '#f8fafc'} />
              <stop offset="100%" stopColor={isCrown ? '#0284c7' : '#cbd5e1'} />
            </linearGradient>
            <linearGradient id={`rootGrad-${tooth.toothNumber}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isImplant ? '#0d9488' : '#94a3b8'} />
              <stop offset="100%" stopColor={isImplant ? '#115e59' : '#64748b'} />
            </linearGradient>
          </defs>

          {/* Root Rendering (Anatomically oriented based on Maxillary vs Mandibular) */}
          {isMaxillary ? (
            // Upper Root (points UP)
            <g className="roots">
              {morphology === 'molar' ? (
                // 3 Roots for upper molar
                <path
                  d="M25 45 C20 20 25 5 35 5 C38 5 40 25 45 45 C50 20 55 5 65 5 C75 5 78 20 75 45 Z"
                  fill={`url(#rootGrad-${tooth.toothNumber})`}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              ) : morphology === 'premolar' ? (
                // Bifurcated/dual root
                <path
                  d="M32 45 C28 20 32 8 42 8 C46 8 48 25 50 45 C52 25 54 8 58 8 C68 8 72 20 68 45 Z"
                  fill={`url(#rootGrad-${tooth.toothNumber})`}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              ) : (
                // Single substantial root for incisors & canines
                <path
                  d="M34 45 C32 20 40 4 50 4 C60 4 68 20 66 45 Z"
                  fill={`url(#rootGrad-${tooth.toothNumber})`}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              )}
            </g>
          ) : (
            // Lower Root (points DOWN)
            <g className="roots">
              {morphology === 'molar' ? (
                // 2 Large Roots for lower molar
                <path
                  d="M25 85 C20 110 28 126 38 126 C45 126 48 105 50 85 C52 105 55 126 62 126 C72 126 80 110 75 85 Z"
                  fill={`url(#rootGrad-${tooth.toothNumber})`}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              ) : (
                // Single root for lower anterior & premolars
                <path
                  d="M34 85 C32 110 42 126 50 126 C58 126 68 110 66 85 Z"
                  fill={`url(#rootGrad-${tooth.toothNumber})`}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              )}
            </g>
          )}

          {/* Root Canal Obturation line if endodontically treated */}
          {isRootCanal && (
            <path
              d={isMaxillary ? "M50 8 L50 45" : "M50 85 L50 122"}
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="2,2"
            />
          )}

          {/* Implant Thread Indicators */}
          {isImplant && (
            <g stroke="#2dd4bf" strokeWidth="1.5">
              {isMaxillary ? (
                <>
                  <line x1="38" y1="18" x2="62" y2="18" />
                  <line x1="40" y1="26" x2="60" y2="26" />
                  <line x1="42" y1="34" x2="58" y2="34" />
                </>
              ) : (
                <>
                  <line x1="42" y1="96" x2="58" y2="96" />
                  <line x1="40" y1="104" x2="60" y2="104" />
                  <line x1="38" y1="112" x2="62" y2="112" />
                </>
              )}
            </g>
          )}

          {/* CROWN & 5-PART GEOMETRIC SURFACE CHART (Standard FDI Odontogram Diagram) */}
          <g transform="translate(10, 35)">
            {/* Outer Crown Base */}
            <rect
              x="5"
              y="5"
              width="70"
              height="70"
              rx="12"
              fill={isCrown ? '#0284c7' : '#0f172a'}
              stroke={selected ? '#22d3ee' : '#334155'}
              strokeWidth="2"
            />

            {/* TOP SURFACE: Buccal (Upper) / Lingual (Lower) */}
            <path
              d="M5 5 L75 5 L60 20 L20 20 Z"
              fill={getSurfaceFill(isMaxillary ? 'buccal' : 'lingual')}
              stroke="#475569"
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => handleSurface(e, isMaxillary ? 'buccal' : 'lingual')}
            />

            {/* LEFT SURFACE: Mesial */}
            <path
              d="M5 5 L20 20 L20 60 L5 75 Z"
              fill={getSurfaceFill('mesial')}
              stroke="#475569"
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => handleSurface(e, 'mesial')}
            />

            {/* RIGHT SURFACE: Distal */}
            <path
              d="M75 5 L75 75 L60 60 L60 20 Z"
              fill={getSurfaceFill('distal')}
              stroke="#475569"
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => handleSurface(e, 'distal')}
            />

            {/* BOTTOM SURFACE: Lingual (Upper) / Buccal (Lower) */}
            <path
              d="M20 60 L60 60 L75 75 L5 75 Z"
              fill={getSurfaceFill(isMaxillary ? 'lingual' : 'buccal')}
              stroke="#475569"
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => handleSurface(e, isMaxillary ? 'lingual' : 'buccal')}
            />

            {/* CENTER SURFACE: Occlusal / Incisal */}
            <rect
              x="20"
              y="20"
              width="40"
              height="40"
              rx="4"
              fill={getSurfaceFill('occlusal')}
              stroke="#64748b"
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => handleSurface(e, 'occlusal')}
            />
          </g>

          {/* Missing Tooth Extraction Cross */}
          {isMissing && (
            <g stroke="#ef4444" strokeWidth="4" strokeLinecap="round">
              <line x1="15" y1="20" x2="85" y2="110" />
              <line x1="85" y1="20" x2="15" y2="110" />
            </g>
          )}
        </svg>
      </div>

      {/* Surface Quick Dot Indicators */}
      <div className="flex items-center gap-0.5 mt-0.5">
        {(['occlusal', 'mesial', 'distal', 'buccal', 'lingual'] as const).map(surf => {
          const cond = tooth.surfaces[surf]?.condition;
          if (cond === 'Healthy') return null;
          return (
            <span
              key={surf}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: getConditionFill(cond) }}
              title={`${surf}: ${cond}`}
            />
          );
        })}
      </div>
    </div>
  );
};
