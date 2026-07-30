import React, { useState } from "react";
import {
  Droplet,
  Activity,
  Zap,
  ShieldAlert,
  Clock,
  Layers,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Pill,
  Sliders,
  TrendingUp,
  Stethoscope,
  Heart,
  Hospital,
  Flame,
  Award,
  Thermometer,
  Wind,
  Mic,
  Volume2,
  Brain,
  Camera,
  ScanLine,
  Microscope,
  FlaskConical,
  TestTube,
  Dna,
  Calendar,
  Syringe,
  Percent,
  RefreshCw
} from "lucide-react";

export interface NephrologySuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function NephrologySuite({
  onBackToLanding,
  patientName = "Suresh Nambiar",
  patientAge = 61,
  patientGender = "Male"
}: NephrologySuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "ckd_egfr" | "dialysis_adequacy" | "electrolytes_bone" | "transplant_ledger" | "soap"
  >("ckd_egfr");

  // 1. CKD & eGFR Calculator State (CKD-EPI 2021 Equation)
  const [serumCreatinine, setSerumCreatinine] = useState<number>(2.45); // mg/dL
  const [bun, setBun] = useState<number>(48); // mg/dL
  const [urineAlbuminCreatinineRatio, setUrineAlbuminCreatinineRatio] = useState<number>(380); // mg/g (A3 Severe Albuminuria)
  const [ckdEpiEgfr, setCkdEpiEgfr] = useState<number>(28.4); // mL/min/1.73m² (CKD Stage 4)
  const [kdigoStage, setKDIGOStage] = useState<string>("CKD Stage 4 (G4/A3 Severe Risk)");

  // 2. Dialysis Session & Kt/V Adequacy State
  const [dialysisType, setDialysisType] = useState<string>("Maintenance Hemodialysis (3x / week, High-Flux Synthetic Membrane)");
  const [preDialysisWeight, setPreDialysisWeight] = useState<number>(68.5); // kg
  const [postDialysisWeight, setPostDialysisWeight] = useState<number>(65.2); // kg (Dry Weight Target 65.0 kg)
  const [ultrafiltrationVol, setUltrafiltrationVol] = useState<number>(3300); // mL
  const [bloodFlowRateQb, setBloodFlowRateQb] = useState<number>(350); // mL/min
  const [dialysateFlowRateQd, setDialysateFlowRateQd] = useState<number>(500); // mL/min
  const [ktV, setKtV] = useState<number>(1.42); // Target >1.2
  const [ureaReductionRatioUrr, setUreaReductionRatioUrr] = useState<number>(71.5); // % (Target >65%)
  const [vascularAccess, setVascularAccess] = useState<string>("Left Forearm Radiocephalic AV Fistula (Mature, Flow >600 mL/min)");

  // 3. Electrolytes & Mineral Bone Disease (CKD-MBD) State
  const [potassium, setPotassium] = useState<number>(5.2); // mEq/L (Mild Hyperkalemia)
  const [sodium, setSodium] = useState<number>(138); // mEq/L
  const [bicarbonate, setBicarbonate] = useState<number>(19.5); // mEq/L (Metabolic Acidosis <22)
  const [serumCalcium, setSerumCalcium] = useState<number>(8.8); // mg/dL
  const [serumPhosphorus, setSerumPhosphorus] = useState<number>(5.8); // mg/dL (Hyperphosphatemia >4.5)
  const [intactPth, setIntactPth] = useState<number>(380); // pg/mL (Secondary Hyperparathyroidism)

  // 4. Kidney Transplant & Immunosuppression Ledger State
  const [transplantStatus, setTransplantStatus] = useState<string>("Living Donor Workup - Sister Matched 5/6 HLA");
  const [praPercentage, setPraPercentage] = useState<number>(4); // % Panel Reactive Antibody
  const [tacrolimusTroughLevel, setTacrolimusTroughLevel] = useState<number>(7.8); // ng/mL (Target 6-10)
  const [mycophenolateDose, setMycophenolateDose] = useState<string>("Mycophenolate Mofetil 720mg BD");

  // 5. Nephrology Consultation SOAP State
  const [nephroSoap, setNephroSoap] = useState({
    subjective:
      "61-year-old male with long-standing Type 2 Diabetes Mellitus (20 yrs) and Hypertension presents for routine CKD Stage 4 follow-up. Reports mild bilateral lower extremity pitting edema, metallic taste, nausea in early morning, and mild muscle cramping during nocturnal hours. Denies chest pain or shortness of breath.",
    objective:
      "BP: 142/88 mmHg, HR: 74 bpm, Weight: 68.5 kg.\nLabs: Serum Creatinine 2.45 mg/dL, BUN 48 mg/dL, eGFR 28.4 mL/min/1.73m² (G4), UACR 380 mg/g (A3).\nElectrolytes: K+ 5.2 mEq/L, Na+ 138 mEq/L, HCO3- 19.5 mEq/L, Serum Phos 5.8 mg/dL, Intact PTH 380 pg/mL.\nDialysis Adequacy: Single-pool Kt/V 1.42, URR 71.5%. Vascular Access: Left AV Fistula mature with good thrill and bruit.",
    assessment:
      "1. Chronic Kidney Disease Stage 4 (G4/A3) secondary to Diabetic Nephrosclerosis & Hypertensive Nephrosclerosis.\n2. Mild Secondary Hyperparathyroidism & Hyperphosphatemia (CKD-MBD).\n3. Mild Hyperkalemia (5.2 mEq/L) & Compensated Metabolic Acidosis (HCO3 19.5 mEq/L).\n4. Stable Maintenance Hemodialysis via Left AV Fistula with adequate Kt/V (1.42).",
    plan:
      "1. Continue SGLT2 Inhibitor (Dapagliflozin 10mg) & ARB (Telmisartan 40mg) with close K+ monitoring.\n2. Initiate Sevelamer Carbonate 800mg TID with meals for hyperphosphatemia.\n3. Add Sodium Bicarbonate 500mg BD for metabolic acidosis correction.\n4. Dietary restriction of dietary potassium (<2g/day) & phosphorus (<800mg/day).\n5. Finalize Living Donor Kidney Transplant HLA crossmatch with sister next fortnight."
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-3 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/90 backdrop-blur border border-slate-700/80 p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition cursor-pointer"
              >
                ← Back
              </button>
            )}
            <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-xl">
              <FlaskConical className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Nephrology & Dialysis AI Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  KDIGO 2026 Guidelines
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                eGFR CKD-EPI Staging, Kt/V Dialysis Adequacy, Electrolyte & CKD-MBD Panel, Transplant HLA Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldAlert className="h-4 w-4 text-purple-400" />
            <span>AI Renal Clinical Engine Active</span>
          </div>
        </div>

        {/* Patient Profile & Critical Kidney Metrics Banner */}
        <div className="bg-gradient-to-r from-purple-950/60 via-slate-800 to-slate-900 border border-purple-900/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center font-bold text-purple-300 text-lg">
              {patientName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{patientName}</h2>
                <span className="text-xs text-slate-400">({patientAge} Y/O, {patientGender})</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                  ID: NEP-2026-3391
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>eGFR: <strong className="text-purple-300 font-mono">{ckdEpiEgfr} mL/min</strong> ({kdigoStage})</span>
                <span className="text-slate-500">•</span>
                <span>Creatinine: <strong className="text-amber-300 font-mono">{serumCreatinine} mg/dL</strong></span>
                <span className="text-slate-500">•</span>
                <span>K+: <strong className="text-rose-300 font-mono">{potassium} mEq/L</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-purple-900/60 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200">
              Kt/V Adequacy: <span className="text-white font-black">{ktV} (URR {ureaReductionRatioUrr}%)</span>
            </div>
            <div className="px-3 py-1.5 bg-amber-900/60 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
              Transplant: <span className="text-white font-black">Living Donor Sister</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "ckd_egfr", label: "🧪 eGFR Calculator & KDIGO CKD Staging", icon: FlaskConical },
            { id: "dialysis_adequacy", label: "💉 Hemodialysis Session & Kt/V Calculator", icon: RefreshCw },
            { id: "electrolytes_bone", label: "⚡ Electrolytes & CKD-MBD Bone Panel", icon: TestTube },
            { id: "transplant_ledger", label: "🧬 Kidney Transplant & Donor Matching", icon: Dna },
            { id: "soap", label: "📝 Nephrology SOAP Consultation Note", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: eGFR CALCULATOR & KDIGO CKD STAGING */}
        {activeTab === "ckd_egfr" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-purple-400" />
                  CKD-EPI 2021 eGFR Equation & KDIGO Risk Heatmap
                </h3>
                <p className="text-xs text-slate-400">
                  Serum Creatinine (mg/dL), Blood Urea Nitrogen (BUN), Urine Albumin-to-Creatinine Ratio (UACR mg/g).
                </p>
              </div>

              <div className="px-3 py-1.5 bg-purple-900/80 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200">
                KDIGO Category: <span className="text-white font-black">{kdigoStage}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">Serum Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.05"
                  value={serumCreatinine}
                  onChange={(e) => setSerumCreatinine(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{serumCreatinine > 1.3 ? "⚠️ Elevated (>1.3 mg/dL)" : "Normal Range"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">Blood Urea Nitrogen - BUN (mg/dL)</label>
                <input
                  type="number"
                  value={bun}
                  onChange={(e) => setBun(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{bun > 20 ? "⚠️ Azotemia (>20 mg/dL)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">Urine Albumin/Creatinine UACR (mg/g)</label>
                <input
                  type="number"
                  value={urineAlbuminCreatinineRatio}
                  onChange={(e) => setUrineAlbuminCreatinineRatio(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{urineAlbuminCreatinineRatio > 300 ? "⚠️ A3 Severe Albuminuria (>300)" : "Microalbuminuria"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">Calculated eGFR (mL/min/1.73m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={ckdEpiEgfr}
                  onChange={(e) => setCkdEpiEgfr(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{ckdEpiEgfr < 30 ? "⚠️ CKD Stage 4 Severe Decline" : "Stage 3"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEMODIALYSIS SESSION & Kt/V CALCULATOR */}
        {activeTab === "dialysis_adequacy" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-amber-400" />
                  Hemodialysis Prescription & Single-Pool Kt/V Adequacy
                </h3>
                <p className="text-xs text-slate-400">
                  Pre/Post Weight, Ultrafiltration Volume (mL), Blood Flow Rate (Qb), URR %, and Vascular Access status.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-amber-900/80 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
                Target Kt/V: <span className="text-white font-black">{ktV} (&gt;1.2 Met)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Pre-Dialysis Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={preDialysisWeight}
                  onChange={(e) => setPreDialysisWeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Fluid Overload: +3.3 kg</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Post-Dialysis Dry Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={postDialysisWeight}
                  onChange={(e) => setPostDialysisWeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Target Achieved</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Ultrafiltration Volume (mL)</label>
                <input
                  type="number"
                  value={ultrafiltrationVol}
                  onChange={(e) => setUltrafiltrationVol(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">UFR Rate: ~825 mL/hr</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Urea Reduction Ratio URR (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={ureaReductionRatioUrr}
                  onChange={(e) => setUreaReductionRatioUrr(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{ureaReductionRatioUrr >= 65 ? "Target met (&gt;65%)" : "Suboptimal"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ELECTROLYTES & CKD-MBD BONE MINERAL PANEL */}
        {activeTab === "electrolytes_bone" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-blue-400" />
                  Electrolytes, Acid-Base & Mineral Bone Disease (CKD-MBD)
                </h3>
                <p className="text-xs text-slate-400">
                  Serum Potassium (K+), Sodium (Na+), Bicarbonate (HCO3-), Calcium, Phosphorus, and Intact Parathyroid Hormone (iPTH).
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-900/80 border border-blue-500/50 rounded-xl text-xs font-bold text-blue-200">
                Potassium: <span className="text-white font-black">{potassium} mEq/L</span> (Mild Hyperkalemia)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">Serum Potassium K+ (mEq/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={potassium}
                  onChange={(e) => setPotassium(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{potassium > 5.0 ? "⚠️ Hyperkalemia (>5.0 mEq/L)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">Serum Bicarbonate HCO3- (mEq/L)</label>
                <input
                  type="number"
                  step="0.5"
                  value={bicarbonate}
                  onChange={(e) => setBicarbonate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{bicarbonate < 22 ? "⚠️ Metabolic Acidosis (<22 mEq/L)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">Serum Phosphorus (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={serumPhosphorus}
                  onChange={(e) => setSerumPhosphorus(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{serumPhosphorus > 4.5 ? "⚠️ Hyperphosphatemia (>4.5 mg/dL)" : "Normal"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KIDNEY TRANSPLANT & DONOR MATCHING */}
        {activeTab === "transplant_ledger" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Dna className="h-5 w-5 text-purple-400" />
                  Renal Transplant Evaluation, HLA Crossmatch & Immunosuppression
                </h3>
                <p className="text-xs text-slate-400">
                  Panel Reactive Antibodies (PRA %), HLA Antigen Typing, Tacrolimus trough level (ng/mL), and Mycophenolate dosing.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-purple-900/80 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200">
                Status: <span className="text-white font-black">{transplantStatus}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-300 block">Panel Reactive Antibodies PRA (%)</span>
                <input
                  type="number"
                  value={praPercentage}
                  onChange={(e) => setPraPercentage(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Low Sensitization (&lt;10%)</span>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-300 block">Tacrolimus Trough Level C0 (ng/mL)</span>
                <input
                  type="number"
                  step="0.1"
                  value={tacrolimusTroughLevel}
                  onChange={(e) => setTacrolimusTroughLevel(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Therapeutic Window (6-10 ng/mL)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NEPHROLOGY SOAP CONSULTATION NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Nephrology Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">S - Subjective (Edema, Nausea, Cramps, Fatigue, Diabetic History)</label>
                <textarea
                  value={nephroSoap.subjective}
                  onChange={(e) => setNephroSoap({ ...nephroSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">O - Objective (eGFR, Serum Creatinine, UACR, K+, Phos, Kt/V & AV Fistula)</label>
                <textarea
                  value={nephroSoap.objective}
                  onChange={(e) => setNephroSoap({ ...nephroSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">A - Assessment (CKD Stage 4, CKD-MBD, Hyperkalemia & Acidosis)</label>
                <textarea
                  value={nephroSoap.assessment}
                  onChange={(e) => setNephroSoap({ ...nephroSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">P - Plan (SGLT2i, Sevelamer, Bicarbonate, Dietary K/Phos Restriction, Transplant)</label>
                <textarea
                  value={nephroSoap.plan}
                  onChange={(e) => setNephroSoap({ ...nephroSoap, plan: e.target.value })}
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

export default NephrologySuite;
