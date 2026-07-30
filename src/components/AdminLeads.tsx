import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  RefreshCw, 
  ArrowLeft, 
  ShieldAlert, 
  Calendar, 
  Globe, 
  Users, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Activity, 
  CheckCircle2, 
  Plus, 
  Layers, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  AlertTriangle, 
  ThumbsUp,
  Tag
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
  Legend 
} from "recharts";
import { ClinicLead } from "../types";

interface AdminLeadsProps {
  onBackToLanding: () => void;
}

// CRM Local Types (Matching backend schema)
interface CrmLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  clinicName: string;
  clinicType: "clinic" | "nursing_home" | "hospital";
  city: string;
  state: string;
  pincode: string;
  doctorCount: number;
  bedsCount: number;
  source: "website" | "referral" | "social_media" | "mr" | "other";
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  interests: string[];
  budgetRange: string;
  lastContact?: string;
  nextFollowUp?: string;
  notes: string;
  createdAt: string;
}

interface CrmCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  city: string;
  state: string;
  pincode: string;
  plan: "basic" | "clinic" | "hospital" | "enterprise";
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "churned";
  totalConsultations: number;
  totalPatients: number;
  totalDoctors: number;
  preferredContact: "whatsapp" | "email" | "phone";
  lifetimeValue: number;
  churnRisk: number; // 0-100
  notes: string;
  createdAt: string;
}

interface CrmDeal {
  id: string;
  leadId: string;
  dealName: string;
  stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  amount: number;
  probability: number; // 0-100
  expectedCloseDate: string;
  products: string[];
  decisionMaker: string;
  decisionMakerRole: string;
  notes: string;
  createdAt: string;
}

interface CrmInteraction {
  id: string;
  leadId?: string;
  customerId?: string;
  interactionType: "call" | "email" | "meeting" | "whatsapp" | "demo" | "follow_up" | "support";
  subject: string;
  description: string;
  interactionDate: string;
  durationMinutes: number;
  outcome: "positive" | "neutral" | "negative";
  followUpDate?: string;
  followUpAction?: string;
  notes?: string;
  createdAt: string;
}

interface CrmTicket {
  id: string;
  ticketNumber: string;
  customerId?: string;
  leadId?: string;
  category: "billing" | "technical" | "support" | "consultation";
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo: string;
  resolution?: string;
  resolvedAt?: string;
  customerSatisfaction?: number; // 1-5
  feedback?: string;
  createdAt: string;
}

interface CrmDashboard {
  totalLeads: number;
  newLeadsCount: number;
  qualifiedLeadsCount: number;
  convertedLeadsCount: number;
  totalCustomers: number;
  activeCustomers: number;
  openTicketsCount: number;
  urgentTicketsCount: number;
  totalPipelineValue: number;
  closedWonValue: number;
}

export default function AdminLeads({ onBackToLanding }: AdminLeadsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "trials" | "leads" | "customers" | "deals" | "interactions" | "support">("overview");
  
  // Real-time states
  const [trialLeads, setTrialLeads] = useState<ClinicLead[]>([]);
  const [crmStats, setCrmStats] = useState<CrmDashboard | null>(null);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [interactions, setInteractions] = useState<CrmInteraction[]>([]);
  const [tickets, setTickets] = useState<CrmTicket[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals & Inline Forms States
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showAddInteractionModal, setShowAddInteractionModal] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [convertingLead, setConvertingLead] = useState<CrmLead | null>(null);
  const [resolvingTicket, setResolvingTicket] = useState<CrmTicket | null>(null);

  // New Lead Inputs
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadClinic, setNewLeadClinic] = useState("");
  const [newLeadType, setNewLeadType] = useState<"clinic" | "nursing_home" | "hospital">("clinic");
  const [newLeadCity, setNewLeadCity] = useState("");
  const [newLeadState, setNewLeadState] = useState("");
  const [newLeadPincode, setNewLeadPincode] = useState("");
  const [newLeadDocCount, setNewLeadDocCount] = useState(2);
  const [newLeadBedCount, setNewLeadBedCount] = useState(0);
  const [newLeadSource, setNewLeadSource] = useState<"website" | "referral" | "social_media" | "mr" | "other">("website");
  const [newLeadInterests, setNewLeadInterests] = useState<string[]>([]);
  const [newLeadBudget, setNewLeadBudget] = useState("₹50,000 - ₹1,00,000");
  const [newLeadNotes, setNewLeadNotes] = useState("");

  // New Deal Inputs
  const [newDealLeadId, setNewDealLeadId] = useState("");
  const [newDealName, setNewDealName] = useState("");
  const [newDealStage, setNewDealStage] = useState<"prospecting" | "qualification" | "proposal" | "negotiation">("prospecting");
  const [newDealAmount, setNewDealAmount] = useState(150000);
  const [newDealProb, setNewDealProb] = useState(20);
  const [newDealClose, setNewDealClose] = useState("2026-09-01");
  const [newDealMaker, setNewDealMaker] = useState("");
  const [newDealRole, setNewDealRole] = useState("");
  const [newDealProducts, setNewDealProducts] = useState<string[]>([]);
  const [newDealNotes, setNewDealNotes] = useState("");

  // New Interaction Inputs
  const [newIntType, setNewIntType] = useState<"call" | "email" | "meeting" | "whatsapp" | "demo">("call");
  const [newIntTarget, setNewIntTarget] = useState<"lead" | "customer">("lead");
  const [newIntLeadId, setNewIntLeadId] = useState("");
  const [newIntCustomerId, setNewIntCustomerId] = useState("");
  const [newIntSubject, setNewIntSubject] = useState("");
  const [newIntDesc, setNewIntDesc] = useState("");
  const [newIntDur, setNewIntDur] = useState(15);
  const [newIntOutcome, setNewIntOutcome] = useState<"positive" | "neutral" | "negative">("positive");
  const [newIntFollowDate, setNewIntFollowDate] = useState("");
  const [newIntFollowAction, setNewIntFollowAction] = useState("");

  // New Ticket Inputs
  const [newTktCustomerId, setNewTktCustomerId] = useState("");
  const [newTktCategory, setNewTktCategory] = useState<"billing" | "technical" | "support">("support");
  const [newTktSubject, setNewTktSubject] = useState("");
  const [newTktDesc, setNewTktDesc] = useState("");
  const [newTktPriority, setNewTktPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  // Conversion Input
  const [conversionPlan, setConversionPlan] = useState<"clinic" | "hospital" | "enterprise">("clinic");
  const [conversionContact, setConversionContact] = useState<"whatsapp" | "email" | "phone">("whatsapp");

  // Resolution Input
  const [resolutionText, setResolutionText] = useState("");
  const [resRating, setResRating] = useState(5);
  const [resFeedback, setResFeedback] = useState("");

  // Fetch all CRM and Trial data
  const fetchAllCrmData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Fetch Trial Signups
      const resTrials = await fetch("/api/v1/clinic/leads");
      if (resTrials.ok) {
        const data = await resTrials.json();
        setTrialLeads(data);
      }

      // 2. Fetch CRM Dashboard
      const resDash = await fetch("/api/v1/crm/dashboard");
      if (resDash.ok) {
        const data = await resDash.json();
        setCrmStats(data);
      }

      // 3. Fetch CRM Leads
      const resLeads = await fetch("/api/v1/crm/leads");
      if (resLeads.ok) {
        const data = await resLeads.json();
        setLeads(data);
      }

      // 4. Fetch CRM Customers
      const resCusts = await fetch("/api/v1/crm/customers");
      if (resCusts.ok) {
        const data = await resCusts.json();
        setCustomers(data);
      }

      // 5. Fetch CRM Deals
      const resDeals = await fetch("/api/v1/crm/deals");
      if (resDeals.ok) {
        const data = await resDeals.json();
        setDeals(data);
      }

      // 6. Fetch CRM Interactions
      const resInts = await fetch("/api/v1/crm/interactions");
      if (resInts.ok) {
        const data = await resInts.json();
        setInteractions(data);
      }

      // 7. Fetch CRM Tickets
      const resTkts = await fetch("/api/v1/crm/tickets");
      if (resTkts.ok) {
        const data = await resTkts.json();
        setTickets(data);
      }

    } catch (e) {
      setErrorMsg("Failed to connect to full-stack Enterprise CRM API.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCrmData();
  }, []);

  // Actions Form Submits
  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadClinic) {
      alert("Name and Clinic name are required");
      return;
    }
    try {
      const res = await fetch("/api/v1/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newLeadName,
          email: newLeadEmail,
          phone: newLeadPhone,
          clinicName: newLeadClinic,
          clinicType: newLeadType,
          city: newLeadCity,
          state: newLeadState,
          pincode: newLeadPincode,
          doctorCount: newLeadDocCount,
          bedsCount: newLeadBedCount,
          source: newLeadSource,
          interests: newLeadInterests,
          budgetRange: newLeadBudget,
          notes: newLeadNotes
        })
      });

      if (res.ok) {
        setSuccessMsg(`Successfully registered new CRM Lead: ${newLeadClinic}`);
        setShowAddLeadModal(false);
        // Clear fields
        setNewLeadName(""); setNewLeadEmail(""); setNewLeadPhone(""); setNewLeadClinic(""); setNewLeadNotes("");
        fetchAllCrmData();
      } else {
        alert("Error registering lead");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealName || !newDealLeadId) {
      alert("Deal Name and associated Lead are required");
      return;
    }
    try {
      const res = await fetch("/api/v1/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: newDealLeadId,
          dealName: newDealName,
          stage: newDealStage,
          amount: newDealAmount,
          probability: newDealProb,
          expectedCloseDate: new Date(newDealClose).toISOString(),
          products: newDealProducts,
          decisionMaker: newDealMaker,
          decisionMakerRole: newDealRole,
          notes: newDealNotes
        })
      });

      if (res.ok) {
        setSuccessMsg(`Successfully generated sales deal opportunity: ${newDealName}`);
        setShowAddDealModal(false);
        setNewDealName(""); setNewDealMaker(""); setNewDealRole(""); setNewDealNotes("");
        fetchAllCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntSubject) {
      alert("Subject is required");
      return;
    }
    try {
      const payload: any = {
        interactionType: newIntType,
        subject: newIntSubject,
        description: newIntDesc,
        interactionDate: new Date().toISOString(),
        durationMinutes: newIntDur,
        outcome: newIntOutcome,
        notes: newIntDesc
      };

      if (newIntTarget === "lead" && newIntLeadId) {
        payload.leadId = newIntLeadId;
      } else if (newIntTarget === "customer" && newIntCustomerId) {
        payload.customerId = newIntCustomerId;
      }

      if (newIntFollowDate) {
        payload.followUpDate = new Date(newIntFollowDate).toISOString();
        payload.followUpAction = newIntFollowAction;
      }

      const res = await fetch("/api/v1/crm/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg(`Logged interaction: ${newIntSubject}`);
        setShowAddInteractionModal(false);
        setNewIntSubject(""); setNewIntDesc(""); setNewIntFollowAction("");
        fetchAllCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTktSubject || !newTktCustomerId) {
      alert("Subject and Customer selection are required");
      return;
    }
    try {
      const res = await fetch("/api/v1/crm/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: newTktCustomerId,
          category: newTktCategory,
          subject: newTktSubject,
          description: newTktDesc,
          priority: newTktPriority,
          status: "open",
          assignedTo: "First Level Helpdesk"
        })
      });

      if (res.ok) {
        setSuccessMsg(`Created Support Ticket: ${newTktSubject}`);
        setShowAddTicketModal(false);
        setNewTktSubject(""); setNewTktDesc("");
        fetchAllCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeadConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;
    try {
      const res = await fetch(`/api/v1/crm/leads/${convertingLead.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: conversionPlan,
          preferredContact: conversionContact
        })
      });

      if (res.ok) {
        setSuccessMsg(`Successfully converted ${convertingLead.clinicName} into paid active subscriber!`);
        setConvertingLead(null);
        fetchAllCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;
    try {
      const res = await fetch(`/api/v1/crm/tickets/${resolvingTicket.id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution: resolutionText,
          customerSatisfaction: resRating,
          feedback: resFeedback
        })
      });

      if (res.ok) {
        setSuccessMsg(`Successfully resolved ticket ${resolvingTicket.ticketNumber}`);
        setResolvingTicket(null);
        setResolutionText(""); setResFeedback("");
        fetchAllCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateLeadStatus = async (leadId: string, status: "new" | "contacted" | "qualified" | "lost") => {
    try {
      const res = await fetch(`/api/v1/crm/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSuccessMsg("Lead status updated successfully");
        fetchAllCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateDealStage = async (dealId: string, stage: string, probability: number) => {
    try {
      const res = await fetch(`/api/v1/crm/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, probability })
      });
      if (res.ok) {
        setSuccessMsg("Deal pipeline updated successfully");
        fetchAllCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Recharts Data formatting helpers
  const getLeadsByStatusData = () => {
    const statuses = ["new", "contacted", "qualified", "converted", "lost"];
    return statuses.map(s => ({
      name: s.toUpperCase(),
      count: leads.filter(l => l.status === s).length
    }));
  };

  const getPipelineStageData = () => {
    const stages = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
    return stages.map(s => ({
      name: s.replace("_", " ").toUpperCase(),
      value: deals.filter(d => d.stage === s).reduce((sum, d) => sum + d.amount, 0)
    }));
  };

  const getTicketsByCategoryData = () => {
    const cats = ["billing", "technical", "support", "consultation"];
    const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"];
    return cats.map((c, i) => ({
      name: c.toUpperCase(),
      value: tickets.filter(t => t.category === c).length,
      color: COLORS[i]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* 1. TERMINAL & WORKSPACE HEADER BAR */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-emerald-400" />
          <div className="space-y-0.5">
            <span className="text-sm font-black uppercase tracking-widest text-slate-100 flex items-center gap-2">
              CURA Enterprise CRM Suite
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                Active Workspace
              </span>
            </span>
            <p className="text-[10px] text-slate-500 font-mono">Platform B2B Relations & Customer Experience Center</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={fetchAllCrmData} 
            disabled={loading}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
            title="Reload CRM and Leads"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button 
            onClick={onBackToLanding}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700/60"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Portal
          </button>
        </div>
      </header>

      {/* 2. SUB NAVIGATION MENUS */}
      <div className="bg-slate-950/50 border-b border-slate-800/80 px-6 py-2.5 flex flex-wrap gap-1.5 scrollbar-thin">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${
            activeTab === "overview" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-850/50"
          }`}
        >
          <Activity className="h-3.5 w-3.5 inline mr-1" /> CRM Dashboard
        </button>
        <button
          onClick={() => setActiveTab("trials")}
          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${
            activeTab === "trials" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-850/50"
          }`}
        >
          <Globe className="h-3.5 w-3.5 inline mr-1" /> Web Signups Database ({trialLeads.length})
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${
            activeTab === "leads" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-850/50"
          }`}
        >
          <Users className="h-3.5 w-3.5 inline mr-1" /> B2B CRM Leads ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${
            activeTab === "customers" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-850/50"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5 inline mr-1" /> Active Accounts ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab("deals")}
          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${
            activeTab === "deals" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-850/50"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5 inline mr-1" /> Deals & Opportunities ({deals.length})
        </button>
        <button
          onClick={() => setActiveTab("interactions")}
          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${
            activeTab === "interactions" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-850/50"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5 inline mr-1" /> Interaction Logs ({interactions.length})
        </button>
        <button
          onClick={() => setActiveTab("support")}
          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${
            activeTab === "support" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-850/50"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 inline mr-1" /> Helpdesk Tickets ({tickets.length})
        </button>
      </div>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">

        {/* FEEDBACK BANNER ALERTS */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/25 text-emerald-400 text-xs font-bold rounded-2xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> {successMsg}
            </span>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-white font-black text-xs border-0 bg-transparent cursor-pointer">✕</button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/25 text-rose-400 text-xs font-bold rounded-2xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" /> {errorMsg}
            </span>
            <button onClick={() => setErrorMsg("")} className="text-rose-500 hover:text-white font-black text-xs border-0 bg-transparent cursor-pointer">✕</button>
          </div>
        )}

        {/* ==========================================
            TAB 1: CRM DASHBOARD OVERVIEW
            ========================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* KPI STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total CRM Leads</span>
                <p className="text-2xl font-black text-white mt-1.5">{crmStats?.totalLeads || 0}</p>
                <div className="flex items-center gap-1.5 text-[9.5px] text-emerald-400 font-bold mt-2 font-mono">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{crmStats?.qualifiedLeadsCount || 0} qualified</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Converted Accounts</span>
                <p className="text-2xl font-black text-white mt-1.5">{crmStats?.totalCustomers || 0}</p>
                <div className="flex items-center gap-1.5 text-[9.5px] text-sky-400 font-bold mt-2 font-mono">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>{crmStats?.activeCustomers || 0} active paid</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Support Ticket Load</span>
                <p className="text-2xl font-black text-rose-400 mt-1.5">{crmStats?.openTicketsCount || 0}</p>
                <div className="flex items-center gap-1.5 text-[9.5px] text-amber-500 font-bold mt-2 font-mono">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{crmStats?.urgentTicketsCount || 0} urgent unresolved</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Sales Pipeline Value</span>
                <p className="text-2xl font-black text-emerald-400 mt-1.5">
                  ₹{(crmStats?.totalPipelineValue || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5 text-[9.5px] text-emerald-400 font-bold mt-2 font-mono">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>₹{(crmStats?.closedWonValue || 0).toLocaleString()} closed won</span>
                </div>
              </div>
            </div>

            {/* VISUAL ANALYTICS & CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Chart 1: Leads funnel */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl lg:col-span-7">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">CRM Lead Stages Distribution</h4>
                  <span className="text-[9.5px] text-slate-500 font-mono">Funnel conversion health</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getLeadsByStatusData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155" }} />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Tickets category */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl lg:col-span-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Helpdesk Tickets by Category</h4>
                  <span className="text-[9.5px] text-slate-500 font-mono">SLA Breakdown</span>
                </div>
                <div className="h-60 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getTicketsByCategoryData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getTicketsByCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155" }} />
                      <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 9 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {tickets.length === 0 && (
                    <span className="absolute text-[10px] text-slate-500">No ticket logs</span>
                  )}
                </div>
              </div>

            </div>

            {/* QUICK ACTIONS BANNER */}
            <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Enterprise Customer Relations Hub</h3>
                <p className="text-[11px] text-slate-400">Launch dynamic sales campaigns, track referrals, log MR meetings and resolve customer SLAs in one interface.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddLeadModal(true)}
                  className="flex-1 sm:flex-initial py-2 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10.5px] rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border-0 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> New B2B Lead
                </button>
                <button
                  onClick={() => setShowAddTicketModal(true)}
                  className="flex-1 sm:flex-initial py-2 px-3.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-white font-black text-[10.5px] rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Create Ticket
                </button>
              </div>
            </div>

            {/* RECENT INTERACTIONS SUMMARY */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Recent Customer Interoperability Touchpoints</h3>
                <button onClick={() => setActiveTab("interactions")} className="text-[10px] text-emerald-400 hover:underline cursor-pointer border-0 bg-transparent font-bold">View all logs →</button>
              </div>
              <div className="space-y-2.5">
                {interactions.slice(0, 3).map((int, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl flex items-start gap-3.5 justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl mt-0.5">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11.5px] font-black text-slate-100">{int.subject}</p>
                        <p className="text-[10px] text-slate-400 leading-normal">{int.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/10 font-mono">
                            {int.interactionType}
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {int.durationMinutes} mins
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0">
                      {new Date(int.interactionDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 2: TRIAL SIGNUPS DATABASE
            ========================================== */}
        {activeTab === "trials" && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden space-y-0">
            <div className="p-6 border-b border-slate-850 bg-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Landing Page Signup Sync</h3>
                <p className="text-xs text-slate-400 mt-1">Real-time database records of clinic trials registered via the primary web portal landing page.</p>
              </div>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 font-black px-3 py-1 rounded-full border border-sky-500/25 uppercase font-mono">
                {trialLeads.length} Trial Registrations
              </span>
            </div>

            {trialLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-widest text-[9.5px]">
                      <th className="p-4">Registration Date</th>
                      <th className="p-4">Clinic Space Name</th>
                      <th className="p-4">Doctor Administrator</th>
                      <th className="p-4">Subdomain Allocation</th>
                      <th className="p-4">Contact Phone</th>
                      <th className="p-4">Initial Doctors</th>
                      <th className="p-4">Referral MR Code</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-semibold">
                    {trialLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4 text-slate-400 whitespace-nowrap">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "Now"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-200 font-extrabold">{lead.clinicName}</td>
                        <td className="p-4 text-slate-300">
                          <div className="space-y-0.5">
                            <p>{lead.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{lead.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sky-400 select-all font-mono">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5 text-sky-500/70" />
                            {lead.subdomain}.cura.in
                          </span>
                        </td>
                        <td className="p-4 text-slate-300 font-mono">{lead.phone}</td>
                        <td className="p-4 text-slate-300">{lead.doctorCount} Doctors</td>
                        <td className="p-4">
                          {lead.referralCode ? (
                            <span className="text-[9px] bg-purple-950 text-purple-300 font-black px-2.5 py-1 rounded-lg border border-purple-800 uppercase tracking-widest font-mono">
                              🤝 {lead.referralCode}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-850">
                            converted
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center text-xs font-semibold text-slate-500 space-y-3">
                <RefreshCw className="h-8 w-8 text-slate-600 animate-pulse mx-auto mb-2" />
                <p>The web trial registrations database is currently empty.</p>
                <p className="text-slate-600 font-normal max-w-lg mx-auto">
                  Log out or return to the Landing Page, complete the clinical registration form, and re-enter this console to trace the live ingestion process.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 3: B2B CRM LEADS
            ========================================== */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Enterprise B2B Lead Pipelines</h3>
                <p className="text-xs text-slate-400 mt-1">Manage qualified clinical leads, healthcare groups, and log conversions to paid subscriptions.</p>
              </div>
              <button
                onClick={() => setShowAddLeadModal(true)}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center gap-1 border-0"
              >
                <Plus className="h-4 w-4" /> Add Enterprise Lead
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
              {leads.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-widest text-[9.5px]">
                        <th className="p-4">Lead Contact</th>
                        <th className="p-4">Clinic / Medical Center</th>
                        <th className="p-4">Scale (Docs/Beds)</th>
                        <th className="p-4">Interest Area</th>
                        <th className="p-4">Budget Profile</th>
                        <th className="p-4">Next Follow Up</th>
                        <th className="p-4">Status / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-semibold">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4">
                            <div className="space-y-1">
                              <p className="text-slate-200 font-extrabold">{lead.fullName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{lead.email}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{lead.phone}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <p className="text-slate-200 font-extrabold">{lead.clinicName}</p>
                              <p className="text-[9.5px] text-slate-400 capitalize">{lead.clinicType.replace("_", " ")} • {lead.city}, {lead.state}</p>
                            </div>
                          </td>
                          <td className="p-4 text-slate-300">
                            <div className="space-y-0.5">
                              <p>{lead.doctorCount} Doctors</p>
                              {lead.bedsCount > 0 && <p className="text-[10px] text-slate-500">{lead.bedsCount} Inpatient Beds</p>}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {lead.interests.map((int, i) => (
                                <span key={i} className="text-[8.5px] bg-slate-900 border border-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded uppercase">
                                  {int}
                                </span>
                              ))}
                              {lead.interests.length === 0 && <span className="text-[10px] text-slate-500 italic">Generic</span>}
                            </div>
                          </td>
                          <td className="p-4 text-slate-300 font-mono">{lead.budgetRange}</td>
                          <td className="p-4 text-slate-400">
                            {lead.nextFollowUp ? (
                              <span className="flex items-center gap-1 font-mono text-[10.5px]">
                                <Clock className="h-3 w-3 text-amber-500" />
                                {new Date(lead.nextFollowUp).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            {lead.status === "converted" ? (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> Converted
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <select
                                  value={lead.status}
                                  onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                                  className="bg-slate-900 border border-slate-800 text-slate-200 text-[10.5px] p-1.5 rounded-lg focus:outline-none cursor-pointer"
                                >
                                  <option value="new">New</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="qualified">Qualified</option>
                                  <option value="lost">Lost</option>
                                </select>
                                
                                {lead.status === "qualified" && (
                                  <button
                                    onClick={() => setConvertingLead(lead)}
                                    className="py-1.5 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9.5px] rounded-lg transition-all cursor-pointer border-0 shadow-md uppercase tracking-wider inline-flex items-center gap-0.5"
                                  >
                                    Convert <ChevronRight className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">No B2B leads registered.</div>
              )}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 4: ACTIVE SUBSCRIPTION ACCOUNTS
            ========================================== */}
        {activeTab === "customers" && (
          <div className="space-y-4">
            
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">Active Enterprise Customer Accounts</h3>
              <p className="text-xs text-slate-400 mt-1">Monitor paid client health metrics, lifetime value (LTV), transaction activity levels and computed churn risks.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
              {customers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-widest text-[9.5px]">
                        <th className="p-4">Clinic Space Details</th>
                        <th className="p-4">Subscription Plan</th>
                        <th className="p-4">SaaS Lifecycle</th>
                        <th className="p-4">Platform Consults</th>
                        <th className="p-4">Patient Volume</th>
                        <th className="p-4">LTV Contribution</th>
                        <th className="p-4">AI Computed Churn Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-semibold">
                      {customers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4">
                            <div className="space-y-1">
                              <p className="text-slate-200 font-extrabold">{cust.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{cust.city}, {cust.state} • {cust.phone}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                              cust.plan === "enterprise" 
                                ? "bg-purple-500/10 border-purple-500/25 text-purple-400" 
                                : cust.plan === "hospital"
                                ? "bg-sky-500/10 border-sky-500/25 text-sky-400"
                                : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                            }`}>
                              {cust.plan} tier
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-400 text-[10px]">
                            <div className="space-y-0.5">
                              <p>Since: {new Date(cust.startDate).toLocaleDateString()}</p>
                              <p>Expiry: {new Date(cust.endDate).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="p-4 text-slate-200 font-mono">{(cust.totalConsultations || 120).toLocaleString()}</td>
                          <td className="p-4 text-slate-200 font-mono">{(cust.totalPatients || 85).toLocaleString()}</td>
                          <td className="p-4 text-emerald-400 font-bold font-mono">₹{cust.lifetimeValue.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    cust.churnRisk > 30 ? "bg-rose-500" : cust.churnRisk > 15 ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${cust.churnRisk}%` }}
                                />
                              </div>
                              <span className={`text-[10.5px] font-black font-mono ${
                                cust.churnRisk > 30 ? "text-rose-400" : cust.churnRisk > 15 ? "text-amber-400" : "text-emerald-400"
                              }`}>
                                {cust.churnRisk}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">No active customer accounts registered.</div>
              )}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 5: SALES DEALS & PIPELINE
            ========================================== */}
        {activeTab === "deals" && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Enterprise Deal Opportunities</h3>
                <p className="text-xs text-slate-400 mt-1">Track high-value upsell agreements, clinical modules add-on contracts, and negotiation logs.</p>
              </div>
              <button
                onClick={() => setShowAddDealModal(true)}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center gap-1 border-0"
              >
                <Plus className="h-4 w-4" /> Generate New Deal
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">
              {deals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-widest text-[9.5px]">
                        <th className="p-4">Deal Contract Target</th>
                        <th className="p-4">Estimated Amount</th>
                        <th className="p-4">Win Probability</th>
                        <th className="p-4">Decision Maker / Sponsor</th>
                        <th className="p-4">Products Selected</th>
                        <th className="p-4">Expected Close</th>
                        <th className="p-4">Current Pipeline Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-semibold">
                      {deals.map((deal) => (
                        <tr key={deal.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <p className="text-slate-100 font-black">{deal.dealName}</p>
                              {deal.notes && <p className="text-[10px] text-slate-500 italic">"{deal.notes}"</p>}
                            </div>
                          </td>
                          <td className="p-4 text-emerald-400 font-extrabold font-mono text-[13px]">₹{deal.amount.toLocaleString()}</td>
                          <td className="p-4">
                            <span className="font-mono text-slate-200">{deal.probability}% probability</span>
                          </td>
                          <td className="p-4 text-slate-300">
                            <div className="space-y-0.5">
                              <p>{deal.decisionMaker}</p>
                              <p className="text-[10px] text-slate-500">{deal.decisionMakerRole}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {deal.products.map((p, i) => (
                                <span key={i} className="text-[8px] bg-slate-900 text-slate-300 font-mono px-1.5 py-0.5 rounded uppercase border border-slate-800">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 font-mono text-slate-400">{new Date(deal.expectedCloseDate).toLocaleDateString()}</td>
                          <td className="p-4">
                            <select
                              value={deal.stage}
                              onChange={(e) => {
                                const newStage = e.target.value;
                                let p = 20;
                                if (newStage === "qualification") p = 40;
                                if (newStage === "proposal") p = 60;
                                if (newStage === "negotiation") p = 80;
                                if (newStage === "closed_won") p = 100;
                                if (newStage === "closed_lost") p = 0;
                                updateDealStage(deal.id, newStage, p);
                              }}
                              className="bg-slate-900 border border-slate-800 text-slate-200 text-[10.5px] p-1.5 rounded-lg focus:outline-none cursor-pointer font-bold"
                            >
                              <option value="prospecting">Prospecting (20%)</option>
                              <option value="qualification">Qualification (40%)</option>
                              <option value="proposal">Proposal shared (60%)</option>
                              <option value="negotiation">In Negotiation (80%)</option>
                              <option value="closed_won">Closed WON (100%)</option>
                              <option value="closed_lost">Closed LOST (0%)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">No deal pipelines active.</div>
              )}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 6: INTERACTION LOGS
            ========================================== */}
        {activeTab === "interactions" && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Enterprise Communication History</h3>
                <p className="text-xs text-slate-400 mt-1">Logs of all demo sessions, phone audits, meetings, and WhatsApp integrations with clinic partners.</p>
              </div>
              <button
                onClick={() => setShowAddInteractionModal(true)}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center gap-1 border-0"
              >
                <Plus className="h-4 w-4" /> Record Logged Activity
              </button>
            </div>

            <div className="space-y-3">
              {interactions.length > 0 ? (
                interactions.map((int) => (
                  <div key={int.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-2xl shrink-0 mt-0.5">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-[12.5px] font-black text-slate-100">{int.subject}</h4>
                          <span className="text-[8.5px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                            {int.interactionType}
                          </span>
                          <span className={`text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded font-mono ${
                            int.outcome === "positive" 
                              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                              : int.outcome === "negative"
                              ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                              : "bg-slate-900 border border-slate-800 text-slate-400"
                          }`}>
                            Outcome: {int.outcome}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{int.description}</p>
                        
                        {int.followUpAction && (
                          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 text-[10.5px] text-slate-400">
                            <span className="font-extrabold text-slate-300 uppercase tracking-wider block text-[8px] mb-1">Follow up Plan:</span>
                            {int.followUpAction} {int.followUpDate && <span className="font-mono text-[9px] text-amber-500 ml-1">({new Date(int.followUpDate).toLocaleDateString()})</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col justify-between items-end gap-1.5 text-right">
                      <span className="text-[10.5px] text-slate-400 font-mono block">
                        Logged on: {new Date(int.interactionDate).toLocaleDateString()}
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-mono block">
                        Duration: {int.durationMinutes} mins
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500">No interaction logs captured yet.</div>
              )}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 7: HELPDESK TICKETS
            ========================================== */}
        {activeTab === "support" && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Enterprise Helpdesk & Support tickets</h3>
                <p className="text-xs text-slate-400 mt-1">Resolve technical issues, billing discrepancies, or consulting support requests from active clinics.</p>
              </div>
              <button
                onClick={() => setShowAddTicketModal(true)}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center gap-1 border-0"
              >
                <Plus className="h-4 w-4" /> Create Service Ticket
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.length > 0 ? (
                tickets.map((tkt) => {
                  const isResolved = tkt.status === "resolved";
                  
                  return (
                    <div 
                      key={tkt.id} 
                      className={`bg-slate-950 border rounded-2xl p-4.5 space-y-4 relative overflow-hidden transition-all hover:border-slate-700 ${
                        isResolved ? "border-slate-800/60 opacity-80" : "border-slate-800 shadow-md"
                      }`}
                    >
                      {/* Priority strip */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${
                        tkt.priority === "urgent" 
                          ? "bg-rose-500" 
                          : tkt.priority === "high"
                          ? "bg-amber-500"
                          : "bg-sky-500"
                      }`} />

                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] bg-slate-900 border border-slate-850 font-bold font-mono px-2 py-0.5 rounded text-slate-400 uppercase tracking-wider">
                            {tkt.ticketNumber}
                          </span>
                          <h4 className="text-[12.5px] font-black text-slate-100">{tkt.subject}</h4>
                          <p className="text-[10.5px] text-slate-400 capitalize">{tkt.category} • Assigned to {tkt.assignedTo}</p>
                        </div>

                        <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          isResolved 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          {tkt.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-900/60 font-mono">
                        {tkt.description}
                      </p>

                      {isResolved ? (
                        <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 space-y-1 text-xs">
                          <span className="font-extrabold text-emerald-400 block uppercase tracking-wider text-[8px]">Resolution Details:</span>
                          <p className="text-slate-300">"{tkt.resolution}"</p>
                          {tkt.customerSatisfaction && (
                            <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-slate-400">
                              <span>Customer Satisfaction rating:</span>
                              <span className="font-extrabold text-amber-400">{"★".repeat(tkt.customerSatisfaction)}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setResolvingTicket(tkt)}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-xl transition-all cursor-pointer border-0 shadow-sm uppercase tracking-wider flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Resolve Support Ticket
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-slate-500 md:col-span-2">No active support tickets logged.</div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* ============================================================
          MODAL DIALOGS
          ============================================================ */}
      
      {/* 1. ADD B2B LEAD MODAL */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-200">Register B2B Enterprise Lead</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-white border-0 bg-transparent text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddLeadSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Contact Person Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    placeholder="e.g. Dr. Satish Nair"
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Clinic / Hospital Name</label>
                  <input 
                    type="text" 
                    required
                    value={newLeadClinic}
                    onChange={(e) => setNewLeadClinic(e.target.value)}
                    placeholder="e.g. Swasthya Diagnostic Care"
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Contact Email address</label>
                  <input 
                    type="email" 
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    placeholder="e.g. satish@swasthya.com"
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Contact Phone number</label>
                  <input 
                    type="text" 
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    placeholder="e.g. +91 91234 56789"
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Type</label>
                  <select
                    value={newLeadType}
                    onChange={(e) => setNewLeadType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500/30"
                  >
                    <option value="clinic">Clinic</option>
                    <option value="nursing_home">Nursing Home</option>
                    <option value="hospital">Hospital</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Doctors Count</label>
                  <input 
                    type="number" 
                    value={newLeadDocCount}
                    onChange={(e) => setNewLeadDocCount(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Inpatient Beds</label>
                  <input 
                    type="number" 
                    value={newLeadBedCount}
                    onChange={(e) => setNewLeadBedCount(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Lead Source</label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none"
                  >
                    <option value="website">Website Portal</option>
                    <option value="referral">Doctor Referral</option>
                    <option value="social_media">Social Media</option>
                    <option value="mr">Medical Rep (MR)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Budget Limit</label>
                  <select
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none"
                  >
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1L</option>
                    <option value="₹1,00,000 - ₹2,00,000">₹1L - ₹2L</option>
                    <option value="₹2,00,000 - ₹5,00,000">₹2L - ₹5L</option>
                    <option value="₹5,00,000+">₹5L+ Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Interests</label>
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {["opd", "ipd", "ayush", "pharmacy"].map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => {
                          if (newLeadInterests.includes(interest)) {
                            setNewLeadInterests(newLeadInterests.filter(i => i !== interest));
                          } else {
                            setNewLeadInterests([...newLeadInterests, interest]);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border transition-all ${
                          newLeadInterests.includes(interest)
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : "bg-slate-950 border-slate-850 text-slate-500"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Audit logs / Critical Notes</label>
                <textarea 
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  placeholder="Capture clinic specifications or follow up actions..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none h-16 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider cursor-pointer border-0 mt-2"
              >
                Save CRM Lead Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. CONVERT LEAD TO ACTIVE SUBSCRIBER DIALOG */}
      {convertingLead && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black uppercase text-slate-200">Convert Lead to Paid Subscriber</h3>
              <button onClick={() => setConvertingLead(null)} className="text-slate-400 hover:text-white border-0 bg-transparent text-sm cursor-pointer">✕</button>
            </div>

            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs text-slate-300 space-y-1">
              <span className="font-extrabold text-emerald-400 uppercase tracking-wider block text-[8px]">Client Profile:</span>
              <p className="font-black text-white">{convertingLead.clinicName}</p>
              <p>{convertingLead.fullName} • {convertingLead.city}</p>
            </div>

            <form onSubmit={handleLeadConversion} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Select SaaS Subscription Tier</label>
                <select
                  value={conversionPlan}
                  onChange={(e) => setConversionPlan(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer focus:outline-none"
                >
                  <option value="clinic">Clinic Tier — ₹1,20,000 / year</option>
                  <option value="hospital">Hospital Tier — ₹2,50,000 / year</option>
                  <option value="enterprise">Enterprise Tier — ₹5,00,000 / year</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Preferred Touchpoint Contact Channel</label>
                <select
                  value={conversionContact}
                  onChange={(e) => setConversionContact(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer focus:outline-none"
                >
                  <option value="whatsapp">Automated WhatsApp Broadcast</option>
                  <option value="email">Enterprise Email Notifications</option>
                  <option value="phone">Direct Phone Auditing</option>
                </select>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                Clicking "Confirm Conversion" will automatically create a sandbox tenant active client account, log an initial closed-won sales transaction, and sync with the communications engine.
              </p>

              <button 
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider cursor-pointer border-0"
              >
                Confirm Conversion & Spawn Space
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. GENERATE sales DEAL MODAL */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black uppercase text-slate-200">Record Sales Deal Opportunity</h3>
              <button onClick={() => setShowAddDealModal(false)} className="text-slate-400 hover:text-white border-0 bg-transparent text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddDealSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Associate Lead Target</label>
                <select
                  required
                  value={newDealLeadId}
                  onChange={(e) => {
                    setNewDealLeadId(e.target.value);
                    const selected = leads.find(l => l.id === e.target.value);
                    if (selected) {
                      setNewDealName(`${selected.clinicName} Expansion Contract`);
                      setNewDealMaker(selected.fullName);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value="">Select a Lead...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.clinicName} ({l.fullName})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Deal Opportunity Name</label>
                <input 
                  type="text" 
                  required
                  value={newDealName}
                  onChange={(e) => setNewDealName(e.target.value)}
                  placeholder="e.g. Swasthya Diagnostic Expansion"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Estimated Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newDealAmount}
                    onChange={(e) => setNewDealAmount(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Probability (0-100%)</label>
                  <input 
                    type="number" 
                    required
                    value={newDealProb}
                    onChange={(e) => setNewDealProb(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider cursor-pointer border-0"
              >
                Log Deal Contract
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. RECORD LOGGED ACTIVITY / INTERACTION */}
      {showAddInteractionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black uppercase text-slate-200">Log Interaction Audit Log</h3>
              <button onClick={() => setShowAddInteractionModal(false)} className="text-slate-400 hover:text-white border-0 bg-transparent text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddInteractionSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Touchpoint Channel</label>
                  <select
                    value={newIntType}
                    onChange={(e) => setNewIntType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="call">Phone Call</option>
                    <option value="email">Email Outreach</option>
                    <option value="meeting">In-Person Audit</option>
                    <option value="whatsapp">WhatsApp Broadcast</option>
                    <option value="demo">Demo Workshop</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Target Account Category</label>
                  <select
                    value={newIntTarget}
                    onChange={(e) => setNewIntTarget(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="lead">B2B CRM Lead</option>
                    <option value="customer">Active Converted Client</option>
                  </select>
                </div>
              </div>

              {newIntTarget === "lead" ? (
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Select CRM Lead</label>
                  <select
                    value={newIntLeadId}
                    onChange={(e) => setNewIntLeadId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold focus:outline-none"
                  >
                    <option value="">Select a Lead...</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.clinicName} ({l.fullName})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Select Active Account</label>
                  <select
                    value={newIntCustomerId}
                    onChange={(e) => setNewIntCustomerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold focus:outline-none"
                  >
                    <option value="">Select a Customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Subject Title</label>
                <input 
                  type="text" 
                  required
                  value={newIntSubject}
                  onChange={(e) => setNewIntSubject(e.target.value)}
                  placeholder="e.g. Conducted technical PACS interface sandbox demo"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Summary Notes & Feedback</label>
                <textarea 
                  value={newIntDesc}
                  onChange={(e) => setNewIntDesc(e.target.value)}
                  placeholder="Provide precise details of the audit meeting..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white h-16 resize-none focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Duration (minutes)</label>
                  <input 
                    type="number" 
                    value={newIntDur}
                    onChange={(e) => setNewIntDur(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Client Response Mood</label>
                  <select
                    value={newIntOutcome}
                    onChange={(e) => setNewIntOutcome(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="positive">Positive / Highly Interested</option>
                    <option value="neutral">Neutral / Informational</option>
                    <option value="negative">Critical / Hesitant</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider cursor-pointer border-0"
              >
                Log Communication Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. CREATE SUPPORT TICKET MODAL */}
      {showAddTicketModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black uppercase text-slate-200">Log Customer Support Ticket</h3>
              <button onClick={() => setShowAddTicketModal(false)} className="text-slate-400 hover:text-white border-0 bg-transparent text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddTicketSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Originating Customer Account</label>
                <select
                  required
                  value={newTktCustomerId}
                  onChange={(e) => setNewTktCustomerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value="">Select Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">SLA Ticket category</label>
                  <select
                    value={newTktCategory}
                    onChange={(e) => setNewTktCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
                  >
                    <option value="support">General Support</option>
                    <option value="billing">Billing Discrepancy</option>
                    <option value="technical">Technical Glitch</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Severity Level</label>
                  <select
                    value={newTktPriority}
                    onChange={(e) => setNewTktPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold cursor-pointer"
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High priority</option>
                    <option value="urgent">Urgent / SLA Breach</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Subject Summary</label>
                <input 
                  type="text" 
                  required
                  value={newTktSubject}
                  onChange={(e) => setNewTktSubject(e.target.value)}
                  placeholder="e.g. GST billing alignment error"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Full Problem Description</label>
                <textarea 
                  value={newTktDesc}
                  onChange={(e) => setNewTktDesc(e.target.value)}
                  placeholder="Describe the clinical issue reported by doctor..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white h-20 resize-none focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider cursor-pointer border-0"
              >
                Launch Helpdesk Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. RESOLVE SUPPORT TICKET DIALOG */}
      {resolvingTicket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black uppercase text-slate-200">Resolve Customer SLA Ticket</h3>
              <button onClick={() => setResolvingTicket(null)} className="text-slate-400 hover:text-white border-0 bg-transparent text-sm cursor-pointer">✕</button>
            </div>

            <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 text-xs text-slate-300 space-y-1 font-mono">
              <span className="font-extrabold text-rose-400 uppercase tracking-wider block text-[8px] font-sans">Ticket Info:</span>
              <p className="font-black text-white">{resolvingTicket.ticketNumber}</p>
              <p>{resolvingTicket.subject}</p>
            </div>

            <form onSubmit={handleResolveTicket} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] uppercase tracking-wider">Resolution details</label>
                <textarea 
                  required
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Describe how the problem was resolved (e.g. patched custom PDF generator code)..."
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white h-20 resize-none focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">Client CSAT score (1-5)</label>
                  <select
                    value={resRating}
                    onChange={(e) => setResRating(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="5">5 — Outstanding</option>
                    <option value="4">4 — Highly Satisfied</option>
                    <option value="3">3 — Neutral</option>
                    <option value="2">2 — Dissatisfied</option>
                    <option value="1">1 — Terrible</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-[10px] uppercase tracking-wider">CSAT feedback comments</label>
                  <input 
                    type="text" 
                    value={resFeedback}
                    onChange={(e) => setResFeedback(e.target.value)}
                    placeholder="Doctor satish verified fix"
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider cursor-pointer border-0"
              >
                Record Ticket Resolution
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
