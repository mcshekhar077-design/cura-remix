import React, { useState } from "react";
import {
  Brain,
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
  ChevronRight,
  Eye,
  Crosshair
} from "lucide-react";

export interface NeurologySuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function NeurologySuite({
  onBackToLanding,
  patientName = "Ramesh Chandra",
  patientAge = 62,
  patientGender = "Male"
}: NeurologySuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "stroke" | "epilepsy" | "parkinson" | "ms" | "cognitive" | "headache" | "soap"
  >("stroke");

  // Stroke FAST & NIHSS State
  const [strokeTimeOnsetHours, setStrokeTimeOnsetHours] = useState<number>(2.5); // <4.5h window
  const [facialDroop, setFacialDroop] = useState<boolean>(true);
  const [armWeakness, setArmWeakness] = useState<boolean>(true);
  const [speechSlurred, setSpeechSlurred] = useState<boolean>(true);
  const [mcaArteryTerritory, setMcaArteryTerritory] = useState<string>("Left MCA Territory (Dense Right Hemiparesis + Aphasia)");
  
  // NIHSS Subscores (0-42 total)
  const [nihssLevelConsciousness, setNihssLevelConsciousness] = useState<number>(1);
  const [nihssBestGaze, setNihssBestGaze] = useState<number>(1);
  const [nihssVisualFields, setNihssVisualFields] = useState<number>(1);
  const [nihssFacialPalsy, setNihssFacialPalsy] = useState<number>(2);
  const [nihssMotorArmRight, setNihssMotorArmRight] = useState<number>(3);
  const [nihssMotorLegRight, setNihssMotorLegRight] = useState<number>(2);
  const [nihssAtaxia, setNihssAtaxia] = useState<number>(0);
  const [nihssSensory, setNihssSensory] = useState<number>(1);
  const [nihssLanguage, setNihssLanguage] = useState<number>(2);
  const [nihssDysarthria, setNihssDysarthria] = useState<number>(1);

  const totalNihssScore =
    nihssLevelConsciousness +
    nihssBestGaze +
    nihssVisualFields +
    nihssFacialPalsy +
    nihssMotorArmRight +
    nihssMotorLegRight +
    nihssAtaxia +
    nihssSensory +
    nihssLanguage +
    nihssDysarthria;

  // Epilepsy & EEG State
  const [seizureType, setSeizureType] = useState<string>("Focal Impaired Awareness Seizure with Secondary Generalization");
  const [seizureFrequencyMonthly, setSeizureFrequencyMonthly] = useState<number>(2);
  const [eegSpikePattern, seteegSpikePattern] = useState<string>("3Hz Spike-and-Wave Paroxysms (Left Temporal)");
  const [antiSeizureMeds, setAntiSeizureMeds] = useState<string>("Levetiracetam (Keppra) 750mg BD + Lacosamide 100mg BD");
  const [vnsStimulationSetting, setVnsStimulationSetting] = useState<string>("1.5mA / 30Hz / 500µs (VNS Therapy)");

  // Parkinson's & UPDRS State
  const [hoehnYahrStage, setHoehnYahrStage] = useState<string>("Stage 2.5 (Bilateral motor involvement with recovery on pull test)");
  const [tremorSeverity, setTremorSeverity] = useState<string>("Moderate Resting Tremor (Right Hand - 4-6 Hz Pill-Rolling)");
  const [bradykinesiaScore, setBradykinesiaScore] = useState<number>(3); // 0-4
  const [rigidityScore, setRigidityScore] = useState<number>(2); // 0-4
  const [levodopaDosage, setLevodopaDosage] = useState<string>("Levodopa/Carbidopa 100/25mg QID + Rasagiline 1mg OD");
  const [dbsCoordinates, setDbsCoordinates] = useState<string>("Bilateral STN (Subthalamic Nucleus) - Active Contact 2");

  // Multiple Sclerosis & EDSS State
  const [msSubtype, setMsSubtype] = useState<string>("Relapsing-Remitting MS (RRMS)");
  const [edssScore, setEdssScore] = useState<number>(3.5); // Moderate disability
  const [mriT2LesionCount, setMriT2LesionCount] = useState<number>(14);
  const [gadoliniumEnhancingCount, setGadoliniumEnhancingCount] = useState<number>(2);
  const [dmtTherapy, setDmtTherapy] = useState<string>("Ocrelizumab (Ocrevus) 600mg IV Infusion every 6 months");

  // Cognitive & Dementia State
  const [mocaScore, setMocaScore] = useState<number>(22); // <26 = Mild Cognitive Impairment
  const [mmseScore, setMmseScore] = useState<number>(24);
  const [clockDrawingResult, setClockDrawingResult] = useState<string>("Mild Spatial Distortion / Contour Intact (3/5)");
  const [cognitiveDiagnosis, setCognitiveDiagnosis] = useState<string>("Mild Cognitive Impairment (MCI) - Amnestic Type");

  // Headache & Migraine State
  const [headacheType, setHeadacheType] = useState<string>("Chronic Migraine with Visual Aura");
  const [hit6Score, setHit6Score] = useState<number>(64); // >60 = Severe Impact
  const [monthlyHeadacheDays, setMonthlyHeadacheDays] = useState<number>(16);
  const [cgrpPreventiveMed, setCgrpPreventiveMed] = useState<string>("Eptinezumab (Vyepti) 100mg IV + Sumatriptan 50mg PRN");

  // Neurology SOAP State
  const [neuroSoap, setNeuroSoap] = useState({
    subjective:
      "62-year-old male with hypertension and dyslipidemia brought to ED by family following sudden onset right-sided weakness and difficulty speaking starting 2.5 hours ago. Family reports speech was slurred and right arm collapsed when reaching for tea cup.",
    objective:
      "Vitals: BP 168/94 mmHg, HR 78 bpm, SpO2 98% on room air.\nNeuro Exam: Conscious, alert. NIHSS Score = 14 (Moderate-Severe Stroke).\nLeft MCA territory signs: Right facial droop, right arm motor drift (3/4), right leg weakness (2/4), expressive dysphasia, cortical sensory loss.\nNon-Contrast CT Brain: No acute intracranial hemorrhage. Early ASPECTS score 8/10. CTA shows proximal M1 left MCA occlusion.",
    assessment:
      "1. Acute Ischemic Stroke Left MCA Territory (NIHSS 14) within 4.5-hour intravenous thrombolysis window.\n2. Essential Hypertension.\n3. Mild Cognitive Impairment (MoCA 22 baseline).",
    plan:
      "1. Immediate IV rTPA (Alteplase 0.9 mg/kg) bolus + infusion initiated at ED Door-to-Needle Time = 32 mins.\n2. Urgent Mechanical Thrombectomy (Endovascular Clot Retrieval) team alerted for M1 occlusion.\n3. Neuro-ICU admission for BP monitoring (Target SBP <180 mmHg).\n4. Repeat CT Brain at 24 hours prior to starting Antiplatelet therapy.\n5. Dysphagia screening before oral intake."
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
              <Brain className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Neurology & Brain Intelligence Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  AAN 2026 Clinical Protocols
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Stroke FAST Engine, NIHSS Score, UPDRS Parkinson&apos;s Staging, EDSS MS Index, MoCA/MMSE Dementia & EEG Matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            <span>AI Neuro-Safety Protocol Active</span>
          </div>
        </div>

        {/* Patient Profile Banner */}
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
                  ID: NEURO-2026-8812
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>NIHSS Score: <strong className="text-rose-400 font-mono">{totalNihssScore} (Moderate-Severe)</strong></span>
                <span className="text-slate-500">•</span>
                <span>MoCA Score: <strong className="text-amber-300 font-mono">{mocaScore}/30</strong></span>
                <span className="text-slate-500">•</span>
                <span>Onset Window: <strong className="text-emerald-300 font-mono">{strokeTimeOnsetHours} Hours (rTPA Eligible)</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-rose-900/50 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200">
              Code Stroke: <span className="text-white font-black">Door-To-Needle: 32 Mins</span>
            </div>
            <div className="px-3 py-1.5 bg-purple-900/50 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200">
              Localization: <span className="text-white font-black">Left MCA M1 Occlusion</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "stroke", label: "🚨 Acute Stroke & NIHSS Engine", icon: Zap },
            { id: "epilepsy", label: "⚡ Epilepsy & EEG Seizure Suite", icon: Activity },
            { id: "parkinson", label: "🚶 Parkinson's & UPDRS Staging", icon: Layers },
            { id: "ms", label: "🛡️ Multiple Sclerosis & EDSS", icon: Scale },
            { id: "cognitive", label: "🧩 Cognitive & Dementia (MoCA/MMSE)", icon: Brain },
            { id: "headache", label: "⚡ Migraine & Trigger Matrix", icon: Pill },
            { id: "soap", label: "📝 Neurology SOAP Note", icon: FileText }
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

        {/* TAB 1: ACUTE STROKE & NIHSS ENGINE */}
        {activeTab === "stroke" && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-rose-400" />
                    FAST Assessment & NIH Stroke Scale (NIHSS) Interactive Calculator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculates NIHSS severity, thrombolysis eligibility within 4.5 hours, and endovascular thrombectomy candidacy.
                  </p>
                </div>

                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  totalNihssScore >= 15
                    ? "bg-rose-900/80 text-rose-200 border border-rose-500/50 animate-pulse"
                    : totalNihssScore >= 5
                    ? "bg-amber-900/80 text-amber-200 border border-amber-500/50"
                    : "bg-emerald-900/80 text-emerald-200 border border-emerald-500/50"
                }`}>
                  NIHSS Total: <span className="text-white font-black">{totalNihssScore} / 42</span> (
                  {totalNihssScore >= 21 ? "Severe Stroke" : totalNihssScore >= 15 ? "Moderate-Severe Stroke" : "Mild-Moderate Stroke"})
                </div>
              </div>

              {/* FAST Protocol Quick Checks */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <span className="font-bold text-rose-300 block">F - Facial Droop</span>
                  <button
                    onClick={() => setFacialDroop(!facialDroop)}
                    className={`w-full py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      facialDroop ? "bg-rose-600 text-white" : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {facialDroop ? "Positive Droop" : "Normal"}
                  </button>
                </div>

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <span className="font-bold text-rose-300 block">A - Arm Weakness</span>
                  <button
                    onClick={() => setArmWeakness(!armWeakness)}
                    className={`w-full py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      armWeakness ? "bg-rose-600 text-white" : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {armWeakness ? "Positive Weakness" : "Normal"}
                  </button>
                </div>

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <span className="font-bold text-rose-300 block">S - Speech Slurred</span>
                  <button
                    onClick={() => setSpeechSlurred(!speechSlurred)}
                    className={`w-full py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      speechSlurred ? "bg-rose-600 text-white" : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {speechSlurred ? "Slurred / Aphasia" : "Normal"}
                  </button>
                </div>

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <span className="font-bold text-rose-300 block">T - Time Onset (Hours)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={strokeTimeOnsetHours}
                    onChange={(e) => setStrokeTimeOnsetHours(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                  />
                  <span className={`text-[10px] block font-bold ${strokeTimeOnsetHours <= 4.5 ? "text-emerald-400" : "text-amber-400"}`}>
                    {strokeTimeOnsetHours <= 4.5 ? "✓ Eligible for rTPA Thrombolysis (<4.5h)" : "⚠️ Past 4.5h Window (EVT thrombectomy pathway)"}
                  </span>
                </div>
              </div>

              {/* Detailed NIHSS Domain Sliders/Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="font-bold text-purple-300 block">Level of Consciousness (0-3)</label>
                  <select
                    value={nihssLevelConsciousness}
                    onChange={(e) => setNihssLevelConsciousness(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value={0}>0 - Alert, keenly responsive</option>
                    <option value={1}>1 - Drowsy, minor stimulation required</option>
                    <option value={2}>2 - Stuporous, strong stimulation required</option>
                    <option value={3}>3 - Comatose, reflex motor response only</option>
                  </select>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="font-bold text-purple-300 block">Best Horizontal Gaze (0-2)</label>
                  <select
                    value={nihssBestGaze}
                    onChange={(e) => setNihssBestGaze(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value={0}>0 - Normal gaze</option>
                    <option value={1}>1 - Partial gaze palsy</option>
                    <option value={2}>2 - Forced deviation / total gaze palsy</option>
                  </select>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="font-bold text-purple-300 block">Facial Palsy (0-3)</label>
                  <select
                    value={nihssFacialPalsy}
                    onChange={(e) => setNihssFacialPalsy(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value={0}>0 - Normal symmetrical movement</option>
                    <option value={1}>1 - Minor paralysis (flattened nasolabial fold)</option>
                    <option value={2}>2 - Partial paralysis (lower face paralysis)</option>
                    <option value={3}>3 - Complete paralysis of one or both sides</option>
                  </select>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="font-bold text-purple-300 block">Motor Arm Drift (Right) (0-4)</label>
                  <select
                    value={nihssMotorArmRight}
                    onChange={(e) => setNihssMotorArmRight(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value={0}>0 - No drift for 10 seconds</option>
                    <option value={1}>1 - Drift before 10 seconds, does not hit bed</option>
                    <option value={2}>2 - Some effort against gravity, falls to bed</option>
                    <option value={3}>3 - No effort against gravity, limb falls</option>
                    <option value={4}>4 - No movement at all</option>
                  </select>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="font-bold text-purple-300 block">Motor Leg Drift (Right) (0-4)</label>
                  <select
                    value={nihssMotorLegRight}
                    onChange={(e) => setNihssMotorLegRight(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value={0}>0 - No drift for 5 seconds</option>
                    <option value={1}>1 - Drift before 5 seconds</option>
                    <option value={2}>2 - Some effort against gravity</option>
                    <option value={3}>3 - No effort against gravity</option>
                    <option value={4}>4 - No movement at all</option>
                  </select>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="font-bold text-purple-300 block">Best Language / Aphasia (0-3)</label>
                  <select
                    value={nihssLanguage}
                    onChange={(e) => setNihssLanguage(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value={0}>0 - No aphasia, normal fluency</option>
                    <option value={1}>1 - Mild to moderate aphasia</option>
                    <option value={2}>2 - Severe aphasia (fragmentary speech)</option>
                    <option value={3}>3 - Mute, global aphasia</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EPILEPSY & EEG SEIZURE SUITE */}
        {activeTab === "epilepsy" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-400" />
                  Epilepsy & 10-20 EEG Electroencephalogram Analysis Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  ILAE Seizure Classification, EEG focal spike-and-wave detection, and VNS/RNS neurostimulator tuning.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200">
                Seizure Frequency: <span className="text-white font-black">{seizureFrequencyMonthly} Seizures / Month</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">ILAE Seizure Type Classification</label>
                <input
                  type="text"
                  value={seizureType}
                  onChange={(e) => setSeizureType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">10-20 EEG Focal Pattern / Paroxysms</label>
                <input
                  type="text"
                  value={eegSpikePattern}
                  onChange={(e) => seteegSpikePattern(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Current Anti-Seizure Medications (ASM)</label>
                <input
                  type="text"
                  value={antiSeizureMeds}
                  onChange={(e) => setAntiSeizureMeds(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">VNS (Vagus Nerve Stimulator) Parameters</label>
                <input
                  type="text"
                  value={vnsStimulationSetting}
                  onChange={(e) => setVnsStimulationSetting(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PARKINSON'S & UPDRS STAGING */}
        {activeTab === "parkinson" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-400" />
                  Parkinson&apos;s Disease UPDRS Motor Assessment & Hoehn & Yahr Staging
                </h3>
                <p className="text-xs text-slate-400">
                  Resting tremor, cogwheel rigidity, bradykinesia, Levodopa response, and Deep Brain Stimulation (DBS) coordinates.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-purple-900/60 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200">
                Staging: <span className="text-white font-black">{hoehnYahrStage.split(" ")[0]} {hoehnYahrStage.split(" ")[1]}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Hoehn and Yahr Clinical Stage</label>
                <input
                  type="text"
                  value={hoehnYahrStage}
                  onChange={(e) => setHoehnYahrStage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Resting Tremor & Frequency</label>
                <input
                  type="text"
                  value={tremorSeverity}
                  onChange={(e) => setTremorSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">DBS (Deep Brain Stimulation) Target</label>
                <input
                  type="text"
                  value={dbsCoordinates}
                  onChange={(e) => setDbsCoordinates(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Dopaminergic Therapy Regimen</label>
                <input
                  type="text"
                  value={levodopaDosage}
                  onChange={(e) => setLevodopaDosage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MULTIPLE SCLEROSIS & EDSS */}
        {activeTab === "ms" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-400" />
                  Multiple Sclerosis Expanded Disability Status Scale (EDSS) Suite
                </h3>
                <p className="text-xs text-slate-400">
                  Kurtzke EDSS 0-10 scoring, T2/FLAIR hyperintensity count & Disease-Modifying Therapy (DMT) tracking.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-900/60 border border-blue-500/40 rounded-xl text-xs font-bold text-blue-200">
                EDSS Index: <span className="text-white font-black">{edssScore} / 10 (Moderate Disability)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">MS Clinical Subtype</label>
                <input
                  type="text"
                  value={msSubtype}
                  onChange={(e) => setMsSubtype(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Kurtzke EDSS Score (0.0 - 10.0)</label>
                <input
                  type="number"
                  step="0.5"
                  value={edssScore}
                  onChange={(e) => setEdssScore(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">T2/FLAIR Hyperintensities Count</label>
                <input
                  type="number"
                  value={mriT2LesionCount}
                  onChange={(e) => setMriT2LesionCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COGNITIVE & DEMENTIA (MoCA/MMSE) */}
        {activeTab === "cognitive" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-400" />
                  Montreal Cognitive Assessment (MoCA) & MMSE Dementia Screening
                </h3>
                <p className="text-xs text-slate-400">
                  Executive function, 5-word delayed recall, clock drawing test evaluation & Alzheimer&apos;s differentiation.
                </p>
              </div>

              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                mocaScore < 26
                  ? "bg-amber-900/80 text-amber-200 border border-amber-500/50"
                  : "bg-emerald-900/80 text-emerald-200 border border-emerald-500/50"
              }`}>
                MoCA Score: <span className="text-white font-black">{mocaScore} / 30</span> ({mocaScore < 26 ? "Mild Cognitive Impairment" : "Normal Cognition"})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">MoCA Total Score (0-30)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={mocaScore}
                  onChange={(e) => setMocaScore(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">MMSE Total Score (0-30)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={mmseScore}
                  onChange={(e) => setMmseScore(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Clock Drawing Test Contour & Hands</label>
                <input
                  type="text"
                  value={clockDrawingResult}
                  onChange={(e) => setClockDrawingResult(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MIGRAINE & TRIGGER MATRIX */}
        {activeTab === "headache" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Pill className="h-5 w-5 text-rose-400" />
                  Chronic Migraine, HIT-6 Disability Index & CGRP Receptor Therapy
                </h3>
                <p className="text-xs text-slate-400">
                  Aura tracking, monthly headache days, triptan response & CGRP monoclonal antibody management.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-rose-900/60 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200">
                HIT-6 Index: <span className="text-white font-black">{hit6Score} (Severe Impact)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Headache Classification</label>
                <input
                  type="text"
                  value={headacheType}
                  onChange={(e) => setHeadacheType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Monthly Headache Days (MHD)</label>
                <input
                  type="number"
                  value={monthlyHeadacheDays}
                  onChange={(e) => setMonthlyHeadacheDays(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Preventive CGRP Monoclonal Therapy</label>
                <input
                  type="text"
                  value={cgrpPreventiveMed}
                  onChange={(e) => setCgrpPreventiveMed(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: NEUROLOGY SOAP NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Neurology Specialist Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">S - Subjective (Onset, Weakness, Aphasia, Seizures)</label>
                <textarea
                  value={neuroSoap.subjective}
                  onChange={(e) => setNeuroSoap({ ...neuroSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">O - Objective (NIHSS Score, CT/CTA, MoCA, UPDRS)</label>
                <textarea
                  value={neuroSoap.objective}
                  onChange={(e) => setNeuroSoap({ ...neuroSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">A - Assessment (Stroke Localization, NIHSS Classification)</label>
                <textarea
                  value={neuroSoap.assessment}
                  onChange={(e) => setNeuroSoap({ ...neuroSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">P - Plan (rTPA, Thrombectomy, Neuro-ICU, Anti-seizure)</label>
                <textarea
                  value={neuroSoap.plan}
                  onChange={(e) => setNeuroSoap({ ...neuroSoap, plan: e.target.value })}
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

export default NeurologySuite;
