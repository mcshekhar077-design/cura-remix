import React, { useState, useEffect } from "react";
import {
  Activity,
  Smartphone,
  AlertTriangle,
  Heart,
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Sparkles,
  Bot,
  Zap,
  TrendingUp,
  TrendingDown,
  Volume2,
  PhoneCall,
  MapPin,
  Pill,
  FileText,
  RefreshCw,
  Sliders,
  Check,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  BarChart2,
  Radio,
  Bell
} from "lucide-react";

interface AIHealthcareSuiteProps {
  patientId?: string;
  patientName?: string;
  userRole?: "doctor" | "patient" | "nurse" | "admin";
  onBack?: () => void;
}

export default function AIHealthcareSuite({
  patientId = "P101",
  patientName = "Rajesh Kumar",
  userRole = "doctor",
  onBack
}: AIHealthcareSuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "rpm" | "assistant" | "coordination" | "chronic" | "emergency" | "reminders" | "copilot"
  >("dashboard");

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  // Remote Monitoring State
  const [rpmDevices, setRpmDevices] = useState<any[]>([]);
  const [rpmReadings, setRpmReadings] = useState<any[]>([]);
  const [isSimulatingReading, setIsSimulatingReading] = useState(false);
  const [simDeviceType, setSimDeviceType] = useState<string>("blood_pressure");
  const [simValue, setSimValue] = useState<string>("142");
  const [simSecondaryValue, setSimSecondaryValue] = useState<string>("92");

  // New Device Form State
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [newDeviceType, setNewDeviceType] = useState("blood_pressure");
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newLowThresh, setNewLowThresh] = useState("90");
  const [newHighThresh, setNewHighThresh] = useState("140");

  // AI Health Assistant State
  const [queryInput, setQueryInput] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  // Care Coordination State
  const [carePlans, setCarePlans] = useState<any[]>([]);

  // Chronic Disease Monitoring State
  const [chronicProfile, setChronicProfile] = useState<any | null>(null);
  const [logBpSys, setLogBpSys] = useState("138");
  const [logBpDia, setLogBpDia] = useState("88");
  const [logGlucose, setLogGlucose] = useState("128");
  const [logHba1c, setLogHba1c] = useState("7.1");
  const [isLoggingVitals, setIsLoggingVitals] = useState(false);

  // Emergency Alerts State
  const [emergencyHistory, setEmergencyHistory] = useState<any[]>([]);
  const [isTriggeringEmergency, setIsTriggeringEmergency] = useState(false);
  const [emergencySuccessMsg, setEmergencySuccessMsg] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    fetchDashboardData();
    fetchRpmData();
    fetchCarePlans();
    fetchChronicProfile();
    fetchEmergencyHistory();
  }, [patientId]);

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      const res = await fetch(`/api/v1/smart-health-dashboard/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data.data);
      }
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const fetchRpmData = async () => {
    try {
      const res = await fetch(`/api/v1/remote-monitoring/devices/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setRpmDevices(data.devices || []);
        setRpmReadings(data.readings || []);
      }
    } catch (e) {
      console.error("Error fetching RPM data:", e);
    }
  };

  const fetchCarePlans = async () => {
    try {
      const res = await fetch(`/api/v1/care-coordination/plans/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setCarePlans(data.plans || []);
      }
    } catch (e) {
      console.error("Error fetching Care Plans:", e);
    }
  };

  const fetchChronicProfile = async () => {
    try {
      const res = await fetch(`/api/v1/chronic-monitoring/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setChronicProfile(data.profile);
      }
    } catch (e) {
      console.error("Error fetching chronic profile:", e);
    }
  };

  const fetchEmergencyHistory = async () => {
    try {
      const res = await fetch(`/api/v1/emergency-alerts/history/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setEmergencyHistory(data.alerts || []);
      }
    } catch (e) {
      console.error("Error fetching emergency history:", e);
    }
  };

  // Simulate Vitals Reading
  const handleSimulateReading = async () => {
    setIsSimulatingReading(true);
    try {
      const res = await fetch("/api/v1/remote-monitoring/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          deviceType: simDeviceType,
          value: simValue,
          secondaryValue: simDeviceType === "blood_pressure" ? simSecondaryValue : undefined,
          unit: simDeviceType === "blood_pressure" ? "mmHg" : simDeviceType === "continuous_glucose" ? "mg/dL" : "BPM"
        })
      });
      if (res.ok) {
        await fetchRpmData();
        await fetchDashboardData();
      }
    } catch (e) {
      console.error("Failed to simulate reading:", e);
    } finally {
      setIsSimulatingReading(false);
    }
  };

  // Register New Device
  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/remote-monitoring/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          patientName,
          deviceType: newDeviceType,
          deviceName: newDeviceName || `${newDeviceType.toUpperCase().replace("_", " ")} Smart Sensor`,
          alertThresholdLow: newLowThresh,
          alertThresholdHigh: newHighThresh,
          secondaryThresholdHigh: newDeviceType === "blood_pressure" ? "90" : undefined,
          unit: newDeviceType === "blood_pressure" ? "mmHg" : newDeviceType === "continuous_glucose" ? "mg/dL" : "BPM"
        })
      });
      if (res.ok) {
        setShowAddDeviceModal(false);
        setNewDeviceName("");
        await fetchRpmData();
      }
    } catch (e) {
      console.error("Failed to register device:", e);
    }
  };

  // Submit AI Health Query
  const handleAskAssistant = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim()) return;

    const userQ = queryInput;
    setQueryInput("");
    setIsQuerying(true);

    // Optimistic user chat update
    setChatHistory((prev) => [
      ...prev,
      { type: "user", text: userQ, timestamp: new Date().toLocaleTimeString() }
    ]);

    try {
      const res = await fetch("/api/v1/health-assistant/patient-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, query: userQ })
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory((prev) => [
          ...prev,
          {
            type: "ai",
            data: data.data,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (err) {
      console.error("Assistant query error:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (planId: string, taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/v1/care-coordination/tasks/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, taskId, completed: !currentStatus })
      });
      if (res.ok) {
        await fetchCarePlans();
        await fetchDashboardData();
      }
    } catch (e) {
      console.error("Failed to toggle task:", e);
    }
  };

  // Log Chronic Vitals
  const handleLogChronicVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingVitals(true);
    try {
      const res = await fetch("/api/v1/chronic-monitoring/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          bpSystolic: logBpSys,
          bpDiastolic: logBpDia,
          fastingGlucose: logGlucose,
          hba1c: logHba1c
        })
      });
      if (res.ok) {
        await fetchChronicProfile();
        await fetchDashboardData();
      }
    } catch (e) {
      console.error("Failed to log chronic vitals:", e);
    } finally {
      setIsLoggingVitals(false);
    }
  };

  // Trigger Panic Emergency
  const handleTriggerEmergency = async () => {
    if (!window.confirm("🚨 Are you sure you want to trigger a RED CRITICAL EMERGENCY ALERT? Ambulance and doctor will be dispatched instantly.")) return;

    setIsTriggeringEmergency(true);
    setEmergencySuccessMsg(null);
    try {
      const res = await fetch("/api/v1/emergency-alerts/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          patientName,
          alertType: "PATIENT_PANIC_BUTTON",
          location: "GPS: Sector 62, Noida, Delhi NCR",
          vitalsSummary: "Critical Emergency Triggered via CURA App"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEmergencySuccessMsg(data.message);
        await fetchEmergencyHistory();
        await fetchDashboardData();
      }
    } catch (e) {
      console.error("Emergency trigger failed:", e);
    } finally {
      setIsTriggeringEmergency(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      {/* HEADER BAR */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-2xl backdrop-blur-md mb-6">
        <div className="flex items-center gap-3.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            >
              ← Back
            </button>
          )}
          <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white rounded-xl shadow-lg">
            <Sparkles className="h-6 w-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                CURA AI Healthcare Ecosystem
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                10 AI Opportunities Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Complete Remote Monitoring, Care Coordination, AI Assistant, Chronic Suite & Emergency Dispatch for <span className="text-indigo-300 font-bold">{patientName} ({patientId})</span>
            </p>
          </div>
        </div>

        {/* Rapid Panic Action */}
        <button
          onClick={handleTriggerEmergency}
          disabled={isTriggeringEmergency}
          className="px-5 py-3 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-900/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border border-rose-400/30 shrink-0"
        >
          <ShieldAlert className="h-4 w-4 animate-bounce" />
          <span>{isTriggeringEmergency ? "DISPATCHING..." : "🚨 Emergency Panic Trigger"}</span>
        </button>
      </div>

      {/* TOP NAVIGATION TABS (10 OPPORTUNITIES HUB) */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {[
            { id: "dashboard", label: "📊 Smart Health Dashboard", icon: BarChart2, badge: "Opportunity 7" },
            { id: "rpm", label: "🛰️ Remote Monitoring", icon: Smartphone, badge: "Opportunity 1" },
            { id: "assistant", label: "🤖 24/7 AI Health Assistant", icon: Bot, badge: "Opportunity 2" },
            { id: "coordination", label: "🤝 Care Coordination", icon: Users, badge: "Opportunity 3" },
            { id: "chronic", label: "🩺 Chronic Disease Suite", icon: Heart, badge: "Opportunity 6" },
            { id: "emergency", label: "🚨 Emergency Dispatch", icon: ShieldAlert, badge: "Opportunity 10" },
            { id: "reminders", label: "💊 Medicine Reminders", icon: Pill, badge: "Opportunity 5" },
            { id: "copilot", label: "👨‍⚕️ Doctor Copilot", icon: Stethoscope, badge: "Opportunity 4 & 8" }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-900/30 scale-105"
                    : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? "bg-indigo-700 text-indigo-100" : "bg-slate-950 text-slate-500"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT CANVAS */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* =========================================================================
            TAB 1: SMART HEALTH DASHBOARD (Opportunity 7)
        ========================================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Stat Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Unified Health Score</span>
                  <div className="text-3xl font-black text-white mt-1 flex items-baseline gap-1">
                    <span>{dashboardData?.overallHealthScore || 82}</span>
                    <span className="text-sm font-bold text-indigo-400">/ 100</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> Excellent Glycemic & Cardiac Control
                  </span>
                </div>
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Activity className="h-7 w-7" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connected IoT Devices</span>
                  <div className="text-2xl font-black text-white mt-1">
                    {dashboardData?.deviceCount || rpmDevices.length || 2} Active
                  </div>
                  <span className="text-[10px] text-indigo-400 font-bold mt-1 block">
                    BP Monitor + Continuous Glucose
                  </span>
                </div>
                <div className="p-3 bg-slate-800 text-indigo-400 rounded-xl border border-slate-700">
                  <Smartphone className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Care Plan Tasks</span>
                  <div className="text-2xl font-black text-white mt-1">
                    {dashboardData?.carePlanSummary ? `${dashboardData.carePlanSummary.completedTasks}/${dashboardData.carePlanSummary.totalTasks}` : "2/4 Completed"}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                    50% Daily Compliance
                  </span>
                </div>
                <div className="p-3 bg-slate-800 text-emerald-400 rounded-xl border border-slate-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Alerts</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    0 Critical
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold mt-1 block">
                    All vitals within green zone
                  </span>
                </div>
                <div className="p-3 bg-slate-800 text-emerald-400 rounded-xl border border-slate-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Main Vitals & Quick Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Vitals Summary */}
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-500" /> Vitals & Biometric Telemetry
                    </h3>
                    <p className="text-xs text-slate-400">Real-time sync from RPM Bluetooth & Continuous Devices</p>
                  </div>
                  <button
                    onClick={fetchDashboardData}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Blood Pressure</span>
                    <span className="text-lg font-black text-indigo-300 mt-1 block">
                      {dashboardData?.vitalsSummary?.bp || "138/88 mmHg"}
                    </span>
                    <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded inline-block mt-1">
                      Pre-Hypertensive
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Fasting Glucose</span>
                    <span className="text-lg font-black text-emerald-300 mt-1 block">
                      {dashboardData?.vitalsSummary?.glucose || "128 mg/dL"}
                    </span>
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block mt-1">
                      Controlled
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">HbA1c Biomarker</span>
                    <span className="text-lg font-black text-purple-300 mt-1 block">
                      {dashboardData?.vitalsSummary?.hba1c || "7.1%"}
                    </span>
                    <span className="text-[8px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded inline-block mt-1">
                      Target &lt; 7.0%
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Heart Rate</span>
                    <span className="text-lg font-black text-rose-300 mt-1 block">
                      {dashboardData?.vitalsSummary?.heartRate || "76 BPM"}
                    </span>
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block mt-1">
                      Sinus Rhythm
                    </span>
                  </div>
                </div>

                {/* AI Clinical Recommendation Banner */}
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">
                      AI Smart Dashboard Clinical Insight
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {chronicProfile?.aiClinicalGuidance ||
                      "Patient maintains stable glycemic control on Metformin 500mg. Systolic blood pressure (138 mmHg) is slightly above the ideal target of 130 mmHg. Daily 5,000 steps step goal recommended."}
                  </p>
                </div>
              </div>

              {/* Right Column: Quick Actions & Care Team */}
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-400" /> Care Team & Quick Actions
                </h3>

                <div className="space-y-2">
                  {[
                    { role: "Cardiologist", name: "Dr. Ananya Roy", phone: "+91 9988776655" },
                    { role: "Diabetologist", name: "Dr. Vikram Sethi", phone: "+91 9811223344" },
                    { role: "RPM Care Nurse", name: "Nurse Sunita", phone: "+91 9711002233" }
                  ].map((doc, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{doc.name}</span>
                        <span className="text-[10px] text-slate-400">{doc.role}</span>
                      </div>
                      <a
                        href={`tel:${doc.phone}`}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <PhoneCall className="h-3.5 w-3.5" /> Call
                      </a>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => setActiveTab("assistant")}
                    className="w-full py-2.5 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Bot className="h-4 w-4 text-indigo-400" /> Ask 24/7 AI Health Assistant
                  </button>
                  <button
                    onClick={() => setActiveTab("rpm")}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4 text-slate-400" /> Connect Remote Device
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: REMOTE MONITORING (RPM) (Opportunity 1)
        ========================================================================= */}
        {activeTab === "rpm" && (
          <div className="space-y-6 animate-fade-in">
            {/* RPM Header & Add Device Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Radio className="h-5 w-5 text-indigo-400 animate-pulse" /> Remote Patient Monitoring (RPM) Hardware Hub
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time wireless device telemetry, threshold alarms, predictive trend alerts, and battery status
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setShowAddDeviceModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4" /> Add Remote Device
                </button>
              </div>
            </div>

            {/* Connected Devices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rpmDevices.map((dev) => (
                <div key={dev.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">{dev.deviceType.replace("_", " ")}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{dev.deviceName}</h4>
                      <span className="text-[10px] font-mono text-slate-400">ID: {dev.deviceId}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold rounded-md flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> {dev.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Latest Reading</span>
                      <span className="text-xl font-black text-indigo-300 mt-0.5 block">
                        {dev.lastReading ? `${dev.lastReading}${dev.secondaryReading ? "/" + dev.secondaryReading : ""} ${dev.unit}` : "No reading yet"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-400 block">Battery: {dev.batteryLevel}%</span>
                      <span className="text-[8.5px] text-slate-500 block">
                        {dev.lastReadingTime ? new Date(dev.lastReadingTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Syncing"}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex justify-between items-center pt-1 border-t border-slate-800/80">
                    <span>Threshold: {dev.alertThresholdLow} - {dev.alertThresholdHigh} {dev.unit}</span>
                    <span className="text-indigo-400 font-bold">Auto-Alarm On</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Live Vitals Transmitter Box */}
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" /> Real-Time Telemetry Data Transmitter (Simulator)
              </h3>
              <p className="text-xs text-slate-400">
                Simulate a live Bluetooth / IoT sensor transmission to test CURA's instant alert & predictive trend engine.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Device Type</label>
                  <select
                    value={simDeviceType}
                    onChange={(e) => setSimDeviceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="blood_pressure">Blood Pressure (mmHg)</option>
                    <option value="continuous_glucose">Continuous Glucose (mg/dL)</option>
                    <option value="ecg">ECG Patch (BPM)</option>
                    <option value="heart_rate">Pulse Oximeter (SpO2/BPM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Primary Value</label>
                  <input
                    type="number"
                    value={simValue}
                    onChange={(e) => setSimValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold"
                    placeholder="e.g. 142"
                  />
                </div>

                {simDeviceType === "blood_pressure" && (
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Diastolic Value</label>
                    <input
                      type="number"
                      value={simSecondaryValue}
                      onChange={(e) => setSimSecondaryValue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold"
                      placeholder="e.g. 92"
                    />
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    onClick={handleSimulateReading}
                    disabled={isSimulatingReading}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSimulatingReading ? "Transmitting..." : "Transmit Reading"}
                  </button>
                </div>
              </div>
            </div>

            {/* Historical Telemetry Stream */}
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" /> Live Telemetry Reading Stream
              </h3>

              <div className="space-y-2">
                {rpmReadings.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No telemetry readings recorded yet.</p>
                ) : (
                  rpmReadings.map((rd) => (
                    <div key={rd.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            rd.alertLevel === "emergency" || rd.alertLevel === "critical"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-indigo-500/20 text-indigo-400"
                          }`}
                        >
                          <Activity className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white uppercase">{rd.deviceType.replace("_", " ")}</span>
                            <span
                              className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                rd.alertLevel === "emergency" || rd.alertLevel === "critical"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-emerald-500/10 text-emerald-400"
                              }`}
                            >
                              {rd.alertLevel.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{rd.alertMessage}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-indigo-300">
                          {rd.value}{rd.secondaryValue ? "/" + rd.secondaryValue : ""} {rd.unit}
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          {new Date(rd.readingTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: 24/7 AI HEALTH ASSISTANT (Opportunity 2)
        ========================================================================= */}
        {activeTab === "assistant" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-indigo-400" /> 24/7 AI Health Assistant & Symptom Evaluator
                </h3>
                <p className="text-xs text-slate-400">
                  Ask symptom concerns, medication side effects, lab report explanations, or dietary recommendations
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full">
                Gemini 3.5 Flash Powered
              </span>
            </div>

            {/* Chat History Box */}
            <div className="min-h-[320px] max-h-[480px] overflow-y-auto space-y-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
              {chatHistory.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Bot className="h-10 w-10 text-indigo-500/40 mx-auto" />
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Hello! I am CURA's 24/7 AI Health Assistant. Ask me anything regarding your symptoms, medications, lab results, or nutrition guidelines.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {[
                      "I have a throbbing headache & mild fever.",
                      "When should I take Metformin 500mg?",
                      "Explain my HbA1c 7.1% report result.",
                      "What low-salt foods should I eat for high BP?"
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQueryInput(q);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 text-[11px] rounded-lg transition-all cursor-pointer"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`space-y-2 ${msg.type === "user" ? "text-right" : "text-left"}`}>
                    {msg.type === "user" ? (
                      <div className="inline-block bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-xs font-medium max-w-lg text-left shadow-md">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="inline-block bg-slate-900 border border-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-none text-xs max-w-2xl text-left shadow-lg space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                          <Bot className="h-4 w-4 text-indigo-400" />
                          <span className="font-bold text-indigo-300 text-[11px] uppercase tracking-wider">
                            CURA AI Health Assistant
                          </span>
                        </div>

                        <p className="leading-relaxed text-slate-200">{msg.data.response}</p>

                        {msg.data.actionItems && msg.data.actionItems.length > 0 && (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">Recommended Action Steps:</span>
                            <ul className="space-y-1 text-[11px] text-slate-300">
                              {msg.data.actionItems.map((act: string, aIdx: number) => (
                                <li key={aIdx} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-[9px] text-slate-500 italic pt-1 border-t border-slate-800">
                          ⚠️ {msg.data.disclaimer}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Query Input Box */}
            <form onSubmit={handleAskAssistant} className="flex gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask your health query or symptom concern..."
                className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:border-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={isQuerying}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <Send className="h-4 w-4" />
                {isQuerying ? "Analyzing..." : "Ask AI"}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 4: CARE COORDINATION & MULTI-DISCIPLINARY TEAMS (Opportunity 3)
        ========================================================================= */}
        {activeTab === "coordination" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" /> Integrated Care Coordination & Team Protocols
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect Primary Cardiologists, Diabetologists, Care Nurses, Pharmacists, and Family Caregivers
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                  Active Care Protocol CP-101
                </span>
              </div>

              {carePlans.map((plan) => (
                <div key={plan.id} className="space-y-6">
                  {/* Plan Overview */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-white">{plan.planName}</h4>
                        <span className="text-[10px] text-indigo-400 font-bold block mt-0.5">Primary Diagnosis: {plan.primaryCondition}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Review Date: {plan.nextReviewDate}</span>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Care Plan Clinical Goals:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {plan.goals.map((goal: string, gIdx: number) => (
                          <div key={gIdx} className="bg-slate-900 border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200 flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Multi-disciplinary Tasks Checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Multi-disciplinary Task Checklist</h4>
                    <div className="space-y-2">
                      {plan.tasks.map((tk: any) => (
                        <div
                          key={tk.id}
                          onClick={() => handleToggleTask(plan.id, tk.id, tk.completed)}
                          className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            tk.completed
                              ? "bg-slate-950/60 border-slate-800/80 text-slate-500 line-through"
                              : "bg-slate-950 border-slate-800 text-white hover:border-indigo-500/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg border ${tk.completed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-900 text-slate-400 border-slate-800"}`}>
                              <Check className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold block">{tk.title}</span>
                              <span className="text-[10px] text-indigo-400 font-mono">Assigned to: {tk.assignedTo.toUpperCase()} • Due: {tk.dueDate}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${tk.completed ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                            {tk.completed ? "COMPLETED" : "PENDING"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Care Team Roster */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Assigned Multi-Disciplinary Care Team</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {plan.teamMembers.map((tm: any, tIdx: number) => (
                        <div key={tIdx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider block">{tm.role}</span>
                          <span className="text-xs font-bold text-white block">{tm.name}</span>
                          <a href={`tel:${tm.contact}`} className="text-[10px] font-mono text-slate-400 hover:text-indigo-300 block pt-1">
                            📞 {tm.contact}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: CHRONIC DISEASE SUITE (Opportunity 6)
        ========================================================================= */}
        {activeTab === "chronic" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Heart className="h-5 w-5 text-rose-500" /> Chronic Disease Management Suite (Diabetes & Hypertension)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Track long-term HbA1c, Fasting Glucose, Blood Pressure, and AI Complication Risk Score
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">AI Complication Risk</span>
                  <span className="text-xl font-black text-amber-400">
                    {chronicProfile?.riskScore || 28} % (Low-Moderate)
                  </span>
                </div>
              </div>

              {/* Vitals Logging Form */}
              <form onSubmit={handleLogChronicVitals} className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Log New Chronic Biometrics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={logBpSys}
                      onChange={(e) => setLogBpSys(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={logBpDia}
                      onChange={(e) => setLogBpDia(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Fasting Glucose (mg/dL)</label>
                    <input
                      type="number"
                      value={logGlucose}
                      onChange={(e) => setLogGlucose(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">HbA1c (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={logHba1c}
                      onChange={(e) => setLogHba1c(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingVitals}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-all"
                >
                  {isLoggingVitals ? "Saving..." : "Save Biometric Entry"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: EMERGENCY DISPATCH (Opportunity 10)
        ========================================================================= */}
        {activeTab === "emergency" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-rose-400 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" /> Emergency Panic Dispatch & Rapid Cardiac Alert Center
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instant emergency dispatch, GPS location transmission, automated WhatsApp alerts to family and ER desk
                  </p>
                </div>
              </div>

              {emergencySuccessMsg && (
                <div className="bg-rose-950/60 border border-rose-500/50 p-4 rounded-xl text-rose-200 text-xs font-bold space-y-1">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Bell className="h-4 w-4 animate-bounce" />
                    <span>EMERGENCY ALERT CONFIRMED</span>
                  </div>
                  <p>{emergencySuccessMsg}</p>
                </div>
              )}

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
                <div className="p-4 bg-rose-500/20 text-rose-400 rounded-full w-20 h-20 mx-auto flex items-center justify-center border border-rose-500/30">
                  <ShieldAlert className="h-10 w-10 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">CURA Red Emergency Panic Trigger</h4>
                  <p className="text-xs text-slate-400">
                    Pressing this button broadcasts your real-time GPS location and telemetry to Dr. Ananya Roy and the nearest emergency cardiac mobile unit.
                  </p>
                </div>

                <button
                  onClick={handleTriggerEmergency}
                  disabled={isTriggeringEmergency}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-rose-950/80 transition-all cursor-pointer border border-rose-400/30"
                >
                  {isTriggeringEmergency ? "DISPATCHING AMBULANCE..." : "🚨 TRIGGER EMERGENCY DISPATCH NOW"}
                </button>
              </div>

              {/* Emergency Alert Logs */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Emergency Alert Logs</h4>
                <div className="space-y-2">
                  {emergencyHistory.map((emg) => (
                    <div key={emg.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-rose-400">{emg.alertType}</span>
                          <span className="text-[9px] font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                            {emg.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">📍 {emg.location}</p>
                        <span className="text-[10px] text-slate-500 block">Dispatched: {emg.dispatchedTeam}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-emerald-400 font-bold block">{emg.status}</span>
                        <span className="text-[9px] text-slate-500">{new Date(emg.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: MEDICINE REMINDERS (Opportunity 5)
        ========================================================================= */}
        {activeTab === "reminders" && (
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Pill className="h-5 w-5 text-indigo-400" /> Smart Medicine Reminders & WhatsApp Alerts
                </h3>
                <p className="text-xs text-slate-400">
                  Automated dosage schedules with 92% adherence tracking and WhatsApp family notifications
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                Adherence Score: 92%
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: "Metformin 500mg", schedule: "08:00 AM (After Breakfast)", status: "TAKEN", time: "08:12 AM" },
                { name: "Telmisartan 40mg", schedule: "09:00 AM (Morning)", status: "TAKEN", time: "09:05 AM" },
                { name: "Atorvastatin 10mg", schedule: "09:00 PM (Bedtime)", status: "SCHEDULED", time: "Pending" }
              ].map((med, mIdx) => (
                <div key={mIdx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{med.name}</h4>
                      <span className="text-[10px] text-slate-400">Schedule: {med.schedule}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                      med.status === "TAKEN"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {med.status} ({med.time})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 8: DOCTOR COPILOT (Opportunity 4 & 8)
        ========================================================================= */}
        {activeTab === "copilot" && (
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-indigo-400" /> AI Doctor Copilot & Clinical Decision Support
                </h3>
                <p className="text-xs text-slate-400">
                  Instant consultation drafting, differential diagnosis suggestions, drug interaction safety checks
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider">AI Differential Diagnosis Engine</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  • Essential Hypertension (88% probability)
                  <br />
                  • Type 2 Diabetes Mellitus with Mild Insulin Resistance (92% probability)
                  <br />• Early Hypertensive Nephropathy Screening Recommended
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider">Pharmacovigilance & Safety Audit</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ✅ Metformin + Telmisartan combination verified safe.
                  <br />
                  ✅ Zero renal contraindications at eGFR 82 mL/min.
                  <br />✅ Renal and hepatic clearance profiles checked.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD DEVICE MODAL */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white">Register Remote Monitoring Device</h3>
              <button onClick={() => setShowAddDeviceModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="space-y-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Device Type</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs"
                >
                  <option value="blood_pressure">Blood Pressure Monitor</option>
                  <option value="continuous_glucose">Continuous Glucose Monitor (CGM)</option>
                  <option value="ecg">6-Lead ECG Patch</option>
                  <option value="heart_rate">Pulse Oximeter / Heart Rate</option>
                  <option value="smartwatch">Smartwatch Telemetry</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Device Model Name</label>
                <input
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Omron Platinum Wireless BP"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Low Threshold Alarm</label>
                  <input
                    type="number"
                    value={newLowThresh}
                    onChange={(e) => setNewLowThresh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">High Threshold Alarm</label>
                  <input
                    type="number"
                    value={newHighThresh}
                    onChange={(e) => setNewHighThresh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeviceModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
