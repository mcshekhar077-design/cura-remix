import React, { useState, useCallback, useMemo } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Activity, 
  HeartPulse, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  Flame, 
  RefreshCw,
  Dumbbell,
  Footprints,
  Scan,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  Radio,
  BarChart3,
  LineChart,
  Users
} from "lucide-react";
import { RealTimeMonitor } from "./PhysiologySuite/RealTimeMonitor";
import { AnalyticsDashboard } from "./PhysiologySuite/AnalyticsDashboard";
import { ProgressTracker } from "./PhysiologySuite/ProgressTracker";
import { PatientComparison } from "./PhysiologySuite/PatientComparison";

// ============================================
// TYPES
// ============================================

export interface PhysiologicalData {
  id: string;
  patientId: string;
  timestamp: string;
  vo2Max: number;
  hrMax: number;
  hrRest: number;
  vt1: number; // Ventilatory Threshold 1
  vt2: number; // Ventilatory Threshold 2
  rq: number; // Respiratory Quotient
  vco2: number;
  ve: number; // Minute Ventilation
  petO2: number;
  petCO2: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  spo2: number;
  gaitCadence: number;
  gaitAsymmetry: number;
  strideLength: number;
  muscleActivation: {
    quadriceps: number;
    hamstrings: number;
    gastrocnemius: number;
    tibialis: number;
  };
  metabolicRate: {
    bmr: number;
    rq: number;
    fatOxidation: number;
    carbohydrateOxidation: number;
  };
  emgData: {
    muscle: string;
    activation: number;
    fatigue: number;
    medianFrequency: number;
  }[];
}

export interface CPETDataPoint {
  time: number;
  heartRate: number;
  vo2: number;
  vco2: number;
  ve: number;
  rq: number;
  power: number;
}

export interface PhysiologySuiteProps {
  patientId?: string;
  patientName?: string;
  onBackToLanding: () => void;
  onExportData?: (data: any) => void;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_CPET_DATA: CPETDataPoint[] = Array.from({ length: 60 }, (_, i) => ({
  time: i,
  heartRate: 80 + i * 1.5 + Math.random() * 5,
  vo2: 8 + i * 0.8 + Math.random() * 2,
  vco2: 6 + i * 0.7 + Math.random() * 1.5,
  ve: 12 + i * 0.5 + Math.random() * 2,
  rq: 0.75 + i * 0.005 + Math.random() * 0.02,
  power: 20 + i * 3 + Math.random() * 5
}));

const MOCK_PHYSIOLOGICAL_DATA: PhysiologicalData = {
  id: "phys-001",
  patientId: "PAT-1001",
  timestamp: new Date().toISOString(),
  vo2Max: 44.2,
  hrMax: 188,
  hrRest: 58,
  vt1: 142,
  vt2: 168,
  rq: 1.04,
  vco2: 3.8,
  ve: 72.4,
  petO2: 112.5,
  petCO2: 38.2,
  bloodPressureSystolic: 128,
  bloodPressureDiastolic: 82,
  spo2: 98.5,
  gaitCadence: 114,
  gaitAsymmetry: 1.2,
  strideLength: 1.42,
  muscleActivation: {
    quadriceps: 78,
    hamstrings: 62,
    gastrocnemius: 55,
    tibialis: 48
  },
  metabolicRate: {
    bmr: 1850,
    rq: 0.85,
    fatOxidation: 0.42,
    carbohydrateOxidation: 0.58
  },
  emgData: [
    { muscle: "Quadriceps", activation: 78, fatigue: 12, medianFrequency: 145 },
    { muscle: "Hamstrings", activation: 62, fatigue: 8, medianFrequency: 132 },
    { muscle: "Gastrocnemius", activation: 55, fatigue: 15, medianFrequency: 128 },
    { muscle: "Tibialis Anterior", activation: 48, fatigue: 6, medianFrequency: 118 }
  ]
};

// ============================================
// SUB-COMPONENTS
// ============================================

// Cardiopulmonary CPET Component
const CardiopulmonaryTab: React.FC<{
  data: CPETDataPoint[];
  vo2Result: string | null;
  onRunTest: () => void;
  isRunning: boolean;
}> = ({ data, vo2Result, onRunTest, isRunning }) => {
  const [selectedMetric, setSelectedMetric] = useState<"heartRate" | "vo2" | "vco2" | "rq">("heartRate");
  const [showDetailed, setShowDetailed] = useState(false);

  const metrics = {
    heartRate: { label: "Heart Rate", color: "rose", unit: "bpm" },
    vo2: { label: "VO2", color: "emerald", unit: "mL/kg/min" },
    vco2: { label: "VCO2", color: "cyan", unit: "L/min" },
    rq: { label: "RQ", color: "amber", unit: "ratio" }
  };

  const currentMetric = metrics[selectedMetric];

  const getMetricGradient = (metric: "heartRate" | "vo2" | "vco2" | "rq") => {
    switch (metric) {
      case "heartRate":
        return "from-rose-500 to-red-500";
      case "vo2":
        return "from-emerald-500 to-teal-500";
      case "vco2":
        return "from-cyan-500 to-blue-500";
      case "rq":
        return "from-amber-500 to-orange-500";
    }
  };

  return (
    <div id="tab-cpet-container" className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(["heartRate", "vo2", "vco2", "rq"] as const).map((key) => {
            const isSelected = selectedMetric === key;
            return (
              <button
                id={`btn-cpet-metric-${key}`}
                key={key}
                type="button"
                onClick={() => setSelectedMetric(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {metrics[key].label}
              </button>
            );
          })}
        </div>

        <button
          id="btn-run-vo2-test"
          type="button"
          onClick={onRunTest}
          disabled={isRunning}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Simulating CPET Ramp...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Run CPET VO2 Max Test
            </>
          )}
        </button>

        <button
          id="btn-toggle-cpet-details"
          type="button"
          onClick={() => setShowDetailed(!showDetailed)}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {showDetailed ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          {showDetailed ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* VO2 Result */}
      {vo2Result && (
        <div id="vo2-test-result-box" className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold leading-relaxed">{vo2Result}</span>
          </div>
        </div>
      )}

      {/* Graph */}
      <div id="cpet-graph-container" className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400">
            {currentMetric.label} vs Time
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Latest: {data[data.length - 1]?.[selectedMetric]?.toFixed(1) || "--"} {currentMetric.unit}
          </span>
        </div>
        <div className="h-48 relative">
          <div className="absolute inset-0 flex items-end justify-between gap-0.5">
            {data.slice(0, 30).map((point, idx) => {
              const value = point[selectedMetric];
              const max = selectedMetric === "heartRate" ? 200 : 
                         selectedMetric === "vo2" ? 60 : 
                         selectedMetric === "vco2" ? 6 : 1.2;
              const height = Math.min((value / max) * 100, 100);
              const gradientClass = getMetricGradient(selectedMetric);
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                >
                  <div 
                    className={`w-full bg-gradient-to-t ${gradientClass} rounded-t transition-all duration-300 hover:opacity-80`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-500">
          <span>0:00</span>
          <span>5:00</span>
          <span>10:00</span>
          <span>15:00</span>
          <span>20:00</span>
        </div>
      </div>

      {/* Detailed Metrics */}
      {showDetailed && (
        <div id="cpet-detailed-metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase font-bold">VO2 Max Peak</span>
            <p className="text-lg font-black text-emerald-400">{MOCK_PHYSIOLOGICAL_DATA.vo2Max}</p>
            <span className="text-[10px] text-slate-500">mL/kg/min</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase font-bold">VT1</span>
            <p className="text-lg font-black text-cyan-400">{MOCK_PHYSIOLOGICAL_DATA.vt1}</p>
            <span className="text-[10px] text-slate-500">bpm HR</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase font-bold">VT2</span>
            <p className="text-lg font-black text-amber-400">{MOCK_PHYSIOLOGICAL_DATA.vt2}</p>
            <span className="text-[10px] text-slate-500">bpm HR</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase font-bold">Max HR</span>
            <p className="text-lg font-black text-rose-400">{MOCK_PHYSIOLOGICAL_DATA.hrMax}</p>
            <span className="text-[10px] text-slate-500">bpm</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Biomechanics & Gait Tab
const BiomechanicsTab: React.FC<{ data: PhysiologicalData }> = ({ data }) => {
  const [selectedJoint, setSelectedJoint] = useState<"hip" | "knee" | "ankle">("knee");

  return (
    <div id="tab-biomechanics-container" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-teal-400" />
            <span className="text-xs font-bold text-slate-400 uppercase">Gait Cadence</span>
          </div>
          <p className="text-2xl font-black text-white mt-1">{data.gaitCadence}</p>
          <span className="text-xs text-slate-500">steps/min</span>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: "78%" }} />
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-bold text-slate-400 uppercase">Stride Length</span>
          </div>
          <p className="text-2xl font-black text-white mt-1">{data.strideLength}</p>
          <span className="text-xs text-slate-500">meters</span>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: "65%" }} />
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-bold text-slate-400 uppercase">Gait Asymmetry</span>
          </div>
          <p className="text-2xl font-black text-white mt-1">{data.gaitAsymmetry}%</p>
          <span className="text-xs text-slate-500">Symmetrical</span>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "98%" }} />
          </div>
        </div>
      </div>

      {/* Joint Angle Visualization */}
      <div id="joint-angle-viz" className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase">
            {selectedJoint.toUpperCase()} Joint Angle During Gait Cycle
          </span>
          <div className="flex gap-1.5">
            {(["hip", "knee", "ankle"] as const).map(joint => (
              <button
                id={`btn-joint-${joint}`}
                key={joint}
                type="button"
                onClick={() => setSelectedJoint(joint)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                  selectedJoint === joint
                    ? "bg-teal-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {joint}
              </button>
            ))}
          </div>
        </div>
        <div className="h-40 flex items-end justify-between gap-1">
          {Array.from({ length: 20 }).map((_, idx) => {
            const angle = 20 + Math.sin(idx * 0.5) * 30 + (idx / 20) * 10;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div 
                  className="w-full bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t transition-all"
                  style={{ height: `${Math.min(angle * 1.5, 100)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-500">
          <span>Heel Strike</span>
          <span>Mid Stance</span>
          <span>Toe Off</span>
          <span>Swing</span>
        </div>
      </div>

      {/* Muscle Activation */}
      <div id="muscle-activation-bars" className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <span className="text-xs font-bold text-slate-400 uppercase block mb-3">Muscle Activation during Gait</span>
        <div className="space-y-2.5">
          {Object.entries(data.muscleActivation).map(([muscle, rawValue]) => {
            const value = Number(rawValue);
            return (
              <div key={muscle}>
                <div className="flex justify-between text-xs">
                  <span className="capitalize text-slate-300">{muscle}</span>
                  <span className="text-slate-500 font-mono">{value}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      value > 70 ? "bg-emerald-500" : 
                      value > 50 ? "bg-amber-500" : 
                      "bg-rose-500"
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// EMG & Nerve Conduction Tab
const EMGTab: React.FC<{ data: PhysiologicalData }> = ({ data }) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string>(data.emgData[0]?.muscle || "Quadriceps");

  return (
    <div id="tab-emg-container" className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.emgData.map((emg) => (
          <button
            id={`btn-emg-muscle-${emg.muscle.replace(/\s+/g, "-").toLowerCase()}`}
            key={emg.muscle}
            type="button"
            className={`bg-slate-950 p-4 rounded-2xl border transition-all cursor-pointer text-left ${
              selectedMuscle === emg.muscle
                ? "border-purple-500 shadow-lg shadow-purple-500/20"
                : "border-slate-800 hover:border-slate-700"
            }`}
            onClick={() => setSelectedMuscle(emg.muscle)}
          >
            <span className="text-[10px] text-slate-400 uppercase font-bold block">{emg.muscle}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-white">{emg.activation}%</span>
              <span className="text-xs text-slate-500">Activation</span>
            </div>
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${emg.activation}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-500">
              <span>Fatigue: {emg.fatigue}%</span>
              <span>MF: {emg.medianFrequency}Hz</span>
            </div>
          </button>
        ))}
      </div>

      {/* EMG Signal Visualization */}
      <div id="emg-signal-viz" className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase">
            {selectedMuscle} - EMG Signal & Median Frequency
          </span>
          <span className="text-[10px] font-mono text-purple-400">
            Filtered 20-450Hz
          </span>
        </div>
        <div className="h-32 flex items-end justify-between gap-0.5">
          {Array.from({ length: 100 }).map((_, idx) => {
            const value = Math.sin(idx * 0.5) * 40 + Math.sin(idx * 1.2) * 20 + Math.random() * 10;
            const height = 50 + value;
            return (
              <div
                key={idx}
                className="flex-1 bg-purple-500/60 rounded-t transition-all hover:bg-purple-400"
                style={{ height: `${Math.min(Math.max(height, 10), 100)}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-500">
          <span>0 ms</span>
          <span>50 ms</span>
          <span>100 ms</span>
          <span>150 ms</span>
          <span>200 ms</span>
        </div>
      </div>

      {/* Fatigue Analysis */}
      <div id="emg-fatigue-analysis" className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <span className="text-xs font-bold text-slate-400 uppercase block mb-3">Muscle Fatigue Analysis</span>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Median Frequency Drop</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-rose-400">-12.3%</span>
              <span className="text-slate-400">from baseline</span>
            </div>
          </div>
          <div>
            <span className="text-slate-500 block">Recovery Time</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-emerald-400">~2.4 min</span>
              <span className="text-slate-400">estimated</span>
            </div>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block mb-1">Fatigue Index (FI)</span>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full" style={{ width: "45%" }} />
            </div>
            <div className="flex justify-between mt-0.5 text-[10px] text-slate-500">
              <span>Low Fatigue</span>
              <span>45% FI</span>
              <span>High Fatigue</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metabolic Rate Tab
const MetabolicTab: React.FC<{ data: PhysiologicalData }> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  return (
    <div id="tab-metabolic-container" className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Basal Metabolic Rate</span>
          <p className="text-2xl font-black text-white mt-1">{data.metabolicRate.bmr}</p>
          <span className="text-xs text-slate-500">kcal/day</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Respiratory Quotient</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{data.metabolicRate.rq}</p>
          <span className="text-xs text-slate-500">VCO2 / VO2</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Fat Oxidation</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{data.metabolicRate.fatOxidation}</p>
          <span className="text-xs text-slate-500">g/min</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Carb Oxidation</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">{data.metabolicRate.carbohydrateOxidation}</p>
          <span className="text-xs text-slate-500">g/min</span>
        </div>
      </div>

      {/* Substrate Utilization */}
      <div id="substrate-utilization-viz" className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Substrate Utilization</span>
          <div className="flex gap-1.5">
            {(["24h", "7d", "30d"] as const).map(range => (
              <button
                id={`btn-range-${range}`}
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === range
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-32 flex items-end justify-between gap-1">
          {Array.from({ length: 24 }).map((_, idx) => {
            const fat = 30 + Math.sin(idx * 0.3) * 15 + Math.random() * 5;
            const carb = 50 - Math.sin(idx * 0.3) * 15 + Math.random() * 5;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                <div 
                  className="w-full bg-emerald-500/80 rounded-t"
                  style={{ height: `${fat}%` }}
                />
                <div 
                  className="w-full bg-amber-500/80 rounded-t"
                  style={{ height: `${carb}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Fat Oxidation
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Carbohydrate Oxidation
          </span>
        </div>
      </div>

      {/* Metabolic Health Score */}
      <div id="metabolic-health-score-box" className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/30 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Metabolic Health Score</h4>
              <p className="text-xs text-slate-400">Based on RQ, BMR, and substrate utilization</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400">87</span>
            <span className="text-xs text-slate-500">/100</span>
            <div className="text-[10px] text-emerald-400 font-bold">Optimal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export function PhysiologySuite({ 
  onBackToLanding,
  patientId = "PAT-1001",
  patientName = "Rajesh Kumar",
  onExportData
}: PhysiologySuiteProps): React.ReactElement {
  const [activeFeatureTab, setActiveFeatureTab] = useState<"main" | "monitor" | "analytics" | "progress" | "comparison">("main");
  const [activeSubTab, setActiveSubTab] = useState<"cardiopulmonary" | "biomechanics" | "electrophysiology" | "metabolic">("cardiopulmonary");
  const [vo2TestRunning, setVo2TestRunning] = useState(false);
  const [vo2Result, setVo2Result] = useState<string | null>(null);
  const [physiologicalData, setPhysiologicalData] = useState<PhysiologicalData>(MOCK_PHYSIOLOGICAL_DATA);
  const [cpetData] = useState<CPETDataPoint[]>(MOCK_CPET_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSimulateVo2 = useCallback(() => {
    setVo2TestRunning(true);
    setVo2Result(null);
    
    setTimeout(() => {
      const vo2Value = 38 + Math.random() * 12;
      const percentile = Math.floor(70 + Math.random() * 25);
      const at = 150 + Math.floor(Math.random() * 20);
      const rq = 0.95 + Math.random() * 0.15;
      
      setVo2Result(
        `VO2 Max Simulated Result: ${vo2Value.toFixed(1)} mL/kg/min (${percentile}th percentile for age 35). ` +
        `Anaerobic Threshold (AT) reached at HR ${at} bpm. ` +
        `Respiratory Quotient (RQ): ${rq.toFixed(2)}.`
      );
      setVo2TestRunning(false);
      
      setPhysiologicalData(prev => ({
        ...prev,
        vo2Max: vo2Value,
        vt1: at - 10,
        vt2: at + 15,
        rq: rq
      }));
    }, 1200);
  }, []);

  const handleRefreshData = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setPhysiologicalData(prev => ({
        ...prev,
        vo2Max: 40 + Math.random() * 8,
        hrRest: 55 + Math.floor(Math.random() * 10),
        gaitCadence: 110 + Math.floor(Math.random() * 10),
        gaitAsymmetry: 0.8 + Math.random() * 1.5
      }));
      setIsRefreshing(false);
    }, 800);
  }, []);

  const handleExportData = useCallback(() => {
    const exportData = {
      patient: { id: patientId, name: patientName },
      timestamp: new Date().toISOString(),
      physiologicalData,
      cpetData: cpetData.slice(-10)
    };
    
    if (onExportData) {
      onExportData(exportData);
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `physiology_data_${patientId}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [patientId, patientName, physiologicalData, cpetData, onExportData]);

  const renderContent = useMemo(() => {
    switch (activeSubTab) {
      case "cardiopulmonary":
        return (
          <CardiopulmonaryTab
            data={cpetData}
            vo2Result={vo2Result}
            onRunTest={handleSimulateVo2}
            isRunning={vo2TestRunning}
          />
        );
      case "biomechanics":
        return <BiomechanicsTab data={physiologicalData} />;
      case "electrophysiology":
        return <EMGTab data={physiologicalData} />;
      case "metabolic":
        return <MetabolicTab data={physiologicalData} />;
      default:
        return null;
    }
  }, [activeSubTab, cpetData, vo2Result, handleSimulateVo2, vo2TestRunning, physiologicalData]);

  return (
    <div id="physiology-suite-container" className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* HEADER */}
      <header id="physiology-suite-header" className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            id="btn-back-to-portal"
            type="button"
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
                  v2.8
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400">
                Cardiopulmonary Exercise Testing (CPET), EMG Muscle Activation & Biomechanical Gait Analysis
              </p>
            </div>
          </div>
        </div>

        {/* Feature Tab Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 flex-wrap">
          <button
            id="feature-tab-main"
            type="button"
            onClick={() => setActiveFeatureTab("main")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFeatureTab === "main"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Main Suite
          </button>
          <button
            id="feature-tab-monitor"
            type="button"
            onClick={() => setActiveFeatureTab("monitor")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFeatureTab === "monitor"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Real-Time Monitor</span>
          </button>
          <button
            id="feature-tab-analytics"
            type="button"
            onClick={() => setActiveFeatureTab("analytics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFeatureTab === "analytics"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Analytics</span>
          </button>
          <button
            id="feature-tab-progress"
            type="button"
            onClick={() => setActiveFeatureTab("progress")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFeatureTab === "progress"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            <span>Progress</span>
          </button>
          <button
            id="feature-tab-comparison"
            type="button"
            onClick={() => setActiveFeatureTab("comparison")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFeatureTab === "comparison"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Comparison</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-refresh-phys-data"
            type="button"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            id="btn-export-phys-data"
            type="button"
            onClick={handleExportData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-emerald-400">
            {patientName} • {patientId}
          </div>
        </div>
      </header>

      {/* SUB TABS (Only visible when activeFeatureTab === 'main') */}
      {activeFeatureTab === "main" && (
        <div id="physiology-sub-tabs" className="bg-slate-950 border-b border-slate-800 px-6 py-2.5 flex items-center gap-3 overflow-x-auto">
          <button
            id="tab-btn-cardiopulmonary"
            type="button"
            onClick={() => setActiveSubTab("cardiopulmonary")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === "cardiopulmonary"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <HeartPulse className="h-4 w-4" />
            <span>Cardiopulmonary (CPET)</span>
          </button>
          <button
            id="tab-btn-biomechanics"
            type="button"
            onClick={() => setActiveSubTab("biomechanics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === "biomechanics"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Dumbbell className="h-4 w-4" />
            <span>Biomechanics & Gait</span>
          </button>
          <button
            id="tab-btn-electrophysiology"
            type="button"
            onClick={() => setActiveSubTab("electrophysiology")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === "electrophysiology"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>EMG & Nerve Conduction</span>
          </button>
          <button
            id="tab-btn-metabolic"
            type="button"
            onClick={() => setActiveSubTab("metabolic")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === "metabolic"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>Metabolic Rate (BMR & RQ)</span>
          </button>
        </div>
      )}

      {/* CONTENT BODY */}
      <div id="physiology-content-body" className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {activeFeatureTab === "main" && renderContent}
        
        {activeFeatureTab === "monitor" && (
          <RealTimeMonitor
            patientId={patientId}
          />
        )}
        
        {activeFeatureTab === "analytics" && (
          <AnalyticsDashboard
            patientId={patientId}
            patientName={patientName}
            data={physiologicalData}
            onExport={(format) => {
              if (format === "json") {
                handleExportData();
              } else {
                const reportContent = `Physiology ${format.toUpperCase()} Report\nPatient: ${patientName} (${patientId})\nDate: ${new Date().toISOString()}`;
                const blob = new Blob([reportContent], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `physiology_report_${patientId}.${format}`;
                a.click();
                URL.revokeObjectURL(url);
              }
            }}
          />
        )}
        
        {activeFeatureTab === "progress" && (
          <ProgressTracker
            patientId={patientId}
            patientName={patientName}
            data={[
              { date: "2026-06-01", vo2Max: 38.5, hrRest: 62, vt1: 135, powerOutput: 195, weight: 82, bodyFat: 18, muscleMass: 42 },
              { date: "2026-06-15", vo2Max: 40.2, hrRest: 60, vt1: 138, powerOutput: 205, weight: 81, bodyFat: 17.5, muscleMass: 42.5 },
              { date: "2026-07-01", vo2Max: 42.8, hrRest: 58, vt1: 142, powerOutput: 220, weight: 80, bodyFat: 17, muscleMass: 43 },
              { date: "2026-07-15", vo2Max: 44.2, hrRest: 58, vt1: 142, powerOutput: 220, weight: 80, bodyFat: 17, muscleMass: 43 }
            ]}
          />
        )}
        
        {activeFeatureTab === "comparison" && (
          <PatientComparison
            patientId={patientId}
            patientName={patientName}
            patientData={physiologicalData}
          />
        )}
      </div>
    </div>
  );
}

export default PhysiologySuite;
