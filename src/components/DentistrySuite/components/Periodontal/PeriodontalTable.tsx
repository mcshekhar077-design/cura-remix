import React from 'react';
import { PeriodontalChart, ProbingDepth6Point, MobilityGrade, FurcationGrade } from '../../../../lib/dental/types';

interface PeriodontalTableProps {
  data: PeriodontalChart[];
  onUpdateProbing: (toothNumber: number, site: keyof ProbingDepth6Point, value: number) => void;
  onToggleBop: (toothNumber: number, site: keyof ProbingDepth6Point) => void;
  onUpdateMobility: (toothNumber: number, grade: MobilityGrade) => void;
  onUpdateFurcation: (toothNumber: number, grade: FurcationGrade) => void;
  onTogglePlaque: (toothNumber: number) => void;
  onToggleCalculus: (toothNumber: number) => void;
}

export const PeriodontalTable: React.FC<PeriodontalTableProps> = ({
  data,
  onUpdateProbing,
  onToggleBop,
  onUpdateMobility,
  onUpdateFurcation,
  onTogglePlaque,
  onToggleCalculus
}) => {
  const getDepthColor = (depth: number): string => {
    if (depth <= 3) return 'text-emerald-400 bg-emerald-950/20 border-emerald-800/40';
    if (depth <= 5) return 'text-amber-400 bg-amber-950/30 border-amber-700/60 font-bold';
    return 'text-rose-400 bg-rose-950/50 border-rose-600 font-black animate-pulse';
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
        <table className="w-full text-xs text-left border-collapse" role="table">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-3">Tooth</th>
              <th className="py-3 px-2 text-center text-cyan-300" colSpan={3}>
                Facial / Buccal Probing (MB • B • DB)
              </th>
              <th className="py-3 px-2 text-center text-sky-300" colSpan={3}>
                Lingual / Palatal Probing (ML • L • DL)
              </th>
              <th className="py-3 px-2 text-center">Mobility</th>
              <th className="py-3 px-2 text-center">Furcation</th>
              <th className="py-3 px-2 text-center">BOP (Bleed)</th>
              <th className="py-3 px-2 text-center">Plaque</th>
              <th className="py-3 px-2 text-center">Calculus</th>
            </tr>
            <tr className="bg-slate-900/50 border-b border-slate-800 text-[9px] text-slate-400 font-mono">
              <th className="py-1 px-3">#</th>
              <th className="py-1 px-1 text-center">MB (mm)</th>
              <th className="py-1 px-1 text-center">B (mm)</th>
              <th className="py-1 px-1 text-center">DB (mm)</th>
              <th className="py-1 px-1 text-center">ML (mm)</th>
              <th className="py-1 px-1 text-center">L (mm)</th>
              <th className="py-1 px-1 text-center">DL (mm)</th>
              <th className="py-1 px-1 text-center">Gr. 0-III</th>
              <th className="py-1 px-1 text-center">Class I-III</th>
              <th className="py-1 px-1 text-center">6-Site</th>
              <th className="py-1 px-1 text-center">Index</th>
              <th className="py-1 px-1 text-center">Sub/Supra</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {data.map((row) => {
              const bopCount = Object.values(row.bleedingOnProbing).filter(Boolean).length;
              const maxPocket = Math.max(
                row.probingDepth.mesioBuccal,
                row.probingDepth.midBuccal,
                row.probingDepth.distoBuccal,
                row.probingDepth.mesioLingual,
                row.probingDepth.midLingual,
                row.probingDepth.distoLingual
              );

              return (
                <tr
                  key={row.toothNumber}
                  className={`hover:bg-slate-900/70 transition-colors ${
                    maxPocket >= 6 ? 'bg-rose-950/20' : maxPocket >= 4 ? 'bg-amber-950/10' : ''
                  }`}
                >
                  {/* Tooth Number */}
                  <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                    #{row.toothNumber}
                  </td>

                  {/* 3 Buccal Probing Depth Inputs */}
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      value={row.probingDepth.mesioBuccal}
                      onChange={(e) => onUpdateProbing(row.toothNumber, 'mesioBuccal', parseFloat(e.target.value) || 0)}
                      className={`w-11 text-center font-mono text-xs py-1 rounded border ${getDepthColor(row.probingDepth.mesioBuccal)}`}
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      value={row.probingDepth.midBuccal}
                      onChange={(e) => onUpdateProbing(row.toothNumber, 'midBuccal', parseFloat(e.target.value) || 0)}
                      className={`w-11 text-center font-mono text-xs py-1 rounded border ${getDepthColor(row.probingDepth.midBuccal)}`}
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      value={row.probingDepth.distoBuccal}
                      onChange={(e) => onUpdateProbing(row.toothNumber, 'distoBuccal', parseFloat(e.target.value) || 0)}
                      className={`w-11 text-center font-mono text-xs py-1 rounded border ${getDepthColor(row.probingDepth.distoBuccal)}`}
                    />
                  </td>

                  {/* 3 Lingual Probing Depth Inputs */}
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      value={row.probingDepth.mesioLingual}
                      onChange={(e) => onUpdateProbing(row.toothNumber, 'mesioLingual', parseFloat(e.target.value) || 0)}
                      className={`w-11 text-center font-mono text-xs py-1 rounded border ${getDepthColor(row.probingDepth.mesioLingual)}`}
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      value={row.probingDepth.midLingual}
                      onChange={(e) => onUpdateProbing(row.toothNumber, 'midLingual', parseFloat(e.target.value) || 0)}
                      className={`w-11 text-center font-mono text-xs py-1 rounded border ${getDepthColor(row.probingDepth.midLingual)}`}
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      value={row.probingDepth.distoLingual}
                      onChange={(e) => onUpdateProbing(row.toothNumber, 'distoLingual', parseFloat(e.target.value) || 0)}
                      className={`w-11 text-center font-mono text-xs py-1 rounded border ${getDepthColor(row.probingDepth.distoLingual)}`}
                    />
                  </td>

                  {/* Mobility Dropdown */}
                  <td className="p-1 text-center">
                    <select
                      value={row.mobility}
                      onChange={(e) => onUpdateMobility(row.toothNumber, e.target.value as MobilityGrade)}
                      className={`bg-slate-900 text-[11px] rounded px-1.5 py-1 border ${
                        row.mobility !== 'normal' ? 'border-amber-500 text-amber-300 font-bold' : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      <option value="normal">0 (Normal)</option>
                      <option value="grade1">I (&lt;1mm)</option>
                      <option value="grade2">II (1-2mm)</option>
                      <option value="grade3">III (&gt;2mm/Vert)</option>
                    </select>
                  </td>

                  {/* Furcation Involvement */}
                  <td className="p-1 text-center">
                    <select
                      value={row.furcation}
                      onChange={(e) => onUpdateFurcation(row.toothNumber, e.target.value as FurcationGrade)}
                      className={`bg-slate-900 text-[11px] rounded px-1.5 py-1 border ${
                        row.furcation !== 'none' ? 'border-purple-500 text-purple-300 font-bold' : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      <option value="none">-</option>
                      <option value="grade1">Class I</option>
                      <option value="grade2">Class II</option>
                      <option value="grade3">Class III</option>
                    </select>
                  </td>

                  {/* BOP Toggle (6-site popup or quick toggle) */}
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleBop(row.toothNumber, 'mesioBuccal')}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        bopCount > 0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                      title={`${bopCount}/6 bleeding sites recorded`}
                    >
                      {bopCount > 0 ? `🔴 ${bopCount}/6` : '⚪ 0/6'}
                    </button>
                  </td>

                  {/* Plaque Toggle */}
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => onTogglePlaque(row.toothNumber)}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        row.plaque
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {row.plaque ? '⚠️ Plaque' : 'Clean'}
                    </button>
                  </td>

                  {/* Calculus Toggle */}
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleCalculus(row.toothNumber)}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        row.calculus
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {row.calculus ? '🪨 Calc' : 'None'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Clinical Reference Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> 1-3mm Normal sulcus</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> 4-5mm Moderate pocket (Gingivitis/Periodontitis)</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> ≥6mm Severe periodontal pocket</span>
        </div>
        <div className="text-[10px] font-mono text-cyan-400">
          AAP/EFP 2018 Staging & Grading Standard
        </div>
      </div>
    </div>
  );
};
