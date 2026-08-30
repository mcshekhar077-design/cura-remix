import React, { useState } from 'react';
import { Tooth, ToothSurface, NumberingSystem, FDI_TOOTH_MAP, UNIVERSAL_TOOTH_MAP } from '../../../../lib/dental/types';
import { SvgTooth } from './SvgTooth';

interface OdontogramProps {
  teeth: Tooth[];
  selectedTooth: number | null;
  onSelectTooth: (toothNumber: number) => void;
  onSurfaceClick: (toothNumber: number, surface: ToothSurface) => void;
}

export const Odontogram: React.FC<OdontogramProps> = ({
  teeth,
  selectedTooth,
  onSelectTooth,
  onSurfaceClick
}) => {
  const [numberingSystem, setNumberingSystem] = useState<NumberingSystem>('universal');

  // Compute DMFT statistics
  const decayed = teeth.filter(t => t.status === 'Caries' || Object.values(t.surfaces).some(s => s && (s as { condition: string }).condition === 'Caries')).length;
  const missing = teeth.filter(t => t.status === 'Missing').length;
  const filled = teeth.filter(t => t.status === 'Restored' || t.status === 'Crown').length;
  const dmft = decayed + missing + filled;

  const getToothLabel = (num: number): string => {
    if (numberingSystem === 'fdi') return FDI_TOOTH_MAP[num] || String(num);
    if (numberingSystem === 'palmer') return UNIVERSAL_TOOTH_MAP[num] || String(num);
    return `#${num}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Toolbar with System Switcher and Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span>Clinical 32-Tooth Odontogram</span>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              Anatomical SVG Mapping
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any tooth or direct geometric surface to inspect condition and plan treatment
          </p>
        </div>

        {/* Numbering System Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['universal', 'fdi', 'palmer'] as const).map(sys => (
            <button
              key={sys}
              type="button"
              onClick={() => setNumberingSystem(sys)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                numberingSystem === sys
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sys}
            </button>
          ))}
        </div>
      </div>

      {/* Surface & Condition Color Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mr-1">Legend:</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-800 border border-slate-600"></span> Healthy</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Caries (D1-D4)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-400"></span> Restored</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-500"></span> Crown</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span> Impacted</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span> Implant</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-600"></span> Missing / Extracted</span>
      </div>

      {/* MAXILLARY ARCH (Upper Teeth: 1 to 16) */}
      <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between pb-1">
          <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider">
            Maxillary Arch (Upper Teeth 1–16) • Right Quadrant 1 → Left Quadrant 2
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Facial / Buccal (Top) • Roots Pointing Upward</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-1.5">
          {teeth.slice(0, 16).map(tooth => (
            <SvgTooth
              key={tooth.toothNumber}
              tooth={tooth}
              selected={selectedTooth === tooth.toothNumber}
              onSelect={onSelectTooth}
              onSurfaceClick={onSurfaceClick}
              isMaxillary={true}
            />
          ))}
        </div>
      </div>

      {/* MIDLINE DENTAL PLANE SEPARATOR */}
      <div className="relative py-2 flex items-center justify-center">
        <div className="w-full border-t border-dashed border-slate-800"></div>
        <span className="absolute bg-slate-900 px-4 py-1 rounded-full border border-slate-800 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">
          Occlusal Plane / Dentition Midline
        </span>
      </div>

      {/* MANDIBULAR ARCH (Lower Teeth: 17 to 32) */}
      <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between pb-1">
          <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider">
            Mandibular Arch (Lower Teeth 17–32) • Left Quadrant 3 → Right Quadrant 4
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Roots Pointing Downward • Lingual / Buccal</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-1.5">
          {teeth.slice(16, 32).map(tooth => (
            <SvgTooth
              key={tooth.toothNumber}
              tooth={tooth}
              selected={selectedTooth === tooth.toothNumber}
              onSelect={onSelectTooth}
              onSurfaceClick={onSurfaceClick}
              isMaxillary={false}
            />
          ))}
        </div>
      </div>

      {/* DMFT & EPIDEMIOLOGY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Decayed Teeth (D)</span>
          <span className="text-xl font-black text-rose-400">{decayed}</span>
          <span className="text-[9px] text-slate-500 block">Requires restorative work</span>
        </div>
        <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Missing Teeth (M)</span>
          <span className="text-xl font-black text-slate-400">{missing}</span>
          <span className="text-[9px] text-slate-500 block">Lost due to caries/perio</span>
        </div>
        <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Filled Teeth (F)</span>
          <span className="text-xl font-black text-sky-400">{filled}</span>
          <span className="text-[9px] text-slate-500 block">Amalgams, composites, crowns</span>
        </div>
        <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">WHO DMFT Score</span>
          <span className={`text-xl font-black ${
            dmft <= 3 ? 'text-emerald-400' :
            dmft <= 6 ? 'text-cyan-400' :
            dmft <= 9 ? 'text-amber-400' :
            'text-rose-400'
          }`}>
            {dmft} <span className="text-xs font-normal text-slate-400">/ 32</span>
          </span>
          <span className="text-[9px] text-slate-500 block">
            {dmft <= 3 ? 'Very Low Caries Risk' : dmft <= 6 ? 'Moderate Caries Risk' : 'High Caries Risk'}
          </span>
        </div>
      </div>
    </div>
  );
};
