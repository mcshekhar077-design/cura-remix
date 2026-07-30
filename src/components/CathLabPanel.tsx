import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Settings, 
  Plus, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  Search, 
  SlidersHorizontal,
  ChevronRight,
  Database,
  Calendar,
  Layers,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Shield,
  FileText,
  User,
  Scissors,
  Wrench,
  Thermometer,
  Eye,
  Percent,
  Play,
  CheckCircle
} from "lucide-react";

interface CathLabRoom {
  id: string;
  roomNumber: string;
  name: string;
  hasHemodynamicMonitoring: boolean;
  hasContrastInjector: boolean;
  hasIvus: boolean;
  hasOct: boolean;
  hasFfr: boolean;
  hasRotablator: boolean;
  hasIntraAorticBalloonPump: boolean;
  hasTemporaryPacemaker: boolean;
  equipmentList: string[];
  status: "available" | "in_use" | "maintenance" | "cleaning";
  headNurse: string;
  contactNumber: string;
  notes: string;
}

interface DeviceUsed {
  type: string;
  brand: string;
  size: string;
  location: string;
}

interface ConsumableUsed {
  item: string;
  quantity: number;
  lotNumber: string;
}

interface CathLabProcedure {
  id: string;
  patientId: string;
  patientName: string;
  referringDoctor: string;
  performingDoctor: string;
  procedureNumber: string;
  procedureType: string;
  priority: "elective" | "urgent" | "emergency" | "stat";
  status: "scheduled" | "ready" | "in_progress" | "completed" | "cancelled" | "postponed";
  scheduledDate: string;
  scheduledDurationMinutes: number;
  actualStartTime: string | null;
  actualEndTime: string | null;
  // Prep
  fastingRequired: boolean;
  contrastAllergy: boolean;
  anticoagulationStatus: string;
  renalFunction: string;
  preProcedureNotes: string;
  // Details
  accessSite: string;
  anesthesiaType: string;
  contrastVolumeMl: number;
  fluoroscopyTimeMinutes: number;
  radiationDose: number;
  findings: string;
  complications: string;
  outcome: string;
  devicesUsed: DeviceUsed[];
  stentsDeployed: number;
  // Team
  assistantDoctor: string;
  scrubNurse: string;
  circulatingNurse: string;
  technologist: string;
  consumablesUsed: ConsumableUsed[];
  postProcedureNotes: string;
  dischargeInstructions: string;
  followUpRequired: boolean;
  followUpDate: string | null;
}

interface CathLabEquipment {
  id: string;
  name: string;
  equipmentType: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  purchaseDate: string;
  warrantyExpiry: string;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  status: "available" | "in_use" | "maintenance" | "calibration_due";
  location: string;
  notes: string;
}

interface CathLabPanelProps {
  patients: any[];
  setSuccessMsg: (msg: string | null) => void;
  setErrorAlert: (msg: string | null) => void;
}

export default function CathLabPanel({
  patients,
  setSuccessMsg,
  setErrorAlert
}: CathLabPanelProps) {
  const [activePanel, setActivePanel] = useState<"suites" | "procedures" | "equipment" | "analytics">("suites");
  const [loading, setLoading] = useState(true);

  // States
  const [rooms, setRooms] = useState<CathLabRoom[]>([]);
  const [procedures, setProcedures] = useState<CathLabProcedure[]>([]);
  const [equipmentList, setEquipmentList] = useState<CathLabEquipment[]>([]);
  const [stats, setStats] = useState<any>({
    totalRooms: 0,
    todayProcedures: 0,
    completedToday: 0,
    typeBreakdown: [],
    roomUtilization: []
  });

  // Filter states
  const [procedureSearch, setProcedureSearch] = useState("");
  const [procedureStatusFilter, setProcedureStatusFilter] = useState("");
  const [procedurePriorityFilter, setProcedurePriorityFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showPrepModal, setShowPrepModal] = useState<CathLabProcedure | null>(null);
  const [showReportModal, setShowReportModal] = useState<CathLabProcedure | null>(null);
  const [showCalibrateModal, setShowCalibrateModal] = useState<CathLabEquipment | null>(null);

  // Form states - Schedule Procedure
  const [formPatientId, setFormPatientId] = useState("");
  const [formPatientName, setFormPatientName] = useState("");
  const [formRoomId, setFormRoomId] = useState("");
  const [formProcedureType, setFormProcedureType] = useState("coronary_angiogram");
  const [formPriority, setFormPriority] = useState<"elective" | "urgent" | "emergency" | "stat">("elective");
  const [formScheduledDate, setFormScheduledDate] = useState("");
  const [formDuration, setFormDuration] = useState("60");
  const [formReferringDoctor, setFormReferringDoctor] = useState("Dr. Rajesh Mehta");
  const [formPerformingDoctor, setFormPerformingDoctor] = useState("Dr. Anil Sharma");
  const [formFastingRequired, setFormFastingRequired] = useState(true);
  const [formContrastAllergy, setFormContrastAllergy] = useState(false);
  const [formAnticoagulation, setFormAnticoagulation] = useState("None");
  const [formRenalFunction, setFormRenalFunction] = useState("Normal GFR (>90)");
  const [formPreNotes, setFormPreNotes] = useState("");

  // Form states - Room Creation
  const [formRoomNum, setFormRoomNum] = useState("");
  const [formRoomName, setFormRoomName] = useState("");
  const [formRoomHeadNurse, setFormRoomHeadNurse] = useState("");
  const [formRoomContact, setFormRoomContact] = useState("");
  const [formRoomNotes, setFormRoomNotes] = useState("");
  const [formRoomHemodynamic, setFormRoomHemodynamic] = useState(true);
  const [formRoomContrast, setFormRoomContrast] = useState(true);
  const [formRoomIvus, setFormRoomIvus] = useState(false);
  const [formRoomOct, setFormRoomOct] = useState(false);
  const [formRoomFfr, setFormRoomFfr] = useState(false);
  const [formRoomRotablator, setFormRoomRotablator] = useState(false);
  const [formRoomIABP, setFormRoomIABP] = useState(false);
  const [formRoomPacemaker, setFormRoomPacemaker] = useState(false);

  // Form states - Real-time Procedure Logging (Findings Report)
  const [logAccessSite, setLogAccessSite] = useState("radial");
  const [logAnesthesia, setLogAnesthesia] = useState("local");
  const [logContrastVol, setLogContrastVol] = useState("80");
  const [logFluoroTime, setLogFluoroTime] = useState("12.5");
  const [logRadDose, setLogRadDose] = useState("450");
  const [logFindings, setLogFindings] = useState("");
  const [logComplications, setLogComplications] = useState("None");
  const [logOutcome, setLogOutcome] = useState("Successful angiogram and PTCA");
  const [logStentsDeployed, setLogStentsDeployed] = useState("0");
  const [logAssistantDoctor, setLogAssistantDoctor] = useState("Dr. Kabir Roy");
  const [logScrubNurse, setLogScrubNurse] = useState("Nurse Maya Sen");
  const [logCircNurse, setLogCircNurse] = useState("Nurse Vipul Patel");
  const [logTech, setLogTech] = useState("Tech Rohit Kumar");
  const [logPostNotes, setLogPostNotes] = useState("");
  const [logDischargeInst, setLogDischargeInst] = useState("Keep site dry. Rest for 24 hours.");
  const [logFollowUpReq, setLogFollowUpReq] = useState(true);
  const [logFollowUpDate, setLogFollowUpDate] = useState("");
  
  // Custom states for dynamically adding devices/consumables inside report modal
  const [tempDevices, setTempDevices] = useState<DeviceUsed[]>([{ type: "Stent", brand: "Xience", size: "3.0 x 18mm", location: "LAD Mid" }]);
  const [tempConsumables, setTempConsumables] = useState<ConsumableUsed[]>([
    { item: "Contrast Media (Omnipaque)", quantity: 1, lotNumber: "LOT-9921" },
    { item: "6F Sheath", quantity: 1, lotNumber: "LOT-8831" }
  ]);

  // Calibration Form states
  const [calibNotes, setCalibNotes] = useState("");
  const [calibStatus, setCalibStatus] = useState<"available" | "maintenance">("available");

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRooms, rProcs, rEquip, rStats] = await Promise.all([
        fetch("/api/v1/hims/cathlab/rooms"),
        fetch("/api/v1/hims/cathlab/procedures"),
        fetch("/api/v1/hims/cathlab/equipment"),
        fetch("/api/v1/hims/cathlab/stats")
      ]);

      if (rRooms.ok) setRooms(await rRooms.json());
      if (rProcs.ok) setProcedures(await rProcs.json());
      if (rEquip.ok) setEquipmentList(await rEquip.json());
      if (rStats.ok) setStats(await rStats.json());
    } catch (e) {
      console.error("Failed to sync Cath Lab data:", e);
      setErrorAlert("Failed to sync with Cath Lab management services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoomNum || !formRoomName) {
      setErrorAlert("Please specify Suite Room Number and Name.");
      return;
    }
    try {
      const res = await fetch("/api/v1/hims/cathlab/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber: formRoomNum,
          name: formRoomName,
          hasHemodynamicMonitoring: formRoomHemodynamic,
          hasContrastInjector: formRoomContrast,
          hasIvus: formRoomIvus,
          hasOct: formRoomOct,
          hasFfr: formRoomFfr,
          hasRotablator: formRoomRotablator,
          hasIntraAorticBalloonPump: formRoomIABP,
          hasTemporaryPacemaker: formRoomPacemaker,
          headNurse: formRoomHeadNurse,
          contactNumber: formRoomContact,
          notes: formRoomNotes,
          equipmentList: [
            "Cardiac C-Arm Imaging System",
            "Hemodynamic Multi-parameter Monitor",
            "Automatic Dual Contrast Injector"
          ]
        })
      });
      if (res.ok) {
        setSuccessMsg("✓ Cardiac Cath Lab Suite registered successfully!");
        setShowRoomModal(false);
        // Reset fields
        setFormRoomNum("");
        setFormRoomName("");
        setFormRoomHeadNurse("");
        setFormRoomContact("");
        setFormRoomNotes("");
        fetchData();
      } else {
        const d = await res.json();
        setErrorAlert(d.detail || "Failed to register suite room.");
      }
    } catch (err) {
      setErrorAlert("Network error registering suite.");
    }
  };

  const handleScheduleProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientName || !formRoomId || !formScheduledDate) {
      setErrorAlert("Please specify patient, cath suite room, and scheduled date.");
      return;
    }
    try {
      const res = await fetch("/api/v1/hims/cathlab/procedures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: formPatientId || `PAT-${Math.floor(100 + Math.random() * 900)}`,
          patientName: formPatientName,
          roomId: formRoomId,
          procedureType: formProcedureType,
          priority: formPriority,
          scheduledDate: new Date(formScheduledDate).toISOString(),
          scheduledDurationMinutes: Number(formDuration),
          referringDoctor: formReferringDoctor,
          performingDoctor: formPerformingDoctor,
          fastingRequired: formFastingRequired,
          contrastAllergy: formContrastAllergy,
          anticoagulationStatus: formAnticoagulation,
          renalFunction: formRenalFunction,
          preProcedureNotes: formPreNotes
        })
      });
      if (res.ok) {
        setSuccessMsg("✓ Cardiac procedure successfully scheduled and blocked in room grid!");
        setShowScheduleModal(false);
        // Reset fields
        setFormPatientName("");
        setFormPatientId("");
        setFormPreNotes("");
        fetchData();
      } else {
        const d = await res.json();
        setErrorAlert(d.detail || "Scheduling validation error.");
      }
    } catch (err) {
      setErrorAlert("Network error scheduling procedure.");
    }
  };

  const handleUpdateProcedureStatus = async (procId: string, targetStatus: string) => {
    try {
      const res = await fetch(`/api/v1/hims/cathlab/procedures/${procId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus })
      });
      if (res.ok) {
        setSuccessMsg(`✓ Procedure state moved to ${targetStatus.toUpperCase()} successfully.`);
        fetchData();
      } else {
        const d = await res.json();
        setErrorAlert(d.detail || "Failed to transition procedure state.");
      }
    } catch (err) {
      setErrorAlert("Error reaching server services.");
    }
  };

  const handleStartProcedure = (proc: CathLabProcedure) => {
    // Moves scheduled or ready directly to In Progress
    handleUpdateProcedureStatus(proc.id, "in_progress");
  };

  const handleOpenReportModal = (proc: CathLabProcedure) => {
    setShowReportModal(proc);
    setLogFindings(proc.findings || "");
    setLogComplications(proc.complications || "None");
    setLogOutcome(proc.outcome || "Successful");
    setLogStentsDeployed(String(proc.stentsDeployed || 0));
    setLogAccessSite(proc.accessSite || "radial");
    setLogAnesthesia(proc.anesthesiaType || "local");
    setLogContrastVol(String(proc.contrastVolumeMl || 80));
    setLogFluoroTime(String(proc.fluoroscopyTimeMinutes || 12.5));
    setLogRadDose(String(proc.radiationDose || 450));
    setLogAssistantDoctor(proc.assistantDoctor || "Dr. Kabir Roy");
    setLogScrubNurse(proc.scrubNurse || "Nurse Maya Sen");
    setLogCircNurse(proc.circulatingNurse || "Nurse Vipul Patel");
    setLogTech(proc.technologist || "Tech Rohit Kumar");
    setLogPostNotes(proc.postProcedureNotes || "");
    setLogDischargeInst(proc.dischargeInstructions || "Keep site dry. Rest for 24 hours.");
    setLogFollowUpReq(proc.followUpRequired);
    setLogFollowUpDate(proc.followUpDate ? proc.followUpDate.split("T")[0] : "");
  };

  const handleSaveFindingsReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReportModal) return;
    try {
      const res = await fetch(`/api/v1/hims/cathlab/procedures/${showReportModal.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessSite: logAccessSite,
          anesthesiaType: logAnesthesia,
          contrastVolumeMl: Number(logContrastVol),
          fluoroscopyTimeMinutes: Number(logFluoroTime),
          radiationDose: Number(logRadDose),
          findings: logFindings,
          complications: logComplications,
          outcome: logOutcome,
          devicesUsed: tempDevices,
          stentsDeployed: Number(logStentsDeployed),
          assistantDoctor: logAssistantDoctor,
          scrubNurse: logScrubNurse,
          circulatingNurse: logCircNurse,
          technologist: logTech,
          consumablesUsed: tempConsumables,
          postProcedureNotes: logPostNotes,
          dischargeInstructions: logDischargeInst,
          followUpRequired: logFollowUpReq,
          followUpDate: logFollowUpDate ? new Date(logFollowUpDate).toISOString() : null
        })
      });

      if (res.ok) {
        // Complete procedure status
        await handleUpdateProcedureStatus(showReportModal.id, "completed");
        setSuccessMsg("✓ Digital coronary report compiled and clinical findings synched.");
        setShowReportModal(null);
        fetchData();
      } else {
        const d = await res.json();
        setErrorAlert(d.detail || "Error saving findings report.");
      }
    } catch (err) {
      setErrorAlert("Network error compiling cardiological report.");
    }
  };

  const handleCalibrateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCalibrateModal) return;
    try {
      const res = await fetch(`/api/v1/hims/cathlab/equipment/${showCalibrateModal.id}/calibrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: calibNotes,
          status: calibStatus
        })
      });
      if (res.ok) {
        setSuccessMsg(`✓ Certified calibration recorded for ${showCalibrateModal.name}.`);
        setShowCalibrateModal(null);
        setCalibNotes("");
        fetchData();
      } else {
        setErrorAlert("Failed to log calibration.");
      }
    } catch (err) {
      setErrorAlert("Error communicating calibration update.");
    }
  };

  // Helper styles
  const getProcedureTypeLabel = (type: string) => {
    switch (type) {
      case "coronary_angiogram": return "🩺 Coronary Angiogram";
      case "left_ventriculogram": return "🩺 Left Ventriculogram";
      case "aortogram": return "🩺 Aortogram";
      case "peripheral_angiogram": return "🩺 Peripheral Angiogram";
      case "ptca": return "⚡ PTCA Angioplasty";
      case "stent_placement": return "⚡ Stent Placement";
      case "valvuloplasty": return "⚡ Valvuloplasty";
      case "tavi": return "🫀 TAVI Implantation";
      case "mitraclip": return "🫀 MitraClip Fix";
      case "pacemaker_implant": return "⚡ Pacemaker Implant";
      case "icd_implant": return "⚡ ICD Implant";
      case "ep_study": return "🩺 EP Study";
      case "ablation": return "⚡ Cardiac Ablation";
      default: return type.replace(/_/g, " ").toUpperCase();
    }
  };

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case "stat": return "bg-purple-100 text-purple-800 border-purple-200 animate-pulse";
      case "emergency": return "bg-red-100 text-red-800 border-red-200 font-black animate-pulse";
      case "urgent": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-50 text-blue-700 border-blue-200";
      case "ready": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "in_progress": return "bg-purple-50 text-purple-700 border-purple-200 animate-pulse font-bold";
      case "completed": return "bg-slate-100 text-slate-700 border-slate-200";
      case "cancelled": return "bg-rose-100 text-rose-700 border-rose-200";
      case "postponed": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div id="cura-cath-lab-panel-root" className="space-y-6 animate-fade-in">
      
      {/* 📊 BENTO KPI HEADER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Procedures */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Procedures</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-purple-600">
                {procedures.filter(p => p.status === "in_progress").length}
              </span>
              <span className="text-xs font-semibold text-slate-400">in cath rooms</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Live contrast-guided logs</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
        </div>

        {/* KPI 2: Available Suites */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Suites</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">
                {rooms.filter(r => r.status === "available").length}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ {rooms.length} free</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">HEPA filtered and sterile</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 3: Backlog (Urgent/Emergency) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urgent & STAT Backlog</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-rose-600">
                {procedures.filter(p => ["stat", "emergency"].includes(p.priority) && p.status !== "completed").length}
              </span>
              <span className="text-xs font-semibold text-slate-400">critical orders</span>
            </div>
            <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Prioritized scheduling block
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 4: Total Procedures Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Procedures scheduled</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">{stats.todayProcedures || 0}</span>
              <span className="text-xs font-semibold text-slate-400">today</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">
              {stats.completedToday || 0} completed successfully
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* 🧭 NAVIGATION PANEL CONTROL */}
      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto gap-1">
        {[
          { id: "suites", label: "🫀 Operational Cath Suites" },
          { id: "procedures", label: "🗓️ Procedure Logs & Intake" },
          { id: "equipment", label: "⚙️ Equipment & Calibration" },
          { id: "analytics", label: "📊 Diagnostic Analytics" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id as any)}
            className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap border-0 cursor-pointer ${
              activePanel === tab.id 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
        
        {/* Sync trigger */}
        <button 
          onClick={fetchData}
          disabled={loading}
          className="ml-auto text-xs font-extrabold px-3 py-2 text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Sync
        </button>
      </div>

      {/* ==================== PANEL 1: SUITES ==================== */}
      {activePanel === "suites" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-800">Heart Cath & Intervention Suites</h3>
              <p className="text-xs text-slate-400">Live monitoring of room availability, capabilities, and equipment.</p>
            </div>
            <button 
              onClick={() => setShowRoomModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold border-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Register Cath Suite
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => {
              const activeProc = procedures.find(p => p.roomId === room.id && p.status === "in_progress");
              return (
                <div key={room.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  {/* Suite header */}
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.roomNumber}</span>
                      <h4 className="text-xs font-black text-slate-800">{room.name}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      room.status === "available" ? "bg-emerald-50 text-emerald-700" :
                      room.status === "in_use" ? "bg-purple-100 text-purple-700 animate-pulse font-black" :
                      room.status === "cleaning" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      ● {room.status}
                    </span>
                  </div>

                  {/* Suite Capabilities */}
                  <div className="p-4 flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Suite Modalities</span>
                      <div className="flex flex-wrap gap-1">
                        {room.hasHemodynamicMonitoring && <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">🩺 Hemodynamic</span>}
                        {room.hasContrastInjector && <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">💉 Contrast Injector</span>}
                        {room.hasIvus && <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">🔊 IVUS</span>}
                        {room.hasOct && <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">✨ OCT Optics</span>}
                        {room.hasFfr && <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">📐 FFR Gauge</span>}
                        {room.hasRotablator && <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">⚙️ Rotablator</span>}
                        {room.hasIntraAorticBalloonPump && <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">🫁 IABP Pump</span>}
                        {room.hasTemporaryPacemaker && <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">⚡ Temp Pacemaker</span>}
                      </div>
                    </div>

                    {/* Active procedure in suite */}
                    {room.status === "in_use" && activeProc ? (
                      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
                        <span className="text-[8px] font-black text-purple-700 uppercase tracking-wider block animate-pulse">⚡ ACTIVE OPERATION IN PROGRESS</span>
                        <div className="text-xs font-black text-slate-800">{activeProc.patientName}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{getProcedureTypeLabel(activeProc.procedureType)}</div>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold">
                          <User className="h-3 w-3 text-purple-500" /> {activeProc.performingDoctor}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-center text-[10px] text-slate-400 font-semibold">
                        No active procedure. Ready for next scheduled intake.
                      </div>
                    )}

                    {/* Staff */}
                    <div className="pt-2 border-t border-slate-50 grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider block text-[8px]">Head Nurse</span>
                        <span className="font-bold text-slate-700">{room.headNurse || "Unassigned"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider block text-[8px]">Contact</span>
                        <span className="font-bold text-slate-700">{room.contactNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== PANEL 2: PROCEDURES LOG ==================== */}
      {activePanel === "procedures" && (
        <div className="space-y-4">
          
          {/* Header Filters & Scheduling */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input 
                type="text"
                placeholder="Search procedures by patient name..."
                value={procedureSearch}
                onChange={e => setProcedureSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select 
                value={procedureStatusFilter}
                onChange={e => setProcedureStatusFilter(e.target.value)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="ready">Prepped & Ready</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select 
                value={procedurePriorityFilter}
                onChange={e => setProcedurePriorityFilter(e.target.value)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
              >
                <option value="">All Priorities</option>
                <option value="elective">Elective</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
                <option value="stat">STAT</option>
              </select>

              <button 
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold border-0 cursor-pointer flex items-center gap-1.5 ml-auto md:ml-0 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Schedule Procedure
              </button>
            </div>
          </div>

          {/* Procedures Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20">
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Case ID</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Patient Details</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Intervention Type</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Priority</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Scheduled Time</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Performing Doctor / Suite</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Safety Checklist</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {procedures
                    .filter(p => (!procedureStatusFilter || p.status === procedureStatusFilter) && 
                                 (!procedurePriorityFilter || p.priority === procedurePriorityFilter) &&
                                 (!procedureSearch || p.patientName.toLowerCase().includes(procedureSearch.toLowerCase())))
                    .map(p => {
                      const roomName = rooms.find(r => r.id === p.roomId)?.roomNumber || "Suite " + p.roomId;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/40">
                          <td className="p-4 font-mono font-black text-slate-500 text-xs">{p.procedureNumber}</td>
                          <td className="p-4">
                            <span className="font-extrabold text-slate-800 block text-xs">{p.patientName}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">ID: {p.patientId}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-700 text-xs">
                              {getProcedureTypeLabel(p.procedureType)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getPriorityBadge(p.priority)}`}>
                              {p.priority}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-semibold text-slate-500">
                            {new Date(p.scheduledDate).toLocaleString()}
                          </td>
                          <td className="p-4 font-semibold text-xs text-slate-600">
                            <div>{p.performingDoctor}</div>
                            <div className="text-[10px] text-purple-600 font-extrabold flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" /> {roomName}
                            </div>
                          </td>
                          <td className="p-4 text-[10px]">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1">
                                <span className={p.fastingRequired ? "text-emerald-600 font-bold" : "text-slate-400 font-bold"}>
                                  {p.fastingRequired ? "✓ Fasting" : "✗ Fasting"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={p.contrastAllergy ? "text-rose-600 font-bold animate-pulse" : "text-emerald-600 font-bold"}>
                                  {p.contrastAllergy ? "⚠️ Contrast Allergy!" : "✓ No Allergy"}
                                </span>
                              </div>
                              <div className="text-[9px] text-slate-400">Renal: {p.renalFunction}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getStatusBadge(p.status)}`}>
                              ● {p.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {p.status === "scheduled" && (
                                <button 
                                  onClick={() => handleUpdateProcedureStatus(p.id, "ready")}
                                  className="text-[10px] font-black px-2.5 py-1 text-white bg-blue-600 hover:bg-blue-700 border-0 rounded-lg cursor-pointer shadow-sm"
                                >
                                  Mark Ready
                                </button>
                              )}
                              {p.status === "ready" && (
                                <button 
                                  onClick={() => handleStartProcedure(p)}
                                  className="text-[10px] font-black px-2.5 py-1 text-white bg-purple-600 hover:bg-purple-700 border-0 rounded-lg cursor-pointer shadow-sm flex items-center gap-0.5"
                                >
                                  <Play className="h-3 w-3 fill-current" /> Start Case
                                </button>
                              )}
                              {p.status === "in_progress" && (
                                <button 
                                  onClick={() => handleOpenReportModal(p)}
                                  className="text-[10px] font-black px-2.5 py-1 text-white bg-emerald-600 hover:bg-emerald-700 border-0 rounded-lg cursor-pointer shadow-sm"
                                >
                                  Write Report & Close
                                </button>
                              )}
                              {p.status === "completed" && (
                                <button 
                                  onClick={() => {
                                    alert(`Findings compiled for ${p.patientName}.\nFluoroscopy: ${p.fluoroscopyTimeMinutes} min\nRadiation Dose: ${p.radiationDose} mGy\nDeployed Stents: ${p.stentsDeployed}\nFindings: ${p.findings}`);
                                  }}
                                  className="text-[10px] font-bold px-2 py-1 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg bg-white cursor-pointer"
                                >
                                  View Summary
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PANEL 3: EQUIPMENT & CALIBRATION ==================== */}
      {activePanel === "equipment" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <h3 className="text-sm font-black text-slate-800">Cardiology Diagnostics & Imaging Fleet</h3>
            <p className="text-xs text-slate-400">Preventative maintenance, compliance calibration tracking, and safety approvals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipmentList.map(eq => {
              const nextCalib = new Date(eq.nextCalibrationDate);
              const isOverdue = nextCalib.getTime() < Date.now();
              return (
                <div key={eq.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{eq.equipmentType}</span>
                      <h4 className="text-xs font-black text-slate-800">{eq.name}</h4>
                      <p className="text-[10px] text-slate-400">SN: {eq.serialNumber} | {eq.manufacturer} {eq.model}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      eq.status === "available" ? "bg-emerald-50 text-emerald-700" :
                      eq.status === "maintenance" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                    }`}>
                      {eq.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50 text-[10px] font-semibold text-slate-500">
                    <div>
                      <span className="text-slate-400 text-[8px] uppercase tracking-wider block">Last Calibrated</span>
                      <span>{new Date(eq.lastCalibrationDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] uppercase tracking-wider block">Next Due Date</span>
                      <span className={isOverdue ? "text-red-600 font-extrabold animate-pulse" : ""}>
                        {new Date(eq.nextCalibrationDate).toLocaleDateString()} {isOverdue && "⚠️ DUE"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[10px] border-t border-slate-50">
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {eq.location}
                    </span>
                    <button 
                      onClick={() => {
                        setShowCalibrateModal(eq);
                        setCalibStatus("available");
                      }}
                      className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 text-[10px] font-black rounded-lg cursor-pointer bg-white"
                    >
                      Record Calibration
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== PANEL 4: ANALYTICS ==================== */}
      {activePanel === "analytics" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-800">Intraoperative & Utilization Metrics</h3>
            <p className="text-xs text-slate-400">Continuous monitoring of radiation doses, contrast usage, and fluoroscopy duration to preserve patient safety.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Radiation Dose Metrics */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 text-purple-700">
                ☢️ Radiation Dose and Safety Index
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">Monitoring cumulative patient fluoroscopy time and milligray (mGy) indexes.</p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Average Angiogram Radiation</span>
                    <span>320 mGy</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Average Complex PTCA Angioplasty</span>
                    <span>680 mGy</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Critical Safety Limit Warning</span>
                    <span>1200 mGy</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Utilization Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 text-blue-700">
                📈 Room Allocation & Flow Rates
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">Daily slot optimization across operational suites.</p>

              <div className="space-y-4">
                {stats.roomUtilization && stats.roomUtilization.map((ru: any, idx: number) => {
                  const pct = Math.min((ru.scheduled / 6) * 100, 100);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-20 text-[11px] font-black text-slate-700">Suite {ru.room}</div>
                      <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="w-24 text-right text-[11px] font-extrabold text-slate-600">
                        {ru.scheduled} Cases ({ru.status})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== MODAL: SCHEDULE PROCEDURE ==================== */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-800">Schedule Cardiological Intervention</h3>
                <p className="text-xs text-slate-400">Blocks off a dedicated Cath Lab Room slot and notifies the clinical team.</p>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black border-0 bg-transparent text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleProcedure} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Patient Selector */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Patient</label>
                  <select 
                    value={formPatientId}
                    onChange={e => {
                      setFormPatientId(e.target.value);
                      const chosen = patients.find(p => p.id === e.target.value);
                      if (chosen) setFormPatientName(chosen.fullName);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">-- Choose active patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.id})</option>
                    ))}
                  </select>
                </div>

                {/* Patient Name fallback (if manual) */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name Reference</label>
                  <input 
                    type="text"
                    value={formPatientName}
                    onChange={e => setFormPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                {/* Cath Lab Room Selection */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Cath Suite</label>
                  <select 
                    value={formRoomId}
                    onChange={e => setFormRoomId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="">-- Select Room --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.roomNumber} - {r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Procedure Type */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Procedure Type</label>
                  <select 
                    value={formProcedureType}
                    onChange={e => setFormProcedureType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="coronary_angiogram">🩺 Coronary Angiogram</option>
                    <option value="left_ventriculogram">🩺 Left Ventriculogram</option>
                    <option value="aortogram">🩺 Aortogram</option>
                    <option value="peripheral_angiogram">🩺 Peripheral Angiogram</option>
                    <option value="ptca">⚡ PTCA Angioplasty</option>
                    <option value="stent_placement">⚡ Coronary Stent Placement</option>
                    <option value="valvuloplasty">⚡ Balloon Valvuloplasty</option>
                    <option value="tavi">🫀 TAVI Transcatheter Valve</option>
                    <option value="pacemaker_implant">⚡ Pacemaker Implantation</option>
                    <option value="ep_study">🩺 Electrophysiology (EP) Study</option>
                    <option value="ablation">⚡ Ablation Therapy</option>
                  </select>
                </div>

                {/* Date Scheduled */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scheduled Date & Time</label>
                  <input 
                    type="datetime-local"
                    value={formScheduledDate}
                    onChange={e => setFormScheduledDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration (Minutes)</label>
                  <input 
                    type="number"
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Urgency Priority</label>
                  <select 
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="elective">Elective</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                    <option value="stat">STAT</option>
                  </select>
                </div>

                {/* Performing Doctor */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performing Cardiologist</label>
                  <input 
                    type="text"
                    value={formPerformingDoctor}
                    onChange={e => setFormPerformingDoctor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

              </div>

              {/* Patient Preparation Safety Checklist */}
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-3">
                <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest block flex items-center gap-1">
                  <Shield className="h-4 w-4" /> CLINICAL PREPARATION SAFETY CHECKS
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formFastingRequired}
                      onChange={e => setFormFastingRequired(e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    Fasting Required (NPO 6+ Hours)
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formContrastAllergy}
                      onChange={e => setFormContrastAllergy(e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    Known Contrast Allergy Risk
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Anticoagulation Status</label>
                    <input 
                      type="text"
                      value={formAnticoagulation}
                      onChange={e => setFormAnticoagulation(e.target.value)}
                      placeholder="e.g. Discontinued Warfarin"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Renal Clearance</label>
                    <input 
                      type="text"
                      value={formRenalFunction}
                      onChange={e => setFormRenalFunction(e.target.value)}
                      placeholder="e.g. Creatinine 1.1"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Pre-notes */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pre-Procedure / Intake Notes</label>
                <textarea 
                  rows={2}
                  value={formPreNotes}
                  onChange={e => setFormPreNotes(e.target.value)}
                  placeholder="Cardiac status, previous echo values, coronary history..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border-0 cursor-pointer shadow-sm"
                >
                  Block Cath Suite & Schedule
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD CATH LAB ROOM ==================== */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-800">Register New Cardiac Cath Suite</h3>
                <p className="text-xs text-slate-400">Deploy high-cost interventional space and link diagnostic modalities.</p>
              </div>
              <button 
                onClick={() => setShowRoomModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black border-0 bg-transparent text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterRoom} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Suite Number</label>
                  <input 
                    type="text"
                    required
                    value={formRoomNum}
                    onChange={e => setFormRoomNum(e.target.value)}
                    placeholder="e.g. SUITE-C1"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Display Name</label>
                  <input 
                    type="text"
                    required
                    value={formRoomName}
                    onChange={e => setFormRoomName(e.target.value)}
                    placeholder="e.g. Electrophysiology Suite"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Head Nurse</label>
                  <input 
                    type="text"
                    value={formRoomHeadNurse}
                    onChange={e => setFormRoomHeadNurse(e.target.value)}
                    placeholder="e.g. Sister Mercy"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Extension</label>
                  <input 
                    type="text"
                    value={formRoomContact}
                    onChange={e => setFormRoomContact(e.target.value)}
                    placeholder="e.g. Ext 449"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Capabilities checklist */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Available Modalities & Systems</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={formRoomHemodynamic} onChange={e => setFormRoomHemodynamic(e.target.checked)} className="rounded text-purple-600" />
                    Hemodynamic Monitoring
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={formRoomContrast} onChange={e => setFormRoomContrast(e.target.checked)} className="rounded text-purple-600" />
                    Automatic contrast injector
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={formRoomIvus} onChange={e => setFormRoomIvus(e.target.checked)} className="rounded text-purple-600" />
                    Intravascular Ultrasound (IVUS)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={formRoomOct} onChange={e => setFormRoomOct(e.target.checked)} className="rounded text-purple-600" />
                    Optical Coherence Tomography (OCT)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={formRoomFfr} onChange={e => setFormRoomFfr(e.target.checked)} className="rounded text-purple-600" />
                    Fractional Flow Reserve (FFR)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={formRoomRotablator} onChange={e => setFormRoomRotablator(e.target.checked)} className="rounded text-purple-600" />
                    Rotablator system
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={formRoomIABP} onChange={e => setFormRoomIABP(e.target.checked)} className="rounded text-purple-600" />
                    Intra-aortic balloon pump (IABP)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={formRoomPacemaker} onChange={e => setFormRoomPacemaker(e.target.checked)} className="rounded text-purple-600" />
                    Temporary Pacemaker console
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Notes / Limitations</label>
                <textarea 
                  rows={2}
                  value={formRoomNotes}
                  onChange={e => setFormRoomNotes(e.target.value)}
                  placeholder="HEPA audit dates, space limitations..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border-0 cursor-pointer shadow-sm"
                >
                  Create Suite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: INTERVENTION FINDINGS & COMPLETED REPORT ==================== */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-purple-600 animate-pulse" /> 
                  Intraoperative Case Findings Report
                </h3>
                <p className="text-xs text-slate-400">Record fluoroscopy time, contrast volumes, radiation logs, and deploy stents/devices.</p>
              </div>
              <button 
                onClick={() => setShowReportModal(null)}
                className="text-slate-400 hover:text-slate-600 font-black border-0 bg-transparent text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFindingsReport} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Demographics / General */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[8px]">Patient</span>
                  <span className="font-extrabold text-slate-800">{showReportModal.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[8px]">Procedure</span>
                  <span className="font-extrabold text-slate-800">{getProcedureTypeLabel(showReportModal.procedureType)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[8px]">Case Number</span>
                  <span className="font-mono font-extrabold text-slate-800">{showReportModal.procedureNumber}</span>
                </div>
              </div>

              {/* Core metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Access Site</label>
                  <select value={logAccessSite} onChange={e => setLogAccessSite(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <option value="radial">Radial Artery</option>
                    <option value="femoral">Femoral Artery</option>
                    <option value="brachial">Brachial Artery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Anesthesia Type</label>
                  <select value={logAnesthesia} onChange={e => setLogAnesthesia(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <option value="local">Local Anesthetic</option>
                    <option value="conscious_sedation">Conscious Sedation</option>
                    <option value="general">General Anesthesia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contrast Volume (ml)</label>
                  <input type="number" value={logContrastVol} onChange={e => setLogContrastVol(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fluoro Time (Minutes)</label>
                  <input type="number" step="0.1" value={logFluoroTime} onChange={e => setLogFluoroTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Radiation Dose (mGy)</label>
                  <input type="number" value={logRadDose} onChange={e => setLogRadDose(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stents Deployed</label>
                  <input type="number" value={logStentsDeployed} onChange={e => setLogStentsDeployed(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Outcome</label>
                  <input type="text" value={logOutcome} onChange={e => setLogOutcome(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>
              </div>

              {/* Text findings */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cardiological Findings</label>
                <textarea 
                  rows={3}
                  required
                  value={logFindings}
                  onChange={e => setLogFindings(e.target.value)}
                  placeholder="Describe stenosis, coronary blockages (e.g., 90% LAD proximal stenosis), vessel branches..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Complications (if any)</label>
                <input type="text" value={logComplications} onChange={e => setLogComplications(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>

              {/* Staff Assignment */}
              <div className="grid grid-cols-4 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Assistant Cardiologist</label>
                  <input type="text" value={logAssistantDoctor} onChange={e => setLogAssistantDoctor(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Scrub Nurse</label>
                  <input type="text" value={logScrubNurse} onChange={e => setLogScrubNurse(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Circulating Nurse</label>
                  <input type="text" value={logCircNurse} onChange={e => setLogCircNurse(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Technologist</label>
                  <input type="text" value={logTech} onChange={e => setLogTech(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                </div>
              </div>

              {/* Post procedure and follow up */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Discharge Instructions</label>
                  <input type="text" value={logDischargeInst} onChange={e => setLogDischargeInst(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={logFollowUpReq} onChange={e => setLogFollowUpReq(e.target.checked)} className="rounded text-purple-600" />
                      Follow-up Required
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Follow-up Date</label>
                    <input type="date" value={logFollowUpDate} onChange={e => setLogFollowUpDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                  </div>
                </div>
              </div>

              {/* Post Notes */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Post-Procedure Notes</label>
                <textarea rows={2} value={logPostNotes} onChange={e => setLogPostNotes(e.target.value)} placeholder="Intensive care instructions, vascular closure device used (e.g. Angio-Seal)..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowReportModal(null)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border-0 cursor-pointer shadow-sm"
                >
                  Compile Findings Report & Close Case
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: RECORD CALIBRATION ==================== */}
      {showCalibrateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-800">Record Equipment Calibration</h3>
                <p className="text-xs text-slate-400">Certify safety compliance and reset next calibration dates.</p>
              </div>
              <button 
                onClick={() => setShowCalibrateModal(null)}
                className="text-slate-400 hover:text-slate-600 font-black border-0 bg-transparent text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCalibrateEquipment} className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="font-black text-slate-800">{showCalibrateModal.name}</div>
                <div className="text-slate-400 font-semibold">Model: {showCalibrateModal.model} | Serial: {showCalibrateModal.serialNumber}</div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Calibration Notes</label>
                <textarea 
                  rows={3}
                  required
                  value={calibNotes}
                  onChange={e => setCalibNotes(e.target.value)}
                  placeholder="Describe calibration tests, standard offsets, laser or mechanical alignments verified..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Equipment Status After Calibration</label>
                <select value={calibStatus} onChange={e => setCalibStatus(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="available">Approved - Available for Clinical Use</option>
                  <option value="maintenance">Maintenance Required - Tag Out</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowCalibrateModal(null)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border-0 cursor-pointer shadow-sm"
                >
                  Log Calibration Event
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
