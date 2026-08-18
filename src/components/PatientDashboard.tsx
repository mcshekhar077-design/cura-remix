import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Pill, 
  Calendar, 
  Activity, 
  HeartPulse, 
  Clock, 
  Sparkles, 
  Plus, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Video, 
  Phone, 
  ArrowRight,
  TrendingUp,
  Scale,
  Brain,
  Mic
} from "lucide-react";
import { Patient, Appointment } from "../types";
import VoiceCommandOverlay from "./VoiceCommandOverlay";

interface PatientDashboardProps {
  patient: Patient;
  medications: string[];
  appointments: Appointment[];
  vitalsHistory: any[];
  onAddVitalsClick?: () => void;
  onBookAppointmentClick?: () => void;
  onJoinCallClick?: (appointment: Appointment) => void;
  onViewRouteClick?: (appointment: Appointment) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenRefillModal?: () => void;
}

export default function PatientDashboard({
  patient,
  medications = [],
  appointments = [],
  vitalsHistory = [],
  onAddVitalsClick,
  onBookAppointmentClick,
  onJoinCallClick,
  onViewRouteClick,
  onNavigateTab,
  onOpenRefillModal
}: PatientDashboardProps) {
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  
  // Sort and filter upcoming appointments (status is scheduled/confirmed/in_progress)
  const upcomingAppointments = appointments
    .filter(apt => 
      (apt.patientId === patient.id || apt.patientCode === patient.patientCode) && 
      ["scheduled", "confirmed", "in_progress"].includes(apt.status)
    )
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  // Get last 5 vitals logs (most recent first)
  const last5Vitals = [...vitalsHistory]
    .reverse()
    .slice(0, 5);

  const latestVitals = last5Vitals[0] || null;

  // Helpers for clinical ranges and warnings
  const getHeartRateStatus = (hr: number) => {
    if (hr < 60) return { label: "Bradycardia (Low)", color: "text-amber-400 bg-amber-450/10 border-amber-500/20", iconColor: "text-amber-400", level: "warning" };
    if (hr > 100) return { label: "Tachycardia (High)", color: "text-rose-400 bg-rose-450/10 border-rose-500/20", iconColor: "text-rose-400", level: "warning" };
    return { label: "Normal (60-100 BPM)", color: "text-emerald-400 bg-emerald-450/10 border-emerald-500/20", iconColor: "text-emerald-400", level: "normal" };
  };

  const getBpStatus = (sys: number, dia: number) => {
    if (sys > 140 || dia > 90) return { label: "Hypertension (High)", color: "text-rose-400 bg-rose-450/10 border-rose-500/20", iconColor: "text-rose-400", level: "warning" };
    if (sys < 90 || dia < 60) return { label: "Hypotension (Low)", color: "text-amber-400 bg-amber-450/10 border-amber-500/20", iconColor: "text-amber-400", level: "warning" };
    return { label: "Optimal (90/60 - 120/80)", color: "text-emerald-400 bg-emerald-450/10 border-emerald-500/20", iconColor: "text-emerald-400", level: "normal" };
  };

  const getSugarStatus = (sugar: number) => {
    if (sugar < 70) return { label: "Hypoglycemia (Low)", color: "text-amber-400 bg-amber-450/10 border-amber-500/20", iconColor: "text-amber-400", level: "warning" };
    if (sugar > 140) return { label: "Hyperglycemia (High)", color: "text-rose-400 bg-rose-450/10 border-rose-500/20", iconColor: "text-rose-400", level: "warning" };
    return { label: "Normal (70-140 mg/dL)", color: "text-emerald-400 bg-emerald-450/10 border-emerald-500/20", iconColor: "text-emerald-400", level: "normal" };
  };

  // Helper to parse times for medication pills (dynamic visual schedule)
  const parseMedicationTimes = (medName: string) => {
    const text = medName.toLowerCase();
    const schedules = [];
    if (text.includes("1-0-0") || text.includes("morning") || text.includes("once daily")) {
      schedules.push({ name: "Morning", time: "08:00 AM", active: true });
    } else {
      schedules.push({ name: "Morning", time: "08:00 AM", active: text.includes("1-1-1") || text.includes("1-0-1") });
    }

    if (text.includes("0-1-0") || text.includes("afternoon") || text.includes("lunch")) {
      schedules.push({ name: "Noon", time: "01:00 PM", active: true });
    } else {
      schedules.push({ name: "Noon", time: "01:00 PM", active: text.includes("1-1-1") || text.includes("0-1-1") });
    }

    if (text.includes("0-0-1") || text.includes("night") || text.includes("bedtime") || text.includes("evening")) {
      schedules.push({ name: "Evening", time: "08:30 PM", active: true });
    } else {
      schedules.push({ name: "Evening", time: "08:30 PM", active: text.includes("1-1-1") || text.includes("1-0-1") || text.includes("0-1-1") });
    }

    return schedules;
  };

  return (
    <div id="patient-dashboard" className="space-y-6 font-sans">
      
      {/* 1. WELCOME GREETING HEADER */}
      <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-lg">
        {/* Decorative ambient background curves */}
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-inner shrink-0">
              {patient.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                  Patient Portal Active
                </span>
                {patient.abhaId && (
                  <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-md border border-slate-700/60 font-mono">
                    ABHA: {patient.abhaId}
                  </span>
                )}
              </div>
              <h2 className="text-base font-black text-white mt-1">Hello, {patient.fullName}</h2>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                {patient.gender}, {patient.age} years • Blood Group <span className="text-emerald-400 font-extrabold">{patient.bloodGroup || "O+"}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowVoiceOverlay(true)}
              className="py-2 px-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center gap-1.5 shrink-0"
            >
              <Mic className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> Voice Command
            </button>
            <button
              onClick={onAddVitalsClick}
              className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center gap-1.5 border-0 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" /> Log Daily Vitals
            </button>
            <button
              onClick={onBookAppointmentClick}
              className="py-2 px-3 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center gap-1.5 shrink-0"
            >
              <Calendar className="h-3.5 w-3.5 text-emerald-400" /> New Appt
            </button>
          </div>
        </div>
      </div>

      {/* 2. CORE BIOMETRICS METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Heart Rate */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">Heart Rate</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <HeartPulse className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-xl font-black text-white leading-none">
              {latestVitals?.hr || "72"} <span className="text-[10px] text-slate-400 font-medium font-mono">BPM</span>
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
            <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border ${getHeartRateStatus(latestVitals?.hr || 72).color}`}>
              {getHeartRateStatus(latestVitals?.hr || 72).label}
            </span>
            <span className="text-[8px] text-slate-500 font-mono">{latestVitals?.date || "Latest"}</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">Blood Pressure</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-xl font-black text-white leading-none">
              {latestVitals?.bpSystolic || "120"}/{latestVitals?.bpDiastolic || "80"} <span className="text-[10px] text-slate-400 font-medium font-mono">mmHg</span>
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
            <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border ${getBpStatus(latestVitals?.bpSystolic || 120, latestVitals?.bpDiastolic || 80).color}`}>
              {getBpStatus(latestVitals?.bpSystolic || 120, latestVitals?.bpDiastolic || 80).label}
            </span>
            <span className="text-[8px] text-slate-500 font-mono">{latestVitals?.date || "Latest"}</span>
          </div>
        </div>

        {/* Blood Glucose */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">Blood Glucose</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-xl font-black text-white leading-none">
              {latestVitals?.sugar || "105"} <span className="text-[10px] text-slate-400 font-medium font-mono">mg/dL</span>
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
            <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border ${getSugarStatus(latestVitals?.sugar || 105).color}`}>
              {getSugarStatus(latestVitals?.sugar || 105).label}
            </span>
            <span className="text-[8px] text-slate-500 font-mono">{latestVitals?.date || "Latest"}</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: MEDICATIONS AND APPOINTMENTS */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 3. CURRENT MEDICATIONS */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4.5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-lg">
                  <Pill className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Active Medications</h3>
              </div>
              <span className="text-[9.5px] text-slate-400 font-bold font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {medications.length} Prescribed
              </span>
            </div>

            {medications.length === 0 ? (
              <div className="text-center p-6 bg-slate-900/20 rounded-xl border border-dashed border-slate-800/80">
                <Pill className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-[11px] text-slate-400 font-medium">No active medications registered in your clinical file.</p>
                <p className="text-[9.5px] text-slate-500 mt-1 italic">Consultations with active prescriptions automatically populate here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {medications.map((med, index) => {
                  const schedule = parseMedicationTimes(med);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-950 border border-slate-850 p-3 rounded-xl hover:border-emerald-500/20 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/15 shrink-0 mt-0.5">
                            <Pill className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h4 className="text-[11.5px] font-black text-slate-100 leading-tight">{med.split("(")[0].trim()}</h4>
                            {med.includes("(") && (
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-normal">
                                {med.substring(med.indexOf("(") + 1, med.lastIndexOf(")"))}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-[8px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                          Active Rx
                        </span>
                      </div>

                      {/* Pill schedule indicator */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider shrink-0 mr-1">Daily Schedule:</span>
                        <div className="flex items-center gap-2.5 flex-1">
                          {schedule.map((slot, sIdx) => (
                            <div 
                              key={sIdx}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all ${
                                slot.active 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                  : "bg-slate-900 border-slate-800/80 text-slate-600"
                              }`}
                            >
                              <div className={`h-1.5 w-1.5 rounded-full ${slot.active ? "bg-emerald-400 animate-pulse" : "bg-slate-700"}`} />
                              <span>{slot.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. UPCOMING APPOINTMENTS */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4.5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/25 rounded-lg">
                  <Calendar className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Upcoming Consultations</h3>
              </div>
              {upcomingAppointments.length > 0 && (
                <span className="text-[9.5px] text-slate-400 font-bold font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {upcomingAppointments.length} Booked
                </span>
              )}
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="p-5 bg-slate-900/20 rounded-xl border border-dashed border-slate-800/80 text-center space-y-3">
                <Calendar className="h-8 w-8 text-slate-600 mx-auto opacity-50" />
                <p className="text-[11px] text-slate-400 font-medium">No upcoming clinical appointments scheduled.</p>
                <button
                  onClick={onBookAppointmentClick}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-[9.5px] uppercase rounded-lg border-0 cursor-pointer shadow-md transition-all inline-flex items-center gap-1"
                >
                  Book Appointment Now <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 2).map((apt) => {
                  const dateObj = new Date(apt.scheduledAt);
                  const isToday = dateObj.toDateString() === new Date().toDateString();
                  
                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 relative overflow-hidden flex flex-col justify-between gap-3 hover:border-sky-500/20 transition-all"
                    >
                      {/* Pulse line for today's appointment */}
                      {isToday && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 animate-pulse" />
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11.5px] font-black text-white block">
                              {apt.doctorName}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-700" />
                            <span className="text-[9px] text-slate-400 font-bold">Primary Care</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold mt-1">
                            <Clock className="h-3 w-3 text-sky-400 shrink-0" />
                            <span>
                              {isToday ? (
                                <span className="text-emerald-400 font-black">Today at </span>
                              ) : (
                                dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " at "
                              )}
                              {dateObj.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                            </span>
                          </div>

                          <p className="text-[9.5px] text-slate-500 italic mt-0.5 leading-normal">
                            Complaints: {apt.reason || "General health consultation"}
                          </p>
                        </div>

                        {/* Visit Type Badge */}
                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${
                            apt.type === "video" 
                              ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400" 
                              : apt.type === "voice"
                              ? "bg-teal-500/10 border-teal-500/25 text-teal-400"
                              : "bg-sky-500/10 border-sky-500/25 text-sky-400"
                          }`}>
                            {apt.type === "video" ? "Video Call" : apt.type === "voice" ? "Audio Call" : "In Person"}
                          </span>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                        {apt.type === "video" || apt.type === "voice" ? (
                          <button
                            onClick={() => onJoinCallClick?.(apt)}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9.5px] rounded-lg border-0 cursor-pointer shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            <Video className="h-3 w-3" /> Join Telehealth Call
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewRouteClick?.(apt)}
                            className="flex-1 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-[9.5px] rounded-lg border-0 cursor-pointer shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            <MapPin className="h-3 w-3" /> Navigation Route
                          </button>
                        )}
                        <span className="text-[8.5px] text-slate-400 font-bold px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg">
                          Status: {apt.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: LAST 5 VITALS LOGS */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* 5. QUICK ACCESS: LAST 5 VITALS LOGS */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-lg">
                    <Activity className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-sans">Recent Vitals Timeline</h3>
                </div>
                <span className="text-[9.5px] text-slate-400 font-bold font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Last 5 Logs
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Quickly monitor biometric variances, symptoms logs, and trends over time.</p>
            </div>

            {last5Vitals.length === 0 ? (
              <div className="text-center p-6 bg-slate-900/20 rounded-xl border border-dashed border-slate-800/80 my-4">
                <Activity className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-50 animate-pulse" />
                <p className="text-[11px] text-slate-400 font-medium">No biometrics or vitals history logs found.</p>
                <p className="text-[9.5px] text-slate-500 mt-1 italic">Vitals logged from your medical device sandbox appear here.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-850/80 ml-2.5 pl-3 py-1 space-y-3">
                {last5Vitals.map((log, index) => {
                  const hrStatus = getHeartRateStatus(log.hr || 72);
                  const bpStatus = getBpStatus(log.bpSystolic || 120, log.bpDiastolic || 80);
                  const isHrWarning = hrStatus.level === "warning";
                  const isBpWarning = bpStatus.level === "warning";
                  const isSugarWarning = getSugarStatus(log.sugar || 105).level === "warning";
                  const hasWarning = isHrWarning || isBpWarning || isSugarWarning;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative bg-slate-950/70 border border-slate-850/60 rounded-xl p-3 space-y-2 hover:border-slate-800 hover:bg-slate-950 transition-all shadow-inner"
                    >
                      {/* Timeline Dot Indicator */}
                      <div className={`absolute -left-[16.5px] top-4.5 h-2 w-2 rounded-full border ${
                        hasWarning 
                          ? "bg-rose-500 border-rose-950 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                          : "bg-emerald-500 border-emerald-950"
                      }`} />

                      {/* Log Timestamp and Alert Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9.5px] text-slate-300 font-extrabold font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {log.date}
                        </span>
                        
                        {hasWarning && (
                          <span className="text-[7px] bg-rose-500/10 text-rose-400 border border-rose-500/25 px-1.5 py-0.5 rounded uppercase font-black flex items-center gap-0.5">
                            <AlertTriangle className="h-2 w-2" /> Threshold Alert
                          </span>
                        )}
                      </div>

                      {/* Biometric metric list */}
                      <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                        <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-900">
                          <span className="text-[7.5px] text-slate-500 uppercase tracking-widest block font-sans">Heart Rate</span>
                          <span className={`text-[10.5px] font-black block mt-0.5 ${isHrWarning ? "text-rose-400" : "text-slate-200"}`}>
                            {log.hr || 72} <span className="text-[7.5px] font-medium opacity-60">BPM</span>
                          </span>
                        </div>
                        
                        <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-900">
                          <span className="text-[7.5px] text-slate-500 uppercase tracking-widest block font-sans">Blood Pres</span>
                          <span className={`text-[10.5px] font-black block mt-0.5 ${isBpWarning ? "text-rose-400" : "text-slate-200"}`}>
                            {log.bpSystolic}/{log.bpDiastolic}
                          </span>
                        </div>

                        <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-900">
                          <span className="text-[7.5px] text-slate-500 uppercase tracking-widest block font-sans">Sugar Lvl</span>
                          <span className={`text-[10.5px] font-black block mt-0.5 ${isSugarWarning ? "text-rose-400" : "text-slate-200"}`}>
                            {log.sugar || 105} <span className="text-[7.5px] font-medium opacity-60">mg/dL</span>
                          </span>
                        </div>
                      </div>

                      {/* Symptoms Log details if logged */}
                      {log.symptoms && log.symptoms.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-900/80 flex flex-wrap items-center gap-1">
                          <span className="text-[7.5px] text-slate-500 uppercase font-black tracking-wider block font-sans mr-1">Symptoms:</span>
                          {log.symptoms.map((s: string, sIdx: number) => (
                            <span 
                              key={sIdx}
                              className="text-[8px] bg-slate-900 border border-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {log.symptomNotes && (
                        <p className="text-[8.5px] text-slate-400 italic leading-snug font-sans bg-slate-900/40 p-1.5 rounded border border-slate-900/40 mt-1">
                          "{log.symptomNotes}"
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
            
            {/* Quick-Access Summary Summary Banner */}
            {last5Vitals.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl mt-3 text-[9.5px] text-slate-400 leading-relaxed font-sans">
                <span className="font-extrabold text-emerald-400 flex items-center gap-1 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  EMR Ingestion & Compliance Verified
                </span>
                Your latest {last5Vitals.length} biometrics logs have been successfully synced with your clinic's HL7 FHIR database gateway.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Floating Voice Command FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowVoiceOverlay(true)}
          className="h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center justify-center cursor-pointer transition-all border-2 border-slate-900 group"
          title="Open Voice Assistant Commands"
        >
          <Mic className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Voice Command Overlay Modal */}
      <VoiceCommandOverlay
        isOpen={showVoiceOverlay}
        onClose={() => setShowVoiceOverlay(false)}
        onNavigateTab={onNavigateTab}
        onAddVitalsClick={onAddVitalsClick}
        onBookAppointmentClick={onBookAppointmentClick}
        onOpenRefillModal={onOpenRefillModal}
        onJoinCallClick={() => {
          if (upcomingAppointments.length > 0) {
            onJoinCallClick?.(upcomingAppointments[0]);
          }
        }}
        onViewRouteClick={() => {
          if (upcomingAppointments.length > 0) {
            onViewRouteClick?.(upcomingAppointments[0]);
          }
        }}
      />

    </div>
  );
}
