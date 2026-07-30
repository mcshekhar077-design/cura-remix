import React, { useState } from "react";
import {
  Sparkles,
  Camera,
  Layers,
  FileText,
  Activity,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sun,
  ShieldAlert,
  ArrowRightLeft,
  Scissors,
  Pill,
  Sliders,
  Scale,
  Sparkle
} from "lucide-react";

export interface DermatologySuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function DermatologySuite({
  onBackToLanding,
  patientName = "Sunita Sharma",
  patientAge = 32,
  patientGender = "Female"
}: DermatologySuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "bodymap" | "dermoscopy" | "comparison" | "scores" | "cosmetic" | "procedure" | "telederm" | "soap"
  >("bodymap");

  // Fitzpatrick Skin Type State
  const [fitzpatrickType, setFitzpatrickType] = useState<string>("Type III (Burns moderately, tans gradually)");

  // Interactive Lesion Mapping State
  const [selectedLesionId, setSelectedLesionId] = useState<string>("L2");
  const [lesions, setLesions] = useState([
    {
      id: "L1",
      location: "Forehead (Midline)",
      type: "Seborrheic Keratosis",
      sizeMm: 7,
      abcdeAsymmetry: "Symmetrical",
      abcdeBorder: "Well-defined / Stuck-on",
      abcdeColor: "Uniform Dark Brown",
      abcdeDiameter: "7 mm",
      abcdeEvolution: "Stable > 3 years",
      riskLevel: "Low (Benign)",
      xPct: 50,
      yPct: 15,
      view: "Face"
    },
    {
      id: "L2",
      location: "Left Forearm (Dorsal)",
      type: "Atypical Dysplastic Nevus",
      sizeMm: 8,
      abcdeAsymmetry: "Asymmetrical",
      abcdeBorder: "Irregular / Irregularly Notched",
      abcdeColor: "Variegated (Tan, Brown, Pink)",
      abcdeDiameter: "8 mm",
      abcdeEvolution: "Recent enlargement & itching",
      riskLevel: "High (Biopsy Indicated)",
      xPct: 28,
      yPct: 42,
      view: "Front"
    },
    {
      id: "L3",
      location: "Lower Back (Lumbar)",
      type: "Psoriatic Plaque",
      sizeMm: 35,
      abcdeAsymmetry: "Symmetrical Plaque",
      abcdeBorder: "Sharply Demarcated",
      abcdeColor: "Erythematous with Silvery Scales",
      abcdeDiameter: "35 mm",
      abcdeEvolution: "Fluctuating with stress",
      riskLevel: "Moderate (Active Inflammatory)",
      xPct: 52,
      yPct: 65,
      view: "Back"
    }
  ]);

  // Selected Lesion Reference
  const currentLesion = lesions.find((l) => l.id === selectedLesionId) || lesions[0];

  // Dermoscopy 7-Point Checklist State
  const [pigmentNetwork, setPigmentNetwork] = useState<string>("Atypical Network (Thickened, Irregular)");
  const [blueWhiteVeil, setBlueWhiteVeil] = useState<boolean>(true);
  const [atypicalVascular, setAtypicalVascular] = useState<string>("Dotted & Comma Vessels");
  const [streaksPseudopods, setStreaksPseudopods] = useState<boolean>(true);
  const [regressionStructures, setRegressionStructures] = useState<boolean>(false);
  const [irregularGlobules, setIrregularGlobules] = useState<boolean>(true);

  // 7-Point Dermoscopy Score Calculation
  const calculateDermoscopyScore = () => {
    let score = 0;
    if (pigmentNetwork.startsWith("Atypical")) score += 2;
    if (blueWhiteVeil) score += 2;
    if (atypicalVascular !== "None") score += 2;
    if (streaksPseudopods) score += 1;
    if (regressionStructures) score += 1;
    if (irregularGlobules) score += 1;
    return score;
  };
  const totalDermScore = calculateDermoscopyScore();

  // Longitudinal Photo Comparison State
  const [timeframe, setTimeframe] = useState<string>("4 Weeks Post Topical Clobetasol");
  const [lesionAreaDeltaPct, setLesionAreaDeltaPct] = useState<number>(-34); // -34% reduction
  const [erythemaIntensityDelta, setErythemaIntensityDelta] = useState<string>("Marked Resolution (50% fading)");

  // Standardized Clinical Scores State
  // PASI (Psoriasis Area & Severity Index)
  const [pasiHeadErythema, setPasiHeadErythema] = useState<number>(2);
  const [pasiHeadInduration, setPasiHeadInduration] = useState<number>(1);
  const [pasiHeadScaling, setPasiHeadScaling] = useState<number>(2);
  const [pasiHeadAreaScore, setPasiHeadAreaScore] = useState<number>(2); // 1-10%

  const [pasiTrunkErythema, setPasiTrunkErythema] = useState<number>(3);
  const [pasiTrunkInduration, setPasiTrunkInduration] = useState<number>(2);
  const [pasiTrunkScaling, setPasiTrunkScaling] = useState<number>(3);
  const [pasiTrunkAreaScore, setPasiTrunkAreaScore] = useState<number>(3); // 10-30%

  const totalPasiScore = Number(
    (
      0.1 * (pasiHeadErythema + pasiHeadInduration + pasiHeadScaling) * pasiHeadAreaScore +
      0.3 * (pasiTrunkErythema + pasiTrunkInduration + pasiTrunkScaling) * pasiTrunkAreaScore +
      1.8
    ).toFixed(1)
  );

  // DLQI (Dermatology Life Quality Index 0-30)
  const [dlqiScore, setDlqiScore] = useState<number>(14); // 11-20 = Very large effect on patient's life

  // Cosmetic & Aesthetic Dermatology State
  const [botoxGlabellaUnits, setBotoxGlabellaUnits] = useState<number>(20);
  const [botoxFrontalisUnits, setBotoxFrontalisUnits] = useState<number>(12);
  const [peelAgent, setPeelAgent] = useState<string>("35% Glycolic Acid + 20% Salicylic Acid (Medium Depth)");
  const [laserWavelength, setLaserWavelength] = useState<string>("1064nm Q-Switched Nd:YAG / CO2 Fractional (15mJ)");

  // Procedure & Biopsy State
  const [biopsyType, setBiopsyType] = useState<string>("3.5mm Punch Biopsy with 4-0 Ethilon Sutures");
  const [histopathStatus, setHistopathStatus] = useState<string>("Sent to Dermpath Lab (Specimen ID: DP-2026-9041)");
  const [cryotherapySecs, setCryotherapySecs] = useState<number>(15);

  // Teledermatology & Fingertip Unit (FTU) Dosage State
  const [affectedBodyAreasFtu, setAffectedBodyAreasFtu] = useState<number>(4); // 4 FTUs = ~2 grams cream
  const [topicalPrescription, setTopicalPrescription] = useState<string>("Tacrolimus 0.1% Ointment BD + Mometasone Furoate 0.1% Cream OD");

  // Dermatology SOAP State
  const [dermSoap, setDermSoap] = useState({
    subjective: "32-year-old female presents with persistent itchy erythematous plaque on lower back for 8 months. Also notes new mole on left forearm with irregular borders and color variation noticed 3 weeks ago.",
    objective: "Fitzpatrick Skin Type III.\nLesion L1 (Forehead): 7mm hyperpigmented seborrheic keratosis, stuck-on appearance.\nLesion L2 (Left Forearm): 8mm asymmetric macule, irregular borders, variegated tan/brown pigment. Dermoscopy 7-point score: 5/7 (Atypical network, blue-white veil, irregular globules).\nLesion L3 (Lower Back): 35mm well-demarcated erythematous plaque with silvery mica-like scales. Auspitz sign positive upon gentle scraping. PASI Score: 8.2.",
    assessment: "1. Atypical Dysplastic Nevus Left Forearm (Lesion L2 - Rule out Cutaneous Melanoma in Situ).\n2. Plaque Psoriasis Vulgaris Lower Back (Lesion L3 - Moderate PASI 8.2).\n3. Seborrheic Keratosis Forehead (Lesion L1 - Benign).",
    plan: "1. Diagnostic 3.5mm Punch Biopsy of Lesion L2 (Left Forearm) under 2% Lignocaine; sent for histopathology.\n2. Tacrolimus 0.1% Ointment apply BD to lower back plaque for 4 weeks.\n3. Emollient barrier repair cream qHS.\n4. Broad-Spectrum SPF 50+ Sunscreen every 3 hours outdoors.\n5. Biopsy results review & suture removal in 7 days."
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-3 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
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
              <Sun className="h-7 w-7 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Dermatology & Skin Intelligence Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  BAD & AAD 2026 Guidelines
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Interactive Body Lesion Mapping, Dermoscopy 7-Point Pattern Engine, PASI/DLQI Calculators, Biopsy & Aesthetic Grid
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>AI Dermpath Safety Protocol Active</span>
          </div>
        </div>

        {/* Patient Profile & Fitzpatrick Banner */}
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
                  ID: DERM-2026-9082
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Fitzpatrick: <strong className="text-rose-300">{fitzpatrickType}</strong></span>
                <span className="text-slate-500">•</span>
                <span>Mapped Lesions: <strong className="text-amber-300">{lesions.length} Lesions</strong></span>
                <span className="text-slate-500">•</span>
                <span>PASI Score: <strong className="text-emerald-300">{totalPasiScore}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-rose-900/50 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200">
              Selected Lesion: <span className="text-white font-black">{currentLesion.id} ({currentLesion.location})</span>
            </div>
            <div className="px-3 py-1.5 bg-amber-900/50 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-200">
              Risk: <span className="text-white font-black">{currentLesion.riskLevel}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "bodymap", label: "🗺️ Interactive Body Map & Lesion Pins", icon: Layers },
            { id: "dermoscopy", label: "🔬 Dermoscopy 7-Point Pattern Engine", icon: Search },
            { id: "comparison", label: "🖼️ Follow-up Photo Comparison", icon: ArrowRightLeft },
            { id: "scores", label: "📊 PASI, SCORAD & DLQI Scores", icon: Scale },
            { id: "cosmetic", label: "✨ Cosmetic Botox & Laser Mapping", icon: Sparkles },
            { id: "procedure", label: "✂️ Biopsy & Cryo Procedure Tracker", icon: Scissors },
            { id: "telederm", label: "📱 Teledermatology & FTU Dosage", icon: Pill },
            { id: "soap", label: "📝 Dermatology SOAP Note", icon: FileText }
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

        {/* TAB 1: INTERACTIVE BODY MAP & LESION PINS */}
        {activeTab === "bodymap" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="h-5 w-5 text-rose-400" />
                    Interactive Full-Body Anatomical Mapping Canvas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click pins to view lesions, track ABCDE evolution, or add new dermoscopic findings.
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-slate-900 text-slate-300 text-xs font-mono rounded-lg border border-slate-700">
                    Front / Back / Face Dual-View
                  </span>
                </div>
              </div>

              {/* Simulated Interactive Body SVG Canvas */}
              <div className="relative w-full h-80 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-around overflow-hidden p-4">
                {/* Visual Body Silhouette Placeholder */}
                <div className="relative w-48 h-full bg-slate-900 border border-slate-800 rounded-full flex flex-col items-center justify-center p-2 opacity-90">
                  <span className="text-[10px] font-mono text-slate-500 absolute top-3">Anterior View</span>
                  {/* Pin Lesion 1 */}
                  <button
                    onClick={() => setSelectedLesionId("L1")}
                    style={{ top: "15%", left: "50%" }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg transition-transform hover:scale-125 cursor-pointer ${
                      selectedLesionId === "L1"
                        ? "bg-amber-500 text-slate-950 ring-4 ring-amber-400/40"
                        : "bg-amber-700 text-white"
                    }`}
                  >
                    L1
                  </button>

                  {/* Pin Lesion 2 */}
                  <button
                    onClick={() => setSelectedLesionId("L2")}
                    style={{ top: "42%", left: "28%" }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg transition-transform hover:scale-125 cursor-pointer animate-pulse ${
                      selectedLesionId === "L2"
                        ? "bg-rose-500 text-white ring-4 ring-rose-400/40"
                        : "bg-rose-700 text-white"
                    }`}
                  >
                    L2
                  </button>
                </div>

                <div className="relative w-48 h-full bg-slate-900 border border-slate-800 rounded-full flex flex-col items-center justify-center p-2 opacity-90">
                  <span className="text-[10px] font-mono text-slate-500 absolute top-3">Posterior View</span>
                  {/* Pin Lesion 3 */}
                  <button
                    onClick={() => setSelectedLesionId("L3")}
                    style={{ top: "65%", left: "52%" }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg transition-transform hover:scale-125 cursor-pointer ${
                      selectedLesionId === "L3"
                        ? "bg-blue-500 text-white ring-4 ring-blue-400/40"
                        : "bg-blue-700 text-white"
                    }`}
                  >
                    L3
                  </button>
                </div>
              </div>

              {/* ABCDE Rule Assessment Card for Selected Lesion */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-2">
                    <Search className="h-4 w-4" /> ABCDE Melanoma Screening Criteria ({currentLesion.id}: {currentLesion.location})
                  </h4>
                  <span className="text-xs font-mono text-rose-400 font-bold">{currentLesion.riskLevel}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] font-bold">A - Asymmetry</span>
                    <strong className="text-white text-xs">{currentLesion.abcdeAsymmetry}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] font-bold">B - Border</span>
                    <strong className="text-white text-xs">{currentLesion.abcdeBorder}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] font-bold">C - Color</span>
                    <strong className="text-white text-xs">{currentLesion.abcdeColor}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] font-bold">D - Diameter</span>
                    <strong className="text-white text-xs">{currentLesion.abcdeDiameter}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] font-bold">E - Evolution</span>
                    <strong className="text-white text-xs">{currentLesion.abcdeEvolution}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Fitzpatrick Skin Classification & Safety Card */}
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <Sun className="h-4 w-4 text-rose-400" />
                  Fitzpatrick Phototype & UV Safety
                </h4>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Fitzpatrick Skin Phototype</label>
                  <select
                    value={fitzpatrickType}
                    onChange={(e) => setFitzpatrickType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="Type I (Always burns, never tans)">Type I (Always burns, never tans)</option>
                    <option value="Type II (Burns easily, tans minimally)">Type II (Burns easily, tans minimally)</option>
                    <option value="Type III (Burns moderately, tans gradually)">Type III (Burns moderately, tans gradually)</option>
                    <option value="Type IV (Burns minimally, tans easily)">Type IV (Burns minimally, tans easily)</option>
                    <option value="Type V (Rarely burns, tans intensely)">Type V (Rarely burns, tans intensely)</option>
                    <option value="Type VI (Never burns, deeply pigmented)">Type VI (Never burns, deeply pigmented)</option>
                  </select>
                </div>

                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200 space-y-1">
                  <strong>High Melanoma Risk Flag:</strong>
                  <p>Lesion L2 meets 4/5 ABCDE criteria (Asymmetric, Irregular Border, Variegated Color, &gt;6mm). Biopsy strongly recommended.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DERMOSCOPY 7-POINT PATTERN ENGINE */}
        {activeTab === "dermoscopy" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-rose-400" />
                  Dermoscopy 7-Point Checklist & Total Dermoscopy Score (TDS)
                </h3>
                <p className="text-xs text-slate-400">
                  Argenziano Consensus Criteria for Malignant Melanoma Differentiation.
                </p>
              </div>

              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                totalDermScore >= 3
                  ? "bg-rose-900/80 text-rose-200 border border-rose-500/50 animate-pulse"
                  : "bg-emerald-900/80 text-emerald-200 border border-emerald-500/50"
              }`}>
                Dermoscopy Score: <span className="text-white font-black">{totalDermScore} / 9</span> ({totalDermScore >= 3 ? "Highly Suspicious for Melanoma" : "Likely Benign"})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-rose-300 block">1. Atypical Pigment Network (+2 pts)</label>
                <select
                  value={pigmentNetwork}
                  onChange={(e) => setPigmentNetwork(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                >
                  <option value="Atypical Network (Thickened, Irregular)">Atypical Network (+2 pts)</option>
                  <option value="Typical Network (Delicate, Regular)">Typical Network (0 pts)</option>
                  <option value="Absent Network">Absent Network (0 pts)</option>
                </select>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-rose-300 block">2. Blue-White Veil (+2 pts)</label>
                <button
                  onClick={() => setBlueWhiteVeil(!blueWhiteVeil)}
                  className={`w-full p-2 rounded-xl text-xs font-bold transition-all ${
                    blueWhiteVeil ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {blueWhiteVeil ? "Present (+2 pts)" : "Absent (0 pts)"}
                </button>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-rose-300 block">3. Atypical Vascular Pattern (+2 pts)</label>
                <select
                  value={atypicalVascular}
                  onChange={(e) => setAtypicalVascular(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                >
                  <option value="Dotted & Comma Vessels">Dotted & Comma Vessels (+2 pts)</option>
                  <option value="Polymorphous Vessels">Polymorphous Vessels (+2 pts)</option>
                  <option value="None">None (0 pts)</option>
                </select>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-amber-300 block">4. Irregular Streaks / Pseudopods (+1 pt)</label>
                <button
                  onClick={() => setStreaksPseudopods(!streaksPseudopods)}
                  className={`w-full p-2 rounded-xl text-xs font-bold transition-all ${
                    streaksPseudopods ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {streaksPseudopods ? "Present (+1 pt)" : "Absent (0 pts)"}
                </button>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-amber-300 block">5. Irregular Pigment Globules (+1 pt)</label>
                <button
                  onClick={() => setIrregularGlobules(!irregularGlobules)}
                  className={`w-full p-2 rounded-xl text-xs font-bold transition-all ${
                    irregularGlobules ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {irregularGlobules ? "Present (+1 pt)" : "Absent (0 pts)"}
                </button>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-amber-300 block">6. Regression Structures (+1 pt)</label>
                <button
                  onClick={() => setRegressionStructures(!regressionStructures)}
                  className={`w-full p-2 rounded-xl text-xs font-bold transition-all ${
                    regressionStructures ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {regressionStructures ? "Present (+1 pt)" : "Absent (0 pts)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOLLOW-UP PHOTO COMPARISON */}
        {activeTab === "comparison" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-rose-400" />
                  Longitudinal Photo Comparison & Treatment Response Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Side-by-side computer vision delta analysis for topical steroid / biologic response tracking.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200">
                Plaque Area Delta: <span className="text-white font-black">{lesionAreaDeltaPct}% Shrinkage</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-400">Baseline Visit (Month 0)</span>
                <div className="h-44 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                  [Baseline Lesion Photo: 35mm Psoriatic Plaque]
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-center">
                <span className="text-xs font-bold text-emerald-400">{timeframe}</span>
                <div className="h-44 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                  [Follow-up Lesion Photo: 23mm Plaque - 34% Reduction]
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PASI, SCORAD & DLQI SCORES */}
        {activeTab === "scores" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-rose-400" />
              Standardized Clinical Severity Calculators (PASI & DLQI)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PASI Calculator */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-rose-300">PASI (Psoriasis Area & Severity Index)</h4>
                  <strong className="text-sm font-mono text-emerald-400">{totalPasiScore} / 72</strong>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-300 block">Head & Neck Region</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Erythema 0-4"
                      value={pasiHeadErythema}
                      onChange={(e) => setPasiHeadErythema(Number(e.target.value))}
                      className="bg-slate-800 p-2 rounded border border-slate-700 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Induration 0-4"
                      value={pasiHeadInduration}
                      onChange={(e) => setPasiHeadInduration(Number(e.target.value))}
                      className="bg-slate-800 p-2 rounded border border-slate-700 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Scaling 0-4"
                      value={pasiHeadScaling}
                      onChange={(e) => setPasiHeadScaling(Number(e.target.value))}
                      className="bg-slate-800 p-2 rounded border border-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* DLQI Calculator */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-blue-300">DLQI (Dermatology Life Quality Index)</h4>
                  <strong className="text-sm font-mono text-amber-300">{dlqiScore} / 30</strong>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p>DLQI Score = 14: Very large effect on patient&apos;s quality of life (indicates systemic / biologic therapy eligibility).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COSMETIC BOTOX & LASER MAPPING */}
        {activeTab === "cosmetic" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Cosmetic Botox / Filler Mapping Grid & Chemical Peel Protocols
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-amber-300 block">Glabella Botulinum Toxin Units</label>
                <input
                  type="number"
                  value={botoxGlabellaUnits}
                  onChange={(e) => setBotoxGlabellaUnits(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-amber-300 block">Frontalis Lines Units</label>
                <input
                  type="number"
                  value={botoxFrontalisUnits}
                  onChange={(e) => setBotoxFrontalisUnits(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-amber-300 block">Laser Wavelength Settings</label>
                <input
                  type="text"
                  value={laserWavelength}
                  onChange={(e) => setLaserWavelength(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BIOPSY & CRYO PROCEDURE TRACKER */}
        {activeTab === "procedure" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scissors className="h-5 w-5 text-rose-400" />
              Minor Surgical Procedures, Punch Biopsy & Histopathology
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-rose-300 block">Biopsy Method</span>
                <input
                  type="text"
                  value={biopsyType}
                  onChange={(e) => setBiopsyType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-300 block">Dermpath Status</span>
                <input
                  type="text"
                  value={histopathStatus}
                  onChange={(e) => setHistopathStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TELEDERMATOLOGY & FTU DOSAGE */}
        {activeTab === "telederm" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Pill className="h-5 w-5 text-rose-400" />
              Teledermatology & Fingertip Unit (FTU) Dosage Engine
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-rose-300 block">Fingertip Units (1 FTU = ~0.5g)</span>
                <input
                  type="number"
                  value={affectedBodyAreasFtu}
                  onChange={(e) => setAffectedBodyAreasFtu(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-400 block">
                  Total required per application: {affectedBodyAreasFtu * 0.5} grams (~{(affectedBodyAreasFtu * 0.5 * 30).toFixed(0)}g monthly tube)
                </span>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-300 block">Topical Regimen</span>
                <input
                  type="text"
                  value={topicalPrescription}
                  onChange={(e) => setTopicalPrescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: DERMATOLOGY SOAP NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-400" />
              Dermatology Specialist Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">S - Subjective (Itching, Lesion Evolution, Sun Exposure)</label>
                <textarea
                  value={dermSoap.subjective}
                  onChange={(e) => setDermSoap({ ...dermSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">O - Objective (Fitzpatrick, Dermoscopy, PASI)</label>
                <textarea
                  value={dermSoap.objective}
                  onChange={(e) => setDermSoap({ ...dermSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">A - Assessment (Rule out Melanoma, Psoriasis Severity)</label>
                <textarea
                  value={dermSoap.assessment}
                  onChange={(e) => setDermSoap({ ...dermSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">P - Plan (Biopsy, Topicals, Photoprotection, Follow-up)</label>
                <textarea
                  value={dermSoap.plan}
                  onChange={(e) => setDermSoap({ ...dermSoap, plan: e.target.value })}
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

export default DermatologySuite;
