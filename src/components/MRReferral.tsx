import React, { useState, useEffect } from "react";
import { 
  Users, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  Share2, 
  UserPlus, 
  ArrowLeft, 
  Building, 
  Sparkles, 
  Smartphone, 
  Mail, 
  Check, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Laptop 
} from "lucide-react";
import { MRProfile, Referral } from "../types";

interface MRReferralProps {
  onBackToLanding: () => void;
}

export default function MRReferral({ onBackToLanding }: MRReferralProps) {
  // Navigation inside MR module
  const [activeProfile, setActiveProfile] = useState<MRProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [allProfiles, setAllProfiles] = useState<MRProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(true);

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState<MRProfile | null>(null);

  // Sandbox Doctor Signup Simulation State
  const [simDocName, setSimDocName] = useState("");
  const [simDocEmail, setSimDocEmail] = useState("");
  const [simDocPhone, setSimDocPhone] = useState("");
  const [simDocClinic, setSimDocClinic] = useState("");
  const [simDocSize, setSimDocSize] = useState("1");
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  // Feedback states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [whatsappShared, setWhatsappShared] = useState(false);

  // Load all preseeded profiles on mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setProfilesLoading(true);
      const res = await fetch("/api/v1/mr/profiles");
      if (res.ok) {
        const data = await res.json();
        setAllProfiles(data);
      }
    } catch (err) {
      console.error("Error fetching MR profiles:", err);
    } finally {
      setProfilesLoading(false);
    }
  };

  // Load specific MR Dashboard
  const loadDashboard = async (mrId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/mr/dashboard/${mrId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveProfile(data.profile);
        setReferrals(data.referrals);
      }
    } catch (err) {
      console.error("Error loading MR dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle MR Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError("");
    if (!fullName || !email || !phone) {
      setRegistrationError("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/v1/mr/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, companyName })
      });

      const data = await res.json();
      if (res.ok) {
        setRegistrationSuccess(data);
        setActiveProfile(data);
        setReferrals([]);
        fetchProfiles(); // Refresh the list of profiles
      } else {
        setRegistrationError(data.detail || "Registration failed. Try another email.");
      }
    } catch (err) {
      setRegistrationError("Connection error. Could not register.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Sandbox Doctor Onboarding Simulation
  const handleSandboxSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;
    if (!simDocName || !simDocEmail || !simDocPhone || !simDocClinic) {
      alert("Please fill out all doctor details for the simulation.");
      return;
    }

    try {
      setSimulationLoading(true);
      const res = await fetch("/api/v1/clinic/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: simDocName,
          email: simDocEmail,
          phone: simDocPhone,
          clinicName: simDocClinic,
          doctorCount: simDocSize,
          referralCode: activeProfile.referralCode
        })
      });

      if (res.ok) {
        setSimulationSuccess(true);
        // Reset simulation form fields
        setSimDocName("");
        setSimDocEmail("");
        setSimDocPhone("");
        setSimDocClinic("");
        // Reload MR dashboard to see live data change!
        await loadDashboard(activeProfile.id);
        // Automatically fade success message
        setTimeout(() => setSimulationSuccess(false), 5000);
      } else {
        const data = await res.json();
        alert(data.detail || "Simulation registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error during doctor signup simulation");
    } finally {
      setSimulationLoading(false);
    }
  };

  // Helper Copy Functions
  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Simulate WhatsApp Share
  const triggerWhatsAppShare = (code: string) => {
    setWhatsappShared(true);
    setTimeout(() => setWhatsappShared(false), 3000);
    const text = `🏥 Partner with CURA, the leading digital clinic & EHR platform! Sign up with my referral code: *${code}* and get 10% off for your first 3 months plus free AI trial credits! Register your clinic here: ${window.location.origin}#signup`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* GLAM HEADER */}
      <header className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToLanding}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
              title="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-500/20 text-purple-300 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full border border-purple-400/20">
                  💪 Distribution Network
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full border border-emerald-400/20">
                  ₹500+ Recurring Commission
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1.5 font-sans">
                CURA <span className="text-purple-400 font-light">MR Referral</span> Engine
              </h1>
              <p className="text-slate-300 text-xs md:text-sm mt-1">
                Launch, scale, and track your clinic distribution network offline and online.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-slate-300 px-2 uppercase tracking-wide">
              Demo Active profiles
            </span>
            {profilesLoading ? (
              <span className="text-xs text-slate-400 px-3">Loading profiles...</span>
            ) : (
              <div className="flex gap-1.5">
                {allProfiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setRegistrationSuccess(null);
                      loadDashboard(p.id);
                    }}
                    className={`text-xs px-3.5 py-2 font-bold rounded-xl transition cursor-pointer ${
                      activeProfile?.id === p.id 
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" 
                        : "bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white"
                    }`}
                  >
                    👤 {p.fullName.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CORE PORTAL LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid md:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ACTIVE VIEW (DASHBOARD OR REGISTRATION) */}
        <div className="md:col-span-8 space-y-8">
          
          {/* OPTION 1: ACTIVE DASHBOARD VIEW */}
          {activeProfile ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* MR PROFILE CARD */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border border-indigo-500/10">
                <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                        Active MR Profile
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
                      {activeProfile.fullName}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 font-semibold flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-purple-400" /> {activeProfile.companyName}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-4 text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {activeProfile.email}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <Smartphone className="h-3.5 w-3.5 text-slate-400" /> {activeProfile.phone}
                      </span>
                    </div>
                  </div>

                  {/* COPIERS & WHATSAPP */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 w-full md:w-auto md:min-w-[300px]">
                    <div>
                      <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                        Unique Referral Code
                      </span>
                      <div className="flex items-center justify-between bg-slate-900 border border-slate-700/60 rounded-xl p-2 pl-3.5">
                        <span className="font-mono text-lg font-black tracking-widest text-purple-300">
                          {activeProfile.referralCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(activeProfile.referralCode, false)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                          title="Copy referral code"
                        >
                          {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                        Instant Invite URL
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}?ref=${activeProfile.referralCode}#signup`, true)}
                          className="flex-1 text-xs font-bold py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer transition"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Copied Invite URL
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Copy Invite Link
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => triggerWhatsAppShare(activeProfile.referralCode)}
                          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer"
                          title="Share invitation via WhatsApp"
                        >
                          <Share2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                      {whatsappShared && (
                        <span className="block text-[10px] text-emerald-400 font-bold mt-1 text-center animate-pulse">
                          🔗 WhatsApp dispatch trigger opened in new tab!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BENTO STATS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* STAT CARD 1: Total Referrals */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Leads</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-slate-900">{activeProfile.totalReferrals}</p>
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">
                      Clinics registered
                    </span>
                  </div>
                </div>

                {/* STAT CARD 2: Successful Conversions */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Conversions</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-slate-900">{activeProfile.successfulReferrals}</p>
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">
                      100% Onboarding rate
                    </span>
                  </div>
                </div>

                {/* STAT CARD 3: Total Earnings */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Payout</span>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-purple-700">₹{activeProfile.totalEarnings.toLocaleString()}</p>
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">
                      Cash earned (Cleared)
                    </span>
                  </div>
                </div>

                {/* STAT CARD 4: Recurring Monthly Commission */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Recurring / Mo</span>
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-slate-900">₹{(activeProfile.successfulReferrals * 100).toLocaleString()}</p>
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">
                      Passive monthly stream
                    </span>
                  </div>
                </div>

              </div>

              {/* REFERRALS LIST TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Your Referral Network Pipeline
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Doctors and clinics who signed up using your referral code.
                    </p>
                  </div>
                  <span className="bg-purple-100 text-purple-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {referrals.length} Total Records
                  </span>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading your pipeline details...
                  </div>
                ) : referrals.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-slate-400 text-sm font-semibold">No referrals captured yet.</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Use the "Referral Simulator Sandbox" on the right to test onboarding a doctor!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-4">Clinic / Doctor</th>
                          <th className="p-4">Contact Detail</th>
                          <th className="p-4">Date Linked</th>
                          <th className="p-4">EHR Status</th>
                          <th className="p-4 text-right">Commission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {referrals.map((ref) => (
                          <tr key={ref.id} className="hover:bg-slate-50/55 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-slate-800">{ref.clinicName}</p>
                              <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                                {ref.doctorName}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className="font-mono text-slate-600 text-[11px]">{ref.doctorPhone}</p>
                              <p className="text-slate-500 text-[11px]">{ref.doctorEmail}</p>
                            </td>
                            <td className="p-4 text-slate-500 text-[11px] font-semibold">
                              {new Date(ref.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                <CheckCircle className="h-3 w-3" /> Live Trial Active
                              </span>
                            </td>
                            <td className="p-4 text-right font-black text-purple-700 font-mono">
                              ₹{ref.commissionAmount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          ) : (
            
            /* OPTION 2: ONBOARDING & REGISTRATION VIEW */
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Medical Representative (MR) Partner Onboarding
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Connect local clinics and hospitals to CURA. Share your unique code, save doctors 10% on monthly subscriptions, and earn ₹500 - ₹1,000 cash bonus + recurring monthly passive commissions.
                </p>
              </div>

              {registrationError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {registrationError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Suresh Deshmukh"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 outline-none text-sm transition-all text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="suresh@pharmafield.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 outline-none text-sm transition-all text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 outline-none text-sm transition-all text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide mb-1.5">
                    Pharma/Affiliated Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Abbott, Cipla, Sun Pharma"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 outline-none text-sm transition-all text-slate-800 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:opacity-95 text-white font-extrabold text-base rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-purple-500/10 hover:scale-[1.005]"
                  >
                    {loading ? "Generating Your Partner Node..." : "Onboard as MR Partner & Get Code"}
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>🔒 Secure UPI / Direct Bank Settlement</span>
                <span>📅 Verified Weekly Commission Cycles</span>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: SIMULATION & REVENUE POTENTIAL SIDEBAR */}
        <div className="md:col-span-4 space-y-6">
          
          {/* SANDBOX DOC ONBOARDING SIMULATOR */}
          {activeProfile && (
            <div className="bg-gradient-to-b from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-5 shadow-xl relative">
              <div className="absolute right-3.5 top-3.5">
                <span className="bg-purple-600 text-white text-[9px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                  Sandbox Active
                </span>
              </div>
              <h3 className="font-extrabold text-purple-950 text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" /> Referral Simulator Sandbox
              </h3>
              <p className="text-purple-900/80 text-xs mt-1 leading-relaxed">
                Want to test your referral system? Simulate a real clinician using your code <strong className="text-purple-950">{activeProfile.referralCode}</strong> to register their practice right now!
              </p>

              {simulationSuccess && (
                <div className="mt-4 p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-xl flex items-center gap-1.5 animate-bounce">
                  <CheckCircle className="h-4 w-4" /> Doctor referred! Your dashboard updated instantly.
                </div>
              )}

              <form onSubmit={handleSandboxSignup} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-[10px] font-black text-purple-900 uppercase tracking-wider mb-1">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Sona Mehra"
                    value={simDocName}
                    onChange={(e) => setSimDocName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/90 border border-purple-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-purple-900 uppercase tracking-wider mb-1">
                    Clinic / Hospital Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mehra Health & Cardio"
                    value={simDocClinic}
                    onChange={(e) => setSimDocClinic(e.target.value)}
                    className="w-full px-3 py-2 bg-white/90 border border-purple-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black text-purple-900 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 99001 12233"
                      value={simDocPhone}
                      onChange={(e) => setSimDocPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white/90 border border-purple-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-purple-900 uppercase tracking-wider mb-1">
                      Doctor Count Tier
                    </label>
                    <select
                      value={simDocSize}
                      onChange={(e) => setSimDocSize(e.target.value)}
                      className="w-full px-3 py-2 bg-white/90 border border-purple-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500 outline-none"
                    >
                      <option value="1">1 (Solo: ₹500)</option>
                      <option value="6-10">6-10 (Nursing: ₹1,000)</option>
                      <option value="10+">10+ (Hospital: ₹1,000)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-purple-900 uppercase tracking-wider mb-1">
                    Doctor Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="dr.mehra@clinic.com"
                    value={simDocEmail}
                    onChange={(e) => setSimDocEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white/90 border border-purple-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={simulationLoading}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-purple-600/10"
                >
                  {simulationLoading ? "⏳ Dispatching Live Lead..." : "🚀 Onboard Sim Doctor & Update Dashboard"}
                </button>
              </form>
            </div>
          )}

          {/* COMMISSION OFFERS SLATE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-lg space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-purple-600" /> MR Referral Payout Matrix
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-slate-800 text-xs">Solo Clinic</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">₹1,499 Subscription</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-purple-600 text-sm">₹500</p>
                  <span className="text-[9px] text-emerald-600 font-bold">One-Time + ₹100/mo</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-slate-800 text-xs">Nursing Home</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">₹4,999 Subscription</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-purple-600 text-sm">₹1,000</p>
                  <span className="text-[9px] text-emerald-600 font-bold">One-Time + ₹300/mo</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-slate-800 text-xs">Hospital Suite</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">₹49,999 Subscription</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-purple-600 text-sm">₹5,000</p>
                  <span className="text-[9px] text-emerald-600 font-bold">One-Time + ₹2,000/mo</span>
                </div>
              </div>
            </div>
          </div>

          {/* DISTRIBUTION ADVANTAGE */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 shadow-lg space-y-4">
            <h4 className="font-extrabold text-purple-400 text-xs uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Why MRs Are Successful
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold mt-0.5">✔</span>
                <span><strong>Daily Access:</strong> Visit 10-20 doctors in clinic daily during prescription routines.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold mt-0.5">✔</span>
                <span><strong>High Trust:</strong> Pre-existing personal relationships with medical professionals.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold mt-0.5">✔</span>
                <span><strong>Zero Cost:</strong> Doctors get a 14-day trial &amp; discount code, so MR pitch is instantly welcome!</span>
              </li>
            </ul>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>© 2026 CURA Healthcare Tech Systems Pvt Ltd.</span>
          <button 
            onClick={onBackToLanding}
            className="text-purple-600 hover:text-purple-800 transition cursor-pointer"
          >
            ← Return to Landing Page Portal
          </button>
        </div>
      </footer>
    </div>
  );
}
