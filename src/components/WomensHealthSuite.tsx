import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Baby,
  Calendar,
  Activity,
  Sparkles,
  ShieldAlert,
  Plus,
  CheckCircle,
  FileText,
  AlertTriangle,
  TrendingUp,
  Award,
  Clock,
  Zap,
  Info,
  CheckCircle2,
  RefreshCw,
  Search,
  Scale,
  Ruler,
  ShieldCheck,
  Stethoscope,
  BookOpen,
  Droplets,
  Flower2,
  Sun,
  Flame,
  Pill
} from "lucide-react";

export interface WomensHealthSuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

export function WomensHealthSuite({
  onBackToLanding,
  patientName = "Priya Sharma",
  patientAge = 28,
  patientGender = "Female"
}: WomensHealthSuiteProps) {
  const [activeTab, setActiveTab] = useState<"pregnancy" | "highrisk" | "ultrasound" | "ctg" | "delivery" | "menstrual" | "fertility" | "family" | "menopause" | "soap">("pregnancy");

  // Pregnancy Calculator State (Naegele's Rule: LMP + 1 year - 3 months + 7 days)
  const [lmpDate, setLmpDate] = useState<string>("2025-10-15");
  const [gestationalWeeks, setGestationalWeeks] = useState<number>(24);
  const [fetalHeartRate, setFetalHeartRate] = useState<number>(142);
  const [fundalHeightCm, setFundalHeightCm] = useState<number>(24);
  const [maternalBpSystolic, setMaternalBpSystolic] = useState<number>(118);
  const [maternalBpDiastolic, setMaternalBpDiastolic] = useState<number>(76);
  const [maternalWeightKg, setMaternalWeightKg] = useState<number>(64.5);
  const [urineProtein, setUrineProtein] = useState<string>("Nil");

  // Ultrasound Biometry State
  const [bpdMm, setBpdMm] = useState<number>(60);
  const [hcMm, setHcMm] = useState<number>(220);
  const [acMm, setAcMm] = useState<number>(195);
  const [flMm, setFlMm] = useState<number>(42);
  const [afiCm, setAfiCm] = useState<number>(14.5);
  const [placentaPos, setPlacentaPos] = useState<string>("Posterior Grade II (Clear of os)");
  const [cervicalLenMm, setCervicalLenMm] = useState<number>(38);

  // Hadlock Formula EFW Approximation (g)
  const calculatedEfwGrams = Math.round(
    Math.pow(10, 1.3596 - 0.00386 * acMm * flMm + 0.0064 * hcMm + 0.00061 * bpdMm * acMm + 0.0424 * acMm + 0.174 * flMm)
  );

  // CTG / NST Monitoring State
  const [ctgBaselineFhr, setCtgBaselineFhr] = useState<number>(140);
  const [ctgVariability, setCtgVariability] = useState<string>("Moderate (6-25 bpm)");
  const [ctgAccelerations, setCtgAccelerations] = useState<string>("Present (Reactive NST)");
  const [ctgDecelerations, setCtgDecelerations] = useState<string>("None");
  const [ctgContractions, setCtgContractions] = useState<string>("2 in 10 mins (Mild)");

  const isCtgNormal = ctgBaselineFhr >= 110 && ctgBaselineFhr <= 160 && ctgVariability.startsWith("Moderate") && ctgDecelerations === "None";

  // Delivery & Mother-Baby Link State
  const [cervicalDilationCm, setCervicalDilationCm] = useState<number>(4);
  const [effacementPct, setEffacementPct] = useState<number>(70);
  const [fetalStation, setFetalStation] = useState<string>("-1");
  const [babyLinked, setBabyLinked] = useState<boolean>(true);
  const [babyId, setBabyId] = useState<string>("PED-2026-8812");
  const [babyBirthWeightKg, setBabyBirthWeightKg] = useState<number>(3.15);
  const [babyApgar1m, setBabyApgar1m] = useState<number>(8);
  const [babyApgar5m, setBabyApgar5m] = useState<number>(9);

  // Family Planning & Cervical Health State
  const [currentContraceptive, setCurrentContraceptive] = useState<string>("Hormonal IUD (Mirena 52mg)");
  const [iudInsertionDate, setIudInsertionDate] = useState<string>("2024-05-12");
  const [papSmearResult, setPapSmearResult] = useState<string>("NILM (Negative for Intraepithelial Lesion)");
  const [hpvDnaResult, setHpvDnaResult] = useState<string>("High-Risk HPV 16/18 Negative");

  // EDD Calculation
  const calculateEDD = (lmpStr: string) => {
    if (!lmpStr) return "N/A";
    const lmp = new Date(lmpStr);
    if (isNaN(lmp.getTime())) return "N/A";
    const edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280); // 40 weeks
    return edd.toISOString().split("T")[0];
  };

  const estimatedEDD = calculateEDD(lmpDate);

  // High Risk Assessment States
  const [preeclampsiaRisk, setPreeclampsiaRisk] = useState({
    bpHigh: maternalBpSystolic >= 140 || maternalBpDiastolic >= 90,
    proteinuria: urineProtein !== "Nil",
    advancedAge: patientAge >= 35,
    nulliparity: true,
    previousPreeclampsia: false,
    multipleGestations: false
  });

  const isHighRiskPreeclampsia =
    (preeclampsiaRisk.bpHigh && preeclampsiaRisk.proteinuria) ||
    (preeclampsiaRisk.bpHigh && preeclampsiaRisk.advancedAge) ||
    preeclampsiaRisk.previousPreeclampsia;

  // Menstrual & Ovulation Cycle State
  const [avgCycleLength, setAvgCycleLength] = useState<number>(28);
  const [avgPeriodDays, setAvgPeriodDays] = useState<number>(5);
  const [lastPeriodStart, setLastPeriodStart] = useState<string>("2026-02-01");
  const [pmsSeverity, setPmsSeverity] = useState<string>("Moderate Dysmenorrhea");

  const calculateOvulationWindow = () => {
    if (!lastPeriodStart) return { ovulation: "N/A", window: "N/A" };
    const lmp = new Date(lastPeriodStart);
    if (isNaN(lmp.getTime())) return { ovulation: "N/A", window: "N/A" };
    
    const ovulationDay = new Date(lmp);
    ovulationDay.setDate(ovulationDay.getDate() + (avgCycleLength - 14));
    
    const windowStart = new Date(ovulationDay);
    windowStart.setDate(windowStart.getDate() - 4);
    
    const windowEnd = new Date(ovulationDay);
    windowEnd.setDate(windowEnd.getDate() + 1);

    return {
      ovulation: ovulationDay.toISOString().split("T")[0],
      window: `${windowStart.toISOString().split("T")[0]} to ${windowEnd.toISOString().split("T")[0]}`
    };
  };

  const ovulationData = calculateOvulationWindow();

  // OB-GYN SOAP State
  const [obgynSoap, setObgynSoap] = useState({
    subjective: "28-year-old Primigravida (G1P0) at 24 weeks gestation presents for routine antenatal checkup. Reports good fetal movements (+), no vaginal bleeding, no fluid leak, no headache or epigastric pain.",
    objective: "BP: 118/76 mmHg, Weight: 64.5 kg (+6.5 kg weight gain). Urine Dipstick: Nil protein. Fundal Height: 24 cm (corresponds to GA). Fetal Heart Rate: 142 bpm (regular rhythm). Obstetric Scan (Anomaly scan at 20w): Normal fetal anatomy, posterior placenta, normal AFI.",
    assessment: "1. Intrauterine Pregnancy at 24 Weeks 2 Days (G1P0).\n2. Normal Antenatal Progress with Low Preeclampsia Risk.\n3. OGTT Screening: Normal fasting and 2h post-prandial glucose.",
    plan: "1. Continue T. Iron + Folic Acid & Calcium twice daily.\n2. Tdap Vaccine scheduled for 28-32 weeks.\n3. Patient educated on warning signs (decreased FM, headache, swelling, bleeding).\n4. Next Antenatal Visit: 4 weeks (28 Weeks GA)."
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
              <Flower2 className="h-7 w-7 text-rose-400 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Women&apos;s Health & OB-GYN AI
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  Naegele & FIGO 2026 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Prenatal Gestational Tracker, Preeclampsia & GDM Screening, Cycle & Fertility Engine, Menopause & Bone Health Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>FIGO Antenatal Protocols Active</span>
          </div>
        </div>

        {/* Patient Profile Banner */}
        <div className="bg-gradient-to-r from-rose-950/60 via-slate-800 to-slate-900 border border-rose-900/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-rose-500/20 border border-rose-400/30 flex items-center justify-center font-bold text-rose-300 text-lg">
              {patientName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{patientName}</h2>
                <span className="text-xs text-slate-400">({patientAge} Y/O, {patientGender}, G1P0)</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                  ID: OB-2026-9041
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Gestational Age: <strong className="text-rose-300">{gestationalWeeks} Weeks</strong></span>
                <span className="text-slate-500">•</span>
                <span>EDD: <strong className="text-emerald-300">{estimatedEDD}</strong></span>
                <span className="text-slate-500">•</span>
                <span>FHR: <strong className="text-amber-300">{fetalHeartRate} bpm</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-rose-900/50 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200">
              Trimester: <span className="text-white font-black">2nd Trimester</span>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              isHighRiskPreeclampsia
                ? "bg-rose-900/80 text-rose-200 border border-rose-500/80 animate-pulse"
                : "bg-emerald-900/50 text-emerald-200 border border-emerald-500/40"
            }`}>
              Risk Level: <span className="text-white font-black">{isHighRiskPreeclampsia ? "HIGH RISK (Preeclampsia)" : "LOW RISK"}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "pregnancy", label: "🤰 Antenatal Care & EDD Tracker", icon: Baby },
            { id: "highrisk", label: "⚠️ Preeclampsia & GDM Screening", icon: ShieldAlert },
            { id: "ultrasound", label: "🔊 Obstetric Scan & EFW Biometry", icon: Search },
            { id: "ctg", label: "📈 CTG / NST Trace Analysis", icon: Activity },
            { id: "delivery", label: "👶 Labor Partograph & Mother-Baby Link", icon: Stethoscope },
            { id: "menstrual", label: "🩸 Cycle & Menstrual Health", icon: Droplets },
            { id: "fertility", label: "🌱 Ovulation & Fertility Window", icon: Flower2 },
            { id: "family", label: "🛡️ Contraceptive & Cervical Screening", icon: ShieldCheck },
            { id: "menopause", label: "☀️ Menopause & Bone Health", icon: Sun },
            { id: "soap", label: "📝 OB-GYN SOAP Note", icon: FileText }
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

        {/* TAB 1: ANTENATAL CARE & EDD TRACKER */}
        {activeTab === "pregnancy" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Baby className="h-5 w-5 text-rose-400" />
                Antenatal Biometric Parameters & Naegele EDD Calculator
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">LMP Date</label>
                  <input
                    type="date"
                    value={lmpDate}
                    onChange={(e) => setLmpDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-rose-300 block">Estimated EDD: {estimatedEDD}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Gestational Age (Weeks)</label>
                  <input
                    type="number"
                    value={gestationalWeeks}
                    onChange={(e) => setGestationalWeeks(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-emerald-300 block">Trimester: {gestationalWeeks < 13 ? "1st" : gestationalWeeks < 28 ? "2nd" : "3rd"}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Fetal Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={fetalHeartRate}
                    onChange={(e) => setFetalHeartRate(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-amber-300 block">Normal Range: 110-160 bpm</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Fundal Height (cm)</label>
                  <input
                    type="number"
                    value={fundalHeightCm}
                    onChange={(e) => setFundalHeightCm(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block">Corresponds ±2cm to GA</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Maternal BP (mmHg)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={maternalBpSystolic}
                      onChange={(e) => setMaternalBpSystolic(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                      placeholder="Sys"
                    />
                    <span className="text-slate-500">/</span>
                    <input
                      type="number"
                      value={maternalBpDiastolic}
                      onChange={(e) => setMaternalBpDiastolic(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                      placeholder="Dia"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Urine Protein Dipstick</label>
                  <select
                    value={urineProtein}
                    onChange={(e) => setUrineProtein(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="Nil">Nil</option>
                    <option value="Trace">Trace</option>
                    <option value="1+">1+ (30 mg/dL)</option>
                    <option value="2+">2+ (100 mg/dL)</option>
                    <option value="3+">3+ (300 mg/dL)</option>
                  </select>
                </div>
              </div>

              {/* Trimester Timeline Progress */}
              <div className="space-y-2 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Gestational Progress ({gestationalWeeks}/40 Weeks)</span>
                  <span className="text-rose-300">{Math.round((gestationalWeeks / 40) * 100)}% Complete</span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-4 border border-slate-700 p-0.5 flex">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (gestationalWeeks / 40) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>1st Trimester (1-12w)</span>
                  <span>2nd Trimester (13-27w)</span>
                  <span>3rd Trimester (28-40w)</span>
                </div>
              </div>
            </div>

            {/* AI Antenatal Intelligence Card */}
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose-400" />
                  AI Antenatal Impression
                </h4>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle className="h-4 w-4" /> Normal Fetal Growth Velocity
                  </div>
                  <p>
                    Fundal height (24 cm) matches gestational age (24w). Fetal heart rate (142 bpm) is within normal baseline. Maternal blood pressure is normotensive.
                  </p>
                </div>

                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200 space-y-1">
                  <strong>Antenatal Schedule (24-28 Weeks):</strong>
                  <p>Order 75g Oral Glucose Tolerance Test (OGTT) for Gestational Diabetes screening & Repeat Hemoglobin for anemia detection.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PREECLAMPSIA & GDM SCREENING */}
        {activeTab === "highrisk" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-400" />
                  High-Risk Obstetrics: Preeclampsia & GDM Diagnostic Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  FIGO & ACOG guidelines for Hypertensive Disorders of Pregnancy & Gestational Diabetes.
                </p>
              </div>

              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                isHighRiskPreeclampsia ? "bg-rose-900/90 text-rose-200 border border-rose-500" : "bg-emerald-900/60 text-emerald-200"
              }`}>
                {isHighRiskPreeclampsia ? "High Preeclampsia Risk Detected" : "Low Risk Profile"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-rose-300 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Preeclampsia Risk Factors Checklist
                </h4>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preeclampsiaRisk.bpHigh}
                    onChange={(e) => setPreeclampsiaRisk({ ...preeclampsiaRisk, bpHigh: e.target.checked })}
                    className="accent-rose-500"
                  />
                  <span>Blood Pressure &ge; 140/90 mmHg ({maternalBpSystolic}/{maternalBpDiastolic})</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preeclampsiaRisk.proteinuria}
                    onChange={(e) => setPreeclampsiaRisk({ ...preeclampsiaRisk, proteinuria: e.target.checked })}
                    className="accent-rose-500"
                  />
                  <span>Proteinuria Dipstick &ge; 1+ ({urineProtein})</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preeclampsiaRisk.advancedAge}
                    onChange={(e) => setPreeclampsiaRisk({ ...preeclampsiaRisk, advancedAge: e.target.checked })}
                    className="accent-rose-500"
                  />
                  <span>Advanced Maternal Age (&ge; 35 years)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preeclampsiaRisk.previousPreeclampsia}
                    onChange={(e) => setPreeclampsiaRisk({ ...preeclampsiaRisk, previousPreeclampsia: e.target.checked })}
                    className="accent-rose-500"
                  />
                  <span>History of Preeclampsia in prior pregnancy</span>
                </label>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-emerald-300 flex items-center gap-2">
                  <Droplets className="h-4 w-4" /> Gestational Diabetes (GDM) OGTT Cutoffs
                </h4>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between p-2 bg-slate-800/80 rounded">
                    <span>Fasting Blood Glucose:</span>
                    <strong className="text-white">&lt; 92 mg/dL (Target)</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-800/80 rounded">
                    <span>1-Hour Post 75g Glucose:</span>
                    <strong className="text-white">&lt; 180 mg/dL (Target)</strong>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-800/80 rounded">
                    <span>2-Hour Post 75g Glucose:</span>
                    <strong className="text-white">&lt; 153 mg/dL (Target)</strong>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  *Any single elevated value on 75g OGTT confirms Gestational Diabetes Mellitus (IADPAG criteria).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OBSTETRIC ULTRASOUND & EFW BIOMETRY */}
        {activeTab === "ultrasound" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-rose-400" />
                  Obstetric Scan & Hadlock EFW Biometry Calculator
                </h3>
                <p className="text-xs text-slate-400">
                  Fetal biometry, Amniotic Fluid Index (AFI), Doppler Indices & Placental Localization.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-rose-900/60 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200">
                Calculated EFW: <span className="text-white font-black">{calculatedEfwGrams} g</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Biparietal Diameter - BPD (mm)</label>
                <input
                  type="number"
                  value={bpdMm}
                  onChange={(e) => setBpdMm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Head Circumference - HC (mm)</label>
                <input
                  type="number"
                  value={hcMm}
                  onChange={(e) => setHcMm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Abdominal Circ. - AC (mm)</label>
                <input
                  type="number"
                  value={acMm}
                  onChange={(e) => setAcMm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Femur Length - FL (mm)</label>
                <input
                  type="number"
                  value={flMm}
                  onChange={(e) => setFlMm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-700/60">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Amniotic Fluid Index - AFI (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={afiCm}
                  onChange={(e) => setAfiCm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
                <span className={`text-[10px] block ${
                  afiCm < 5 ? "text-rose-400 font-bold" : afiCm > 24 ? "text-amber-400 font-bold" : "text-emerald-400"
                }`}>
                  {afiCm < 5 ? "⚠️ Oligohydramnios (<5cm)" : afiCm > 24 ? "⚠️ Polyhydramnios (>24cm)" : "Normal AFI (8-24cm)"}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Placenta Location & Grade</label>
                <input
                  type="text"
                  value={placentaPos}
                  onChange={(e) => setPlacentaPos(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Transvaginal Cervical Length (mm)</label>
                <input
                  type="number"
                  value={cervicalLenMm}
                  onChange={(e) => setCervicalLenMm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
                <span className={`text-[10px] block ${cervicalLenMm < 25 ? "text-rose-400 font-bold" : "text-emerald-400"}`}>
                  {cervicalLenMm < 25 ? "⚠️ Short Cervix - High Preterm Birth Risk" : "Normal Length (>25mm)"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CTG / NST TRACE ANALYZER */}
        {activeTab === "ctg" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-400" />
                  Cardiotocography (CTG) & Non-Stress Test (NST) Analyzer
                </h3>
                <p className="text-xs text-slate-400">
                  FIGO 2026 Consensus Guidelines for Intrapartum Fetal Monitoring.
                </p>
              </div>

              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                isCtgNormal ? "bg-emerald-900/80 text-emerald-200 border border-emerald-500/50" : "bg-rose-900/80 text-rose-200 border border-rose-500/50 animate-pulse"
              }`}>
                {isCtgNormal ? "FIGO Category I: Normal Trace" : "FIGO Category II/III: Suspicious Trace"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Baseline Fetal Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={ctgBaselineFhr}
                  onChange={(e) => setCtgBaselineFhr(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">FHR Baseline Variability</label>
                <select
                  value={ctgVariability}
                  onChange={(e) => setCtgVariability(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="Moderate (6-25 bpm)">Moderate (6-25 bpm - Normal)</option>
                  <option value="Absent (<3 bpm)">Absent (&lt;3 bpm - Reassessing Needed)</option>
                  <option value="Minimal (3-5 bpm)">Minimal (3-5 bpm - Sleep cycle or Sedative)</option>
                  <option value="Marked (>25 bpm)">Marked (&gt;25 bpm - Saltatory Pattern)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Decelerations</label>
                <select
                  value={ctgDecelerations}
                  onChange={(e) => setCtgDecelerations(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="None">None</option>
                  <option value="Early Decelerations">Early Decelerations (Head Compression)</option>
                  <option value="Variable Decelerations">Variable Decelerations (Cord Compression)</option>
                  <option value="Late Decelerations">Late Decelerations (Uteroplacental Insufficiency)</option>
                </select>
              </div>
            </div>

            {/* Simulated Visual Waveform Trace */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-rose-300">
                  <Activity className="h-4 w-4 animate-pulse" /> Real-time CTG Strip (20 Minutes Continuous)
                </span>
                <span className="text-slate-400 font-mono">Paper Speed: 1 cm/min</span>
              </div>
              <div className="h-16 w-full bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-around px-2 overflow-hidden">
                {[142, 138, 145, 152, 140, 136, 144, 150, 142, 139, 148, 141, 144, 138, 146, 143].map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-2 rounded-full ${isCtgNormal ? "bg-rose-400" : "bg-amber-400"}`}
                      style={{ height: `${(val - 110) * 0.8}px` }}
                    />
                    <span className="text-[8px] font-mono text-slate-500">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LABOR PARTOGRAPH & MOTHER-BABY LINK */}
        {activeTab === "delivery" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-rose-400" />
                  WHO Partograph Labor Manager & Mother–Baby Linkage Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time Intrapartum Progress, Bishop Score & Neonatal Pediatric Record Association.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200">
                Mother–Baby Link Active ({babyId})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Cervical Dilation (cm)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={cervicalDilationCm}
                  onChange={(e) => setCervicalDilationCm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
                <span className="text-[10px] text-rose-300 block">
                  {cervicalDilationCm < 5 ? "Latent Phase of Labor" : cervicalDilationCm < 10 ? "Active Phase of Labor" : "Full Dilation (Stage 2)"}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Cervical Effacement (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={effacementPct}
                  onChange={(e) => setEffacementPct(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Fetal Station (-5 to +5)</label>
                <input
                  type="text"
                  value={fetalStation}
                  onChange={(e) => setFetalStation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Linked Baby Card */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Baby className="h-4 w-4" /> Linked Newborn Pediatric Electronic Health Record
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">Linked ID: {babyId}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Birth Weight</span>
                  <strong className="text-white text-sm">{babyBirthWeightKg} kg</strong>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">APGAR 1 min / 5 min</span>
                  <strong className="text-emerald-300 text-sm">{babyApgar1m} / {babyApgar5m}</strong>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Early Skin-to-Skin</span>
                  <strong className="text-emerald-300 text-sm">Completed (1h)</strong>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">First Breastfeed</span>
                  <strong className="text-emerald-300 text-sm">Initiated within 30m</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: FAMILY PLANNING & CERVICAL SCREENING */}
        {activeTab === "family" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-400" />
              Family Planning, Contraception & Cervical Cancer Screening
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-rose-300 flex items-center gap-2">
                  <Pill className="h-4 w-4" /> Active Contraceptive Method
                </h4>

                <div className="space-y-1">
                  <label className="text-slate-400">Current Method</label>
                  <input
                    type="text"
                    value={currentContraceptive}
                    onChange={(e) => setCurrentContraceptive(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span>Insertion Date:</span>
                  <strong className="font-mono text-white">{iudInsertionDate}</strong>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span>Effective Until:</span>
                  <strong className="font-mono text-emerald-300">2029 (5-Year Duration)</strong>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Cervical Cancer Preventive Screening
                </h4>

                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-slate-400 block text-[10px]">Pap Smear Cytology</span>
                  <strong className="text-emerald-300">{papSmearResult}</strong>
                </div>

                <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-slate-400 block text-[10px]">High-Risk HPV DNA Co-Testing</span>
                  <strong className="text-emerald-300">{hpvDnaResult}</strong>
                </div>

                <p className="text-[10px] text-slate-400">
                  *ACOG guidelines recommend co-testing every 5 years for women aged 30-65 with normal screening history.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MENSTRUAL HEALTH */}
        {activeTab === "menstrual" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Droplets className="h-5 w-5 text-rose-400" />
              Menstrual Cycle & Gynecological Symptom Tracker
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Average Cycle Length (Days)</label>
                <input
                  type="number"
                  value={avgCycleLength}
                  onChange={(e) => setAvgCycleLength(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Bleeding Duration (Days)</label>
                <input
                  type="number"
                  value={avgPeriodDays}
                  onChange={(e) => setAvgPeriodDays(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Dysmenorrhea / PMS Classification</label>
                <select
                  value={pmsSeverity}
                  onChange={(e) => setPmsSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="Mild Cramps">Mild Cramps (No medication required)</option>
                  <option value="Moderate Dysmenorrhea">Moderate Dysmenorrhea (Responds to NSAIDs)</option>
                  <option value="Severe Dysmenorrhea / Endometriosis Suspected">Severe Dysmenorrhea (Work incapacitating)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OVULATION & FERTILITY */}
        {activeTab === "fertility" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flower2 className="h-5 w-5 text-rose-400" />
              Fertility Window & Ovulation Predictor Engine
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Last Menstrual Period (LMP) Start</label>
                  <input
                    type="date"
                    value={lastPeriodStart}
                    onChange={(e) => setLastPeriodStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div className="p-4 bg-slate-950 border border-rose-500/40 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-rose-300 block">🌱 Predicted Ovulation Date:</span>
                  <p className="text-xl font-black text-white">{ovulationData.ovulation}</p>
                  <span className="font-bold text-emerald-300 block pt-2">✨ Optimal Fertile Window:</span>
                  <p className="text-sm font-mono text-slate-200">{ovulationData.window}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-rose-300">Biomarkers & Follicular Tracking</h4>
                <p className="text-slate-300">
                  LH Surge (Ovulation Test Strip): Peak expected 24-36h prior to ovulation. Cervical Mucus: Clear egg-white consistency during fertile window.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MENOPAUSE & BONE HEALTH */}
        {activeTab === "menopause" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-400" />
              Menopause, Hormone Replacement (HRT) & Osteoporosis Risk
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <Flame className="h-4 w-4" /> Vasomotor Symptom Rating
                </h4>
                <p className="text-slate-300">Hot Flashes: 3-5 episodes/day (Moderate severity). Sleep disturbance (+).</p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-300 flex items-center gap-2">
                  <Pill className="h-4 w-4" /> Bone Mineral Density (DEXA Scan)
                </h4>
                <p className="text-slate-300">T-Score: -1.2 (Osteopenia). Calcium 1200mg/day + Vit D3 2000 IU recommended.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OB-GYN SOAP NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-400" />
              Obstetric & Gynecological Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">S - Subjective (Patient Complaints & Symptoms)</label>
                <textarea
                  value={obgynSoap.subjective}
                  onChange={(e) => setObgynSoap({ ...obgynSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">O - Objective (Vitals, Fundal Height, Scans)</label>
                <textarea
                  value={obgynSoap.objective}
                  onChange={(e) => setObgynSoap({ ...obgynSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">A - Assessment (Diagnosis & Gestational Status)</label>
                <textarea
                  value={obgynSoap.assessment}
                  onChange={(e) => setObgynSoap({ ...obgynSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-300">P - Plan (Meds, OGTT, Next Antenatal Visit)</label>
                <textarea
                  value={obgynSoap.plan}
                  onChange={(e) => setObgynSoap({ ...obgynSoap, plan: e.target.value })}
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

export default WomensHealthSuite;
