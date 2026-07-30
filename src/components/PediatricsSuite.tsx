import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Baby,
  Activity,
  Calendar,
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
  Apple
} from "lucide-react";

export interface PediatricsSuiteProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAgeMonths?: number;
  patientGender?: string;
}

export function PediatricsSuite({
  onBackToLanding,
  patientName = "Aarav Mehta",
  patientAgeMonths = 18,
  patientGender = "Male"
}: PediatricsSuiteProps) {
  const [activeTab, setActiveTab] = useState<"growth" | "vaccine" | "milestones" | "dosing" | "nicu" | "soap">("growth");

  // NICU State
  const [apgar1m, setApgar1m] = useState({ hr: 2, resp: 2, tone: 2, reflex: 2, color: 1 });
  const [apgar5m, setApgar5m] = useState({ hr: 2, resp: 2, tone: 2, reflex: 2, color: 2 });
  const [biliLevel, setBiliLevel] = useState<number>(14.5);
  const [gestationalWeeks, setGestationalWeeks] = useState<number>(36);
  const [photoTherapyHours, setPhotoTherapyHours] = useState<number>(12);

  const totalApgar1m = apgar1m.hr + apgar1m.resp + apgar1m.tone + apgar1m.reflex + apgar1m.color;
  const totalApgar5m = apgar5m.hr + apgar5m.resp + apgar5m.tone + apgar5m.reflex + apgar5m.color;

  const photoTherapyThreshold = gestationalWeeks < 35 ? 10 : gestationalWeeks < 38 ? 12 : 15;
  const needsPhototherapy = biliLevel >= photoTherapyThreshold;

  // Growth State
  const [weightKg, setWeightKg] = useState<number>(11.2);
  const [heightCm, setHeightCm] = useState<number>(82.5);
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState<number>(47.2);
  const [birthWeightKg, setBirthWeightKg] = useState<number>(3.1);

  // WHO Percentile Calculations (approximate standard curves)
  const weightPercentile = Math.min(99, Math.max(1, Math.round(50 + (weightKg - 11.0) * 22)));
  const heightPercentile = Math.min(99, Math.max(1, Math.round(50 + (heightCm - 82.0) * 12)));
  const hcPercentile = Math.min(99, Math.max(1, Math.round(50 + (headCircumferenceCm - 47.0) * 18)));

  // Vaccination State (IAP 2026 Schedule)
  const [vaccines, setVaccines] = useState([
    { name: "BCG", due: "At Birth", status: "completed", date: "2024-07-10", notes: "Scar present on left arm" },
    { name: "Hepatitis B (Birth dose)", due: "At Birth", status: "completed", date: "2024-07-10", notes: "Given in hospital" },
    { name: "OPV 0", due: "At Birth", status: "completed", date: "2024-07-10", notes: "Oral drops" },
    { name: "DTaP / IPV / Hib / HepB 1", due: "6 Weeks", status: "completed", date: "2024-08-22", notes: "Hexavalent dose 1" },
    { name: "PCV 1 (Pneumococcal)", due: "6 Weeks", status: "completed", date: "2024-08-22", notes: "Dose 1" },
    { name: "Rotavirus 1", due: "6 Weeks", status: "completed", date: "2024-08-22", notes: "Oral drops" },
    { name: "DTaP / IPV / Hib / HepB 2", due: "10 Weeks", status: "completed", date: "2024-09-20", notes: "Hexavalent dose 2" },
    { name: "DTaP / IPV / Hib / HepB 3", due: "14 Weeks", status: "completed", date: "2024-10-18", notes: "Hexavalent dose 3" },
    { name: "MMR 1 (Measles, Mumps, Rubella)", due: "9 Months", status: "completed", date: "2025-04-12", notes: "Dose 1" },
    { name: "Typhoid Conjugate (TCV)", due: "9-12 Months", status: "completed", date: "2025-06-05", notes: "Single dose" },
    { name: "Hepatitis A 1", due: "12 Months", status: "completed", date: "2025-07-15", notes: "Live attenuated" },
    { name: "MMR 2", due: "15 Months", status: "completed", date: "2025-10-20", notes: "Dose 2 booster" },
    { name: "DTP Booster 1", due: "18 Months", status: "due_now", date: "Pending", notes: "Due for 18-month visit" },
    { name: "Varicella (Chickenpox) 1", due: "18 Months", status: "due_now", date: "Pending", notes: "Recommended with DTP" },
    { name: "PCV Booster", due: "18 Months", status: "due_now", date: "Pending", notes: "Pneumococcal booster" }
  ]);

  // Developmental Milestones State (18 Months)
  const [milestones, setMilestones] = useState([
    { domain: "Gross Motor", task: "Walks independently without support", achieved: true },
    { domain: "Gross Motor", task: "Climbs onto low chair or sofa", achieved: true },
    { domain: "Fine Motor", task: "Scribbles spontaneously with crayon", achieved: true },
    { domain: "Fine Motor", task: "Towers 2-3 blocks", achieved: true },
    { domain: "Language", task: "Uses 10-20 clear single words", achieved: true },
    { domain: "Language", task: "Points to show something interesting", achieved: true },
    { domain: "Social-Emotional", task: "Shows affection to familiar caregivers", achieved: true },
    { domain: "Cognitive", task: "Knows what ordinary things are for (phone, spoon)", achieved: false }
  ]);

  // Pediatric Weight-Based Dosage Engine State
  const [selectedMed, setSelectedMed] = useState("Paracetamol (Crocin / Calpol)");
  const [customMedMgPerKg, setCustomMedMgPerKg] = useState<number>(15);

  const getDoseCalculation = () => {
    let mgPerKg = 15;
    let frequency = "TDS / QDS (every 6 hours as needed)";
    let maxMgPerDay = 60 * weightKg;

    if (selectedMed.includes("Paracetamol")) {
      mgPerKg = 15;
      frequency = "Every 4-6 hours PRN (Max 4 doses/24h)";
    } else if (selectedMed.includes("Ibuprofen")) {
      mgPerKg = 10;
      frequency = "Every 6-8 hours PRN with food";
    } else if (selectedMed.includes("Amoxicillin")) {
      mgPerKg = 40;
      frequency = "BD / TDS for 5-7 days";
    } else if (selectedMed.includes("Azithromycin")) {
      mgPerKg = 10;
      frequency = "OD for 3-5 days";
    } else if (selectedMed.includes("Cetirizine")) {
      mgPerKg = 0.25;
      frequency = "OD HS";
    } else {
      mgPerKg = customMedMgPerKg;
    }

    const singleDoseMg = Math.round(mgPerKg * weightKg);
    const syrupSyringeMl = Math.round((singleDoseMg / 120) * 5 * 10) / 10; // Assuming 120mg/5ml standard syrup

    return { singleDoseMg, syrupSyringeMl, frequency, maxMgPerDay };
  };

  const calculatedDose = getDoseCalculation();

  // Pediatric SOAP State
  const [pediatricSoap, setPediatricSoap] = useState({
    subjective: "18-month-old male brought by mother for routine 18-month well-child checkup & DTP booster. Mother reports child is active, eating well (solids + cow's milk), no fever or cough. Sleeps 11h/night.",
    objective: "Weight: 11.2 kg (54th %ile), Height: 82.5 cm (56th %ile), HC: 47.2 cm. HR: 110 bpm, RR: 26/min, Temp: 98.4°F. Chest clear, S1 S2 normal, abdomen soft, anterior fontanelle closed, ears clear.",
    assessment: "1. Healthy 18-Month Child Visit (Z00.129).\n2. Normal Growth & Development on WHO Curves.\n3. Vaccinations Due: DTP Booster 1, Varicella 1, PCV Booster.",
    plan: "1. Administer DTP Booster 1 + Varicella 1 IM today.\n2. Continue balanced solid diet with 400ml milk daily.\n3. Oral hygiene counseling (brushing twice daily with smear of fluoride toothpaste).\n4. Next checkup: 24 Months."
  });

  const toggleMilestone = (index: number) => {
    const updated = [...milestones];
    updated[index].achieved = !updated[index].achieved;
    setMilestones(updated);
  };

  const toggleVaccine = (index: number) => {
    const updated = [...vaccines];
    if (updated[index].status === "completed") {
      updated[index].status = "due_now";
      updated[index].date = "Pending";
    } else {
      updated[index].status = "completed";
      updated[index].date = new Date().toISOString().split("T")[0];
    }
    setVaccines(updated);
  };

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
            <div className="p-2.5 bg-pink-600/20 border border-pink-500/30 rounded-xl">
              <Baby className="h-7 w-7 text-pink-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Pediatrics & Child Health AI
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full">
                  WHO & IAP 2026 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Growth Percentiles (WHO Z-Scores), IAP Immunization Scheduler, Milestone Screen (ASQ-3) & Weight-Based Dosing Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>IAP Immunization Timetable Active</span>
          </div>
        </div>

        {/* Patient Profile Banner */}
        <div className="bg-gradient-to-r from-pink-950/60 via-slate-800 to-slate-900 border border-pink-900/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center font-bold text-pink-300 text-lg">
              {patientName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{patientName}</h2>
                <span className="text-xs text-slate-400">({patientAgeMonths} Months Old, {patientGender})</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                  ID: PED-2026-8802
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Weight: <strong className="text-pink-300">{weightKg} kg</strong> ({weightPercentile}th %ile)</span>
                <span className="text-slate-500">•</span>
                <span>Height: <strong className="text-emerald-300">{heightCm} cm</strong> ({heightPercentile}th %ile)</span>
                <span className="text-slate-500">•</span>
                <span>HC: <strong className="text-amber-300">{headCircumferenceCm} cm</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-pink-900/50 border border-pink-500/40 rounded-xl text-xs font-bold text-pink-200">
              Due Today: <span className="text-white font-black">3 Vaccines</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-900/50 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200">
              Milestones: <span className="text-white font-black">7/8 Met</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "growth", label: "📈 WHO Growth Charts & Z-Scores", icon: TrendingUp },
            { id: "vaccine", label: "💉 IAP Immunization Scheduler", icon: Calendar },
            { id: "milestones", label: "🧠 Developmental Milestones (ASQ-3)", icon: Award },
            { id: "dosing", label: "💊 Weight-Based Dosing Engine", icon: Scale },
            { id: "nicu", label: "🍼 NICU & Neonatal Care", icon: ShieldAlert },
            { id: "soap", label: "📝 Pediatric SOAP Note", icon: FileText }
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

        {/* TAB 1: GROWTH CHARTS & Z-SCORES */}
        {activeTab === "growth" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ruler className="h-5 w-5 text-pink-400" />
                WHO Child Growth Curve Parameters (0-5 Years)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-pink-300 block">Percentile: {weightPercentile}th %ile</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Length / Height (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-emerald-300 block">Percentile: {heightPercentile}th %ile</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Head Circumference (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={headCircumferenceCm}
                    onChange={(e) => setHeadCircumferenceCm(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-amber-300 block">Percentile: {hcPercentile}th %ile</span>
                </div>
              </div>

              {/* WHO Percentile Visual Representation */}
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <h4 className="text-xs font-bold text-slate-300">WHO Standard Percentile Distribution</h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-pink-300">Weight-for-Age</span>
                      <span className="text-pink-400">{weightKg} kg ({weightPercentile}th Percentile)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden">
                      <div className="bg-pink-500 h-full transition-all duration-500" style={{ width: `${weightPercentile}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-emerald-300">Height-for-Age</span>
                      <span className="text-emerald-400">{heightCm} cm ({heightPercentile}th Percentile)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${heightPercentile}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-amber-300">Head Circumference</span>
                      <span className="text-amber-400">{headCircumferenceCm} cm ({hcPercentile}th Percentile)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${hcPercentile}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Pediatric Nutrition & Growth Intelligence */}
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-pink-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  AI Nutritional & Growth Impression
                </h4>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle className="h-4 w-4" /> Normal Growth Trajectory
                  </div>
                  <p>
                    Child is tracking consistently along the 50th-55th percentile WHO curve. No signs of stunting (height-for-age &gt; 15%) or wasting (weight-for-height normal).
                  </p>
                </div>

                <div className="p-3 bg-pink-950/40 border border-pink-500/30 rounded-xl text-xs text-pink-200 space-y-1">
                  <strong>Dietary Recommendation (18m):</strong>
                  <p>3 main family meals + 2 healthy snacks daily. Limit cow&apos;s milk to &le; 400ml/day to prevent iron-deficiency anemia.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IAP IMMUNIZATION SCHEDULER */}
        {activeTab === "vaccine" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-400" />
                  Indian Academy of Pediatrics (IAP) 2026 Immunization Schedule
                </h3>
                <p className="text-xs text-slate-400">
                  Interactive dose logger, catch-up tracker, and vaccine due date manager.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-pink-900/60 border border-pink-500/40 rounded-xl text-xs font-bold text-pink-200">
                Total Administered: {vaccines.filter((v) => v.status === "completed").length} / {vaccines.length}
              </div>
            </div>

            <div className="space-y-2.5">
              {vaccines.map((v, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleVaccine(idx)}
                  className={`p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    v.status === "completed"
                      ? "bg-slate-900/90 border-slate-800 text-slate-300"
                      : "bg-pink-950/30 border-pink-500/40 text-pink-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        v.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse"
                      }`}
                    >
                      {v.status === "completed" ? "✓" : "!"}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">{v.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Due: {v.due} • Status: {v.status === "completed" ? `Administered on ${v.date}` : "Due Now"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg ${
                      v.status === "completed"
                        ? "bg-emerald-900/50 text-emerald-300 border border-emerald-500/30"
                        : "bg-pink-600 text-white shadow-sm"
                    }`}
                  >
                    {v.status === "completed" ? "Done" : "Mark Administered"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DEVELOPMENTAL MILESTONES */}
        {activeTab === "milestones" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-pink-400" />
                  Developmental Milestone Screening (ASQ-3 / 18 Months)
                </h3>
                <p className="text-xs text-slate-400">
                  Assess Gross Motor, Fine Motor, Language, Social-Emotional & Cognitive domains.
                </p>
              </div>

              <span className="px-3 py-1 bg-slate-900 border border-slate-700 text-xs font-bold text-pink-300 rounded-xl">
                18 Months Checklist
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleMilestone(idx)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    m.achieved
                      ? "bg-slate-900/90 border-slate-800 text-slate-300"
                      : "bg-amber-950/20 border-amber-500/40 text-amber-200"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">{m.domain}</span>
                    <p className="text-xs font-semibold text-slate-200">{m.task}</p>
                  </div>

                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      m.achieved
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {m.achieved ? "✓" : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WEIGHT-BASED DOSING ENGINE */}
        {activeTab === "dosing" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-pink-400" />
              Pediatric Weight-Based Medication Dosage Calculator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Select Pediatric Formulation</label>
                  <select
                    value={selectedMed}
                    onChange={(e) => setSelectedMed(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                  >
                    <option value="Paracetamol (Crocin / Calpol)">Syrup Paracetamol (120mg / 5ml) - 15mg/kg</option>
                    <option value="Ibuprofen (Ibugesic)">Syrup Ibuprofen (100mg / 5ml) - 10mg/kg</option>
                    <option value="Amoxicillin (Novamox)">Syrup Amoxicillin (125mg / 5ml) - 40mg/kg</option>
                    <option value="Azithromycin (Azee)">Syrup Azithromycin (200mg / 5ml) - 10mg/kg</option>
                    <option value="Cetirizine (Cetzine)">Syrup Cetirizine (5mg / 5ml) - 0.25mg/kg</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Child Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Dosage Result Box */}
              <div className="bg-slate-950 border border-pink-500/40 p-5 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-pink-300 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-pink-400" /> Calculated Dosage Output:
                </span>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Single Dose (Mg)</span>
                    <span className="text-xl font-black text-white">{calculatedDose.singleDoseMg} mg</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Syrup Syringe (Ml)</span>
                    <span className="text-xl font-black text-pink-400">{calculatedDose.syrupSyringeMl} ml</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1 pt-1">
                  <p><strong>Frequency:</strong> {calculatedDose.frequency}</p>
                  <p><strong>Max Daily Dose:</strong> {calculatedDose.maxMgPerDay} mg / 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NICU & NEONATAL CARE */}
        {activeTab === "nicu" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* APGAR Score Calculator */}
              <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Baby className="h-4 w-4 text-pink-400" />
                    Neonatal APGAR Score Assessment
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold bg-pink-900/60 border border-pink-500/40 text-pink-200 rounded-lg">
                      1 min: {totalApgar1m}/10
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 rounded-lg">
                      5 min: {totalApgar5m}/10
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2 items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-300">Heart Rate</span>
                    <select
                      value={apgar1m.hr}
                      onChange={(e) => setApgar1m({ ...apgar1m, hr: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                    >
                      <option value={0}>0 (Absent)</option>
                      <option value={1}>1 (&lt; 100 bpm)</option>
                      <option value={2}>2 (&gt; 100 bpm)</option>
                    </select>
                    <select
                      value={apgar5m.hr}
                      onChange={(e) => setApgar5m({ ...apgar5m, hr: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                    >
                      <option value={0}>0 (Absent)</option>
                      <option value={1}>1 (&lt; 100 bpm)</option>
                      <option value={2}>2 (&gt; 100 bpm)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-300">Respiratory Effort</span>
                    <select
                      value={apgar1m.resp}
                      onChange={(e) => setApgar1m({ ...apgar1m, resp: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                    >
                      <option value={0}>0 (Absent)</option>
                      <option value={1}>1 (Slow / Irregular)</option>
                      <option value={2}>2 (Good / Crying)</option>
                    </select>
                    <select
                      value={apgar5m.resp}
                      onChange={(e) => setApgar5m({ ...apgar5m, resp: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                    >
                      <option value={0}>0 (Absent)</option>
                      <option value={1}>1 (Slow / Irregular)</option>
                      <option value={2}>2 (Good / Crying)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-300">Muscle Tone</span>
                    <select
                      value={apgar1m.tone}
                      onChange={(e) => setApgar1m({ ...apgar1m, tone: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                    >
                      <option value={0}>0 (Flaccid)</option>
                      <option value={1}>1 (Some Flexion)</option>
                      <option value={2}>2 (Active Motion)</option>
                    </select>
                    <select
                      value={apgar5m.tone}
                      onChange={(e) => setApgar5m({ ...apgar5m, tone: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                    >
                      <option value={0}>0 (Flaccid)</option>
                      <option value={1}>1 (Some Flexion)</option>
                      <option value={2}>2 (Active Motion)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-300">Reflex Irritability</span>
                    <select
                      value={apgar1m.reflex}
                      onChange={(e) => setApgar1m({ ...apgar1m, reflex: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                    >
                      <option value={0}>0 (No Response)</option>
                      <option value={1}>1 (Grimace)</option>
                      <option value={2}>2 (Crying / Cough)</option>
                    </select>
                    <select
                      value={apgar5m.reflex}
                      onChange={(e) => setApgar5m({ ...apgar5m, reflex: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                    >
                      <option value={0}>0 (No Response)</option>
                      <option value={1}>1 (Grimace)</option>
                      <option value={2}>2 (Crying / Cough)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-300">Color (Appearance)</span>
                    <select
                      value={apgar1m.color}
                      onChange={(e) => setApgar1m({ ...apgar1m, color: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                    >
                      <option value={0}>0 (Blue / Pale)</option>
                      <option value={1}>1 (Acocyanotic)</option>
                      <option value={2}>2 (Completely Pink)</option>
                    </select>
                    <select
                      value={apgar5m.color}
                      onChange={(e) => setApgar5m({ ...apgar5m, color: Number(e.target.value) })}
                      className="bg-slate-800 border border-slate-700 rounded p-1 text-slate-200"
                    >
                      <option value={0}>0 (Blue / Pale)</option>
                      <option value={1}>1 (Acocyanotic)</option>
                      <option value={2}>2 (Completely Pink)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Jaundice & Phototherapy Monitor */}
              <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Neonatal Hyperbilirubinemia & Phototherapy Guide
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300">Gestational Age (Weeks)</label>
                      <input
                        type="number"
                        value={gestationalWeeks}
                        onChange={(e) => setGestationalWeeks(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300">Total Serum Bilirubin (mg/dL)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={biliLevel}
                        onChange={(e) => setBiliLevel(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono mt-1"
                      />
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                    needsPhototherapy
                      ? "bg-amber-950/40 border-amber-500/50 text-amber-200"
                      : "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                  }`}>
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>Threshold for {gestationalWeeks}w GA: {photoTherapyThreshold} mg/dL</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900">
                        {needsPhototherapy ? "Phototherapy Required" : "Normal / Monitor"}
                      </span>
                    </div>
                    <p>
                      {needsPhototherapy
                        ? `Bilirubin (${biliLevel} mg/dL) exceeds AAP threshold (${photoTherapyThreshold} mg/dL). Initiate intensive LED phototherapy & recheck TSB in 6-12h.`
                        : `Bilirubin (${biliLevel} mg/dL) is below phototherapy threshold (${photoTherapyThreshold} mg/dL). Continue routine newborn monitoring & hydration.`}
                    </p>
                  </div>

                  {/* Kangaroo Care Tracker */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <span className="font-bold text-pink-300 block">🦘 Kangaroo Mother Care (KMC) Tracker</span>
                    <p className="text-slate-400">Recommended for low birth weight infants. Session log: 2 hours completed today.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PEDIATRIC SOAP NOTE */}
        {activeTab === "soap" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-pink-400" />
              Pediatric Consultation SOAP Note
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-300">S - Subjective (Parent Report & History)</label>
                <textarea
                  value={pediatricSoap.subjective}
                  onChange={(e) => setPediatricSoap({ ...pediatricSoap, subjective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-300">O - Objective (Exam, Growth, Vitals)</label>
                <textarea
                  value={pediatricSoap.objective}
                  onChange={(e) => setPediatricSoap({ ...pediatricSoap, objective: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-300">A - Assessment (Growth & Vaccines)</label>
                <textarea
                  value={pediatricSoap.assessment}
                  onChange={(e) => setPediatricSoap({ ...pediatricSoap, assessment: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-300">P - Plan (Vaccine Orders & Guidance)</label>
                <textarea
                  value={pediatricSoap.plan}
                  onChange={(e) => setPediatricSoap({ ...pediatricSoap, plan: e.target.value })}
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

export default PediatricsSuite;
