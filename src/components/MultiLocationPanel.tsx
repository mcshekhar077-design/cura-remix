import React, { useState, useEffect } from "react";
import { 
  Building, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Truck, 
  BarChart3, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Activity, 
  FileText, 
  Clock, 
  Sliders, 
  AlertCircle, 
  CheckCircle2, 
  ClipboardList, 
  RefreshCw, 
  Map, 
  Sparkles,
  Database,
  Briefcase,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Location {
  id: string;
  name: string;
  code: string;
  type: "main" | "branch" | "clinic" | "hospital" | "pharmacy" | "lab" | "diagnostic" | "warehouse" | "corporate";
  parent_id: string | null;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  operating_hours: Record<string, string>;
  timezone: string;
  location_head: string;
  staff_count: number;
  total_beds: number;
  total_doctors: number;
  departments: string[];
  status: "active" | "inactive" | "under_maintenance" | "closed";
  registration_number: string;
  license_number: string;
  license_expiry: string;
}

interface StaffAssignment {
  id: string;
  location_id: string;
  user_id: string;
  userName: string;
  userRole: string;
  role: "manager" | "doctor" | "nurse" | "receptionist" | "pharmacist" | "technician";
  department: string;
  schedule: Record<string, string>;
  is_primary_location: boolean;
  assigned_from: string;
  is_active: boolean;
}

interface CrossLocationPatientAccess {
  id: string;
  patient_id: string;
  patientName: string;
  location_id: string;
  access_level: "view" | "edit" | "full";
  reason: string;
  granted_by: string;
  granted_at: string;
  is_active: boolean;
}

interface CrossLocationInventory {
  id: string;
  medicineName: string;
  from_location_id: string;
  to_location_id: string;
  quantity: number;
  transfer_date: string;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  tracking_number: string;
  notes: string;
}

interface MultiLocationPanelProps {
  patients: any[];
  setSuccessMsg: (msg: string | null) => void;
  setErrorAlert: (msg: string | null) => void;
}

export default function MultiLocationPanel({ 
  patients, 
  setSuccessMsg, 
  setErrorAlert 
}: MultiLocationPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"registry" | "staff" | "patients" | "inventory" | "analytics">("registry");
  
  // Data States
  const [locations, setLocations] = useState<Location[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [patientShares, setPatientShares] = useState<CrossLocationPatientAccess[]>([]);
  const [inventoryTransfers, setInventoryTransfers] = useState<CrossLocationInventory[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter / Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Form Modals / Expand States
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddShare, setShowAddShare] = useState(false);
  const [showAddTransfer, setShowAddTransfer] = useState(false);

  // Form Fields - New Location
  const [newLocName, setNewLocName] = useState("");
  const [newLocCode, setNewLocCode] = useState("");
  const [newLocType, setNewLocType] = useState<Location["type"]>("clinic");
  const [newLocHead, setNewLocHead] = useState("");
  const [newLocPhone, setNewLocPhone] = useState("");
  const [newLocEmail, setNewLocEmail] = useState("");
  const [newLocCity, setNewLocCity] = useState("Hyderabad");
  const [newLocAddress, setNewLocAddress] = useState("");
  const [newLocDepts, setNewLocDepts] = useState("");

  // Form Fields - Staff Assignment
  const [newStaffLoc, setNewStaffLoc] = useState("");
  const [newStaffUser, setNewStaffUser] = useState("");
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<StaffAssignment["role"]>("doctor");
  const [newStaffDept, setNewStaffDept] = useState("");
  const [newStaffIsPrimary, setNewStaffIsPrimary] = useState(false);

  // Form Fields - Patient Share
  const [newSharePatientId, setNewSharePatientId] = useState("");
  const [newShareLoc, setNewShareLoc] = useState("");
  const [newShareLevel, setNewShareLevel] = useState<CrossLocationPatientAccess["access_level"]>("view");
  const [newShareReason, setNewShareReason] = useState("");

  // Form Fields - Inventory Transfer
  const [newInvMed, setNewInvMed] = useState("");
  const [newInvFrom, setNewInvFrom] = useState("");
  const [newInvTo, setNewInvTo] = useState("");
  const [newInvQty, setNewInvQty] = useState(10);
  const [newInvNotes, setNewInvNotes] = useState("");

  // Load all multi-location data from server
  const loadData = async () => {
    setLoading(true);
    try {
      const [resLoc, resStaff, resShares, resInv] = await Promise.all([
        fetch("/api/v1/multilocation/locations").then(r => r.json()),
        fetch("/api/v1/multilocation/staff").then(r => r.json()),
        fetch("/api/v1/multilocation/patient/access").then(r => r.json()),
        fetch("/api/v1/multilocation/inventory/transfers").then(r => r.json())
      ]);

      if (Array.isArray(resLoc)) setLocations(resLoc);
      if (Array.isArray(resStaff)) setStaffAssignments(resStaff);
      if (Array.isArray(resShares)) setPatientShares(resShares);
      if (Array.isArray(resInv)) setInventoryTransfers(resInv);
    } catch (err) {
      console.error("Failed to load multi-location support data", err);
      setErrorAlert("Unable to connect to the Multi-Location Orchestration service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form Submit Handlers
  const handleAddLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName || !newLocCode || !newLocType) {
      setErrorAlert("Please specify Name, Branch Code, and Type.");
      return;
    }
    try {
      const res = await fetch("/api/v1/multilocation/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLocName,
          code: newLocCode,
          type: newLocType,
          location_head: newLocHead,
          phone: newLocPhone,
          email: newLocEmail,
          city: newLocCity,
          address_line1: newLocAddress,
          departments: newLocDepts.split(",").map(d => d.trim()).filter(Boolean)
        })
      });

      if (res.ok) {
        setSuccessMsg("✨ New organizational branch successfully registered under tenant!");
        setShowAddLocation(false);
        // Reset
        setNewLocName("");
        setNewLocCode("");
        setNewLocHead("");
        setNewLocPhone("");
        setNewLocEmail("");
        setNewLocAddress("");
        setNewLocDepts("");
        loadData();
      } else {
        const data = await res.json();
        setErrorAlert(data.detail || "Failed to register location.");
      }
    } catch (err) {
      setErrorAlert("Network failure while submitting location.");
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffLoc || !newStaffName || !newStaffRole) {
      setErrorAlert("Please fill in location, staff name, and role.");
      return;
    }
    try {
      const res = await fetch("/api/v1/multilocation/staff/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: newStaffLoc,
          user_id: newStaffUser || `USR-${Math.floor(100 + Math.random() * 900)}`,
          userName: newStaffName,
          userRole: newStaffRole === "doctor" ? "Consulting Physician" : "Clinical Team Member",
          role: newStaffRole,
          department: newStaffDept || "General",
          is_primary_location: newStaffIsPrimary
        })
      });

      if (res.ok) {
        setSuccessMsg("👥 Cross-location staff assignment successfully scheduled.");
        setShowAddStaff(false);
        setNewStaffUser("");
        setNewStaffName("");
        setNewStaffDept("");
        setNewStaffIsPrimary(false);
        loadData();
      } else {
        setErrorAlert("Failed to register staff assignment.");
      }
    } catch (err) {
      setErrorAlert("Error occurred during staff registration.");
    }
  };

  const handleAddShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSharePatientId || !newShareLoc || !newShareReason) {
      setErrorAlert("Please specify Patient, Location, and Reason.");
      return;
    }

    const patientObj = patients.find(p => p.id === newSharePatientId);
    const patientName = patientObj ? patientObj.fullName : "Unknown Patient";

    try {
      const res = await fetch("/api/v1/multilocation/patient/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: newSharePatientId,
          patientName,
          location_id: newShareLoc,
          access_level: newShareLevel,
          reason: newShareReason
        })
      });

      if (res.ok) {
        setSuccessMsg("🛡️ Patient record securely shared across selected clinic nodes.");
        setShowAddShare(false);
        setNewShareReason("");
        loadData();
      } else {
        setErrorAlert("Failed to submit patient access grant.");
      }
    } catch (err) {
      setErrorAlert("Error sharing patient records.");
    }
  };

  const handleAddTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvMed || !newInvFrom || !newInvTo || !newInvQty) {
      setErrorAlert("Please fill all inventory dispatch parameters.");
      return;
    }
    if (newInvFrom === newInvTo) {
      setErrorAlert("Source and Destination locations must be distinct.");
      return;
    }
    try {
      const res = await fetch("/api/v1/multilocation/inventory/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineName: newInvMed,
          from_location_id: newInvFrom,
          to_location_id: newInvTo,
          quantity: newInvQty,
          notes: newInvNotes
        })
      });

      if (res.ok) {
        setSuccessMsg("📦 Multi-location supply chain transfer scheduled successfully.");
        setShowAddTransfer(false);
        setNewInvMed("");
        setNewInvQty(10);
        setNewInvNotes("");
        loadData();
      } else {
        setErrorAlert("Failed to dispatch stock transfer.");
      }
    } catch (err) {
      setErrorAlert("Error scheduling inventory transfer.");
    }
  };

  const handleUpdateTransferStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/multilocation/inventory/transfers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSuccessMsg(`Inventory transfer is now marked as: ${newStatus}`);
        loadData();
      } else {
        setErrorAlert("Failed to update transfer state.");
      }
    } catch (err) {
      setErrorAlert("Error shifting transfer state.");
    }
  };

  // Helper selectors
  const getLocationName = (id: string) => {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.name : id;
  };

  // Filtered lists
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || loc.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Basic stats for Analytics tab
  const totalBeds = locations.reduce((sum, l) => sum + l.total_beds, 0);
  const totalDoctors = locations.reduce((sum, l) => sum + l.total_doctors, 0);
  const totalStaffCount = locations.reduce((sum, l) => sum + l.staff_count, 0);
  const activeBranchesCount = locations.filter(l => l.status === "active").length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col justify-between">
      
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2.5 rounded-2xl text-slate-950 shadow-md">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black uppercase tracking-wider text-white">Multi-Location Control Center</h2>
                <span className="px-2 py-0.5 text-[8px] font-extrabold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20">ENTERPRISE HUB</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Centralized clinical orchestration, staff schedules, patient sharing, and cross-clinic logistics.</p>
            </div>
          </div>
          <button 
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Sync Dashboard
          </button>
        </div>

        {/* ORCHESTRATION SUB-TABS */}
        <div className="flex border-b border-slate-850 gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => { setActiveSubTab("registry"); setSearchQuery(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "registry" 
                ? "bg-slate-850 text-white border-b-2 border-emerald-400" 
                : "text-slate-450 hover:bg-slate-850/50 hover:text-slate-200"
            }`}
          >
            <Building className="h-4 w-4" />
            Clinic Registry ({locations.length})
          </button>
          
          <button
            onClick={() => { setActiveSubTab("staff"); setSearchQuery(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "staff" 
                ? "bg-slate-850 text-white border-b-2 border-emerald-400" 
                : "text-slate-450 hover:bg-slate-850/50 hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4" />
            Staff Allocations
          </button>

          <button
            onClick={() => { setActiveSubTab("patients"); setSearchQuery(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "patients" 
                ? "bg-slate-850 text-white border-b-2 border-emerald-400" 
                : "text-slate-450 hover:bg-slate-850/50 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Patient Shared Vault
          </button>

          <button
            onClick={() => { setActiveSubTab("inventory"); setSearchQuery(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "inventory" 
                ? "bg-slate-850 text-white border-b-2 border-emerald-400" 
                : "text-slate-450 hover:bg-slate-850/50 hover:text-slate-200"
            }`}
          >
            <Truck className="h-4 w-4" />
            Supply Chain Logistics
          </button>

          <button
            onClick={() => { setActiveSubTab("analytics"); setSearchQuery(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "analytics" 
                ? "bg-slate-850 text-white border-b-2 border-emerald-400" 
                : "text-slate-450 hover:bg-slate-850/50 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Enterprise Analytics
          </button>
        </div>

        {/* ==========================================
            TAB 1: CLINIC REGISTRY
            ========================================== */}
        {activeSubTab === "registry" && (
          <div className="space-y-6">
            
            {/* SUB HEADER ACTIONS */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 w-full md:w-80">
                <Search className="h-4 w-4 text-slate-500 mr-2" />
                <input 
                  type="text"
                  placeholder="Search branches by code, name, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="all">All Facility Types</option>
                  <option value="main">Main Hospital</option>
                  <option value="clinic">Clinic</option>
                  <option value="branch">Secondary Branch</option>
                  <option value="diagnostic">Diagnostic Hub</option>
                  <option value="pharmacy">Pharmacy Outlet</option>
                </select>

                <button 
                  onClick={() => setShowAddLocation(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add Branch
                </button>
              </div>
            </div>

            {/* ADD LOCATION INLINE PANEL */}
            <AnimatePresence>
              {showAddLocation && (
                <motion.form 
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onSubmit={handleAddLocationSubmit}
                  className="bg-slate-950/60 border border-emerald-500/20 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="col-span-1 md:col-span-3 border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Register Organizational Unit</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Provide official credentials to instantiate this node in the distributed CURA clinical network.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Branch Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="CURA Gachibowli Clinic"
                      value={newLocName}
                      onChange={(e) => setNewLocName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Branch Code *</label>
                    <input 
                      type="text"
                      required
                      placeholder="CURA-GACH"
                      value={newLocCode}
                      onChange={(e) => setNewLocCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Facility Type *</label>
                    <select 
                      value={newLocType}
                      onChange={(e) => setNewLocType(e.target.value as Location["type"])}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="main">Main Hospital (Tertiary Care)</option>
                      <option value="branch">Secondary Branch</option>
                      <option value="clinic">Outpatient Clinic</option>
                      <option value="diagnostic">Diagnostic Hub / Imaging Lab</option>
                      <option value="pharmacy">Standalone Pharmacy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Branch Medical Director</label>
                    <input 
                      type="text"
                      placeholder="Dr. Rajesh Kumar"
                      value={newLocHead}
                      onChange={(e) => setNewLocHead(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Phone</label>
                    <input 
                      type="text"
                      placeholder="+91 40 4567 8911"
                      value={newLocPhone}
                      onChange={(e) => setNewLocPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Official Email</label>
                    <input 
                      type="email"
                      placeholder="gachibowli@cura.in"
                      value={newLocEmail}
                      onChange={(e) => setNewLocEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">City Location</label>
                    <input 
                      type="text"
                      placeholder="Hyderabad"
                      value={newLocCity}
                      onChange={(e) => setNewLocCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Postal Address</label>
                    <input 
                      type="text"
                      placeholder="Plot No. 12, Financial District"
                      value={newLocAddress}
                      onChange={(e) => setNewLocAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Departments (comma-separated)</label>
                    <input 
                      type="text"
                      placeholder="General Medicine, Pediatrics, Pathology"
                      value={newLocDepts}
                      onChange={(e) => setNewLocDepts(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-3 flex items-center justify-end gap-2.5 mt-2">
                    <button 
                      type="button"
                      onClick={() => setShowAddLocation(false)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Provision Node
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* LOCATION GRID CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLocations.map(loc => (
                <div 
                  key={loc.id} 
                  className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            loc.status === "active" ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-amber-400"
                          }`} />
                          <h4 className="text-sm font-black text-white uppercase tracking-wider">{loc.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Code: <span className="text-emerald-400 font-mono">{loc.code}</span> | Type: <span className="capitalize">{loc.type}</span></p>
                      </div>
                      <span className="px-2 py-0.5 text-[8px] font-extrabold bg-slate-900 border border-slate-800 rounded text-slate-400 uppercase tracking-widest">{loc.id}</span>
                    </div>

                    {/* ADDRESS AND METADATA */}
                    <div className="mt-4 space-y-2 text-xs text-slate-400 border-t border-slate-900 pt-3">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>{loc.address_line1}, {loc.address_line2}, {loc.city}, {loc.state} - {loc.pincode}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/50 p-2 rounded-xl border border-slate-900">
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase font-black">Medical Chief</span>
                          <span className="text-slate-300 font-semibold">{loc.location_head}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase font-black">Official Contact</span>
                          <span className="text-slate-300 font-semibold">{loc.phone}</span>
                        </div>
                      </div>

                      <div className="mt-2.5">
                        <span className="block text-[8px] text-slate-500 uppercase font-black mb-1">Facility Capabilities</span>
                        <div className="flex flex-wrap gap-1">
                          {loc.departments.map(dept => (
                            <span key={dept} className="px-2 py-0.5 bg-slate-900 text-slate-400 text-[9px] rounded-lg border border-slate-850">{dept}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STATS STRIP */}
                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex gap-4">
                      <div>
                        <span className="font-bold text-white font-mono">{loc.staff_count}</span> Staff
                      </div>
                      <div>
                        <span className="font-bold text-white font-mono">{loc.total_doctors}</span> Doctors
                      </div>
                      {loc.total_beds > 0 && (
                        <div>
                          <span className="font-bold text-white font-mono">{loc.total_beds}</span> Beds
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-2 py-0.5 rounded-md">
                      {loc.timezone}
                    </span>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 2: STAFF ALLOCATIONS
            ========================================== */}
        {activeSubTab === "staff" && (
          <div className="space-y-6">
            
            {/* SUB HEADER ACTIONS */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 w-full md:w-80">
                <Search className="h-4 w-4 text-slate-500 mr-2" />
                <input 
                  type="text"
                  placeholder="Search staff, doctors, shift roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none w-full"
                />
              </div>

              <button 
                onClick={() => setShowAddStaff(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all w-full md:w-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                Assign Staff Across Clinics
              </button>
            </div>

            {/* ADD STAFF INLINE PANEL */}
            <AnimatePresence>
              {showAddStaff && (
                <motion.form 
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onSubmit={handleAddStaffSubmit}
                  className="bg-slate-950/60 border border-emerald-500/20 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="col-span-1 md:col-span-3 border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Assign Staff To Location</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Schedules a clinical practitioner to support operations across a distinct branch node.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Location *</label>
                    <select 
                      value={newStaffLoc}
                      required
                      onChange={(e) => setNewStaffLoc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Choose Branch --</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Staff Member Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Dr. Sandeep Sen"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Role *</label>
                    <select 
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as StaffAssignment["role"])}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="doctor">Consulting Doctor</option>
                      <option value="nurse">Staff Nurse</option>
                      <option value="manager">Operations Manager</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="technician">Lab Technician</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
                    <input 
                      type="text"
                      placeholder="General Ward / ICU"
                      value={newStaffDept}
                      onChange={(e) => setNewStaffDept(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Staff User ID (Optional)</label>
                    <input 
                      type="text"
                      placeholder="USR-109"
                      value={newStaffUser}
                      onChange={(e) => setNewStaffUser(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-6">
                    <input 
                      type="checkbox"
                      id="primaryLoc"
                      checked={newStaffIsPrimary}
                      onChange={(e) => setNewStaffIsPrimary(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0"
                    />
                    <label htmlFor="primaryLoc" className="text-xs text-slate-400 cursor-pointer select-none">Set as primary deployment</label>
                  </div>

                  <div className="col-span-1 md:col-span-3 flex items-center justify-end gap-2.5 mt-2">
                    <button 
                      type="button"
                      onClick={() => setShowAddStaff(false)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Deploy Assignment
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* STAFF TABLE */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <th className="py-3 px-4">Practitioner ID</th>
                      <th className="py-3 px-4">Staff Name</th>
                      <th className="py-3 px-4">Assigned Location</th>
                      <th className="py-3 px-4">Clinical Role</th>
                      <th className="py-3 px-4">Dept / Spec</th>
                      <th className="py-3 px-4">Schedule Shifts</th>
                      <th className="py-3 px-4">Deploy Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffAssignments
                      .filter(s => s.userName.toLowerCase().includes(searchQuery.toLowerCase()) || s.department.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(assignment => (
                        <tr key={assignment.id} className="border-b border-slate-850 hover:bg-slate-900/40 text-xs transition-all">
                          <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{assignment.user_id}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white">{assignment.userName}</span>
                            <span className="block text-[10px] text-slate-500 font-mono">{assignment.userRole}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-emerald-400">{getLocationName(assignment.location_id)}</span>
                          </td>
                          <td className="py-3.5 px-4 capitalize">
                            <span className="px-2 py-0.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 text-[10px]">{assignment.role}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">{assignment.department}</td>
                          <td className="py-3.5 px-4 text-[10px] text-slate-400 font-mono">
                            {Object.entries(assignment.schedule).map(([day, hrs]) => (
                              <div key={day} className="capitalize">
                                {day}: <span className="text-white">{hrs}</span>
                              </div>
                            ))}
                          </td>
                          <td className="py-3.5 px-4">
                            {assignment.is_primary_location ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-bold">Primary Node</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-900 text-slate-500 border border-slate-800 rounded-full text-[9px]">Shared Cross-Deployment</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 3: PATIENT SHARED ACCESS
            ========================================== */}
        {activeSubTab === "patients" && (
          <div className="space-y-6">
            
            {/* INFORMATION BANNER */}
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase text-white tracking-wider">Cross-Location HIPAA Secure Patient Sharing</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Allows CURA clinical operators at distinct satellite clinics to temporarily or permanently view clinical history, scanned lab reports, or diagnosis notes for patient care continuity. Direct audit trails are created on every access.
                </p>
              </div>
            </div>

            {/* ACTION TRIGGER */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="text-xs text-slate-400 font-bold">
                🔒 Active Access Credentials: <span className="text-emerald-400 font-mono">{patientShares.length} Grants Live</span>
              </div>
              <button 
                onClick={() => setShowAddShare(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Plus className="h-4 w-4" />
                Grant Shared Access
              </button>
            </div>

            {/* ADD SHARE ACCESS FORM */}
            <AnimatePresence>
              {showAddShare && (
                <motion.form 
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onSubmit={handleAddShareSubmit}
                  className="bg-slate-950/60 border border-emerald-500/20 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="col-span-1 md:col-span-2 border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Authorize Clinical Shared Access</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Authorizes another medical node to pull the selected patient’s FHIR records, medication lists, and medical history.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Patient *</label>
                    <select 
                      value={newSharePatientId}
                      required
                      onChange={(e) => setNewSharePatientId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Choose Patient Profile --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.fullName} (ID: {p.id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinic Authorized *</label>
                    <select 
                      value={newShareLoc}
                      required
                      onChange={(e) => setNewShareLoc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Select Authorized Clinic Node --</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sharing Access Level *</label>
                    <select 
                      value={newShareLevel}
                      onChange={(e) => setNewShareLevel(e.target.value as CrossLocationPatientAccess["access_level"])}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="view">View Only (Consulting, Diagnosis review)</option>
                      <option value="edit">View & Edit (Prescription update allowed)</option>
                      <option value="full">Full Ownership (Referral delegation)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Referral / Clinical Reasoning *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Referred for cardiac surgical consult in Satellite Unit B"
                      value={newShareReason}
                      onChange={(e) => setNewShareReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2.5 mt-2">
                    <button 
                      type="button"
                      onClick={() => setShowAddShare(false)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Authorize Share Grant
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* GRANTED SHARES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patientShares.map(share => (
                <div key={share.id} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                      <div>
                        <span className="block text-[8px] text-slate-500 uppercase font-black">Shared Patient</span>
                        <h5 className="text-xs font-black text-white uppercase tracking-wider">{share.patientName}</h5>
                        <p className="text-[10px] text-slate-500 font-mono">ID: {share.patient_id}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[8px] font-black bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/20 uppercase tracking-widest">
                        {share.access_level} Access
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">AUTHORIZED NODE:</span>
                        <span className="font-bold text-slate-200">{getLocationName(share.location_id)}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-[10px] text-slate-500 font-bold block">CLINICAL REASONING:</span>
                        <p className="text-[11px] text-slate-300 italic">"{share.reason}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                    <div>
                      Granted By: <span className="text-slate-400">{share.granted_by}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{new Date(share.granted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 4: LOGISTICS / INVENTORY TRANSFERS
            ========================================== */}
        {activeSubTab === "inventory" && (
          <div className="space-y-6">
            
            {/* ACTION ROW */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="text-xs text-slate-400 font-bold">
                📦 Multi-Clinic Vaccine & Medical Inventory Dispatches
              </div>
              <button 
                onClick={() => setShowAddTransfer(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Plus className="h-4 w-4" />
                Schedule Stock Transfer
              </button>
            </div>

            {/* DISPATCH SUPPLY TRANSFER FORM */}
            <AnimatePresence>
              {showAddTransfer && (
                <motion.form 
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onSubmit={handleAddTransferSubmit}
                  className="bg-slate-950/60 border border-emerald-500/20 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="col-span-1 md:col-span-3 border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Schedule Cross-Clinic Stock Transfer</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Generates an automated waybill and transit request to shift life-saving medicine stock across branches.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dispatching Node (Source) *</label>
                    <select 
                      value={newInvFrom}
                      required
                      onChange={(e) => setNewInvFrom(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Select Source --</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Receiving Node (Destination) *</label>
                    <select 
                      value={newInvTo}
                      required
                      onChange={(e) => setNewInvTo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Select Destination --</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Medicine / Asset Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Remdesivir 100mg Vial"
                      value={newInvMed}
                      onChange={(e) => setNewInvMed(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity (Units) *</label>
                    <input 
                      type="number"
                      required
                      min={1}
                      value={newInvQty}
                      onChange={(e) => setNewInvQty(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Waybill Dispatch Notes</label>
                    <input 
                      type="text"
                      placeholder="Cold chain monitoring enabled. Carry on dry ice."
                      value={newInvNotes}
                      onChange={(e) => setNewInvNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-3 flex items-center justify-end gap-2.5 mt-2">
                    <button 
                      type="button"
                      onClick={() => setShowAddTransfer(false)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Dispatch Consignment
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* TRANSFERS LISTING */}
            <div className="grid grid-cols-1 gap-4">
              {inventoryTransfers.map(transfer => (
                <div 
                  key={transfer.id} 
                  className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-750 transition-all grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
                >
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-850">{transfer.id}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Waybill: {transfer.tracking_number}</span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-1.5 uppercase tracking-wider">{transfer.medicineName}</h4>
                    <p className="text-xs text-slate-300 font-semibold mt-0.5">Quantity dispatched: <span className="text-emerald-400 font-mono">{transfer.quantity}</span> Units</p>
                    {transfer.notes && (
                      <p className="text-[10px] text-slate-500 italic mt-1">"{transfer.notes}"</p>
                    )}
                  </div>

                  <div className="text-xs space-y-1.5 border-t md:border-t-0 md:border-l border-slate-850 md:pl-4">
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase font-black">FROM SOURCE NODE</span>
                      <span className="font-semibold text-slate-300">{getLocationName(transfer.from_location_id)}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase font-black">TO DESTINATION NODE</span>
                      <span className="font-semibold text-slate-300">{getLocationName(transfer.to_location_id)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2.5 border-t md:border-t-0 md:border-l border-slate-850 md:pl-4">
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase font-black md:text-right">DISPATCH STATUS</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        transfer.status === "delivered" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : transfer.status === "in_transit"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {transfer.status}
                      </span>
                    </div>

                    {transfer.status !== "delivered" && (
                      <div className="flex gap-1.5">
                        {transfer.status === "pending" && (
                          <button 
                            onClick={() => handleUpdateTransferStatus(transfer.id, "in_transit")}
                            className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer"
                          >
                            Ship Stock
                          </button>
                        )}
                        {transfer.status === "in_transit" && (
                          <button 
                            onClick={() => handleUpdateTransferStatus(transfer.id, "delivered")}
                            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer"
                          >
                            Receive Stock
                          </button>
                        )}
                        <button 
                          onClick={() => handleUpdateTransferStatus(transfer.id, "cancelled")}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 5: ENTERPRISE ANALYTICS SUMMARY
            ========================================== */}
        {activeSubTab === "analytics" && (
          <div className="space-y-6">
            
            {/* KPI OVERVIEW GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">Operational Nodes</span>
                <div className="text-xl font-black text-white mt-1 font-mono">{activeBranchesCount} <span className="text-xs text-slate-400 font-bold">Active</span></div>
                <p className="text-[10px] text-slate-400 mt-0.5">Across {locations.length} total units.</p>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">Practitioner Roster</span>
                <div className="text-xl font-black text-emerald-400 mt-1 font-mono">{totalDoctors} <span className="text-xs text-slate-400 font-bold">Doctors</span></div>
                <p className="text-[10px] text-slate-400 mt-0.5">{totalStaffCount} total medical staff.</p>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">Consolidated Beds</span>
                <div className="text-xl font-black text-blue-400 mt-1 font-mono">{totalBeds} <span className="text-xs text-slate-400 font-bold">Units</span></div>
                <p className="text-[10px] text-slate-400 mt-0.5">Across ICU & General wards.</p>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider">Clinics Compliance</span>
                <div className="text-xl font-black text-teal-400 mt-1 font-mono">100%</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Licenses active & valid.</p>
              </div>
            </div>

            {/* LIVE BENTO STATISTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
                <h4 className="text-xs font-black uppercase text-white tracking-wider mb-4">Patient Volume Distribution (Simulated)</h4>
                
                <div className="space-y-3">
                  {locations.map(loc => {
                    const pct = loc.type === "main" ? 52 : loc.type === "branch" ? 28 : 12;
                    return (
                      <div key={loc.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-semibold">{loc.name}</span>
                          <span className="text-emerald-400 font-mono font-bold">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
                <h4 className="text-xs font-black uppercase text-white tracking-wider mb-4">Revenue Split across Branches (Simulated)</h4>
                
                <div className="space-y-3">
                  {locations.map(loc => {
                    const rev = loc.type === "main" ? "₹8,45,000" : loc.type === "branch" ? "₹3,12,000" : "₹68,000";
                    const pct = loc.type === "main" ? 65 : loc.type === "branch" ? 25 : 8;
                    return (
                      <div key={loc.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-semibold">{loc.name}</span>
                          <span className="text-blue-400 font-mono font-bold">{rev} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* FOOTER METADATA INTEGRITY STRIP */}
      <div className="border-t border-slate-800 pt-4 mt-6 flex flex-col md:flex-row justify-between items-start md:items-center text-[10px] text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5" />
          <span>Distributed Database Ledger State: <strong className="text-emerald-400 font-bold">HEALTHY & DESYNCHRONIZED BACKENDS ELIMINATED</strong></span>
        </div>
        <div>
          CURA Enterprise Multitenant Protocol v2.4 • Secured via WebAuthn Biometric & AES-256 GCM
        </div>
      </div>

    </div>
  );
}
