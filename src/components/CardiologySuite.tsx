import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Pill,
  Sparkles,
  ShieldAlert,
  Plus,
  X,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  Stethoscope,
  Shield,
  Search,
  Sliders,
  CheckCircle2,
  Lock,
  Download,
  Share2
} from "lucide-react";

export interface CardiologySuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

type HeartFailureNYHA = "NYHA-I" | "NYHA-II" | "NYHA-III" | "NYHA-IV";
type CCSAnginaClass = "CCS-I" | "CCS-II" | "CCS-III" | "CCS-IV";

export function CardiologySuite({
  onBackToLanding,
  patientName = "Rajesh Verma",
  patientAge = 56,
  patientGender = "Male"
}: CardiologySuiteProps) {
  const [activeTab, setActiveTab] = useState<"risk" | "ecg" | "echo" | "cath" | "soap">("risk");

  // Vitals & Risk Factors State
  const [sysBP, setSysBP] = useState<number>(142);
  const [diaBP, setDiaBP] = useState<number>(88);
  const [ldl, setLdl] = useState<number>(135);
  const [hdl, setHdl] = useState<number>(38);
  const [isSmoker, setIsSmoker] = useState<boolean>(true);
  const [hasDiabetes, setHasDiabetes] = useState<boolean>(true);
  const [hasHypertension, setHasHypertension] = useState<boolean>(true);

  // Heart Failure & Angina Functional Scales
  const [nyhaClass, setNyhaClass] = useState<HeartFailureNYHA>("NYHA-II");
  const [ccsClass, setCcsClass] = useState<CCSAnginaClass>("CCS-II");

  // Calculated Risk Metrics
  const calculateFramingham = () => {
    let score = 5;
    if (patientAge > 50) score += 6;
    if (sysBP > 140) score += 4;
    if (isSmoker) score += 4;
    if (hasDiabetes) score += 4;
    if (ldl > 130) score += 3;
    return Math.min(score, 32);
  };

  const framinghamRisk = calculateFramingham();
  const heartAge = patientAge + (isSmoker ? 4 : 0) + (hasDiabetes ? 3 : 0) + (sysBP > 140 ? 3 : 0);

  // AI ECG Analyzer State
  const [ecgHeartRate, setEcgHeartRate] = useState<number>(84);
  const [prInterval, setPrInterval] = useState<number>(160);
  const [qrsDuration, setQrsDuration] = useState<number>(94);
  const [qtcInterval, setQtcInterval] = useState<number>(438);
  const [rhythmSelection, setRhythmSelection] = useState("Sinus Rhythm with Non-Specific ST-T Changes");
  const [isAnalyzingECG, setIsAnalyzingECG] = useState(false);
  const [ecgAnalysisResult, setEcgAnalysisResult] = useState<string | null>(
    "AI Diagnostic Impression: Normal sinus rhythm (84 bpm). Non-specific T-wave flattening in lead V4-V6. QTc normal at 438ms. No acute ST-elevation (STEMI) detected."
  );

  // Echocardiogram State
  const [lvef, setLvef] = useState<number>(52); // Left Ventricular Ejection Fraction (%)
  const [lvedd, setLvedd] = useState<number>(54); // mm
  const [lvesd, setLvesd] = useState<number>(36); // mm
  const [mitralRegurg, setMitralRegurg] = useState("Trace / Mild");
  const [aorticStenosis, setAorticStenosis] = useState("None");
  const [pasp, setPasp] = useState<number>(32); // Pulmonary Artery Systolic Pressure (mmHg)

  // Cardiology SOAP State
  const [cardioSoap, setCardioSoap] = useState({
    subjective: "56y male presents with exertion-induced retrosternal chest tightness (CCS Class II) for 2 months. Denies rest angina or syncope. NYHA Class II dyspnea when walking uphill.",
    objective: "BP: 142/88 mmHg, HR: 84 bpm. S1 S2 normal, no S3/S4. Lungs clear. ECG: Sinus rhythm, non-specific T-wave inversions V5-V6. Echo: LV EF = 52%, mild concentric LV hypertrophy.",
    assessment: "1. Chronic Stable Angina Pectoris (ICD-10 I20.8) - Moderate 10-Yr CVD Risk (22%).\n2. Essential Hypertension (I10) - Uncontrolled.\n3. Type 2 Diabetes Mellitus with Dyslipidemia.",
    plan: "1. Optimize Dual Antiplatelet Therapy (Aspirin 75mg + Clopidogrel 75mg).\n2. Initiate Atorvastatin 40mg HS (Target LDL < 70 mg/dL).\n3. Add Telmisartan 40mg OD for BP control.\n4. Schedule TMT / Dobutamine Stress Echo next week."
  });

  // Cardiac Cath / PCI Stent Logger
  const [stents, setStents] = useState([
    { vessel: "Left Anterior Descending (LAD)", lesion: "85% Proximal Stenosis", stentType: "Drug-Eluting Stent (DES 3.0 x 18mm)", date: "2025-11-14" },
    { vessel: "Right Coronary Artery (RCA)", lesion: "40% Mid Stenosis", stentType: "Medical Management", date: "2025-11-14" }
  ]);
  const [newVessel, setNewVessel] = useState("");
  const [newStent, setNewStent] = useState("");

  const handleRunAIEcg = () => {
    setIsAnalyzingECG(true);
    setTimeout(() => {
      let result = `AI Analysis Complete: Heart rate ${ecgHeartRate} bpm. PR: ${prInterval}ms, QRS: ${qrsDuration}ms, QTc: ${qtcInterval}ms. `;
      if (qtcInterval > 460) {
        result += "⚠️ Prolonged QTc Interval detected! Caution with QT-prolonging antiarrhythmics.";
      } else if (rhythmSelection.includes("T-Wave")) {
        result += "Ischemic T-wave changes observed in anterolateral leads. Suggests myocardial ischemia under exertion.";
      } else {
        result += "No acute STEMI pattern. Rhythm consistent with " + rhythmSelection;
      }
      setEcgAnalysisResult(result);
      setIsAnalyzingECG(false);
    }, 1100);
  };

  const addStent = () => {
    if (!newVessel.trim()) return;
    setStents([
      ...stents,
      {
        vessel: newVessel.trim(),
        lesion: "75%+ Stenosis",
        stentType: newStent.trim() || "Drug-Eluting Stent (DES)",
        date: new Date().toISOString().split("T")[0]
      }
    ]);
    setNewVessel("");
    setNewStent("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-3 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/90 backdrop-blur border border-slate-700/80 p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition"
              >
                ← Back
              </button>
            )}
            <div className="p-2.5 bg-rose-600/20 border border-rose-500/30 rounded-xl">
              <Heart className="h-7 w-7 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Cardiology & Cardiovascular Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  ECG & Echo AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Framingham Risk Engine, 12-Lead ECG Analyzer, Echo LV-EF Tracker & PCI Cath Lab Registry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>ESC / AHA 2026 Guidelines Active</span>
          </div>
        </div>

        {/* Patient Clinical Profile Banner */}
        <div className="bg-gradient-to-r from-rose-950/60 via-slate-800 to-slate-900 border border-rose-900/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-rose-500/20 border border-rose-400/30 flex items-center justify-center font-bold text-rose-300 text-lg">
              {patientName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{patientName}</h2>
                <span className="text-xs text-slate-400">({patientAge}y, {patientGender})</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                  ID: CARD-2026-9901
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Primary DX: <strong className="text-rose-300">I20.8 Chronic Ischemic Heart Disease</strong></span>
                <span className="text-slate-500">•</span>
                <span>BP: <strong className="text-amber-300">{sysBP}/{diaBP} mmHg</strong></span>
                <span className="text-slate-500">•</span>
                <span>LV EF: <strong className="text-emerald-300">{lvef}%</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-rose-900/50 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200">
              10-Yr CVD Risk: <span className="text-white font-black">{framinghamRisk}%</span>
            </div>
            <div className="px-3 py-1.5 bg-amber-900/50 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-200">
              Heart Age: <span className="text-white font-black">{heartAge} yrs</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "risk", label: "📊 Framingham Risk & Vitals", icon: TrendingUp },
            { id: "ecg", label: "💓 AI 12-Lead ECG Analyzer", icon: Activity },
            { id: "echo", label: "🎵 Echocardiogram (LV EF)", icon: Heart },
            { id: "cath", label: "🔬 PCI Cath Lab & Stent Log", icon: Stethoscope },
            { id: "soap", label: "📝 Cardiology SOAP Note", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-900/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: FRAMINGHAM RISK & VITALS */}
        {activeTab === "risk" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-400" />
                Cardiovascular Risk Factor Calculator
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={sysBP}
                    onChange={(e) => setSysBP(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={diaBP}
                    onChange={(e) => setDiaBP(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Serum LDL (mg/dL)</label>
                  <input
                    type="number"
                    value={ldl}
                    onChange={(e) => setLdl(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Serum HDL (mg/dL)</label>
                  <input
                    type="number"
                    value={hdl}
                    onChange={(e) => setHdl(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => setIsSmoker(!isSmoker)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    isSmoker ? "bg-rose-900/50 border-rose-500 text-rose-200" : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  <span>Active Smoker</span>
                  {isSmoker ? <CheckCircle className="h-4 w-4 text-rose-400" /> : <X className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => setHasDiabetes(!hasDiabetes)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    hasDiabetes ? "bg-rose-900/50 border-rose-500 text-rose-200" : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  <span>Type 2 Diabetes</span>
                  {hasDiabetes ? <CheckCircle className="h-4 w-4 text-rose-400" /> : <X className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => setHasHypertension(!hasHypertension)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    hasHypertension ? "bg-rose-900/50 border-rose-500 text-rose-200" : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  <span>Hypertension</span>
                  {hasHypertension ? <CheckCircle className="h-4 w-4 text-rose-400" /> : <X className="h-4 w-4" />}
                </button>
              </div>

              {/* Functional Scales */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-rose-300">NYHA Heart Failure Functional Class</label>
                  <select
                    value={nyhaClass}
                    onChange={(e) => setNyhaClass(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="NYHA-I">Class I: No limitation of physical activity</option>
                    <option value="NYHA-II">Class II: Slight limitation, comfortable at rest</option>
                    <option value="NYHA-III">Class III: Marked limitation, mild exercise causes fatigue</option>
                    <option value="NYHA-IV">Class IV: Unable to carry on physical activity, symptoms at rest</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-rose-300">CCS Angina Severity Scale</label>
                  <select
                    value={ccsClass}
                    onChange={(e) => setCcsClass(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="CCS-I">Class I: Angina with strenuous/prolonged exertion</option>
                    <option value="CCS-II">Class II: Slight limitation during ordinary activity</option>
                    <option value="CCS-III">Class III: Marked limitation during ordinary walking/stairs</option>
                    <option value="CCS-IV">Class IV: Inability to perform any activity without angina</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Risk Stratification Overview Panel */}
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose-400" />
                  AI Risk Stratification
                </h4>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400">Calculated 10-Year Major Adverse Cardiac Event (MACE) Risk:</span>
                    <div className="text-2xl font-black text-rose-400 mt-1">{framinghamRisk}%</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">High risk threshold is ≥ 20%</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400">Vascular Heart Age vs Chronological:</span>
                    <div className="text-2xl font-black text-amber-400 mt-1">{heartAge} Years</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Patient actual age: {patientAge} years</p>
                  </div>
                </div>

                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200 space-y-1">
                  <strong>AHA Guideline Target:</strong>
                  <p>Target LDL &lt; 70 mg/dL for high-risk CAD. Recommend statin uptitration and BP control &lt; 130/80.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI 12-LEAD ECG ANALYZER */}
        {activeTab === "ecg" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-400" />
                  AI 12-Lead Electrocardiogram (ECG) Rhythm Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Automated interval measurement (PR, QRS, QTc) & ischemia detection.
                </p>
              </div>

              <button
                onClick={handleRunAIEcg}
                disabled={isAnalyzingECG}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition disabled:opacity-50"
              >
                {isAnalyzingECG ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Re-Analyze Waveform
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <label className="text-[11px] text-slate-400 font-bold">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={ecgHeartRate}
                  onChange={(e) => setEcgHeartRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <label className="text-[11px] text-slate-400 font-bold">PR Interval (ms)</label>
                <input
                  type="number"
                  value={prInterval}
                  onChange={(e) => setPrInterval(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <label className="text-[11px] text-slate-400 font-bold">QRS Duration (ms)</label>
                <input
                  type="number"
                  value={qrsDuration}
                  onChange={(e) => setQrsDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <label className="text-[11px] text-slate-400 font-bold">QTc Interval (ms)</label>
                <input
                  type="number"
                  value={qtcInterval}
                  onChange={(e) => setQtcInterval(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            {ecgAnalysisResult && (
              <div className="p-4 bg-slate-950 border border-rose-500/40 rounded-xl font-mono text-xs text-rose-200 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-rose-300 mb-1">
                  <ShieldAlert className="h-4 w-4" /> AI Electrocardiography Diagnosis:
                </div>
                {ecgAnalysisResult}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ECHOCARDIOGRAM (LV EF) */}
        {activeTab === "echo" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-400" />
              Echocardiogram Structural & Hemodynamic Assessment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <label className="text-xs font-bold text-rose-300">Left Ventricular Ejection Fraction (LV EF %)</label>
                <input
                  type="number"
                  value={lvef}
                  onChange={(e) => setLvef(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Normal range: 55-70%. Preserved / Mildly Reduced.</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <label className="text-xs font-bold text-rose-300">LVEDD (End-Diastolic Diameter mm)</label>
                <input
                  type="number"
                  value={lvedd}
                  onChange={(e) => setLvedd(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <label className="text-xs font-bold text-rose-300">Pulmonary Artery Pressure (PASP mmHg)</label>
                <input
                  type="number"
                  value={pasp}
                  onChange={(e) => setPasp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PCI CATH LAB & STENT LOG */}
        {activeTab === "cath" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-rose-400" />
              Coronary Angiography & PCI Stent Intervention Log
            </h3>

            <div className="space-y-3">
              {stents.map((s, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-300">{s.vessel}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Lesion: {s.lesion} • Intervention: {s.stentType} • Date: {s.date}
                    </p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-700">
              <input
                type="text"
                value={newVessel}
                onChange={(e) => setNewVessel(e.target.value)}
                placeholder="Vessel name (e.g. LCX, LAD)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
              />
              <input
                type="text"
                value={newStent}
                onChange={(e) => setNewStent(e.target.value)}
                placeholder="Stent type/size"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
              />
              <button
                onClick={addStent}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Stent
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: CARDIOLOGY SOAP NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-400" />
              Cardiology Clinical SOAP Documentation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">S - Subjective (Angina, Dyspnea, Syncope)</label>
                <textarea
                  value={cardioSoap.subjective}
                  onChange={(e) => setCardioSoap({ ...cardioSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">O - Objective (Vitals, ECG, Echo, Trop-I)</label>
                <textarea
                  value={cardioSoap.objective}
                  onChange={(e) => setCardioSoap({ ...cardioSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">A - Assessment (ICD-10 CAD / HTN / HF)</label>
                <textarea
                  value={cardioSoap.assessment}
                  onChange={(e) => setCardioSoap({ ...cardioSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">P - Plan (DAPT, Statins, Cath Schedule)</label>
                <textarea
                  value={cardioSoap.plan}
                  onChange={(e) => setCardioSoap({ ...cardioSoap, plan: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardiologySuite;
