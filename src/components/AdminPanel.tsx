import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  Brain, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Filter, 
  Download,
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock,
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Plus,
  RefreshCw,
  Sliders,
  Database,
  FileText,
  UserCheck,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area 
} from "recharts";
import AdminLeads from "./AdminLeads";

interface AdminPanelProps {
  onBackToLanding: () => void;
}

export default function AdminPanel({ onBackToLanding }: AdminPanelProps) {
  const [activeNav, setActiveNav] = useState<
    "dashboard" | "users" | "clinics" | "subscriptions" | "ai_usage" | "whatsapp" | "crm" | "logs" | "settings"
  >("dashboard");

  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [aiUsage, setAiUsage] = useState<any>(null);
  const [whatsappAnalytics, setWhatsappAnalytics] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Mobile Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Responsive sidebar collapse state (default minimized on screens < 1024px)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch metrics and administrative state
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, userRes, clinicRes, aiRes, waRes, logRes, cfgRes] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/users"),
        fetch("/api/admin/clinics"),
        fetch("/api/admin/ai-usage"),
        fetch("/api/admin/whatsapp-analytics"),
        fetch("/api/admin/logs"),
        fetch("/api/admin/config/system")
      ]);

      if (dashRes.ok) {
        const d = await dashRes.json();
        setMetrics(d.data);
      }
      if (userRes.ok) {
        const u = await userRes.json();
        setUsers(u.data?.data || []);
      }
      if (clinicRes.ok) {
        const c = await clinicRes.json();
        setClinics(c.data || []);
      }
      if (aiRes.ok) {
        const a = await aiRes.json();
        setAiUsage(a.data);
      }
      if (waRes.ok) {
        const w = await waRes.json();
        setWhatsappAnalytics(w.data);
      }
      if (logRes.ok) {
        const l = await logRes.json();
        setLogs(l.data || []);
      }
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        setSystemConfig(cfg.data);
      }
    } catch (err) {
      console.error("Error fetching admin panel data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        setAlertMsg({
          type: "success",
          text: `User account status updated to ${!currentStatus ? "Active" : "Inactive"}`
        });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
      setAlertMsg({ type: "error", text: "Failed to update user status." });
    }
  };

  const toggleConfigSwitch = async (key: string, value: any) => {
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        setAlertMsg({ type: "success", text: `Updated ${key} setting.` });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.role?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "active" && u.is_active) || 
                          (statusFilter === "inactive" && !u.is_active);
    return matchesSearch && matchesStatus;
  });

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users, badge: users.length },
    { id: "clinics", label: "Clinic Tenants", icon: Building2, badge: clinics.length },
    { id: "subscriptions", label: "Subscriptions & Revenue", icon: CreditCard },
    { id: "ai_usage", label: "AI Usage Analytics", icon: Brain },
    { id: "whatsapp", label: "WhatsApp Traffic", icon: MessageSquare },
    { id: "crm", label: "Enterprise CRM & B2B", icon: Briefcase },
    { id: "logs", label: "Audit & Admin Logs", icon: FileText, badge: logs.length },
    { id: "settings", label: "System Config", icon: Settings }
  ];

  if (activeNav === "crm") {
    return (
      <div className="relative min-h-screen bg-slate-900 text-slate-100">
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setActiveNav("dashboard")}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Main Admin Console
          </button>
          <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider">CURA CRM & B2B Pipeline Module</span>
        </div>
        <AdminLeads onBackToLanding={onBackToLanding} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* MOBILE DRAWER OVERLAY & BACKDROP */}
      {mobileDrawerOpen && (
        <>
          <div 
            onClick={() => setMobileDrawerOpen(false)} 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden transition-opacity" 
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-50 md:hidden shadow-2xl animate-fadeIn">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/20 shrink-0">
                  C
                </div>
                <div>
                  <h1 className="text-sm font-black text-white tracking-wider uppercase">CURA Admin</h1>
                  <p className="text-[10px] text-purple-400 font-mono font-semibold">Autonomous Health OS</p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
              <p className="px-3 py-1.5 text-[9.5px] font-black uppercase tracking-widest text-slate-500">
                Control Center
              </p>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id as any);
                      setMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md shadow-purple-500/10"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-purple-500/30 text-purple-200" : "bg-slate-800 text-slate-400"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onBackToLanding();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700/60"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>Return to Web App</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className={`${sidebarCollapsed ? "w-16 sm:w-20" : "w-64"} bg-slate-900 border-r border-slate-800/80 hidden md:flex flex-col shrink-0 transition-all duration-300 relative z-20`}>
        <div className={`p-4 border-b border-slate-800 flex items-center ${sidebarCollapsed ? "justify-center flex-col gap-2" : "justify-between"}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/20 shrink-0">
              C
            </div>
            {!sidebarCollapsed && (
              <div className="whitespace-nowrap">
                <h1 className="text-sm font-black text-white tracking-wider uppercase">CURA Admin</h1>
                <p className="text-[10px] text-purple-400 font-mono font-semibold">Autonomous Health OS</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800/60 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                v3.2
              </span>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                title="Minimize Sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
              title="Expand Sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin">
          {!sidebarCollapsed && (
            <p className="px-3 py-1.5 text-[9.5px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
              Control Center
            </p>
          )}
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id as any)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-3" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-bold transition-all cursor-pointer relative group ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md shadow-purple-500/10"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-purple-500/30 text-purple-200" : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {sidebarCollapsed && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[8px] font-mono font-black px-1.5 py-0.2 rounded-full border border-purple-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={onBackToLanding}
            title={sidebarCollapsed ? "Return to Web App" : undefined}
            className={`w-full flex items-center justify-center gap-2 ${sidebarCollapsed ? "p-2.5" : "px-4 py-2.5"} rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700/60`}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap">Return to Web App</span>}
          </button>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        
        {/* HEADER BAR */}
        <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 bg-purple-600/90 hover:bg-purple-600 text-white rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 border border-purple-500/40"
              title="Open Navigation Menu"
            >
              <Menu className="h-4 w-4" />
              <span className="text-xs font-extrabold uppercase tracking-wide">Menu</span>
            </button>

            {/* Desktop Minimize/Expand Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-700/60 items-center gap-1.5"
              title={sidebarCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              <span className="text-[11px] font-bold hidden sm:inline">{sidebarCollapsed ? "Expand" : "Minimize"}</span>
            </button>

            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              {sidebarItems.find(i => i.id === activeNav)?.label}
              <span className="hidden lg:inline-block text-[10px] bg-emerald-500/15 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest font-mono">
                System Healthy
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer border border-slate-700/60"
              title="Refresh Live Admin Telemetry"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1.5 rounded-xl">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                SA
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-extrabold text-white">Super Admin</p>
                <p className="text-[9px] text-slate-400 font-mono">admin@cura.in</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT DISPLAY */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* ALERT NOTIFICATION */}
          {alertMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              alertMsg.type === "success" 
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" 
                : "bg-rose-950/40 border-rose-500/30 text-rose-400"
            }`}>
              <div className="flex items-center gap-2">
                {alertMsg.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{alertMsg.text}</span>
              </div>
              <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
          )}

          {/* TAB 1: DASHBOARD METRICS */}
          {activeNav === "dashboard" && metrics && (
            <div className="space-y-6">
              
              {/* PRIMARY METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Active Clinicians</span>
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mt-2">{metrics.users?.total || 0}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>+{metrics.users?.new_today || 0} registered today</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Revenue (ARR)</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-emerald-400 mt-2">
                    ₹{(metrics.subscriptions?.revenue || 0).toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>{metrics.subscriptions?.active || 0} active paid subscriptions</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">AI Clinical Inferences</span>
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                      <Brain className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-purple-300 mt-2">
                    {(metrics.ai?.total_calls || 0).toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-purple-400 font-mono">
                    <Activity className="h-3.5 w-3.5" />
                    <span>+{(metrics.ai?.calls_today || 0).toLocaleString()} today</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">WhatsApp Rx Volume</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mt-2">
                    {(metrics.whatsapp?.total_messages || 0).toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>+{(metrics.whatsapp?.messages_today || 0).toLocaleString()} sent today</span>
                  </div>
                </div>
              </div>

              {/* SECONDARY STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Patients Managed</p>
                    <p className="text-2xl font-black text-white mt-1">{(metrics.patients?.total || 0).toLocaleString()}</p>
                  </div>
                  <Database className="h-7 w-7 text-sky-400 opacity-80" />
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Consultations Completed</p>
                    <p className="text-2xl font-black text-white mt-1">{(metrics.appointments?.total || 0).toLocaleString()}</p>
                  </div>
                  <Clock className="h-7 w-7 text-amber-400 opacity-80" />
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Active Hospital & Clinic Tenants</p>
                    <p className="text-2xl font-black text-white mt-1">{metrics.tenants?.active || 0}</p>
                  </div>
                  <Building2 className="h-7 w-7 text-purple-400 opacity-80" />
                </div>
              </div>

              {/* CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl lg:col-span-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">AI Real-Time Inference Throughput</h3>
                      <p className="text-[10px] text-slate-400">7-Day rolling count of clinical decision support queries</p>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    {aiUsage && aiUsage.timeline && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={aiUsage.timeline}>
                          <defs>
                            <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155" }} />
                          <Area type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#aiGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl lg:col-span-4">
                  <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider mb-3">AI Inferences by Feature</h3>
                  <div className="space-y-3">
                    {aiUsage?.by_type?.map((item: any) => (
                      <div key={item.type} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="capitalize text-slate-300">{item.type.replace(/_/g, " ")}</span>
                          <span className="text-purple-400 font-mono">{item.count.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div 
                            className="bg-purple-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, (item.count / 25000) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeNav === "users" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search doctor or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[9.5px] tracking-wider">
                        <th className="p-4">Clinician / Doctor Name</th>
                        <th className="p-4">Role & Specialty</th>
                        <th className="p-4">Associated Clinic</th>
                        <th className="p-4">Consultations</th>
                        <th className="p-4">Account Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300">
                                {user.full_name?.charAt(0) || "D"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-200">{user.full_name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-300">{user.role}</td>
                          <td className="p-4 text-slate-300">{user.clinic}</td>
                          <td className="p-4 font-mono text-purple-300 font-bold">{user.consultations_count}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              user.is_active 
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                              className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer border ${
                                user.is_active
                                  ? "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60"
                                  : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/60"
                              }`}
                            >
                              {user.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLINIC TENANTS */}
          {activeNav === "clinics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clinics.map((clinic) => (
                  <div key={clinic.tenant.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-white text-sm">{clinic.tenant.name}</h3>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 uppercase">
                        {clinic.tenant.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{clinic.tenant.city}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold">Doctors</p>
                        <p className="font-bold text-slate-200">{clinic.user_count}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold">Patients</p>
                        <p className="font-bold text-slate-200">{clinic.patient_count}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-xs font-bold text-purple-400 font-mono">Plan: {clinic.subscription?.plan}</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">₹{(clinic.tenant.revenue || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SUBSCRIPTIONS */}
          {activeNav === "subscriptions" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase">Basic Tier</p>
                  <p className="text-2xl font-black text-white mt-1">₹4,999/mo</p>
                  <p className="text-xs text-slate-500 mt-2">12 Subscribers</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase">Clinic Tier</p>
                  <p className="text-2xl font-black text-white mt-1">₹14,999/mo</p>
                  <p className="text-xs text-slate-500 mt-2">22 Subscribers</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase">Hospital Tier</p>
                  <p className="text-2xl font-black text-white mt-1">₹39,999/mo</p>
                  <p className="text-xs text-slate-500 mt-2">10 Subscribers</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase">Enterprise Custom</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">Custom</p>
                  <p className="text-xs text-slate-500 mt-2">5 Groups</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI USAGE */}
          {activeNav === "ai_usage" && aiUsage && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider mb-4">Usage by AI Capability</h3>
                  {aiUsage.by_type?.map((item: any) => (
                    <div key={item.type} className="flex items-center justify-between py-2 border-b border-slate-800/60 text-xs">
                      <span className="capitalize font-bold text-slate-300">{item.type.replace(/_/g, " ")}</span>
                      <span className="font-mono text-purple-400 font-bold">{item.count.toLocaleString()} calls</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider mb-4">Top Tenant AI Consumption</h3>
                  {aiUsage.by_tenant?.map((tenant: any) => (
                    <div key={tenant.tenant_id} className="flex items-center justify-between py-2 border-b border-slate-800/60 text-xs">
                      <span className="font-bold text-slate-300">{tenant.name}</span>
                      <span className="font-mono text-sky-400 font-bold">{tenant.count.toLocaleString()} calls</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WHATSAPP TRAFFIC */}
          {activeNav === "whatsapp" && whatsappAnalytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold uppercase">Delivery Success Rate</p>
                  <p className="text-3xl font-black text-emerald-400 mt-2">{whatsappAnalytics.delivery_rate}%</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold uppercase">Messages Outbound</p>
                  <p className="text-3xl font-black text-white mt-2">124,500</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold uppercase">Active Gateway</p>
                  <p className="text-xl font-black text-sky-400 mt-2">Meta Cloud API v20.0</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM CONFIG & SETTINGS */}
          {activeNav === "settings" && systemConfig && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Platform Operational Parameters</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Emergency Override Switch</p>
                    <p className="text-[10px] text-slate-400">Allows doctors immediate override during CDSS alerts</p>
                  </div>
                  <button
                    onClick={() => toggleConfigSwitch("emergency_override_switch", !systemConfig.emergency_override_switch)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      systemConfig.emergency_override_switch 
                        ? "bg-emerald-500 text-slate-950" 
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {systemConfig.emergency_override_switch ? "ENABLED" : "DISABLED"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-200">System Maintenance Mode</p>
                    <p className="text-[10px] text-slate-400">Pause background sync for platform upgrade</p>
                  </div>
                  <button
                    onClick={() => toggleConfigSwitch("maintenance_mode", !systemConfig.maintenance_mode)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      systemConfig.maintenance_mode 
                        ? "bg-rose-500 text-white" 
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {systemConfig.maintenance_mode ? "ACTIVE" : "OFF"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-200">NABH Automated Compliance Reporting</p>
                    <p className="text-[10px] text-slate-400">Daily auto-audit log submission to NABH portal</p>
                  </div>
                  <button
                    onClick={() => toggleConfigSwitch("nabh_auto_reporting", !systemConfig.nabh_auto_reporting)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      systemConfig.nabh_auto_reporting 
                        ? "bg-purple-600 text-white" 
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {systemConfig.nabh_auto_reporting ? "ENABLED" : "DISABLED"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT LOGS */}
          {activeNav === "logs" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[9.5px]">
                      <th className="p-4">Log ID</th>
                      <th className="p-4">Administrator</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Target Detail</th>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        <td className="p-4 font-bold text-purple-400">{log.id}</td>
                        <td className="p-4 text-white font-sans font-bold">{log.admin}</td>
                        <td className="p-4 text-emerald-400 font-bold">{log.action}</td>
                        <td className="p-4 text-slate-200">{log.target}</td>
                        <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4 text-slate-500">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
