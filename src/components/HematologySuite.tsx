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
  Syringe
} from "lucide-react";

export interface HematologySuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function HematologySuite({
  onBackToLanding,
  patientName = "Devendra Roy",
  patientAge = 54,
  patientGender = "Male"
}: HematologySuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "cbc_differential" | "anemia_hemoglobinopathy" | "coagulation_panel" | "leukemia_bonemarrow" | "transfusion_ledger" | "soap"
  >("cbc_differential");

  // 1. Complete Blood Count (CBC) & Differential State
  const [hemoglobin, setHemoglobin] = useState<number>(9.4); // g/dL (Low, Normal 13-17)
  const [hematocrit, setHematocrit] = useState<number>(29.5); // % (Low)
  const [mcv, setMcv] = useState<number>(71.2); // fL (Microcytic <80)
  const [mch, setMch] = useState<number>(22.4); // pg (Hypochromic <27)
  const [mchc, setMchc] = useState<number>(31.5); // g/dL
  const [rdw, setRdw] = useState<number>(18.5); // % (Elevated >14.5% indicates anisocytosis)

  const [wbcCount, setWbcCount] = useState<number>(11.8); // x10^3/µL
  const [neutrophilPct, setNeutrophilPct] = useState<number>(68); // %
  const [lymphocytePct, setLymphocytePct] = useState<number>(22); // %
  const [monocytePct, setMonocytePct] = useState<number>(7); // %
  const [eosinophilPct, setEosinophilPct] = useState<number>(3); // %
  const [plateletCount, setPlateletCount] = useState<number>(385); // x10^3/µL
  const [mpv, setMpv] = useState<number>(9.8); // fL

  // 2. Anemia & Hemoglobinopathy Matrix
  const [anemiaSubtype, setAnemiaSubtype] = useState<string>("Microcytic Hypochromic Anemia secondary to Iron Deficiency vs Beta Thalassemia Trait");
  const [serumFerritin, setSerumFerritin] = useState<number>(12); // ng/mL (Low <30)
  const [serumIron, setSerumIron] = useState<number>(38); // µg/dL (Low)
  const [tibc, setTibc] = useState<number>(440); // µg/dL (High TIBC)
  const [hbA2Electrophoresis, setHbA2Electrophoresis] = useState<number>(2.4); // % (<3.5 rules out B-Thal minor)
  const [hbFElectrophoresis, setHbFElectrophoresis] = useState<number>(0.8); // %

  // 3. Coagulation & Hemostasis Panel
  const [prothrombinTimePt, setProthrombinTimePt] = useState<number>(13.2); // seconds
  const [inr, setInr] = useState<number>(1.12);
  const [apttSeconds, setApttSeconds] = useState<number>(31.5); // seconds
  const [fibrinogenMgDl, setFibrinogenMgDl] = useState<number>(310); // mg/dL
  const [dDimerUgl, setDDimerUgl] = useState<number>(0.38); // µg/mL (Normal <0.5)
  const [factorViiiLevelPct, setFactorViiiLevelPct] = useState<number>(95); // % (Normal 50-150%)

  // 4. Bone Marrow Biopsy & Molecular Markers
  const [boneMarrowCellularity, setBoneMarrowCellularity] = useState<string>("Hypercellular bone marrow with erythroid hyperplasia and absent stainable iron (Prussian Blue Grade 0)");
  const [blastPercentage, setBlastPercentage] = useState<number>(1.2); // % (<5% Normal)
  const [philadelphiaChromosome, setPhiladelphiaChromosome] = useState<string>("Negative BCR-ABL1 fusion transcript by quantitative RT-PCR");
  const [flt3MutationStatus, setFlt3MutationStatus] = useState<string>("FLT3-ITD Negative / NPM1 Wild-Type");

  // 5. Blood Transfusion Ledger
  const [transfusionHistory, setTransfusionHistory] = useState([
    {
      date: "2026-06-12",
      product: "Packed Red Blood Cells (PRBC)",
      units: 2,
      bloodGroup: "O Positive (Rh+)",
      crossMatch: "Compatible (IAT Negative)",
      preHb: "6.8 g/dL",
      postHb: "8.9 g/dL",
      reaction: "None (TACO/TRALI Negative)"
    },
    {
      date: "2026-04-01",
      product: "Single Donor Platelets (SDP)",
      units: 1,
      bloodGroup: "O Positive (Rh+)",
      crossMatch: "Compatible",
      preHb: "N/A (Platelets 18,000)",
      postHb: "N/A (Platelets 62,000)",
      reaction: "Mild Febrile Non-Hemolytic Reaction (Managed with Paracetamol)"
    }
  ]);

  // 6. Hematology Consultation SOAP State
  const [hematoSoap, setHematoSoap] = useState({
    subjective:
      "54-year-old male presents with 3-month history of severe fatigue, generalized weakness, exertional dyspnea (NYHA Class II), cold intolerance, and restless legs. Denies overt GI bleeding, hematuria, or melena. Known vegetarians for 15 years.",
    objective:
      "Physical Exam: Marked conjunctival and palmar pallor, mild koilonychia (spoon nails), angular cheilitis. No splenomegaly or lymphadenopathy.\nCBC: Hb 9.4 g/dL, Hct 29.5%, MCV 71.2 fL (Microcytic), MCH 22.4 pg (Hypochromic), RDW 18.5% (Anisocytosis).\nIron Profile: Serum Ferritin 12 ng/mL, Serum Iron 38 µg/dL, TIBC 440 µg/dL (Saturation 8.6%).\nHb Electrophoresis: HbA2 2.4%, HbF 0.8% (Rules out Beta-Thalassemia Trait).\nCoagulation: PT 13.2s, INR 1.12, APTT 31.5s.",
    assessment:
      "1. Severe Microcytic Hypochromic Anemia secondary to Nutritional Iron Deficiency.\n2. Normal Coagulation Profile (PT/INR/APTT intact).\n3. Bone Marrow Aspirate (historical): Erythroid hyperplasia with depleted reticuloendothelial iron stores.",
    plan:
      "1. Initiate Oral Ferrous Ascorbate 100mg elemental iron + Vitamin C 500mg BD on empty stomach.\n2. Order Upper GI Endoscopy & Colonoscopy to rule out occult GI blood loss.\n3. Recheck CBC & Serum Ferritin in 6 weeks (Target Hb rise >1.5 g/dL in 30 days).\n4. Dietary counseling for iron-rich fortified foods."
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
            <div className="p-2.5 bg-red-600/20 border border-red-500/30 rounded-xl">
              <Droplet className="h-7 w-7 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Hematology & Transfusion Medicine AI Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 rounded-full">
                  ASH 2026 Guidelines
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                CBC Differential, Iron & Electrophoresis Panel, Coagulation Cascade, Bone Marrow Blasts & Transfusion Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <span>AI Hematology Diagnostic Assistant Active</span>
          </div>
        </div>

        {/* Patient Profile & Critical Blood Metrics Banner */}
        <div className="bg-gradient-to-r from-red-950/60 via-slate-800 to-slate-900 border border-red-900/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center font-bold text-red-300 text-lg">
              {patientName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{patientName}</h2>
                <span className="text-xs text-slate-400">({patientAge} Y/O, {patientGender})</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                  ID: HEM-2026-7719
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Hemoglobin: <strong className="text-red-300 font-mono">{hemoglobin} g/dL</strong> (Low)</span>
                <span className="text-slate-500">•</span>
                <span>MCV: <strong className="text-amber-300 font-mono">{mcv} fL</strong> (Microcytic)</span>
                <span className="text-slate-500">•</span>
                <span>Serum Ferritin: <strong className="text-rose-300 font-mono">{serumFerritin} ng/mL</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-red-900/60 border border-red-500/50 rounded-xl text-xs font-bold text-red-200">
              Coagulation: <span className="text-white font-black">PT {prothrombinTimePt}s | INR {inr}</span>
            </div>
            <div className="px-3 py-1.5 bg-amber-900/60 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
              Blasts: <span className="text-white font-black">{blastPercentage}% (Normal &lt;5%)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "cbc_differential", label: "🩸 Complete Blood Count (CBC) & Differential", icon: Microscope },
            { id: "anemia_hemoglobinopathy", label: "🔬 Anemia & Hb Electrophoresis Matrix", icon: TestTube },
            { id: "coagulation_panel", label: "🫀 Coagulation Cascade & INR Panel", icon: Activity },
            { id: "leukemia_bonemarrow", label: "🧬 Bone Marrow & Molecular Blasts", icon: Dna },
            { id: "transfusion_ledger", label: "💉 Blood Product Transfusion Ledger", icon: Syringe },
            { id: "soap", label: "📝 Hematology SOAP Consultation Note", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: COMPLETE BLOOD COUNT (CBC) & DIFFERENTIAL */}
        {activeTab === "cbc_differential" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Microscope className="h-5 w-5 text-red-400" />
                  Automated Complete Blood Count (CBC) & White Cell Differential
                </h3>
                <p className="text-xs text-slate-400">
                  Hemoglobin (g/dL), Hematocrit (%), MCV (fL), MCH (pg), RDW (%), WBC Count (10^3/µL), and Platelets.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-red-900/80 border border-red-500/50 rounded-xl text-xs font-bold text-red-200">
                Primary Finding: <span className="text-white font-black">Severe Microcytic Anemia</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-red-300 block">Hemoglobin (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{hemoglobin < 12 ? "⚠️ Anemia (<12.0 g/dL)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-red-300 block">Hematocrit (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={hematocrit}
                  onChange={(e) => setHematocrit(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Normal 38-50%</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-red-300 block">MCV - Mean Corpuscular Volume (fL)</label>
                <input
                  type="number"
                  step="0.5"
                  value={mcv}
                  onChange={(e) => setMcv(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{mcv < 80 ? "⚠️ Microcytic (<80 fL)" : "Normocytic"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-red-300 block">MCH - Mean Corpuscular Hb (pg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mch}
                  onChange={(e) => setMch(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{mch < 27 ? "⚠️ Hypochromic (<27 pg)" : "Normochromic"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-red-300 block">RDW - Red Cell Distribution Width (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rdw}
                  onChange={(e) => setRdw(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{rdw > 14.5 ? "⚠️ Anisocytosis (>14.5%)" : "Normal Uniformity"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-red-300 block">Platelet Count (x10^3/µL)</label>
                <input
                  type="number"
                  value={plateletCount}
                  onChange={(e) => setPlateletCount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Normal 150-450k</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANEMIA & HEMOGLOBINOPATHY MATRIX */}
        {activeTab === "anemia_hemoglobinopathy" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-amber-400" />
                  Iron Profile & Hemoglobin Electrophoresis HPLC Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Serum Ferritin (ng/mL), TIBC, HbA2 %, HbF % for Iron Deficiency vs Thalassemia / Sickle Cell Trait.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-amber-900/80 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
                Subtype: <span className="text-white font-black">{anemiaSubtype}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Serum Ferritin (ng/mL)</label>
                <input
                  type="number"
                  value={serumFerritin}
                  onChange={(e) => setSerumFerritin(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{serumFerritin < 30 ? "⚠️ Iron Deficiency (<30 ng/mL)" : "Normal Stores"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">TIBC - Total Iron Binding Capacity (µg/dL)</label>
                <input
                  type="number"
                  value={tibc}
                  onChange={(e) => setTibc(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{tibc > 400 ? "⚠️ Elevated (>400 µg/dL)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">HbA2 Electrophoresis (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hbA2Electrophoresis}
                  onChange={(e) => setHbA2Electrophoresis(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{hbA2Electrophoresis > 3.5 ? "⚠️ Beta-Thalassemia Trait (>3.5%)" : "Normal (<3.5%)"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">HbF Fetal Hemoglobin (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hbFElectrophoresis}
                  onChange={(e) => setHbFElectrophoresis(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Normal &lt;2.0%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COAGULATION CASCADE & INR PANEL */}
        {activeTab === "coagulation_panel" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Coagulation Cascade, Prothrombin Time & INR Panel
                </h3>
                <p className="text-xs text-slate-400">
                  PT (seconds), INR, APTT (seconds), Fibrinogen (mg/dL), D-Dimer (µg/mL) and Factor VIII/IX activities.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-900/80 border border-blue-500/50 rounded-xl text-xs font-bold text-blue-200">
                INR: <span className="text-white font-black">{inr}</span> (Normal Homeostasis)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">Prothrombin Time PT (seconds)</label>
                <input
                  type="number"
                  step="0.1"
                  value={prothrombinTimePt}
                  onChange={(e) => setProthrombinTimePt(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Normal 11.0-13.5s</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">INR (International Normalized Ratio)</label>
                <input
                  type="number"
                  step="0.05"
                  value={inr}
                  onChange={(e) => setInr(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Target 2.0-3.0 for Warfarin</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">APTT (seconds)</label>
                <input
                  type="number"
                  step="0.5"
                  value={apttSeconds}
                  onChange={(e) => setApttSeconds(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Normal 25-35s</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">D-Dimer (µg/mL FEU)</label>
                <input
                  type="number"
                  step="0.05"
                  value={dDimerUgl}
                  onChange={(e) => setDDimerUgl(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{dDimerUgl > 0.5 ? "⚠️ High VTE Risk (>0.5)" : "Normal (<0.5)"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BONE MARROW & MOLECULAR BLASTS */}
        {activeTab === "leukemia_bonemarrow" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Dna className="h-5 w-5 text-purple-400" />
                  Bone Marrow Aspirate, Cytogenetics & Molecular Markers
                </h3>
                <p className="text-xs text-slate-400">
                  Blast count %, Philadelphia chromosome (BCR-ABL1), FLT3/NPM1 mutation status, and Prussian Blue iron stain.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-purple-900/80 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200">
                Blast Count: <span className="text-white font-black">{blastPercentage}%</span> (Normal Remission)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-300 block">Bone Marrow Aspirate & Biopsy Morphology</span>
                <textarea
                  value={boneMarrowCellularity}
                  onChange={(e) => setBoneMarrowCellularity(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-300 block">Philadelphia Chromosome (BCR-ABL1) RT-PCR</span>
                <input
                  type="text"
                  value={philadelphiaChromosome}
                  onChange={(e) => setPhiladelphiaChromosome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                />
                <span className="font-bold text-purple-300 block mt-2">AML Molecular Markers (FLT3 / NPM1)</span>
                <input
                  type="text"
                  value={flt3MutationStatus}
                  onChange={(e) => setFlt3MutationStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BLOOD PRODUCT TRANSFUSION LEDGER */}
        {activeTab === "transfusion_ledger" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Syringe className="h-5 w-5 text-rose-400" />
                  Blood Product Transfusion History & Safety Log
                </h3>
                <p className="text-xs text-slate-400">
                  PRBC, Platelets, FFP, Cross-match verification, Pre/Post Hemoglobin gains, and TRALI/TACO reaction reports.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-rose-900/80 border border-rose-500/50 rounded-xl text-xs font-bold text-rose-200">
                Total Transfusions: <span className="text-white font-black">{transfusionHistory.length} Sessions</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {transfusionHistory.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-bold">{item.product}</strong>
                      <span className="px-2 py-0.5 bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded text-[10px] font-mono">
                        {item.units} Unit(s)
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{item.date}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 border-t border-slate-850 pt-2">
                    <div>Blood Group: <strong className="text-white">{item.bloodGroup}</strong></div>
                    <div>Cross Match: <strong className="text-emerald-400">{item.crossMatch}</strong></div>
                    <div>Pre/Post Hb: <strong className="text-amber-300">{item.preHb} → {item.postHb}</strong></div>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Reaction Log: <span className="text-slate-200">{item.reaction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: HEMATOLOGY SOAP CONSULTATION NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-400" />
              Hematology Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">S - Subjective (Fatigue, Pallor, Bleeding, Diet, Restless Legs)</label>
                <textarea
                  value={hematoSoap.subjective}
                  onChange={(e) => setHematoSoap({ ...hematoSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">O - Objective (CBC Profile, Iron Studies, Hb Electrophoresis & Coagulation)</label>
                <textarea
                  value={hematoSoap.objective}
                  onChange={(e) => setHematoSoap({ ...hematoSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">A - Assessment (Iron Deficiency Anemia vs Thalassemia, Bone Marrow Status)</label>
                <textarea
                  value={hematoSoap.assessment}
                  onChange={(e) => setHematoSoap({ ...hematoSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">P - Plan (Ferrous Ascorbate, GI Endoscopy, Repeat CBC & Ferritin)</label>
                <textarea
                  value={hematoSoap.plan}
                  onChange={(e) => setHematoSoap({ ...hematoSoap, plan: e.target.value })}
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

export default HematologySuite;
