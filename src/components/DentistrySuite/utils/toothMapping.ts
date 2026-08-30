import { ToothSurface, NumberingSystem, Tooth } from '../types';

// ============================================
// TOOTH NUMBERING SYSTEMS
// ============================================

export const getToothNumber = (
  toothNumber: number,
  system: NumberingSystem
): string => {
  switch (system) {
    case 'universal':
      return toothNumber.toString();
    case 'fdi': {
      // FDI: Quadrant + Tooth position
      const quadrant = Math.ceil(toothNumber / 8);
      const position = toothNumber % 8 || 8;
      return `${quadrant}${position}`;
    }
    case 'palmer': {
      // Palmer: Quadrant symbol + tooth number
      const quadrant = Math.ceil(toothNumber / 8);
      const position = toothNumber % 8 || 8;
      const symbols = ['┘', '└', '┐', '┌'];
      // Upper right: ┘, Upper left: └, Lower left: ┐, Lower right: ┌
      return `${position}${symbols[quadrant - 1]}`;
    }
    default:
      return toothNumber.toString();
  }
};

// ============================================
// SURFACE LABELS
// ============================================

export const SURFACE_LABELS: Record<ToothSurface, { short: string; long: string }> = {
  occlusal: { short: 'O', long: 'Occlusal' },
  mesial: { short: 'M', long: 'Mesial' },
  distal: { short: 'D', long: 'Distal' },
  buccal: { short: 'B', long: 'Buccal' },
  lingual: { short: 'L', long: 'Lingual' },
  cervical: { short: 'C', long: 'Cervical' }
};

// ============================================
// TOOTH STATUS COLORS
// ============================================

export const getToothStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Healthy: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    Caries: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
    Restored: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    Impacted: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    Missing: 'bg-slate-600/20 border-slate-600/30 text-slate-400 line-through',
    Crown: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    Bridge: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
    Implant: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
    RootCanal: 'bg-rose-500/30 border-rose-500/40 text-rose-400'
  };
  return colors[status] || 'bg-slate-800 border-slate-700 text-slate-300';
};

// ============================================
// TOOTH SURFACE STATUS
// ============================================

export const getSurfaceStatusColor = (surface: ToothSurface, active: boolean): string => {
  if (active) {
    const colors: Record<ToothSurface, string> = {
      occlusal: 'bg-rose-500/30 border-rose-500/50 text-rose-300',
      mesial: 'bg-orange-500/30 border-orange-500/50 text-orange-300',
      distal: 'bg-yellow-500/30 border-yellow-500/50 text-yellow-300',
      buccal: 'bg-blue-500/30 border-blue-500/50 text-blue-300',
      lingual: 'bg-purple-500/30 border-purple-500/50 text-purple-300',
      cervical: 'bg-pink-500/30 border-pink-500/50 text-pink-300'
    };
    return colors[surface];
  }
  return 'bg-slate-900 border-slate-800 text-slate-400';
};

// ============================================
// DMFT CALCULATION
// ============================================

export interface DMFTStats {
  decayed: number;
  missing: number;
  filled: number;
  total: number;
  dmft: number;
  impacted: number;
}

export const calculateDMFT = (teeth: Tooth[]): DMFTStats => {
  const decayed = teeth.filter(t => t.status === 'Caries').length;
  const missing = teeth.filter(t => t.status === 'Missing').length;
  const filled = teeth.filter(t => t.status === 'Restored' || t.status === 'Crown').length;
  const impacted = teeth.filter(t => t.status === 'Impacted').length;
  return {
    decayed,
    missing,
    filled,
    total: teeth.length,
    dmft: decayed + missing + filled,
    impacted
  };
};
