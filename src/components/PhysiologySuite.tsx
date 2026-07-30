import React, { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Activity, 
  HeartPulse, 
  Zap, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingUp, 
  FileText, 
  Flame, 
  RefreshCw,
  Clock,
  Layers,
  Dumbbell
} from "lucide-react";

interface PhysiologySuiteProps {
  onBackToLanding: () => void;
}

export function PhysiologySuite({ onBackToLanding }: PhysiologySuiteProps) {
  const [activeSubTab, setActiveSubTab] = useState<"cardiopulmonary" | "biomechanics" | "electrophysiology" | "metabolic">("cardiopulmonary");
  const [vo2TestRunning, setVo2TestRunning] = useState(false);
  const [vo2Result, setVo2Result] = useState<string | null>(null);

  const handleSimulateVo2 = () => {
    setVo2TestRunning(true);
    setVo2Result(null);
    setTimeout(() => {
      setVo2TestRunning(false);
      setVo2Result("VO2 Max Simulated Result: 44.2 mL/kg/min (88th percentile for age 35). Anaerobic Threshold (AT) reached at HR 158 bpm. Respiratory Quotient (RQ): 1.04.");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToLanding}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer border border-slate-700 flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portal</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl text-white shadow-lg shadow-emerald-950/50">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">CURA Physiology & Biomechanics AI Suite</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Physiology v2.8
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400">
                Cardiopulmonary Exercise Testing (CPET), EMG Muscle Activation & Biomechanical Gait Analysis
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateVo2}
            disabled={vo2TestRunning}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 animate-pulse text-emerald-200" />
            <span>{vo2TestRunning ? "Simulating CPET Ramp..." : "Run CPET VO2 Max Test"}</span>
          </button>
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-emerald-400">
            Physiologist ID: PHY-AI-4401
          </div>
        </div>
      </header>

      {/* SUB TABS */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-2.5 flex items-center gap-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("cardiopulmonary")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "cardiopulmonary"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <HeartPulse className="h-4 w-4" />
          <span>Cardiopulmonary (CPET)</span>
        </button>
        <button
          onClick={() => setActiveSubTab("biomechanics")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "biomechanics"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Biomechanics & Gait</span>
        </button>
        <button
          onClick={() => setActiveSubTab("electrophysiology")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "electrophysiology"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>EMG & Nerve Conduction</span>
        </button>
        <button
          onClick={() => setActiveSubTab("metabolic")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === "metabolic"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>Metabolic Rate (BMR & RQ)</span>
        </button>
      </div>

      {/* CONTENT BODY */}
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {vo2Result && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold leading-relaxed">{vo2Result}</span>
            </div>
            <button
              onClick={() => setVo2Result(null)}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-lg">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">VO2 Max Peak</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">44.2</span>
              <span className="text-xs text-slate-400 font-mono">mL/kg/min</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold mt-2 block">↑ Top 15% Age Norm</span>
          </div>

          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-lg">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Ventilatory Threshold (VT1)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-cyan-400">142</span>
              <span className="text-xs text-slate-400 font-mono">bpm HR</span>
            </div>
            <span className="text-[10px] text-cyan-500 font-semibold mt-2 block">Zone 2 Aerobic Base</span>
          </div>

          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-lg">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Respiratory Quotient (RQ)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">1.04</span>
              <span className="text-xs text-slate-400 font-mono">VCO2 / VO2</span>
            </div>
            <span className="text-[10px] text-amber-500 font-semibold mt-2 block">Maximal Effort AT Reached</span>
          </div>

          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-lg">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Gait Cadence & Asymmetry</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-400">114</span>
              <span className="text-xs text-slate-400 font-mono">steps/min (1.2% Asym)</span>
            </div>
            <span className="text-[10px] text-teal-500 font-semibold mt-2 block">Symmetrical Stride</span>
          </div>
        </div>

        {/* DETAILED VIEW CARD */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Physiological Signals & Functional Workload Graph
              </h2>
              <p className="text-xs text-slate-400">Continuous metabolic cart recording with gas exchange ratio analysis.</p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              Live Gas Exchange: O2/CO2
            </span>
          </div>

          <div className="h-48 bg-slate-900 rounded-2xl border border-slate-800/80 p-4 flex items-end justify-between gap-2">
            {[30, 42, 55, 68, 80, 92, 110, 128, 145, 158, 168, 175, 182, 170, 150, 130].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-500 hover:brightness-125"
                  style={{ height: `${(val / 200) * 100}%` }}
                ></div>
                <span className="text-[9px] font-mono text-slate-500">{idx + 1}m</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">Clinical Interpretation</span>
              <p className="text-slate-300 leading-relaxed font-medium">
                Normal cardiopulmonary exercise response with no ischemic ECG changes or abnormal blood pressure dynamics. Excellent exercise tolerance and anaerobic threshold.
              </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">Rehabilitation & Training Prescription</span>
              <p className="text-slate-300 leading-relaxed font-medium">
                Target Zone 2 Heart Rate: 130–145 bpm for 45 mins 3x/week. Zone 4 High-Intensity Intervals (HIIT): 4x4 min at 162–170 bpm once weekly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhysiologySuite;
