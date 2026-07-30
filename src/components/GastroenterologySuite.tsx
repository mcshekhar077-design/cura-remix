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
  Ambulance,
  Monitor,
  HeartPulse,
  Droplet
} from "lucide-react";

export interface GastroenterologySuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function GastroenterologySuite({
  onBackToLanding,
  patientName = "Anil Kulkarni",
  patientAge = 52,
  patientGender = "Male"
}: GastroenterologySuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "endoscopy_polyp" | "ibd_mayo" | "hepatology_meld" | "pancreato_gbs" | "gi_biologics" | "soap"
  >("endoscopy_polyp");

  // 1. Endoscopy & AI Polyp CADe / CADx Detection State
  const [endoscopyType, setEndoscopyType] = useState<string>("Full High-Definition Colonoscopy + AI Real-Time CADe Polyp Detection");
  const [polypCount, setPolypCount] = useState<number>(3);
  const [largestPolypSizeMm, setLargestPolypSizeMm] = useState<number>(12); // mm
  const [parisClassification, setParisClassification] = useState<string>("Is (Sessile) Transverse Colon & IIa (Flat) Cecum");
  const [mayoEndoscopicSubscore, setMayoEndoscopicSubscore] = useState<number>(2); // 0-3 (Moderate Colitis)
  const [adenomaDetectionRateAdr, setAdenomaDetectionRateAdr] = useState<number>(38.5); // %
  const [biopsyHistologyStatus, setBiopsyHistologyStatus] = useState<string>("Tubular Adenoma with Low-Grade Dysplasia (Polypectomy Complete)");

  // 2. IBD Activity Index (Crohn's CDAI & Ulcerative Colitis Mayo Score) State
  const [ibdType, setIbdType] = useState<string>("Ulcerative Colitis (Extensive / Left-Sided Colitis)");
  const [partialMayoScore, setPartialMayoScore] = useState<number>(6); // 0-9 (Moderate Activity)
  const [fecalCalprotectin, setFecalCalprotectin] = useState<number>(480); // ug/g (Elevated >150)
  const [stoolFrequencyDaily, setStoolFrequencyDaily] = useState<number>(5); // /day
  const [rectalBleedingGrade, setRectalBleedingGrade] = useState<string>("Grade 2 (Visible blood with most stools)");

  // 3. Hepatology, Child-Pugh Class & MELD-Na Score State
  const [totalBilirubin, setTotalBilirubin] = useState<number>(2.4); // mg/dL
  const [serumCreatinine, setSerumCreatinine] = useState<number>(1.1); // mg/dL
  const [inrRatio, setInrRatio] = useState<number>(1.35);
  const [serumSodium, setSerumSodium] = useState<number>(134); // mEq/L
  const [meldNaScore, setMeldNaScore] = useState<number>(16); // 6-40
  const [childPughClass, setChildPughClass] = useState<string>("Class B (7 Points - Intermediate Risk)");
  const [fibroScanKpa, setFibroScanKpa] = useState<number>(14.2); // kPa (F4 Advanced Fibrosis / Cirrhosis)
  const [fib4Index, setFib4Index] = useState<number>(3.65); // High risk (>2.67)

  // 4. Pancreato-Biliary & GI Bleeding Risk (GBS & Rockall) State
  const [glasgowBlatchfordScore, setGlasgowBlatchfordScore] = useState<number>(8); // High Risk (>6 needs urgent endoscopy)
  const [hemoglobinGdl, setHemoglobinGdl] = useState<number>(9.8); // g/dL
  const [serumLipase, setSerumLipase] = useState<number>(145); // U/L (Normal <60)
  const [serumAmylase, setSerumAmylase] = useState<number>(88); // U/L

  // 5. GI Biologics, Small Molecules & Targeted Therapy State
  const [giMedications, setGiMedications] = useState([
    {
      drug: "Infliximab (Anti-TNF Alpha Biologic)",
      dosage: "5 mg/kg IV Infusion (Weeks 0, 2, 6, then q8wks)",
      indication: "Ulcerative Colitis Moderate-Severe Flare",
      troughLevel: "8.4 mcg/mL (Therapeutic Target >5.0)",
      antiDrugAntibody: "Negative (<10 U/mL)"
    },
    {
      drug: "Mesalamine (5-ASA / Sal 小 5-Aminosalicylate)",
      dosage: "4.8 g/day orally (Delayed-Release Tablet)",
      indication: "Colonic Mucosal Maintenance",
      troughLevel: "N/A",
      antiDrugAntibody: "N/A"
    },
    {
      drug: "Vonoprazan / Esomeprazole",
      dosage: "20 mg OD orally",
      indication: "Potent Acid Suppression / Erosive Esophagitis",
      troughLevel: "N/A",
      antiDrugAntibody: "N/A"
    }
  ]);

  // 6. Gastroenterology Consultation SOAP State
  const [giSoap, setGiSoap] = useState({
    subjective:
      "52-year-old male with known Ulcerative Colitis (Left-sided, 4 yrs) and NAFLD with early cirrhosis presents with a 3-week flare of loose bloody stools (5-6/day), tenesmus, and crampy lower abdominal pain. Complains of fatigue and mild nocturnal bowel urgencies. Denies hematemesis, jaundice, or fever.",
    objective:
      "Abdomen: Soft, non-distended, mild left lower quadrant tenderness without rebound or guarding. No ascites.\nEndoscopy: Colonoscopy shows continuous loss of vascular pattern, mucosal erythema, friability, and erosions in sigmoid colon (Mayo Endoscopic Subscore 2). 3 polyps identified with AI CADe and resected via snare (Tubular Adenoma).\nLabs: Fecal Calprotectin 480 ug/g. Hb 9.8 g/dL, Total Bilirubin 2.4 mg/dL, INR 1.35, Sodium 134 mEq/L, Creatinine 1.1 mg/dL.\nCalculated Scores: Partial Mayo Score 6 | MELD-Na Score 16 (Child-Pugh Class B) | FibroScan 14.2 kPa (F4) | Glasgow-Blatchford Score 8.",
    assessment:
      "1. Ulcerative Colitis in Moderate Active Flare (Partial Mayo 6, Mayo Endoscopic Subscore 2, Calprotectin 480 ug/g).\n2. Resected Transverse & Cecal Adenomatous Polyps (Adenoma Detection Rate 38.5%).\n3. Compensated NAFLD Cirrhosis (Child-Pugh Class B, MELD-Na 16) without active variceal bleed.",
    plan:
      "1. Initiate Infliximab biologic induction protocol (5 mg/kg IV at 0, 2, 6 weeks) combined with Mesalamine 4.8g/day.\n2. Short 4-week tapering pulse of Oral Budesonide MMX (9mg OD) for localized mucosal healing.\n3. Schedule repeat Fecal Calprotectin and Infliximab trough level check in 8 weeks.\n4. Annual surveillance colonoscopy for dysplasia screening given 8+ year UC history."
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
            <div className="p-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded-xl">
              <Activity className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Gastroenterology & Hepatology AI Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  ACG / AGA 2026 Guidelines
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI Endoscopy Polyp Detection, Mayo IBD Activity, MELD-Na / Child-Pugh Hepatology, GBS Bleed Risk & Biologics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            <span>AI Endoscopy & Hepatic AI Engine Active</span>
          </div>
        </div>

        {/* Patient Profile & Critical GI Metrics Banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-800 to-slate-900 border border-emerald-900/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-emerald-300 text-lg">
              {patientName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{patientName}</h2>
                <span className="text-xs text-slate-400">({patientAge} Y/O, {patientGender})</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                  ID: GIO-2026-7712
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>UC Partial Mayo: <strong className="text-emerald-300 font-mono">{partialMayoScore}</strong> (Moderate)</span>
                <span className="text-slate-500">•</span>
                <span>Calprotectin: <strong className="text-amber-300 font-mono">{fecalCalprotectin} µg/g</strong></span>
                <span className="text-slate-500">•</span>
                <span>MELD-Na: <strong className="text-rose-300 font-mono">{meldNaScore}</strong> ({childPughClass})</span>
                <span className="text-slate-500">•</span>
                <span>ADR Rate: <strong className="text-sky-300 font-mono">{adenomaDetectionRateAdr}%</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-200">
              Mayo Subscore: <span className="text-white font-black">Grade {mayoEndoscopicSubscore}</span>
            </div>
            <div className="px-3 py-1.5 bg-amber-900/60 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
              Biologic: <span className="text-white font-black">Infliximab 5mg/kg</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "endoscopy_polyp", label: "🔬 Endoscopy & AI Polyp Detection (CADe)", icon: Camera },
            { id: "ibd_mayo", label: "🩺 IBD Disease Activity & Calprotectin", icon: Activity },
            { id: "hepatology_meld", label: "🧪 Hepatology, MELD-Na & FibroScan", icon: FlaskConical },
            { id: "pancreato_gbs", label: "⚡ GBS Bleed Risk & Pancreato-Biliary", icon: ShieldAlert },
            { id: "gi_biologics", label: "💊 GI Biologics & Small Molecule Log", icon: Pill },
            { id: "soap", label: "📝 Gastroenterology SOAP Note", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ENDOSCOPY & AI POLYP DETECTION */}
        {activeTab === "endoscopy_polyp" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="h-5 w-5 text-emerald-400" />
                  HD Colonoscopy & Real-Time Computer-Aided Polyp Detection (CADe / CADx)
                </h3>
                <p className="text-xs text-slate-400">
                  Mayo Endoscopic Subscore (0-3), Paris Classification, Adenoma Detection Rate (ADR %), Histology Polypectomy.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/80 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-200">
                ADR Benchmark: <span className="text-white font-black">{adenomaDetectionRateAdr}% (&gt;25% Quality Met)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-emerald-300 block">Mayo Endoscopic Subscore (0-3)</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={mayoEndoscopicSubscore}
                  onChange={(e) => setMayoEndoscopicSubscore(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Grade 2: Moderate Friability & Erosions</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-emerald-300 block">AI Detected Polyps Count</label>
                <input
                  type="number"
                  value={polypCount}
                  onChange={(e) => setPolypCount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Resected via Snare / Forceps</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-emerald-300 block">Largest Polyp Size (mm)</label>
                <input
                  type="number"
                  value={largestPolypSizeMm}
                  onChange={(e) => setLargestPolypSizeMm(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Paris Classification {parisClassification}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-emerald-300 block">Adenoma Detection Rate ADR (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={adenomaDetectionRateAdr}
                  onChange={(e) => setAdenomaDetectionRateAdr(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Endoscopist Quality Metric</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IBD DISEASE ACTIVITY & CALPROTECTIN */}
        {activeTab === "ibd_mayo" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-400" />
                  Inflammatory Bowel Disease (IBD) Partial Mayo & Fecal Calprotectin
                </h3>
                <p className="text-xs text-slate-400">
                  Stool Frequency, Rectal Bleeding Grade, Fecal Calprotectin (µg/g), Biologic Induction readiness.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-amber-900/80 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
                Calprotectin: <span className="text-white font-black">{fecalCalprotectin} µg/g</span> (Active Colitis Flare)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Partial Mayo Score (0-9)</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  value={partialMayoScore}
                  onChange={(e) => setPartialMayoScore(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Moderate Colitis Flare (5-7)</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Fecal Calprotectin (µg/g)</label>
                <input
                  type="number"
                  value={fecalCalprotectin}
                  onChange={(e) => setFecalCalprotectin(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{fecalCalprotectin > 150 ? "⚠️ Mucosal Inflammation (>150 µg/g)" : "Remission"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Daily Stool Frequency</label>
                <input
                  type="number"
                  value={stoolFrequencyDaily}
                  onChange={(e) => setStoolFrequencyDaily(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Bowel Movements / 24 hrs</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">IBD Classification</label>
                <input
                  type="text"
                  value={ibdType}
                  onChange={(e) => setIbdType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Left-sided / Extensive Colitis</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HEPATOLOGY, MELD-NA & FIBROSCAN */}
        {activeTab === "hepatology_meld" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-rose-400" />
                  MELD-Na Score, Child-Pugh Class & FibroScan Transient Elastography
                </h3>
                <p className="text-xs text-slate-400">
                  Total Bilirubin (mg/dL), INR, Serum Sodium (mEq/L), Serum Creatinine, FibroScan (kPa), FIB-4 Index.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-rose-900/80 border border-rose-500/50 rounded-xl text-xs font-bold text-rose-200">
                MELD-Na Score: <span className="text-white font-black">{meldNaScore}</span> ({childPughClass})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-rose-300 block">Total Serum Bilirubin (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={totalBilirubin}
                  onChange={(e) => setTotalBilirubin(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{totalBilirubin > 1.2 ? "⚠️ Hyperbilirubinemia (>1.2 mg/dL)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-rose-300 block">Prothrombin Time INR Ratio</label>
                <input
                  type="number"
                  step="0.05"
                  value={inrRatio}
                  onChange={(e) => setInrRatio(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{inrRatio > 1.1 ? "⚠️ Coagulopathy Impairment" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-rose-300 block">FibroScan Liver Stiffness (kPa)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fibroScanKpa}
                  onChange={(e) => setFibroScanKpa(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{fibroScanKpa >= 12.5 ? "⚠️ F4 Advanced Fibrosis / Cirrhosis" : "Mild Fibrosis"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-rose-300 block">FIB-4 Non-Invasive Score</label>
                <input
                  type="number"
                  step="0.01"
                  value={fib4Index}
                  onChange={(e) => setFib4Index(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{fib4Index > 2.67 ? "⚠️ High Risk Advanced Fibrosis (>2.67)" : "Low Risk"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GBS BLEED RISK & PANCREATO-BILIARY */}
        {activeTab === "pancreato_gbs" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-sky-400" />
                  Glasgow-Blatchford Bleed Score (GBS) & Pancreatic Lipase Panel
                </h3>
                <p className="text-xs text-slate-400">
                  Upper GI Bleeding Risk Stratification (GBS &gt;6 urgent endoscopy), Hemoglobin (g/dL), Serum Lipase (U/L).
                </p>
              </div>

              <div className="px-3 py-1.5 bg-sky-900/80 border border-sky-500/50 rounded-xl text-xs font-bold text-sky-200">
                GBS Score: <span className="text-white font-black">{glasgowBlatchfordScore} Points</span> (High Risk - Urgent Endoscopy)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-sky-300 block">Glasgow-Blatchford Score GBS (0-23)</label>
                <input
                  type="number"
                  value={glasgowBlatchfordScore}
                  onChange={(e) => setGlasgowBlatchfordScore(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Scores &gt;6 require inpatient endoscopy</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-sky-300 block">Hemoglobin Concentration (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hemoglobinGdl}
                  onChange={(e) => setHemoglobinGdl(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{hemoglobinGdl < 10.0 ? "⚠️ Anemia (<10 g/dL)" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-sky-300 block">Serum Lipase (U/L)</label>
                <input
                  type="number"
                  value={serumLipase}
                  onChange={(e) => setSerumLipase(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{serumLipase > 180 ? "⚠️ Pancreatitis Rule Out (>3x Upper Normal)" : "Normal Range"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GI BIOLOGICS & SMALL MOLECULE LOG */}
        {activeTab === "gi_biologics" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Pill className="h-5 w-5 text-emerald-400" />
                  Targeted Biologics, Small Molecules & Therapeutic Drug Monitoring (TDM)
                </h3>
                <p className="text-xs text-slate-400">
                  Infliximab, Vedolizumab, Ustekinumab, Tofacitinib, Trough level monitoring & Anti-Drug Antibodies.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/80 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-200">
                Active Biologics: <span className="text-white font-black">{giMedications.length} Agents</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {giMedications.map((med, idx) => (
                <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-white font-bold">{med.drug}</strong>
                    <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded text-[10px]">
                      {med.indication}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    Dosage Protocol: <strong className="text-white">{med.dosage}</strong>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    <span>Trough Level: <strong className="text-emerald-300">{med.troughLevel}</strong></span>
                    <span>•</span>
                    <span>Anti-Drug Antibodies: <strong className="text-slate-200">{med.antiDrugAntibody}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: GASTROENTEROLOGY SOAP NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              Gastroenterology Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-300">S - Subjective (UC Flare Symptoms, Bloody Stools, Tenesmus, Abdominal Pain)</label>
                <textarea
                  value={giSoap.subjective}
                  onChange={(e) => setGiSoap({ ...giSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-300">O - Objective (HD Colonoscopy CADe, Mayo Subscore 2, Calprotectin 480, MELD-Na 16, FibroScan)</label>
                <textarea
                  value={giSoap.objective}
                  onChange={(e) => setGiSoap({ ...giSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-300">A - Assessment (Ulcerative Colitis Moderate Flare, Adenomatous Polyps Resected, NAFLD Cirrhosis)</label>
                <textarea
                  value={giSoap.assessment}
                  onChange={(e) => setGiSoap({ ...giSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-300">P - Plan (Infliximab Induction Protocol, Mesalamine, Budesonide MMX, Calprotectin Recheck)</label>
                <textarea
                  value={giSoap.plan}
                  onChange={(e) => setGiSoap({ ...giSoap, plan: e.target.value })}
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

export default GastroenterologySuite;
