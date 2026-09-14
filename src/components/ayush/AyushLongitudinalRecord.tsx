import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Activity,
  Calendar,
  Shield,
  Heart,
  FileText,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  User,
  Clock,
  Sparkles,
  Lock,
  Eye
} from "lucide-react";
import { LongitudinalTimelineEntry } from "./AyushTypes";

interface AyushLongitudinalRecordProps {
  onNavigateToAllopathic?: () => void;
}

export function AyushLongitudinalRecord({ onNavigateToAllopathic }: AyushLongitudinalRecordProps) {
  const [timeline, setTimeline] = useState<LongitudinalTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState({
    patientId: "PAT-8841-CURA",
    patientName: "Rajesh Kumar",
    age: 48,
    gender: "Male",
    abhaId: "14-8841-3320-1102"
  });

  // Consent Ledger Toggles
  const [shareAyushWithAllopathy, setShareAyushWithAllopathy] = useState(true);
  const [shareAllopathyWithAyush, setShareAllopathyWithAyush] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<LongitudinalTimelineEntry | null>(null);

  useEffect(() => {
    async function loadTimeline() {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/ayush/patient-timeline/PAT-8841-CURA");
        const data = await res.json();
        if (data.success && data.timeline) {
          setTimeline(data.timeline);
          setPatientInfo({
            patientId: data.patientId,
            patientName: data.patientName,
            age: data.age,
            gender: data.gender,
            abhaId: data.abhaId
          });
          if (data.timeline.length > 0) {
            setSelectedEntry(data.timeline[data.timeline.length - 1]);
          }
        }
      } catch (err) {
        console.error("Error loading longitudinal timeline:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, []);

  return (
    <div className="space-y-8">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 text-xs font-black px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Longitudinal Cross-System Health Record
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> ABDM Consent Framework Compliant
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-black tracking-tight">
            Allopathy &harr; AYUSH Integrated Patient Health Record
          </h2>
          <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed font-normal">
            Eliminating medical silos with a continuous cross-disciplinary health trajectory. 
            Allopathic cardiology, pathology investigations, Ayurvedic Panchakarma, and Yoga therapies coexist in one unified patient record under cryptographic citizen consent.
          </p>
        </div>
      </div>

      {/* PATIENT HEADER & CONSENT LEDGER BAR */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
              {patientInfo.patientName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">{patientInfo.patientName}</h3>
                <span className="text-xs text-slate-500 font-semibold">
                  ({patientInfo.age} Y / {patientInfo.gender})
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                ABHA ID: <strong className="text-slate-800">{patientInfo.abhaId}</strong> &bull; MRN: {patientInfo.patientId}
              </p>
            </div>
          </div>

          {onNavigateToAllopathic && (
            <button
              onClick={onNavigateToAllopathic}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md shadow-blue-700/20"
            >
              <span>Switch to Allopathic Doctor Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* CONSENT LEDGER TOGGLES */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="font-black text-slate-800 uppercase text-[10px] tracking-wider">
              ABDM Digital Consent Status:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shareAyushWithAllopathy}
                onChange={e => setShareAyushWithAllopathy(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-0 cursor-pointer"
              />
              <span className="font-bold text-slate-700">
                Share AYUSH Prescriptions with Allopathic Team
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shareAllopathyWithAyush}
                onChange={e => setShareAllopathyWithAyush(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-0 cursor-pointer"
              />
              <span className="font-bold text-slate-700">
                Allow AYUSH Vaidya to Read Allopathic Lab & Rx History
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* TIMELINE VISUALIZER & DETAIL CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TIMELINE COLUMN */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Longitudinal Cross-System Timeline ({timeline.length} Milestones)
          </h3>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedEntry(item)}
                className={`relative group cursor-pointer transition p-4 rounded-2xl border ${
                  selectedEntry?.id === item.id
                    ? "border-blue-600 bg-blue-50/40 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                {/* TIMELINE DOT */}
                <div className={`absolute -left-[31px] top-5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  item.system === "Allopathy" ? "bg-blue-600" :
                  item.system === "Diagnostics" ? "bg-amber-500" :
                  item.system === "Ayurveda" ? "bg-emerald-600" :
                  item.system === "Yoga & Naturopathy" ? "bg-rose-500" : "bg-purple-600"
                }`} />

                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div className="space-y-0.5">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.system === "Allopathy" ? "bg-blue-100 text-blue-800" :
                      item.system === "Diagnostics" ? "bg-amber-100 text-amber-800" :
                      item.system === "Ayurveda" ? "bg-emerald-100 text-emerald-800" :
                      item.system === "Yoga & Naturopathy" ? "bg-rose-100 text-rose-800" : "bg-purple-100 text-purple-800"
                    }`}>
                      {item.system} &bull; {item.type}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 pt-1">{item.facility}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{item.doctor}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {item.date}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {item.summary}
                </p>

                {item.medications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {item.medications.map((med, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        💊 {med}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SELECTED RECORD DETAIL INSPECTOR */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
          {selectedEntry ? (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block">
                  Encounter Artifact Inspector
                </span>
                <h4 className="text-base font-black text-slate-900">{selectedEntry.type}</h4>
                <p className="text-xs text-slate-500 font-semibold">{selectedEntry.facility}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase">Consulting Specialist</span>
                <p className="font-bold text-slate-800">{selectedEntry.doctor}</p>
                <p className="text-[11px] text-slate-500 font-mono">Date: {selectedEntry.date}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase block">Clinical Metrics & Biomarkers</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedEntry.metrics).map(([k, v]) => (
                    <div key={k} className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">{k}</span>
                      <strong className="text-slate-800 font-mono">{String(v)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase block">Active Medications & Therapies</span>
                <ul className="space-y-1 text-slate-700">
                  {selectedEntry.medications.map((med, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-bold">
                      <span className="text-blue-600">&bull;</span> {med}
                    </li>
                  ))}
                  {selectedEntry.medications.length === 0 && (
                    <span className="text-slate-400 italic">No new pharmacological agent initiated</span>
                  )}
                </ul>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1">
                <span className="text-[10px] font-black text-emerald-800 uppercase block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cross-System Reconciliation Status
                </span>
                <p className="text-[11px] font-semibold">
                  Synchronized with ABDM NRCES FHIR R4 Bundle. Verified against both Allopathic and AYUSH clinical registries.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">
              Select an encounter from the timeline to view clinical artifacts and biometric parameters.
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition cursor-pointer"
            >
              Export FHIR R4 Longitudinal Care Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
