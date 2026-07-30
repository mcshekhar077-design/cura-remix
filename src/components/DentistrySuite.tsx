import React, { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  Calendar, 
  Download, 
  Camera, 
  Stethoscope,
  Smile,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";

interface DentistrySuiteProps {
  onBackToLanding: () => void;
}

export function DentistrySuite({ onBackToLanding }: DentistrySuiteProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(18); // Tooth #18 (Upper Right First Molar)
  const [activeTab, setActiveTab] = useState<"odontogram" | "radiograph" | "periodontal" | "treatment">("odontogram");
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Sample dental teeth data
  const teethData = Array.from({ length: 32 }, (_, i) => {
    const toothNumber = i + 1;
    let status = "Healthy";
    let condition = "Normal enamel & dentin";
    if ([3, 14, 19, 30].includes(toothNumber)) {
      status = "Caries";
      condition = "Class II Occlusal Caries (D1 Depth)";
    } else if ([18, 31].includes(toothNumber)) {
      status = "Restored";
      condition = "Amalgam Filling (Good margin)";
    } else if ([1, 16, 17, 32].includes(toothNumber)) {
      status = "Impacted";
      condition = "Mesioangular Third Molar Impaction";
    }
    return { toothNumber, status, condition };
  });

  const handleRunAiCariesDetect = () => {
    setAiAnalysisRunning(true);
    setAiResult(null);
    setTimeout(() => {
      setAiAnalysisRunning(false);
      setAiResult("AI Radiographic Scan Detected: 1.2mm enamel demineralization on Tooth #14 Distal Surface. Recommended: Fluoride Varnish & Sealant or Conservative Composite Restoration.");
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
            <div className="p-3 bg-gradient-to-tr from-cyan-600 to-sky-500 rounded-2xl text-white shadow-lg shadow-cyan-950/50">
              <Smile className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">CURA Dental & Oral Health AI Suite</h1>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Dentistry v3.2
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400">
                3D Odontogram, AI Radiograph Cavity Detection & Periodontal Charting
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAiCariesDetect}
            disabled={aiAnalysisRunning}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 animate-pulse text-cyan-200" />
            <span>{aiAnalysisRunning ? "Analyzing X-Ray..." : "Run AI Caries Scanner"}</span>
          </button>
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-cyan-400">
            Dentist ID: DEN-DEL-9082
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-2.5 flex items-center gap-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("odontogram")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "odontogram"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Smile className="h-4 w-4" />
          <span>Interactive Odontogram</span>
        </button>
        <button
          onClick={() => setActiveTab("radiograph")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "radiograph"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>AI X-Ray & Radiograph Analysis</span>
        </button>
        <button
          onClick={() => setActiveTab("periodontal")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "periodontal"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Periodontal Charting</span>
        </button>
        <button
          onClick={() => setActiveTab("treatment")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "treatment"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Treatment Plan & Costing</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {aiResult && (
          <div className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold leading-relaxed">{aiResult}</span>
            </div>
            <button
              onClick={() => setAiResult(null)}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ODONTOGRAM TAB */}
        {activeTab === "odontogram" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ODONTOGRAM GRAPHICAL VIEW */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">
                    Full Mouth Odontogram (Universal Numbering 1 - 32)
                  </h2>
                  <p className="text-xs text-slate-400">Click any tooth to inspect surface details, restoration status & caries depth.</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500"></span> Healthy</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-rose-500"></span> Caries</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500"></span> Restored</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-purple-500"></span> Impacted</span>
                </div>
              </div>

              {/* UPPER ARCH */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider block">Maxillary Arch (Upper Teeth 1-16)</span>
                <div className="grid grid-cols-16 gap-1 sm:gap-2">
                  {teethData.slice(0, 16).map((t) => (
                    <button
                      key={t.toothNumber}
                      onClick={() => setSelectedTooth(t.toothNumber)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        selectedTooth === t.toothNumber
                          ? "ring-2 ring-cyan-400 bg-cyan-950/80 border-cyan-400"
                          : t.status === "Caries"
                          ? "bg-rose-950/50 border-rose-700/60 text-rose-300"
                          : t.status === "Restored"
                          ? "bg-amber-950/50 border-amber-700/60 text-amber-300"
                          : t.status === "Impacted"
                          ? "bg-purple-950/50 border-purple-700/60 text-purple-300"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-[10px] font-black">#{t.toothNumber}</span>
                      <span className="text-[8px] font-mono opacity-80 mt-1">{t.status.slice(0, 3)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* LOWER ARCH */}
              <div className="space-y-2 pt-4 border-t border-slate-800/80">
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider block">Mandibular Arch (Lower Teeth 17-32)</span>
                <div className="grid grid-cols-16 gap-1 sm:gap-2">
                  {teethData.slice(16, 32).map((t) => (
                    <button
                      key={t.toothNumber}
                      onClick={() => setSelectedTooth(t.toothNumber)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        selectedTooth === t.toothNumber
                          ? "ring-2 ring-cyan-400 bg-cyan-950/80 border-cyan-400"
                          : t.status === "Caries"
                          ? "bg-rose-950/50 border-rose-700/60 text-rose-300"
                          : t.status === "Restored"
                          ? "bg-amber-950/50 border-amber-700/60 text-amber-300"
                          : t.status === "Impacted"
                          ? "bg-purple-950/50 border-purple-700/60 text-purple-300"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-[10px] font-black">#{t.toothNumber}</span>
                      <span className="text-[8px] font-mono opacity-80 mt-1">{t.status.slice(0, 3)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CLINICAL SUMMARY GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Decayed (D)</span>
                  <span className="text-lg font-black text-rose-400">4 Teeth</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Missing (M)</span>
                  <span className="text-lg font-black text-slate-400">0 Teeth</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Filled (F)</span>
                  <span className="text-lg font-black text-amber-400">2 Teeth</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">DMFT Index</span>
                  <span className="text-lg font-black text-cyan-400">6 (Moderate)</span>
                </div>
              </div>
            </div>

            {/* SELECTED TOOTH INSPECTOR */}
            <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Smile className="h-4 w-4 text-cyan-400" /> Tooth Inspector
                </h3>
                <span className="bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg">
                  Tooth #{selectedTooth}
                </span>
              </div>

              {selectedTooth ? (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold">Status:</span>
                      <span className="font-extrabold text-cyan-300">
                        {teethData.find(t => t.toothNumber === selectedTooth)?.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold">Diagnosis:</span>
                      <span className="font-semibold text-slate-200">
                        {teethData.find(t => t.toothNumber === selectedTooth)?.condition}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Surface Charting</label>
                    <div className="grid grid-cols-3 gap-2 text-center font-mono font-bold text-[11px]">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300">Occlusal (O)</div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300">Mesial (M)</div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300">Distal (D)</div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300">Buccal (B)</div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300">Lingual (L)</div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300">Cervical (C)</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Recommended Procedure</label>
                    <div className="bg-cyan-950/40 border border-cyan-800/60 p-3 rounded-2xl text-cyan-200 font-medium">
                      Composite Resin Restoration (Shade A2) + Fluoride Sealant application. Est. Duration: 30 Mins.
                    </div>
                  </div>

                  <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-xl shadow-lg transition-all text-xs cursor-pointer">
                    Add to Active Treatment Plan
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Select any tooth on the odontogram to inspect condition.
                </div>
              )}
            </div>
          </div>
        )}

        {/* RADIOGRAPH & OTHER TABS PLACEHOLDER CARDS */}
        {activeTab !== "odontogram" && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
            <div className="p-4 bg-cyan-950 text-cyan-400 rounded-full w-fit mx-auto border border-cyan-800">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-base font-black text-white">
              {activeTab === "radiograph" ? "AI Dental Radiograph Analyzer" : activeTab === "periodontal" ? "Periodontal Pocket Charting & PSR" : "Comprehensive Dental Treatment Plan & Estimator"}
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Automated AI diagnostic scanner initialized. Integrated with sensor PACS DICOM feeds for real-time cavity, periapical lesion, and bone loss detection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DentistrySuite;
