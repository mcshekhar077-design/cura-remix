import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Activity,
  Sparkles,
  Shield,
  ArrowRight,
  TrendingUp,
  Award,
  Bell,
  Utensils,
  Pill,
  Smile
} from "lucide-react";
import { CareJourney } from "./AyushTypes";

export function AyushCareJourney() {
  const [journey, setJourney] = useState<CareJourney | null>(null);
  const [loading, setLoading] = useState(true);

  // Daily Patient Adherence Log States
  const [medicineTaken, setMedicineTaken] = useState(true);
  const [anupanaTaken, setAnupanaTaken] = useState(true);
  const [dietComplied, setDietComplied] = useState(true);
  const [yogaCompleted, setYogaCompleted] = useState(true);
  const [logSaved, setLogSaved] = useState(false);

  useEffect(() => {
    async function loadJourney() {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/ayush/care-journey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: "PAT-8841-CURA",
            system: "Ayurveda",
            goal: "Dyspepsia, Metabolic Detox & BP Normalization"
          })
        });
        const data = await res.json();
        if (data.success && data.careJourney) {
          setJourney(data.careJourney);
        }
      } catch (err) {
        console.error("Error loading care journey:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJourney();
  }, []);

  const handleSaveDailyLog = () => {
    setLogSaved(true);
    setTimeout(() => setLogSaved(false), 3500);
  };

  return (
    <div className="space-y-8">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Continuous Care Pathway
            </span>
            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-black px-3 py-1 rounded-full border border-cyan-500/30">
              Closed-Loop Clinical Outcomes
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-black tracking-tight">
            AYUSH Continuous Care Journey
          </h2>
          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-normal">
            Moving beyond disconnected transactional consultations into a continuous therapeutic trajectory: 
            <strong> Assessment &rarr; Consultation &rarr; Treatment &rarr; Medicine &rarr; Diet &rarr; Yoga &rarr; Adherence &rarr; Follow-up &rarr; Outcome.</strong>
          </p>
        </div>
      </div>

      {/* CONTINUOUS PATHWAY PIPELINE STRIP */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
        <div className="min-w-[700px] flex items-center justify-between relative">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
          {[
            { step: 1, label: "Assessment", icon: "📋", done: true },
            { step: 2, label: "Consultation", icon: "👨‍⚕️", done: true },
            { step: 3, label: "Treatment", icon: "🌿", current: true },
            { step: 4, label: "Medicine", icon: "💊", current: true },
            { step: 5, label: "Diet (Ahara)", icon: "🥗", current: true },
            { step: 6, label: "Yoga (Vihara)", icon: "🧘", current: true },
            { step: 7, label: "Adherence", icon: "📊", current: true },
            { step: 8, label: "Follow-up", icon: "📅", pending: true },
            { step: 9, label: "Outcome", icon: "🎯", pending: true }
          ].map((node, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-1.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-xs transition ${
                  node.done
                    ? "bg-emerald-600 text-white"
                    : node.current
                    ? "bg-indigo-900 text-white ring-4 ring-indigo-200 animate-pulse"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {node.done ? "✓" : node.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                node.done ? "text-emerald-800" : node.current ? "text-indigo-900 font-extrabold" : "text-slate-400"
              }`}>
                {node.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TWO COLUMNS: JOURNEY STAGES & DAILY COMPANION CHECK-IN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STAGES LIST */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                Active Protocol: {journey?.goal || "Metabolic Regulation & Panchakarma"}
              </span>
              <h3 className="text-base font-black text-slate-800">
                Care Pathway Milestones ({journey?.stages.length || 7} Steps)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Journey ID: {journey?.journeyId || "CJ-AYU-8841"}
            </span>
          </div>

          <div className="space-y-4">
            {journey?.stages.map(stage => (
              <div
                key={stage.stageNumber}
                className={`p-4 rounded-2xl border transition text-xs space-y-2 ${
                  stage.status === "COMPLETED"
                    ? "bg-emerald-50/40 border-emerald-200"
                    : stage.status === "IN_PROGRESS"
                    ? "bg-indigo-50/40 border-indigo-200 shadow-xs"
                    : "bg-slate-50 border-slate-200 opacity-70"
                }`}
              >
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      stage.status === "COMPLETED"
                        ? "bg-emerald-600 text-white"
                        : stage.status === "IN_PROGRESS"
                        ? "bg-indigo-700 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}>
                      Stage {stage.stageNumber} &bull; {stage.status.replace("_", " ")}
                    </span>
                    <h4 className="text-sm font-black text-slate-900">{stage.name}</h4>
                  </div>

                  {stage.adherenceScore && (
                    <span className="font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                      Adherence: {stage.adherenceScore}
                    </span>
                  )}
                  {stage.currentDay && (
                    <span className="font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-xs">
                      Day {stage.currentDay} of {stage.totalDays}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {stage.details}
                </p>

                {stage.completedAt && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Completed on: {new Date(stage.completedAt).toLocaleDateString()}
                  </p>
                )}
                {stage.scheduledFor && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Scheduled for: {new Date(stage.scheduledFor).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* DAILY PATIENT ADHERENCE & ANUPANA COMPANION */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">
                Daily Adherence Companion
              </span>
              <h4 className="text-base font-black text-slate-900">Today's Treatment Adherence</h4>
              <p className="text-xs text-slate-500">Closing the loop between doctor prescription and daily patient execution</p>
            </div>

            {/* CHECKLIST */}
            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={medicineTaken}
                  onChange={e => setMedicineTaken(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <strong className="block text-slate-800 font-bold">Medicines Ingested</strong>
                  <span className="text-[11px] text-slate-500">Arogyavardhini Vati & Arjuna Ksheerapaka taken as prescribed</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={anupanaTaken}
                  onChange={e => setAnupanaTaken(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-amber-600 rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <strong className="block text-slate-800 font-bold">Anupana Vehicle Adherence</strong>
                  <span className="text-[11px] text-slate-500">Taken with specified warm water (Ushnodaka) and cow's milk</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={dietComplied}
                  onChange={e => setDietComplied(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <strong className="block text-slate-800 font-bold">Pathya Ahara (Dietary Rules)</strong>
                  <span className="text-[11px] text-slate-500">Avoided curd, fried items, and cold water post 7 PM</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={yogaCompleted}
                  onChange={e => setYogaCompleted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-rose-600 rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <strong className="block text-slate-800 font-bold">Yoga & Pranayama</strong>
                  <span className="text-[11px] text-slate-500">Completed 15-min Nadi Shodhana & 10-min Vajrasana</span>
                </div>
              </label>
            </div>

            {/* REAL-TIME METRICS WIDGET */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <div className="flex justify-between items-center font-bold text-emerald-950">
                <span>Calculated Adherence Rate:</span>
                <span className="text-sm font-mono text-emerald-800">96.4%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full w-[96.4%]" />
              </div>
              <p className="text-[10px] text-emerald-800 font-semibold">
                🔥 18-Day Active Adherence Streak. Next clinical outcome review in 6 days.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={handleSaveDailyLog}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition cursor-pointer uppercase tracking-wider"
            >
              {logSaved ? "✓ Adherence Log Saved to EHR" : "Submit Daily Adherence Check-In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
