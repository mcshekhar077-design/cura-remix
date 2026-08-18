import React, { useState, useMemo } from "react";
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  CheckCircle2
} from "lucide-react";

export interface ProgressData {
  date: string;
  vo2Max: number;
  hrRest: number;
  vt1: number;
  powerOutput: number;
  weight: number;
  bodyFat: number;
  muscleMass: number;
}

export interface ProgressTrackerProps {
  patientId: string;
  patientName: string;
  data: ProgressData[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  patientName,
  data
}) => {
  const [selectedMetric, setSelectedMetric] = useState<"vo2Max" | "hrRest" | "vt1" | "powerOutput">("vo2Max");

  // Calculate progress percentage
  const progress = useMemo(() => {
    if (data.length < 2) return null;
    
    const first = data[0];
    const last = data[data.length - 1];
    
    return {
      vo2Max: ((last.vo2Max - first.vo2Max) / first.vo2Max * 100),
      hrRest: ((first.hrRest - last.hrRest) / first.hrRest * 100),
      vt1: ((last.vt1 - first.vt1) / first.vt1 * 100),
      powerOutput: ((last.powerOutput - first.powerOutput) / first.powerOutput * 100)
    };
  }, [data]);

  // Milestones & Achievements
  const achievements = [
    { id: 1, name: "VO2 Max > 40 mL/kg/min", achieved: true, date: "2026-07-15" },
    { id: 2, name: "Resting HR < 60 bpm", achieved: true, date: "2026-07-10" },
    { id: 3, name: "Ventilatory Threshold 1 > 145 bpm", achieved: false, target: "2026-08-20" },
    { id: 4, name: "Peak Power Output > 250W", achieved: false, target: "2026-09-01" }
  ];

  return (
    <div id="progress-tracker-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <LineChart className="h-5 w-5 text-emerald-400" />
            Progress Tracking & Longitudinal Milestones
          </h3>
          <p className="text-xs text-slate-400">
            {data.length} recorded physiological sessions for {patientName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            id="select-progress-metric"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
            aria-label="Select progress metric"
          >
            <option value="vo2Max">VO2 Max</option>
            <option value="hrRest">Resting HR</option>
            <option value="vt1">VT1</option>
            <option value="powerOutput">Power Output</option>
          </select>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase">
            {selectedMetric.replace(/([A-Z])/g, " $1")} Progression
          </span>
          {progress && (
            <span className={`text-xs font-bold flex items-center gap-1 ${
              progress[selectedMetric] > 0 ? "text-emerald-400" : "text-rose-400"
            }`}>
              {progress[selectedMetric] > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {Math.abs(progress[selectedMetric]).toFixed(1)}% change
            </span>
          )}
        </div>
        <div className="h-40 flex items-end justify-between gap-1">
          {data.map((point, idx) => {
            const values = {
              vo2Max: point.vo2Max,
              hrRest: 100 - point.hrRest,
              vt1: point.vt1,
              powerOutput: point.powerOutput / 3
            };
            const value = values[selectedMetric];
            const max = selectedMetric === "vo2Max" ? 60 : 
                        selectedMetric === "hrRest" ? 50 :
                        selectedMetric === "vt1" ? 200 : 100;
            const height = Math.min((value / max) * 100, 100);
            const isMax = idx === data.length - 1;
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div 
                  className={`w-full rounded-t transition-all ${
                    isMax ? "bg-gradient-to-t from-emerald-500 to-teal-400" : "bg-emerald-500/60"
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[8px] font-mono text-slate-500">
                  {new Date(point.date).getDate()}d
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-500">
          <span>{data.length > 0 ? new Date(data[0].date).toLocaleDateString() : "--"}</span>
          <span>{data.length > 0 ? new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString() : "--"}</span>
          <span>{data.length > 0 ? new Date(data[data.length - 1].date).toLocaleDateString() : "--"}</span>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-amber-400" />
            Achievements & Clinical Milestones
          </span>
          <span className="text-xs text-slate-500">
            {achievements.filter(a => a.achieved).length}/{achievements.length} Completed
          </span>
        </div>
        <div className="space-y-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                achievement.achieved
                  ? "bg-emerald-950/30 border-emerald-500/30"
                  : "bg-slate-900/50 border-slate-800"
              }`}
            >
              {achievement.achieved ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <Target className="h-5 w-5 text-slate-500 shrink-0" />
              )}
              <div className="flex-1">
                <span className={`text-xs font-bold ${achievement.achieved ? "text-white" : "text-slate-400"}`}>
                  {achievement.name}
                </span>
                {achievement.achieved ? (
                  <span className="text-[10px] text-emerald-400 block">
                    Achieved on {new Date(achievement.date!).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 block">
                    Target: {achievement.target}
                  </span>
                )}
              </div>
              {!achievement.achieved && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-500/20">
                  In Progress
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
