// ============================================
// CORE DENTAL DATA TYPES
// ============================================

export type ToothStatus = 
  | 'Healthy'
  | 'Caries'
  | 'Restored'
  | 'Impacted'
  | 'Missing'
  | 'Crown'
  | 'Bridge'
  | 'Implant'
  | 'RootCanal'
  | 'Fractured'
  | 'Discolored'
  | 'Wear';

export type ToothSurface = 
  | 'occlusal'
  | 'mesial'
  | 'distal'
  | 'buccal'
  | 'lingual'
  | 'cervical';

export type SurfaceCondition = 
  | 'Healthy'
  | 'Caries'
  | 'Fractured'
  | 'Worn'
  | 'Restored'
  | 'Discolored'
  | 'Cracked'
  | 'Missing';

export interface SurfaceState {
  surface: ToothSurface;
  condition: SurfaceCondition;
  notes?: string;
}

export interface Tooth {
  id: string;
  patientId: string;
  toothNumber: number; // Universal numbering 1-32
  status: ToothStatus;
  surfaces: Record<ToothSurface, SurfaceState>;
  condition: string;
  notes?: string;
  restoration?: {
    type: string;
    material: string;
    date: string;
    notes?: string;
  };
  xrayRefs: string[];
  treatmentRefs: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface ToothHistory {
  id: string;
  toothId: string;
  patientId: string;
  toothNumber: number;
  previousState: Partial<Tooth>;
  newState: Partial<Tooth>;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'surface_change';
  performedBy: string;
  performedAt: string;
  notes?: string;
}

// ============================================
// TOOTH NUMBERING HELPERS
// ============================================

export const UNIVERSAL_TOOTH_MAP: Record<number, string> = {
  1: 'UR8', 2: 'UR7', 3: 'UR6', 4: 'UR5', 5: 'UR4', 6: 'UR3', 7: 'UR2', 8: 'UR1',
  9: 'UL1', 10: 'UL2', 11: 'UL3', 12: 'UL4', 13: 'UL5', 14: 'UL6', 15: 'UL7', 16: 'UL8',
  17: 'LL8', 18: 'LL7', 19: 'LL6', 20: 'LL5', 21: 'LL4', 22: 'LL3', 23: 'LL2', 24: 'LL1',
  25: 'LR1', 26: 'LR2', 27: 'LR3', 28: 'LR4', 29: 'LR5', 30: 'LR6', 31: 'LR7', 32: 'LR8'
};

export const FDI_TOOTH_MAP: Record<number, string> = {
  1: '18', 2: '17', 3: '16', 4: '15', 5: '14', 6: '13', 7: '12', 8: '11',
  9: '21', 10: '22', 11: '23', 12: '24', 13: '25', 14: '26', 15: '27', 16: '28',
  17: '38', 18: '37', 19: '36', 20: '35', 21: '34', 22: '33', 23: '32', 24: '31',
  25: '41', 26: '42', 27: '43', 28: '44', 29: '45', 30: '46', 31: '47', 32: '48'
};

export const SURFACE_LABELS: Record<ToothSurface, { short: string; long: string }> = {
  occlusal: { short: 'O', long: 'Occlusal' },
  mesial: { short: 'M', long: 'Mesial' },
  distal: { short: 'D', long: 'Distal' },
  buccal: { short: 'B', long: 'Buccal' },
  lingual: { short: 'L', long: 'Lingual' },
  cervical: { short: 'C', long: 'Cervical' }
};

// ============================================
// TOOTH CREATION
// ============================================

export const createDefaultTooth = (toothNumber: number, patientId: string): Tooth => {
  const now = new Date().toISOString();
  const defaultSurface: SurfaceState = {
    surface: 'occlusal',
    condition: 'Healthy',
    notes: ''
  };
  
  return {
    id: `tooth-${toothNumber}-${Date.now()}`,
    patientId,
    toothNumber,
    status: 'Healthy',
    surfaces: {
      occlusal: { ...defaultSurface, surface: 'occlusal' },
      mesial: { ...defaultSurface, surface: 'mesial' },
      distal: { ...defaultSurface, surface: 'distal' },
      buccal: { ...defaultSurface, surface: 'buccal' },
      lingual: { ...defaultSurface, surface: 'lingual' },
      cervical: { ...defaultSurface, surface: 'cervical' }
    },
    condition: 'Normal',
    xrayRefs: [],
    treatmentRefs: [],
    createdAt: now,
    updatedAt: now,
    createdBy: 'system',
    updatedBy: 'system',
    version: 1
  };
};

export const createDefaultTeeth = (patientId: string): Tooth[] => {
  return Array.from({ length: 32 }, (_, i) => createDefaultTooth(i + 1, patientId));
};
