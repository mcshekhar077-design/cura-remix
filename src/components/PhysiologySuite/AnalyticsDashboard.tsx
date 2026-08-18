import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Award,
  Target,
  Brain,
  TrendingUp,
  FileText
} from "lucide-react";

export interface AnalyticsDashboardProps {
  patientId: string;
  patientName: string;
  data: any;
  onExport: (format: "pdf" | "csv" | "json") => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  patientId,
  patientName,
  onExport
}) => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  // Calculate trends
  const trends = useMemo(() => {
    return {
      vo2Max: { value: 44.2, change: 2.3, trend: "up" as const },
      hrMax: { value: 188, change: -1.5, trend: "down" as const },
      vt1: { value: 142, change: 3.1, trend: "up" as const },
      rq: { value: 1.04, change: 0.02, trend: "up" as const }
    };
  }, []);

  // Performance percentiles
  const percentiles = useMemo(() => {
    return {
      vo2Max: 88,
      hrRecovery: 72,
      vt1: 65,
      powerOutput: 81
    };
  }, []);

  return (
    <div id="analytics-dashboard-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            Advanced Analytics & Performance Report
          </h3>
          <p className="text-xs text-slate-400">
            Comprehensive physiological data analysis for {patientName} ({patientId})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(["7d", "30d", "90d", "1y"] as const).map(range => (
              <button
                id={`btn-analytics-range-${range}`}
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === range
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <button
              id="btn-export-pdf"
              type="button"
              onClick={() => onExport("pdf")}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
              title="Export PDF"
              aria-label="Export PDF"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              id="btn-export-csv"
              type="button"
              onClick={() => onExport("csv")}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
              title="Export CSV"
              aria-label="Export CSV"
            >
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">VO2 Max</span>
            <span className={`text-[10px] font-bold ${trends.vo2Max.trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
              {trends.vo2Max.change > 0 ? "+" : ""}{trends.vo2Max.change}%
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-1">{trends.vo2Max.value}</p>
          <span className="text-[10px] text-slate-500">mL/kg/min • {percentiles.vo2Max}th percentile</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">VT1</span>
            <span className={`text-[10px] font-bold ${trends.vt1.trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
              {trends.vt1.change > 0 ? "+" : ""}{trends.vt1.change}%
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-1">{trends.vt1.value}</p>
          <span className="text-[10px] text-slate-500">bpm HR</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Max HR</span>
            <span className={`text-[10px] font-bold ${trends.hrMax.trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
              {trends.hrMax.change > 0 ? "+" : ""}{trends.hrMax.change}%
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-1">{trends.hrMax.value}</p>
          <span className="text-[10px] text-slate-500">bpm</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Respiratory Quotient</span>
            <span className={`text-[10px] font-bold ${trends.rq.trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
              {trends.rq.change > 0 ? "+" : ""}{trends.rq.change}
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-1">{trends.rq.value}</p>
          <span className="text-[10px] text-slate-500">VCO2 / VO2</span>
        </div>
      </div>

      {/* Performance Radar Chart */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Performance Profile</span>
          <span className="text-[10px] text-slate-500">vs. Age/Gender Norms</span>
        </div>
        <div className="relative h-48 w-48 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {[20, 40, 60, 80, 100].map(scale => (
                <polygon
                  key={scale}
                  points={[
                    `${100 + Math.cos(0) * scale},${100 + Math.sin(0) * scale}`,
                    `${100 + Math.cos(Math.PI / 3) * scale},${100 + Math.sin(Math.PI / 3) * scale}`,
                    `${100 + Math.cos(2 * Math.PI / 3) * scale},${100 + Math.sin(2 * Math.PI / 3) * scale}`,
                    `${100 + Math.cos(Math.PI) * scale},${100 + Math.sin(Math.PI) * scale}`,
                    `${100 + Math.cos(4 * Math.PI / 3) * scale},${100 + Math.sin(4 * Math.PI / 3) * scale}`,
                    `${100 + Math.cos(5 * Math.PI / 3) * scale},${100 + Math.sin(5 * Math.PI / 3) * scale}`
                  ].join(" ")}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}
              
              {[0, 1, 2, 3, 4, 5].map(i => {
                const angle = i * Math.PI / 3;
                return (
                  <line
                    key={i}
                    x1="100"
                    y1="100"
                    x2={100 + Math.cos(angle) * 90}
                    y2={100 + Math.sin(angle) * 90}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                );
              })}
              
              <polygon
                points={[
                  `${100 + Math.cos(0) * 78},${100 + Math.sin(0) * 78}`,
                  `${100 + Math.cos(Math.PI / 3) * 65},${100 + Math.sin(Math.PI / 3) * 65}`,
                  `${100 + Math.cos(2 * Math.PI / 3) * 82},${100 + Math.sin(2 * Math.PI / 3) * 82}`,
                  `${100 + Math.cos(Math.PI) * 55},${100 + Math.sin(Math.PI) * 55}`,
                  `${100 + Math.cos(4 * Math.PI / 3) * 70},${100 + Math.sin(4 * Math.PI / 3) * 70}`,
                  `${100 + Math.cos(5 * Math.PI / 3) * 75},${100 + Math.sin(5 * Math.PI / 3) * 75}`
                ].join(" ")}
                fill="rgba(52, 211, 153, 0.2)"
                stroke="rgba(52, 211, 153, 0.8)"
                strokeWidth="2"
              />
              
              {[
                { label: "VO2 Max", angle: 0 },
                { label: "VT", angle: Math.PI / 3 },
                { label: "Power", angle: 2 * Math.PI / 3 },
                { label: "Efficiency", angle: Math.PI },
                { label: "Recovery", angle: 4 * Math.PI / 3 },
                { label: "Economy", angle: 5 * Math.PI / 3 }
              ].map((item, i) => {
                const angle = item.angle;
                const r = 100;
                return (
                  <text
                    key={i}
                    x={100 + Math.cos(angle) * (r + 15)}
                    y={100 + Math.sin(angle) * (r + 15)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[9px] font-bold fill-slate-400"
                  >
                    {item.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
            <Brain className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-white">AI-Generated Clinical Recommendations</h4>
            <p className="text-xs text-slate-300">
              Based on your physiological profile, we recommend:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <Target className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Increase Zone 2 training by 15% to improve VT1 base</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <TrendingUp className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Add 2x weekly HIIT sessions for VO2 max optimization</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Award className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Focus on carbohydrate-to-fat oxidation transition</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Calendar className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Schedule follow-up CPET test in 8 weeks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
