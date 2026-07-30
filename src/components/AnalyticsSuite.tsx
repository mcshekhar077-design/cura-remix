import React, { useState } from "react";
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Activity, Clock, Calendar, 
  Sparkles, FileText, Download, Filter, RefreshCw, BarChart2, PieChart as PieChartIcon, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, ShieldCheck, Database,
  Sliders, Layers, FileSpreadsheet, Send, Search, Building2, BedDouble, Stethoscope
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area, Legend 
} from "recharts";

interface AnalyticsSuiteProps {
  onBackToLanding?: () => void;
}

// Sample Data
const monthlyRevenueData = [
  { month: "Jan", revenue: 8200000, expenses: 5100000, profit: 3100000 },
  { month: "Feb", revenue: 8900000, expenses: 5300000, profit: 3600000 },
  { month: "Mar", revenue: 9400000, expenses: 5600000, profit: 3800000 },
  { month: "Apr", revenue: 10200000, expenses: 5800000, profit: 4400000 },
  { month: "May", revenue: 11500000, expenses: 6200000, profit: 5300000 },
  { month: "Jun", revenue: 12500000, expenses: 6500000, profit: 6000000 },
];

const patientVolumeData = [
  { day: "Mon", opd: 320, ipd: 45, emergency: 28 },
  { day: "Tue", opd: 380, ipd: 52, emergency: 34 },
  { day: "Wed", opd: 410, ipd: 48, emergency: 22 },
  { day: "Thu", opd: 390, ipd: 55, emergency: 31 },
  { day: "Fri", opd: 440, ipd: 60, emergency: 40 },
  { day: "Sat", opd: 290, ipd: 38, emergency: 45 },
  { day: "Sun", opd: 180, ipd: 30, emergency: 50 },
];

const revenueByDepartment = [
  { name: "Cardiology", value: 3800000, color: "#3B82F6" },
  { name: "Surgery / OT", value: 3200000, color: "#10B981" },
  { name: "Orthopedics", value: 2100000, color: "#F59E0B" },
  { name: "Pharmacy", value: 1800000, color: "#8B5CF6" },
  { name: "Laboratory & Imaging", value: 1600000, color: "#EC4899" },
];

const topDiagnoses = [
  { diagnosis: "Type 2 Diabetes Mellitus", patients: 450, trend: "+8%" },
  { diagnosis: "Essential Hypertension", patients: 580, trend: "+12%" },
  { diagnosis: "Acute Coronary Syndrome", patients: 140, trend: "-3%" },
  { diagnosis: "GERD / Dyspepsia", patients: 310, trend: "+5%" },
  { diagnosis: "Osteoarthritis Knee", patients: 220, trend: "+15%" },
];

const bedOccupancyData = [
  { ward: "ICU / CCU", total: 40, occupied: 36, rate: 90 },
  { ward: "Surgical Ward", total: 80, occupied: 68, rate: 85 },
  { ward: "Medical Ward", total: 120, occupied: 98, rate: 81.6 },
  { ward: "Pediatric Ward", total: 30, occupied: 18, rate: 60 },
  { ward: "Private Rooms", total: 50, occupied: 46, rate: 92 },
];

export default function AnalyticsSuite({ onBackToLanding }: AnalyticsSuiteProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "clinical" | "financial" | "operational" | "ai_insights" | "reports">("overview");
  const [timeRange, setTimeRange] = useState("30d");
  const [customReportType, setCustomReportType] = useState("clinical_summary");
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  const handleExportReport = () => {
    setIsExporting(true);
    setExportMessage("Generating PDF/Excel dataset...");
    setTimeout(() => {
      setIsExporting(false);
      setExportMessage("Report successfully downloaded! (CURA_Analytics_Report.pdf)");
      setTimeout(() => setExportMessage(""), 4000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <BarChart2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">CURA Analytics & Intelligence Hub</h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live Data Engine
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">Enterprise Hospital Analytics, Predictive Revenue & Population Outcomes</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Fiscal Year 2025-26</option>
          </select>

          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Export Executive Brief
          </button>

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              Exit to Portal
            </button>
          )}
        </div>
      </div>

      {exportMessage && (
        <div className="max-w-7xl mx-auto mb-6 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {exportMessage}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "overview" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            Executive Overview
          </button>

          <button
            onClick={() => setActiveTab("clinical")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "clinical" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Clinical Outcomes
          </button>

          <button
            onClick={() => setActiveTab("financial")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "financial" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Financial & RCM
          </button>

          <button
            onClick={() => setActiveTab("operational")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "operational" 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <BedDouble className="w-4 h-4" />
            Bed & OT Operations
          </button>

          <button
            onClick={() => setActiveTab("ai_insights")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "ai_insights" 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" 
                : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            AI Predictive Engine
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "reports" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" 
                : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Custom Report Builder
          </button>
        </div>

        {/* TAB CONTENT: EXECUTIVE OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Monthly Hospital Revenue</span>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white">₹1.25 Cr</div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+14.2% vs last month</span>
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Active IPD Occupancy</span>
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <BedDouble className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white">82.4%</div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>266 / 320 Beds Occupied</span>
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Weekly OPD Footfall</span>
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white">2,430</div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+8.5% patient retention</span>
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Avg Emergency Wait Time</span>
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white">12.4 mins</div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>-3.1 mins optimized</span>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue vs Expenses Chart */}
              <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Financial Growth & Operating Profit</h3>
                    <p className="text-xs text-slate-400">Monthly Revenue vs Operational Costs (6 Month Trend)</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    Net Profit Margin: 48%
                  </span>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenueData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v/100000}L`} />
                      <Tooltip formatter={(value: any) => `₹${(value/100000).toFixed(1)} Lakhs`} />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Gross Revenue" />
                      <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue by Department */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Departmental Revenue Breakdown</h3>
                  <p className="text-xs text-slate-400 mb-4">Top Specialization Revenue Contributions</p>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueByDepartment}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          {revenueByDepartment.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `₹${(value/100000).toFixed(1)} Lakhs`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-slate-700/80">
                  {revenueByDepartment.slice(0, 3).map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }}></span>
                        <span className="text-slate-300 font-medium">{dept.name}</span>
                      </div>
                      <span className="text-white font-bold">₹{(dept.value/100000).toFixed(1)}L</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Patient Footfall Bar Chart */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Daily OPD & IPD Patient Flow</h3>
                  <p className="text-xs text-slate-400">Weekly Distribution across OPD, IPD Admissions & Emergency Triage</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="opd" name="OPD Visits" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ipd" name="IPD Admissions" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="emergency" name="Emergency Triage" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: CLINICAL OUTCOMES */}
        {activeTab === "clinical" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-1">Top Diagnoses & Prevalence</h3>
                <p className="text-xs text-slate-400 mb-6">Most frequent ICD-11 conditions treated across OPD & IPD</p>
                <div className="space-y-4">
                  {topDiagnoses.map((diag, i) => (
                    <div key={i} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{diag.diagnosis}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{diag.patients} Patients Treated this month</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          diag.trend.startsWith('+') ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {diag.trend} Month-over-Month
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-2">NABH Quality Metrics</h3>
                  <p className="text-xs text-slate-400 mb-6">Patient Safety & Care Quality Indicators</p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">Hospital Acquired Infection Rate</span>
                        <span className="text-emerald-400">0.42% (Target &lt; 1%)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">30-Day Readmission Rate</span>
                        <span className="text-emerald-400">2.1% (Target &lt; 5%)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">Surgical Site Infection (SSI)</span>
                        <span className="text-emerald-400">0.15%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">Medication Error Rate</span>
                        <span className="text-emerald-400">0.00%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Compliant with NABH 5th Edition Quality Standards
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: FINANCIAL & RCM */}
        {activeTab === "financial" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Claim Approval Rate</div>
                <div className="text-3xl font-black text-emerald-400">96.8%</div>
                <p className="text-xs text-slate-400 mt-2">Cashless TPA & Ayushman Bharat Claims cleared without rejection</p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Outstanding Receivables</div>
                <div className="text-3xl font-black text-amber-400">₹34.5 Lakhs</div>
                <p className="text-xs text-slate-400 mt-2">Average Payment Realization Period: 14 Days</p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Revenue Leakage Guarded</div>
                <div className="text-3xl font-black text-blue-400">₹12.8 Lakhs</div>
                <p className="text-xs text-slate-400 mt-2">Prevented unbilled services via AI Billing Audit</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: BED & OT OPERATIONS */}
        {activeTab === "operational" && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Ward Wise Bed Occupancy & Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bedOccupancyData.map((bed, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-white">{bed.ward}</span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                        {bed.rate}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      Occupied: <span className="text-white font-semibold">{bed.occupied}</span> / {bed.total} Beds
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${bed.rate > 88 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                        style={{ width: `${bed.rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: AI PREDICTIVE INSIGHTS */}
        {activeTab === "ai_insights" && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">CURA AI Predictive Hospital Engine</h3>
                  <p className="text-xs text-slate-300">Automated foresight model for admissions, bed surge forecasting & diagnostic demand</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> High Risk Surge Warning
                    </span>
                    <span className="text-[10px] text-slate-500">89% Confidence</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Predicted ICU Bed Surge in 48 Hours</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Historical viral respiratory trends predict an influx of 8-12 acute patients by Thursday. Recommended action: Reserve 4 step-down ICU beds.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pharmacy Stock Forecast
                    </span>
                    <span className="text-[10px] text-slate-500">94% Confidence</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Injectable Antibiotic Reorder Trigger</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Usage trajectory indicates IV Meropenem & Ceftriaxone stock will reach threshold level in 3 days. Automated PO generated for approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: CUSTOM REPORT BUILDER */}
        {activeTab === "reports" && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Custom Healthcare Report Builder</h3>
            <p className="text-xs text-slate-400 mb-6">Generate regulatory, clinical, and financial reports on demand</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-300">Select Report Category</label>
                <select 
                  value={customReportType} 
                  onChange={(e) => setCustomReportType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="clinical_summary">Monthly Clinical Outcomes & Mortality Rate</option>
                  <option value="nabh_audit">NABH Compliance & Audit Log</option>
                  <option value="financial_audit">Revenue Cycle & Insurance Settlement</option>
                  <option value="pharmacy_inventory">Pharmacy Consumption & Narcotic Register</option>
                </select>

                <button
                  onClick={handleExportReport}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Generate & Export Report
                </button>
              </div>

              <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Report Preview Metadata</h4>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span>Selected Template:</span>
                    <span className="text-white font-medium">{customReportType.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span>Export Formats:</span>
                    <span className="text-purple-400 font-medium">PDF, XLSX, CSV, HL7 FHIR JSON</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span>Data Compliance:</span>
                    <span className="text-emerald-400 font-medium">HIPAA & ABDM Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
