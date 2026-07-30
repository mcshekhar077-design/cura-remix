import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Users, 
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
  AlertCircle
} from "lucide-react";

interface BloodDonor {
  id: string;
  fullName: string;
  gender: string;
  age: number;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  lastDonationDate: string | null;
  medicalHistory: string;
  status: "eligible" | "deferred" | "blacklisted";
  createdAt: string;
}

interface BloodBag {
  id: string;
  bagNumber: string;
  bloodGroup: string;
  componentType: "whole_blood" | "packed_red_cells" | "fresh_frozen_plasma" | "platelets";
  volumeMl: number;
  donatedDate: string;
  expiryDate: string;
  status: "available" | "reserved" | "transfused" | "discarded";
  storageLocation: string;
  donorId: string;
}

interface BloodDonation {
  id: string;
  donorId: string;
  donorName: string;
  donationDate: string;
  volumeMl: number;
  bloodGroup: string;
  bp: string;
  pulse: number;
  hemoglobin: number;
  screeningResults: {
    hiv: "negative" | "positive";
    hbv: "negative" | "positive";
    hcv: "negative" | "positive";
    syphilis: "negative" | "positive";
    malaria: "negative" | "positive";
  };
  status: "pending_screening" | "approved" | "discarded";
  notes: string;
}

interface BloodRequest {
  id: string;
  patientId: string;
  patientName: string;
  bloodGroup: string;
  componentType: "whole_blood" | "packed_red_cells" | "fresh_frozen_plasma" | "platelets";
  volumeMl: number;
  units: number;
  urgency: "routine" | "urgent" | "emergency";
  requiredDate: string;
  status: "pending" | "allocated" | "issued" | "cancelled" | "transfused";
  requestingDoctor: string;
  wardId: string;
  notes: string;
}

interface BloodInventoryAlert {
  id: string;
  bloodGroup: string;
  componentType: string;
  alertType: "critical_low" | "approaching_expiry";
  message: string;
  status: "active" | "resolved";
  createdAt: string;
}

interface BloodBankPanelProps {
  patients: any[];
  setSuccessMsg: (msg: string | null) => void;
  setErrorAlert: (msg: string | null) => void;
}

export default function BloodBankPanel({
  patients,
  setSuccessMsg,
  setErrorAlert
}: BloodBankPanelProps) {
  const [activePanel, setActivePanel] = useState<"inventory" | "donors" | "donations" | "requests" | "alerts">("inventory");
  const [loading, setLoading] = useState(true);

  // Core Data State
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [bags, setBags] = useState<BloodBag[]>([]);
  const [donations, setDonations] = useState<BloodDonation[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [alerts, setAlerts] = useState<BloodInventoryAlert[]>([]);
  const [stats, setStats] = useState<any>({
    totalDonors: 0,
    totalDonations: 0,
    totalRequests: 0,
    availableBags: 0,
    bloodGroupStock: {},
    bloodGroupStockVolume: {},
    componentStock: {},
    pendingRequests: 0,
    urgentRequests: 0,
    emergencyRequests: 0
  });

  // Filtering / Search States
  const [donorSearch, setDonorSearch] = useState("");
  const [donorGroupFilter, setDonorGroupFilter] = useState("");
  const [bagGroupFilter, setBagGroupFilter] = useState("");
  const [bagComponentFilter, setBagComponentFilter] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState("");

  // Form Modals / Slide-overs state
  const [showAddDonor, setShowAddDonor] = useState(false);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState<BloodRequest | null>(null);

  // Form Fields - New Donor
  const [donorName, setDonorName] = useState("");
  const [donorGender, setDonorGender] = useState("Male");
  const [donorAge, setDonorAge] = useState("");
  const [donorBloodGroup, setDonorBloodGroup] = useState("O+");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [donorHistory, setDonorHistory] = useState("");

  // Form Fields - New Donation
  const [donationDonorId, setDonationDonorId] = useState("");
  const [donationVolume, setDonationVolume] = useState("450");
  const [donationBp, setDonationBp] = useState("120/80");
  const [donationPulse, setDonationPulse] = useState("72");
  const [donationHemoglobin, setDonationHemoglobin] = useState("14.5");
  const [screenHiv, setScreenHiv] = useState<"negative" | "positive">("negative");
  const [screenHbv, setScreenHbv] = useState<"negative" | "positive">("negative");
  const [screenHcv, setScreenHcv] = useState<"negative" | "positive">("negative");
  const [screenSyphilis, setScreenSyphilis] = useState<"negative" | "positive">("negative");
  const [screenMalaria, setScreenMalaria] = useState<"negative" | "positive">("negative");
  const [donationStatus, setDonationStatus] = useState<"approved" | "discarded" | "pending_screening">("approved");
  const [donationNotes, setDonationNotes] = useState("");

  // Form Fields - New Request
  const [reqPatientId, setReqPatientId] = useState("");
  const [reqPatientName, setReqPatientName] = useState("");
  const [reqBloodGroup, setReqBloodGroup] = useState("O+");
  const [reqComponent, setReqComponent] = useState<any>("whole_blood");
  const [reqUnits, setReqUnits] = useState("1");
  const [reqUrgency, setReqUrgency] = useState<"routine" | "urgent" | "emergency">("routine");
  const [reqRequiredDate, setReqRequiredDate] = useState("");
  const [reqNotes, setReqNotes] = useState("");
  const [reqWardId, setReqWardId] = useState("WRD-01");

  // Form Fields - Edit Bag Storage
  const [editingBag, setEditingBag] = useState<BloodBag | null>(null);
  const [editBagLocation, setEditBagLocation] = useState("");

  // API Call helper
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rDonors, rBags, rDonations, rRequests, rAlerts, rStats] = await Promise.all([
        fetch("/api/v1/hims/bloodbank/donors"),
        fetch("/api/v1/hims/bloodbank/bags"),
        fetch("/api/v1/hims/bloodbank/donations"),
        fetch("/api/v1/hims/bloodbank/requests"),
        fetch("/api/v1/hims/bloodbank/alerts"),
        fetch("/api/v1/hims/bloodbank/stats")
      ]);

      if (rDonors.ok) setDonors(await rDonors.json());
      if (rBags.ok) setBags(await rBags.json());
      if (rDonations.ok) setDonations(await rDonations.json());
      if (rRequests.ok) setRequests(await rRequests.json());
      if (rAlerts.ok) setAlerts(await rAlerts.json());
      if (rStats.ok) setStats(await rStats.json());
    } catch (e) {
      console.error("Failed to fetch Blood Bank data:", e);
      setErrorAlert("Failed to sync with Blood Bank inventory services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorPhone || !donorAge || !donorBloodGroup) {
      setErrorAlert("Please specify name, age, phone number, and blood group.");
      return;
    }
    try {
      const res = await fetch("/api/v1/hims/bloodbank/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: donorName,
          gender: donorGender,
          age: donorAge,
          bloodGroup: donorBloodGroup,
          phone: donorPhone,
          email: donorEmail,
          address: donorAddress,
          medicalHistory: donorHistory
        })
      });
      if (res.ok) {
        setSuccessMsg("✓ Blood donor registered successfully!");
        setShowAddDonor(false);
        // Reset state
        setDonorName("");
        setDonorPhone("");
        setDonorAge("");
        setDonorEmail("");
        setDonorAddress("");
        setDonorHistory("");
        fetchData();
      } else {
        const d = await res.json();
        setErrorAlert(d.detail || "Failed to register donor.");
      }
    } catch (err) {
      setErrorAlert("Network error registering donor.");
    }
  };

  const handleRecordDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationDonorId || !donationVolume) {
      setErrorAlert("Please select donor and volume.");
      return;
    }
    try {
      const res = await fetch("/api/v1/hims/bloodbank/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorId: donationDonorId,
          volumeMl: donationVolume,
          bp: donationBp,
          pulse: donationPulse,
          hemoglobin: donationHemoglobin,
          screeningResults: {
            hiv: screenHiv,
            hbv: screenHbv,
            hcv: screenHcv,
            syphilis: screenSyphilis,
            malaria: screenMalaria
          },
          status: donationStatus,
          notes: donationNotes
        })
      });
      if (res.ok) {
        setSuccessMsg("✓ Donation transaction logged. Blood bags generated in quarantine/inventory.");
        setShowAddDonation(false);
        // Reset state
        setDonationDonorId("");
        setDonationNotes("");
        fetchData();
      } else {
        const d = await res.json();
        setErrorAlert(d.detail || "Failed to record donation.");
      }
    } catch (err) {
      setErrorAlert("Network error recording donation.");
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqPatientName || !reqBloodGroup || !reqUnits) {
      setErrorAlert("Please specify patient name, blood group, and unit count.");
      return;
    }
    try {
      const res = await fetch("/api/v1/hims/bloodbank/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: reqPatientId,
          patientName: reqPatientName,
          bloodGroup: reqBloodGroup,
          componentType: reqComponent,
          units: Number(reqUnits),
          urgency: reqUrgency,
          requiredDate: reqRequiredDate ? new Date(reqRequiredDate).toISOString() : undefined,
          notes: reqNotes,
          wardId: reqWardId
        })
      });
      if (res.ok) {
        setSuccessMsg("✓ Blood request issued to registry successfully!");
        setShowAddRequest(false);
        // Reset
        setReqPatientName("");
        setReqPatientId("");
        setReqNotes("");
        fetchData();
      } else {
        const d = await res.json();
        setErrorAlert(d.detail || "Failed to submit request.");
      }
    } catch (err) {
      setErrorAlert("Network error creating request.");
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/v1/hims/bloodbank/alerts/${alertId}/resolve`, {
        method: "PATCH"
      });
      if (res.ok) {
        setSuccessMsg("✓ Stock alert marked as resolved.");
        fetchData();
      }
    } catch (e) {
      setErrorAlert("Error resolving alert.");
    }
  };

  const handleUpdateBagStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBag) return;
    try {
      const res = await fetch(`/api/v1/hims/bloodbank/bags/${editingBag.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageLocation: editBagLocation
        })
      });
      if (res.ok) {
        setSuccessMsg(`✓ Storage coordinates updated for ${editingBag.bagNumber}.`);
        setEditingBag(null);
        setEditBagLocation("");
        fetchData();
      }
    } catch (e) {
      setErrorAlert("Error updating bag storage.");
    }
  };

  const handleAllocateBag = async (reqId: string, bagId: string) => {
    try {
      const res = await fetch(`/api/v1/hims/bloodbank/requests/${reqId}/allocate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bagId })
      });
      if (res.ok) {
        setSuccessMsg("✓ Stock allocated successfully! Blood reserve assigned.");
        setShowAllocateModal(null);
        fetchData();
      } else {
        const d = await res.json();
        setErrorAlert(d.detail || "Allocation criteria failed.");
      }
    } catch (e) {
      setErrorAlert("Error allocating reserve.");
    }
  };

  const handleUpdateRequestStatus = async (reqId: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/hims/bloodbank/requests/${reqId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSuccessMsg(`✓ Request status successfully modified to ${status.toUpperCase()}.`);
        fetchData();
      }
    } catch (e) {
      setErrorAlert("Error updating request status.");
    }
  };

  // Helper: Blood group color indicators
  const getBloodGroupColorClass = (group: string) => {
    if (group.startsWith("O")) return "bg-red-500 text-white";
    if (group.startsWith("A")) return "bg-rose-600 text-white";
    if (group.startsWith("B")) return "bg-amber-600 text-white";
    return "bg-purple-600 text-white";
  };

  // Compatibility checking: Who can receive what?
  const isCompatible = (bagGroup: string, patientGroup: string) => {
    // Universal donor O- can donate to anyone
    if (bagGroup === "O-") return true;
    
    // O+ can donate to all positive groups
    if (bagGroup === "O+" && patientGroup.endsWith("+")) return true;

    // Direct matches
    if (bagGroup === patientGroup) return true;

    // AB+ can receive from anyone
    if (patientGroup === "AB+") return true;

    // A+ can receive O+, O-, A+, A-
    if (patientGroup === "A+") {
      return ["O+", "O-", "A+", "A-"].includes(bagGroup);
    }
    // B+ can receive O+, O-, B+, B-
    if (patientGroup === "B+") {
      return ["O+", "O-", "B+", "B-"].includes(bagGroup);
    }

    return false;
  };

  return (
    <div id="cura-blood-bank-container" className="space-y-6 animate-fade-in">
      
      {/* 📊 BENTO KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI: Available Bags */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Inventory</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">{stats.availableBags}</span>
              <span className="text-xs font-semibold text-slate-400">units</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Active sterile storage</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
            <Heart className="h-6 w-6 fill-current" />
          </div>
        </div>

        {/* KPI: Active Donors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Donors</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">{stats.totalDonors}</span>
              <span className="text-xs font-semibold text-slate-400">people</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Eligible panel pool</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* KPI: Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-red-600">{stats.pendingRequests}</span>
              <span className="text-xs font-semibold text-slate-400">orders</span>
            </div>
            <div className="flex gap-2 text-[9px] font-bold mt-1">
              {stats.emergencyRequests > 0 && (
                <span className="text-red-600 bg-red-50 px-1 py-0.2 rounded">🚨 {stats.emergencyRequests} Emergency</span>
              )}
              {stats.urgentRequests > 0 && (
                <span className="text-amber-600 bg-amber-50 px-1 py-0.2 rounded">⚡ {stats.urgentRequests} Urgent</span>
              )}
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* KPI: Active Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safety Status</span>
            <div className="flex items-center gap-2">
              {alerts.filter(a => a.status === "active").length > 0 ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500 inline-block animate-ping"></span>
                  <span className="text-sm font-black text-red-600">{alerts.filter(a => a.status === "active").length} Alerts Active</span>
                </>
              ) : (
                <span className="text-sm font-black text-emerald-600">✓ All Stock Normal</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Continuous GFR/expiry audits</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* 🔬 VISUAL STOCK DISTRIBUTION LEVEL */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Visual Blood Group Registry & Stock Levels</h3>
          <p className="text-xs text-slate-400">Sterile inventory metrics mapped across positive/negative blood groupings.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(group => {
            const stockCount = stats.bloodGroupStock[group] || 0;
            const stockVol = stats.bloodGroupStockVolume[group] || 0;
            // Max typical capacity for scaling is 10 units
            const pct = Math.min((stockCount / 8) * 100, 100);

            return (
              <div key={group} className="p-3.5 border border-slate-100 rounded-2xl flex flex-col items-center text-center bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                <span className={`h-8 w-8 rounded-full ${getBloodGroupColorClass(group)} flex items-center justify-center text-xs font-black shadow-sm mb-2`}>
                  {group}
                </span>
                <span className="text-base font-black text-slate-800">{stockCount} <span className="text-[10px] font-bold text-slate-400">Bags</span></span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">{stockVol} ml</span>
                
                {/* Micro Visual gauge */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${stockCount === 0 ? "bg-slate-300" : stockCount <= 1 ? "bg-amber-500 animate-pulse" : "bg-red-500"}`}
                    style={{ width: `${Math.max(pct, stockCount > 0 ? 15 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🧭 PANEL CONTROL NAVIGATION */}
      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto gap-1">
        {[
          { id: "inventory", label: "🎒 Blood Bags Stock" },
          { id: "donors", label: "👥 Donors Registry" },
          { id: "donations", label: "💉 Donations Log" },
          { id: "requests", label: "📥 Ward Orders" },
          { id: "alerts", label: "⚠️ Stock Safety & Alerts" }
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

      {/* ==================== 🎒 INVENTORY PANEL ==================== */}
      {activePanel === "inventory" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Quick Filters:</span>
              
              <select 
                value={bagGroupFilter}
                onChange={e => setBagGroupFilter(e.target.value)}
                className="p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:border-slate-300"
              >
                <option value="">All Blood Groups</option>
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              <select 
                value={bagComponentFilter}
                onChange={e => setBagComponentFilter(e.target.value)}
                className="p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:border-slate-300"
              >
                <option value="">All Components</option>
                <option value="whole_blood">Whole Blood</option>
                <option value="packed_red_cells">Packed Red Cells</option>
                <option value="fresh_frozen_plasma">Plasma (FFP)</option>
                <option value="platelets">Platelets</option>
              </select>
            </div>
            
            <div className="text-xs font-bold text-slate-400">
              Showing {bags.filter(b => (!bagGroupFilter || b.bloodGroup === bagGroupFilter) && (!bagComponentFilter || b.componentType === bagComponentFilter)).length} available stock reserves.
            </div>
          </div>

          {/* Bags Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Bag Number</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Group</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Component Type</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Volume</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Donated Date</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Expiry Date</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Storage Coordinates</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bags
                  .filter(b => (!bagGroupFilter || b.bloodGroup === bagGroupFilter) && (!bagComponentFilter || b.componentType === bagComponentFilter))
                  .map(b => {
                    const isExpiring = new Date(b.expiryDate).getTime() < Date.now() + (5 * 24 * 3600 * 1000);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/40">
                        <td className="p-4 font-mono font-black text-slate-700 text-xs">{b.bagNumber}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full ${getBloodGroupColorClass(b.bloodGroup)} text-[10px] font-extrabold shadow-sm`}>
                            {b.bloodGroup}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-xs text-slate-700 capitalize">
                          {b.componentType.replace(/_/g, " ")}
                        </td>
                        <td className="p-4 font-extrabold text-xs text-slate-900">{b.volumeMl} ml</td>
                        <td className="p-4 text-xs font-semibold text-slate-500">
                          {new Date(b.donatedDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-xs font-semibold">
                          <span className={isExpiring ? "text-rose-600 font-extrabold" : "text-slate-500"}>
                            {new Date(b.expiryDate).toLocaleDateString()} {isExpiring && "⚠️"}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {b.storageLocation}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            b.status === "available" ? "bg-emerald-50 text-emerald-700" :
                            b.status === "reserved" ? "bg-blue-50 text-blue-700" :
                            b.status === "transfused" ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-700"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => {
                              setEditingBag(b);
                              setEditBagLocation(b.storageLocation);
                            }}
                            className="text-[10px] font-bold px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg cursor-pointer bg-white"
                          >
                            Update Storage
                          </button>
                        </td>
                      </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== 👥 DONORS PANEL ==================== */}
      {activePanel === "donors" && (
        <div className="space-y-4">
          
          {/* Header Action / Search */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input 
                type="text"
                placeholder="Search donors by name or phone..."
                value={donorSearch}
                onChange={e => setDonorSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select 
                value={donorGroupFilter}
                onChange={e => setDonorGroupFilter(e.target.value)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="">All Blood Groups</option>
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              <button 
                onClick={() => setShowAddDonor(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold border-0 cursor-pointer flex items-center gap-1.5 ml-auto md:ml-0 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Register New Donor
              </button>
            </div>
          </div>

          {/* Donors Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20">
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Donor ID</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Group</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Gender / Age</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone / Email</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Last Donation</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Medical Exclusions</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Safety Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {donors
                    .filter(d => (!donorGroupFilter || d.bloodGroup === donorGroupFilter) && (!donorSearch || d.fullName.toLowerCase().includes(donorSearch.toLowerCase()) || d.phone.includes(donorSearch)))
                    .map(d => {
                      return (
                        <tr key={d.id} className="hover:bg-slate-50/40">
                          <td className="p-4 font-mono font-black text-slate-500 text-xs">{d.id}</td>
                          <td className="p-4">
                            <span className="font-extrabold text-slate-800 block text-xs">{d.fullName}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{d.address}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full ${getBloodGroupColorClass(d.bloodGroup)} text-[10px] font-extrabold shadow-sm`}>
                              {d.bloodGroup}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-xs text-slate-700">
                            {d.gender} / {d.age} yrs
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-semibold text-slate-700 block">{d.phone}</span>
                            <span className="text-[10px] text-slate-400 block">{d.email || "No email"}</span>
                          </td>
                          <td className="p-4 text-xs font-semibold text-slate-500">
                            {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : "Never donated"}
                          </td>
                          <td className="p-4 text-xs font-semibold text-slate-500 max-w-xs truncate">
                            {d.medicalHistory || "None recorded"}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              d.status === "eligible" ? "bg-emerald-50 text-emerald-700" :
                              d.status === "deferred" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                            }`}>
                              ● {d.status}
                            </span>
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

      {/* ==================== 💉 DONATIONS PANEL ==================== */}
      {activePanel === "donations" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowAddDonation(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold border-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Log Donation Event
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20">
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Donation ID</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Donor Name</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Group</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Date / Time</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Volume ml</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Vitals Metrics</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Pathology Screenings (HIV/HBV)</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Process Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {donations.map(dn => {
                    return (
                      <tr key={dn.id} className="hover:bg-slate-50/40">
                        <td className="p-4 font-mono font-black text-slate-500 text-xs">{dn.id}</td>
                        <td className="p-4">
                          <span className="font-extrabold text-slate-800 block text-xs">{dn.donorName}</span>
                          <span className="text-[10px] text-slate-400 block">ID: {dn.donorId}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full ${getBloodGroupColorClass(dn.bloodGroup)} text-[10px] font-extrabold shadow-sm`}>
                            {dn.bloodGroup}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-semibold text-slate-500">
                          {new Date(dn.donationDate).toLocaleString()}
                        </td>
                        <td className="p-4 font-extrabold text-xs text-slate-900">{dn.volumeMl} ml</td>
                        <td className="p-4">
                          <div className="text-[10px] font-bold text-slate-700">
                            BP: {dn.bp} | HR: {dn.pulse} bpm
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold">
                            Hemoglobin: {dn.hemoglobin} g/dL
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${dn.screeningResults.hiv === "negative" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                              HIV: {dn.screeningResults.hiv}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${dn.screeningResults.hbv === "negative" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                              HBV: {dn.screeningResults.hbv}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${dn.screeningResults.hcv === "negative" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                              HCV: {dn.screeningResults.hcv}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${dn.screeningResults.syphilis === "negative" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                              SYPH: {dn.screeningResults.syphilis}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            dn.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                            dn.status === "pending_screening" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                          }`}>
                            {dn.status}
                          </span>
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

      {/* ==================== 📥 WARD REQUESTS PANEL ==================== */}
      {activePanel === "requests" && (
        <div className="space-y-4">
          
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <select 
                value={requestStatusFilter}
                onChange={e => setRequestStatusFilter(e.target.value)}
                className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="allocated">Allocated</option>
                <option value="issued">Issued</option>
                <option value="transfused">Transfused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button 
              onClick={() => setShowAddRequest(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold border-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Transfusion Request
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20">
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Request ID</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Patient Name</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Target Group</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Component / Vol</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Required By</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Physician / Ward</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Urgency</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests
                    .filter(r => !requestStatusFilter || r.status === requestStatusFilter)
                    .map(r => {
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/40">
                          <td className="p-4 font-mono font-black text-slate-500 text-xs">{r.id}</td>
                          <td className="p-4">
                            <span className="font-extrabold text-slate-800 block text-xs">{r.patientName}</span>
                            <span className="text-[10px] text-slate-400 block">ID: {r.patientId}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full ${getBloodGroupColorClass(r.bloodGroup)} text-[10px] font-extrabold shadow-sm`}>
                              {r.bloodGroup}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-700 font-bold capitalize">
                            <div>{r.componentType.replace(/_/g, " ")}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{r.units} Units ({r.volumeMl} ml)</div>
                          </td>
                          <td className="p-4 text-xs font-semibold text-slate-500">
                            {new Date(r.requiredDate).toLocaleString()}
                          </td>
                          <td className="p-4 font-semibold text-xs text-slate-600">
                            <div>{r.requestingDoctor}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{r.wardId}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              r.urgency === "emergency" ? "bg-rose-100 text-rose-800 animate-pulse" :
                              r.urgency === "urgent" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                            }`}>
                              {r.urgency}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              r.status === "pending" ? "bg-amber-50 text-amber-700" :
                              r.status === "allocated" ? "bg-blue-50 text-blue-700 animate-pulse" :
                              r.status === "issued" ? "bg-purple-50 text-purple-700" :
                              r.status === "transfused" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                            }`}>
                              ● {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {r.status === "pending" && (
                                <button 
                                  onClick={() => setShowAllocateModal(r)}
                                  className="text-[10px] font-black px-2.5 py-1 text-white bg-blue-600 hover:bg-blue-700 border-0 rounded-lg cursor-pointer shadow-sm"
                                >
                                  Allocate Bag
                                </button>
                              )}
                              {r.status === "allocated" && (
                                <button 
                                  onClick={() => handleUpdateRequestStatus(r.id, "issued")}
                                  className="text-[10px] font-black px-2.5 py-1 text-white bg-purple-600 hover:bg-purple-700 border-0 rounded-lg cursor-pointer shadow-sm"
                                >
                                  Issue to Ward
                                </button>
                              )}
                              {r.status === "issued" && (
                                <button 
                                  onClick={() => handleUpdateRequestStatus(r.id, "transfused")}
                                  className="text-[10px] font-black px-2.5 py-1 text-white bg-emerald-600 hover:bg-emerald-700 border-0 rounded-lg cursor-pointer shadow-sm"
                                >
                                  Transfuse Patient
                                </button>
                              )}
                              {["pending", "allocated"].includes(r.status) && (
                                <button 
                                  onClick={() => handleUpdateRequestStatus(r.id, "cancelled")}
                                  className="text-[10px] font-bold px-2 py-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg cursor-pointer bg-white"
                                >
                                  Cancel
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

      {/* ==================== ⚠️ SAFETY & ALERTS PANEL ==================== */}
      {activePanel === "alerts" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Dynamic Inventory Threshold & Safety Monitoring</h3>
              <p className="text-xs text-slate-400">Automated systems audit blood bag ages and trigger alarms for depletion.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {alerts.map(a => {
                return (
                  <div key={a.id} className="py-4 flex items-start gap-4 justify-between">
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-black text-slate-800 block">{a.message}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                          <span>Group: {a.bloodGroup}</span>
                          <span>•</span>
                          <span>Triggered: {new Date(a.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span className="font-extrabold uppercase text-rose-500">{a.alertType.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                    </div>
                    {a.status === "active" ? (
                      <button 
                        onClick={() => handleResolveAlert(a.id)}
                        className="text-[10px] font-extrabold px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg border-0 cursor-pointer shadow-sm shrink-0"
                      >
                        Acknowledge & Resolve
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase">Resolved</span>
                    )}
                  </div>
                );
              })}
              {alerts.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  ✓ All stock parameters within normal bounds. No low alerts active.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD DONOR ==================== */}
      {showAddDonor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Blood Donor Registry Enrollment</h3>
                <p className="text-[11px] text-slate-400">Enroll new eligible donors following physical screener clearance.</p>
              </div>
              <button 
                onClick={() => setShowAddDonor(false)}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterDonor} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Donor Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Blood Group</label>
                  <select 
                    value={donorBloodGroup}
                    onChange={e => setDonorBloodGroup(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:bg-white"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                  <select 
                    value={donorGender}
                    onChange={e => setDonorGender(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Age</label>
                  <input 
                    type="number"
                    required
                    placeholder="e.g. 35"
                    value={donorAge}
                    onChange={e => setDonorAge(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. +91 98..."
                    value={donorPhone}
                    onChange={e => setDonorPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Email</label>
                <input 
                  type="email"
                  placeholder="e.g. anand@gmail.com"
                  value={donorEmail}
                  onChange={e => setDonorEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Residential Address</label>
                <input 
                  type="text"
                  placeholder="e.g. Saket, Sector 3, Block A"
                  value={donorAddress}
                  onChange={e => setDonorAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Screening Exclusions / History</label>
                <textarea 
                  placeholder="Prior malaria, recent tattoo, medications, dental surgery details..."
                  rows={2}
                  value={donorHistory}
                  onChange={e => setDonorHistory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddDonor(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs border-0 cursor-pointer shadow-sm"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: LOG DONATION ==================== */}
      {showAddDonation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Record Donor Donation Event</h3>
                <p className="text-[11px] text-slate-400">Record physical parameters and screening indicators for collected blood bags.</p>
              </div>
              <button 
                onClick={() => setShowAddDonation(false)}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordDonation} className="p-6 space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Select Donor</label>
                  <select 
                    required
                    value={donationDonorId}
                    onChange={e => setDonationDonorId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
                  >
                    <option value="">-- Choose registered donor --</option>
                    {donors.filter(d => d.status === "eligible").map(d => (
                      <option key={d.id} value={d.id}>{d.fullName} ({d.bloodGroup})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Volume Drawn</label>
                  <select 
                    value={donationVolume}
                    onChange={e => setDonationVolume(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
                  >
                    <option value="350">350 ml (Standard pediatric/light weight)</option>
                    <option value="450">450 ml (Standard adult)</option>
                  </select>
                </div>
              </div>

              {/* Physical Screening Parameters */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Physical Vitals Screener Check</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Blood Pressure</label>
                    <input 
                      type="text"
                      placeholder="e.g. 120/80"
                      value={donationBp}
                      onChange={e => setDonationBp(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Pulse rate</label>
                    <input 
                      type="number"
                      placeholder="72"
                      value={donationPulse}
                      onChange={e => setDonationPulse(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Hemoglobin (g/dL)</label>
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="14.5"
                      value={donationHemoglobin}
                      onChange={e => setDonationHemoglobin(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Serology Lab Screenings */}
              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-3">
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider block">Rapid Serological Pathogen Screening</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold text-rose-700 uppercase mb-1">HIV I/II</label>
                    <select 
                      value={screenHiv}
                      onChange={e => setScreenHiv(e.target.value as any)}
                      className="w-full p-2 bg-white border border-rose-200 rounded-xl font-bold text-xs focus:outline-none text-rose-900"
                    >
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-rose-700 uppercase mb-1">Hepatitis B (HBsAg)</label>
                    <select 
                      value={screenHbv}
                      onChange={e => setScreenHbv(e.target.value as any)}
                      className="w-full p-2 bg-white border border-rose-200 rounded-xl font-bold text-xs focus:outline-none text-rose-900"
                    >
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-rose-700 uppercase mb-1">Hepatitis C (HCV)</label>
                    <select 
                      value={screenHcv}
                      onChange={e => setScreenHcv(e.target.value as any)}
                      className="w-full p-2 bg-white border border-rose-200 rounded-xl font-bold text-xs focus:outline-none text-rose-900"
                    >
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-100">
                  <div>
                    <label className="block text-[8px] font-bold text-rose-700 uppercase mb-1">Syphilis (VDRL)</label>
                    <select 
                      value={screenSyphilis}
                      onChange={e => setScreenSyphilis(e.target.value as any)}
                      className="w-full p-2 bg-white border border-rose-200 rounded-xl font-bold text-xs focus:outline-none text-rose-900"
                    >
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-rose-700 uppercase mb-1">Malaria Parasite</label>
                    <select 
                      value={screenMalaria}
                      onChange={e => setScreenMalaria(e.target.value as any)}
                      className="w-full p-2 bg-white border border-rose-200 rounded-xl font-bold text-xs focus:outline-none text-rose-900"
                    >
                      <option value="negative">Negative</option>
                      <option value="positive">Positive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Post-Screening Safety State</label>
                  <select 
                    value={donationStatus}
                    onChange={e => setDonationStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
                  >
                    <option value="approved">Approved & Sterilized</option>
                    <option value="pending_screening">Pending Screening results</option>
                    <option value="discarded">Discard (Failed screenings)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Process notes</label>
                  <input 
                    type="text"
                    placeholder="e.g. Smooth draw, normal hydration levels"
                    value={donationNotes}
                    onChange={e => setDonationNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddDonation(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs border-0 cursor-pointer shadow-sm"
                >
                  Record Donation Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: NEW REQUEST ==================== */}
      {showAddRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Issue Hospital Transfusion Request</h3>
                <p className="text-[11px] text-slate-400">Order blood bag reserves for surgical, emergency, or ward clinical treatments.</p>
              </div>
              <button 
                onClick={() => setShowAddRequest(false)}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Patient Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Amit Patel"
                    value={reqPatientName}
                    onChange={e => setReqPatientName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Patient Code / ID (Optional)</label>
                  <input 
                    type="text"
                    placeholder="PAT-01"
                    value={reqPatientId}
                    onChange={e => setReqPatientId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Target Group</label>
                  <select 
                    value={reqBloodGroup}
                    onChange={e => setReqBloodGroup(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Component Required</label>
                  <select 
                    value={reqComponent}
                    onChange={e => setReqComponent(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
                  >
                    <option value="whole_blood">Whole Blood</option>
                    <option value="packed_red_cells">Packed Red Cells</option>
                    <option value="fresh_frozen_plasma">Plasma (FFP)</option>
                    <option value="platelets">Platelets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Units (Bags)</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    max="5"
                    value={reqUnits}
                    onChange={e => setReqUnits(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Urgency priority</label>
                  <select 
                    value={reqUrgency}
                    onChange={e => setReqUrgency(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
                  >
                    <option value="routine">Routine (Planned surgery)</option>
                    <option value="urgent">Urgent (&lt; 4 hours)</option>
                    <option value="emergency">Emergency (&lt; 15 mins)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Required by Date</label>
                  <input 
                    type="datetime-local"
                    value={reqRequiredDate}
                    onChange={e => setReqRequiredDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Requesting Ward</label>
                  <select 
                    value={reqWardId}
                    onChange={e => setReqWardId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
                  >
                    <option value="WRD-01">ICU (Ward-01)</option>
                    <option value="WRD-02">Surgical General (Ward-02)</option>
                    <option value="WRD-03">Emergency Ward</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Clinical Indication / Diagnosis Notes</label>
                <textarea 
                  placeholder="e.g. Major internal trauma hemorrhage, pre-op cardiac bypass check..."
                  rows={2}
                  value={reqNotes}
                  onChange={e => setReqNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddRequest(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs border-0 cursor-pointer shadow-sm"
                >
                  Issue Transfusion Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: STORAGE COORDINATES ==================== */}
      {editingBag && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">Relocate Blood Bag</h3>
                <p className="text-[10px] text-slate-400">Bag: {editingBag.bagNumber} ({editingBag.bloodGroup})</p>
              </div>
              <button 
                onClick={() => setEditingBag(null)}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBagStorage} className="p-5 space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Storage Coordinates</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Refrigerator A, Shelf 3, Tray 2"
                  value={editBagLocation}
                  onChange={e => setEditBagLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setEditingBag(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold text-xs border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs border-0 cursor-pointer shadow-sm"
                >
                  Confirm Coordinates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ALLOCATE BAG RESERVE ==================== */}
      {showAllocateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Allocate Compatible Blood Bag</h3>
                <p className="text-[11px] text-slate-400">Request: {showAllocateModal.id} • Patient: {showAllocateModal.patientName} ({showAllocateModal.bloodGroup})</p>
              </div>
              <button 
                onClick={() => setShowAllocateModal(null)}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Clinical Compatibility Guide</span>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Patient requires <span className="font-extrabold">{showAllocateModal.bloodGroup} {showAllocateModal.componentType.replace(/_/g, " ")}</span>. Only compatible, sterilized bags are displayed below.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Compatible bags in stock:</span>
                
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                  {bags
                    .filter(b => b.status === "available" && isCompatible(b.bloodGroup, showAllocateModal.bloodGroup) && b.componentType === showAllocateModal.componentType)
                    .map(b => (
                      <div key={b.id} className="py-3 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-black text-xs text-slate-700 block">{b.bagNumber}</span>
                          <div className="flex gap-2 text-[10px] text-slate-400 font-bold mt-0.5">
                            <span className={`px-1.5 rounded-full ${getBloodGroupColorClass(b.bloodGroup)}`}>{b.bloodGroup}</span>
                            <span>• {b.volumeMl} ml</span>
                            <span>• Storage: {b.storageLocation}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAllocateBag(showAllocateModal.id, b.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold rounded-lg border-0 cursor-pointer shadow-sm"
                        >
                          Allocate Reserve
                        </button>
                      </div>
                    ))}
                  
                  {bags.filter(b => b.status === "available" && isCompatible(b.bloodGroup, showAllocateModal.bloodGroup) && b.componentType === showAllocateModal.componentType).length === 0 && (
                    <div className="py-8 text-center text-xs text-rose-500 font-extrabold bg-rose-50/50 rounded-2xl border border-rose-100 p-4">
                      ⚠️ CRITICAL ALERT: No compatible available blood bags of component "{showAllocateModal.componentType.replace(/_/g, " ")}" found in active inventory. Place immediate donation drive or external transfer order!
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowAllocateModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs border-0 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
