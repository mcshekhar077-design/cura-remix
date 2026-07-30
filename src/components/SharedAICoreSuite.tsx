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
  Heart
} from "lucide-react";

export interface SharedAICoreSuiteProps {
  onBackToLanding?: () => void;
  initialSpecialty?: string;
}

export function SharedAICoreSuite({
  onBackToLanding,
  initialSpecialty = "cardiology"
}: SharedAICoreSuiteProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty);
  const [activeEngine, setActiveEngine] = useState<
    "scribe" | "diagnosis" | "drug" | "image" | "guideline" | "coding" | "followup" | "trials" | "router"
  >("scribe");

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
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-2xl">
              <Brain className="h-8 w-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  CURA Universal AI Clinical Core Engine
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  Central Intelligence Hub v3.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-Specialty Scribe, Clinical Decision Support, Drug Interaction Safety, Image Analysis, Guidelines & Coding Router
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
              <option value="oncology">🧬 Oncology AI</option>
              <option value="emergency">🚑 Emergency & ICU AI</option>
              <option value="ent">👂 ENT & Audiology AI</option>
              <option value="pediatrics">👶 Pediatrics AI</option>
              <option value="dermatology">🔬 Dermatology AI</option>
              <option value="orthopedics">🦴 Orthopedics AI</option>
              <option value="mental_health">🧘 Mental Health AI</option>
              <option value="womens_health">🌸 Women's Health AI</option>
            </select>
          </div>
        </div>

        {/* 9 Shared Engine Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
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
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/30"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

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
