import React, { useState } from 'react';
import { Tooth, ToothSurface } from '../../../../lib/dental/types';
import { getToothStatusColor, SURFACE_LABELS } from '../../utils/toothMapping';
import { ToothSurfaceComponent } from './ToothSurface';

interface ToothProps {
  tooth: Tooth;
  selected: boolean;
  onSelect: (toothNumber: number) => void;
  onToggleSurface: (toothNumber: number, surface: ToothSurface) => void;
}

export const ToothComponent: React.FC<ToothProps> = ({
  tooth,
  selected,
  onSelect,
  onToggleSurface
}) => {
  const [showSurfaces, setShowSurfaces] = useState(false);

  const getStatusShort = () => {
    if (tooth.status === 'Healthy') return 'OK';
    if (tooth.status === 'Caries') return 'C';
    if (tooth.status === 'Impacted') return 'I';
    if (tooth.status === 'Restored') return 'R';
    if (tooth.status === 'Missing') return 'M';
    return tooth.status.slice(0, 2);
  };

  const hasActiveSurfaces = Object.values(tooth.surfaces).some(
    (s) => Boolean(s && (s as { condition: string }).condition !== 'Healthy')
  );

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => onSelect(tooth.toothNumber)}
        className={`
          p-2 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer min-w-[36px] min-h-[40px]
          ${selected
            ? "ring-2 ring-cyan-400 bg-cyan-950/80 border-cyan-400 scale-105 shadow-lg shadow-cyan-500/20"
            : getToothStatusColor(tooth.status)
          }
          ${hasActiveSurfaces ? 'shadow-[inset_0_0_8px_rgba(239,68,68,0.3)]' : ''}
        `}
        aria-label={`Tooth ${tooth.toothNumber}: ${tooth.status}`}
        title={`Tooth #${tooth.toothNumber} - ${tooth.status}: ${tooth.condition}`}
        onMouseEnter={() => setShowSurfaces(true)}
        onMouseLeave={() => setShowSurfaces(false)}
      >
        <span className="text-[10px] font-black">{tooth.toothNumber}</span>
        <span className={`text-[8px] font-mono ${selected ? 'text-cyan-300' : 'opacity-80'}`}>
          {getStatusShort()}
        </span>
        {hasActiveSurfaces && (
          <span className="text-[6px] text-rose-400 font-bold mt-0.5 animate-pulse">●</span>
        )}
      </button>

      {/* Surface popover on hover */}
      {showSurfaces && selected && (
        <div className="absolute z-10 top-full left-1/2 -translate-x-1/2 mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl min-w-[160px] animate-fade-in">
          <div className="grid grid-cols-3 gap-1">
            {Object.keys(SURFACE_LABELS).map((surfaceKey) => {
              const surface = surfaceKey as ToothSurface;
              return (
                <ToothSurfaceComponent
                  key={surface}
                  tooth={tooth}
                  surface={surface}
                  onToggle={onToggleSurface}
                />
              );
            })}
          </div>
          <div className="text-[8px] text-slate-500 text-center mt-1">
            Click surface to toggle
          </div>
        </div>
      )}
    </div>
  );
};
