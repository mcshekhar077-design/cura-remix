import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle, 
  Calendar, 
  Users, 
  Bell, 
  Play, 
  Plus, 
  Trash2, 
  Map, 
  Navigation, 
  Clock, 
  Compass, 
  UserCheck, 
  RefreshCw,
  Search,
  Activity,
  AlertTriangle
} from "lucide-react";

interface Geofence {
  id: string;
  name: string;
  description?: string;
  geofenceType: "clinic" | "hospital" | "patient_home" | "restricted" | "safe_zone" | "temporary";
  triggerType: "enter" | "exit" | "both";
  latitude: number;
  longitude: number;
  radiusMeters: number;
  status: "active" | "inactive";
  associatedPatientId?: string;
  associatedDoctorId?: string;
  createdAt: string;
}

interface GeofenceEvent {
  id: string;
  geofenceId: string;
  geofenceName: string;
  userId?: string;
  userName?: string;
  patientId?: string;
  patientName?: string;
  eventType: "enter" | "exit";
  latitude: number;
  longitude: number;
  eventTime: string;
  notes?: string;
}

interface GeofenceAttendance {
  id: string;
  userId: string;
  userName: string;
  checkinTime?: string;
  checkinLatitude?: number;
  checkinLongitude?: number;
  checkoutTime?: string;
  checkoutLatitude?: number;
  checkoutLongitude?: number;
  geofenceId?: string;
  geofenceName?: string;
  verified: boolean;
  durationMinutes?: number;
  status: "present" | "absent" | "late" | "early_leave";
  createdAt: string;
}

interface PatientGeofenceAlert {
  id: string;
  patientId: string;
  patientName: string;
  geofenceId: string;
  geofenceName: string;
  severity: "low" | "medium" | "high" | "critical";
  latitude: number;
  longitude: number;
  resolved: boolean;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

interface GeofencingPanelProps {
  patients: Array<{ id: string; fullName: string }>;
  setSuccessMsg: (msg: string) => void;
  setErrorAlert: (msg: string | null) => void;
}

export default function GeofencingPanel({ patients, setSuccessMsg, setErrorAlert }: GeofencingPanelProps) {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [attendance, setAttendance] = useState<GeofenceAttendance[]>([]);
  const [alerts, setAlerts] = useState<PatientGeofenceAlert[]>([]);
  
  // Tab states: "overview" | "geofences" | "attendance" | "patient_safety"
  const [activeTab, setActiveTab] = useState<"overview" | "geofences" | "attendance" | "patient_safety">("overview");
  
  // Form and Simulation states
  const [loading, setLoading] = useState(false);
  const [newGfForm, setNewGfForm] = useState({
    name: "",
    description: "",
    geofenceType: "hospital" as Geofence["geofenceType"],
    triggerType: "both" as Geofence["triggerType"],
    latitude: 12.9716,
    longitude: 77.5946,
    radiusMeters: 150,
    associatedPatientId: ""
  });

  const [simEntity, setSimEntity] = useState({
    entityType: "staff" as "staff" | "patient",
    entityId: "doc-1",
    geofenceId: "gf-1",
    eventType: "enter" as "enter" | "exit",
    latitude: 12.9716,
    longitude: 77.5946
  });

  const [manualAttendance, setManualAttendance] = useState({
    userId: "doc-2",
    userName: "Dr. Sunita Rao",
    latitude: 12.9718,
    longitude: 77.5942,
    isCheckin: true
  });

  const [resolutionNotes, setResolutionNotes] = useState("");
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [fencesRes, eventsRes, attendanceRes, alertsRes] = await Promise.all([
        fetch("/api/v1/geofencing/geofences").then(res => res.json()),
        fetch("/api/v1/geofencing/events").then(res => res.json()),
        fetch("/api/v1/geofencing/attendance").then(res => res.json()),
        fetch("/api/v1/geofencing/patient/alerts").then(res => res.json())
      ]);

      if (fencesRes.success) setGeofences(fencesRes.data);
      if (eventsRes.success) setEvents(eventsRes.data);
      if (attendanceRes.success) setAttendance(attendanceRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (err: any) {
      console.error("Error loading geofencing data:", err);
      setErrorAlert("Failed to load Geofencing tracking telemetry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleCreateGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGfForm.name) return;

    try {
      const response = await fetch("/api/v1/geofencing/geofences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGfForm)
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`Geofence virtual boundary "${newGfForm.name}" registered successfully.`);
        setNewGfForm({
          name: "",
          description: "",
          geofenceType: "hospital",
          triggerType: "both",
          latitude: 12.9716,
          longitude: 77.5946,
          radiusMeters: 150,
          associatedPatientId: ""
        });
        fetchData();
      } else {
        setErrorAlert(data.detail || "Failed to register geofence.");
      }
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  const handleDeleteGeofence = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this geofence boundary?")) return;
    try {
      const response = await fetch(`/api/v1/geofencing/geofences/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg("Geofence deleted successfully.");
        fetchData();
      } else {
        setErrorAlert(data.detail);
      }
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  const handleSimulateTrigger = async () => {
    try {
      const response = await fetch("/api/v1/geofencing/simulate-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simEntity)
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`Successfully simulated ${simEntity.eventType.toUpperCase()} transition event.`);
        fetchData();
      } else {
        setErrorAlert(data.detail);
      }
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/v1/geofencing/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualAttendance)
      });
      const data = await response.json();
      if (data.success) {
        const checkType = manualAttendance.isCheckin ? "Check-in" : "Check-out";
        const verifiedText = data.data.verified ? "verified within Geofence" : "NOT on hospital premises";
        setSuccessMsg(`${checkType} recorded for ${manualAttendance.userName}. Attendance is ${verifiedText}.`);
        fetchData();
      } else {
        setErrorAlert(data.detail || "Failed to submit attendance.");
      }
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/geofencing/patient/alerts/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolutionNotes })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg("Patient safety alert resolved and logged.");
        setSelectedAlertId(null);
        setResolutionNotes("");
        fetchData();
      } else {
        setErrorAlert(data.detail);
      }
    } catch (err: any) {
      setErrorAlert(err.message);
    }
  };

  // Preset mock coordinates helper to populate forms quickly
  const applyPresetCoords = (type: "hospital" | "clinic" | "patient_home") => {
    if (type === "hospital") {
      setNewGfForm(prev => ({ ...prev, latitude: 12.9716, longitude: 77.5946, radiusMeters: 150 }));
      setSimEntity(prev => ({ ...prev, latitude: 12.9716, longitude: 77.5946 }));
      setManualAttendance(prev => ({ ...prev, latitude: 12.9718, longitude: 77.5942 }));
    } else if (type === "clinic") {
      setNewGfForm(prev => ({ ...prev, latitude: 12.9279, longitude: 77.6271, radiusMeters: 100 }));
      setSimEntity(prev => ({ ...prev, latitude: 12.9279, longitude: 77.6271 }));
      setManualAttendance(prev => ({ ...prev, latitude: 12.9281, longitude: 77.6275 }));
    } else {
      setNewGfForm(prev => ({ ...prev, latitude: 12.9345, longitude: 77.6101, radiusMeters: 100 }));
      setSimEntity(prev => ({ ...prev, latitude: 12.9362, longitude: 77.6119 })); // Out of safe zone
      setManualAttendance(prev => ({ ...prev, latitude: 12.9342, longitude: 77.6104 }));
    }
  };

  return (
    <div className="space-y-6" id="cura_geofencing_module">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> SECURE GPS REAL-TIME
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HOSPITAL GEOFENCING v1.0</span>
          </div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            📍 CURA Geofencing & Location-Aware Telemetry
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Automate staff attendance verification, enforce high-risk patient wander safety perimeters, 
            and monitor restricted medical zone access using multi-boundary circular virtual geofences.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto">
          <button
            onClick={fetchData}
            className="flex-1 md:flex-none py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Sync GPS
          </button>
        </div>
      </div>

      {/* METRIC CARD ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-sky-50 p-3 rounded-xl text-sky-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Fences</div>
            <div className="text-lg font-black text-slate-800">{geofences.length} boundaries</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${alerts.filter(a => !a.resolved).length > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wander Alerts</div>
            <div className="text-lg font-black text-slate-800">
              {alerts.filter(a => !a.resolved).length} active
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified On-Site</div>
            <div className="text-lg font-black text-slate-800">
              {attendance.filter(a => a.verified && a.status === "present").length} checked in
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-violet-50 p-3 rounded-xl text-violet-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Events Logged</div>
            <div className="text-lg font-black text-slate-800">{events.length} logs today</div>
          </div>
        </div>
      </div>

      {/* MINI TAB SWITCHER */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          🎛️ Real-Time Simulator Dashboard
        </button>
        <button
          onClick={() => setActiveTab("geofences")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "geofences" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          📍 Virtual Boundary Manager ({geofences.length})
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "attendance" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          👨‍⚕️ Staff Attendance Audit ({attendance.length})
        </button>
        <button
          onClick={() => setActiveTab("patient_safety")}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "patient_safety" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ⚠️ High-Risk Wander Patrol 
          {alerts.filter(a => !a.resolved).length > 0 && (
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* TAB CONTENT: 1. OVERVIEW & MAP SIMULATOR */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* MAP SIMULATION SCREEN */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  🗺️ Interactive Multi-Zone GPS Vector Map
                </h3>
                <p className="text-[11px] text-slate-500">
                  Simulate GPS tracking and transition events across virtual zones in Bengaluru.
                </p>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => applyPresetCoords("hospital")} 
                  className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-lg hover:bg-slate-200 border-0 cursor-pointer"
                >
                  CURA Main Hosp
                </button>
                <button 
                  onClick={() => applyPresetCoords("clinic")} 
                  className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-lg hover:bg-slate-200 border-0 cursor-pointer"
                >
                  Apex Clinic
                </button>
                <button 
                  onClick={() => applyPresetCoords("patient_home")} 
                  className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-lg hover:bg-slate-200 border-0 cursor-pointer"
                >
                  Home Perimeter
                </button>
              </div>
            </div>

            {/* MOCK MAP CANVAS DISPLAY */}
            <div className="relative h-[320px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
              
              {/* Radial grids indicating map boundaries */}
              <div className="absolute inset-0 opacity-15" style={{ 
                backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)", 
                backgroundSize: "20px 20px" 
              }}></div>

              {/* Grid axes */}
              <div className="absolute h-px w-full bg-slate-800 opacity-30"></div>
              <div className="absolute w-px h-full bg-slate-800 opacity-30"></div>

              {/* Map features (Roads grid layout) */}
              <div className="absolute inset-x-0 top-1/4 h-1 bg-slate-800/40 transform -rotate-12"></div>
              <div className="absolute inset-y-0 left-1/3 w-1 bg-slate-800/40 transform rotate-12"></div>
              <div className="absolute inset-x-0 bottom-1/3 h-1.5 bg-slate-800/30"></div>

              {/* Geofences rendered as glowing radial circles on our Mock Map */}
              {geofences.map((gf, idx) => {
                // Calculate position offsets based on coordinate diffs to spread out nodes nicely
                const defaultLat = 12.9716;
                const defaultLng = 77.5946;
                const topPercent = 50 - (gf.latitude - defaultLat) * 3000;
                const leftPercent = 50 + (gf.longitude - defaultLng) * 3000;

                const colorClasses = 
                  gf.geofenceType === "hospital" ? "border-sky-500 bg-sky-500/10 text-sky-400" :
                  gf.geofenceType === "clinic" ? "border-teal-500 bg-teal-500/10 text-teal-400" :
                  gf.geofenceType === "safe_zone" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" :
                  "border-red-500 bg-red-500/10 text-red-400";

                return (
                  <div
                    key={gf.id}
                    className="absolute rounded-full border-2 border-dashed flex flex-col items-center justify-center animate-pulse duration-1000"
                    style={{
                      top: `${Math.max(10, Math.min(90, topPercent))}%`,
                      left: `${Math.max(10, Math.min(90, leftPercent))}%`,
                      width: `${Math.max(50, Math.min(140, gf.radiusMeters / 1.5))}px`,
                      height: `${Math.max(50, Math.min(140, gf.radiusMeters / 1.5))}px`,
                      transform: "translate(-50%, -50%)"
                    }}
                  >
                    <div className="text-[9px] font-black tracking-tighter px-1.5 py-0.5 rounded bg-slate-900/90 shadow text-center max-w-[100px] truncate">
                      {gf.name}
                    </div>
                    <div className={`text-[8px] font-bold ${colorClasses.split(" ")[2]}`}>
                      {gf.radiusMeters}m
                    </div>
                  </div>
                );
              })}

              {/* Dynamic tracked simulation entity marker on the map */}
              <div 
                className="absolute transition-all duration-700 ease-out z-10"
                style={{
                  top: `${Math.max(15, Math.min(85, 50 - (simEntity.latitude - 12.9716) * 3000))}%`,
                  left: `${Math.max(15, Math.min(85, 50 + (simEntity.longitude - 77.5946) * 3000))}%`,
                  transform: "translate(-50%, -50%)"
                }}
              >
                <div className="relative">
                  {/* Ping effect */}
                  <span className="absolute -inset-1.5 rounded-full bg-indigo-500 animate-ping opacity-75"></span>
                  
                  {/* Map Pin */}
                  <div className="relative bg-indigo-600 text-white p-2 rounded-full shadow-lg border border-white">
                    <Compass className="h-4 w-4 animate-spin-slow text-white" />
                  </div>

                  {/* Bubble label */}
                  <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 bg-indigo-950 text-indigo-100 px-2 py-0.5 rounded text-[9px] font-extrabold whitespace-nowrap shadow border border-indigo-700/50 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full"></span>
                    SIM_TRACKER: {simEntity.entityType === "staff" ? "Dr. Rajesh Sharma" : "Patient Rajesh"}
                  </div>
                </div>
              </div>

              {/* Map Info overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-800 p-2.5 rounded-xl space-y-1 max-w-[200px] z-20">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-indigo-400" /> Active Tracking
                </div>
                <div className="text-[10px] font-mono text-slate-200">
                  Lat: {simEntity.latitude.toFixed(5)}<br />
                  Lng: {simEntity.longitude.toFixed(5)}
                </div>
              </div>
            </div>

            {/* QUICK CONTROLLER SLIDERS FOR TELEMETRY */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Latitude Adjustment</label>
                <input 
                  type="range" 
                  min="12.9100" 
                  max="12.9990" 
                  step="0.001" 
                  value={simEntity.latitude}
                  onChange={(e) => setSimEntity(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Longitude Adjustment</label>
                <input 
                  type="range" 
                  min="77.5700" 
                  max="77.6500" 
                  step="0.001" 
                  value={simEntity.longitude}
                  onChange={(e) => setSimEntity(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* SIMULATION ACTIONS SIDE PANEL */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                ⚡ Real-Time Signal Generator
              </h3>
              <p className="text-[11px] text-slate-500">
                Trigger entry/exit signals to test auto-verification workflows and alert relays.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* SELECT ENTITY TYPE */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Entity To Track</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimEntity(prev => ({ ...prev, entityType: "staff", entityId: "doc-1" }))}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      simEntity.entityType === "staff" 
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🩺 Clinician (Staff)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimEntity(prev => ({ ...prev, entityType: "patient", entityId: "PAT-001" }))}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      simEntity.entityType === "patient" 
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    👵 Patient PAT-001
                  </button>
                </div>
              </div>

              {/* SELECT GEOFENCE TARGET */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Select Geofence Zone</label>
                <select
                  value={simEntity.geofenceId}
                  onChange={(e) => setSimEntity(prev => ({ ...prev, geofenceId: e.target.value }))}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500"
                >
                  {geofences.map(gf => (
                    <option key={gf.id} value={gf.id}>{gf.name} ({gf.geofenceType})</option>
                  ))}
                </select>
              </div>

              {/* SELECT ACTION TYPE */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Transition Signal</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimEntity(prev => ({ ...prev, eventType: "enter" }))}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      simEntity.eventType === "enter" 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    📥 ENTER (Enter Zone)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimEntity(prev => ({ ...prev, eventType: "exit" }))}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      simEntity.eventType === "exit" 
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    📤 EXIT (Leave Zone)
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="button"
                onClick={handleSimulateTrigger}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer"
              >
                <Play className="h-4 w-4" /> Broadcast GPS Signal Update
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* LIVE FEED MINI-STREAM */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Transition Log Feed</h4>
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              </div>
              <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 text-[10px] font-mono scrollbar-thin">
                {events.length === 0 ? (
                  <div className="text-slate-400 text-center py-4">No events triggered yet.</div>
                ) : (
                  events.slice(0, 5).map(evt => (
                    <div key={evt.id} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-start gap-1.5 justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-700">
                          {evt.userName || evt.patientName || "System Entity"}
                        </div>
                        <div className="text-slate-400 text-[9px] truncate max-w-[170px]">
                          {evt.eventType === "enter" ? "✅ Entered" : "❌ Exited"} {evt.geofenceName}
                        </div>
                      </div>
                      <div className="text-[8px] text-slate-400">
                        {new Date(evt.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT: 2. VIRTUAL BOUNDARY MANAGER */}
      {activeTab === "geofences" && (
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* CREATE NEW GEOFENCE FORM */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                ➕ Establish New Geofence Zone
              </h3>
              <p className="text-[11px] text-slate-500">
                Setup a virtual radial bounding ring around coordinates.
              </p>
            </div>

            <form onSubmit={handleCreateGeofence} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Boundary Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Hospital Building Ward"
                  value={newGfForm.name}
                  onChange={(e) => setNewGfForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Geofence Type</label>
                <select
                  value={newGfForm.geofenceType}
                  onChange={(e) => setNewGfForm(prev => ({ ...prev, geofenceType: e.target.value as any }))}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500"
                >
                  <option value="hospital">🏥 Hospital Core Premises</option>
                  <option value="clinic">⚕️ Outpatient / Satellite Clinic</option>
                  <option value="safe_zone">💚 Patient Safety (Safe Zone)</option>
                  <option value="restricted">🚫 Restricted Access Zone</option>
                  <option value="patient_home">🏠 Patient Home Perimeter</option>
                  <option value="temporary">⏱️ Temporary Transit Zone</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newGfForm.latitude}
                    onChange={(e) => setNewGfForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newGfForm.longitude}
                    onChange={(e) => setNewGfForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Radius (Meters)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={newGfForm.radiusMeters}
                    onChange={(e) => setNewGfForm(prev => ({ ...prev, radiusMeters: parseInt(e.target.value) }))}
                    className="flex-1 text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500"
                  />
                  <span className="text-xs font-bold text-slate-500">meters</span>
                </div>
              </div>

              {/* ASSOCIATED PATIENT (Only shown for patient/safe zone types) */}
              {(newGfForm.geofenceType === "safe_zone" || newGfForm.geofenceType === "patient_home") && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Associated Patient</label>
                  <select
                    value={newGfForm.associatedPatientId}
                    onChange={(e) => setNewGfForm(prev => ({ ...prev, associatedPatientId: e.target.value }))}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="">-- Choose high-risk patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.id})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Trigger Mode</label>
                <select
                  value={newGfForm.triggerType}
                  onChange={(e) => setNewGfForm(prev => ({ ...prev, triggerType: e.target.value as any }))}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500"
                >
                  <option value="both">ENTER & EXIT Alerts (Standard)</option>
                  <option value="enter">ENTER Trigger Only</option>
                  <option value="exit">EXIT Trigger Only (Wander Defense)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Description / Notes</label>
                <textarea
                  placeholder="Clinical context or boundary coordinates details..."
                  rows={2}
                  value={newGfForm.description}
                  onChange={(e) => setNewGfForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500 focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Save Geofence Boundary
              </button>
            </form>
          </div>

          {/* LIST OF GEOFENCES */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  🛡️ Active Geofencing Rules & Coordinates
                </h3>
                <p className="text-[11px] text-slate-500">
                  Manage live virtual coordinates and compliance rules enforced.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Boundary / Details</th>
                    <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">GPS Coordinates</th>
                    <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Radius</th>
                    <th className="py-3 px-2 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {geofences.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-medium">No geofences saved. establish your first zone boundary on the left.</td>
                    </tr>
                  ) : (
                    geofences.map(gf => (
                      <tr key={gf.id} className="hover:bg-slate-50/50 transition-all text-xs">
                        <td className="py-3 px-2">
                          <div className="font-extrabold text-slate-800">{gf.name}</div>
                          {gf.description && <div className="text-[10px] text-slate-500">{gf.description}</div>}
                          {gf.associatedPatientId && (
                            <span className="mt-1 inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[9px] font-extrabold">
                              Patient: {gf.associatedPatientId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            gf.geofenceType === "hospital" ? "bg-sky-50 text-sky-700 border border-sky-100" :
                            gf.geofenceType === "clinic" ? "bg-teal-50 text-teal-700 border border-teal-100" :
                            gf.geofenceType === "safe_zone" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            "bg-purple-50 text-purple-700 border border-purple-100"
                          }`}>
                            {gf.geofenceType}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono text-[10px] text-slate-600">
                          {gf.latitude.toFixed(5)}, {gf.longitude.toFixed(5)}
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-700">
                          {gf.radiusMeters}m
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => handleDeleteGeofence(gf.id)}
                            className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all border-0 cursor-pointer"
                            title="Delete Boundary"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 3. STAFF ATTENDANCE TRACKER */}
      {activeTab === "attendance" && (
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* SIMULATED CLINICIAN ATTENDANCE TERMINAL */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                📲 Mobile Check-In Simulator
              </h3>
              <p className="text-[11px] text-slate-500">
                Simulate a clinician checking in using fine GPS coordinates coordinates.
              </p>
            </div>

            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Clinician Name</label>
                <select
                  value={manualAttendance.userName}
                  onChange={(e) => {
                    const selVal = e.target.value;
                    const id = selVal === "Dr. Rajesh Sharma" ? "doc-1" : "doc-2";
                    setManualAttendance(prev => ({ ...prev, userName: selVal, userId: id }));
                  }}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500"
                >
                  <option value="Dr. Sunita Rao">Dr. Sunita Rao (Consultant Obstetrician)</option>
                  <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma (Senior Cardiologist)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Check-in Lat</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={manualAttendance.latitude}
                    onChange={(e) => setManualAttendance(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Check-in Lng</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={manualAttendance.longitude}
                    onChange={(e) => setManualAttendance(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Trigger Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualAttendance(prev => ({ ...prev, isCheckin: true }))}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      manualAttendance.isCheckin 
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    📥 Check-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualAttendance(prev => ({ ...prev, isCheckin: false }))}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      !manualAttendance.isCheckin 
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    📤 Check-Out
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                <div className="font-extrabold text-slate-700 flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5 text-indigo-500" /> Boundary Check Strategy:
                </div>
                <div>
                  CURA matches check-in coordinates against hospital boundaries to automatically verify compliance.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer"
              >
                <UserCheck className="h-4 w-4" /> Record GPS-Verified Attendance
              </button>
            </form>
          </div>

          {/* ATTENDANCE AUDIT LOGS TABLE */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                📊 Geofence Attendance Verification Register
              </h3>
              <p className="text-[11px] text-slate-500">
                Review verified on-premises clinician attendance timesheet.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinician</th>
                    <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-In Time</th>
                    <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-Out Time</th>
                    <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Verification</th>
                    <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-medium">No attendance logs found for today.</td>
                    </tr>
                  ) : (
                    attendance.map(att => (
                      <tr key={att.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="py-3 px-2 font-bold text-slate-800">
                          {att.userName}
                          <div className="text-[9px] text-slate-400 font-mono">ID: {att.userId}</div>
                        </td>
                        <td className="py-3 px-2 font-mono text-[11px] text-slate-600">
                          {att.checkinTime ? new Date(att.checkinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                          <div className="text-[8px] text-slate-400">{att.checkinLatitude?.toFixed(4)}, {att.checkinLongitude?.toFixed(4)}</div>
                        </td>
                        <td className="py-3 px-2 font-mono text-[11px] text-slate-600">
                          {att.checkoutTime ? new Date(att.checkoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                          {att.checkoutLatitude && <div className="text-[8px] text-slate-400">{att.checkoutLatitude?.toFixed(4)}, {att.checkoutLongitude?.toFixed(4)}</div>}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1.5">
                            {att.verified ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black border border-emerald-100">
                                <CheckCircle className="h-3 w-3" /> VERIFIED PREMISES
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-black border border-amber-100">
                                <AlertTriangle className="h-3 w-3" /> OUTSIDE LIMITS
                              </span>
                            )}
                          </div>
                          {att.geofenceName && (
                            <div className="text-[9px] text-slate-500 mt-0.5 font-semibold">Matched: {att.geofenceName}</div>
                          )}
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-700">
                          {att.durationMinutes ? `${att.durationMinutes} mins` : "On Duty"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 4. PATIENT SAFETY & WANDER ALERTS */}
      {activeTab === "patient_safety" && (
        <div className="space-y-6">
          
          {/* CRITICAL INCIDENTS SCREEN */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                ⚠️ High-Risk Dementia & Wander Patrol Console
              </h3>
              <p className="text-[11px] text-slate-500">
                Immediately dispatch orderly teams or review patient geofence alarms triggered.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              
              {/* ALERTS QUEUE */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Alarm Signals</h4>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {alerts.filter(a => !a.resolved).length === 0 ? (
                    <div className="bg-slate-50 p-6 rounded-2xl text-center text-xs text-slate-400 font-bold border border-slate-100 flex flex-col items-center justify-center gap-2">
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                      No active wander alarms. All monitored high-risk patients are inside designated boundaries.
                    </div>
                  ) : (
                    alerts.filter(a => !a.resolved).map(al => (
                      <div 
                        key={al.id} 
                        onClick={() => setSelectedAlertId(al.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          selectedAlertId === al.id 
                            ? "bg-rose-50/50 border-rose-300 ring-1 ring-rose-300 shadow-sm" 
                            : "bg-white border-slate-100 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                              CRITICAL OUT-OF-BOUNDS
                            </span>
                            <h5 className="text-xs font-black text-slate-800 mt-1">{al.patientName}</h5>
                          </div>
                          <div className="text-[9px] font-mono text-slate-400">
                            {new Date(al.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600">
                          Exited boundary: <strong className="text-slate-800">{al.geofenceName}</strong>
                        </p>

                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
                          <div>GPS: {al.latitude.toFixed(5)}, {al.longitude.toFixed(5)}</div>
                          <div className="font-extrabold text-red-600">Severity: {al.severity.toUpperCase()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RESOLUTION WORKBENCH */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Resolution Desk</h4>
                
                {selectedAlertId ? (
                  <div className="space-y-4">
                    {(() => {
                      const al = alerts.find(a => a.id === selectedAlertId);
                      if (!al) return null;
                      return (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-slate-400">Active Incident</div>
                            <div className="text-sm font-black text-slate-800">{al.patientName} (ID: {al.patientId})</div>
                            <div className="text-[11px] text-slate-500">Exited safe zone: {al.geofenceName}</div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Incident Logs / Resolution Notes</label>
                            <textarea
                              required
                              placeholder="Describe actions taken (e.g., Orderly team dispatched to Koramangala. Patient located safely 30m outside boundary and escorted back...)"
                              rows={4}
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-500 resize-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedAlertId(null)}
                              className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs rounded-xl transition-all border-0 cursor-pointer"
                            >
                              Cancel Desk
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveAlert(al.id)}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all border-0 cursor-pointer"
                            >
                              Resolve Incident & Close Alert
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10 text-slate-400 space-y-2">
                    <Bell className="h-8 w-8 text-slate-300" />
                    <div className="text-xs font-extrabold text-slate-500">Desk Idle</div>
                    <p className="text-[10px] max-w-xs">
                      Select an active wander alarm on the left queue to log orderly dispatches and close incidents.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* HISTORICAL RESOLVED ALERTS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Resolved Incident Ledger</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-2">Patient</th>
                    <th className="py-2.5 px-2">Zone Name</th>
                    <th className="py-2.5 px-2">Logged Time</th>
                    <th className="py-2.5 px-2">Resolved Time</th>
                    <th className="py-2.5 px-2">Resolution Findings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {alerts.filter(a => a.resolved).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-medium text-xs">No resolved alerts in ledger.</td>
                    </tr>
                  ) : (
                    alerts.filter(a => a.resolved).map(al => (
                      <tr key={al.id} className="hover:bg-slate-50/50 text-slate-700">
                        <td className="py-2.5 px-2 font-bold text-slate-800">{al.patientName}</td>
                        <td className="py-2.5 px-2">{al.geofenceName}</td>
                        <td className="py-2.5 px-2 font-mono text-[10px] text-slate-500">{new Date(al.createdAt).toLocaleString()}</td>
                        <td className="py-2.5 px-2 font-mono text-[10px] text-slate-500">{al.resolvedAt ? new Date(al.resolvedAt).toLocaleString() : "—"}</td>
                        <td className="py-2.5 px-2 text-slate-600 max-w-xs truncate" title={al.resolutionNotes}>
                          {al.resolutionNotes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
