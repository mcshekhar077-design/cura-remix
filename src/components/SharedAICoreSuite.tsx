import React, { useState } from "react";
import {
  Brain,
  Sparkles,
  ShieldAlert,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Activity,
  Award,
  Layers,
  Database,
  Calendar,
  Zap,
  Sliders,
  TrendingUp,
  Stethoscope,
  Clock,
  FlaskConical,
  Eye,
  Camera,
  Tag,
  Dna,
  Heart,
  Users,
  Bot,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Download,
  Volume2,
  Apple,
  Lightbulb
} from "lucide-react";

export interface SharedAICoreSuiteProps {
  onBackToLanding?: () => void;
  initialSpecialty?: string;
}

// ============================================================
// AI CARE TEAM & COORDINATOR AGENT ARCHITECTURE TYPES & ENGINE
// ============================================================

export interface AgentEvaluation {
  agentId: string;
  agentName: string;
  specialty: string;
  findings: string;
  recommendations: string[];
  confidence: number;
  urgency: "low" | "moderate" | "high" | "critical";
}

export interface UnifiedCareTeamResponse {
  query: string;
  timestamp: string;
  coordinatorSummary: string;
  primarySpecialty: string;
  routedAgents: AgentEvaluation[];
  actionPlan: {
    category: "Medication & Safety" | "Vitals & Diagnostics" | "Diet & Lifestyle" | "Red Flags & Follow-up";
    item: string;
    sourceAgent: string;
  }[];
  overallConfidence: number;
  safetyDisclaimer: string;
}

// Specialized Agents Definition
const SPECIALIST_ROSTER = [
  {
    id: "cardiology",
    name: "Cardiology AI",
    specialty: "Cardiovascular Medicine",
    icon: Heart,
    avatarBg: "bg-rose-600",
    color: "text-rose-400",
    keywords: ["heart", "bp", "blood pressure", "chest pain", "ecg", "edema", "dyspnea", "palpitation", "hypertension", "hfref", "cad", "arrhythmia"],
    evaluate: (query: string, context?: any): AgentEvaluation => {
      const q = query.toLowerCase();
      let urgency: "low" | "moderate" | "high" | "critical" = "moderate";
      let findings = "Blood pressure and cardiac performance evaluated against ACC/AHA 2024 guidelines.";
      let recommendations = [
        "Maintain target blood pressure <130/80 mmHg.",
        "Monitor daily weight for fluid retention (>1.5kg in 48h)."
      ];

      if (q.includes("chest pain") || q.includes("troponin") || q.includes("basilar crackles")) {
        urgency = "high";
        findings = "Potential ischemic or congestive heart failure progression detected. Elevated cardiac risk parameters present.";
        recommendations = [
          "Urgent 12-lead ECG and serial high-sensitivity Troponin testing.",
          "Evaluate for NYHA Class III HFrEF and consider SGLT2i + ARNI optimization."
        ];
      } else if (q.includes("bp 154") || q.includes("hypertension")) {
        findings = "Stage 2 Essential Hypertension noted with sub-optimal blood pressure control.";
        recommendations = ["Titrate antihypertensive regimen under clinical supervision.", "Enforce low-sodium diet (<2.0g/day)."];
      }

      return {
        agentId: "cardiology",
        agentName: "Cardiology AI",
        specialty: "Cardiovascular Medicine",
        findings,
        recommendations,
        confidence: 0.96,
        urgency
      };
    }
  },
  {
    id: "neurology",
    name: "Neurology AI",
    specialty: "Neuro-Vascular & Brain Health",
    icon: Brain,
    avatarBg: "bg-cyan-600",
    color: "text-cyan-400",
    keywords: ["headache", "migraine", "dizziness", "numbness", "tingling", "seizure", "neuropathy", "brain", "stroke", "syncope", "occipital"],
    evaluate: (query: string, context?: any): AgentEvaluation => {
      const q = query.toLowerCase();
      let urgency: "low" | "moderate" | "high" | "critical" = "low";
      let findings = "Neurological symptom screening completed. No acute focal deficit reported.";
      let recommendations = [
        "Track headache frequency and potential environmental triggers.",
        "Ensure adequate hydration and regular sleep hygiene."
      ];

      if (q.includes("headache") || q.includes("occipital")) {
        urgency = "moderate";
        findings = "Vascular or hypertensive headache pattern identified. May correlate with elevated systemic blood pressure.";
        recommendations = [
          "Rule out hypertensive emergency with immediate BP re-check.",
          "Assess for neck stiffness, visual scotoma, or neurological deficit."
        ];
      } else if (q.includes("numbness") || q.includes("tingling") || q.includes("neuropathy")) {
        findings = "Peripheral sensory nerve involvement noted, common in metabolic or drug-induced etiologies.";
        recommendations = ["Perform monofilament sensory testing.", "Check Serum Vitamin B12 and HbA1c levels."];
      }

      return {
        agentId: "neurology",
        agentName: "Neurology AI",
        specialty: "Neuro-Vascular & Brain Health",
        findings,
        recommendations,
        confidence: 0.94,
        urgency
      };
    }
  },
  {
    id: "pharmacy",
    name: "Pharmacy AI",
    specialty: "Pharmacotherapy & Safety",
    icon: Pill,
    avatarBg: "bg-purple-600",
    color: "text-purple-400",
    keywords: ["medication", "drug", "lisinopril", "metformin", "sacubitril", "valsartan", "spironolactone", "interaction", "side effect", "dosage", "pill"],
    evaluate: (query: string, context?: any): AgentEvaluation => {
      const q = query.toLowerCase();
      let urgency: "low" | "moderate" | "high" | "critical" = "moderate";
      let findings = "Pharmacotherapy review completed for drug interactions, cytochrome P450 conflicts, and renal dosing.";
      let recommendations = [
        "Take prescribed medications at fixed daily schedules with food as directed.",
        "Avoid over-the-counter NSAIDs (e.g. Ibuprofen) which compromise renal autoregulation."
      ];

      if (q.includes("sacubitril") && q.includes("lisinopril")) {
        urgency = "critical";
        findings = "CRITICAL CONTRAINDICATION: Concomitant ARNI (Sacubitril/Valsartan) + ACEi (Lisinopril) poses severe angioedema risk!";
        recommendations = [
          "Discontinue ACE inhibitor immediately prior to starting ARNI.",
          "Mandatory 36-hour washout period required between Lisinopril and Sacubitril/Valsartan."
        ];
      } else if (q.includes("metformin") || q.includes("lisinopril")) {
        findings = "Dual regimen (Lisinopril + Metformin) is synergistically protective for diabetic nephropathy and hypertension.";
        recommendations = [
          "Monitor eGFR and Serum Creatinine every 3-6 months.",
          "Take Metformin with evening meal to minimize gastrointestinal distress."
        ];
      }

      return {
        agentId: "pharmacy",
        agentName: "Pharmacy AI",
        specialty: "Pharmacotherapy & Safety",
        findings,
        recommendations,
        confidence: 0.99,
        urgency
      };
    }
  },
  {
    id: "nutrition",
    name: "Nutrition & Metabolic AI",
    specialty: "Metabolic & Clinical Dietetics",
    icon: Apple,
    avatarBg: "bg-emerald-600",
    color: "text-emerald-400",
    keywords: ["hba1c", "diabetes", "sugar", "glucose", "diet", "food", "calorie", "weight", "cholesterol", "post-meal", "glycemic", "fatigue"],
    evaluate: (query: string, context?: any): AgentEvaluation => {
      const q = query.toLowerCase();
      let urgency: "low" | "moderate" | "high" | "critical" = "low";
      let findings = "Metabolic & nutritional analysis performed against ADA 2026 Diabetes Standards of Care.";
      let recommendations = [
        "Aim for glycemic control with low-glycemic index dietary choices.",
        "Integrate 150 minutes of moderate aerobic physical activity per week."
      ];

      if (q.includes("hba1c 6.6") || q.includes("pre-diabetes") || q.includes("post-meal")) {
        urgency = "moderate";
        findings = "HbA1c 6.6% indicates early Stage 2 Diabetes / Impaired Glucose Tolerance with post-prandial glycemic variability.";
        recommendations = [
          "Implement post-meal light 15-minute walking protocol to dampen post-prandial spikes.",
          "Pair dietary carbohydrates with 20-25g dietary protein and soluble fiber."
        ];
      }

      return {
        agentId: "nutrition",
        agentName: "Nutrition & Metabolic AI",
        specialty: "Metabolic & Clinical Dietetics",
        findings,
        recommendations,
        confidence: 0.95,
        urgency
      };
    }
  },
  {
    id: "oncology",
    name: "Oncology AI",
    specialty: "Oncology & Precision Genomics",
    icon: Dna,
    avatarBg: "bg-indigo-600",
    color: "text-indigo-400",
    keywords: ["cancer", "tumor", "chemo", "olaparib", "brca", "biopsy", "histology", "carcinoma", "nct", "radiation", "oncology"],
    evaluate: (query: string, context?: any): AgentEvaluation => {
      const q = query.toLowerCase();
      let urgency: "low" | "moderate" | "high" | "critical" = "low";
      let findings = "Oncology & genomic biomarker evaluation executed against NCCN guidelines.";
      let recommendations = [
        "Review molecular profiling results with attending Medical Oncologist.",
        "Monitor complete blood counts (CBC) for therapy-related cytopenias."
      ];

      if (q.includes("brca") || q.includes("olaparib") || q.includes("carcinoma")) {
        urgency = "moderate";
        findings = "Targeted PARP inhibitor / precision biomarker therapy identified. High eligibility for clinical trial matching.";
        recommendations = [
          "Check germline BRCA1/2 mutation status.",
          "Screen for fatigue and mild peripheral sensory neuropathy."
        ];
      }

      return {
        agentId: "oncology",
        agentName: "Oncology AI",
        specialty: "Oncology & Precision Genomics",
        findings,
        recommendations,
        confidence: 0.93,
        urgency
      };
    }
  },
  {
    id: "general",
    name: "General Medicine AI",
    specialty: "Primary Care & Triage",
    icon: Stethoscope,
    avatarBg: "bg-teal-600",
    color: "text-teal-400",
    keywords: ["fever", "cough", "fatigue", "general", "symptom", "checkup", "vitals", "wellness", "pain"],
    evaluate: (query: string, context?: any): AgentEvaluation => {
      return {
        agentId: "general",
        agentName: "General Medicine AI",
        specialty: "Primary Care & Triage",
        findings: "Primary care symptom triage completed. Vitals baseline and general organ system risk reviewed.",
        recommendations: [
          "Maintain routine follow-up with Primary Care Physician every 3-6 months.",
          "Ensure up-to-date vaccinations (Influenza, Pneumococcal, COVID-19 booster)."
        ],
        confidence: 0.97,
        urgency: "low"
      };
    }
  }
];

// Coordinator Agent Engine Class
class CoordinatorAgent {
  public static processQuery(query: string, patientContext?: any): UnifiedCareTeamResponse {
    const qLower = query.toLowerCase();
    
    // Determine which specialized agents should be routed
    const routedAgents: AgentEvaluation[] = [];
    
    // Always include General Medicine
    routedAgents.push(SPECIALIST_ROSTER.find(a => a.id === "general")!.evaluate(query, patientContext));

    // Check keyword matches for specialized roster
    SPECIALIST_ROSTER.forEach(agent => {
      if (agent.id === "general") return;
      const matches = agent.keywords.some(kw => qLower.includes(kw));
      if (matches) {
        routedAgents.push(agent.evaluate(query, patientContext));
      }
    });

    // Determine primary specialty
    const primaryAgent = routedAgents.find(a => a.urgency === "critical" || a.urgency === "high") || routedAgents[1] || routedAgents[0];

    // Build consolidated action plan
    const actionPlan: UnifiedCareTeamResponse["actionPlan"] = [];

    routedAgents.forEach(agent => {
      agent.recommendations.forEach(rec => {
        let cat: UnifiedCareTeamResponse["actionPlan"][number]["category"] = "Vitals & Diagnostics";
        if (agent.agentId === "pharmacy" || rec.toLowerCase().includes("medication") || rec.toLowerCase().includes("dose") || rec.toLowerCase().includes("pill")) {
          cat = "Medication & Safety";
        } else if (agent.agentId === "nutrition" || rec.toLowerCase().includes("diet") || rec.toLowerCase().includes("walk") || rec.toLowerCase().includes("food")) {
          cat = "Diet & Lifestyle";
        } else if (agent.urgency === "high" || agent.urgency === "critical" || rec.toLowerCase().includes("urgent") || rec.toLowerCase().includes("immediately")) {
          cat = "Red Flags & Follow-up";
        }

        actionPlan.push({
          category: cat,
          item: rec,
          sourceAgent: agent.agentName
        });
      });
    });

    // Formulate Coordinator Executive Synthesis
    const isCritical = routedAgents.some(a => a.urgency === "critical");
    const isHigh = routedAgents.some(a => a.urgency === "high");

    let coordinatorSummary = `Coordinator AI has analyzed your query across ${routedAgents.length} specialized clinical agents (${routedAgents.map(a => a.specialty).join(", ")}). `;
    
    if (isCritical) {
      coordinatorSummary += "⚠️ CRITICAL ALERT IDENTIFIED: A severe drug-drug interaction or urgent clinical risk requires immediate attention before continuing current regimen.";
    } else if (isHigh) {
      coordinatorSummary += "⚡ HIGH PRIORITY: Significant clinical findings detected. Accelerated specialist review and targeted diagnostic testing recommended.";
    } else {
      coordinatorSummary += "✅ Harmonized care plan generated. Your current clinical indicators demonstrate stable parameters with actionable guidance provided below.";
    }

    const avgConfidence = routedAgents.reduce((acc, a) => acc + a.confidence, 0) / routedAgents.length;

    return {
      query,
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      coordinatorSummary,
      primarySpecialty: primaryAgent.specialty,
      routedAgents,
      actionPlan,
      overallConfidence: parseFloat(avgConfidence.toFixed(2)),
      safetyDisclaimer: "This multi-agent AI synthesis provides clinical decision support. Always consult your attending physician before modifying prescribed drug regimens or initiating treatment."
    };
  }
}

export function SharedAICoreSuite({
  onBackToLanding,
  initialSpecialty = "cardiology"
}: SharedAICoreSuiteProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty);
  const [activeEngine, setActiveEngine] = useState<
    "care_team" | "scribe" | "diagnosis" | "drug" | "image" | "guideline" | "coding" | "followup" | "trials" | "router"
  >("care_team");

  // Care Team & Coordinator State
  const [coordinatorQueryInput, setCoordinatorQueryInput] = useState<string>(
    "Patient is a 58yo male with Stage 2 Hypertension (BP 154/92 mmHg) and HbA1c 6.6%, taking Lisinopril 10mg + Metformin 500mg. Complaining of severe occipital headache and bilateral ankle swelling over past 3 weeks."
  );
  const [isOrchestrating, setIsOrchestrating] = useState<boolean>(false);
  const [careTeamResponse, setCareTeamResponse] = useState<UnifiedCareTeamResponse | null>(() =>
    CoordinatorAgent.processQuery(
      "Patient is a 58yo male with Stage 2 Hypertension (BP 154/92 mmHg) and HbA1c 6.6%, taking Lisinopril 10mg + Metformin 500mg. Complaining of severe occipital headache and bilateral ankle swelling over past 3 weeks."
    )
  );

  // 1. Scribe Engine State
  const [transcriptInput, setTranscriptInput] = useState<string>(
    "Patient is a 58-year-old male presenting with progressive exertional dyspnea and bilateral ankle swelling over the past 3 weeks. BP is 154/92 mmHg, HR 88 bpm. Bilateral basilar crackles on auscultation. Echo shows LVEF 35% with anterior wall hypokinesis."
  );
  const [isGeneratingNote, setIsGeneratingNote] = useState<boolean>(false);
  const [generatedNote, setGeneratedNote] = useState({
    subjective: "58-year-old male with 3-week history of exertional dyspnea (NYHA Class III) and peripheral edema.",
    objective: "BP 154/92 mmHg, HR 88 bpm. Auscultation: Bilateral basilar crackles. Echocardiogram: LVEF 35%, anterior wall hypokinesis.",
    assessment: "1. Heart Failure with Reduced Ejection Fraction (HFrEF, LVEF 35%), likely ischemic etiology.\n2. Stage 2 Essential Hypertension.",
    plan: "1. Initiate Sacubitril/Valsartan 24/26mg BD + Empagliflozin 10mg OD + Furosemide 40mg OD.\n2. Coronary Angiography to evaluate CAD etiology.\n3. Daily weight logging & salt restriction (<2g/day)."
  });

  // 2. Differential Diagnosis State
  const [symptomInput, setSymptomInput] = useState<string>(
    "Acute chest pain radiating to left jaw, diaphoresis, shortness of breath, elevated Troponin I (2.4 ng/mL)"
  );
  const [diffResults, setDiffResults] = useState([
    {
      name: "Non-ST Elevation Myocardial Infarction (NSTEMI)",
      probability: "High (88%)",
      confidence: 0.92,
      reasoning: "Chest pain with troponin elevation without diagnostic ST elevation on ECG.",
      guideline: "ACC/AHA NSTEMI Guidelines 2024",
      tests: ["Emergency Coronary Angiography", "Serial Troponins", "Invasive Hemodynamic Monitoring"]
    },
    {
      name: "Acute Coronary Syndrome (Unstable Angina)",
      probability: "Moderate (12%)",
      confidence: 0.65,
      reasoning: "Ischemic symptoms at rest with dynamic T-wave inversions.",
      guideline: "ESC ACS Guidelines",
      tests: ["Stress Echocardiography", "CT Coronary Angiogram"]
    }
  ]);

  // 3. Drug Safety Checker State
  const [drugList, setDrugList] = useState<string>("Sacubitril/Valsartan, Spironolactone, Potassium Chloride, Lisinopril");
  const [drugSafetyReport, setDrugSafetyReport] = useState({
    isSafe: false,
    severity: "CRITICAL ALERT",
    alerts: [
      {
        type: "Contraindicated Combination",
        drug1: "Sacubitril/Valsartan",
        drug2: "Lisinopril",
        severity: "Severe High",
        detail: "Concomitant use of ACE inhibitors and ARNI causes severe risk of Angioedema. 36-hour washout period required!"
      },
      {
        type: "Hyperkalemia Risk",
        drug1: "Spironolactone",
        drug2: "Potassium Chloride",
        severity: "Moderate-High",
        detail: "Concomitant potassium sparing diuretic and K+ supplementation risks lethal hyperkalemia. Monitor Serum K+."
      }
    ]
  });

  // 4. Multimodal Image Analysis State
  const [imageType, setImageType] = useState<string>("Otoscopy / Fundus Copy");
  const [imageAnalysisOutput, setImageAnalysisOutput] = useState({
    classification: "Abnormal - Grade 2 Hypertensive Retinopathy",
    confidence: 0.94,
    findings: "Arteriolar narrowing, AV nicking present, flame-shaped hemorrhages in inferior nasal quadrant.",
    recommendations: "Tight blood pressure control (target <130/80 mmHg), follow-up fundus exam in 3 months."
  });

  // 5. Guideline Engine State
  const [guidelineCondition, setGuidelineCondition] = useState<string>("Heart Failure with Reduced Ejection Fraction (HFrEF)");
  const [guidelineOutput, setGuidelineOutput] = useState({
    guidelineName: "2024 AHA/ACC/HFSA Heart Failure Guidelines",
    evidenceLevel: "Class 1A (Strong Evidence)",
    quadrupleTherapy: [
      "1. ARNI (Sacubitril/Valsartan) over ACEi/ARB",
      "2. Beta-Blocker (Carvedilol, Metoprolol Succinate, or Bisoprolol)",
      "3. MRA (Spironolactone or Eplerenone)",
      "4. SGLT2 Inhibitor (Dapagliflozin or Empagliflozin)"
    ]
  });

  // 6. Clinical Coding Assistant State
  const [codingDiagnosis, setCodingDiagnosis] = useState<string>("Invasive Ductal Carcinoma of Right Breast, Stage IIB");
  const [icd10Results, setIcd10Results] = useState([
    { code: "C50.911", desc: "Malignant neoplasm of unspecified site of right female breast", category: "Primary ICD-10-CM" },
    { code: "Z85.3", desc: "Personal history of malignant neoplasm of breast", category: "Secondary / Historical" },
    { code: "CPT 96413", desc: "Chemotherapy administration, intravenous infusion technique; up to 1 hour", category: "Procedure CPT" }
  ]);

  // 7. Follow-up Planner State
  const [followupDays, setFollowupDays] = useState<number>(14);
  const [followupPlan, setFollowupPlan] = useState({
    nextVisitDate: "2026-08-08 (14 Days)",
    labsToRepeat: ["Serum Electrolytes (K+, Na+)", "Serum Creatinine & eGFR", "NT-proBNP"],
    redFlags: ["Sudden weight gain >2 kg in 48 hours", "Orthopnea / Paroxysmal Nocturnal Dyspnea", "Presyncope or Dizziness"]
  });

  // 8. Clinical Trial Matcher State
  const [trialQuery, setTrialQuery] = useState<string>("BRCA2 Mutant Breast Cancer PARP Inhibitor Adjuvant Trial");
  const [matchedTrials, setMatchedTrials] = useState([
    { nct: "NCT03155087", title: "OlympiA: Adjuvant Olaparib in Germline BRCA1/2 Mutation Breast Cancer", phase: "Phase III", status: "Active, Recruiting" },
    { nct: "NCT04332107", title: "Talazoparib Monotherapy vs Physician Choice in Locally Advanced Her2- Breast Cancer", phase: "Phase II", status: "Recruiting" }
  ]);

  const handleRunCoordinator = () => {
    if (!coordinatorQueryInput.trim()) return;
    setIsOrchestrating(true);
    setTimeout(() => {
      const res = CoordinatorAgent.processQuery(coordinatorQueryInput);
      setCareTeamResponse(res);
      setIsOrchestrating(false);
    }, 1000);
  };

  const handleSimulateScribe = () => {
    setIsGeneratingNote(true);
    setTimeout(() => {
      setIsGeneratingNote(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur border border-slate-800 p-5 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition cursor-pointer"
              >
                ← Back
              </button>
            )}
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 via-purple-600/20 to-indigo-600/20 border border-cyan-500/40 rounded-2xl">
              <Brain className="h-8 w-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  CURA Universal AI Clinical Core Engine
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full flex items-center gap-1">
                  <Bot className="h-3 w-3" /> AI Care Team Orchestrator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Coordinator Agent + Specialized Clinical Engines (Cardiology, Neurology, Pharmacy, Oncology, Nutrition & General Triage)
              </p>
            </div>
          </div>

          {/* Specialty Selector Dropdown */}
          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400">Target Specialty:</span>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-cyan-500"
            >
              <option value="cardiology">🫀 Cardiology AI</option>
              <option value="neurology">🧠 Neurology AI</option>
              <option value="pharmacy">💊 Pharmacy & Safety AI</option>
              <option value="oncology">🧬 Oncology AI</option>
              <option value="nutrition">🥗 Nutrition & Metabolic AI</option>
              <option value="emergency">🚑 Emergency & ICU AI</option>
              <option value="ent">👂 ENT & Audiology AI</option>
              <option value="pediatrics">👶 Pediatrics AI</option>
              <option value="dermatology">🔬 Dermatology AI</option>
            </select>
          </div>
        </div>

        {/* 10 Shared Engine Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "care_team", label: "👨‍⚕️ AI Care Team & Coordinator", icon: Users },
            { id: "scribe", label: "🎙️ AI Scribe Engine", icon: FileText },
            { id: "diagnosis", label: "🎯 Clinical Decision Support", icon: Brain },
            { id: "drug", label: "💊 Drug Safety & Interaction", icon: Pill },
            { id: "image", label: "📷 Multimodal Image Analyzer", icon: Camera },
            { id: "guideline", label: "📜 Guideline & Evidence Engine", icon: Award },
            { id: "coding", label: "🏷️ ICD-10 & CPT Assistant", icon: Tag },
            { id: "followup", label: "📅 AI Follow-up Planner", icon: Calendar },
            { id: "trials", label: "🧬 Clinical Trial Matcher", icon: Dna },
            { id: "router", label: "🛡️ AI Core Router & Safety", icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveEngine(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  activeEngine === tab.id
                    ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-purple-900/30 scale-[1.02]"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ENGINE 0: AI CARE TEAM & COORDINATOR AGENT */}
        {activeEngine === "care_team" && (
          <div className="space-y-6">
            {/* HERO & ARCHITECTURE BANNER */}
            <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/40 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/30 shrink-0">
                  <Users className="h-8 w-8 animate-pulse text-purple-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      CoordinatorAgent Architecture
                    </span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <Layers className="h-3 w-3" /> Unified Response Interface
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white mt-1">
                    AI Care Team — Multi-Agent Orchestration Engine
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                    Patients and doctors talk to 1 interface. The <strong>CoordinatorAgent</strong> evaluates intent, delegates patient queries to specialized clinical agents (Cardiology, Neurology, Pharmacy, Oncology, Nutrition), and outputs 1 unified synthesis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3.5 py-2 bg-slate-950/80 rounded-2xl border border-slate-800 text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Orchestrator Status</span>
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1 justify-end">
                    <Bot className="h-3.5 w-3.5 text-purple-400" /> 6 Agents Roster Active
                  </span>
                </div>
              </div>
            </div>

            {/* SPECIALIZED AGENT ROSTER GRID */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" /> Delegated Specialist Roster
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SPECIALIST_ROSTER.map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <div
                      key={agent.id}
                      className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 transition-all flex items-start gap-3"
                    >
                      <div className={`p-2.5 rounded-xl text-white ${agent.avatarBg} shrink-0 shadow-md`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-white">{agent.name}</h4>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Ready
                          </span>
                        </div>
                        <p className="text-[10px] text-purple-300 font-semibold">{agent.specialty}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-2">
                          Keywords: {agent.keywords.slice(0, 4).join(", ")}...
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INTERACTIVE COORDINATOR AGENT CONSULTATION PORTAL */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-400" />
                    CoordinatorAgent Live Consultation Portal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input a complex multi-specialty clinical query. The CoordinatorAgent automatically parses intent, delegates to specialists, and outputs a unified care plan.
                  </p>
                </div>

                {/* Preset Clinical Queries */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 sm:pt-0">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">Preset Scenarios:</span>
                  {[
                    "Hypertension + HbA1c 6.6% + Lisinopril/Metformin + Headache",
                    "Sacubitril/Valsartan + Lisinopril Angioedema Risk",
                    "BRCA2 Breast Cancer + Olaparib Trial + Diet Plan"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCoordinatorQueryInput(preset)}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-500/20 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer"
                    >
                      {preset.split(" ")[0]}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Query Input & Trigger */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Patient Query / Clinical Presentation</label>
                <div className="flex gap-2">
                  <textarea
                    value={coordinatorQueryInput}
                    onChange={(e) => setCoordinatorQueryInput(e.target.value)}
                    rows={3}
                    placeholder="Describe patient query, vitals, current medications, or symptoms..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-2xl p-3 text-xs font-medium placeholder-slate-500 outline-none transition-all"
                  />
                  <button
                    onClick={handleRunCoordinator}
                    disabled={isOrchestrating || !coordinatorQueryInput.trim()}
                    className="px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-purple-600/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isOrchestrating ? (
                      <>
                        <Zap className="h-5 w-5 animate-spin" />
                        <span>Orchestrating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Run Coordinator Agent</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* LIVE ORCHESTRATION PIPELINE VISUALIZER */}
              {isOrchestrating && (
                <div className="bg-purple-950/40 border border-purple-500/40 p-4 rounded-2xl space-y-3 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-black text-purple-300">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4 animate-spin text-purple-400" />
                      CoordinatorAgent Delegating Across Specialist Roster
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">Parsing clinical intent...</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="bg-slate-950 p-2 rounded-xl border border-purple-500/20 text-slate-300 font-bold flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-purple-400" /> 1. Query Decomposition
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-purple-500/20 text-slate-300 font-bold flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-rose-400" /> 2. Cardiology Evaluation
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-purple-500/20 text-slate-300 font-bold flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-purple-400" /> 3. Pharmacy Screening
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-purple-500/20 text-slate-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> 4. Unified Synthesis
                    </div>
                  </div>
                </div>
              )}

              {/* UNIFIED CARE TEAM RESPONSE DISPLAY */}
              {careTeamResponse && !isOrchestrating && (
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-5">
                  {/* Coordinator Executive Summary Header */}
                  <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-purple-400" />
                        <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider">
                          CoordinatorAgent Executive Synthesis
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {(careTeamResponse.overallConfidence * 100).toFixed(0)}% Overall Confidence
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {careTeamResponse.coordinatorSummary}
                    </p>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-purple-500/20 flex items-center justify-between">
                      <span>Primary Specialty Lead: <strong className="text-purple-300">{careTeamResponse.primarySpecialty}</strong></span>
                      <span>Evaluated: {careTeamResponse.timestamp}</span>
                    </div>
                  </div>

                  {/* Delegated Specialist Evaluations Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-400" /> Delegated Specialist Assessments ({careTeamResponse.routedAgents.length})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {careTeamResponse.routedAgents.map((agent) => (
                        <div
                          key={agent.agentId}
                          className={`p-4 rounded-2xl border space-y-2.5 ${
                            agent.urgency === "critical"
                              ? "bg-rose-950/40 border-rose-500/50 text-rose-200"
                              : agent.urgency === "high"
                              ? "bg-amber-950/40 border-amber-500/50 text-amber-200"
                              : "bg-slate-900/90 border-slate-800 text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs text-white">{agent.agentName}</span>
                              <span className="text-[9px] font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/20">
                                {agent.specialty}
                              </span>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              agent.urgency === "critical" ? "bg-rose-900 text-rose-100 border-rose-500" :
                              agent.urgency === "high" ? "bg-amber-900 text-amber-100 border-amber-500" :
                              "bg-slate-800 text-slate-300 border-slate-700"
                            }`}>
                              {agent.urgency} Priority
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {agent.findings}
                          </p>

                          <div className="pt-2 border-t border-slate-800 space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Specialist Recommendations:</span>
                            <ul className="space-y-1 text-[11px]">
                              {agent.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-slate-200">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consolidated Unified Action Plan */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" /> Consolidated Patient Action Plan
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {["Medication & Safety", "Vitals & Diagnostics", "Diet & Lifestyle", "Red Flags & Follow-up"].map((cat) => {
                        const items = careTeamResponse.actionPlan.filter(a => a.category === cat);
                        if (items.length === 0) return null;
                        return (
                          <div key={cat} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                            <h5 className="font-extrabold text-xs text-emerald-300 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                              <span>{cat}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{items.length} Items</span>
                            </h5>
                            <ul className="space-y-1.5 text-[11px]">
                              {items.map((it, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-slate-200">
                                  <ArrowRight className="h-3 w-3 text-purple-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span>{it.item}</span>
                                    <span className="text-[9px] text-slate-500 block font-mono">Source: {it.sourceAgent}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Safety Disclaimer */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{careTeamResponse.safetyDisclaimer}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ENGINE 1: AI SCRIBE ENGINE */}
        {activeEngine === "scribe" && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  Universal AI Consultation Scribe Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Converts raw doctor-patient dictation or consultation audio transcripts into structured SOAP notes tailored to <strong className="text-cyan-300 capitalize">{selectedSpecialty}</strong>.
                </p>
              </div>

              <button
                onClick={handleSimulateScribe}
                disabled={isGeneratingNote}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                {isGeneratingNote ? "Synthesizing Note..." : "Run AI Scribe"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Raw Consultation Audio Transcript Input</label>
                <textarea
                  value={transcriptInput}
                  onChange={(e) => setTranscriptInput(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <h4 className="font-bold text-cyan-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Structured SOAP Output ({selectedSpecialty.toUpperCase()})
                </h4>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase">S - Subjective:</span>
                    <p className="text-slate-200 mt-0.5">{generatedNote.subjective}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase">O - Objective:</span>
                    <p className="text-slate-200 mt-0.5">{generatedNote.objective}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase">A - Assessment:</span>
                    <p className="text-slate-200 mt-0.5 whitespace-pre-line">{generatedNote.assessment}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase">P - Plan:</span>
                    <p className="text-slate-200 mt-0.5 whitespace-pre-line">{generatedNote.plan}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ENGINE 2: CLINICAL DECISION SUPPORT */}
        {activeEngine === "diagnosis" && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-cyan-400" />
                  Clinical Decision Support & Differential Diagnosis Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates diagnostic probabilities, evidence citations, and required confirmatory tests for <strong className="text-cyan-300 capitalize">{selectedSpecialty}</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Patient Presentation & Symptoms</label>
              <textarea
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-xs text-cyan-300">Ranked Differential Diagnoses</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {diffResults.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white font-bold">{item.name}</strong>
                      <span className="px-2 py-0.5 bg-cyan-900/60 text-cyan-200 border border-cyan-500/30 rounded text-[10px] font-mono">
                        {item.probability}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{item.reasoning}</p>
                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Guideline: {item.guideline}</span>
                      <span className="text-emerald-400 font-bold">Conf: {(item.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ENGINE 3: DRUG SAFETY CHECKER */}
        {activeEngine === "drug" && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Pill className="h-5 w-5 text-rose-400" />
                  Pharmacovigilance & Drug Interaction Safety Guard
                </h3>
                <p className="text-xs text-slate-400">
                  Screens for drug-drug contraindications, renal/hepatic dose reductions, and lethal combinations.
                </p>
              </div>

              <div className="px-3 py-1 bg-rose-900/80 border border-rose-500/50 rounded-xl text-xs font-bold text-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>{drugSafetyReport.severity} DETECTED</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Prescribed Drug Regimen</label>
              <input
                type="text"
                value={drugList}
                onChange={(e) => setDrugList(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-xs text-rose-300">Safety Alerts & Interventions</h4>
              <div className="space-y-2 text-xs">
                {drugSafetyReport.alerts.map((alert, idx) => (
                  <div key={idx} className="p-3.5 bg-rose-950/40 border border-rose-900/60 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-rose-200 font-bold">{alert.type}: {alert.drug1} + {alert.drug2}</strong>
                      <span className="px-2 py-0.5 bg-rose-900 text-rose-100 rounded text-[10px] font-bold">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{alert.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ENGINE 4: MULTIMODAL IMAGE ANALYZER */}
        {activeEngine === "image" && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-400" />
                  Multimodal Medical Image Analysis Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Analyzes Otoscopy, Dermatoscopy, Retinal Fundus, X-ray, CT, and MRI scans.
                </p>
              </div>

              <div className="px-3 py-1 bg-purple-900/80 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200">
                Confidence: <span className="text-white font-black">{(imageAnalysisOutput.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                <Camera className="h-12 w-12 text-slate-600" />
                <span className="text-slate-400 font-bold">Simulated Medical Image Input ({imageType})</span>
                <span className="text-[10px] text-slate-500">Supported: DICOM, JPEG, PNG (Retinal Fundus / Otoscopy)</span>
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-purple-300">AI Computer Vision Findings</h4>
                <div>
                  <span className="text-slate-400 text-[10px] block">Classification</span>
                  <strong className="text-white text-sm">{imageAnalysisOutput.classification}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Abnormalities</span>
                  <p className="text-slate-300 mt-0.5">{imageAnalysisOutput.findings}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Recommendations</span>
                  <p className="text-emerald-300 mt-0.5">{imageAnalysisOutput.recommendations}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ENGINE 5: GUIDELINE & EVIDENCE ENGINE */}
        {activeEngine === "guideline" && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Evidence-Based Clinical Guideline Lookup Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Synthesizes NCCN, ASCO, ACC/AHA, ESC, AAN, and AAO-HNS 2026 practice guidelines.
                </p>
              </div>

              <div className="px-3 py-1 bg-amber-900/80 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-200">
                {guidelineOutput.evidenceLevel}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-300">Clinical Query Condition</label>
              <input
                type="text"
                value={guidelineCondition}
                onChange={(e) => setGuidelineCondition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
              />
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-amber-300">{guidelineOutput.guidelineName}</h4>
              <div className="space-y-1">
                {guidelineOutput.quadrupleTherapy.map((line, idx) => (
                  <p key={idx} className="text-slate-200 font-mono">{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ENGINE 6: ICD-10 & CPT CODING */}
        {activeEngine === "coding" && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tag className="h-5 w-5 text-emerald-400" />
                  AI Clinical Coding & Billing Assistant (ICD-10 / CPT)
                </h3>
                <p className="text-xs text-slate-400">
                  Auto-generates billable ICD-10-CM diagnosis codes and CPT procedure codes from clinical notes.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-300">Clinical Diagnosis Description</label>
              <input
                type="text"
                value={codingDiagnosis}
                onChange={(e) => setCodingDiagnosis(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
              />
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-emerald-300">Generated Billing Codes</h4>
              <div className="space-y-2">
                {icd10Results.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-white font-mono text-xs">{item.code}</strong>
                      <p className="text-slate-400 text-[11px]">{item.desc}</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-900/60 text-emerald-300 rounded text-[10px] font-bold">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ENGINE 7: AI FOLLOW-UP PLANNER */}
        {activeEngine === "followup" && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-cyan-400" />
                  AI Care Plan & Follow-up Scheduler Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates optimal revisit dates, repeat lab panels, and patient warning signs.
                </p>
              </div>

              <div className="px-3 py-1 bg-cyan-900/80 border border-cyan-500/40 rounded-xl text-xs font-bold text-cyan-200">
                Interval: {followupDays} Days
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-300">Scheduled Revisit Date</h4>
                <p className="text-white font-mono text-sm">{followupPlan.nextVisitDate}</p>
                <span className="text-[10px] text-slate-400 block">Repeat Labs Required:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                  {followupPlan.labsToRepeat.map((lab, idx) => (
                    <li key={idx}>{lab}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-rose-300">Patient Red Flag Indicators</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {followupPlan.redFlags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ENGINE 8: CLINICAL TRIAL MATCHER */}
        {activeEngine === "trials" && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Dna className="h-5 w-5 text-rose-400" />
                  Precision Medicine & Clinical Trial Matching Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Matches patient genomics, histology, and biomarkers against global ClinicalTrials.gov registries.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-300">Trial Matching Search Terms</label>
              <input
                type="text"
                value={trialQuery}
                onChange={(e) => setTrialQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
              />
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-rose-300">Matched Active Clinical Trials</h4>
              <div className="space-y-2">
                {matchedTrials.map((trial, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-white font-bold">{trial.title}</strong>
                      <span className="px-2 py-0.5 bg-rose-900/60 text-rose-200 rounded text-[10px] font-mono">
                        {trial.nct}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{trial.phase} • Status: {trial.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ENGINE 9: ROUTER & SAFETY GUARDRAILS */}
        {activeEngine === "router" && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-emerald-400" />
                  AI Router & Safety Guardrails Compliance Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Verifies clinician sign-off requirements, HIPAA data masking, and AI confidence thresholds.
                </p>
              </div>

              <div className="px-3 py-1 bg-emerald-900/80 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200">
                Guardrails Status: Active & Enforced
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-emerald-300 font-bold block">1. Clinician Sign-Off Gate</strong>
                <p className="text-slate-400 text-[11px]">All AI generated treatment recommendations require explicit attending physician verification before saving to EMR.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-emerald-300 font-bold block">2. De-Identification Engine</strong>
                <p className="text-slate-400 text-[11px]">PHI/PII parameters automatically scrubbed before transmission to external LLM endpoints.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-emerald-300 font-bold block">3. Minimum Confidence Threshold</strong>
                <p className="text-slate-400 text-[11px]">AI recommendations with confidence score &lt;70% are automatically flagged for manual specialist review.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedAICoreSuite;
