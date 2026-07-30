import React, { useState } from "react";
import {
  Ear,
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
  Droplet,
  Hospital,
  Flame,
  Award,
  Thermometer,
  Wind,
  Mic,
  Volume2,
  Eye,
  Brain
} from "lucide-react";

export interface ENTSuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function ENTSuite({
  onBackToLanding,
  patientName = "Siddharth Nambiar",
  patientAge = 42,
  patientGender = "Male"
}: ENTSuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "ear" | "nose" | "throat" | "audiometry" | "vertigo" | "soap"
  >("ear");

  // Ear & Hearing State
  const [hearingLossType, setHearingLossType] = useState<string>("Sensorineural Hearing Loss (Bilateral)");
  const [tinnitusSeverity, setTinnitusSeverity] = useState<number>(6); // 1-10 visual analog scale
  const [tinnitusPitch, setTinnitusPitch] = useState<string>("High-pitched continuous ringing (6,000 Hz)");
  const [eardrumStatusLeft, setEardrumStatusLeft] = useState<string>("Intact, translucent, normal light reflex");
  const [eardrumStatusRight, setEardrumStatusRight] = useState<string>("Mild pars tensa retraction, no perforation");

  // Pure Tone Audiometry (PTA) Averages (dB HL)
  const [ptaLeftDb, setPtaLeftDb] = useState<number>(38); // Mild-to-Moderate loss
  const [ptaRightDb, setPtaRightDb] = useState<number>(45); // Moderate loss
  const [speechDiscriminationLeftPct, setSpeechDiscriminationLeftPct] = useState<number>(92);
  const [speechDiscriminationRightPct, setSpeechDiscriminationRightPct] = useState<number>(84);

  // Nose & Rhinosinusitis State (SNOT-22 Scale)
  const [snot22Score, setSnot22Score] = useState<number>(34); // 0-110 Sinonasal Outcome Test
  const [nasalCongestionSide, setNasalCongestionSide] = useState<string>("Right-sided predominant nasal obstruction");
  const [septalDeviationType, setSeptalDeviationType] = useState<string>("Deviated Nasal Septum (DNS) to Right with Compensatory Left Inferior Turbinate Hypertrophy");
  const [polypsGradeRight, setPolypsGradeRight] = useState<number>(1); // Grade 0-4
  const [polypsGradeLeft, setPolypsGradeLeft] = useState<number>(0);
  const [paranasalCtFindings, setParanasalCtFindings] = useState<string>("Mucosal thickening in Right Maxillary & Anterior Ethmoid Sinuses (Lund-Mackay Score: 8/24)");

  // Throat, Larynx & Sleep Apnea State
  const [mallampatiClass, setMallampatiClass] = useState<number>(3); // Class I to IV
  const [tonsilGrade, setTonsilGrade] = useState<string>("Grade +2 (30-50% airway narrowing)");
  const [recurrentTonsillitisEpisodes, setRecurrentTonsillitisEpisodes] = useState<number>(4); // Episodes in past year (Paradise Criteria = 7/1yr or 5/2yrs)
  const [vocalCordStatus, setVocalCordStatus] = useState<string>("Bilateral smooth true vocal cord nodules at anterior 1/3 and posterior 2/3 junction");
  const [epworthSleepinessScore, setEpworthSleepinessScore] = useState<number>(14); // >10 indicates excessive daytime sleepiness (OSA candidate)

  // Vertigo & Dix-Hallpike State
  const [vertigoSubtype, setVertigoSubtype] = useState<string>("Posterior Canal Benign Paroxysmal Positional Vertigo (BPPV)");
  const [dixHallpikeRight, setDixHallpikeRight] = useState<string>("Positive (Geotropic torsional nystagmus with 5s latency & 20s duration)");
  const [dixHallpikeLeft, setDixHallpikeLeft] = useState<string>("Negative");
  const [epleyManeuverDone, setEpleyManeuverDone] = useState<boolean>(true);

  // ENT Consultation SOAP State
  const [entSoap, setEntSoap] = useState({
    subjective:
      "42-year-old male presents with 6-month history of progressive bilateral muffled hearing, high-pitched constant tinnitus in right ear, and intermittent rotational vertigo triggered by rolling rightward in bed. Reports right nasal blockage and loud snoring with morning headaches.",
    objective:
      "Otoscopy: Left TM intact. Right TM mild pars tensa retraction, intact. Weber test lateralizes to left ear. Rinne test positive bilaterally (AC > BC).\nAudiometry: Moderate Sensorineural Hearing Loss Right (45 dB HL, SDS 84%), Mild SNHL Left (38 dB HL, SDS 92%).\nNose & Throat: DNS to Right with Left Inferior Turbinate Hypertrophy. Grade 1 Nasal Polyp right meatus. Mallampati Class III, Epworth Scale 14/24.\nDix-Hallpike Test: Positive on Right with torsional geotropic nystagmus.",
    assessment:
      "1. Right Posterior Canal BPPV (Benign Paroxysmal Positional Vertigo) - Resolved post Epley Maneuver.\n2. Bilateral Moderate Sensorineural Hearing Loss with Right-sided Tinnitus.\n3. Deviated Nasal Septum (DNS) Right with Chronic Rhinosinusitis (SNOT-22 Score 34/110).\n4. Suspected Obstructive Sleep Apnea (OSA) secondary to Mallampati Class III & Airway Resistance.",
    plan:
      "1. Performed Epley Canalith Repositioning Maneuver for Right BPPV today. Advise head elevation for 48 hours.\n2. Trial of Fluticasone Furoate Nasal Spray 2 puffs BD + Saline Nasal Douching for DNS/Sinusitis.\n3. Trial of Hearing Aid evaluation for Right ear SNHL.\n4. Order Level 1 Overnight Polysomnography (Sleep Study) for AHI evaluation.\n5. Review in 4 weeks with sleep study report."
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
              <Ear className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA ENT (Otolaryngology) & Audiology Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  AAO-HNS 2026 Guidelines
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pure Tone Audiogram, Dix-Hallpike BPPV Vertigo, SNOT-22 Rhinosinusitis, Flexible Video Laryngoscopy & OSA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldAlert className="h-4 w-4 text-purple-400" />
            <span>AI Otolaryngology Diagnostic Assistant Active</span>
          </div>
        </div>

        {/* Patient Profile & Critical ENT Metrics Banner */}
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
                  ID: ENT-2026-8821
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Audiometry R/L: <strong className="text-purple-300 font-mono">{ptaRightDb} dB / {ptaLeftDb} dB HL</strong></span>
                <span className="text-slate-500">•</span>
                <span>SNOT-22 Score: <strong className="text-amber-300 font-mono">{snot22Score} / 110</strong></span>
                <span className="text-slate-500">•</span>
                <span>Airway Mallampati: <strong className="text-emerald-300 font-mono">Class {mallampatiClass}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-purple-900/60 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200">
              Vertigo Check: <span className="text-white font-black">{vertigoSubtype} (Epley Done)</span>
            </div>
            <div className="px-3 py-1.5 bg-blue-900/60 border border-blue-500/50 rounded-xl text-xs font-bold text-blue-200">
              Epworth Sleep Scale: <span className="text-white font-black">{epworthSleepinessScore}/24 (OSA Risk)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "ear", label: "👂 Ear, Otoscopy & Tinnitus Matrix", icon: Ear },
            { id: "audiometry", label: "📊 Pure Tone Audiometry (PTA)", icon: Volume2 },
            { id: "vertigo", label: "🌀 Vertigo & Dix-Hallpike BPPV", icon: Brain },
            { id: "nose", label: "👃 Nose, SNOT-22 & Rhinosinusitis", icon: Wind },
            { id: "throat", label: "🫁 Throat, Larynx & Sleep Apnea", icon: Mic },
            { id: "soap", label: "📝 ENT SOAP Consultation Note", icon: FileText }
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

        {/* TAB 1: EAR & OTOSCOPY */}
        {activeTab === "ear" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ear className="h-5 w-5 text-purple-400" />
                  Otoscopic Examination & Tinnitus Evaluation Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Tympanic membrane integrity, middle ear effusion, Weber/Rinne tuning fork tests, and tinnitus rating.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-purple-900/80 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200">
                Hearing Subtype: <span className="text-white font-black">{hearingLossType}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-purple-300">Left Tympanic Membrane (Otoscopy)</label>
                <input
                  type="text"
                  value={eardrumStatusLeft}
                  onChange={(e) => setEardrumStatusLeft(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-purple-300">Right Tympanic Membrane (Otoscopy)</label>
                <input
                  type="text"
                  value={eardrumStatusRight}
                  onChange={(e) => setEardrumStatusRight(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-purple-300">Tinnitus Visual Analog Severity Score (1-10)</label>
                <input
                  type="number"
                  value={tinnitusSeverity}
                  onChange={(e) => setTinnitusSeverity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-purple-300">Tinnitus Pitch & Acoustic Character</label>
                <input
                  type="text"
                  value={tinnitusPitch}
                  onChange={(e) => setTinnitusPitch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PURE TONE AUDIOMETRY (PTA) */}
        {activeTab === "audiometry" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-blue-400" />
                  Pure Tone Audiometry (PTA) & Speech Discrimination Scores
                </h3>
                <p className="text-xs text-slate-400">
                  Air Conduction (AC) vs Bone Conduction (BC) thresholds across 250 Hz - 8,000 Hz frequencies.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-blue-900/80 border border-blue-500/50 rounded-xl text-xs font-bold text-blue-200">
                PTA Average: <span className="text-white font-black">Right {ptaRightDb} dB HL | Left {ptaLeftDb} dB HL</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">Right Ear Pure Tone Average (dB HL)</label>
                <input
                  type="number"
                  value={ptaRightDb}
                  onChange={(e) => setPtaRightDb(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{ptaRightDb > 40 ? "Moderate Loss" : "Normal/Mild"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">Left Ear Pure Tone Average (dB HL)</label>
                <input
                  type="number"
                  value={ptaLeftDb}
                  onChange={(e) => setPtaLeftDb(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{ptaLeftDb > 25 ? "Mild Loss" : "Normal"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">Right Speech Discrimination Score (%)</label>
                <input
                  type="number"
                  value={speechDiscriminationRightPct}
                  onChange={(e) => setSpeechDiscriminationRightPct(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Score: {speechDiscriminationRightPct}%</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-blue-300 block">Left Speech Discrimination Score (%)</label>
                <input
                  type="number"
                  value={speechDiscriminationLeftPct}
                  onChange={(e) => setSpeechDiscriminationLeftPct(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Score: {speechDiscriminationLeftPct}%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VERTIGO & DIX-HALLPIKE BPPV */}
        {activeTab === "vertigo" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-400" />
                  Otoneurology & Dix-Hallpike BPPV Canalithiasis Repositioning Protocol
                </h3>
                <p className="text-xs text-slate-400">
                  Differentiates BPPV, Meniere's disease, Vestibular Neuritis, and Central Vertigo.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-indigo-900/80 border border-indigo-500/50 rounded-xl text-xs font-bold text-indigo-200">
                Diagnosis: <span className="text-white font-black">{vertigoSubtype}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-300 block">Right Dix-Hallpike Test Result</span>
                <input
                  type="text"
                  value={dixHallpikeRight}
                  onChange={(e) => setDixHallpikeRight(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-300 block">Left Dix-Hallpike Test Result</span>
                <input
                  type="text"
                  value={dixHallpikeLeft}
                  onChange={(e) => setDixHallpikeLeft(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-300 text-xs">Epley Canalith Repositioning Maneuver Performed Today</h4>
                <p className="text-[11px] text-slate-400">Otoconial debris successfully cleared from Right Posterior Semicircular Canal.</p>
              </div>
              <button
                onClick={() => setEpleyManeuverDone(!epleyManeuverDone)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  epleyManeuverDone ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300"
                }`}
              >
                {epleyManeuverDone ? "✓ Epley Completed" : "Mark Epley Done"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: NOSE, SNOT-22 & RHINOSINUSITIS */}
        {activeTab === "nose" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wind className="h-5 w-5 text-emerald-400" />
                  SNOT-22 Rhinosinusitis Index & Nasal Endoscopy Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Sinonasal Outcome Test (0-110), Septal Deviation, Nasal Polyps grading, and Lund-Mackay CT score.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/80 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-200">
                SNOT-22 Score: <span className="text-white font-black">{snot22Score} / 110</span> (Moderate Sinusitis Burden)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-emerald-300">Nasal Septum Alignment (DNS)</label>
                <input
                  type="text"
                  value={septalDeviationType}
                  onChange={(e) => setSeptalDeviationType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-emerald-300">Paranasal Sinus CT Scan (Lund-Mackay Findings)</label>
                <input
                  type="text"
                  value={paranasalCtFindings}
                  onChange={(e) => setParanasalCtFindings(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: THROAT, LARYNX & SLEEP APNEA */}
        {activeTab === "throat" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Mic className="h-5 w-5 text-amber-400" />
                  Airway Mallampati Class, Video Laryngoscopy & Epworth Sleepiness Scale
                </h3>
                <p className="text-xs text-slate-400">
                  Vocal cord mobility/nodules, tonsillar hypertrophy, and Obstructive Sleep Apnea (OSA) screening.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-amber-900/80 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
                Epworth Score: <span className="text-white font-black">{epworthSleepinessScore} / 24</span> (High OSA Probability)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Mallampati Airway Score (Class I-IV)</label>
                <input
                  type="number"
                  value={mallampatiClass}
                  onChange={(e) => setMallampatiClass(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Class {mallampatiClass}: {mallampatiClass >= 3 ? "Restricted Oropharyngeal View" : "Normal View"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Recurrent Tonsillitis Episodes (Past Year)</label>
                <input
                  type="number"
                  value={recurrentTonsillitisEpisodes}
                  onChange={(e) => setRecurrentTonsillitisEpisodes(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{recurrentTonsillitisEpisodes >= 7 ? "Paradise Criteria Met for Tonsillectomy" : "Conservative Management"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Epworth Sleepiness Score (0-24)</label>
                <input
                  type="number"
                  value={epworthSleepinessScore}
                  onChange={(e) => setEpworthSleepinessScore(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{epworthSleepinessScore > 10 ? "⚠️ Sleep Study Indicated" : "Normal Daytime Alertness"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ENT SOAP CONSULTATION NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Otolaryngology (ENT) Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">S - Subjective (History, Tinnitus, Vertigo, SNOT-22, Snoring)</label>
                <textarea
                  value={entSoap.subjective}
                  onChange={(e) => setEntSoap({ ...entSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">O - Objective (Otoscopy, PTA Thresholds, Dix-Hallpike, Endoscopy)</label>
                <textarea
                  value={entSoap.objective}
                  onChange={(e) => setEntSoap({ ...entSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">A - Assessment (BPPV, SNHL, DNS/Sinusitis, Suspected OSA)</label>
                <textarea
                  value={entSoap.assessment}
                  onChange={(e) => setEntSoap({ ...entSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-300">P - Plan (Epley Maneuver, Fluticasone, Hearing Aid, Polysomnography)</label>
                <textarea
                  value={entSoap.plan}
                  onChange={(e) => setEntSoap({ ...entSoap, plan: e.target.value })}
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

export default ENTSuite;
