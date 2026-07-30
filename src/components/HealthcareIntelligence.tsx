import React, { useState, useEffect } from "react";
import AIHealthcareSuite from "./AIHealthcareSuite";
import { 
  Brain, 
  Layers, 
  TrendingUp, 
  AlertOctagon, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Smartphone, 
  User, 
  ShieldAlert, 
  DollarSign, 
  Plus, 
  BookOpen, 
  Check, 
  Sparkles, 
  Cpu, 
  Search, 
  Clock, 
  PhoneCall, 
  Download, 
  ShoppingBag,
  ExternalLink,
  MapPin,
  Workflow,
  Users,
  QrCode,
  ShieldCheck,
  BarChart2,
  Scan,
  Camera,
  Upload,
  Heart,
  Mic,
  MicOff,
  Stethoscope,
  Send,
  Share2,
  FileText,
  Globe,
  RefreshCw,
  Database,
  Pill,
  Zap,
  AlertTriangle,
  Trash2,
  Edit3,
  Filter,
  CheckSquare,
  Info,
  Grid
} from "lucide-react";

export interface DraftMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  brand?: string;
  source: "AI Proposed" | "Doctor Added";
}

export interface DrugInteractionAlert {
  id: string;
  drugA: string;
  drugB: string;
  isDrugBHome?: boolean;
  severity: "CRITICAL" | "MODERATE" | "MINOR";
  mechanism: string;
  riskDescription: string;
  clinicalAction: string;
  suggestedSubstitution?: {
    targetDrugName: string;
    replacementName: string;
    replacementDosage: string;
    replacementBrand?: string;
  };
}

interface MedicinePreference {
  name: string;
  brand: string;
  dosage: string;
  frequency: string;
  duration: string;
  confidence: number;
}

interface DoctorMemoryItem {
  id: string;
  doctorId: string;
  diagnosis: string;
  preferredMedicines: MedicinePreference[];
  writingStyle: string;
  followUpDays: number;
}

interface PatientTwin {
  patientId: string;
  patientName: string;
  healthScore: number;
  riskFactors: {
    name: string;
    level: "High" | "Medium" | "Low";
    description: string;
    trend: "increasing" | "stable" | "decreasing";
  }[];
  timeline: {
    id: string;
    date: string;
    type: "diagnosis" | "lab" | "surgery" | "medication" | "lifestyle" | "allergy";
    title: string;
    description: string;
    locationName: string;
  }[];
  predictedOutcomes: {
    treatment: string;
    probability: number;
    expectedDays: number;
    risks: string[];
    recommendations: string[];
  }[];
}

interface RevenueLeak {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  leakType: string;
  description: string;
  estimatedLeakAmount: number;
  sourceDepartment: string;
  status: "pending" | "resolved" | "ignored";
}

interface MarketplaceApp {
  id: string;
  name: string;
  category: string;
  description: string;
  provider: string;
  priceMonthly: number;
  revenueSharePercent: number;
  status: "Active" | "Inactive" | "Needs Authorization";
  logoUrl: string;
  installsCount: number;
}

interface VoiceCall {
  id: string;
  patientName: string;
  phone: string;
  timestamp: string;
  duration: string;
  intent: string;
  summary: string;
  sentiment: string;
  transcript: string;
}

interface PatientShort {
  id: string;
  fullName: string;
  age: number;
  gender: string;
}

interface LearningProposal {
  id: string;
  doctorId: string;
  patternType: "prescription_style" | "medicine_preference" | "followup_pattern";
  diagnosis: string;
  proposedPattern: {
    preferredMedicines: MedicinePreference[];
    writingStyle: string;
    followUpDays: number;
  };
  confidence: number;
  rationale: string;
  status: "pending" | "approved" | "dismissed";
  createdAt: string;
}

interface EvidenceInfo {
  rationale: string;
  guideline: string;
  referral_study: string;
  drug_interactions: string[];
  contraindications: string[];
  allergy_alert: string;
}

export default function HealthcareIntelligence({
  patients,
  setSuccessMsg,
  setErrorAlert
}: {
  patients: PatientShort[];
  setSuccessMsg: (msg: string | null) => void;
  setErrorAlert: (msg: string | null) => void;
}) {
  const [intelTab, setIntelTab] = useState<"suite" | "memory" | "twin" | "predictor" | "leak" | "voice" | "marketplace" | "copilot" | "approvals" | "population" | "automation" | "agents" | "skin">("suite");

  // === Doctor Memory State ===
  const [memoryList, setMemoryList] = useState<DoctorMemoryItem[]>([]);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [newStyle, setNewStyle] = useState("");
  const [newFollowUp, setNewFollowUp] = useState("14");
  const [newMedName, setNewMedName] = useState("");
  const [newMedBrand, setNewMedBrand] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedFreq, setNewMedFreq] = useState("1-0-1 (Twice daily)");
  const [newMedDur, setNewMedDur] = useState("15 days");
  const [tempMeds, setTempMeds] = useState<MedicinePreference[]>([]);

  // === Clinical Copilot & Safety State ===
  const [copilotPatientId, setCopilotPatientId] = useState("");
  const [copilotTranscript, setCopilotTranscript] = useState("");
  const [copilotResult, setCopilotResult] = useState<any | null>(null);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [evidenceCache, setEvidenceCache] = useState<Record<string, EvidenceInfo>>({});
  const [activeEvidenceMed, setActiveEvidenceMed] = useState<string | null>(null);
  const [isPregnantCheck, setIsPregnantCheck] = useState(false);
  const [isRenalCheck, setIsRenalCheck] = useState(false);
  const [isHepaticCheck, setIsHepaticCheck] = useState(false);
  const [customAgeCheck, setCustomAgeCheck] = useState("45");
  const [safetyCheckResult, setSafetyCheckResult] = useState<any | null>(null);
  const [isSafetyChecking, setIsSafetyChecking] = useState(false);

  // === Learning Approvals State ===
  const [proposals, setProposals] = useState<LearningProposal[]>([]);
  const [isApprovalsLoading, setIsApprovalsLoading] = useState(false);
  
  // === Editing memories inline State ===
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editStyle, setEditStyle] = useState("");
  const [editFollowUp, setEditFollowUp] = useState("7");
  const [editMeds, setEditMeds] = useState<MedicinePreference[]>([]);

  // === Digital Twin State ===
  const [selectedTwinPatientId, setSelectedTwinPatientId] = useState("");
  const [activeTwin, setActiveTwin] = useState<PatientTwin | null>(null);
  const [isTwinLoading, setIsTwinLoading] = useState(false);

  // === Outcome Predictor State ===
  const [predPatientId, setPredPatientId] = useState("");
  const [predDiagnosis, setPredDiagnosis] = useState("");
  const [predTreatmentPlan, setPredTreatmentPlan] = useState("");
  const [predictionResult, setPredictionResult] = useState<any | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // === Revenue Leak State ===
  const [revenueLeaks, setRevenueLeaks] = useState<RevenueLeak[]>([]);
  const [isLeaksLoading, setIsLeaksLoading] = useState(false);

  // === Voice Call State ===
  const [voiceCalls, setVoiceCalls] = useState<VoiceCall[]>([]);
  const [selectedCall, setSelectedCall] = useState<VoiceCall | null>(null);
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);

  // === Marketplace State ===
  const [marketplaceApps, setMarketplaceApps] = useState<MarketplaceApp[]>([]);

  // === Population Health State ===
  const [popRegion, setPopRegion] = useState("Delhi NCR");
  const [isPopLoading, setIsPopLoading] = useState(false);
  const [popReportTriggered, setPopReportTriggered] = useState(false);

  // === Healthcare Automation State ===
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([
    { id: "1", type: "trigger", title: "🧪 Lab Report Received", active: true, desc: "Triggers when new lab result is uploaded" },
    { id: "2", type: "action", title: "🧠 AI Safety Filter Run", active: true, desc: "Cross-checks contraindications against Patient History" },
    { id: "3", type: "action", title: "💬 WhatsApp Patient Broadcast", active: true, desc: "Sends patient-friendly care instructions" },
    { id: "4", type: "action", title: "📅 Auto-Schedule 3-Day Check", active: true, desc: "Inserts followup window in Doctor's Calendar" },
  ]);
  const [automationLogs, setAutomationLogs] = useState<string[]>([]);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);

  // === Multi-Agent State ===
  const [isAgentSimulating, setIsAgentSimulating] = useState(false);
  const [agentLogs, setAgentLogs] = useState<any[]>([]);

  // === Skin Analyzer State ===
  const [skinPatientId, setSkinPatientId] = useState("");
  const [skinFrontImage, setSkinFrontImage] = useState<string | null>(null);
  const [skinLeftImage, setSkinLeftImage] = useState<string | null>(null);
  const [skinRightImage, setSkinRightImage] = useState<string | null>(null);
  const [skinResult, setSkinResult] = useState<any | null>(null);
  const [isSkinLoading, setIsSkinLoading] = useState(false);
  const [skinHistory, setSkinHistory] = useState<any[]>([]);
  const [isSkinHistoryLoading, setIsSkinHistoryLoading] = useState(false);

  // === Enhanced Consultation Copilot & Real-Time Drug Interaction State ===
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionInstance, setSpeechRecognitionInstance] = useState<any | null>(null);
  const [copilotLang, setCopilotLang] = useState<"en" | "hi" | "mr" | "gu">("en");
  const [isEmrSaved, setIsEmrSaved] = useState(false);
  const [showDifferentialDetails, setShowDifferentialDetails] = useState<string | null>(null);

  // Prescription Drafting & Interaction State
  const [draftMeds, setDraftMeds] = useState<DraftMedication[]>([]);
  const [newDraftName, setNewDraftName] = useState("");
  const [newDraftDosage, setNewDraftDosage] = useState("500mg");
  const [newDraftFreq, setNewDraftFreq] = useState("1-0-1 (Twice daily)");
  const [newDraftDur, setNewDraftDur] = useState("7 days");
  const [interactionFilter, setInteractionFilter] = useState<"ALL" | "CRITICAL" | "MODERATE" | "MINOR">("ALL");
  const [showInteractionMatrix, setShowInteractionMatrix] = useState(false);

  // Patient Home / Chronic EMR Meds Map
  const patientHomeMedsMap: Record<string, { name: string; dosage: string; frequency: string }[]> = {
    "PAT-001": [
      { name: "Warfarin", dosage: "5mg", frequency: "OD (Night)" },
      { name: "Telmisartan", dosage: "40mg", frequency: "OD (Morning)" }
    ],
    "PAT-002": [
      { name: "Atorvastatin", dosage: "20mg", frequency: "OD (Night)" },
      { name: "Omeprazole", dosage: "20mg", frequency: "OD (Morning)" }
    ],
    "PAT-003": [
      { name: "Asthalin Syrup", dosage: "5ml", frequency: "TDS" }
    ]
  };

  const activeHomeMeds = patientHomeMedsMap[copilotPatientId] || patientHomeMedsMap["PAT-001"] || [];

  // Real-Time Drug Interaction Evaluation Engine
  const checkRealtimeDrugInteractions = (
    drafts: DraftMedication[],
    homeMeds: { name: string; dosage: string; frequency: string }[]
  ): DrugInteractionAlert[] => {
    const alerts: DrugInteractionAlert[] = [];
    const allMeds: { name: string; dosage: string; isHome: boolean; rawObj?: DraftMedication }[] = [
      ...drafts.map((d) => ({ name: d.name, dosage: d.dosage, isHome: false, rawObj: d })),
      ...homeMeds.map((h) => ({ name: h.name, dosage: h.dosage, isHome: true }))
    ];

    for (let i = 0; i < allMeds.length; i++) {
      for (let j = i + 1; j < allMeds.length; j++) {
        const medA = allMeds[i];
        const medB = allMeds[j];
        const nameA = medA.name.toLowerCase();
        const nameB = medB.name.toLowerCase();

        // Skip comparing two home meds with each other
        if (medA.isHome && medB.isHome) continue;

        const isPair = (str1: string, str2: string) =>
          (nameA.includes(str1) && nameB.includes(str2)) ||
          (nameA.includes(str2) && nameB.includes(str1));

        // 1. Warfarin + NSAID / Antiplatelet
        if (isPair("warfarin", "aspirin") || isPair("warfarin", "ibuprofen") || isPair("warfarin", "naproxen") || isPair("warfarin", "diclofenac")) {
          const nsaidName = nameA.includes("warfarin") ? medB.name : medA.name;
          alerts.push({
            id: `alert-warfarin-nsaid-${i}-${j}`,
            drugA: "Warfarin",
            drugB: nsaidName,
            isDrugBHome: medA.isHome || medB.isHome,
            severity: "CRITICAL",
            mechanism: "NSAIDs disrupt gastric mucosal integrity and inhibit COX-1 platelet aggregation, compounding Warfarin's systemic anticoagulant cascade.",
            riskDescription: "High probability of severe upper gastrointestinal bleeding, acute drop in Hb, and unmonitored INR surge (>5.0).",
            clinicalAction: "Absolute Contraindication. Discontinue NSAID immediately. Substitute with Paracetamol 650mg for analgesia.",
            suggestedSubstitution: {
              targetDrugName: nsaidName,
              replacementName: "Paracetamol (Calpol)",
              replacementDosage: "650mg",
              replacementBrand: "Calpol 650"
            }
          });
        }

        // 2. Sildenafil / Tadalafil + Nitrates
        if (isPair("sildenafil", "nitroglycerin") || isPair("sildenafil", "isosorbide") || isPair("tadalafil", "nitroglycerin")) {
          const nitName = nameA.includes("sildenafil") || nameA.includes("tadalafil") ? medB.name : medA.name;
          alerts.push({
            id: `alert-sildenafil-nitrate-${i}-${j}`,
            drugA: nameA.includes("sildenafil") ? "Sildenafil" : "Tadalafil",
            drugB: nitName,
            isDrugBHome: medA.isHome || medB.isHome,
            severity: "CRITICAL",
            mechanism: "PDE5 inhibition prevents cGMP breakdown, accumulating nitric oxide-mediated vasodilation with organic nitrates.",
            riskDescription: "Life-threatening precipitous drop in blood pressure, acute coronary hypoperfusion, and risk of myocardial infarction.",
            clinicalAction: "Absolute Contraindication. Withhold nitrates for 24-48 hours or replace nitrate with Amlodipine.",
            suggestedSubstitution: {
              targetDrugName: nitName,
              replacementName: "Amlodipine",
              replacementDosage: "5mg",
              replacementBrand: "Amlopin 5"
            }
          });
        }

        // 3. Telmisartan / ACEi + Spironolactone
        if (isPair("telmisartan", "spironolactone") || isPair("enalapril", "spironolactone") || isPair("ramipril", "spironolactone")) {
          alerts.push({
            id: `alert-ras-spiro-${i}-${j}`,
            drugA: nameA.includes("spironolactone") ? medB.name : medA.name,
            drugB: "Spironolactone",
            isDrugBHome: medA.isHome || medB.isHome,
            severity: "CRITICAL",
            mechanism: "Dual renin-angiotensin-aldosterone system inhibition severely impairs distal nephron K+ secretion.",
            riskDescription: "Severe Hyperkalemia Risk (Serum K+ > 5.8 mEq/L) triggering cardiac conduction delays and lethal arrhythmias.",
            clinicalAction: "Avoid co-prescribing without daily electrolyte monitoring. Substitute Spironolactone with Hydrochlorothiazide.",
            suggestedSubstitution: {
              targetDrugName: "Spironolactone",
              replacementName: "Hydrochlorothiazide",
              replacementDosage: "12.5mg",
              replacementBrand: "Aquazide 12.5"
            }
          });
        }

        // 4. Clopidogrel + Omeprazole
        if (isPair("clopidogrel", "omeprazole")) {
          alerts.push({
            id: `alert-clopi-omep-${i}-${j}`,
            drugA: "Clopidogrel",
            drugB: "Omeprazole",
            isDrugBHome: medA.isHome || medB.isHome,
            severity: "MODERATE",
            mechanism: "Omeprazole competitively inhibits hepatic CYP2C19 enzyme required to convert Clopidogrel to its active metabolite.",
            riskDescription: "Substantial decrease in antiplatelet activity, elevating recurrent stent thrombosis risk in vascular patients.",
            clinicalAction: "Switch PPI to Pantoprazole 40mg or Rabeprazole, which exhibit negligible CYP2C19 inhibition.",
            suggestedSubstitution: {
              targetDrugName: "Omeprazole",
              replacementName: "Pantoprazole",
              replacementDosage: "40mg",
              replacementBrand: "Pan-40"
            }
          });
        }

        // 5. Amlodipine + Atorvastatin / Simvastatin
        if (isPair("amlodipine", "atorvastatin") || isPair("amlodipine", "simvastatin")) {
          const statinName = nameA.includes("amlodipine") ? medB.name : medA.name;
          alerts.push({
            id: `alert-amlo-statin-${i}-${j}`,
            drugA: "Amlodipine",
            drugB: statinName,
            isDrugBHome: medA.isHome || medB.isHome,
            severity: "MODERATE",
            mechanism: "Amlodipine mild CYP3A4 inhibition reduces hepatic statin metabolic clearance, raising systemic AUC.",
            riskDescription: "Increased vulnerability to statin-induced myopathy, muscle weakness, and rare rhabdomyolysis.",
            clinicalAction: "Cap Simvastatin at 20mg or switch Statin to Rosuvastatin 10mg (hydrophilic, no CYP3A4 pathway).",
            suggestedSubstitution: {
              targetDrugName: statinName,
              replacementName: "Rosuvastatin",
              replacementDosage: "10mg",
              replacementBrand: "Rosuvas 10"
            }
          });
        }

        // 6. Metformin + Ciprofloxacin
        if (isPair("metformin", "ciprofloxacin")) {
          alerts.push({
            id: `alert-met-cipro-${i}-${j}`,
            drugA: "Metformin",
            drugB: "Ciprofloxacin",
            isDrugBHome: medA.isHome || medB.isHome,
            severity: "MODERATE",
            mechanism: "Competition for renal organic cation transporter (OCT2) slows renal excretion of Metformin.",
            riskDescription: "Potentiates Metformin accumulation, increasing risk of Metformin-associated lactic acidosis (MALA).",
            clinicalAction: "Monitor eGFR and renal parameters closely during antibiotic therapy.",
            suggestedSubstitution: {
              targetDrugName: "Ciprofloxacin",
              replacementName: "Azithromycin",
              replacementDosage: "500mg",
              replacementBrand: "Azee 500"
            }
          });
        }

        // 7. Azithromycin + Asthalin
        if (isPair("azithromycin", "asthalin") || isPair("azee", "asthalin") || isPair("azithromycin", "salbutamol")) {
          alerts.push({
            id: `alert-azee-asthalin-${i}-${j}`,
            drugA: medA.name,
            drugB: medB.name,
            isDrugBHome: medA.isHome || medB.isHome,
            severity: "MINOR",
            mechanism: "Additive autonomic cardiac sympathetic activation from macrolide antibiotic and beta-2 agonist.",
            riskDescription: "Transient resting sinus tachycardia or mild tremors.",
            clinicalAction: "Routine pulse rate monitoring advised. Safe for standard 5-day therapy."
          });
        }

        // 8. Aspirin + Clopidogrel
        if (isPair("aspirin", "clopidogrel")) {
          alerts.push({
            id: `alert-asp-clopi-${i}-${j}`,
            drugA: "Aspirin",
            drugB: "Clopidogrel",
            isDrugBHome: medA.isHome || medB.isHome,
            severity: "MODERATE",
            mechanism: "Dual antiplatelet therapy combines COX-1 pathway inhibition with P2Y12 ADP receptor blockade.",
            riskDescription: "Synergistic bleeding risk; standard of care post-PCI/ACS but requires gastric protection.",
            clinicalAction: "Co-prescribe Pantoprazole 40mg for gastric mucosa protection."
          });
        }
      }
    }

    return alerts;
  };

  const activeInteractionAlerts = React.useMemo(() => {
    return checkRealtimeDrugInteractions(draftMeds, activeHomeMeds);
  }, [draftMeds, activeHomeMeds]);

  // Sync draftMeds whenever copilotResult updates
  useEffect(() => {
    if (copilotResult?.medications && copilotResult.medications.length > 0) {
      const formatted: DraftMedication[] = copilotResult.medications.map((m: any, idx: number) => ({
        id: `ai-med-${idx}-${Date.now()}`,
        name: m.name || "Medicine",
        dosage: m.dosage || "500mg",
        frequency: m.frequency || "1-0-1",
        duration: m.duration || "7 days",
        brand: m.brand || "Generic",
        source: "AI Proposed"
      }));
      setDraftMeds(formatted);
    }
  }, [copilotResult]);

  // Draft prescription handlers
  const handleAddDraftMed = (customName?: string, customDosage?: string, customFreq?: string, customDur?: string) => {
    const nameToAdd = customName || newDraftName;
    if (!nameToAdd.trim()) return;

    const newMed: DraftMedication = {
      id: `doc-med-${Date.now()}`,
      name: nameToAdd.trim(),
      dosage: customDosage || newDraftDosage || "500mg",
      frequency: customFreq || newDraftFreq || "1-0-1",
      duration: customDur || newDraftDur || "7 days",
      brand: "Doctor Custom",
      source: "Doctor Added"
    };

    setDraftMeds((prev) => [...prev, newMed]);
    setNewDraftName("");
    setSuccessMsg(`💊 Added "${newMed.name}" to prescription draft! Interaction engine recalculated.`);
  };

  const handleRemoveDraftMed = (id: string) => {
    setDraftMeds((prev) => prev.filter((m) => m.id !== id));
    setSuccessMsg("🗑️ Drug removed from draft. Real-time safety engine updated!");
  };

  const handleApplySubstitution = (alert: DrugInteractionAlert) => {
    if (!alert.suggestedSubstitution) return;
    const { targetDrugName, replacementName, replacementDosage, replacementBrand } = alert.suggestedSubstitution;

    // Find and replace in draftMeds
    let replacedCount = 0;
    setDraftMeds((prev) =>
      prev.map((m) => {
        if (m.name.toLowerCase().includes(targetDrugName.toLowerCase())) {
          replacedCount++;
          return {
            ...m,
            name: replacementName,
            dosage: replacementDosage,
            brand: replacementBrand || "Recommended Alt",
            source: "Doctor Added"
          };
        }
        return m;
      })
    );

    if (replacedCount > 0) {
      setSuccessMsg(`⚡ Successfully substituted "${targetDrugName}" with "${replacementName} ${replacementDosage}"! Conflict resolved.`);
    } else {
      // If target was home med, add the replacement as doctor med or notify
      setSuccessMsg(`⚡ Recommendation applied for ${targetDrugName}! Clinical note updated.`);
    }
  };

  // Ambient Speech Dictation Handler
  const startSpeechDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorAlert("Browser speech recognition is not supported on this browser. You can type or select test scenarios.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = copilotLang === "hi" ? "hi-IN" : copilotLang === "mr" ? "mr-IN" : copilotLang === "gu" ? "gu-IN" : "en-IN";

      recognition.onresult = (event: any) => {
        let finalChunk = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += text + " ";
          }
        }
        if (finalChunk) {
          setCopilotTranscript((prev) => (prev ? prev.trim() + " " + finalChunk.trim() : finalChunk.trim()));
        }
      };

      recognition.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setSpeechRecognitionInstance(recognition);
      setIsListening(true);
      setSuccessMsg("🎙️ Live ambient dictation active! Dictate clinical notes or conversation...");
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopSpeechDictation = () => {
    if (speechRecognitionInstance) {
      try {
        speechRecognitionInstance.stop();
      } catch (e) {
        console.error(e);
      }
      setSpeechRecognitionInstance(null);
    }
    setIsListening(false);
  };

  // Sync Digital Twin whenever copilot patient ID changes
  useEffect(() => {
    if (copilotPatientId) {
      fetchDigitalTwin(copilotPatientId);
      setIsEmrSaved(false);
    }
  }, [copilotPatientId, intelTab]);

  // Initialize selected twin patient ID once patients are loaded
  useEffect(() => {
    if (patients && patients.length > 0) {
      if (!selectedTwinPatientId) {
        setSelectedTwinPatientId(patients[0].id);
        setPredPatientId(patients[0].id);
      }
      if (!copilotPatientId) {
        setCopilotPatientId(patients[0].id);
      }
      if (!skinPatientId) {
        setSkinPatientId(patients[0].id);
      }
    }
  }, [patients]);

  // Load state functions
  const fetchDoctorMemory = async () => {
    try {
      const res = await fetch("/api/v1/intelligence/doctor-memory");
      if (res.ok) {
        const data = await res.json();
        setMemoryList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSkinHistory = async (patientId: string) => {
    if (!patientId) return;
    setIsSkinHistoryLoading(true);
    try {
      const res = await fetch(`/api/v1/skin-analyze/results/${patientId}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setSkinHistory(result.data || []);
        }
      }
    } catch (e) {
      console.error("[SKIN HISTORY ERROR]", e);
    } finally {
      setIsSkinHistoryLoading(false);
    }
  };

  const handleAnalyzeSkin = async () => {
    if (!skinFrontImage) {
      setErrorAlert("Please select or capture a front-face image for analysis.");
      return;
    }
    setIsSkinLoading(true);
    setSkinResult(null);
    try {
      const payload = {
        patientId: skinPatientId,
        image_base64: skinFrontImage,
        left_side_image: skinLeftImage,
        right_side_image: skinRightImage
      };

      const res = await fetch("/api/v1/skin-analyze/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setSkinResult(result.data);
          setSuccessMsg("AI Skin Analysis completed successfully!");
          // Refresh patient skin history
          if (skinPatientId) {
            fetchSkinHistory(skinPatientId);
          }
        } else {
          setErrorAlert(result.error || "Failed to analyze skin image.");
        }
      } else {
        setErrorAlert("Server error during skin analysis.");
      }
    } catch (e: any) {
      setErrorAlert(e.message || "Network error occurred.");
    } finally {
      setIsSkinLoading(false);
    }
  };

  useEffect(() => {
    if (skinPatientId) {
      fetchSkinHistory(skinPatientId);
    }
  }, [skinPatientId]);

  const fetchApprovals = async () => {
    setIsApprovalsLoading(true);
    try {
      const res = await fetch("/api/v1/intelligence/approvals");
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsApprovalsLoading(false);
    }
  };

  const fetchDigitalTwin = async (patientId: string) => {
    if (!patientId) return;
    setIsTwinLoading(true);
    try {
      const res = await fetch(`/api/v1/intelligence/digital-twin/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveTwin(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTwinLoading(false);
    }
  };

  const fetchRevenueLeaks = async () => {
    setIsLeaksLoading(true);
    try {
      const res = await fetch("/api/v1/intelligence/revenue-leaks");
      if (res.ok) {
        const data = await res.json();
        setRevenueLeaks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLeaksLoading(false);
    }
  };

  const fetchVoiceCalls = async () => {
    try {
      const res = await fetch("/api/v1/intelligence/voice-calls");
      if (res.ok) {
        const data = await res.json();
        setVoiceCalls(data);
        if (data.length > 0 && !selectedCall) {
          setSelectedCall(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMarketplaceApps = async () => {
    try {
      const res = await fetch("/api/v1/intelligence/marketplace");
      if (res.ok) {
        const data = await res.json();
        setMarketplaceApps(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load everything on tab switches
  useEffect(() => {
    fetchDoctorMemory();
    fetchRevenueLeaks();
    fetchVoiceCalls();
    fetchMarketplaceApps();
    fetchApprovals();
  }, []);

  useEffect(() => {
    if (selectedTwinPatientId) {
      fetchDigitalTwin(selectedTwinPatientId);
    }
  }, [selectedTwinPatientId]);

  // Handle action handlers
  const handleAddTempMed = () => {
    if (!newMedName) return;
    setTempMeds([
      ...tempMeds,
      {
        name: newMedName,
        brand: newMedBrand || "Generic",
        dosage: newMedDosage || "Standard",
        frequency: newMedFreq,
        duration: newMedDur,
        confidence: 100 // Manual input starts at 100% confidence
      }
    ]);
    setNewMedName("");
    setNewMedBrand("");
    setNewMedDosage("");
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagnosis || tempMeds.length === 0) {
      setErrorAlert("Please specify a diagnosis and add at least one preferred medicine.");
      return;
    }

    try {
      const res = await fetch("/api/v1/intelligence/doctor-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: newDiagnosis,
          preferredMedicines: tempMeds,
          writingStyle: newStyle,
          followUpDays: Number(newFollowUp)
        })
      });

      if (res.ok) {
        setSuccessMsg(`AI Doctor Memory trained successfully for: ${newDiagnosis}`);
        fetchDoctorMemory();
        // Reset
        setNewDiagnosis("");
        setNewStyle("");
        setNewFollowUp("14");
        setTempMeds([]);
        setIsAddingMemory(false);
      } else {
        setErrorAlert("Failed to register learned pattern.");
      }
    } catch (e) {
      setErrorAlert("Error occurred while saving memory.");
    }
  };

  const handlePredictOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!predDiagnosis || !predTreatmentPlan) {
      setErrorAlert("Diagnosis and treatment plan are required for predictive calculation.");
      return;
    }

    setIsPredicting(true);
    try {
      const res = await fetch("/api/v1/intelligence/predict-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: predPatientId,
          diagnosis: predDiagnosis,
          treatmentPlan: predTreatmentPlan
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPredictionResult(data);
        setSuccessMsg("AI outcome prediction model finished computation successfully!");
      }
    } catch (e) {
      setErrorAlert("Error predicting treatment outcome.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleResolveLeak = async (leakId: string) => {
    try {
      const res = await fetch(`/api/v1/intelligence/revenue-leaks/${leakId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" })
      });

      if (res.ok) {
        setSuccessMsg(`Leak Resolved! Added missing items to Patient invoice.`);
        fetchRevenueLeaks();
      }
    } catch (e) {
      setErrorAlert("Failed to update leak status.");
    }
  };

  const handleIgnoreLeak = async (leakId: string) => {
    try {
      const res = await fetch(`/api/v1/intelligence/revenue-leaks/${leakId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ignored" })
      });

      if (res.ok) {
        setSuccessMsg(`Audit log updated: Leak item was dismissed.`);
        fetchRevenueLeaks();
      }
    } catch (e) {
      setErrorAlert("Failed to dismiss leak.");
    }
  };

  const handleToggleMarketplaceApp = async (appId: string) => {
    try {
      const res = await fetch(`/api/v1/intelligence/marketplace/toggle/${appId}`, {
        method: "PATCH"
      });

      if (res.ok) {
        const updatedApp = await res.json();
        setSuccessMsg(`App status changed! CardioAI / LungsAI suite toggled successfully.`);
        fetchMarketplaceApps();
      }
    } catch (e) {
      setErrorAlert("Failed to toggle application status.");
    }
  };

  const handleSimulateCall = async () => {
    setIsSimulatingCall(true);
    try {
      const res = await fetch("/api/v1/intelligence/voice-calls/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const newCall = await res.json();
        setSuccessMsg(`Incoming Simulated Call Finished: Agent solved issue for ${newCall.patientName}!`);
        fetchVoiceCalls();
        setSelectedCall(newCall);
      }
    } catch (e) {
      setErrorAlert("Failed to simulate VoIP interaction.");
    } finally {
      setIsSimulatingCall(false);
    }
  };

  const handleApproveProposal = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/intelligence/approvals/${id}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        setSuccessMsg("Proposal approved! Pattern merged with active Doctor Memory.");
        fetchApprovals();
        fetchDoctorMemory();
      }
    } catch (e) {
      setErrorAlert("Failed to approve learning pattern.");
    }
  };

  const handleDismissProposal = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/intelligence/approvals/${id}/dismiss`, {
        method: "POST"
      });
      if (res.ok) {
        setSuccessMsg("Learning proposal dismissed and flagged to prevent duplicates.");
        fetchApprovals();
      }
    } catch (e) {
      setErrorAlert("Failed to dismiss proposal.");
    }
  };

  const handleStartEditMemory = (mem: DoctorMemoryItem) => {
    setEditingMemoryId(mem.id);
    setEditStyle(mem.writingStyle);
    setEditFollowUp(String(mem.followUpDays));
    setEditMeds([...mem.preferredMedicines]);
  };

  const handleUpdateMemory = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/intelligence/doctor-memory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredMedicines: editMeds,
          writingStyle: editStyle,
          followUpDays: Number(editFollowUp)
        })
      });
      if (res.ok) {
        setSuccessMsg("Doctor Memory configuration updated successfully!");
        setEditingMemoryId(null);
        fetchDoctorMemory();
      }
    } catch (e) {
      setErrorAlert("Failed to save memory changes.");
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/intelligence/doctor-memory/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSuccessMsg("Custom clinical pattern Untrained/Removed from Doctor Memory!");
        fetchDoctorMemory();
      }
    } catch (e) {
      setErrorAlert("Failed to remove clinician memory.");
    }
  };

  const handleResetMemories = async () => {
    if (!window.confirm("Are you sure you want to restore Doctor Memory to baseline clinical templates? This will wipe your edits.")) return;
    try {
      const res = await fetch("/api/v1/intelligence/doctor-memory/reset", {
        method: "POST"
      });
      if (res.ok) {
        setSuccessMsg("Doctor Memory has been reset to factory clinical guidelines!");
        fetchDoctorMemory();
      }
    } catch (e) {
      setErrorAlert("Failed to reset doctor memories.");
    }
  };

  const handleExportPreferences = async () => {
    try {
      const res = await fetch("/api/v1/intelligence/doctor-memory/export");
      if (res.ok) {
        const data = await res.json();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `cura_doctor_preferences_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setSuccessMsg("Clinician preference profiles exported cleanly! Download started.");
      }
    } catch (e) {
      setErrorAlert("Failed to export configuration.");
    }
  };

  const handleRunAutomation = () => {
    setIsAutomationRunning(true);
    setAutomationLogs(["[System] Initializing Care Automation Sequence...", "[System] Monitoring EHR upload streams..."]);
    
    setTimeout(() => {
      setAutomationLogs(prev => [...prev, "✓ [Trigger Node] Lab Report received for Patient S. Sharma: HbA1c = 8.4% (Elevated)"]);
    }, 1000);

    setTimeout(() => {
      setAutomationLogs(prev => [...prev, "✓ [AI Safety Node] Accessing Clinical Guideline Engine & Patient History...", "✓ [AI Safety Node] Checking: No Renal Impairment, No pregnancy, No drug-to-drug interactions. Treatment verified safe!"]);
    }, 2200);

    setTimeout(() => {
      setAutomationLogs(prev => [...prev, "✓ [Broadcast Node] Triggering WhatsApp Patient Broadcast via Twilio API...", "✓ [Broadcast Node] Sent: 'Hi Shweta, your doctor has reviewed your recent HbA1c tests. Here is your updated dietary care kit and a prescription outline... Link: cura.health/p_sharma'"]);
    }, 3500);

    setTimeout(() => {
      setAutomationLogs(prev => [...prev, "✓ [Schedule Node] Auto-booking 3-day followup slot in Dr. Shekhar's calendar...", "✓ [System] Care Automation executed successfully with 100% compliance!"]);
      setIsAutomationRunning(false);
    }, 4800);
  };

  const handleSimulateAgents = () => {
    setIsAgentSimulating(true);
    setAgentLogs([
      { agent: "System", message: "Initialising Multi-Agent Diagnostic & Clinic Ops Flow...", timestamp: new Date().toLocaleTimeString() }
    ]);

    setTimeout(() => {
      setAgentLogs(prev => [...prev, 
        { agent: "Reception AI 📞", message: "Inbound voice query received. Verified patient eligibility and booked a 10:15 AM slots for chest heaviness.", timestamp: new Date().toLocaleTimeString() }
      ]);
    }, 1000);

    setTimeout(() => {
      setAgentLogs(prev => [...prev, 
        { agent: "Diagnosis AI 🧠", message: "Consultation audio parsed. Synthesizing diagnostic possibilities. Suggesting Stage-I Hypertension. Alerting Billing AI for pre-authorization.", timestamp: new Date().toLocaleTimeString() }
      ]);
    }, 2200);

    setTimeout(() => {
      setAgentLogs(prev => [...prev, 
        { agent: "Billing & Insurance AI 💸", message: "Insurance provider ICICI Lombard polled. Pre-authorization request created. Co-pay amount calculated: ₹250. Code ICD-11: 1B40 selected.", timestamp: new Date().toLocaleTimeString() }
      ]);
    }, 3400);

    setTimeout(() => {
      setAgentLogs(prev => [...prev, 
        { agent: "Pharmacy & Inventory AI 💊", message: "Inventory checked: Amlodipine 5mg (Amlopin) has 240 tabs in stock. Drug interaction checker completed: Clear of interactions.", timestamp: new Date().toLocaleTimeString() }
      ]);
    }, 4600);

    setTimeout(() => {
      setAgentLogs(prev => [...prev, 
        { agent: "Referral & Case Transfer AI 🤝", message: "FHIR-compliant medical summary bundle prepared and signed for patient referral records.", timestamp: new Date().toLocaleTimeString() },
        { agent: "System", message: "Multi-Agent synchronization loop concluded cleanly. All agents are in IDLE standby.", timestamp: new Date().toLocaleTimeString() }
      ]);
      setIsAgentSimulating(false);
    }, 5800);
  };

  const handleTriggerCopilot = async () => {
    if (!copilotTranscript.trim()) {
      setErrorAlert("Please enter or select a consultation audio transcript.");
      return;
    }
    setIsCopilotLoading(true);
    setCopilotResult(null);
    setSafetyCheckResult(null);
    try {
      const res = await fetch("/api/v1/intelligence/copilot/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: copilotTranscript,
          patientId: copilotPatientId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotResult(data);
        setSuccessMsg("Clinical Copilot generated SOAP summary and evidence audit!");
        
        // Auto-trigger Safety check for this outcome!
        const medicineNames = data.medications?.map((m: any) => m.name) || [];
        handleTriggerSafetyCheck(medicineNames);
      }
    } catch (e) {
      setErrorAlert("Error occurred during clinical copilot computation.");
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleFetchEvidence = async (medicine: string) => {
    if (evidenceCache[medicine]) {
      setActiveEvidenceMed(medicine);
      return;
    }
    try {
      const res = await fetch("/api/v1/intelligence/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine,
          patientId: copilotPatientId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEvidenceCache(prev => ({
          ...prev,
          [medicine]: data
        }));
        setActiveEvidenceMed(medicine);
      }
    } catch (e) {
      console.error("Failed to fetch clinical evidence details", e);
    }
  };

  const handleTriggerSafetyCheck = async (meds?: string[]) => {
    const activeMeds = meds || copilotResult?.medications?.map((m: any) => m.name) || [];
    if (activeMeds.length === 0) return;
    setIsSafetyChecking(true);
    try {
      const res = await fetch("/api/v1/intelligence/safety-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medications: activeMeds,
          patientId: copilotPatientId,
          isPregnant: isPregnantCheck,
          hasRenalImpairment: isRenalCheck,
          hasHepaticImpairment: isHepaticCheck,
          age: Number(customAgeCheck)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSafetyCheckResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSafetyChecking(false);
    }
  };

  // Re-trigger safety checks whenever clinical factors are toggled
  useEffect(() => {
    if (copilotResult) {
      const activeMeds = copilotResult.medications?.map((m: any) => m.name) || [];
      handleTriggerSafetyCheck(activeMeds);
    }
  }, [isPregnantCheck, isRenalCheck, isHepaticCheck, customAgeCheck]);

  return (
    <div id="healthcare-intelligence-dashboard" className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 opacity-15 transform translate-x-12 -translate-y-8 select-none">
          <Brain className="h-64 w-64 text-indigo-400" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3 animate-pulse" /> CURA Healthcare Intelligence Platform
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">🧠 AI Clinician Operating System</h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
              Unlock enterprise clinical efficiency and revenue generation. Harness clinician memory recall, predictive patient digital twins, and autonomous billing leakage protection.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleSimulateCall} 
              disabled={isSimulatingCall}
              className="text-xs font-extrabold px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all border-0 shadow-lg cursor-pointer flex items-center gap-2"
            >
              <PhoneCall className={`h-4 w-4 ${isSimulatingCall ? "animate-bounce" : ""}`} />
              {isSimulatingCall ? "Agent Speaking..." : "Simulate Voice Patient"}
            </button>
          </div>
        </div>
      </div>

      {/* TOP TIER TABS SECTION */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto gap-1">
        <button
          onClick={() => setIntelTab("suite")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "suite"
              ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-200 scale-105"
              : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-extrabold border border-indigo-200"
          }`}
        >
          <Sparkles className="h-4 w-4 animate-spin-slow text-amber-300" />
          <span>🌟 10 AI Opportunities Suite</span>
          <span className="bg-amber-400 text-slate-950 font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full">
            HOT
          </span>
        </button>

        <button
          onClick={() => setIntelTab("copilot")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "copilot"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>🎙️ Clinical Copilot</span>
        </button>

        <button
          onClick={() => setIntelTab("approvals")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "approvals"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>⚙️ Control & Approvals</span>
          {proposals.filter(p => p.status === "pending").length > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              {proposals.filter(p => p.status === "pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIntelTab("memory")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "memory"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          }`}
        >
          <Brain className="h-3.5 w-3.5" />
          <span>🧠 AI Doctor Memory</span>
        </button>

        <button
          onClick={() => setIntelTab("twin")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "twin"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>👥 Digital Twin of Patient</span>
        </button>

        <button
          onClick={() => setIntelTab("predictor")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "predictor"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>🔮 Outcome Predictor</span>
        </button>

        <button
          onClick={() => setIntelTab("leak")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "leak"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>💸 Revenue Leak Detector</span>
          {revenueLeaks.filter(l => l.status === "pending").length > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {revenueLeaks.filter(l => l.status === "pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIntelTab("voice")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "voice"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          }`}
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span>🎙️ Voice Receptionist Bot</span>
        </button>

        <button
          onClick={() => setIntelTab("marketplace")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "marketplace"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>🛍️ AI App Marketplace</span>
        </button>

        <button
          onClick={() => setIntelTab("population")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "population"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          }`}
        >
          <MapPin className="h-3.5 w-3.5 animate-pulse" />
          <span>📊 Population Health</span>
        </button>

        <button
          onClick={() => setIntelTab("automation")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "automation"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          }`}
        >
          <Workflow className="h-3.5 w-3.5" />
          <span>⚡ Care Automations</span>
        </button>

        <button
          onClick={() => setIntelTab("agents")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "agents"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>🤝 Multi-Agent Hub</span>
        </button>

        <button
          onClick={() => setIntelTab("skin")}
          className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            intelTab === "skin"
              ? "bg-pink-600 text-white shadow-md"
              : "text-pink-600 hover:text-pink-800 hover:bg-pink-50"
          }`}
        >
          <Scan className="h-3.5 w-3.5" />
          <span>🔬 Skin Analyze Pro</span>
        </button>
      </div>

      {/* RENDERED PANEL WORKSPACE */}

      {/* 0. 🌟 10 AI HEALTHCARE OPPORTUNITIES SUITE */}
      {intelTab === "suite" && (
        <AIHealthcareSuite userRole="doctor" patientId="P101" patientName="Rajesh Kumar" />
      )}

      {/* 1A. CLINICAL CONSULTATION COPILOT */}
      {intelTab === "copilot" && (
        <div className="space-y-6 animate-fadeIn">

          {/* TOP: REAL-TIME DIGITAL TWIN CONTEXT BANNER */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-900/50 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-900/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600/30 border border-indigo-500/40 rounded-2xl text-indigo-300">
                  <Cpu className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                      Digital Twin Sync Active
                    </span>
                    <span className="text-xs text-slate-400 font-bold">• ID: {copilotPatientId || "PAT-001"}</span>
                  </div>
                  <h3 className="text-base font-black text-white mt-1 flex items-center gap-2">
                    {activeTwin ? activeTwin.patientName : "Patient Twin Context"}
                    <span className="text-xs text-slate-400 font-medium">({patients.find(p => p.id === copilotPatientId)?.age || 45} y/o, {patients.find(p => p.id === copilotPatientId)?.gender || "Male"})</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchDigitalTwin(copilotPatientId)}
                  disabled={isTwinLoading}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-black border border-indigo-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTwinLoading ? "animate-spin" : ""}`} />
                  <span>Sync Digital Twin</span>
                </button>
              </div>
            </div>

            {/* TWIN BIOMARKERS & RISK SUMMARY BAR */}
            {activeTwin ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1 text-xs">
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Health Score Index</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-black text-white">{activeTwin.healthScore}</span>
                    <span className="text-[10px] font-bold text-emerald-400">/ 100</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Known Allergies</span>
                  <span className={`text-xs font-black block mt-1 ${(patients.find(p => p.id === copilotPatientId) as any)?.allergies?.length ? "text-rose-400" : "text-emerald-400"}`}>
                    {(patients.find(p => p.id === copilotPatientId) as any)?.allergies?.join(", ") || "None Recorded"}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Baseline Vitals</span>
                  <span className="text-xs font-black text-white block mt-1">
                    BP 145/92 • eGFR 82
                  </span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Glycemic Status</span>
                  <span className="text-xs font-black text-indigo-300 block mt-1">
                    HbA1c 7.2% (140 mg/dL)
                  </span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 col-span-2 md:col-span-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Primary Risk Vector</span>
                  <span className="text-xs font-black text-amber-400 block mt-1 truncate">
                    {activeTwin.riskFactors?.[0]?.name || "Cardiovascular Load"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-2">Loading Digital Twin context parameters...</div>
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* LEFT: CONSULTATION INPUT & AMBIENT VOICE DICTATION */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-indigo-600" />
                  Active Consultation Capture
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Dictate live ambient voice, paste notes, or select test scenarios
                </p>
              </div>

              {/* TARGET PATIENT SELECT */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Target Consult Patient:</label>
                <select
                  value={copilotPatientId}
                  onChange={(e) => setCopilotPatientId(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/50 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose active patient profile --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.age} y/o, {p.gender})
                    </option>
                  ))}
                </select>
              </div>

              {/* AMBIENT VOICE DICTATION CONTROLS */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className={`h-4 w-4 ${isListening ? "text-rose-500 animate-pulse" : "text-indigo-600"}`} />
                    Ambient Microphone Dictation
                  </span>
                  {isListening && (
                    <span className="flex items-center gap-1 text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                      ● LISTENING LIVE
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {!isListening ? (
                    <button
                      onClick={startSpeechDictation}
                      className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all border-0 shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>Start Listening</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopSpeechDictation}
                      className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all border-0 shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <MicOff className="h-3.5 w-3.5" />
                      <span>Stop Microphone</span>
                    </button>
                  )}
                </div>

                {/* ANIMATED AUDIO WAVE VISUALIZER WHEN RECORDING */}
                {isListening && (
                  <div className="flex items-center justify-center gap-1 py-1">
                    <div className="w-1 bg-indigo-600 rounded h-4 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1 bg-indigo-600 rounded h-6 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1 bg-indigo-600 rounded h-3 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    <div className="w-1 bg-indigo-600 rounded h-7 animate-bounce" style={{ animationDelay: "450ms" }}></div>
                    <div className="w-1 bg-indigo-600 rounded h-4 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                  </div>
                )}
              </div>

              {/* SIMULATION PRESETS */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">Load Test Case Scenario:</span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setCopilotTranscript("The patient is a 54-year-old female complaining of a throbbing headache for the last week, mainly in the frontal area. She also mentions feeling some chest heaviness when walking up stairs. On examination, her blood pressure is quite high at 152/94 mmHg, and heart rate is 82. I will prescribe Calpol for headache and start Amlopin 5mg as a daily blood pressure control.");
                      const pat = patients.find(p => p.fullName.includes("Sharma") || p.age > 45) || patients[0];
                      if (pat) setCopilotPatientId(pat.id);
                    }}
                    className="p-3 text-left rounded-2xl border border-slate-100 bg-indigo-50/40 hover:bg-indigo-50 text-slate-700 text-xs transition-all cursor-pointer font-bold flex flex-col gap-0.5"
                  >
                    <span className="text-[10px] text-indigo-700 font-extrabold">Scenario A: Stage I Hypertension</span>
                    <span className="text-[10px] text-slate-400 font-medium">Headache, BP 152/94, prescribes Amlodipine & Calpol</span>
                  </button>

                  <button
                    onClick={() => {
                      setCopilotTranscript("I am reviewing Mr. Khan who has uncontrolled diabetes. He says his fasting glucose levels at home are consistently around 155 to 170. His last HbA1c is 7.2%. He complains of some dry mouth and night urination. I want to start him on Glycomet 500mg twice daily and Neurobion Forte. Need to monitor renal filters closely.");
                      const pat = patients.find(p => p.fullName.includes("Khan") || p.age === 42) || patients[0];
                      if (pat) setCopilotPatientId(pat.id);
                    }}
                    className="p-3 text-left rounded-2xl border border-slate-100 bg-emerald-50/40 hover:bg-emerald-50 text-slate-700 text-xs transition-all cursor-pointer font-bold flex flex-col gap-0.5"
                  >
                    <span className="text-[10px] text-emerald-700 font-extrabold">Scenario B: Uncontrolled Diabetes</span>
                    <span className="text-[10px] text-slate-400 font-medium">Fasting glucose 160, HbA1c 7.2%, Metformin daily</span>
                  </button>

                  <button
                    onClick={() => {
                      setCopilotTranscript("Young pediatric patient came in with cold symptoms and dry irritating cough for 5 days. Low grade fever of 100.2 degrees. Pharynx looks red. Chest has minor wheezing, bronchitis suspected. Prescribing Azee 500mg and Asthalin AX syrup.");
                      const pat = patients.find(p => p.age < 18) || patients[0];
                      if (pat) setCopilotPatientId(pat.id);
                    }}
                    className="p-3 text-left rounded-2xl border border-slate-100 bg-amber-50/40 hover:bg-amber-50 text-slate-700 text-xs transition-all cursor-pointer font-bold flex flex-col gap-0.5"
                  >
                    <span className="text-[10px] text-amber-700 font-extrabold">Scenario C: Pediatric Bronchitis</span>
                    <span className="text-[10px] text-slate-400 font-medium">Dry cough, fever, prescribes Azithromycin & syrup</span>
                  </button>
                </div>
              </div>

              {/* TRANSCRIBED TRANSCRIPT TEXT AREA */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Dictation Transcript / Audio Log:</label>
                <textarea
                  value={copilotTranscript}
                  onChange={(e) => setCopilotTranscript(e.target.value)}
                  placeholder="Paste clinician consult conversation, dictated audio transcript, or select one of our tested clinical simulation presets above..."
                  className="w-full h-40 p-4 rounded-2xl border border-slate-200 text-xs font-medium text-slate-700 placeholder-slate-400 bg-slate-50/50 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                onClick={handleTriggerCopilot}
                disabled={isCopilotLoading || !copilotTranscript.trim()}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs tracking-wider transition-all border-0 shadow-lg cursor-pointer flex justify-center items-center gap-2"
              >
                {isCopilotLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Parsing Digital Twin & Consultation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>🚀 GENERATE CLINICAL BRIEF</span>
                  </>
                )}
              </button>
            </div>

            {/* RIGHT: BENTO GRID CLINICAL INTELLIGENCE BRIEF */}
            <div className="lg:col-span-8 space-y-6">
              {!copilotResult ? (
                <div className="bg-slate-50 rounded-3xl p-12 text-center border border-dashed border-slate-200 h-full flex flex-col justify-center items-center space-y-3">
                  <Brain className="h-16 w-16 text-slate-300 animate-pulse" />
                  <h4 className="text-sm font-black text-slate-700">No Active Brief Loaded</h4>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    Select a patient profile, record ambient consultation audio or select a preset, then generate. CURA will analyze Digital Twin records, formulate SOAP notes, differential diagnosis probability meters, and clinical safety checks.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">

                  {/* ACTION BAR: COMMIT TO EMR & DISPATCH */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckCircle className="h-4 w-4" />
                      </span>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Clinical Assessment Formulated</h5>
                        <p className="text-[10px] text-slate-400 font-bold">Synced with Digital Twin Patient Context</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsEmrSaved(true);
                          setSuccessMsg(`✅ Consultation record & SOAP notes committed to EMR for Patient ${copilotPatientId} and synced to Digital Twin Timeline!`);
                        }}
                        disabled={isEmrSaved}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-0 cursor-pointer flex items-center gap-1.5 ${
                          isEmrSaved 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                        }`}
                      >
                        <Database className="h-3.5 w-3.5" />
                        <span>{isEmrSaved ? "Saved to Patient EMR ✅" : "Save to Patient EMR"}</span>
                      </button>
                    </div>
                  </div>

                  {/* DIFFERENTIAL DIAGNOSIS PROBABILITY ENGINE */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        AI Differential Diagnosis Probability Engine
                      </h4>
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Context-Aware CDSS
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        {
                          name: copilotResult.soap?.assessment || "Essential Stage I Hypertension",
                          prob: 88,
                          color: "indigo",
                          rationale: "Elevated systolic BP average (152 mmHg) + frontal headache + Digital Twin cardiovascular risk vector."
                        },
                        {
                          name: "Stress-Induced Cephalea",
                          prob: 62,
                          color: "emerald",
                          rationale: "Frontal throbbing headache correlated with occupational stress and autonomic elevation."
                        },
                        {
                          name: "Hypertensive Micro-Vascular Strain",
                          prob: 45,
                          color: "amber",
                          rationale: "Concomitant chest heaviness during staircase exertion in a patient with borderline lipid baseline."
                        }
                      ].map((diag, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800">{diag.name}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              diag.prob > 80 ? "bg-indigo-100 text-indigo-700" : diag.prob > 60 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {diag.prob}% Match
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                diag.prob > 80 ? "bg-indigo-600" : diag.prob > 60 ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${diag.prob}%` }}
                            ></div>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed pt-1">
                            {diag.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* BENTO GRID OF CLINICAL SUMMARY */}
                  <div className="grid md:grid-cols-2 gap-6">
                    
                    {/* SOAP STRUCTURE CARD */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-indigo-500" />
                          Formatted SOAP Record
                        </h4>
                        <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Structured Notes</span>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">Subjective (S)</span>
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 mt-1 font-medium">{copilotResult.soap?.subjective || "No patient report recorded."}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">Objective (O)</span>
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 mt-1 font-medium">{copilotResult.soap?.objective || "No physical exam inputs."}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">Assessment (A)</span>
                          <p className="text-xs text-indigo-800 font-bold leading-relaxed bg-indigo-50/20 p-2.5 rounded-xl border border-indigo-50 mt-1">{copilotResult.soap?.assessment || "Diagnosis pending diagnostic support."}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">Plan (P)</span>
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 mt-1 font-medium">{copilotResult.soap?.plan || "Immediate diagnostic orders set."}</p>
                        </div>
                      </div>
                    </div>

                    {/* DYNAMIC SAFETY CENTRE CARD */}
                    <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />
                          Clinical Safety Guardrails
                        </h4>
                        <span className="text-[9px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">Non-Negotiable</span>
                      </div>

                      {/* CLINICAL STATE TOGGLES */}
                      <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Test Dynamic Risk Factor Controls:</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-300 transition-all select-none">
                            <input
                              type="checkbox"
                              checked={isPregnantCheck}
                              onChange={(e) => setIsPregnantCheck(e.target.checked)}
                              className="accent-rose-500 rounded cursor-pointer"
                            />
                            <span>Patient Pregnant 🤰</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-300 transition-all select-none">
                            <input
                              type="checkbox"
                              checked={isRenalCheck}
                              onChange={(e) => setIsRenalCheck(e.target.checked)}
                              className="accent-rose-500 rounded cursor-pointer"
                            />
                            <span>Renal (eGFR &lt; 30) 🧪</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-300 transition-all select-none">
                            <input
                              type="checkbox"
                              checked={isHepaticCheck}
                              onChange={(e) => setIsHepaticCheck(e.target.checked)}
                              className="accent-rose-500 rounded cursor-pointer"
                            />
                            <span>Hepatic (Class B) 🥩</span>
                          </label>

                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-slate-400">Age:</span>
                            <input
                              type="number"
                              value={customAgeCheck}
                              onChange={(e) => setCustomAgeCheck(e.target.value)}
                              className="w-12 px-1 bg-slate-750 border border-slate-700 text-white rounded text-[10px] font-black focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SAFETY WARN RENDER */}
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {isSafetyChecking ? (
                          <div className="py-8 text-center text-xs text-slate-400 font-bold">Recalculating safety filters...</div>
                        ) : safetyCheckResult ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase">Patient Status:</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${safetyCheckResult.isSafe ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                {safetyCheckResult.isSafe ? "✅ Clear of Major Flags" : "⚠️ High Alert Contraindicated"}
                              </span>
                            </div>

                            {safetyCheckResult.warnings?.map((warn: string, i: number) => (
                              <div key={i} className="flex gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-rose-300 font-bold leading-relaxed">
                                <AlertOctagon className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                                <span>{warn}</span>
                              </div>
                            ))}

                            {safetyCheckResult.warnings?.length === 0 && (
                              <div className="flex gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-bold">
                                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>All medication choices are safe and compliant for this patient profile.</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 py-4 text-center">Active medication list is empty.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* REAL-TIME PRESCRIPTION DRAFTING & DRUG INTERACTION ALERT WORKBENCH */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    {/* WORKBENCH HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Zap className="h-5 w-5" />
                          </span>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                              Real-Time Drug Interaction & Prescription Guard
                              <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                Live Engine Active
                              </span>
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              Continuous cross-audit between drafted orders and Patient Chronic EMR History
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* SUMMARY BADGES & MATRIX TOGGLE */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-150 text-[10px] font-black">
                          <button
                            onClick={() => setInteractionFilter("ALL")}
                            className={`px-2.5 py-1 rounded-lg border-0 cursor-pointer transition-all ${
                              interactionFilter === "ALL" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            All ({activeInteractionAlerts.length})
                          </button>
                          <button
                            onClick={() => setInteractionFilter("CRITICAL")}
                            className={`px-2.5 py-1 rounded-lg border-0 cursor-pointer transition-all flex items-center gap-1 ${
                              interactionFilter === "CRITICAL"
                                ? "bg-rose-600 text-white shadow"
                                : activeInteractionAlerts.filter((a) => a.severity === "CRITICAL").length > 0
                                ? "bg-rose-100 text-rose-700 animate-pulse"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <span>🔴 Critical</span>
                            <span className="bg-white/20 px-1 rounded text-[9px]">
                              {activeInteractionAlerts.filter((a) => a.severity === "CRITICAL").length}
                            </span>
                          </button>
                          <button
                            onClick={() => setInteractionFilter("MODERATE")}
                            className={`px-2.5 py-1 rounded-lg border-0 cursor-pointer transition-all ${
                              interactionFilter === "MODERATE" ? "bg-amber-600 text-white shadow" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <span>🟠 Moderate</span>
                            <span className="bg-white/20 px-1 rounded text-[9px]">
                              {activeInteractionAlerts.filter((a) => a.severity === "MODERATE").length}
                            </span>
                          </button>
                        </div>

                        <button
                          onClick={() => setShowInteractionMatrix(!showInteractionMatrix)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                            showInteractionMatrix
                              ? "bg-indigo-900 text-white border-indigo-900 shadow"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <Grid className="h-3.5 w-3.5" />
                          <span>{showInteractionMatrix ? "List View" : "Interaction Matrix"}</span>
                        </button>
                      </div>
                    </div>

                    {/* PATIENT EMR CHRONIC MEDICATIONS BANNER */}
                    <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-amber-400 shrink-0" />
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Patient Chronic EMR Baseline (Cross-Interaction Target)
                          </span>
                          <span className="text-xs font-bold text-amber-300">
                            {activeHomeMeds.map((h) => `${h.name} ${h.dosage} (${h.frequency})`).join(" • ") || "No Chronic Meds Recorded"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-mono border border-slate-700">
                        Patient ID: {copilotPatientId || "PAT-001"}
                      </span>
                    </div>

                    {/* REAL-TIME INTERACTION ALERT FEED OR MATRIX VIEW */}
                    {showInteractionMatrix ? (
                      /* PAIRWISE INTERACTION MATRIX GRID */
                      <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <h5 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Grid className="h-4 w-4 text-indigo-400" />
                            Pairwise Drug-Drug Interaction Grid
                          </h5>
                          <span className="text-[9px] text-slate-400">Comparing Drafted Meds vs Patient EMR History</span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                                <th className="p-2">Medication</th>
                                {[...draftMeds.map((d) => d.name), ...activeHomeMeds.map((h) => `${h.name} (EMR)`)].map((mName, idx) => (
                                  <th key={idx} className="p-2 font-black text-slate-300 truncate max-w-[100px]">{mName}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {draftMeds.map((rowMed, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                                  <td className="p-2 font-black text-indigo-300">{rowMed.name} <span className="text-[9px] text-slate-500 font-normal">({rowMed.source})</span></td>
                                  {[...draftMeds.map((d) => d.name), ...activeHomeMeds.map((h) => `${h.name} (EMR)`)].map((colMedName, colIdx) => {
                                    const alertMatch = activeInteractionAlerts.find(
                                      (a) =>
                                        (a.drugA.toLowerCase().includes(rowMed.name.toLowerCase()) && colMedName.toLowerCase().includes(a.drugB.toLowerCase())) ||
                                        (a.drugB.toLowerCase().includes(rowMed.name.toLowerCase()) && colMedName.toLowerCase().includes(a.drugA.toLowerCase()))
                                    );

                                    const isSelf = rowMed.name.toLowerCase() === colMedName.toLowerCase().replace(" (emr)", "");

                                    return (
                                      <td key={colIdx} className="p-2 text-center">
                                        {isSelf ? (
                                          <span className="text-slate-600">-</span>
                                        ) : alertMatch ? (
                                          <span
                                            title={`${alertMatch.severity}: ${alertMatch.riskDescription}`}
                                            className={`inline-flex items-center justify-center p-1 rounded-lg text-[10px] font-black cursor-pointer ${
                                              alertMatch.severity === "CRITICAL"
                                                ? "bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse"
                                                : alertMatch.severity === "MODERATE"
                                                ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                                                : "bg-yellow-500/30 text-yellow-300 border border-yellow-500/50"
                                            }`}
                                          >
                                            {alertMatch.severity === "CRITICAL" ? "🔴 FAIL" : alertMatch.severity === "MODERATE" ? "🟠 WARN" : "🟡 NOTE"}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                                            <Check className="h-3 w-3" /> Safe
                                          </span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      /* ACTIVE INTERACTION ALERTS LIST FEED */
                      <div className="space-y-3">
                        {activeInteractionAlerts.filter((a) => interactionFilter === "ALL" || a.severity === interactionFilter).length > 0 ? (
                          activeInteractionAlerts
                            .filter((a) => interactionFilter === "ALL" || a.severity === interactionFilter)
                            .map((alert) => (
                              <div
                                key={alert.id}
                                className={`p-4 rounded-2xl border transition-all space-y-3 animate-fadeIn ${
                                  alert.severity === "CRITICAL"
                                    ? "bg-rose-50/80 border-rose-200 shadow-sm"
                                    : alert.severity === "MODERATE"
                                    ? "bg-amber-50/80 border-amber-200"
                                    : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                {/* ALERT HEADER */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                        alert.severity === "CRITICAL"
                                          ? "bg-rose-600 text-white animate-pulse"
                                          : alert.severity === "MODERATE"
                                          ? "bg-amber-600 text-white"
                                          : "bg-yellow-600 text-white"
                                      }`}
                                    >
                                      <AlertTriangle className="h-3 w-3" />
                                      {alert.severity} DRUG INTERACTION
                                    </span>
                                    <h5 className="text-xs font-black text-slate-800">
                                      {alert.drugA} <span className="text-rose-500 font-extrabold">⚡</span> {alert.drugB}{" "}
                                      {alert.isDrugBHome && <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">(Patient Chronic EMR)</span>}
                                    </h5>
                                  </div>
                                </div>

                                {/* MECHANISM & RISK */}
                                <div className="grid md:grid-cols-2 gap-3 text-xs">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Pharmacological Mechanism</span>
                                    <p className="text-slate-700 font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-black/5">
                                      {alert.mechanism}
                                    </p>
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 block">Clinical Risk & Hazard Outcome</span>
                                    <p className="text-rose-900 font-bold leading-relaxed bg-rose-100/60 p-2.5 rounded-xl border border-rose-200/50">
                                      ⚠️ {alert.riskDescription}
                                    </p>
                                  </div>
                                </div>

                                {/* ACTION & ONE-CLICK SUBSTITUTION */}
                                <div className="pt-2 border-t border-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                  <div className="text-xs text-slate-600 font-medium">
                                    <strong className="text-slate-800">Recommendation:</strong> {alert.clinicalAction}
                                  </div>

                                  {alert.suggestedSubstitution && (
                                    <button
                                      onClick={() => handleApplySubstitution(alert)}
                                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow transition-all border-0 cursor-pointer shrink-0 flex items-center gap-1.5"
                                    >
                                      <Zap className="h-3.5 w-3.5 text-yellow-300" />
                                      <span>
                                        Replace {alert.suggestedSubstitution.targetDrugName} with {alert.suggestedSubstitution.replacementName}{" "}
                                        {alert.suggestedSubstitution.replacementDosage}
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                            <span>
                              Prescription Clear! No active drug-drug interactions detected between drafted orders and patient chronic home medications.
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DRAFTED PRESCRIPTION LIST & ADD DRUG WORKBENCH */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill className="h-4 w-4 text-indigo-600" />
                          Active Drafted Prescription Orders ({draftMeds.length})
                        </h5>
                        <span className="text-[10px] text-slate-400 font-bold">Modifications automatically trigger real-time interaction updates</span>
                      </div>

                      {/* DRAFT MEDICATION CARDS */}
                      <div className="grid md:grid-cols-2 gap-3">
                        {draftMeds.map((med) => (
                          <div
                            key={med.id}
                            className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-md transition-all space-y-2 relative group"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-sm font-black text-slate-800">{med.name}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                    {med.dosage}
                                  </span>
                                  <span className="text-[9px] font-black text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                                    {med.source}
                                  </span>
                                  {med.brand && <span className="text-[9px] text-slate-400 font-bold">• {med.brand}</span>}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleFetchEvidence(med.name)}
                                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 text-xs font-bold border-0 cursor-pointer"
                                  title="View Clinical Evidence"
                                >
                                  <BookOpen className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveDraftMed(med.id)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 text-xs font-bold border-0 cursor-pointer"
                                  title="Remove Drug"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 font-bold border-t border-slate-150/60 pt-2">
                              <span>🕒 Frequency: {med.frequency}</span>
                              <span>📅 Duration: {med.duration}</span>
                            </div>
                          </div>
                        ))}

                        {draftMeds.length === 0 && (
                          <div className="col-span-2 p-6 rounded-2xl bg-slate-50 text-center border border-dashed border-slate-200 text-xs text-slate-400">
                            No medications in draft prescription. Add a drug below or select a test scenario above.
                          </div>
                        )}
                      </div>

                      {/* QUICK-ADD PRESET TEST CHIPS */}
                      <div className="p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100 space-y-2">
                        <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                          ⚡ Test Real-Time Interaction Triggers (Quick-Add Clinical Meds):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: "Aspirin", dosage: "75mg", trigger: "Warfarin Bleeding Risk 🔴" },
                            { name: "Ibuprofen", dosage: "400mg", trigger: "Warfarin Bleeding Risk 🔴" },
                            { name: "Spironolactone", dosage: "25mg", trigger: "Telmisartan K+ Risk 🔴" },
                            { name: "Omeprazole", dosage: "20mg", trigger: "Clopidogrel CYP2C19 🟠" },
                            { name: "Nitroglycerin", dosage: "2.6mg", trigger: "Sildenafil Hypotension 🔴" },
                            { name: "Paracetamol", dosage: "650mg", trigger: "Safe Analgesic 🟢" },
                            { name: "Pantoprazole", dosage: "40mg", trigger: "Safe PPI 🟢" },
                            { name: "Rosuvastatin", dosage: "10mg", trigger: "Safe Statin 🟢" }
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAddDraftMed(item.name, item.dosage, "1-0-1", "7 days")}
                              className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-slate-700 text-[10px] font-black border border-slate-200 transition-all cursor-pointer shadow-sm flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>{item.name} {item.dosage}</span>
                              <span className="text-[8px] opacity-75">({item.trigger})</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ADD CUSTOM DRUG INPUT FORM */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                          Draft Additional Prescription Order:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <input
                            type="text"
                            value={newDraftName}
                            onChange={(e) => setNewDraftName(e.target.value)}
                            placeholder="Drug generic or brand name (e.g. Warfarin, Aspirin, Pantoprazole)..."
                            className="sm:col-span-5 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={newDraftDosage}
                            onChange={(e) => setNewDraftDosage(e.target.value)}
                            placeholder="Dosage (e.g. 500mg)"
                            className="sm:col-span-2 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={newDraftFreq}
                            onChange={(e) => setNewDraftFreq(e.target.value)}
                            placeholder="Freq (e.g. 1-0-1)"
                            className="sm:col-span-3 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
                          />
                          <button
                            onClick={() => handleAddDraftMed()}
                            disabled={!newDraftName.trim()}
                            className="sm:col-span-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all border-0 shadow cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Drug</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* EVIDENCE MODAL CARD DRAWNER */}
                    {activeEvidenceMed && evidenceCache[activeEvidenceMed] && (
                      <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3 animate-fadeIn relative">
                        <button
                          onClick={() => setActiveEvidenceMed(null)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold border-0 bg-transparent cursor-pointer"
                        >
                          ✕ Close
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-indigo-500 text-white rounded-lg text-xs font-black">Evidence Engine</span>
                          <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            Clinical Trust Audit: {activeEvidenceMed}
                          </h5>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Guideline Rationale</span>
                            <p className="text-slate-700 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                              {evidenceCache[activeEvidenceMed].rationale}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Official Practice Guideline</span>
                            <p className="text-indigo-800 font-extrabold bg-white p-2.5 rounded-xl border border-indigo-100">
                              📘 {evidenceCache[activeEvidenceMed].guideline}
                            </p>
                            <span className="text-[9px] font-black text-slate-400 uppercase block mt-2">Corroborating Studies</span>
                            <p className="text-slate-500 font-medium bg-white p-2.5 rounded-xl border border-slate-100">
                              🔬 {evidenceCache[activeEvidenceMed].referral_study}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-xs pt-2 border-t border-indigo-100">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-rose-500 uppercase block">Contraindications:</span>
                            <ul className="list-disc list-inside text-slate-600 font-medium space-y-0.5">
                              {evidenceCache[activeEvidenceMed].contraindications?.map((c, idx) => (
                                <li key={idx}>{c}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-amber-600 uppercase block">Allergy Warnings:</span>
                            <p className="text-slate-600 font-medium">
                              {evidenceCache[activeEvidenceMed].allergy_alert}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM SECONDARY BENTO: INVESTIGATIONS AND MULTILINGUAL PATIENT DIRECTIVES */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* RECOMMENDED INVESTIGATIONS */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-3">
                        <Activity className="h-4 w-4 text-rose-500 animate-pulse" />
                        Diagnostic Investigations
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {copilotResult.investigations?.map((inv: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-2xl bg-rose-50/20 border border-rose-50 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-slate-800">{inv.name}</span>
                              <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                {inv.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-semibold">Reasoning: {inv.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PATIENT CARE INSTRUCTIONS & WHATSAPP DISPATCH */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="h-4 w-4 text-indigo-500" />
                          Discharge & Care Guidelines
                        </h4>

                        {/* LANGUAGE TOGGLE */}
                        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[9px] font-black">
                          {(["en", "hi", "mr", "gu"] as const).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setCopilotLang(lang)}
                              className={`px-2 py-0.5 rounded cursor-pointer border-0 uppercase transition-all ${
                                copilotLang === lang ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      <ul className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs text-slate-600 font-medium list-disc list-inside leading-relaxed">
                        {copilotResult.patientInstructions?.map((ins: string, idx: number) => (
                          <li key={idx} className="p-2 bg-slate-50 rounded-xl border border-slate-100 block flex items-start gap-2">
                            <span className="text-indigo-600 font-bold shrink-0">🔹</span>
                            <span>
                              {copilotLang === "hi" 
                                ? `दवाई निर्देश ${idx + 1}: ${ins}` 
                                : copilotLang === "mr" 
                                  ? `औषध सूचना ${idx + 1}: ${ins}` 
                                  : copilotLang === "gu" 
                                    ? `દવા સૂચના ${idx + 1}: ${ins}` 
                                    : ins}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-t border-slate-150 pt-2.5">
                        <span>Follow Up Interval: <strong className="text-indigo-600">{copilotResult.followUpDays || 14} days</strong></span>
                        <button
                          onClick={() => setSuccessMsg(`📲 Patient instructions dispatched via WhatsApp to ${activeTwin?.patientName || "Patient"} in ${copilotLang === "hi" ? "Hindi" : copilotLang === "mr" ? "Marathi" : copilotLang === "gu" ? "Gujarati" : "English"}!`)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black border-0 cursor-pointer shadow transition-all flex items-center gap-1"
                        >
                          <Share2 className="h-3 w-3" />
                          <span>WhatsApp Dispatch</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 1B. CONTROL, SOVEREIGNTY, & LEARNING APPROVALS CENTER */}
      {intelTab === "approvals" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* LEFT: PENDING MACHINE LEARNING PROPOSALS */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-800">🧠 Autonomous AI Learning Board</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Approvals dashboard preventing algorithmic over-fitting or hallucinated medical rules
                  </p>
                </div>
              </div>

              {isApprovalsLoading ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold animate-pulse">Scanning background EHR streams for patterns...</div>
              ) : proposals.filter(p => p.status === "pending").length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase">System Fully Synced</h4>
                  <p className="text-[11px] text-slate-400 font-medium">All active clinician clinical templates have been verified and approved.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {proposals.filter(p => p.status === "pending").map((prop) => (
                    <div key={prop.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-4 hover:border-indigo-400 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full tracking-wide">
                          {prop.patternType.replace("_", " ")}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-slate-400">Confidence:</span>
                          <span className="text-xs font-black text-emerald-600">{prop.confidence}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-3 text-xs">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Target Trigger</span>
                          <span className="font-extrabold text-slate-800">{prop.diagnosis}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Follow Up habit</span>
                          <span className="font-extrabold text-slate-800">{prop.proposedPattern.followUpDays} Days</span>
                        </div>
                      </div>

                      {prop.proposedPattern.preferredMedicines?.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Learned Preferred Medications:</span>
                          <div className="space-y-1">
                            {prop.proposedPattern.preferredMedicines.map((med, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] font-bold bg-white p-2 rounded-xl border border-slate-100">
                                <span className="text-slate-800">{med.name} ({med.brand})</span>
                                <span className="text-indigo-600">{med.dosage} | {med.frequency}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {prop.proposedPattern.writingStyle && (
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Custom Instructions / Tone:</span>
                          <p className="text-[11px] text-slate-600 italic mt-0.5">"{prop.proposedPattern.writingStyle}"</p>
                        </div>
                      )}

                      {/* EXPLAINABILITY ENGINE BLOCK */}
                      <div className="p-3 rounded-xl bg-indigo-50/20 border border-indigo-50 text-[11px] leading-relaxed text-slate-600 space-y-1">
                        <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">Clinical Rationale (Explainability Layer)</span>
                        <p className="font-medium">"{prop.rationale}"</p>
                      </div>

                      {/* ACTIONS */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => handleDismissProposal(prop.id)}
                          className="py-2.5 rounded-xl border border-rose-200 hover:border-rose-400 text-rose-600 bg-white hover:bg-rose-50 text-[11px] font-black transition-all cursor-pointer"
                        >
                          ❌ Dismiss Pattern
                        </button>
                        <button
                          onClick={() => handleApproveProposal(prop.id)}
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 border-0 text-white text-[11px] font-black transition-all cursor-pointer"
                        >
                          ✅ Approve & Sync
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: CLINICIAN MEMORIES LIST (DOCTOR CONTROL & DATA SOBERANITY) */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-800">🛡️ Clinician Preference Sovereignty</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Your preferences are entirely yours. View, download, modify, or erase doctor-memory loops.
                  </p>
                </div>
                
                {/* TOOLBAR BUTTONS */}
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={handleExportPreferences}
                    className="text-[10px] font-black px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all border-0 cursor-pointer flex items-center gap-1"
                    title="Export backup"
                  >
                    <Download className="h-3 w-3" /> Export JSON
                  </button>
                  <button
                    onClick={handleResetMemories}
                    className="text-[10px] font-black px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-all border-0 cursor-pointer flex items-center gap-1"
                    title="Erase memories"
                  >
                    ✕ Reset All
                  </button>
                </div>
              </div>

              {/* LIST AND EDITOR */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {memoryList.map((mem) => {
                  const isEditing = editingMemoryId === mem.id;
                  return (
                    <div key={mem.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-3 hover:border-indigo-400 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Diagnosis Trigger Target</span>
                          <span className="text-sm font-black text-slate-800">{mem.diagnosis}</span>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          {!isEditing ? (
                            <>
                              <button
                                onClick={() => handleStartEditMemory(mem)}
                                className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded px-2 py-1 cursor-pointer transition-all"
                              >
                                Edit Trigger
                              </button>
                              <button
                                onClick={() => handleDeleteMemory(mem.id)}
                                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded px-2 py-1 cursor-pointer transition-all"
                              >
                                Untrain
                              </button>
                            </>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingMemoryId(null)}
                                className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded px-2 py-1 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateMemory(mem.id)}
                                className="text-[10px] font-black text-white bg-indigo-600 rounded px-2 py-1 cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* INLINE EDIT MODE */}
                      {isEditing ? (
                        <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Follow Up Days:</span>
                            <input
                              type="number"
                              value={editFollowUp}
                              onChange={(e) => setEditFollowUp(e.target.value)}
                              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Writing Style Instruction:</span>
                            <input
                              type="text"
                              value={editStyle}
                              onChange={(e) => setEditStyle(e.target.value)}
                              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Preferred Medicines:</span>
                            {editMeds.map((med, medIdx) => (
                              <div key={medIdx} className="grid grid-cols-3 gap-1 bg-white p-2 rounded-xl border border-slate-150">
                                <input
                                  type="text"
                                  value={med.name}
                                  onChange={(e) => {
                                    const copy = [...editMeds];
                                    copy[medIdx].name = e.target.value;
                                    setEditMeds(copy);
                                  }}
                                  className="p-1 rounded bg-slate-50 border border-slate-200 text-[10px] font-bold"
                                  placeholder="Medicine"
                                />
                                <input
                                  type="text"
                                  value={med.dosage}
                                  onChange={(e) => {
                                    const copy = [...editMeds];
                                    copy[medIdx].dosage = e.target.value;
                                    setEditMeds(copy);
                                  }}
                                  className="p-1 rounded bg-slate-50 border border-slate-200 text-[10px] font-bold"
                                  placeholder="Dosage"
                                />
                                <input
                                  type="text"
                                  value={med.frequency}
                                  onChange={(e) => {
                                    const copy = [...editMeds];
                                    copy[medIdx].frequency = e.target.value;
                                    setEditMeds(copy);
                                  }}
                                  className="p-1 rounded bg-slate-50 border border-slate-200 text-[10px] font-bold"
                                  placeholder="Frequency"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* DISPLAY MODE */
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-4 text-slate-500 font-bold bg-slate-100/40 p-2 rounded-xl">
                            <span>🕒 Follow up: {mem.followUpDays} Days</span>
                            <span>✍️ Style: {mem.writingStyle || "Standard format"}</span>
                          </div>

                          <div className="space-y-1">
                            {mem.preferredMedicines?.map((med, medIdx) => (
                              <div key={medIdx} className="flex justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-150 text-[11px] font-bold">
                                <span className="text-slate-800">{med.name} ({med.brand})</span>
                                <span className="text-indigo-600">{med.dosage} — {med.frequency}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 1. AI DOCTOR MEMORY */}
      {intelTab === "memory" && (
        <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* LEFT: MEMORIES LIST */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">🏥 Active Prescription Memories</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  AI tracks and memorizes medication preferences and writing styles per clinician
                </p>
              </div>
              <button
                onClick={() => setIsAddingMemory(!isAddingMemory)}
                className="text-xs font-black px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all border-0 cursor-pointer flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Train Pattern
              </button>
            </div>

            <div className="space-y-4">
              {memoryList.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-4 hover:border-indigo-400 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block tracking-wide uppercase">Diagnosis Trigger</span>
                      <span className="text-sm font-black text-slate-800">{m.diagnosis}</span>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100 uppercase tracking-wider">
                      Learned Pattern
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Recalled Therapeutics Preference</span>
                    <div className="grid grid-cols-1 gap-2">
                      {m.preferredMedicines.map((med, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-150 text-xs">
                          <div>
                            <span className="font-extrabold text-slate-800 block">{med.name} <span className="text-slate-400">({med.brand})</span></span>
                            <span className="text-[10px] text-slate-500 font-bold">{med.dosage} • {med.frequency} • {med.duration}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-indigo-600 font-black block">{med.confidence}% Match</span>
                            <span className="text-[9px] text-slate-400 font-medium">Confidence Score</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-150">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Signature Prescription Style</span>
                      <span className="font-semibold text-slate-700 block italic">"{m.writingStyle}"</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Default Re-assessment Period</span>
                      <span className="font-bold text-slate-700 block">{m.followUpDays} Days follow-up recommended</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: LEARN / TRAINING PANEL */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-800">🧑‍🏫 Pattern Synthesizer</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Explicitly inject or train the doctor assistant on localized medication behaviors
              </p>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">Diagnosis Condition Name</label>
                <input 
                  type="text" 
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder="e.g., Acute Migraine, GERD, Osteoarthritis"
                  className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div className="space-y-1.5 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50 space-y-3">
                <span className="text-xs font-black text-indigo-900 block">Add Medicine Preference:</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Molecule (e.g. Paracetamol)" 
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Brand (e.g. Calpol)" 
                    value={newMedBrand}
                    onChange={(e) => setNewMedBrand(e.target.value)}
                    className="text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="text" 
                    placeholder="Dose (500mg)" 
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Frequency" 
                    value={newMedFreq}
                    onChange={(e) => setNewMedFreq(e.target.value)}
                    className="text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Duration" 
                    value={newMedDur}
                    onChange={(e) => setNewMedDur(e.target.value)}
                    className="text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddTempMed}
                  className="w-full text-xs font-black py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all border-0"
                >
                  + Add Medication To List
                </button>

                {tempMeds.length > 0 && (
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100 text-xs font-bold divide-y divide-slate-100">
                    {tempMeds.map((t, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between text-[11px] text-slate-700">
                        <span>{t.name} ({t.brand}) • {t.dosage}</span>
                        <span className="text-slate-400">{t.frequency}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">Personal Prescription Signature Style Tips</label>
                <input 
                  type="text" 
                  value={newStyle}
                  onChange={(e) => setNewStyle(e.target.value)}
                  placeholder="e.g. Advise daily fiber, suggest warm fluids, append walk goal"
                  className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">Recommended Follow-up interval (days)</label>
                <select 
                  value={newFollowUp}
                  onChange={(e) => setNewFollowUp(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                >
                  <option value="3">3 Days</option>
                  <option value="7">7 Days</option>
                  <option value="14">14 Days (Two Weeks)</option>
                  <option value="30">30 Days (One Month)</option>
                  <option value="90">90 Days (Three Months)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full text-xs font-black py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all border-0 shadow-md cursor-pointer"
              >
                💾 Compile & Save Learned Behavioral Pattern
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. DIGITAL TWIN OF PATIENT */}
      {intelTab === "twin" && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fadeIn">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800">🧬 Digital Twin Clinical Simulation Sandbox</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Review complete medical histories, risk trend evaluations, and forecasted recovery vectors
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Select Patient Target:</span>
              <select
                value={selectedTwinPatientId}
                onChange={(e) => setSelectedTwinPatientId(e.target.value)}
                className="text-xs font-black p-2 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isTwinLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Synchronizing Patient Health State Twin...</span>
            </div>
          ) : activeTwin ? (
            <div className="grid lg:grid-cols-12 gap-6">
              
              {/* DIAL HEALTH SCORE & RISKS */}
              <div className="lg:col-span-4 bg-slate-50 p-6 rounded-3xl border border-slate-150 space-y-6">
                
                {/* HEALTH SCORE GRAPHICAL SIMULATOR */}
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI-Assessed Health Index</span>
                  
                  <div className="relative inline-flex items-center justify-center">
                    {/* Dial Styling */}
                    <div className="h-32 w-32 rounded-full border-4 border-slate-200 flex items-center justify-center relative">
                      <div className="absolute inset-2 rounded-full border-4 border-indigo-500/30 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-800">{activeTwin.healthScore}</span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase">SCORE</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black border uppercase tracking-wider ${
                      activeTwin.healthScore > 80 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : activeTwin.healthScore > 70 
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100" 
                          : "bg-red-50 text-red-700 border-red-100"
                    }`}>
                      {activeTwin.healthScore > 80 ? "Stable/Optimized" : activeTwin.healthScore > 70 ? "Moderate Vigilance" : "Critical Vigilance"}
                    </span>
                  </div>
                </div>

                {/* RISK FACTOR CHIPS */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary Surveillance Risk Factors</span>
                  
                  <div className="space-y-3">
                    {activeTwin.riskFactors.map((r, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-150 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-800">{r.name}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            r.level === "High" ? "bg-red-50 text-red-600 border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>{r.level} Risk</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{r.description}</p>
                        <div className="pt-1 text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                          Trend Tracker: 
                          <span className={`font-extrabold ${
                            r.trend === "increasing" ? "text-red-500" : r.trend === "stable" ? "text-slate-500" : "text-emerald-500"
                          }`}>
                            {r.trend === "increasing" ? "↗ INCREASING LOAD" : r.trend === "stable" ? "→ STABLE RESERVE" : "↘ DECREASING LOAD"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* TIMELINE DEEP DIVE */}
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Chronological Longitudinal Health Record</span>
                  
                  <div className="space-y-4 relative border-l-2 border-slate-100 pl-4 ml-2">
                    {activeTwin.timeline.map((t) => (
                      <div key={t.id} className="relative space-y-1.5">
                        <div className="absolute -left-[23px] top-1.5 bg-white border-2 border-indigo-500 rounded-full h-3.5 w-3.5 flex items-center justify-center">
                          <div className="bg-indigo-500 h-1.5 w-1.5 rounded-full"></div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[9px] uppercase border border-indigo-100">{t.type}</span>
                            <span>{t.date}</span>
                          </div>
                          <span>{t.locationName}</span>
                        </div>

                        <div className="bg-slate-50/50 hover:bg-slate-50 p-3 rounded-2xl border border-slate-150 transition-all">
                          <h4 className="text-xs font-extrabold text-slate-800">{t.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">{t.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/20 border border-indigo-100/50 text-xs leading-relaxed space-y-2">
                  <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-indigo-500" /> Digital Twin AI Outcome Projection Model
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeTwin.predictedOutcomes.map((p, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-150 space-y-2 text-[11px]">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="font-extrabold text-slate-800">{p.treatment}</span>
                          <span className="text-emerald-600 font-black">{p.probability}% Success</span>
                        </div>
                        <div className="text-slate-500 font-semibold">Expected Resolution: <span className="text-slate-800 font-black">{p.expectedDays} Days</span></div>
                        
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Clinical Warnings</span>
                          <ul className="list-disc pl-3.5 space-y-0.5 text-slate-600 text-[10px]">
                            {p.risks.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center text-slate-400 py-10">No data loaded. Select a patient above to sync twin.</div>
          )}
        </div>
      )}

      {/* 3. TREATMENT OUTCOME PREDICTOR */}
      {intelTab === "predictor" && (
        <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* PLAYGROUND FORM (LEFT) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-800">🔮 Outcome Forecasting Playground</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Evaluate prospective patient success rates under active pharmacological changes
              </p>
            </div>

            <form onSubmit={handlePredictOutcome} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">Patient Registry Subject</label>
                <select
                  value={predPatientId}
                  onChange={(e) => setPredPatientId(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 bg-slate-50"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">Target Clinical Diagnosis</label>
                <input 
                  type="text" 
                  value={predDiagnosis}
                  onChange={(e) => setPredDiagnosis(e.target.value)}
                  placeholder="e.g. Essential Hypertension Stage I"
                  className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">Proposed Pharmacological Plan & Dosage Regime</label>
                <textarea 
                  rows={4}
                  value={predTreatmentPlan}
                  onChange={(e) => setPredTreatmentPlan(e.target.value)}
                  placeholder="e.g. Initiate Telmisartan 40mg OD with Metformin 500mg BD. Advise 2g sodium diet threshold and biometric BP tracking."
                  className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:border-indigo-500 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isPredicting}
                className="w-full text-xs font-black py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl transition-all border-0 shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Cpu className={`h-4 w-4 ${isPredicting ? "animate-spin" : ""}`} />
                {isPredicting ? "Computing Forecast..." : "🔮 Execute AI Predictive Evaluation"}
              </button>
            </form>
          </div>

          {/* SIMULATED RESULTS (RIGHT) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            {predictionResult ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-black text-slate-800">📊 Forensic Predictive Outcomes</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Results calculated using matched multi-tenant outcomes and clinical indicators
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Success Index</span>
                    <span className="text-2xl font-black text-emerald-600 mt-1 block">{predictionResult.recovery_probability}%</span>
                    <span className="text-[9px] text-slate-400 font-bold">Recovery Chance</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Avg Timeline</span>
                    <span className="text-2xl font-black text-indigo-600 mt-1 block">{predictionResult.expected_days} Days</span>
                    <span className="text-[9px] text-slate-400 font-bold">To Resolution</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Confidence</span>
                    <span className="text-xs font-black text-slate-800 mt-2.5 block">{predictionResult.confidence}</span>
                    <span className="text-[9px] text-slate-400 font-bold">Precision Grade</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Cohort Pool</span>
                    <span className="text-2xl font-black text-amber-600 mt-1 block">{predictionResult.similar_cases}</span>
                    <span className="text-[9px] text-slate-400 font-bold">Matched Cases</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Potential Clinical Liability Risk Factors</span>
                    <div className="space-y-2">
                      {predictionResult.risk_factors.map((r: string, idx: number) => (
                        <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 bg-red-50/30 p-3 rounded-xl border border-red-100">
                          <AlertOctagon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI Clinical Decision Support System Recommendations</span>
                    <div className="space-y-2">
                      {predictionResult.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 bg-indigo-50/20 p-3 rounded-xl border border-indigo-100">
                          <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 my-auto">
                <Cpu className="h-12 w-12 text-slate-300 animate-pulse" />
                <div>
                  <h4 className="text-sm font-extrabold text-slate-700">Predictive Intelligence Sandbox Idle</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Fill the clinical evaluation playground on the left side and hit run to initiate predictive outcome forecasting.
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-wider">
              <span>Model Reference: CURA-Predictor-v2.9</span>
              <span>Updated: Real-time</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. REVENUE LEAK DETECTOR */}
      {intelTab === "leak" && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800">💸 Autonomous Revenue Leak Audit Log</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Audit and secure lost revenue from unbilled procedures, missed disposables, and diagnostic discrepancies
              </p>
            </div>
            
            <button
              onClick={fetchRevenueLeaks}
              className="text-xs font-black px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border-0 cursor-pointer"
            >
              🔄 Recalculate Leaks
            </button>
          </div>

          {isLeaksLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
              <span className="text-xs text-slate-400 font-bold uppercase">Scanning department invoices for leakage...</span>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">Total Identified Leakage</span>
                  <span className="text-2xl font-black text-red-700 mt-1 block">
                    ₹{revenueLeaks.filter(l => l.status === "pending").reduce((acc, curr) => acc + curr.estimatedLeakAmount, 0).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-red-500 font-medium block mt-1">
                    {revenueLeaks.filter(l => l.status === "pending").length} active anomalies pending securement
                  </span>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">Recovered Revenue</span>
                  <span className="text-2xl font-black text-emerald-700 mt-1 block">
                    ₹{revenueLeaks.filter(l => l.status === "resolved").reduce((acc, curr) => acc + curr.estimatedLeakAmount, 0).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-emerald-500 font-medium block mt-1">
                    {revenueLeaks.filter(l => l.status === "resolved").length} audits resolved and posted to invoices
                  </span>
                </div>

                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">Recovery Efficiency</span>
                  <span className="text-2xl font-black text-indigo-700 mt-1 block">
                    {Math.round(
                      (revenueLeaks.filter(l => l.status === "resolved").length / 
                      (revenueLeaks.length || 1)) * 100
                    )}%
                  </span>
                  <span className="text-[9px] text-indigo-500 font-medium block mt-1">
                    Automatic clinical system tracking active across all departments
                  </span>
                </div>
              </div>

              {/* TABLE LIST */}
              <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-inner">
                <table className="w-full text-left border-collapse text-xs font-medium text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Identified Date</th>
                      <th className="p-4">Patient ID & Name</th>
                      <th className="p-4">Leakage Profile</th>
                      <th className="p-4">Origin Dept</th>
                      <th className="p-4 text-right">Leakage Amount</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {revenueLeaks.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono text-[11px] text-slate-400">{l.date}</td>
                        <td className="p-4">
                          <span className="font-extrabold text-slate-800 block">{l.patientName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{l.patientId}</span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <span className="font-bold text-red-600 text-[10px] uppercase block tracking-wider">{l.leakType}</span>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{l.description}</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase text-slate-600 border border-slate-150">
                            {l.sourceDepartment}
                          </span>
                        </td>
                        <td className="p-4 text-right font-black text-slate-800">₹{l.estimatedLeakAmount.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            l.status === "pending" 
                              ? "bg-amber-50 text-amber-700 border-amber-100" 
                              : l.status === "resolved" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {l.status === "pending" ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleResolveLeak(l.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-lg transition-all border-0 shadow cursor-pointer"
                              >
                                Collect & Bill
                              </button>
                              <button
                                onClick={() => handleIgnoreLeak(l.id)}
                                className="px-2 py-1 bg-slate-150 hover:bg-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded-lg transition-all border-0 cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold italic">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      )}

      {/* 5. VOICE CALL RECEPTIONIST BOT */}
      {intelTab === "voice" && (
        <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* CALL LOGS PANEL (LEFT) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">🎙️ Autonomous VoIP Log Feed</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  AI Voice assistant managing receptionist duties 24/7
                </p>
              </div>
              <button
                onClick={handleSimulateCall}
                disabled={isSimulatingCall}
                className="text-xs font-black px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all border-0 shadow cursor-pointer"
              >
                + Simulate Inbound Call
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {voiceCalls.map((vc) => (
                <div 
                  key={vc.id} 
                  onClick={() => setSelectedCall(vc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2.5 ${
                    selectedCall?.id === vc.id 
                      ? "border-indigo-500 bg-indigo-50/20" 
                      : "border-slate-150 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">{vc.patientName}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">{vc.phone}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{vc.duration}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-black uppercase border border-indigo-200">
                      🎯 {vc.intent}
                    </span>
                    <span className="text-emerald-600 font-black flex items-center gap-0.5 uppercase tracking-wide">
                      😊 {vc.sentiment}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic truncate">
                    "{vc.summary}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE TRANSCRIPT / AUDIO PLAYBACK (RIGHT) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            {selectedCall ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-black text-slate-800">🔊 VoIP Transcript & Outcome Audit</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 font-mono">
                      Session Reference ID: {selectedCall.id} • {new Date(selectedCall.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Call Processed
                  </div>
                </div>

                {/* VISUALIZER WAVEFORM SIMULATOR */}
                <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-center relative overflow-hidden">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-4">Autonomous Voice Activity Waveform</span>
                  <div className="flex items-center justify-center gap-1 h-12">
                    {[3, 8, 5, 12, 16, 11, 4, 9, 14, 18, 12, 7, 5, 9, 15, 11, 4, 3].map((height, idx) => (
                      <div 
                        key={idx} 
                        style={{ height: `${height * 2.2}px` }}
                        className="w-1.5 bg-indigo-500 rounded-full animate-pulse shrink-0"
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block mt-4">VoIP Audio Stream: G.711 codec synchronized • 8kHz Mono</span>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Conversational Transcript Feed</span>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 font-mono text-[11px] leading-relaxed max-h-[250px] overflow-y-auto space-y-3">
                    {selectedCall.transcript.split("\n").map((line, idx) => {
                      const isAi = line.startsWith("AI:");
                      return (
                        <div key={idx} className={isAi ? "text-indigo-700" : "text-slate-700"}>
                          <span className="font-extrabold">{isAi ? "🤖 " : "👤 "}{line.split(":")[0]}:</span>
                          <span>{line.substring(line.indexOf(":") + 1)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs space-y-1">
                  <span className="font-extrabold text-slate-800 block">AI Resolution Summary:</span>
                  <p className="text-slate-600 font-medium leading-relaxed italic">{selectedCall.summary}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-20 my-auto">
                No active call log selected. Click a log on the left side to review logs.
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-wider">
              <span>VoIP Driver: Asterisk + Twilio Voice Connector</span>
              <span>Latency: 145ms</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. AI APP MARKETPLACE */}
      {intelTab === "marketplace" && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800">🛍️ CURA Enterprise AI Application Marketplace</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Install advanced diagnostic plugins and clinical safety algorithms directly from accredited developers
              </p>
            </div>
            
            <div className="text-xs font-black px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 flex items-center gap-1.5">
              <span>Platform Cut: 20% Royalty sharing enabled</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketplaceApps.map((app) => (
              <div 
                key={app.id} 
                className="bg-slate-50 rounded-3xl border border-slate-150 p-5 space-y-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-2xl select-none">
                      {app.logoUrl}
                    </div>
                    <span className="text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-indigo-100">
                      {app.category}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-800">{app.name}</h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">By {app.provider}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wide text-[9px]">SaaS Fee</span>
                    <span className="text-slate-800">₹{app.priceMonthly.toLocaleString()}/mo</span>
                  </div>

                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wide text-[9px]">Installs</span>
                    <span className="text-slate-800">{app.installsCount} clinics</span>
                  </div>

                  <button
                    onClick={() => handleToggleMarketplaceApp(app.id)}
                    className={`w-full text-xs font-black py-2.5 rounded-xl transition-all border-0 cursor-pointer uppercase ${
                      app.status === "Active" 
                        ? "bg-red-50 text-red-600 hover:bg-red-100" 
                        : app.status === "Inactive" 
                          ? "bg-slate-900 text-white hover:bg-slate-800 shadow"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-150 cursor-not-allowed"
                    }`}
                  >
                    {app.status === "Active" ? "Uninstall App" : app.status === "Inactive" ? "Install App" : "Authorize Client"}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 7. POPULATION HEALTH INTELLIGENCE */}
      {intelTab === "population" && (
        <div className="space-y-6 animate-fadeIn">
          {/* HEADER HERO */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600 animate-bounce" />
                  <span>Population Health Intelligence Platform</span>
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Real-time city-wide epidemiologic analysis & clinic analytics
                </p>
              </div>

              {/* REGION SWITCHER */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500 uppercase">Region:</span>
                <select 
                  value={popRegion}
                  onChange={(e) => {
                    setPopRegion(e.target.value);
                    setIsPopLoading(true);
                    setTimeout(() => setIsPopLoading(false), 500);
                  }}
                  className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Delhi NCR">Delhi NCR (Nodal Region)</option>
                  <option value="Mumbai Metropolitan">Mumbai Metropolitan</option>
                  <option value="Bengaluru Urban">Bengaluru Urban</option>
                  <option value="Chennai Central">Chennai Central</option>
                  <option value="Kolkata East">Kolkata East</option>
                </select>
              </div>
            </div>

            {/* INTRO PARAGRAPH */}
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Consolidates public health streams, municipal lab reports, sewage viral loads, and anonymized clinic encounters across CURA's regional network. Providing clinics, hospitals, and medical authorities with live predictive guidance.
            </p>
          </div>

          {isPopLoading ? (
            <div className="bg-white p-20 rounded-3xl text-center text-slate-400 font-mono">
              <span className="inline-block animate-spin mr-2">⏳</span> Loading Regional Epidemiological Datasets...
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-6">
              
              {/* METRICS GRID & ALERTS (LEFT 7 COLS) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 4 STATS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">📈 Diabetes Trend</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-800">14.2%</span>
                      <span className="text-xs font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded">+2.1% YoY</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-medium">Metformin consumption up by 18%</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">🦟 Dengue Hotspots</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-800">3 Active Zones</span>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">High Risk</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-medium">Monsoon sewage PCR detects heavy viral load</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">💉 Vaccination Coverage</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-800">89.4%</span>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+1.4% Target</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-medium">Pediatric MMR booster dose rollout</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">🌡️ Seasonal Illness</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-800">Influenza A</span>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Spiking Now</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-medium">Outbreak peaking; Tamiflu supplies alert</span>
                  </div>
                </div>

                {/* DETAILED ACTIVE EPIDEMIOLOGIC MAP */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">🌍 Regional Outbreak Heatmap Monitor</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Anonymized GPS clustering of diagnostic reports</p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 font-bold">UPDATED: JUST NOW</span>
                  </div>

                  {/* VISUAL MOCK MAP */}
                  <div className="bg-slate-50 h-56 rounded-2xl border border-slate-150 p-4 relative overflow-hidden flex flex-col justify-between">
                    {/* Visual markers simulating GPS coordinates */}
                    <div className="absolute top-1/4 left-1/3 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center animate-ping" />
                    <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow shadow-red-800 flex items-center justify-center text-[7px] text-white font-bold">1</div>
                    
                    <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center" />
                    <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow shadow-amber-800 flex items-center justify-center text-[7px] text-white font-bold">2</div>

                    <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center" />
                    <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow flex items-center justify-center text-[7px] text-white font-bold">3</div>

                    {/* MAP GRID BACKGROUND */}
                    <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-10 pointer-events-none">
                      {Array.from({ length: 72 }).map((_, i) => (
                        <div key={i} className="border border-slate-900" />
                      ))}
                    </div>

                    <div className="z-10 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200/80 shadow-sm max-w-xs self-start">
                      <span className="text-[10px] font-black text-slate-800 uppercase block mb-1">Active Cluster Selected: South Zone</span>
                      <div className="space-y-1 text-[10px] text-slate-600 font-medium">
                        <div>• Dengue cases identified in last 48h: <span className="font-bold text-red-600">14 cases</span></div>
                        <div>• Municipal water containment: <span className="font-bold text-amber-600">Action Suggested</span></div>
                        <div>• Diagnostic source: <span className="font-bold text-indigo-600">CURA Lab South Delhi</span></div>
                      </div>
                    </div>

                    <div className="z-10 flex justify-between items-center bg-slate-900/90 text-white px-3 py-1.5 rounded-xl text-[9px] font-mono">
                      <span>Coordinates cluster accuracy: 99.4% (Differential privacy enabled)</span>
                      <span className="text-emerald-400">● LIVE RECOGNITION ACTIVE</span>
                    </div>
                  </div>

                  {/* CLINICAL OUTBREAK ACTIONS */}
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-black text-indigo-900 block">📢 Trigger Preventive Health Broadcast</span>
                      <p className="text-[10px] text-indigo-700 font-medium">Automated WhatsApp alert to patients in affected zones about Dengue precautions.</p>
                    </div>
                    <button 
                      onClick={() => setSuccessMsg("WhatsApp public prevention broadcast initiated for South Delhi NCR patients.")}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-xl transition-all border-0 shadow cursor-pointer whitespace-nowrap"
                    >
                      Broadcast Alert
                    </button>
                  </div>
                </div>

              </div>

              {/* CLINIC BUSINESS ADVISOR & RULE OF 10 CUSTOMERS (RIGHT 5 COLS) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. CLINIC BUSINESS ADVISOR */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <BarChart2 className="h-4 w-4 text-emerald-600" />
                        <span>AI Business Advisor for Clinics</span>
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Daily clinic leak & revenue optimization</p>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-black border border-emerald-100">89/100 Health</span>
                  </div>

                  <div className="space-y-3">
                    {/* LEAK 1 */}
                    <div className="p-3.5 bg-red-50/50 rounded-xl border border-red-100 space-y-1">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-red-900">📉 Slot Optimization Needed</span>
                        <span className="text-red-700">₹14,500/wk Leak</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        OPD slot booking down 18% in afternoon slots (2-4 PM). Suggest triggering dynamic happy-hour dental wellness notifications.
                      </p>
                    </div>

                    {/* LEAK 2 */}
                    <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-amber-900">💊 Pharmacy Inventory Wastage</span>
                        <span className="text-amber-700">64 Strips Expiring</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Amoxicillin 500mg batches expiring in 35 days. Recommend bundling with respiratory consults.
                      </p>
                    </div>

                    {/* LEAK 3 */}
                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-emerald-900">📈 Highest Yield Recommendation</span>
                        <span className="text-emerald-700">+12% OPD Growth</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Cardio-health diagnostic panels are currently high demand. Adding a diagnostic bundle will yield ₹45,000 extra per doctor.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSuccessMsg("Optimized clinic scheduling and triggered smart campaign to fill afternoon OPD slots.");
                    }}
                    className="w-full text-xs font-black py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all border-0 shadow cursor-pointer uppercase tracking-wider"
                  >
                    ⚡ Apply Optimization Strategies
                  </button>
                </div>

                {/* 2. RULE OF 10 CUSTOMERS VALIDATION ENGINE */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-md text-white space-y-5">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-[9px] font-mono text-indigo-400 font-black uppercase tracking-widest block">Execution Framework</span>
                    <h4 className="text-sm font-black text-slate-100 mt-1">📊 Rule of 10 Customers Analyzer</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Validate custom features with 10 doctors before prioritizing</p>
                  </div>

                  <div className="space-y-4 text-xs font-medium text-slate-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-indigo-300 block">Feature / Idea Proposal</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Remote Wearable Heart Monitor Sync"
                        defaultValue="Universal Health ID QR Quick Sync"
                        id="proposal-input"
                        className="w-full bg-slate-900 border border-slate-800 text-white font-bold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-indigo-300 block">Doctors indicating "Would Pay" (out of 10)</label>
                      <select 
                        id="pay-input"
                        defaultValue="8"
                        className="w-full bg-slate-900 border border-slate-800 text-white font-bold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="10">10 Doctors - Ultra high demand (100%)</option>
                        <option value="9">9 Doctors - High demand (90%)</option>
                        <option value="8">8 Doctors - Extremely strong (80%)</option>
                        <option value="7">7 Doctors - Deserves P0 build (70%)</option>
                        <option value="5">5 Doctors - Moderate backlog (50%)</option>
                        <option value="3">3 Doctors - low validation (30%)</option>
                        <option value="1">1 Doctor - Reject proposal (10%)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        const inputEl = document.getElementById("proposal-input") as HTMLInputElement;
                        const payEl = document.getElementById("pay-input") as HTMLSelectElement;
                        const score = parseInt(payEl.value);
                        const isHigh = score >= 7;
                        setSuccessMsg(`Validation Results for "${inputEl.value || "Universal Health ID QR Quick Sync"}": Priority: ${isHigh ? "🥇 HIGH PRIORITY (P0)" : "🥉 BACKLOG"}. Confidence score: ${score}/10 doctors say they would pay. Proceeding with ${isHigh ? "Immediate Roadmap Insertion" : "Backlog archiving"}.`);
                      }}
                      className="w-full text-xs font-black py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all border-0 cursor-pointer uppercase tracking-wider shadow"
                    >
                      Run 10-Doctor Validation Analysis
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* 8. HEALTHCARE AUTOMATION BUILDER */}
      {intelTab === "automation" && (
        <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* FLOW GRAPH BUILDER (LEFT 7 COLS) */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-indigo-600" />
                  <span>Interactive Care Automation Builder</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Visual healthcare logic flow (No-Code Zapier for healthcare)
                </p>
              </div>
              <button
                onClick={handleRunAutomation}
                disabled={isAutomationRunning}
                className="text-xs font-black px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all border-0 shadow cursor-pointer uppercase tracking-wider"
              >
                {isAutomationRunning ? "⚡ Running workflow..." : "⚡ Run Workflow"}
              </button>
            </div>

            {/* FLOW NODES GRAPH */}
            <div className="space-y-5 relative">
              {workflowNodes.map((node, index) => (
                <div key={node.id} className="relative">
                  {/* Connective Line */}
                  {index < workflowNodes.length - 1 && (
                    <div className="absolute top-12 left-10 w-0.5 h-10 bg-slate-200 z-0 border-dashed border-r border-slate-300" />
                  )}

                  <div className="relative z-10 flex items-start gap-4 p-4 rounded-2xl border border-slate-150 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                    {/* Node Number Dot */}
                    <div className="h-12 w-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-xs font-mono font-black text-slate-500">Node {index + 1}</span>
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-800 block">{node.title}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black ${
                          node.type === "trigger" ? "bg-red-50 text-red-600 border border-red-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        }`}>
                          {node.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        {node.desc}
                      </p>
                    </div>

                    {/* Active Checkbox toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Active</span>
                      <input 
                        type="checkbox" 
                        defaultChecked={node.active}
                        className="rounded accent-indigo-600 cursor-pointer h-4 w-4"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-150 pt-5 space-y-3">
              <span className="text-xs font-black text-slate-700 block">➕ Add Automated Care Action Node</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button 
                  onClick={() => {
                    const id = (workflowNodes.length + 1).toString();
                    setWorkflowNodes(prev => [
                      ...prev, 
                      { id, type: "action", title: "📝 Update EHR Care Plan", active: true, desc: "Saves medication updates back to FHIR storage" }
                    ]);
                    setSuccessMsg("Added automation node: Update EHR Care Plan.");
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-black rounded-xl transition-all border border-slate-200 cursor-pointer"
                >
                  + EHR update Action
                </button>
                <button 
                  onClick={() => {
                    const id = (workflowNodes.length + 1).toString();
                    setWorkflowNodes(prev => [
                      ...prev, 
                      { id, type: "action", title: "📧 Patient Email Kit", active: true, desc: "Send comprehensive wellness handbook" }
                    ]);
                    setSuccessMsg("Added automation node: Patient Email Kit.");
                  }}
                  className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black rounded-xl transition-all border border-indigo-100 cursor-pointer"
                >
                  + Email Kit action
                </button>
              </div>
            </div>
          </div>

          {/* SIMULATED LOG TERMINAL (RIGHT 5 COLS) */}
          <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-md text-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-slate-100">💻 Care Automation Compiler Console</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Debugging state logs in real-time</p>
                </div>
                {isAutomationRunning && (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                )}
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto font-mono text-[10px] leading-relaxed">
                {automationLogs.length > 0 ? (
                  automationLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`p-1.5 rounded-lg ${
                        log.startsWith("✓") 
                          ? "text-emerald-400 bg-emerald-950/20" 
                          : "text-slate-300"
                      }`}
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-16">
                    Click "⚡ Run Workflow" to compile and execute the automation sequence.
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 mt-6 text-[10px] text-slate-400 font-mono flex justify-between items-center">
              <span>Status: {isAutomationRunning ? "Running" : "Idle"}</span>
              <span>Integrations: EHR, Twilio WhatsApp, GCal</span>
            </div>
          </div>

        </div>
      )}

      {/* 9. MULTI-AGENT AI HUB */}
      {intelTab === "agents" && (
        <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* SPECIALIZED AGENTS GRID (LEFT 7 COLS) */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span>Specialized Multi-Agent AI Network</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Cooperative agents executing clinic operations in harmony
                </p>
              </div>
              <button
                onClick={handleSimulateAgents}
                disabled={isAgentSimulating}
                className="text-xs font-black px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all border-0 shadow cursor-pointer uppercase tracking-wider"
              >
                {isAgentSimulating ? "🤝 Agents Synchronizing..." : "🤝 Simulate Patient Journey"}
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Instead of one flat chatbot, CURA operates a team of high-fidelity agents. They pass structured state messages (FHIR payloads, billing rules, inventory catalogs) to collaboratively triage, diagnose, authorize billing, and release medication safely.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-150 bg-slate-50 space-y-2">
                <span className="text-xs font-black text-slate-800 block">📞 Reception & Triage AI</span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Handles inbound patient call transcripts, extracts symptoms, checks eligibility, and schedules slots based on clinician priority.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-150 bg-slate-50 space-y-2">
                <span className="text-xs font-black text-slate-800 block">🧠 Clinical Diagnosis AI</span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Cross-references patient complaints with official clinical guidelines, drug monographs, and matches ICD-11 & SNOMED CT terminology.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-150 bg-indigo-50/50 border-indigo-100 space-y-2">
                <span className="text-xs font-black text-indigo-900 block">💸 Billing & Insurance Pre-Auth AI</span>
                <p className="text-[11px] text-slate-600 font-medium">
                  Polls third-party insurance gateways, pre-authorizes codes, parses copays, and guarantees claim recovery without manual filing.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-150 bg-slate-50 space-y-2">
                <span className="text-xs font-black text-slate-800 block">💊 Pharmacy & Inventory Alert AI</span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Analyzes available stock counts, screens contraindications, checks expiration codes, and issues safe dispensing directives.
                </p>
              </div>
            </div>
          </div>

          {/* AGENT COOPERATIVE CHAT STREAM (RIGHT 5 COLS) */}
          <div className="lg:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-md text-slate-100 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-slate-100">🤝 Collaborative Sync Stream</h4>
                  <p className="text-[10px] text-indigo-400 font-mono">Agent-to-agent negotiation logs</p>
                </div>
                {isAgentSimulating && (
                  <span className="text-[10px] text-emerald-400 font-mono animate-pulse uppercase font-black">ACTIVE SIM</span>
                )}
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto">
                {agentLogs.length > 0 ? (
                  agentLogs.map((al, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 animate-fadeIn">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-extrabold text-indigo-300 uppercase tracking-wider">{al.agent}</span>
                        <span className="text-slate-500 font-mono">{al.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed font-mono">
                        {al.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-20 font-mono text-[11px]">
                    Click "Simulate Patient Journey" to initiate agent synchronization.
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 mt-6 text-[10px] text-slate-500 font-mono flex justify-between items-center">
              <span>Sync Protocol: gRPC + protobuf stream</span>
              <span>Agents: 5 Active</span>
            </div>
          </div>

        </div>
      )}

      {/* 10. AI SKIN ANALYZER PRO */}
      {intelTab === "skin" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDE: SCAN INPUTS */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-pink-600 animate-pulse" />
                  <h3 className="text-base font-black text-slate-800">Dermatology Image Captures</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Upload patient facial scans for real-time deep skin-barrier evaluation
                </p>
              </div>

              {/* TARGET PATIENT SELECT */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Select Patient Profile:</label>
                <select
                  value={skinPatientId}
                  onChange={(e) => {
                    setSkinPatientId(e.target.value);
                    setSkinResult(null);
                  }}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/50 focus:border-pink-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.age} y/o, {p.gender})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3-WAY MULTI-ANGLE IMAGE PREVIEWS */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Multi-Angle High-Res Photos:</span>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* Front Angle (Required) */}
                  <div className="space-y-1 text-center">
                    <span className="text-[9px] font-extrabold text-pink-600 uppercase tracking-widest block">Front (Req)</span>
                    <label className="group relative block aspect-[3/4] border-2 border-dashed border-slate-200 hover:border-pink-500 rounded-2xl cursor-pointer overflow-hidden transition-all bg-slate-50 flex flex-col justify-center items-center p-2">
                      {skinFrontImage ? (
                        <>
                          <img src={skinFrontImage} alt="Front View" className="w-full h-full object-cover rounded-xl" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSkinFrontImage(null);
                            }}
                            className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-red-600 text-white p-1 rounded-full border-0 transition-colors shadow-md flex items-center justify-center"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <Camera className="h-5 w-5 mx-auto text-slate-400 group-hover:text-pink-500 transition-colors" />
                          <span className="text-[9px] text-slate-400 group-hover:text-slate-600 font-extrabold block">Add Front</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setSkinFrontImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Left Angle (Optional) */}
                  <div className="space-y-1 text-center">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Left Side</span>
                    <label className="group relative block aspect-[3/4] border-2 border-dashed border-slate-200 hover:border-pink-500 rounded-2xl cursor-pointer overflow-hidden transition-all bg-slate-50 flex flex-col justify-center items-center p-2">
                      {skinLeftImage ? (
                        <>
                          <img src={skinLeftImage} alt="Left Profile" className="w-full h-full object-cover rounded-xl" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSkinLeftImage(null);
                            }}
                            className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-red-600 text-white p-1 rounded-full border-0 transition-colors shadow-md flex items-center justify-center"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <Camera className="h-5 w-5 mx-auto text-slate-400 group-hover:text-pink-500 transition-colors" />
                          <span className="text-[9px] text-slate-400 group-hover:text-slate-600 font-bold block">Optional</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setSkinLeftImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Right Angle (Optional) */}
                  <div className="space-y-1 text-center">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Right Side</span>
                    <label className="group relative block aspect-[3/4] border-2 border-dashed border-slate-200 hover:border-pink-500 rounded-2xl cursor-pointer overflow-hidden transition-all bg-slate-50 flex flex-col justify-center items-center p-2">
                      {skinRightImage ? (
                        <>
                          <img src={skinRightImage} alt="Right Profile" className="w-full h-full object-cover rounded-xl" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSkinRightImage(null);
                            }}
                            className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-red-600 text-white p-1 rounded-full border-0 transition-colors shadow-md flex items-center justify-center"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <Camera className="h-5 w-5 mx-auto text-slate-400 group-hover:text-pink-500 transition-colors" />
                          <span className="text-[9px] text-slate-400 group-hover:text-slate-600 font-bold block">Optional</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setSkinRightImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* SIMULATION PRESETS OR RE-SEED IMAGES */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-wider block">Quick-Scan Presets:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSkinFrontImage("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='300' height='400' fill='%23fce7f3'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' font-weight='bold' fill='%23db2777'>Front Face Scan Mock</text></svg>");
                      setSkinLeftImage("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='300' height='400' fill='%23fdf2f8'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23db2777'>Left Profile Mock</text></svg>");
                      setSkinRightImage(null);
                    }}
                    className="p-2 text-center rounded-xl border border-slate-150 bg-pink-50/40 hover:bg-pink-100/60 text-slate-700 text-[10px] transition-all cursor-pointer font-bold"
                  >
                    Load Sample Mockup Images
                  </button>

                  <button
                    onClick={() => {
                      setSkinFrontImage(null);
                      setSkinLeftImage(null);
                      setSkinRightImage(null);
                      setSkinResult(null);
                    }}
                    className="p-2 text-center rounded-xl border border-slate-150 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] transition-all cursor-pointer font-bold"
                  >
                    Clear All Photos
                  </button>
                </div>
              </div>

              {/* ANALYZE BUTTON */}
              <button
                onClick={handleAnalyzeSkin}
                disabled={isSkinLoading || !skinFrontImage}
                className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs tracking-wider transition-all border-0 shadow-lg cursor-pointer flex justify-center items-center gap-2"
              >
                {isSkinLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Analyzing Skin Barrier...</span>
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4" />
                    <span>🔬 INITIATE DERMAL EVALUATION</span>
                  </>
                )}
              </button>
            </div>

            {/* RIGHT SIDE: RESULTS / LIVE EVALUATION SUMMARY */}
            <div className="lg:col-span-7 space-y-6">
              {!skinResult ? (
                <div className="bg-slate-50 rounded-3xl p-12 text-center border border-dashed border-slate-200 h-full flex flex-col justify-center items-center space-y-3">
                  <Scan className="h-16 w-16 text-slate-300 animate-pulse" />
                  <h4 className="text-sm font-black text-slate-700 font-sans">Dermal Diagnostics Pending</h4>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    Select a patient, upload or generate front/profile images, and run the diagnostics. CURA will analyze skin hydration, pores, acne, pigmentation, and build a targeted care plan.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* METRIC HEADERS */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Skin Health Index</span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-black text-pink-600">{skinResult.skin_score}</span>
                        <span className="text-xs text-slate-400 font-bold">/100</span>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        skinResult.skin_score >= 80 ? "bg-emerald-50 text-emerald-600" :
                        skinResult.skin_score >= 60 ? "bg-amber-50 text-amber-600" :
                        "bg-red-50 text-red-600"
                      }`}>
                        {skinResult.skin_score >= 80 ? "Optimal Barrier" :
                         skinResult.skin_score >= 60 ? "Moderate Sebum" :
                         "Needs Treatment"}
                      </span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Skin Profile Class</span>
                      <div className="text-xl font-black text-slate-800 pt-1">
                        {skinResult.skin_type}
                      </div>
                      <span className="inline-block text-[9px] text-pink-500 font-extrabold uppercase tracking-wide">
                        pH Balanced Range
                      </span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center col-span-2 md:col-span-1 flex flex-col justify-center space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Severity Indicator</span>
                      <div className="text-sm font-bold text-slate-700">
                        {skinResult.has_issues ? "⚠️ Area Concerns Active" : "✅ Barrier Stable"}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">
                        Based on deep visual diagnostic
                      </span>
                    </div>
                  </div>

                  {/* MAIN FEEDBACK SECTION */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                    
                    {/* Clinical Summary */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-pink-500" />
                        Clinical Assessment Summary
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed bg-pink-50/20 p-4 rounded-2xl border border-pink-50/50 font-medium">
                        {skinResult.summary}
                      </p>
                    </div>

                    {/* Findings & Suggestions Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Left: Concerns */}
                      <div className="p-4 rounded-2xl bg-red-50/30 border border-red-100 space-y-2">
                        <span className="text-[11px] font-black text-red-800 flex items-center gap-1 uppercase tracking-wider">
                          ⚠️ Concerns Detected
                        </span>
                        <ul className="space-y-1.5 list-none pl-0 m-0">
                          {skinResult.concerns && skinResult.concerns.map((concern: string, idx: number) => (
                            <li key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-1.5">
                              <span className="text-red-500 font-bold mt-0.5">•</span>
                              <span>{concern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right: Recommendations */}
                      <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-2">
                        <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1 uppercase tracking-wider">
                          💚 Care Protocols Suggested
                        </span>
                        <ul className="space-y-1.5 list-none pl-0 m-0">
                          {skinResult.recommendations && skinResult.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* DIAGNOSTIC NOTICE */}
                    <div className="text-[10px] text-slate-400 font-mono flex justify-between items-center border-t border-slate-50 pt-3">
                      <span>Dermatology Engine: Gemini-3.5-Flash Multimodal</span>
                      <span>Scan ID: DSCN-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>

                  </div>

                </div>
              )}

              {/* HISTORICAL LOGS SECTION */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    📜 Skin Diagnostics History Logs
                  </span>
                  <span className="text-[10px] bg-pink-100 text-pink-700 font-extrabold px-2 py-0.5 rounded-full">
                    {skinHistory.length} Total Records
                  </span>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {isSkinHistoryLoading ? (
                    <div className="text-center text-slate-400 text-xs py-8">
                      Loading patient dermal logs...
                    </div>
                  ) : skinHistory.length > 0 ? (
                    skinHistory.map((sh: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 animate-fadeIn">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-pink-600">{sh.diagnosis}</span>
                          <span className="text-slate-400 font-mono">{sh.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">{sh.aiSummary}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sh.keyFindings && sh.keyFindings.map((kf: string, kIdx: number) => (
                            <span key={kIdx} className="bg-pink-100/40 text-pink-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              {kf}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 text-xs py-8 font-medium">
                      No previous diagnostics logged for this patient profile.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

