import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export interface ComparisonData {
  metric: string;
  patientValue: number;
  normValue: number;
  percentile: number;
  category: "excellent" | "good" | "average" | "below_average" | "poor";
}

export interface PatientComparisonProps {
  patientId: string;
  patientName: string;
  patientData?: any;
  onSelectPatient?: (patientId: string) => void;
}

export const PatientComparison: React.FC<PatientComparisonProps> = ({
  patientName
}) => {
  const [selectedPatientGroup, setSelectedPatientGroup] = useState<"same_age" | "same_gender" | "athletes">("same_age");
  const [expanded, setExpanded] = useState(false);

  const comparisonData: ComparisonData[] = [
    { metric: "VO2 Max", patientValue: 44.2, normValue: 38.5, percentile: 88, category: "excellent" },
    { metric: "HR Rest", patientValue: 58, normValue: 65, percentile: 72, category: "good" },
    { metric: "VT1 (Zone 2)", patientValue: 142, normValue: 135, percentile: 65, category: "good" },
    { metric: "Power Output", patientValue: 220, normValue: 195, percentile: 81, category: "excellent" },
    { metric: "Recovery HR Drop", patientValue: 28, normValue: 35, percentile: 59, category: "average" },
    { metric: "Respiratory Rate", patientValue: 14, normValue: 16, percentile: 44, category: "average" }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "excellent": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "good": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
      case "average": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "below_average": return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "poor": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  return (
    <div id="patient-comparison-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            Patient Comparison & Population Normative Data
          </h3>
          <p className="text-xs text-slate-400">
            Compare {patientName}&apos;s metrics against population reference cohorts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: "same_age", label: "Same Age" },
              { id: "same_gender", label: "Same Gender" },
              { id: "athletes", label: "Athletes" }
            ].map(group => (
              <button
                id={`btn-cohort-${group.id}`}
                key={group.id}
                type="button"
                onClick={() => setSelectedPatientGroup(group.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPatientGroup === group.id
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comparisonData.map((item) => (
          <div
            key={item.metric}
            className={`bg-slate-950 p-4 rounded-2xl border transition-all ${
              expanded ? "border-emerald-500/30" : "border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">{item.metric}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(item.category)}`}>
                {item.category.replace("_", " ")}
              </span>
            </div>
            
            <div className="flex items-end gap-4 mt-2">
              <div>
                <p className="text-2xl font-black text-white">{item.patientValue}</p>
                <span className="text-[10px] text-slate-500">Patient</span>
              </div>
              <div className="text-slate-500 text-xs">vs</div>
              <div>
                <p className="text-2xl font-black text-slate-400">{item.normValue}</p>
                <span className="text-[10px] text-slate-500">Norm</span>
              </div>
              <div className="ml-auto text-right">
                <span className="text-sm font-black text-emerald-400">{item.percentile}th</span>
                <span className="text-[10px] text-slate-500 block">Percentile</span>
              </div>
            </div>

            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  item.percentile > 75 ? "bg-emerald-500" :
                  item.percentile > 50 ? "bg-cyan-500" :
                  item.percentile > 25 ? "bg-amber-500" :
                  "bg-rose-500"
                }`}
                style={{ width: `${item.percentile}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {expanded && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Comparative Clinical Summary</h4>
              <p className="text-xs text-slate-300">
                {patientName} is performing in the top {Math.round(comparisonData.reduce((acc, item) => acc + item.percentile, 0) / comparisonData.length)}% 
                cohort percentile compared to {selectedPatientGroup === "same_age" ? "same age group" : 
                              selectedPatientGroup === "same_gender" ? "same gender group" : 
                              "athletes"}.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {comparisonData.filter(d => d.category === "excellent" || d.category === "good").length} Above Average
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  {comparisonData.filter(d => d.category === "average").length} Average
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  {comparisonData.filter(d => d.category === "below_average" || d.category === "poor").length} Below Average
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Details */}
      <button
        id="btn-toggle-comparison-details"
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        {expanded ? (
          <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
        ) : (
          <>Show Detailed Comparison <ChevronDown className="h-3.5 w-3.5" /></>
        )}
      </button>
    </div>
  );
};
