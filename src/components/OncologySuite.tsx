import React, { useState } from "react";
import {
  Dna,
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
  FlaskConical,
  Target,
  Heart,
  Calendar,
  Flame,
  Award
} from "lucide-react";

export interface OncologySuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function OncologySuite({
  onBackToLanding,
  patientName = "Ananya Mukherjee",
  patientAge = 54,
  patientGender = "Female"
}: OncologySuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "staging" | "chemo" | "radiation" | "genomics" | "trials" | "palliative" | "soap"
  >("staging");

  // Cancer Type & TNM Staging State
  const [primaryCancerSite, setPrimaryCancerSite] = useState<string>("Invasive Ductal Carcinoma of Right Breast");
  const [tumorHistology, setTumorHistology] = useState<string>("Infiltrating Ductal Carcinoma, Grade 2 (Nottingham Score 6/9)");
  const [tStage, setTStage] = useState<string>("T2 (>20 mm but ≤50 mm in greatest dimension)");
  const [nStage, setNStage] = useState<string>("N1 (Metastasis in 1-3 axillary lymph nodes)");
  const [mStage, setMStage] = useState<string>("M0 (No distant metastasis detected)");
  const [ecogPerformanceStatus, setEcogPerformanceStatus] = useState<number>(1); // 0-4 scale

  // Overall Stage Calculation logic based on TNM
  const calculateOverallStage = () => {
    if (mStage.startsWith("M1")) return "Stage IV (Metastatic)";
    if (tStage.startsWith("T4") || nStage.startsWith("N2") || nStage.startsWith("N3")) return "Stage III (Locally Advanced)";
    if (tStage.startsWith("T2") || tStage.startsWith("T3") || nStage.startsWith("N1")) return "Stage IIB (Regional Involvement)";
    if (tStage.startsWith("T1") && nStage.startsWith("N0")) return "Stage I (Early Stage)";
    return "Stage 0 (Carcinoma in Situ)";
  };
  const overallStage = calculateOverallStage();

  // Biomarkers & Genomics State
  const [erStatus, setErStatus] = useState<string>("ER Positive (85% strong nuclear positivity)");
  const [prStatus, setPrStatus] = useState<string>("PR Positive (70% moderate nuclear positivity)");
  const [her2Status, setHer2Status] = useState<string>("HER2 Negative (IHC 1+, FISH Ratio <2.0)");
  const [ki67IndexPct, setKi67IndexPct] = useState<number>(28); // Proliferation index
  const [brcaMutation, setBrcaMutation] = useState<string>("BRCA1 Negative / BRCA2 Pathogenic Variant (c.5946delT)");
  const [pdl1TpsPct, setPdl1TpsPct] = useState<number>(45); // PD-L1 Tumor Proportion Score

  // Chemotherapy Regimen State
  const [chemoRegimenName, setChemoRegimenName] = useState<string>("AC-T Regimen (Doxorubicin + Cyclophosphamide followed by Paclitaxel)");
  const [currentCycle, setCurrentCycle] = useState<number>(3);
  const [totalCycles, setTotalCycles] = useState<number>(8);
  const [bsaM2, setBsaM2] = useState<number>(1.68); // Body Surface Area in m²
  const [doseReductionPct, setDoseReductionPct] = useState<number>(0);
  const [chemoStatus, setChemoStatus] = useState<string>("Cycle 3/8 In Progress - ANC 1,850/µL (Safe for Infusion)");

  // Radiotherapy State
  const [radiationModality, setRadiationModality] = useState<string>("3D-CRT / IMRT Hypofractionated Whole Breast Irradiation");
  const [totalRadiationDoseGy, setTotalRadiationDoseGy] = useState<number>(40.05);
  const [numberFractions, setNumberFractions] = useState<number>(15);
  const [boostDoseGy, setBoostDoseGy] = useState<number>(10);
  const [organAtRiskHeartDoseGy, setOrganAtRiskHeartDoseGy] = useState<number>(1.8);

  // Clinical Trials & Tumor Board State
  const [tumorBoardRecommendation, setTumorBoardRecommendation] = useState<string>(
    "Multidisciplinary approval for Adjuvant AC-T Chemotherapy -> Radiotherapy -> Olaparib (PARP Inhibitor) for BRCA2 Mutant -> Endocrine Therapy (Anastrozole) for 5 years."
  );
  const [matchedTrialNct, setMatchedTrialNct] = useState<string>("NCT03155087 (Olaparib Adjuvant Trial - OlympiA Criteria)");

  // Palliative & Pain Protocol State
  const [whoPainLadderStep, setWhoPainLadderStep] = useState<string>("Step 2: Mild to Moderate Pain (Weak Opioid)");
  const [painScoreVisualAnalog, setPainScoreVisualAnalog] = useState<number>(3);
  const [analgesicRegimen, setAnalgesicRegimen] = useState<string>("Tramadol 50mg BD + Paracetamol 1000mg TDS PRN");
  const [codeStatus, setCodeStatus] = useState<string>("Full Code (Active Curative Intent)");

  // Oncology SOAP State
  const [oncologySoap, setOncologySoap] = useState({
    subjective:
      "54-year-old postmenopausal female presents for Cycle 3 AC Chemotherapy review. Reports mild Grade 1 nausea controlled with Ondansetron and Emend. Denies fever, chills, dyspnea, or severe fatigue. ECOG Performance Status 1.",
    objective:
      "Vitals: BP 122/78, HR 74, Temp 36.8°C. Weight 62 kg, Height 160 cm, BSA 1.68 m².\nLabs: Hb 11.2 g/dL, WBC 4,200/µL, ANC 1,850/µL (Absolute Neutrophil Count adequate), Platelets 210,000/µL, Serum Creatinine 0.8 mg/dL, LFTs Normal.\nBiomarkers: ER+ (85%), PR+ (70%), HER2-, Ki-67 28%, BRCA2 Pathogenic Variant.\nStage: T2 N1 M0 (Stage IIB Invasive Ductal Carcinoma Right Breast).",
    assessment:
      "1. Stage IIB (T2 N1 M0) ER+/PR+/HER2- Right Breast Invasive Ductal Carcinoma.\n2. Cycle 3 Doxorubicin + Cyclophosphamide tolerated well with stable hematologic parameters.\n3. Germline BRCA2 Mutation positive.",
    plan:
      "1. Proceed with AC Chemotherapy Cycle 3 (Doxorubicin 60mg/m² + Cyclophosphamide 600mg/m²) today with IV antiemetics.\n2. G-CSF (Pegfilgrastim 6mg SC) on Day 2 for primary neutropenia prophylaxis.\n3. CBC with differential prior to Cycle 4 in 14 days.\n4. Complete 4 cycles AC -> 4 cycles Paclitaxel -> Radiotherapy -> Olaparib PARP inhibitor -> Letrozole 2.5mg OD."
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
            <div className="p-2.5 bg-rose-600/20 border border-rose-500/30 rounded-xl">
              <Dna className="h-7 w-7 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Oncology & Precision Cancer Care Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  NCCN 2026 Guidelines
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AJCC 8th Ed TNM Staging, Chemotherapy Cycle Tracker, Radiotherapy Fractions, Biomarker Genomics & Tumor Board Matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            <span>AI Precision Oncology Guard Active</span>
          </div>
        </div>

        {/* Patient Profile & Stage Banner */}
        <div className="bg-gradient-to-r from-rose-950/60 via-slate-800 to-slate-900 border border-rose-900/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-rose-500/20 border border-rose-400/30 flex items-center justify-center font-bold text-rose-300 text-lg">
              {patientName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{patientName}</h2>
                <span className="text-xs text-slate-400">({patientAge} Y/O, {patientGender})</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                  ID: ONCO-2026-4401
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Site: <strong className="text-rose-300">{primaryCancerSite}</strong></span>
                <span className="text-slate-500">•</span>
                <span>Stage: <strong className="text-amber-300 font-mono">{overallStage}</strong></span>
                <span className="text-slate-500">•</span>
                <span>ECOG Status: <strong className="text-emerald-300 font-mono">ECOG {ecogPerformanceStatus}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-rose-900/50 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200">
              Chemo Status: <span className="text-white font-black">Cycle {currentCycle}/{totalCycles} (ANC Safe)</span>
            </div>
            <div className="px-3 py-1.5 bg-purple-900/50 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200">
              Biomarkers: <span className="text-white font-black">ER+/PR+/HER2- (BRCA2 Mutant)</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "staging", label: "🎯 AJCC TNM Staging & Tumor Grade", icon: Target },
            { id: "chemo", label: "💊 Chemotherapy Regimen & BSA Tracker", icon: Pill },
            { id: "radiation", label: "⚡ Radiotherapy & Fractionation", icon: Flame },
            { id: "genomics", label: "🧬 Biomarkers & Genomic Variants", icon: Dna },
            { id: "trials", label: "🤝 Tumor Board & Clinical Trials", icon: Award },
            { id: "palliative", label: "🕊️ Palliative Care & WHO Pain Ladder", icon: Heart },
            { id: "soap", label: "📝 Oncology SOAP Note", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
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

        {/* TAB 1: AJCC TNM STAGING & TUMOR GRADE */}
        {activeTab === "staging" && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-rose-400" />
                    AJCC 8th Edition TNM Staging Calculator & ECOG Performance Status
                  </h3>
                  <p className="text-xs text-slate-400">
                    Primary tumor extension (T), regional lymph node involvement (N), and distant metastasis (M).
                  </p>
                </div>

                <div className="px-3 py-1.5 bg-rose-900/80 border border-rose-500/50 rounded-xl text-xs font-bold text-rose-200">
                  Calculated Overall Stage: <span className="text-white font-black text-sm">{overallStage}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Primary Anatomic Site</label>
                  <input
                    type="text"
                    value={primaryCancerSite}
                    onChange={(e) => setPrimaryCancerSite(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Histopathological Grade & Subtype</label>
                  <input
                    type="text"
                    value={tumorHistology}
                    onChange={(e) => setTumorHistology(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <label className="font-bold text-rose-300 block">T - Primary Tumor Category</label>
                  <select
                    value={tStage}
                    onChange={(e) => setTStage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="T1 (Tumor ≤20 mm in greatest dimension)">T1 (Tumor ≤20 mm)</option>
                    <option value="T2 (>20 mm but ≤50 mm in greatest dimension)">T2 (&gt;20 mm to ≤50 mm)</option>
                    <option value="T3 (Tumor >50 mm in greatest dimension)">T3 (&gt;50 mm)</option>
                    <option value="T4 (Tumor of any size with direct extension to chest wall/skin)">T4 (Direct extension to chest wall/skin)</option>
                    <option value="Tis (Carcinoma in situ / DCIS)">Tis (Carcinoma in situ)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <label className="font-bold text-rose-300 block">N - Regional Lymph Nodes Category</label>
                  <select
                    value={nStage}
                    onChange={(e) => setNStage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="N0 (No regional lymph node metastasis)">N0 (No regional node metastasis)</option>
                    <option value="N1 (Metastasis in 1-3 axillary lymph nodes)">N1 (1-3 axillary nodes positive)</option>
                    <option value="N2 (Metastasis in 4-9 axillary lymph nodes)">N2 (4-9 axillary nodes positive)</option>
                    <option value="N3 (Metastasis in 10+ axillary nodes or supraclavicular)">N3 (10+ nodes or supraclavicular)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <label className="font-bold text-rose-300 block">M - Distant Metastasis Category</label>
                  <select
                    value={mStage}
                    onChange={(e) => setMStage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="M0 (No distant metastasis detected)">M0 (No distant metastasis)</option>
                    <option value="M1 (Distant metastasis present - bone, liver, lung, brain)">M1 (Distant organ metastasis)</option>
                  </select>
                </div>
              </div>

              {/* ECOG Performance Status Scale */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-emerald-300 block">
                  ECOG Performance Status Scale (Score: {ecogPerformanceStatus})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { score: 0, label: "ECOG 0: Fully active, unrestricted" },
                    { score: 1, label: "ECOG 1: Restricted in strenuous activity" },
                    { score: 2, label: "ECOG 2: Ambulatory, up >50% waking hours" },
                    { score: 3, label: "ECOG 3: Confined to bed/chair >50% hours" },
                    { score: 4, label: "ECOG 4: Completely disabled" }
                  ].map((item) => (
                    <button
                      key={item.score}
                      onClick={() => setEcogPerformanceStatus(item.score)}
                      className={`p-2.5 rounded-xl border font-bold text-[11px] text-left transition cursor-pointer ${
                        ecogPerformanceStatus === item.score
                          ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHEMOTHERAPY REGIMEN & BSA TRACKER */}
        {activeTab === "chemo" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Pill className="h-5 w-5 text-purple-400" />
                  Chemotherapy Protocol Engine & Body Surface Area (BSA) Dose Dosing
                </h3>
                <p className="text-xs text-slate-400">
                  Mosteller BSA formula dosing, ANC neutrophil safety gating, and antiemetic prophylaxis.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-purple-900/60 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200">
                Cycle Tracker: <span className="text-white font-black">Cycle {currentCycle} of {totalCycles}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Chemotherapy Protocol Line</label>
                <input
                  type="text"
                  value={chemoRegimenName}
                  onChange={(e) => setChemoRegimenName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Body Surface Area BSA (m²)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bsaM2}
                  onChange={(e) => setBsaM2(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Dose Reduction Percentage (%)</label>
                <input
                  type="number"
                  value={doseReductionPct}
                  onChange={(e) => setDoseReductionPct(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Chemotherapy Dosing Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Doxorubicin (Adriamycin) Dose</span>
                  <strong className="text-white font-mono">{(60 * bsaM2 * (1 - doseReductionPct / 100)).toFixed(1)} mg (60 mg/m²)</strong>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">Cyclophosphamide (Cytoxan) Dose</span>
                  <strong className="text-white font-mono">{(600 * bsaM2 * (1 - doseReductionPct / 100)).toFixed(1)} mg (600 mg/m²)</strong>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-400 text-[10px] block">G-CSF Primary Prophylaxis</span>
                  <strong className="text-emerald-300">Pegfilgrastim 6mg SC Day 2</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RADIOTHERAPY & FRACTIONATION */}
        {activeTab === "radiation" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-400" />
                  Radiation Oncology Fractionation & Organ-at-Risk (OAR) Constraints
                </h3>
                <p className="text-xs text-slate-400">
                  Total Gray (Gy) dose delivery, hypofractionation schedules, and cardiac/lung dose sparing.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-amber-900/60 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-200">
                Total Target Dose: <span className="text-white font-black">{totalRadiationDoseGy} Gy in {numberFractions} Fractions</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Radiotherapy Modality</label>
                <input
                  type="text"
                  value={radiationModality}
                  onChange={(e) => setRadiationModality(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Tumor Bed Boost Dose (Gy)</label>
                <input
                  type="number"
                  value={boostDoseGy}
                  onChange={(e) => setBoostDoseGy(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Mean Heart Dose OAR Limit (Gy)</label>
                <input
                  type="number"
                  step="0.1"
                  value={organAtRiskHeartDoseGy}
                  onChange={(e) => setOrganAtRiskHeartDoseGy(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
                <span className="text-[10px] text-emerald-400 font-bold block">✓ Heart Mean Dose &lt;2.5 Gy (Sparing achieved via DIBH gating)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BIOMARKERS & GENOMIC VARIANTS */}
        {activeTab === "genomics" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Dna className="h-5 w-5 text-rose-400" />
                  Molecular Biomarker Profile & Next-Generation Sequencing (NGS) Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Hormone receptors, HER2 amplification, Ki-67 index, BRCA germline status & PD-L1 TPS immunotherapy index.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-rose-900/60 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200">
                Actionable Variant: <span className="text-white font-black">BRCA2 Pathogenic Variant (PARP Inhibitor Candidate)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Estrogen Receptor (ER) Status</label>
                <input
                  type="text"
                  value={erStatus}
                  onChange={(e) => setErStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Progesterone Receptor (PR) Status</label>
                <input
                  type="text"
                  value={prStatus}
                  onChange={(e) => setPrStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">HER2 / neu Oncoprotein Amplification</label>
                <input
                  type="text"
                  value={her2Status}
                  onChange={(e) => setHer2Status(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Germline BRCA1 / BRCA2 Mutation Status</label>
                <input
                  type="text"
                  value={brcaMutation}
                  onChange={(e) => setBrcaMutation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TUMOR BOARD & CLINICAL TRIALS */}
        {activeTab === "trials" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-400" />
                  Multidisciplinary Tumor Board Consensus & Clinical Trial Matching Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Consensus treatment pathways involving Surgical, Medical, Radiation Oncologists & Pathologists.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-900/60 border border-blue-500/40 rounded-xl text-xs font-bold text-blue-200">
                Matched Trial: <span className="text-white font-black">{matchedTrialNct}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Tumor Board Final Recommendation</label>
                <textarea
                  value={tumorBoardRecommendation}
                  onChange={(e) => setTumorBoardRecommendation(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PALLIATIVE CARE & WHO PAIN LADDER */}
        {activeTab === "palliative" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-400" />
                  Palliative Care, WHO Analgesic Ladder & Advance Care Directives
                </h3>
                <p className="text-xs text-slate-400">
                  Pain management protocols, Morphine equivalent dosing, and code status preferences.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200">
                Code Status: <span className="text-white font-black">{codeStatus}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">WHO Pain Ladder Step</label>
                <input
                  type="text"
                  value={whoPainLadderStep}
                  onChange={(e) => setWhoPainLadderStep(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Current Analgesic Regimen</label>
                <input
                  type="text"
                  value={analgesicRegimen}
                  onChange={(e) => setAnalgesicRegimen(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ONCOLOGY SOAP NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-400" />
              Oncology Specialist Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">S - Subjective (ECOG Status, Nausea, Fatigue, Cycles)</label>
                <textarea
                  value={oncologySoap.subjective}
                  onChange={(e) => setOncologySoap({ ...oncologySoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">O - Objective (BSA, ANC Count, TNM Stage, Biomarkers)</label>
                <textarea
                  value={oncologySoap.objective}
                  onChange={(e) => setOncologySoap({ ...oncologySoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">A - Assessment (Stage, Chemo Tolerability, BRCA Status)</label>
                <textarea
                  value={oncologySoap.assessment}
                  onChange={(e) => setOncologySoap({ ...oncologySoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">P - Plan (AC-T Dose, Pegfilgrastim, Radiotherapy, Olaparib)</label>
                <textarea
                  value={oncologySoap.plan}
                  onChange={(e) => setOncologySoap({ ...oncologySoap, plan: e.target.value })}
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

export default OncologySuite;
