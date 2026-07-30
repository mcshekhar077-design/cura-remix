import React, { useState } from "react";
import {
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
  RefreshCw,
  Bone,
  Hand,
  Footprints,
  User,
  Scissors
} from "lucide-react";

export interface RheumatologySuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function RheumatologySuite({
  onBackToLanding,
  patientName = "Sunita Deshmukh",
  patientAge = 46,
  patientGender = "Female"
}: RheumatologySuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "das28_ra" | "sledai_lupus" | "basdai_spondylo" | "autoimmune_panel" | "dmard_biologics" | "soap"
  >("das28_ra");

  // 1. DAS28 Rheumatoid Arthritis Activity State
  const [tenderJointCount, setTenderJointCount] = useState<number>(6); // 0-28
  const [swollenJointCount, setSwollenJointCount] = useState<number>(4); // 0-28
  const [patientGlobalVas, setPatientGlobalVas] = useState<number>(55); // 0-100 mm
  const [esrMmHr, setEsrMmHr] = useState<number>(42); // mm/1st hr (Elevated >20)
  const [crpMgL, setCrpMgL] = useState<number>(18.5); // mg/L (Elevated >5)
  const [das28Score, setDas28Score] = useState<number>(4.38); // Moderate Activity (3.2 - 5.1)
  const [morningStiffnessMins, setMorningStiffnessMins] = useState<number>(75); // Mins

  // 2. SLEDAI-2K Lupus Index & Organ Involvement
  const [sledaiScore, setSledaiScore] = useState<number>(8); // Moderate Activity
  const [malarRash, setMalarRash] = useState<boolean>(true);
  const [lupusArthritis, setLupusArthritis] = useState<boolean>(true);
  const [proteinuriaGl, setProteinuriaGl] = useState<number>(0.8); // g/24h
  const [c3Complement, setC3Complement] = useState<number>(62); // mg/dL (Low <90)
  const [c4Complement, setC4Complement] = useState<number>(11); // mg/dL (Low <16)
  const [antiDsDnaTiter, setAntiDsDnaTiter] = useState<number>(180); // IU/mL (High Positive >30)

  // 3. BASDAI & Ankylosing Spondylitis / AxSpA State
  const [basdaiScore, setBasdaiScore] = useState<number>(5.2); // Active Disease (>4.0)
  const [hlaB27Status, setHlaB27Status] = useState<string>("Positive (Heterozygous)");
  const [modifiedSchoberTest, setModifiedSchoberTest] = useState<number>(3.5); // cm (Normal >5 cm expansion)
  const [sacroiliitisGrade, setSacroiliitisGrade] = useState<string>("Grade 3 Bilateral Sacroiliitis on MRI (Bone Marrow Edema)");

  // 4. Autoimmune Antibody & Inflammatory Panel
  const [anaTiterPattern, setAnaTiterPattern] = useState<string>("1:640 Homogeneous & Speckled Pattern");
  const [rheumatoidFactorRf, setRheumatoidFactorRf] = useState<number>(112); // IU/mL (Strongly Positive >20)
  const [antiCcpAntibody, setAntiCcpAntibody] = useState<number>(240); // U/mL (Strongly Positive >20)
  const [antiRoSsa, setAntiRoSsa] = useState<string>("Positive (Anti-Ro52 & Anti-Ro60)");
  const [antiLaSsb, setAntiLaSsb] = useState<string>("Negative");
  const [antiScl70, setAntiScl70] = useState<string>("Negative");
  const [serumUricAcid, setSerumUricAcid] = useState<number>(8.4); // mg/dL (Hyperuricemia >6.8)

  // 5. DMARDs, Biologics & Target Therapy Ledger
  const [activeRegimen, setActiveRegimen] = useState([
    {
      drug: "Methotrexate (MTX)",
      dosage: "15 mg / week orally + Folic Acid 5mg (6 days/wk)",
      category: "Conventional Synthetic DMARD (csDMARD)",
      startDate: "2025-04-10",
      status: "Active (Monitor LFT/CBC q8wks)"
    },
    {
      drug: "Adalimumab (TNF Inhibitor)",
      dosage: "40 mg SC Every 2 Weeks",
      category: "Biologic DMARD (bDMARD)",
      startDate: "2026-01-15",
      status: "Active (Mantoux/QuantiFERON TB Neg)"
    },
    {
      drug: "Hydroxychloroquine (HCQ)",
      dosage: "200 mg BD orally",
      category: "csDMARD / Antimalarial",
      startDate: "2025-04-10",
      status: "Active (Ophthalmology Fundus Screening Clear)"
    }
  ]);

  // 6. Rheumatology Consultation SOAP State
  const [rheumSoap, setRheumSoap] = useState({
    subjective:
      "46-year-old female with established Seropositive Rheumatoid Arthritis (3 yrs) and Secondary Sjögren's Syndrome presents with a 4-week history of polyarticular joint flare. Complains of persistent morning stiffness lasting >75 minutes, bilateral wrist and MCP/PIP joint swelling, severe hand fatigue, and dry mouth (xerostomia). Denies fever, shortness of breath, or skin ulcerations.",
    objective:
      "Joint Exam: 6 Tender Joints (Bilateral 2nd/3rd MCPs, Right Wrist, Left Ankle), 4 Swollen Joints (Right Wrist, PIPs). Patient Global VAS: 55/100.\nDAS28-ESR: 4.38 (Moderate Disease Activity).\nLabs: ESR 42 mm/hr, CRP 18.5 mg/L, RF 112 IU/mL (+), Anti-CCP 240 U/mL (+).\nLupus Screen: ANA 1:640, Anti-dsDNA 180 IU/mL, C3 62 mg/dL, C4 11 mg/dL.\nLiver & Renal Function: ALT 28 U/L, Creatinine 0.82 mg/dL (Normal).",
    assessment:
      "1. Seropositive Rheumatoid Arthritis in Moderate Disease Activity (DAS28 4.38) with polyarticular flare.\n2. Overlap Connective Tissue Syndrome / Mild Systemic Lupus Erythematosus (SLEDAI 8) with low complementemia and cutaneous/joint involvement.\n3. Secondary Sjögren's Syndrome with Ro/SSA positivity.",
    plan:
      "1. Escalate Methotrexate dose from 15mg to 20mg weekly + continue Folic Acid 5mg 6d/wk.\n2. Continue Adalimumab 40mg SC q2wks & Hydroxychloroquine 200mg BD.\n3. Short 2-week tapering pulse of Oral Deflazacort 12mg OD for flare suppression.\n4. Recheck DAS28, ESR, CRP, C3/C4 and CBC/LFT in 6 weeks.\n5. Artificial tears & salivary substitutes for sicca symptoms."
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
            <div className="p-2.5 bg-pink-600/20 border border-pink-500/30 rounded-xl">
              <Bone className="h-7 w-7 text-pink-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Rheumatology & Autoimmune AI Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full">
                  ACR / EULAR 2026 Guidelines
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                DAS28 RA Activity, SLEDAI-2K Lupus Index, BASDAI Spondyloarthritis, Autoimmune Antibody Panel & Biologic DMARDs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldAlert className="h-4 w-4 text-pink-400" />
            <span>AI Autoimmune Clinical Decision Support Active</span>
          </div>
        </div>

        {/* Patient Profile & Critical Autoimmune Metrics Banner */}
        <div className="bg-gradient-to-r from-pink-950/60 via-slate-800 to-slate-900 border border-pink-900/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center font-bold text-pink-300 text-lg">
              {patientName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{patientName}</h2>
                <span className="text-xs text-slate-400">({patientAge} Y/O, {patientGender})</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                  ID: RHE-2026-9924
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>DAS28-ESR: <strong className="text-pink-300 font-mono">{das28Score}</strong> (Moderate Activity)</span>
                <span className="text-slate-500">•</span>
                <span>SLEDAI: <strong className="text-amber-300 font-mono">{sledaiScore}</strong></span>
                <span className="text-slate-500">•</span>
                <span>Anti-CCP: <strong className="text-rose-300 font-mono">{antiCcpAntibody} U/mL</strong> (+)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-pink-900/60 border border-pink-500/50 rounded-xl text-xs font-bold text-pink-200">
              Joint Count: <span className="text-white font-black">{tenderJointCount} Tender / {swollenJointCount} Swollen</span>
            </div>
            <div className="px-3 py-1.5 bg-amber-900/60 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
              Biologic: <span className="text-white font-black">Adalimumab 40mg q2wk</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "das28_ra", label: "🩺 DAS28 RA Activity & 28-Joint Map", icon: Bone },
            { id: "sledai_lupus", label: "🦋 SLEDAI-2K Lupus Index & Organ Panel", icon: Sparkles },
            { id: "basdai_spondylo", label: "🦴 BASDAI & Spondyloarthritis Matrix", icon: Activity },
            { id: "autoimmune_panel", label: "🔬 Autoimmune Antibody & Inflammatory Panel", icon: TestTube },
            { id: "dmard_biologics", label: "💊 Biologics & DMARD Pharmacotherapy", icon: Pill },
            { id: "soap", label: "📝 Rheumatology SOAP Consultation Note", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-pink-600 text-white shadow-lg shadow-pink-900/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DAS28 RA ACTIVITY & 28-JOINT MAP */}
        {activeTab === "das28_ra" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bone className="h-5 w-5 text-pink-400" />
                  DAS28-ESR / DAS28-CRP Disease Activity Score Calculator
                </h3>
                <p className="text-xs text-slate-400">
                  28 Tender Joint Count, 28 Swollen Joint Count, Patient Global Health VAS (0-100mm), ESR (mm/hr), CRP (mg/L).
                </p>
              </div>

              <div className="px-3 py-1.5 bg-pink-900/80 border border-pink-500/50 rounded-xl text-xs font-bold text-pink-200">
                DAS28-ESR: <span className="text-white font-black">{das28Score}</span> (Moderate Activity 3.2 - 5.1)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-pink-300 block">Tender Joint Count (0-28)</label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  value={tenderJointCount}
                  onChange={(e) => setTenderJointCount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">MCP, PIP, Wrist, Elbow, Shoulder, Knee</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-pink-300 block">Swollen Joint Count (0-28)</label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  value={swollenJointCount}
                  onChange={(e) => setSwollenJointCount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Active Synovitis Assessment</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-pink-300 block">Patient Global Health VAS (0-100 mm)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={patientGlobalVas}
                  onChange={(e) => setPatientGlobalVas(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Visual Analog Scale Assessment</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-pink-300 block">Erythrocyte Sedimentation Rate ESR (mm/hr)</label>
                <input
                  type="number"
                  value={esrMmHr}
                  onChange={(e) => setEsrMmHr(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{esrMmHr > 20 ? "⚠️ Elevated (>20 mm/hr)" : "Normal"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SLEDAI-2K LUPUS INDEX & ORGAN PANEL */}
        {activeTab === "sledai_lupus" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  SLEDAI-2K Systemic Lupus Erythematosus Disease Activity Index
                </h3>
                <p className="text-xs text-slate-400">
                  Malar rash, Lupus Arthritis, Proteinuria (g/24h), Low Complement C3/C4, Anti-dsDNA titers.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-amber-900/80 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
                SLEDAI-2K: <span className="text-white font-black">{sledaiScore} Points</span> (Moderate Flare)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Anti-dsDNA Antibody Titer (IU/mL)</label>
                <input
                  type="number"
                  value={antiDsDnaTiter}
                  onChange={(e) => setAntiDsDnaTiter(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{antiDsDnaTiter > 30 ? "⚠️ High Positive (>30 IU/mL)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Complement C3 (mg/dL)</label>
                <input
                  type="number"
                  value={c3Complement}
                  onChange={(e) => setC3Complement(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{c3Complement < 90 ? "⚠️ Hypocomplementemia (<90 mg/dL)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Complement C4 (mg/dL)</label>
                <input
                  type="number"
                  value={c4Complement}
                  onChange={(e) => setC4Complement(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{c4Complement < 16 ? "⚠️ Hypocomplementemia (<16 mg/dL)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">24-Hour Urinary Protein (g/24h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={proteinuriaGl}
                  onChange={(e) => setProteinuriaGl(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{proteinuriaGl > 0.5 ? "⚠️ Lupus Nephritis Risk (>0.5g)" : "Normal"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BASDAI & SPONDYLOARTHRITIS MATRIX */}
        {activeTab === "basdai_spondylo" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  BASDAI Bath Ankylosing Spondylitis Disease Activity Index
                </h3>
                <p className="text-xs text-slate-400">
                  HLA-B27 allele typing, Modified Schober spinal mobility test (cm), Sacroiliitis MRI grading.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-900/80 border border-blue-500/50 rounded-xl text-xs font-bold text-blue-200">
                BASDAI Score: <span className="text-white font-black">{basdaiScore} / 10</span> (&gt;4.0 Active Disease)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-blue-300 block">HLA-B27 Immunogenetic Allele Status</span>
                <input
                  type="text"
                  value={hlaB27Status}
                  onChange={(e) => setHlaB27Status(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Axial Spondyloarthritis Biomarker</span>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-blue-300 block">Modified Schober Lumbar Flexion Test (cm expansion)</span>
                <input
                  type="number"
                  step="0.5"
                  value={modifiedSchoberTest}
                  onChange={(e) => setModifiedSchoberTest(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{modifiedSchoberTest < 5 ? "⚠️ Reduced Lumbar Mobility (<5 cm)" : "Normal Flexion"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTOIMMUNE ANTIBODY & INFLAMMATORY PANEL */}
        {activeTab === "autoimmune_panel" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-rose-400" />
                  Autoimmune Serology, ENA Panel & Inflammatory Markers
                </h3>
                <p className="text-xs text-slate-400">
                  ANA IFA Titer/Pattern, Rheumatoid Factor (RF), Anti-CCP, Anti-Ro/SSA, Anti-La/SSB, Anti-Scl-70, Serum Uric Acid.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-rose-900/80 border border-rose-500/50 rounded-xl text-xs font-bold text-rose-200">
                ANA IFA: <span className="text-white font-black">{anaTiterPattern}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-rose-300 block">Rheumatoid Factor RF (IU/mL)</label>
                <input
                  type="number"
                  value={rheumatoidFactorRf}
                  onChange={(e) => setRheumatoidFactorRf(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{rheumatoidFactorRf > 20 ? "⚠️ Seropositive (>20 IU/mL)" : "Negative"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-rose-300 block">Anti-Cyclic Citrullinated Peptide CCP (U/mL)</label>
                <input
                  type="number"
                  value={antiCcpAntibody}
                  onChange={(e) => setAntiCcpAntibody(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{antiCcpAntibody > 20 ? "⚠️ High Specificity RA (>20 U/mL)" : "Negative"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-rose-300 block">C-Reactive Protein CRP (mg/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={crpMgL}
                  onChange={(e) => setCrpMgL(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{crpMgL > 5 ? "⚠️ Acute Inflammation (>5 mg/L)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-rose-300 block">Serum Uric Acid (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={serumUricAcid}
                  onChange={(e) => setSerumUricAcid(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{serumUricAcid > 6.8 ? "⚠️ Gout / Hyperuricemia (>6.8)" : "Normal"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BIOLOGICS & DMARD PHARMACOTHERAPY LEDGER */}
        {activeTab === "dmard_biologics" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Pill className="h-5 w-5 text-emerald-400" />
                  Targeted Pharmacotherapy & Biologic DMARD Safety Log
                </h3>
                <p className="text-xs text-slate-400">
                  csDMARDs (Methotrexate, HCQ), bDMARDs (TNF/IL-6 Inhibitors), tsDMARDs (JAK Inhibitors), and TB/Ophthalmic screening.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/80 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-200">
                Active Regimen: <span className="text-white font-black">{activeRegimen.length} Agents</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {activeRegimen.map((med, idx) => (
                <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-bold">{med.drug}</strong>
                      <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded text-[10px]">
                        {med.category}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">Since {med.startDate}</span>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    Dosage: <strong className="text-white">{med.dosage}</strong>
                  </div>

                  <div className="text-[10px] text-emerald-400">
                    Safety Status: <span>{med.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: RHEUMATOLOGY SOAP CONSULTATION NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-pink-400" />
              Rheumatology Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-300">S - Subjective (Morning Stiffness, Polyarticular Joint Pain, Fatigue, Sicca Symptoms)</label>
                <textarea
                  value={rheumSoap.subjective}
                  onChange={(e) => setRheumSoap({ ...rheumSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-300">O - Objective (Joint Count, DAS28-ESR, ESR/CRP, RF, Anti-CCP, ANA & Complements)</label>
                <textarea
                  value={rheumSoap.objective}
                  onChange={(e) => setRheumSoap({ ...rheumSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-300">A - Assessment (Seropositive RA Moderate Flare, Overlap Connective Tissue Disease, Sjögren's)</label>
                <textarea
                  value={rheumSoap.assessment}
                  onChange={(e) => setRheumSoap({ ...rheumSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-300">P - Plan (Methotrexate Escalation, Adalimumab, Hydroxychloroquine, Steroid Pulse)</label>
                <textarea
                  value={rheumSoap.plan}
                  onChange={(e) => setRheumSoap({ ...rheumSoap, plan: e.target.value })}
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

export default RheumatologySuite;
