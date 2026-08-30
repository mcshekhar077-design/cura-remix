export * from './tooth';

export type DentistryTab = 'odontogram' | 'radiograph' | 'periodontal' | 'treatment';
export type NumberingSystem = 'universal' | 'fdi' | 'palmer';

export type MobilityGrade = 'normal' | 'grade1' | 'grade2' | 'grade3';
export type FurcationGrade = 'none' | 'grade1' | 'grade2' | 'grade3';
export type TreatmentPriority = 'high' | 'medium' | 'low';
export type TreatmentStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type PlanStatus = 'draft' | 'in_progress' | 'approved' | 'completed';

export type RadiographType = 'bitewing' | 'panoramic' | 'periapical' | 'cephalometric' | 'CBCT';
export type AIStatus = 'idle' | 'processing' | 'completed' | 'error' | 'review_required';

// 6-Point Probing Depth (standard clinical periodontal probe measurements)
export interface ProbingDepth6Point {
  mesioBuccal: number;
  midBuccal: number;
  distoBuccal: number;
  mesioLingual: number;
  midLingual: number;
  distoLingual: number;
}

export interface GingivalMargin6Point {
  mesioBuccal: number;
  midBuccal: number;
  distoBuccal: number;
  mesioLingual: number;
  midLingual: number;
  distoLingual: number;
}

export interface PeriodontalChart {
  id: string;
  patientId: string;
  toothNumber: number;
  probingDepth: ProbingDepth6Point;
  gingivalMargin: GingivalMargin6Point;
  clinicalAttachmentLoss?: number;
  mobility: MobilityGrade;
  furcation: FurcationGrade;
  bleedingOnProbing: {
    mesioBuccal: boolean;
    midBuccal: boolean;
    distoBuccal: boolean;
    mesioLingual: boolean;
    midLingual: boolean;
    distoLingual: boolean;
  };
  suppuration: {
    buccal: boolean;
    lingual: boolean;
  };
  plaque: boolean;
  calculus: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PeriodontalHistory {
  id: string;
  patientId: string;
  toothNumber: number;
  chartId: string;
  previousState: Partial<PeriodontalChart>;
  newState: Partial<PeriodontalChart>;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

export interface RadiographFinding {
  id: string;
  toothNumber?: number;
  description: string;
  location: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  accepted: boolean;
  clinicalNote?: string;
}

export interface Radiograph {
  id: string;
  patientId: string;
  name: string;
  date: string;
  type: RadiographType;
  imageUrl: string;
  findings: RadiographFinding[];
  aiStatus: AIStatus;
  aiAnalysis?: string;
  aiProcessingStarted?: string;
  aiProcessingCompleted?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  metadata: {
    modality: string;
    acquisitionDate: string;
    studyId: string;
    seriesId: string;
    institution: string;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TreatmentPlanItem {
  id: string;
  toothNumber: number;
  procedure: string;
  code: string; // CDT Code (e.g. D2391, D3330)
  description: string;
  cost: number;
  priority: TreatmentPriority;
  status: TreatmentStatus;
  duration: number; // minutes
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

export interface TreatmentAuditEntry {
  id: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'approve' | 'complete' | 'cancel';
  itemId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  performedBy: string;
  performedAt: string;
  notes?: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  date: string;
  items: TreatmentPlanItem[];
  totalCost: number;
  estimatedDuration: number;
  status: PlanStatus;
  notes?: string;
  version: number;
  createdBy?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedAt?: string;
  auditLog: TreatmentAuditEntry[];
}

export interface PriceListEntry {
  id: string;
  code: string;
  procedure: string;
  category: string;
  basePrice: number;
  gstPercent: number;
  discountPercent: number;
  finalPrice: number;
  clinicId: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

export const CLINICAL_DISCLAIMER = `
⚠️ CLINICAL DECISION SUPPORT TOOL
This system provides AI-assisted analysis for dental diagnostics.
All findings, treatment plans, and recommendations must be reviewed,
verified, and approved by a licensed dentist before implementation.
This tool does not replace professional clinical judgment.
`;

