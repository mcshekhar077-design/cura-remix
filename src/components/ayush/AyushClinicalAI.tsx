import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Brain,
  RefreshCw,
  Clock,
  Layers,
  Check
} from "lucide-react";
import { AyushClinicalAssessment } from "./AyushTypes";

export function AyushClinicalAI() {
  const [activeSubsystem, setActiveSubsystem] = useState<"ayurveda" | "unani" | "siddha" | "yoga" | "homeopathy">("ayurveda");
  
  // Patient case inputs
  const [patientName, setPatientName] = useState("Rajesh Kumar");
  const [patientAge, setPatientAge] = useState(48);
  const [patientGender, setPatientGender] = useState("Male");
  const [chiefComplaints, setChiefComplaints] = useState(
    "Chronic dyspepsia with postprandial bloating, acid reflux, intermittent insomnia, and morning joint stiffness aggravated during cold weather."
  );
  const [symptomDuration, setSymptomDuration] = useState("4 months");
  const [allopathicMeds, setAllopathicMeds] = useState("Atorvastatin 20mg OD, Telmisartan 40mg OD");
  const [allergies, setAllergies] = useState("Sulfa antibiotics");

  // Subsystem specific clinical parameters
  const [ayurvedaAgni, setAyurvedaAgni] = useState("Manda (Sluggish)");
  const [unaniMizajInput, setUnaniMizajInput] = useState("Damwi wa Balghami (Sanguine-Phlegmatic)");
  const [siddhaNaadiInput, setSiddhaNaadiInput] = useState("Azhal-Kabha Thondam");
  const [homeoMiasmInput, setHomeoMiasmInput] = useState("Psoric-Sycotic Diathesis");
  const [yogaKoshaInput, setYogaKoshaInput] = useState("Annamaya & Pranamaya Dysregulation");

  // API states
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AyushClinicalAssessment | null>(null);
  const [modelUsed, setModelUsed] = useState<string>("");
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [doctorApproved, setDoctorApproved] = useState(false);

  const handleGenerateAssessment = async () => {
    setIsLoading(true);
    setDoctorApproved(false);

    try {
      const response = await fetch("/api/v1/ayush/clinical-assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: activeSubsystem,
          patient: {
            name: patientName,
            age: patientAge,
            gender: patientGender,
            chiefComplaints,
            duration: symptomDuration,
            allopathicMeds: allopathicMeds.split(",").map(m => m.trim()).filter(Boolean),
            allergies: allergies.split(",").map(a => a.trim()).filter(Boolean)
          },
          assessmentData: {
            subsystem: activeSubsystem,
            agni: ayurvedaAgni,
            mizaj: unaniMizajInput,
            naadi: siddhaNaadiInput,
            miasm: homeoMiasmInput,
            kosha: yogaKoshaInput
          }
        })
      });

      const data = await response.json();
      if (data.success && data.assessment) {
        setAssessmentResult(data.assessment);
        setModelUsed(data.modelUsed || "Clinitial AYUSH Intelligence");
        setLatencyMs(data.latencyMs || 240);
      }
    } catch (err) {
      console.error("Failed to run AYUSH AI assessment:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ARCHITECTURAL HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-black px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-400" /> Clinitial AI Gateway
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Human-In-The-Loop (HITL) Gate
            </span>
          </div>

          <h2 className="text-xl md:text-3xl font-black tracking-tight">
            Clinitial AYUSH AI — Unified Clinical Intelligence
          </h2>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            A unified clinical decision support gateway orchestrating specialized traditional medicine intelligences. 
            Synthesizes patient longitudinal history, allopathic co-medications, and classical diagnostics into validated clinical considerations, dietary regimens (Pathya/Apathya), treatment drafts, and cross-system pharmacovigilance checks.
          </p>

          {/* ARCHITECTURE DIAGRAM STRIP */}
          <div className="pt-2">
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-indigo-900/60 font-mono text-[11px] text-indigo-200 hidden md:flex items-center justify-between">
              <span className="font-black text-white flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-400" /> Clinitial AI Gateway
              </span>
              <span className="text-indigo-400">&rarr;</span>
              <span className="text-emerald-300">🌿 Ayurveda (Prakriti/Vikriti/Dosha)</span>
              <span className="text-indigo-400">&bull;</span>
              <span className="text-cyan-300">⚜️ Unani (Mizaj/Akhlat)</span>
              <span className="text-indigo-400">&bull;</span>
              <span className="text-amber-300">🪔 Siddha (Mukkuttram/Naadi)</span>
              <span className="text-indigo-400">&bull;</span>
              <span className="text-rose-300">🧘 Yoga & Naturopathy</span>
              <span className="text-indigo-400">&bull;</span>
              <span className="text-blue-300">💧 Homeopathy</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUBSYSTEM NAVIGATION PILLS */}
      <div className="flex flex-wrap gap-2.5 p-2 bg-slate-100 rounded-2xl border border-slate-200">
        {[
          { id: "ayurveda", name: "Ayurveda Intelligence", icon: "🌿", focus: "Prakriti, Vikriti, Agni & Tridosha" },
          { id: "unani", name: "Unani Intelligence", icon: "⚜️", focus: "Mizaj, Akhlat & Asbab-e-Sittah" },
          { id: "siddha", name: "Siddha Intelligence", icon: "🪔", focus: "Mukkuttram, Naadi & Envagai Thervu" },
          { id: "yoga", name: "Yoga & Naturopathy Intelligence", icon: "🧘", focus: "Pancha Kosha & Pranic Alignment" },
          { id: "homeopathy", name: "Homeopathy Intelligence", icon: "💧", focus: "Totality, Miasms & Repertorization" }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubsystem(sub.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeSubsystem === sub.id
                ? "bg-indigo-900 text-white shadow-md shadow-indigo-950/20"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{sub.icon}</span>
            <span>{sub.name}</span>
          </button>
        ))}
      </div>

      {/* CASE INPUT FORM */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Clinical Case Presentation for {activeSubsystem.toUpperCase()} Intelligence
            </h3>
            <p className="text-xs text-slate-500">Provide presenting signs, symptom timeline, and concurrent allopathic therapies</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Decision Support Mode (Non-Autonomous)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Age & Gender</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={patientAge}
                onChange={e => setPatientAge(Number(e.target.value))}
                className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              />
              <input
                type="text"
                value={patientGender}
                onChange={e => setPatientGender(e.target.value)}
                className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Symptom Duration</label>
            <input
              type="text"
              value={symptomDuration}
              onChange={e => setSymptomDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Allergies</label>
            <input
              type="text"
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Chief Complaints & Present Illness</label>
            <textarea
              rows={3}
              value={chiefComplaints}
              onChange={e => setChiefComplaints(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-black text-amber-700 uppercase mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" /> Concurrent Allopathic Medications
              </label>
              <input
                type="text"
                value={allopathicMeds}
                onChange={e => setAllopathicMeds(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-indigo-700 uppercase mb-1">
                {activeSubsystem === "ayurveda" ? "Agni Pariksha" : activeSubsystem === "unani" ? "Mizaj State" : activeSubsystem === "siddha" ? "Naadi Assessment" : activeSubsystem === "homeopathy" ? "Dominant Miasm" : "Pancha Kosha"}
              </label>
              <input
                type="text"
                value={
                  activeSubsystem === "ayurveda" ? ayurvedaAgni :
                  activeSubsystem === "unani" ? unaniMizajInput :
                  activeSubsystem === "siddha" ? siddhaNaadiInput :
                  activeSubsystem === "homeopathy" ? homeoMiasmInput : yogaKoshaInput
                }
                onChange={e => {
                  if (activeSubsystem === "ayurveda") setAyurvedaAgni(e.target.value);
                  else if (activeSubsystem === "unani") setUnaniMizajInput(e.target.value);
                  else if (activeSubsystem === "siddha") setSiddhaNaadiInput(e.target.value);
                  else if (activeSubsystem === "homeopathy") setHomeoMiasmInput(e.target.value);
                  else setYogaKoshaInput(e.target.value);
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateAssessment}
          disabled={isLoading}
          className="w-full py-3.5 bg-indigo-900 hover:bg-indigo-950 disabled:bg-slate-300 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-900/20"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Processing via Clinitial AYUSH AI Gateway...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-300" /> Generate AI-Assisted AYUSH Clinical Synthesis
            </>
          )}
        </button>
      </div>

      {/* ASSESSMENT RESULTS PANEL */}
      {assessmentResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md space-y-6"
        >
          {/* TOP METRICS BAR */}
          <div className="flex flex-wrap justify-between items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-black text-slate-800">Engine:</span>
              <span className="font-mono text-indigo-700 font-bold">{modelUsed}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 font-semibold">
              <span>Latency: <strong className="text-slate-800 font-mono">{latencyMs}ms</strong></span>
              <span>Framework: <strong className="text-slate-800">Ministry of AYUSH Standard</strong></span>
            </div>
          </div>

          {/* 1. DIAGNOSTIC SYNTHESIS & CONSTITUTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
              <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider block">
                Diagnostic Synthesis
              </span>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                {assessmentResult.diagnosticSynthesis}
              </p>
            </div>

            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                Constitutional Balance
              </span>
              <div className="text-xs font-bold text-slate-800 space-y-1">
                <div>Primary: <span className="text-emerald-700">{assessmentResult.prakritiOrConstitution?.primary}</span></div>
                <div>Secondary: <span className="text-emerald-600">{assessmentResult.prakritiOrConstitution?.secondary}</span></div>
                <div className="pt-1 text-[11px] text-slate-600 font-normal">
                  Imbalance: <strong>{assessmentResult.prakritiOrConstitution?.vikritiOrImbalance}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DUAL CODING: NAMASTE & ICD-11 */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              Dual Standard Disease Classifications
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {assessmentResult.namasteCoding?.map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-slate-800 block">{item.term}</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">NAMASTE: {item.code}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    ICD-11: {item.icd11Mapping}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. PATHYA AHARA & APATHYA AHARA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pathya Ahara (Recommended Diet & Thermal Qualities)
              </span>
              <ul className="space-y-1 text-xs text-slate-700 font-medium">
                {assessmentResult.pathyaAhara?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-2">
              <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Apathya Ahara (Contraindicated Foods & Habits)
              </span>
              <ul className="space-y-1 text-xs text-slate-700 font-medium">
                {assessmentResult.apathyaAhara?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. PROPOSED MEDICINES & ANUPANA */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              Proposed Classical Formulations & Administration Anupana
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assessmentResult.proposedMedicines?.map((med, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-black text-slate-800 text-sm">{med.name}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                      {med.dosage}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Anupana (Vehicle):</strong> {med.anupana} &bull; <strong>Kala (Timing):</strong> {med.kala}
                  </div>
                  {med.safetyAlert && (
                    <div className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                      ⚠️ {med.safetyAlert}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. HERB-ALLOPATHIC CROSS-SAFETY CHECKS */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-700" /> Herb-Allopathic Cross-System Safety Analysis
            </span>
            <div className="space-y-1">
              {assessmentResult.herbAllopathicSafetyChecks?.map((check, idx) => (
                <p key={idx} className="text-xs font-semibold text-amber-950 flex items-start gap-1.5">
                  <span>&bull;</span>
                  <span>{check}</span>
                </p>
              ))}
            </div>
          </div>

          {/* 6. HITL DOCTOR APPROVAL GATE */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                Human-In-The-Loop Confirmation Required
              </span>
              <p className="text-xs text-slate-300">
                {assessmentResult.disclaimer}
              </p>
            </div>

            {!doctorApproved ? (
              <button
                onClick={() => setDoctorApproved(true)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Check className="w-4 h-4" /> Approve & Adopt Assessment
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl border border-emerald-500/30 text-xs font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Clinically Approved by Attending Vaidya
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
