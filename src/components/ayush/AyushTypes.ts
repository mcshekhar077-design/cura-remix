export type AyushSystem = "Ayurveda" | "Unani" | "Siddha" | "Homeopathy" | "Yoga & Naturopathy";

export interface Practitioner {
  id: string;
  name: string;
  system: AyushSystem;
  experience: number;
  rating: number;
  reviewsCount: number;
  specialization: string[];
  channels: ("Online" | "In-Clinic")[];
  imageEmoji: string;
  location: string;
}

export interface WellnessCenter {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  reviewsCount: number;
  packages: string[];
  desc: string;
  imageEmoji: string;
}

export interface YogaCenter {
  id: string;
  name: string;
  style: string;
  location: string;
  rating: number;
  reviewsCount: number;
  description: string;
  sessions: string[];
  imageEmoji: string;
}

export interface Remedy {
  id: string;
  name: string;
  system: string;
  indications: string;
  ingredients: string;
  usage: string;
  imageEmoji: string;
}

export interface AyushMedicineItem {
  id: string;
  name: string;
  system: AyushSystem;
  category: string;
  formulationType: string;
  classicalReference: string;
  standardDosage: string;
  anupana: string;
  kala: string;
  keyIngredients: string[];
  indications: string[];
  namasteCode: string;
  contraindications: string[];
  pregnancyLactationWarning: string;
  allopathicInteractions: {
    drugClass: string;
    exampleDrugs: string[];
    severity: "CONTRAINDICATED" | "MAJOR" | "MODERATE" | "MINOR";
    mechanism: string;
    clinicalAdvice: string;
  }[];
}

export interface HerbDrugInteractionAlert {
  herbOrAyush: string;
  allopathicDrug: string;
  severity: "CONTRAINDICATED" | "MAJOR" | "MODERATE" | "MINOR";
  title: string;
  mechanism: string;
  clinicalRecommendation: string;
  literatureEvidence: string;
}

export interface DuplicateIngredientWarning {
  ingredient: string;
  foundIn: string[];
  warning: string;
}

export interface AyushClinicalAssessment {
  system: string;
  diagnosticSynthesis: string;
  prakritiOrConstitution: {
    primary: string;
    secondary: string;
    vikritiOrImbalance: string;
  };
  namasteCoding: Array<{
    code: string;
    term: string;
    icd11Mapping: string;
  }>;
  pathyaAhara: string[];
  apathyaAhara: string[];
  dinacharyaAndLifestyle: string[];
  treatmentProtocols: Array<{
    therapy: string;
    duration: string;
    rationale: string;
  }>;
  proposedMedicines: Array<{
    name: string;
    dosage: string;
    anupana: string;
    kala: string;
    duration: string;
    safetyAlert: string;
  }>;
  herbAllopathicSafetyChecks: string[];
  doctorApprovalRequired: boolean;
  disclaimer: string;
}

export interface LongitudinalTimelineEntry {
  id: string;
  date: string;
  system: string;
  facility: string;
  doctor: string;
  type: string;
  summary: string;
  metrics: Record<string, any>;
  medications: string[];
}

export interface CareJourneyStage {
  stageNumber: number;
  name: string;
  status: "COMPLETED" | "IN_PROGRESS" | "SCHEDULED";
  completedAt?: string;
  scheduledFor?: string;
  currentDay?: number;
  totalDays?: number;
  adherenceScore?: string;
  complianceScore?: string;
  streakDays?: number;
  details: string;
}

export interface CareJourney {
  journeyId: string;
  patientId: string;
  system: string;
  goal: string;
  status: string;
  startedAt: string;
  currentStage: string;
  stages: CareJourneyStage[];
}
