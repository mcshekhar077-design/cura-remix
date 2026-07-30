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

export interface CriticalCareSuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function CriticalCareSuite({
  onBackToLanding,
  patientName = "Rajesh Sharma",
  patientAge = 58,
  patientGender = "Male"
}: CriticalCareSuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "hemodynamics_sofa" | "mechanical_ventilation" | "septic_vasopressors" | "rass_sedation" | "abg_labs" | "soap"
  >("hemodynamics_sofa");

  // 1. Hemodynamics, SOFA & APACHE II Scoring State
  const [sofaScore, setSofaScore] = useState<number>(8); // 0-24
  const [apacheIiScore, setApacheIiScore] = useState<number>(22); // 0-71
  const [predictedMortality, setPredictedMortality] = useState<number>(28.5); // %
  const [meanArterialPressure, setMeanArterialPressure] = useState<number>(68); // mmHg (Target >65)
  const [centralVenousPressure, setCentralVenousPressure] = useState<number>(10); // mmHg (8-12)
  const [cardiacIndex, setCardiacIndex] = useState<number>(2.4); // L/min/m²
  const [systemicVascularResistance, setSystemicVascularResistance] = useState<number>(950); // dynes-sec/cm^5

  // 2. Mechanical Ventilation & Weaning Trial State
  const [ventMode, setVentMode] = useState<string>("PRVC / SIMV + PSV (Volume Targeted Pressure Controlled)");
  const [fio2, setFio2] = useState<number>(45); // %
  const [peepCmH2o, setPeepCmH2o] = useState<number>(8.0); // cmH2O
  const [tidalVolumeMl, setTidalVolumeMl] = useState<number>(440); // mL (6 mL/kg PBW)
  const [respiratoryRate, setRespiratoryRate] = useState<number>(18); // bpm
  const [peakInspiratoryPressure, setPeakInspiratoryPressure] = useState<number>(26); // cmH2O
  const [plateauPressure, setPlateauPressure] = useState<number>(21); // cmH2O (Target <30)
  const [rsbiIndex, setRsbiIndex] = useState<number>(54); // Rapid Shallow Breathing Index (f/VT <105 predicts weaning success)
  const [weaningReadinessPct, setWeaningReadinessPct] = useState<number>(82); // %

  // 3. Sepsis & Infusion Vasopressors State
  const [sepsisStatus, setSepsisStatus] = useState<string>("Septic Shock Secondary to Community Acquired Pneumonia (Sepsis-3 Criteria)");
  const [norepinephrineRate, setNorepinephrineRate] = useState<number>(0.12); // mcg/kg/min
  const [vasopressinRate, setVasopressinRate] = useState<number>(0.03); // units/min
  const [serumLactate, setSerumLactate] = useState<number>(2.8); // mmol/L (Declining from 4.8)
  const [procalcitonin, setProcalcitonin] = useState<number>(6.4); // ng/mL

  // 4. RASS Sedation, Delirium & Analgesia State
  const [rassScore, setRassScore] = useState<string>("-2 (Light Sedation, briefly awakens to voice)");
  const [camIcuStatus, setCamIcuStatus] = useState<string>("Negative for Delirium");
  const [propofolDose, setPropofolDose] = useState<number>(25); // mcg/kg/min
  const [fentanylDose, setFentanylDose] = useState<number>(50); // mcg/hr

  // 5. ABG, Blood Gas & Lab Analytics
  const [abgPh, setAbgPh] = useState<number>(7.36);
  const [abgPaco2, setAbgPaco2] = useState<number>(38); // mmHg
  const [abgPao2, setAbgPao2] = useState<number>(92); // mmHg
  const [pao2Fio2Ratio, setPao2Fio2Ratio] = useState<number>(204); // Mild-Moderate ARDS (200-300)
  const [abgHco3, setAbgHco3] = useState<number>(21.5); // mEq/L
  const [baseExcess, setBaseExcess] = useState<number>(-2.8); // mEq/L

  // 6. Critical Care Consultation SOAP State
  const [icuSoap, setIcuSoap] = useState({
    subjective:
      "Day 5 ICU Admission. 58-year-old male with severe Septic Shock secondary to Lobar Pneumonia and Mild ARDS. Intubated and mechanically ventilated. Sedated on Propofol/Fentanyl infusion (RASS -2). Hemodynamically supported on low-dose Norepinephrine infusion.",
    objective:
      "Vitals: BP 118/68 (MAP 85 mmHg), HR 84 bpm (SR), Temp 37.8°C, SpO2 98% on FiO2 45%.\nVentilator: PRVC mode, VT 440 mL, PEEP 8 cmH2O, RR 18, Plat 21 cmH2O. RSBI 54 (Passing SBT readiness).\nABG: pH 7.36, PaCO2 38, PaO2 92, P/F Ratio 204. Lactate 2.8 mmol/L (down from 4.8).\nSOFA Score: 8 | APACHE II Score: 22 (Predicted Mortality 28.5%).\nInfusions: Norepinephrine 0.12 mcg/kg/min, Vasopressin 0.03 u/min, Propofol 25 mcg/kg/min.\nInfectious Disease: Procalcitonin 6.4 ng/mL, receiving Piperacillin-Tazobactam 4.5g q6h.",
    assessment:
      "1. Resolving Septic Shock secondary to Severe Pneumonia with improving tissue perfusion & lactate clearance.\n2. Mild-Moderate Acute Respiratory Distress Syndrome (ARDS) with improving P/F ratio (204).\n3. Successful Spontaneous Breathing Trial (SBT) readiness with RSBI 54 (Candidate for extubation trial tomorrow).",
    plan:
      "1. Continue Norepinephrine weaning as MAP stays >65 mmHg.\n2. Perform formal 30-minute CPAP/PSV Spontaneous Breathing Trial tomorrow morning.\n3. Continue targeted antimicrobial therapy with Piperacillin-Tazobactam & daily Procalcitonin monitoring.\n4. Maintain light sedation target (RASS -1 to -2) and initiate DVT/stress ulcer prophylaxis."
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
              <Ambulance className="h-7 w-7 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Critical Care & Intensive Care Unit (ICU) AI Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 rounded-full">
                  SCCM / ESICM 2026 Guidelines
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                SOFA / APACHE II Score, Mechanical Ventilation & RSBI Weaning, Vasopressor Infusions & ABG P/F Ratio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <span>AI ICU Telemetry & Predictive Engine Active</span>
          </div>
        </div>

        {/* Patient Profile & Critical ICU Metrics Banner */}
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
                  Bed: ICU-04 (L3 Bed)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>SOFA: <strong className="text-red-300 font-mono">{sofaScore}</strong></span>
                <span className="text-slate-500">•</span>
                <span>APACHE II: <strong className="text-amber-300 font-mono">{apacheIiScore}</strong> ({predictedMortality}% Mort.)</span>
                <span className="text-slate-500">•</span>
                <span>MAP: <strong className="text-emerald-300 font-mono">{meanArterialPressure} mmHg</strong></span>
                <span className="text-slate-500">•</span>
                <span>P/F Ratio: <strong className="text-sky-300 font-mono">{pao2Fio2Ratio}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-red-900/60 border border-red-500/50 rounded-xl text-xs font-bold text-red-200">
              Weaning RSBI: <span className="text-white font-black">{rsbiIndex} (SBT Ready)</span>
            </div>
            <div className="px-3 py-1.5 bg-amber-900/60 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
              Vasopressor: <span className="text-white font-black">NE {norepinephrineRate} mcg/kg/m</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "hemodynamics_sofa", label: "📊 SOFA & APACHE II Hemodynamic Index", icon: Monitor },
            { id: "mechanical_ventilation", label: "🫁 Mechanical Ventilation & RSBI Weaning", icon: Wind },
            { id: "septic_vasopressors", label: "💉 Septic Shock & Vasopressor Infusions", icon: Syringe },
            { id: "rass_sedation", label: "🧠 RASS Sedation & CAM-ICU Delirium", icon: Brain },
            { id: "abg_labs", label: "🧪 ABG Blood Gas & Lactate Clearance", icon: FlaskConical },
            { id: "soap", label: "📝 Critical Care SOAP Consultation Note", icon: FileText }
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

        {/* TAB 1: SOFA & APACHE II HEMODYNAMIC INDEX */}
        {activeTab === "hemodynamics_sofa" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-red-400" />
                  Sequential Organ Failure Assessment (SOFA) & APACHE II Score
                </h3>
                <p className="text-xs text-slate-400">
                  Mean Arterial Pressure (MAP), Central Venous Pressure (CVP), Cardiac Index, Systemic Vascular Resistance (SVR).
                </p>
              </div>

              <div className="px-3 py-1.5 bg-red-900/80 border border-red-500/50 rounded-xl text-xs font-bold text-red-200">
                SOFA Score: <span className="text-white font-black">{sofaScore} / 24</span> (APACHE II {apacheIiScore})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-red-300 block">SOFA Score (0-24)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={sofaScore}
                  onChange={(e) => setSofaScore(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Multi-Organ Dysfunction Index</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-red-300 block">APACHE II Score (0-71)</label>
                <input
                  type="number"
                  min="0"
                  max="71"
                  value={apacheIiScore}
                  onChange={(e) => setApacheIiScore(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Predicted Mortality: {predictedMortality}%</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-red-300 block">Mean Arterial Pressure MAP (mmHg)</label>
                <input
                  type="number"
                  value={meanArterialPressure}
                  onChange={(e) => setMeanArterialPressure(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{meanArterialPressure >= 65 ? "Target Perfusion Met (&gt;65 mmHg)" : "⚠️ Hypoperfusion"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-red-300 block">Central Venous Pressure CVP (mmHg)</label>
                <input
                  type="number"
                  value={centralVenousPressure}
                  onChange={(e) => setCentralVenousPressure(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Normal 8-12 mmHg</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MECHANICAL VENTILATION & RSBI WEANING */}
        {activeTab === "mechanical_ventilation" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wind className="h-5 w-5 text-sky-400" />
                  Mechanical Ventilation Parameters & RSBI Extubation Trial
                </h3>
                <p className="text-xs text-slate-400">
                  FiO2 (%), PEEP (cmH2O), Tidal Volume (mL), Plateau Pressure, RSBI (f/VT) Weaning readiness.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-sky-900/80 border border-sky-500/50 rounded-xl text-xs font-bold text-sky-200">
                RSBI Index: <span className="text-white font-black">{rsbiIndex}</span> (SBT Readiness {weaningReadinessPct}%)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-sky-300 block">Fraction of Inspired Oxygen FiO2 (%)</label>
                <input
                  type="number"
                  value={fio2}
                  onChange={(e) => setFio2(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Target &lt;50% for Weaning</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-sky-300 block">Positive End-Expiratory Pressure PEEP (cmH2O)</label>
                <input
                  type="number"
                  step="0.5"
                  value={peepCmH2o}
                  onChange={(e) => setPeepCmH2o(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Physiologic 5-8 cmH2O</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-sky-300 block">Plateau Pressure Pplat (cmH2O)</label>
                <input
                  type="number"
                  value={plateauPressure}
                  onChange={(e) => setPlateauPressure(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{plateauPressure < 30 ? "Safe Lung Protection (&lt;30 cmH2O)" : "⚠️ Barotrauma Risk"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-sky-300 block">RSBI - Rapid Shallow Breathing Index (f/VT)</label>
                <input
                  type="number"
                  value={rsbiIndex}
                  onChange={(e) => setRsbiIndex(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{rsbiIndex < 105 ? "Extubation Candidate (&lt;105)" : "⚠️ High Failure Risk"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEPTIC SHOCK & VASOPRESSOR INFUSIONS */}
        {activeTab === "septic_vasopressors" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Syringe className="h-5 w-5 text-amber-400" />
                  Septic Shock Sepsis-3 Protocol & Inotrope / Vasopressor Titration
                </h3>
                <p className="text-xs text-slate-400">
                  Norepinephrine (mcg/kg/min), Vasopressin (u/min), Serum Lactate (mmol/L), Procalcitonin (ng/mL).
                </p>
              </div>

              <div className="px-3 py-1.5 bg-amber-900/80 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-200">
                Norepinephrine: <span className="text-white font-black">{norepinephrineRate} mcg/kg/min</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Norepinephrine Dose (mcg/kg/min)</label>
                <input
                  type="number"
                  step="0.02"
                  value={norepinephrineRate}
                  onChange={(e) => setNorepinephrineRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">1st Line Vasopressor</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Vasopressin Infusion (units/min)</label>
                <input
                  type="number"
                  step="0.01"
                  value={vasopressinRate}
                  onChange={(e) => setVasopressinRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Fixed Adjunct Dose 0.03 u/min</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Serum Arterial Lactate (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={serumLactate}
                  onChange={(e) => setSerumLactate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{serumLactate < 2.0 ? "Normal Clearance (&lt;2.0)" : "Clearing (Target &lt;2.0)"}</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-amber-300 block">Procalcitonin Biomarker (ng/mL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={procalcitonin}
                  onChange={(e) => setProcalcitonin(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{procalcitonin > 2.0 ? "⚠️ Bacterial Sepsis Biomarker" : "Clearing"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RASS SEDATION & CAM-ICU DELIRIUM */}
        {activeTab === "rass_sedation" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Richmond Agitation-Sedation Scale (RASS) & CAM-ICU Assessment
                </h3>
                <p className="text-xs text-slate-400">
                  RASS target (-1 to -2), CAM-ICU Delirium screening, Propofol (mcg/kg/min) and Fentanyl analgesia.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-purple-900/80 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200">
                RASS Target: <span className="text-white font-black">{rassScore}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-300 block">Propofol Continuous Infusion (mcg/kg/min)</span>
                <input
                  type="number"
                  value={propofolDose}
                  onChange={(e) => setPropofolDose(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Sedation Target RASS -1 to -2</span>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-300 block">Fentanyl Continuous Analgesia (mcg/hr)</span>
                <input
                  type="number"
                  value={fentanylDose}
                  onChange={(e) => setFentanylDose(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Analgesia First Protocol</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ABG BLOOD GAS & LACTATE CLEARANCE */}
        {activeTab === "abg_labs" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-emerald-400" />
                  Arterial Blood Gas (ABG) & Berlin ARDS Oxygenation Index
                </h3>
                <p className="text-xs text-slate-400">
                  pH, PaCO2 (mmHg), PaO2 (mmHg), PaO2/FiO2 Ratio (P/F), HCO3- (mEq/L), Base Excess.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/80 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-200">
                P/F Ratio: <span className="text-white font-black">{pao2Fio2Ratio}</span> (Mild-Moderate ARDS)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-emerald-300 block">Arterial pH</label>
                <input
                  type="number"
                  step="0.01"
                  value={abgPh}
                  onChange={(e) => setAbgPh(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Normal 7.35 - 7.45</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-emerald-300 block">Arterial PaCO2 (mmHg)</label>
                <input
                  type="number"
                  value={abgPaco2}
                  onChange={(e) => setAbgPaco2(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Normal 35-45 mmHg</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-emerald-300 block">Arterial PaO2 (mmHg)</label>
                <input
                  type="number"
                  value={abgPao2}
                  onChange={(e) => setAbgPao2(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Target &gt;80 mmHg</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-emerald-300 block">PaO2 / FiO2 Ratio (P/F)</label>
                <input
                  type="number"
                  value={pao2Fio2Ratio}
                  onChange={(e) => setPao2Fio2Ratio(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">{pao2Fio2Ratio < 300 ? "ARDS Criteria Met (200-300)" : "Normal Oxygenation"}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CRITICAL CARE SOAP CONSULTATION NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-400" />
              Critical Care Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">S - Subjective (Day 5 ICU, Intubated Status, Sedation Level, Septic Shock)</label>
                <textarea
                  value={icuSoap.subjective}
                  onChange={(e) => setIcuSoap({ ...icuSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">O - Objective (Vitals, Vent Settings, ABG, SOFA 8, APACHE 22, Lactate, Infusions)</label>
                <textarea
                  value={icuSoap.objective}
                  onChange={(e) => setIcuSoap({ ...icuSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">A - Assessment (Resolving Septic Shock, Improving P/F 204, RSBI 54 SBT Candidate)</label>
                <textarea
                  value={icuSoap.assessment}
                  onChange={(e) => setIcuSoap({ ...icuSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">P - Plan (Norepinephrine Weaning, Morning SBT Trial, Piperacillin-Tazobactam, Prophylaxis)</label>
                <textarea
                  value={icuSoap.plan}
                  onChange={(e) => setIcuSoap({ ...icuSoap, plan: e.target.value })}
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

export default CriticalCareSuite;
