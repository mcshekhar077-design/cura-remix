import React, { useState } from "react";
import {
  Ambulance,
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
  Wind
} from "lucide-react";

export interface EmergencySuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function EmergencySuite({
  onBackToLanding,
  patientName = "Vikram Malhotra",
  patientAge = 48,
  patientGender = "Male"
}: EmergencySuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "triage" | "sepsis" | "icu" | "ventilation" | "code_blue" | "soap"
  >("triage");

  // ESI Triage & Registration State
  const [esiLevel, setEsiLevel] = useState<number>(2); // ESI 1 (Resuscitation) to 5 (Non-urgent)
  const [arrivalMode, setArrivalMode] = useState<string>("Advanced Life Support Ambulance (108)");
  const [chiefComplaint, setChiefComplaint] = useState<string>("Acute High-Grade Fever, Confusion & Severe Dyspnea for 6 Hours");
  
  // Triage Vitals
  const [vitalSystolicBp, setVitalSystolicBp] = useState<number>(88); // Hypotensive
  const [vitalDiastolicBp, setVitalDiastolicBp] = useState<number>(54);
  const [vitalHeartRate, setVitalHeartRate] = useState<number>(124); // Tachycardia
  const [vitalRespRate, setVitalRespRate] = useState<number>(28); // Tachypnea
  const [vitalSpO2Pct, setVitalSpO2Pct] = useState<number>(89); // Hypoxia
  const [vitalTempC, setVitalTempC] = useState<number>(39.2); // Fever
  const [vitalGcsScore, setVitalGcsScore] = useState<number>(12); // E3V4M5

  // Sepsis qSOFA & SIRS State
  const qsofaScore = (vitalSystolicBp <= 100 ? 1 : 0) + (vitalRespRate >= 22 ? 1 : 0) + (vitalGcsScore < 15 ? 1 : 0);
  const sirsCriteria = (vitalTempC > 38 || vitalTempC < 36 ? 1 : 0) + (vitalHeartRate > 90 ? 1 : 0) + (vitalRespRate > 20 ? 1 : 0);
  const [wbcCountK, setWbcCountK] = useState<number>(18.5); // Leukocytosis
  const sirsTotal = sirsCriteria + (wbcCountK > 12 || wbcCountK < 4 ? 1 : 0);
  const [lactateMmol, setLactateMmol] = useState<number>(4.2); // Severe Lactic Acidosis (>2.0)

  // ICU Organ Failure & SOFA Score State
  const [sofaPao2Fio2Ratio, setSofaPao2Fio2Ratio] = useState<number>(185); // Moderate ARDS (PaO2/FiO2 <200) -> 3 pts
  const [sofaPlateletCountK, setSofaPlateletCountK] = useState<number>(85); // Thrombocytopenia <100 -> 2 pts
  const [sofaBilirubinMg, setSofaBilirubinMg] = useState<number>(2.4); // Jaundice -> 1 pt
  const [sofaMapMmHg, setSofaMapMmHg] = useState<number>(65); // MAP = (88+2*54)/3 = 65.3
  const [sofaNorEpiDose, setSofaNorEpiDose] = useState<number>(0.12); // Norepinephrine mcg/kg/min -> 3 pts
  const [sofaCreatinineMg, setSofaCreatinineMg] = useState<number>(2.8); // AKI -> 2 pts

  const calculateSofaTotal = () => {
    let score = 0;
    // Resp
    if (sofaPao2Fio2Ratio < 100) score += 4;
    else if (sofaPao2Fio2Ratio < 200) score += 3;
    else if (sofaPao2Fio2Ratio < 300) score += 2;
    else if (sofaPao2Fio2Ratio < 400) score += 1;

    // Coagulation
    if (sofaPlateletCountK < 20) score += 4;
    else if (sofaPlateletCountK < 50) score += 3;
    else if (sofaPlateletCountK < 100) score += 2;
    else if (sofaPlateletCountK < 150) score += 1;

    // Liver
    if (sofaBilirubinMg >= 12.0) score += 4;
    else if (sofaBilirubinMg >= 6.0) score += 3;
    else if (sofaBilirubinMg >= 2.0) score += 2;
    else if (sofaBilirubinMg >= 1.2) score += 1;

    // CV
    if (sofaNorEpiDose > 0.1) score += 4;
    else if (sofaNorEpiDose > 0) score += 3;
    else if (sofaMapMmHg < 70) score += 1;

    // CNS (GCS)
    if (vitalGcsScore < 6) score += 4;
    else if (vitalGcsScore <= 9) score += 3;
    else if (vitalGcsScore <= 12) score += 2;
    else if (vitalGcsScore <= 14) score += 1;

    // Renal
    if (sofaCreatinineMg >= 5.0) score += 4;
    else if (sofaCreatinineMg >= 3.5) score += 3;
    else if (sofaCreatinineMg >= 2.0) score += 2;
    else if (sofaCreatinineMg >= 1.2) score += 1;

    return score;
  };
  const sofaTotalScore = calculateSofaTotal();

  // Ventilator & ABG Matrix State
  const [ventMode, setVentMode] = useState<string>("PRVC (Pressure Regulated Volume Control)");
  const [fio2Pct, setFio2Pct] = useState<number>(60);
  const [peepCmH2O, setPeepCmH2O] = useState<number>(10);
  const [tidalVolumeMl, setTidalVolumeMl] = useState<number>(420); // 6 ml/kg PBW for ARDS
  const [abgPh, setAbgPh] = useState<number>(7.24); // Acidemia
  const [abgPaco2, setAbgPaco2] = useState<number>(32); // Respiratory compensation
  const [abgPao2, setAbgPao2] = useState<number>(111); // PaO2/FiO2 = 111 / 0.6 = 185
  const [abgHco3, setAbgHco3] = useState<number>(14); // Metabolic acidosis

  // Code Blue & ACLS Protocol State
  const [codeBlueStatus, setCodeBlueStatus] = useState<string>("Standby - ACLS Resuscitation Team Ready");
  const [lastDefibJoules, setLastDefibJoules] = useState<number>(200);
  const [epinephrineDosesGiven, setEpinephrineDosesGiven] = useState<number>(0);
  const [roscAchieved, setRoscAchieved] = useState<boolean>(true); // Return of Spontaneous Circulation

  // Emergency SOAP State
  const [emergencySoap, setEmergencySoap] = useState({
    subjective:
      "48-year-old male brought to ED by ALS ambulance with 12-hour history of severe fever, chills, progressive shortness of breath, and altered mental status. Family states patient became increasingly lethargic and confused over the past 4 hours.",
    objective:
      "Vitals: BP 88/54 mmHg (MAP 65), HR 124 bpm (sinus tachycardia), RR 28/min, SpO2 89% on room air (improved to 96% on NRB mask), Temp 39.2°C, GCS 12 (E3V4M5).\nLabs: WBC 18.5K/µL, Platelets 85K/µL, Serum Lactate 4.2 mmol/L, Creatinine 2.8 mg/dL, Bilirubin 2.4 mg/dL.\nABG (FiO2 60%): pH 7.24, PaCO2 32, PaO2 111, HCO3 14, BE -11. PaO2/FiO2 = 185 (Moderate ARDS).\nqSOFA = 3/3 (High Sepsis Risk), Total SOFA Score = 13 (High ICU Mortality Risk).",
    assessment:
      "1. Septic Shock secondary to Community-Acquired Pneumonia (Severe Lactic Acidosis 4.2 mmol/L, Refractory Hypotension).\n2. Moderate Acute Respiratory Distress Syndrome (ARDS) (PaO2/FiO2 185).\n3. Acute Kidney Injury (AKI Stage 2) & Thrombocytopenia secondary to Sepsis.",
    plan:
      "1. Immediate 30 mL/kg IV Crystalloid Bolus (2,000 mL Plasma-Lyte) started via dual large-bore IVs.\n2. Initiate IV Norepinephrine infusion titrated to maintain MAP ≥65 mmHg.\n3. STAT Blood Cultures x2 & Sputum Culture followed by Broad-Spectrum IV Antibiotics: Meropenem 1g IV + Vancomycin 1.5g IV within 1 Hour Sepsis Bundle.\n4. ICU Bed Transfer for invasive arterial line monitoring and Non-Invasive Ventilation / Intubation readiness.\n5. Repeat Serum Lactate and ABG in 2 hours."
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
            <div className="p-2.5 bg-red-600/20 border border-red-500/30 rounded-xl animate-pulse">
              <Ambulance className="h-7 w-7 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Emergency Medicine & ICU Critical Care Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 rounded-full">
                  ESI 2026 Triage & Sepsis 3.0 Protocol
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ESI Level 1-5 Triage, qSOFA/SIRS Sepsis Alert, SOFA Organ Failure Index, PRVC Mechanical Ventilation & ACLS Code Blue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldAlert className="h-4 w-4 text-rose-400 animate-bounce" />
            <span>AI Sepsis & ICU Resuscitation Engine Active</span>
          </div>
        </div>

        {/* Patient Profile & Critical Status Banner */}
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
                  ID: EM-ICU-2026-9908
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>ESI Triage: <strong className="text-red-400 font-mono">ESI Level {esiLevel} (Emergency)</strong></span>
                <span className="text-slate-500">•</span>
                <span>qSOFA Score: <strong className="text-rose-300 font-mono">{qsofaScore} / 3 (High Sepsis)</strong></span>
                <span className="text-slate-500">•</span>
                <span>Lactate: <strong className="text-amber-300 font-mono">{lactateMmol} mmol/L</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-red-900/60 border border-red-500/50 rounded-xl text-xs font-bold text-red-200">
              SOFA Organ Failure Score: <span className="text-white font-black">{sofaTotalScore} Points</span>
            </div>
            <div className="px-3 py-1.5 bg-purple-900/60 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200">
              Ventilator: <span className="text-white font-black">PaO2/FiO2 = {sofaPao2Fio2Ratio} (ARDS)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "triage", label: "🚨 ESI Triage & Emergency Registration", icon: Ambulance },
            { id: "sepsis", label: "🔥 Sepsis qSOFA & 1-Hour Bundle", icon: Flame },
            { id: "icu", label: "🏥 ICU Organ Failure & SOFA Matrix", icon: Hospital },
            { id: "ventilation", label: "🫁 Mechanical Ventilation & ABG", icon: Wind },
            { id: "code_blue", label: "⚡ ACLS Code Blue & Resuscitation", icon: Zap },
            { id: "soap", label: "📝 Emergency SOAP Note", icon: FileText }
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

        {/* TAB 1: ESI TRIAGE & EMERGENCY REGISTRATION */}
        {activeTab === "triage" && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Ambulance className="h-5 w-5 text-red-400" />
                    Emergency Severity Index (ESI 5-Level) Triage & Vitals Registration
                  </h3>
                  <p className="text-xs text-slate-400">
                    Immediate life threat check (ESI 1), high risk/confusion (ESI 2), resource prediction (ESI 3-5).
                  </p>
                </div>

                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  esiLevel === 1
                    ? "bg-red-900/90 text-white border border-red-500 animate-pulse"
                    : esiLevel === 2
                    ? "bg-rose-900/80 text-rose-200 border border-rose-500/50"
                    : "bg-amber-900/80 text-amber-200 border border-amber-500/50"
                }`}>
                  ESI Classification: <span className="text-white font-black">Level {esiLevel} ({esiLevel === 1 ? "Immediate Resuscitation" : esiLevel === 2 ? "High Risk / Emergency" : "Urgent Workup"})</span>
                </div>
              </div>

              {/* ESI Level Selector Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { level: 1, label: "ESI 1: Resuscitation (Life Threat)", color: "bg-red-700 border-red-500" },
                  { level: 2, label: "ESI 2: Emergency (High Risk / Lethargy)", color: "bg-rose-700 border-rose-500" },
                  { level: 3, label: "ESI 3: Urgent (2+ Resources Needed)", color: "bg-amber-700 border-amber-500" },
                  { level: 4, label: "ESI 4: Less Urgent (1 Resource Needed)", color: "bg-blue-700 border-blue-500" },
                  { level: 5, label: "ESI 5: Non-Urgent (No Resources)", color: "bg-slate-700 border-slate-600" }
                ].map((item) => (
                  <button
                    key={item.level}
                    onClick={() => setEsiLevel(item.level)}
                    className={`p-3 rounded-xl border font-bold text-[11px] text-left transition cursor-pointer ${
                      esiLevel === item.level
                        ? `${item.color} text-white shadow-lg`
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] block font-bold">Systolic BP (mmHg)</span>
                  <input
                    type="number"
                    value={vitalSystolicBp}
                    onChange={(e) => setVitalSystolicBp(Number(e.target.value))}
                    className={`w-full bg-slate-800 border rounded-lg p-2 font-mono text-xs ${vitalSystolicBp < 90 ? "border-red-500 text-red-300" : "border-slate-700 text-white"}`}
                  />
                  <span className="text-[9px] text-slate-500 block">{vitalSystolicBp < 90 ? "⚠️ Hypotension" : "Normal"}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] block font-bold">Diastolic BP (mmHg)</span>
                  <input
                    type="number"
                    value={vitalDiastolicBp}
                    onChange={(e) => setVitalDiastolicBp(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-xs text-white"
                  />
                  <span className="text-[9px] text-slate-500 block">MAP: {Math.round((vitalSystolicBp + 2 * vitalDiastolicBp) / 3)} mmHg</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] block font-bold">Heart Rate (bpm)</span>
                  <input
                    type="number"
                    value={vitalHeartRate}
                    onChange={(e) => setVitalHeartRate(Number(e.target.value))}
                    className={`w-full bg-slate-800 border rounded-lg p-2 font-mono text-xs ${vitalHeartRate > 100 ? "border-amber-500 text-amber-300" : "border-slate-700 text-white"}`}
                  />
                  <span className="text-[9px] text-slate-500 block">{vitalHeartRate > 100 ? "⚠️ Tachycardia" : "Normal"}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] block font-bold">Resp Rate (/min)</span>
                  <input
                    type="number"
                    value={vitalRespRate}
                    onChange={(e) => setVitalRespRate(Number(e.target.value))}
                    className={`w-full bg-slate-800 border rounded-lg p-2 font-mono text-xs ${vitalRespRate >= 22 ? "border-red-500 text-red-300" : "border-slate-700 text-white"}`}
                  />
                  <span className="text-[9px] text-slate-500 block">{vitalRespRate >= 22 ? "⚠️ Tachypnea" : "Normal"}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] block font-bold">SpO2 (%)</span>
                  <input
                    type="number"
                    value={vitalSpO2Pct}
                    onChange={(e) => setVitalSpO2Pct(Number(e.target.value))}
                    className={`w-full bg-slate-800 border rounded-lg p-2 font-mono text-xs ${vitalSpO2Pct < 92 ? "border-red-500 text-red-300" : "border-slate-700 text-white"}`}
                  />
                  <span className="text-[9px] text-slate-500 block">{vitalSpO2Pct < 92 ? "⚠️ Hypoxia" : "Normal"}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] block font-bold">Temperature (°C)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalTempC}
                    onChange={(e) => setVitalTempC(Number(e.target.value))}
                    className={`w-full bg-slate-800 border rounded-lg p-2 font-mono text-xs ${vitalTempC >= 38 ? "border-rose-500 text-rose-300" : "border-slate-700 text-white"}`}
                  />
                  <span className="text-[9px] text-slate-500 block">{vitalTempC >= 38 ? "⚠️ Hyperthermia" : "Normal"}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] block font-bold">GCS Score (3-15)</span>
                  <input
                    type="number"
                    value={vitalGcsScore}
                    onChange={(e) => setVitalGcsScore(Number(e.target.value))}
                    className={`w-full bg-slate-800 border rounded-lg p-2 font-mono text-xs ${vitalGcsScore < 15 ? "border-amber-500 text-amber-300" : "border-slate-700 text-white"}`}
                  />
                  <span className="text-[9px] text-slate-500 block">{vitalGcsScore < 15 ? "⚠️ Altered Sensorium" : "Normal"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEPSIS qSOFA & 1-HOUR BUNDLE */}
        {activeTab === "sepsis" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-rose-400" />
                  Sepsis 3.0 qSOFA / SIRS Alert & Surviving Sepsis 1-Hour Bundle
                </h3>
                <p className="text-xs text-slate-400">
                  Quick SOFA criteria (SBP ≤100, RR ≥22, GCS &lt;15), Serum Lactate, and 30 mL/kg IV fluid resuscitation.
                </p>
              </div>

              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                qsofaScore >= 2
                  ? "bg-rose-900/90 text-white border border-rose-500 animate-pulse"
                  : "bg-amber-900/80 text-amber-200 border border-amber-500/50"
              }`}>
                qSOFA Score: <span className="text-white font-black">{qsofaScore} / 3</span> ({qsofaScore >= 2 ? "HIGH RISK FOR SEPSIS" : "Low Sepsis Risk"})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-rose-300 block">qSOFA Criterion 1: SBP ≤ 100 mmHg</span>
                <p className="text-white font-mono text-sm">{vitalSystolicBp} mmHg ({vitalSystolicBp <= 100 ? "✓ Positive (+1)" : "Negative (0)"})</p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-rose-300 block">qSOFA Criterion 2: Resp Rate ≥ 22 /min</span>
                <p className="text-white font-mono text-sm">{vitalRespRate} /min ({vitalRespRate >= 22 ? "✓ Positive (+1)" : "Negative (0)"})</p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-rose-300 block">qSOFA Criterion 3: Altered Mental Status (GCS &lt;15)</span>
                <p className="text-white font-mono text-sm">GCS {vitalGcsScore} ({vitalGcsScore < 15 ? "✓ Positive (+1)" : "Negative (0)"})</p>
              </div>
            </div>

            {/* Surviving Sepsis 1-Hour Bundle Checklist */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-rose-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Surviving Sepsis Campaign 1-Hour Bundle Checklist
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span>1. Measure Serum Lactate (STAT)</span>
                  <span className="font-mono text-amber-300 font-bold">{lactateMmol} mmol/L</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span>2. Blood Cultures x2 Prior to ABX</span>
                  <span className="text-emerald-400 font-bold">✓ Drawn</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span>3. Broad-Spectrum IV Antibiotics</span>
                  <span className="text-emerald-400 font-bold">✓ Infusing</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span>4. 30 mL/kg IV Crystalloid for Hypotension</span>
                  <span className="font-mono text-cyan-300 font-bold">2,000 mL Plasma-Lyte</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span>5. Vasopressors (Norepinephrine) for MAP ≥65</span>
                  <span className="font-mono text-rose-300 font-bold">0.12 mcg/kg/min</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ICU ORGAN FAILURE & SOFA MATRIX */}
        {activeTab === "icu" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Hospital className="h-5 w-5 text-purple-400" />
                  Sequential Organ Failure Assessment (SOFA) Calculator & ICU Mortality Risk
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluates 6 organ systems: Respiratory, Coagulation, Liver, Cardiovascular, CNS, and Renal.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-purple-900/80 border border-purple-500/50 rounded-xl text-xs font-bold text-purple-200">
                Total SOFA Score: <span className="text-white font-black text-sm">{sofaTotalScore} Points</span> (&gt;50% Mortality Risk)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">Respiratory: PaO2 / FiO2 Ratio</label>
                <input
                  type="number"
                  value={sofaPao2Fio2Ratio}
                  onChange={(e) => setSofaPao2Fio2Ratio(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Current: {sofaPao2Fio2Ratio} mmHg ({sofaPao2Fio2Ratio < 200 ? "3 Points (ARDS)" : "Normal"})</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">Coagulation: Platelets (x10³/µL)</label>
                <input
                  type="number"
                  value={sofaPlateletCountK}
                  onChange={(e) => setSofaPlateletCountK(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Current: {sofaPlateletCountK}K ({sofaPlateletCountK < 100 ? "2 Points" : "Normal"})</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">Liver: Bilirubin (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sofaBilirubinMg}
                  onChange={(e) => setSofaBilirubinMg(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Current: {sofaBilirubinMg} mg/dL ({sofaBilirubinMg >= 2.0 ? "2 Points" : "Normal"})</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">Cardiovascular: Norepinephrine (mcg/kg/min)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sofaNorEpiDose}
                  onChange={(e) => setSofaNorEpiDose(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Current: {sofaNorEpiDose} mcg/kg/min ({sofaNorEpiDose > 0.1 ? "4 Points" : "Normal"})</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">CNS: Glasgow Coma Scale (GCS)</label>
                <input
                  type="number"
                  value={vitalGcsScore}
                  onChange={(e) => setVitalGcsScore(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Current: GCS {vitalGcsScore} ({vitalGcsScore <= 12 ? "2 Points" : "Normal"})</span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <label className="font-bold text-purple-300 block">Renal: Serum Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sofaCreatinineMg}
                  onChange={(e) => setSofaCreatinineMg(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Current: {sofaCreatinineMg} mg/dL ({sofaCreatinineMg >= 2.0 ? "2 Points" : "Normal"})</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MECHANICAL VENTILATION & ABG */}
        {activeTab === "ventilation" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wind className="h-5 w-5 text-cyan-400" />
                  Mechanical Ventilation Settings & Arterial Blood Gas (ABG) Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  PRVC / SIMV ventilation settings, ARDSNet low tidal volume protocol, and ABG acid-base interpretation.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-cyan-900/60 border border-cyan-500/40 rounded-xl text-xs font-bold text-cyan-200">
                ABG Interpretation: <span className="text-white font-black">Severe Metabolic Acidosis with Partial Comp</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-cyan-300">Mechanical Ventilator Parameters</h4>
                <div className="space-y-2">
                  <label className="block text-slate-400">Ventilation Mode</label>
                  <input
                    type="text"
                    value={ventMode}
                    onChange={(e) => setVentMode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px]">FiO2 (%)</label>
                    <input
                      type="number"
                      value={fio2Pct}
                      onChange={(e) => setFio2Pct(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">PEEP (cmH2O)</label>
                    <input
                      type="number"
                      value={peepCmH2O}
                      onChange={(e) => setPeepCmH2O(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">Tidal Volume (mL)</label>
                    <input
                      type="number"
                      value={tidalVolumeMl}
                      onChange={(e) => setTidalVolumeMl(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-cyan-300">Arterial Blood Gas (ABG) Panel</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px]">pH (7.35 - 7.45)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={abgPh}
                      onChange={(e) => setAbgPh(Number(e.target.value))}
                      className={`w-full bg-slate-800 border rounded-lg p-2 font-mono text-xs ${abgPh < 7.35 ? "border-red-500 text-red-300" : "border-slate-700 text-white"}`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px]">PaCO2 (mmHg)</label>
                    <input
                      type="number"
                      value={abgPaco2}
                      onChange={(e) => setAbgPaco2(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px]">PaO2 (mmHg)</label>
                    <input
                      type="number"
                      value={abgPao2}
                      onChange={(e) => setAbgPao2(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px]">HCO3 (mEq/L)</label>
                    <input
                      type="number"
                      value={abgHco3}
                      onChange={(e) => setAbgHco3(Number(e.target.value))}
                      className={`w-full bg-slate-800 border rounded-lg p-2 font-mono text-xs ${abgHco3 < 22 ? "border-red-500 text-red-300" : "border-slate-700 text-white"}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ACLS CODE BLUE & RESUSCITATION */}
        {activeTab === "code_blue" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-400" />
                  AHA 2026 ACLS Cardiac Arrest & Resuscitation Protocol
                </h3>
                <p className="text-xs text-slate-400">
                  Shockable (VF/pVT) vs Non-Shockable (PEA/Asystole) pathways, Epinephrine/Amiodarone cycles, and ROSC management.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200">
                Resuscitation Status: <span className="text-white font-black">{roscAchieved ? "ROSC Achieved (Post-Arrest ICU Care)" : "Active CPR / Shockable"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Code Blue Team Status</label>
                <input
                  type="text"
                  value={codeBlueStatus}
                  onChange={(e) => setCodeBlueStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Last Biphasic Shock Delivered (Joules)</label>
                <input
                  type="number"
                  value={lastDefibJoules}
                  onChange={(e) => setLastDefibJoules(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Epinephrine 1mg IV/IO Doses Administered</label>
                <input
                  type="number"
                  value={epinephrineDosesGiven}
                  onChange={(e) => setEpinephrineDosesGiven(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: EMERGENCY SOAP NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-400" />
              Emergency & Critical Care Specialist SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">S - Subjective (History, Chief Complaint, Arrival Mode)</label>
                <textarea
                  value={emergencySoap.subjective}
                  onChange={(e) => setEmergencySoap({ ...emergencySoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">O - Objective (Vitals, qSOFA, ABG, Lactate, SOFA Score)</label>
                <textarea
                  value={emergencySoap.objective}
                  onChange={(e) => setEmergencySoap({ ...emergencySoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">A - Assessment (Septic Shock, ARDS, AKI, Organ Failure)</label>
                <textarea
                  value={emergencySoap.assessment}
                  onChange={(e) => setEmergencySoap({ ...emergencySoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-red-300">P - Plan (Fluid Bolus, Norepinephrine, Antibiotics, ICU Transfer)</label>
                <textarea
                  value={emergencySoap.plan}
                  onChange={(e) => setEmergencySoap({ ...emergencySoap, plan: e.target.value })}
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

export default EmergencySuite;
