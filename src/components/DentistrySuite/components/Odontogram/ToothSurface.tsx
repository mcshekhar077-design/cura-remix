import React from 'react';
import { ToothSurface, Tooth, SurfaceCondition } from '../../../../lib/dental/types';
import { SURFACE_LABELS } from '../../utils/toothMapping';

interface ToothSurfaceProps {
  tooth: Tooth;
  surface: ToothSurface;
  onToggle: (toothNumber: number, surface: ToothSurface) => void;
}

export const ToothSurfaceComponent: React.FC<ToothSurfaceProps> = ({
  tooth,
  surface,
  onToggle
}) => {
  const surfState = tooth.surfaces[surface];
  const condition: SurfaceCondition = surfState?.condition || 'Healthy';
  const isActive = condition !== 'Healthy';
  const label = SURFACE_LABELS[surface];

  return (
    <button
      type="button"
      onClick={() => onToggle(tooth.toothNumber, surface)}
      className={`
        p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer
        ${isActive ? 'bg-rose-950 border-rose-500 text-rose-300 ring-1 ring-rose-500' : 'bg-slate-900 border-slate-800 text-slate-400'}
        hover:scale-105 active:scale-95
      `}
      aria-label={`${label.long} surface - ${condition}`}
      title={`${label.long} surface - ${condition} (Click to inspect)`}
    >
      <span className="block">{label.short}</span>
      {isActive && (
        <span className="block text-[8px] mt-0.5 text-rose-400">●</span>
      )}
    </button>
  );
};
