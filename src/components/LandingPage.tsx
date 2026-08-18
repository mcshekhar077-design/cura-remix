import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  ArrowRight, 
  Check, 
  Sparkles, 
  MessageSquare, 
  History, 
  AlertTriangle, 
  Video, 
  FileText, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Terminal,
  Play,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Leaf,
  Activity,
  Zap,
  Smartphone,
  Pill,
  Compass,
  Menu,
  X,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  Brain
} from "lucide-react";
import { ClinicLead } from "../types";
import ProductTour from "./ProductTour";

interface LandingPageProps {
  onNavigateToDashboard: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToPatient: () => void;
  onNavigateToPharmacy: () => void;
  onNavigateToAyush: () => void;
  onNavigateToMR: () => void;
  onNavigateToMentalHealth?: () => void;
  onNavigateToCardiology?: () => void;
  onNavigateToPediatrics?: () => void;
  onNavigateToWomensHealth?: () => void;
  onNavigateToOrthopedics?: () => void;
  onNavigateToDermatology?: () => void;
  onNavigateToNeurology?: () => void;
  onNavigateToOncology?: () => void;
  onNavigateToEmergency?: () => void;
  onNavigateToENT?: () => void;
  onNavigateToAICore?: () => void;
  onNavigateToOphthalmology?: () => void;
  onNavigateToHematology?: () => void;
  onNavigateToNephrology?: () => void;
  onNavigateToRheumatology?: () => void;
  onNavigateToCriticalCare?: () => void;
  onNavigateToGastroenterology?: () => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToDentistry?: () => void;
  onNavigateToPhysiology?: () => void;
  onNavigateToVideoConsultation?: () => void;
  onNavigateToCareNavigation?: () => void;
}

export default function LandingPage({ onNavigateToDashboard, onNavigateToAdmin, onNavigateToPatient, onNavigateToPharmacy, onNavigateToAyush, onNavigateToMR, onNavigateToMentalHealth, onNavigateToCardiology, onNavigateToPediatrics, onNavigateToWomensHealth, onNavigateToOrthopedics, onNavigateToDermatology, onNavigateToNeurology, onNavigateToOncology, onNavigateToEmergency, onNavigateToENT, onNavigateToAICore, onNavigateToOphthalmology, onNavigateToHematology, onNavigateToNephrology, onNavigateToRheumatology, onNavigateToCriticalCare, onNavigateToGastroenterology, onNavigateToAnalytics, onNavigateToDentistry, onNavigateToPhysiology, onNavigateToVideoConsultation, onNavigateToCareNavigation }: LandingPageProps) {
  // Signup Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [specialtiesDropdownOpen, setSpecialtiesDropdownOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [doctorCount, setDoctorCount] = useState("1");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agree, setAgree] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if there is an MR referral code in the query params
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) {
      setReferralCode(refParam.toUpperCase());
    }
  }, []);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setErrorMsg("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/v1/clinic/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, clinicName, doctorCount, referralCode })
      });

      const result = await response.json();
      if (response.ok) {
        setSignupSuccess({
          subdomain: result.subdomain,
          fullName: fullName,
          clinicName: clinicName
        });
      } else {
        setErrorMsg(result.detail || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please make sure the backend is running.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* NAVIGATION */}
      <nav className="bg-white/90 backdrop-blur-xl fixed w-full z-50 border-b border-slate-200/70 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* BRAND LOGO */}
            <div className="flex items-center gap-6">
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Heart className="h-4.5 w-4.5 text-red-600 fill-red-600 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900 tracking-tight">
                    CURA<span className="text-red-600">.</span>
                  </span>
                  <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 border border-sky-200/70 px-1.5 py-0.5 rounded-md">
                    AI-EHR
                  </span>
                </div>
              </div>

              {/* CORE NAV ANCHOR LINKS */}
              <div className="hidden lg:flex items-center space-x-1 pl-2 border-l border-slate-200">
                <a href="#features" className="text-xs font-semibold text-slate-600 hover:text-sky-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Features</a>
                <a href="#how-it-works" className="text-xs font-semibold text-slate-600 hover:text-sky-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">How It Works</a>
                <a href="#pricing" className="text-xs font-semibold text-slate-600 hover:text-sky-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Pricing</a>
              </div>
            </div>
            
            {/* CENTER MENUS - SPECIALTIES & ECOSYSTEM DROPDOWNS */}
            <div className="hidden md:flex items-center space-x-2">
              {/* 1. CLINICAL SPECIALTIES MEGA-DROPDOWN */}
              <div className="relative" onMouseLeave={() => setSpecialtiesDropdownOpen(false)}>
                <button
                  type="button"
                  onClick={() => {
                    setSpecialtiesDropdownOpen(!specialtiesDropdownOpen);
                    setPortalsDropdownOpen(false);
                  }}
                  onMouseEnter={() => {
                    setSpecialtiesDropdownOpen(true);
                    setPortalsDropdownOpen(false);
                  }}
                  className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border ${
                    specialtiesDropdownOpen 
                      ? "bg-sky-50 text-sky-900 border-sky-300 shadow-xs" 
                      : "bg-slate-50 hover:bg-sky-50/80 text-slate-700 hover:text-sky-800 border-slate-200 hover:border-sky-200"
                  }`}
                >
                  <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
                  <span>Clinical Specialties</span>
                  <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${specialtiesDropdownOpen ? "rotate-180 text-sky-700" : ""}`} />
                </button>

                {/* SPECIALTIES MEGA DROPDOWN MENU */}
                {specialtiesDropdownOpen && (
                  <div 
                    onMouseEnter={() => setSpecialtiesDropdownOpen(true)}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[540px] bg-white border border-slate-200/90 rounded-2xl shadow-xl p-4 z-50 animate-fadeIn space-y-3.5"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">Clinical Systems & Verticals</span>
                        <p className="text-[10px] text-slate-400">Integrated OPD, IPD, and specialized care suites</p>
                      </div>
                      <button
                        onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToDashboard(); }}
                        className="text-[11px] font-bold text-sky-700 hover:text-sky-800 hover:underline flex items-center gap-1 cursor-pointer bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/60"
                      >
                        <span>Main EHR</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Primary 4 Medical Systems */}
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToDashboard(); }} 
                        className="p-2.5 rounded-xl border border-sky-200/80 bg-sky-50/50 hover:bg-sky-100/80 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🏥</span>
                          <div>
                            <div className="text-xs font-bold text-sky-900 group-hover:text-sky-950 flex items-center gap-1">
                              Allopathy Suite
                              <span className="text-[8px] bg-sky-200 text-sky-800 font-extrabold px-1 rounded">CORE</span>
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1">General Medicine, OPD & IPD</div>
                          </div>
                        </div>
                      </button>

                      <button 
                        onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToAyush(); }} 
                        className="p-2.5 rounded-xl border border-purple-200/80 bg-purple-50/50 hover:bg-purple-100/80 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🌿</span>
                          <div>
                            <div className="text-xs font-bold text-purple-900 group-hover:text-purple-950 flex items-center gap-1">
                              AYUSH Suite
                              <span className="text-[8px] bg-purple-200 text-purple-800 font-extrabold px-1 rounded">HOLISTIC</span>
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1">Ayurveda, Yoga, Siddha, Homeo</div>
                          </div>
                        </div>
                      </button>

                      {onNavigateToDentistry && (
                        <button 
                          onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToDentistry(); }} 
                          className="p-2.5 rounded-xl border border-cyan-200/80 bg-cyan-50/50 hover:bg-cyan-100/80 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">🦷</span>
                            <div>
                              <div className="text-xs font-bold text-cyan-900 group-hover:text-cyan-950">Dentistry</div>
                              <div className="text-[10px] text-slate-500 line-clamp-1">Tooth Charting, Perio & Odontogram</div>
                            </div>
                          </div>
                        </button>
                      )}

                      {onNavigateToPhysiology && (
                        <button 
                          onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToPhysiology(); }} 
                          className="p-2.5 rounded-xl border border-teal-200/80 bg-teal-50/50 hover:bg-teal-100/80 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">⚡</span>
                            <div>
                              <div className="text-xs font-bold text-teal-900 group-hover:text-teal-950">Physiology & Rehab</div>
                              <div className="text-[10px] text-slate-500 line-clamp-1">Biomarkers, Vitals & Therapy</div>
                            </div>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Allopathy Sub-Specialties Grid */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                        Allopathy Sub-Specialties
                      </div>
                      <div className="grid grid-cols-3 gap-1 max-h-[220px] overflow-y-auto pr-1">
                        {onNavigateToCardiology && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToCardiology(); }} className="px-2 py-1.5 rounded-lg hover:bg-rose-50 text-slate-700 hover:text-rose-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>❤️ Cardiology</span>
                          </button>
                        )}
                        {onNavigateToPediatrics && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToPediatrics(); }} className="px-2 py-1.5 rounded-lg hover:bg-pink-50 text-slate-700 hover:text-pink-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>👶 Pediatrics</span>
                          </button>
                        )}
                        {onNavigateToWomensHealth && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToWomensHealth(); }} className="px-2 py-1.5 rounded-lg hover:bg-fuchsia-50 text-slate-700 hover:text-fuchsia-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>👩 Women&apos;s Health</span>
                          </button>
                        )}
                        {onNavigateToOrthopedics && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToOrthopedics(); }} className="px-2 py-1.5 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>🦴 Orthopedics</span>
                          </button>
                        )}
                        {onNavigateToDermatology && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToDermatology(); }} className="px-2 py-1.5 rounded-lg hover:bg-amber-50 text-slate-700 hover:text-amber-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>☀️ Dermatology</span>
                          </button>
                        )}
                        {onNavigateToMentalHealth && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToMentalHealth(); }} className="px-2 py-1.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-purple-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>🧠 Psychiatry</span>
                          </button>
                        )}
                        {onNavigateToNeurology && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToNeurology(); }} className="px-2 py-1.5 rounded-lg hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>⚡ Neurology</span>
                          </button>
                        )}
                        {onNavigateToOncology && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToOncology(); }} className="px-2 py-1.5 rounded-lg hover:bg-rose-50 text-slate-700 hover:text-rose-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>🎗️ Oncology</span>
                          </button>
                        )}
                        {onNavigateToEmergency && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToEmergency(); }} className="px-2 py-1.5 rounded-lg hover:bg-red-50 text-slate-700 hover:text-red-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>🚑 Emergency</span>
                          </button>
                        )}
                        {onNavigateToENT && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToENT(); }} className="px-2 py-1.5 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-purple-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>👂 ENT</span>
                          </button>
                        )}
                        {onNavigateToOphthalmology && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToOphthalmology(); }} className="px-2 py-1.5 rounded-lg hover:bg-sky-50 text-slate-700 hover:text-sky-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>👁️ Ophthalmology</span>
                          </button>
                        )}
                        {onNavigateToHematology && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToHematology(); }} className="px-2 py-1.5 rounded-lg hover:bg-red-50 text-slate-700 hover:text-red-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>🩸 Hematology</span>
                          </button>
                        )}
                        {onNavigateToNephrology && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToNephrology(); }} className="px-2 py-1.5 rounded-lg hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>🫘 Nephrology</span>
                          </button>
                        )}
                        {onNavigateToRheumatology && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToRheumatology(); }} className="px-2 py-1.5 rounded-lg hover:bg-pink-50 text-slate-700 hover:text-pink-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>🦴 Rheumatology</span>
                          </button>
                        )}
                        {onNavigateToCriticalCare && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToCriticalCare(); }} className="px-2 py-1.5 rounded-lg hover:bg-red-50 text-slate-700 hover:text-red-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>🏥 Critical Care</span>
                          </button>
                        )}
                        {onNavigateToGastroenterology && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToGastroenterology(); }} className="px-2 py-1.5 rounded-lg hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>🩺 Gastroenterology</span>
                          </button>
                        )}
                        {onNavigateToAnalytics && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToAnalytics(); }} className="px-2 py-1.5 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>📊 Analytics</span>
                          </button>
                        )}
                        {onNavigateToAICore && (
                          <button onClick={() => { setSpecialtiesDropdownOpen(false); onNavigateToAICore(); }} className="px-2 py-1.5 rounded-lg hover:bg-cyan-50 text-slate-700 hover:text-cyan-900 text-left transition-all flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                            <span>🧠 AI Core</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. ECOSYSTEM & PORTALS DROPDOWN */}
              <div className="relative" onMouseLeave={() => setPortalsDropdownOpen(false)}>
                <button
                  type="button"
                  onClick={() => {
                    setPortalsDropdownOpen(!portalsDropdownOpen);
                    setSpecialtiesDropdownOpen(false);
                  }}
                  onMouseEnter={() => {
                    setPortalsDropdownOpen(true);
                    setSpecialtiesDropdownOpen(false);
                  }}
                  className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border ${
                    portalsDropdownOpen 
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs" 
                      : "bg-slate-50 hover:bg-emerald-50/80 text-slate-700 hover:text-emerald-800 border-slate-200 hover:border-emerald-200"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Portals & Apps</span>
                  <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${portalsDropdownOpen ? "rotate-180 text-emerald-700" : ""}`} />
                </button>

                {/* PORTALS DROPDOWN POPUP */}
                {portalsDropdownOpen && (
                  <div 
                    onMouseEnter={() => setPortalsDropdownOpen(true)}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[460px] bg-white border border-slate-200/90 rounded-2xl shadow-xl p-4 z-50 animate-fadeIn space-y-3"
                  >
                    <div className="pb-2 border-b border-slate-100">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">Ecosystem Portals</span>
                      <p className="text-[10px] text-slate-400">Dedicated interfaces for patients, pharmacy, teleconsult & operations</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setPortalsDropdownOpen(false); onNavigateToPatient(); }}
                        className="p-2.5 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-105 transition-transform">
                            <Smartphone className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Patient App</div>
                            <div className="text-[10px] text-slate-500">PHR, Vitals & Self-Booking</div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setPortalsDropdownOpen(false); onNavigateToPharmacy(); }}
                        className="p-2.5 rounded-xl border border-slate-200/80 hover:border-cyan-300 hover:bg-cyan-50/40 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 group-hover:scale-105 transition-transform">
                            <Pill className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-900">Pharmacy Console</div>
                            <div className="text-[10px] text-slate-500">Dispensing & Inventory Hub</div>
                          </div>
                        </div>
                      </button>

                      {onNavigateToCareNavigation && (
                        <button
                          onClick={() => { setPortalsDropdownOpen(false); onNavigateToCareNavigation(); }}
                          className="p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 group-hover:scale-105 transition-transform">
                              <Compass className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">AI Care Navigation</div>
                              <div className="text-[10px] text-slate-500">Doctor Discovery & Triage</div>
                            </div>
                          </div>
                        </button>
                      )}

                      {onNavigateToVideoConsultation && (
                        <button
                          onClick={() => { setPortalsDropdownOpen(false); onNavigateToVideoConsultation(); }}
                          className="p-2.5 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 group-hover:scale-105 transition-transform">
                              <Video className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800 group-hover:text-purple-900">Video Teleconsult</div>
                              <div className="text-[10px] text-slate-500">HD WebRTC Video Consults</div>
                            </div>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={() => { setPortalsDropdownOpen(false); onNavigateToMR(); }}
                        className="p-2.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 group-hover:scale-105 transition-transform">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">MR Partner Portal</div>
                            <div className="text-[10px] text-slate-500">Pharma Reps & Referrals</div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setPortalsDropdownOpen(false); onNavigateToAdmin(); }}
                        className="p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-600 group-hover:scale-105 transition-transform">
                            <Terminal className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-slate-950">Clinic Leads CRM</div>
                            <div className="text-[10px] text-slate-500">Inbound Onboarding Queue</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT ACTION BUTTONS */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={onNavigateToDashboard} 
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-700 bg-white hover:bg-sky-50/60 border border-slate-200/90 hover:border-sky-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-sky-600" />
                <span>Doctor EHR</span>
              </button>

              <a 
                href="#signup" 
                className="gradient-btn-cura text-white px-4.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-sky-500/20 hover:shadow-md hover:shadow-sky-500/30 hover:scale-[1.02] flex items-center gap-1.5"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-3 w-3" />
              </a>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE SLIDE-DOWN DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto animate-fadeIn">
            {/* Quick Links */}
            <div className="flex items-center justify-around py-2 bg-slate-50 rounded-xl border border-slate-200/70 text-xs font-bold text-slate-700">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-sky-600 py-1">Features</a>
              <span className="text-slate-300">•</span>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-sky-600 py-1">How It Works</a>
              <span className="text-slate-300">•</span>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-sky-600 py-1">Pricing</a>
            </div>

            {/* Core Systems */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                Clinical Suites
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateToDashboard(); }}
                  className="p-2 bg-sky-50 border border-sky-200 rounded-xl text-left text-xs font-bold text-sky-900 flex items-center gap-1.5"
                >
                  <span>🏥 Allopathy</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateToAyush(); }}
                  className="p-2 bg-purple-50 border border-purple-200 rounded-xl text-left text-xs font-bold text-purple-900 flex items-center gap-1.5"
                >
                  <span>🌿 AYUSH</span>
                </button>
                {onNavigateToDentistry && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigateToDentistry(); }}
                    className="p-2 bg-cyan-50 border border-cyan-200 rounded-xl text-left text-xs font-bold text-cyan-900 flex items-center gap-1.5"
                  >
                    <span>🦷 Dentistry</span>
                  </button>
                )}
                {onNavigateToPhysiology && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigateToPhysiology(); }}
                    className="p-2 bg-teal-50 border border-teal-200 rounded-xl text-left text-xs font-bold text-teal-900 flex items-center gap-1.5"
                  >
                    <span>⚡ Physiology</span>
                  </button>
                )}
              </div>
            </div>

            {/* Portals */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                Portals & Modules
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateToPatient(); }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center gap-1.5"
                >
                  <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Patient App</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateToPharmacy(); }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center gap-1.5"
                >
                  <Pill className="h-3.5 w-3.5 text-cyan-600" />
                  <span>Pharmacy</span>
                </button>
                {onNavigateToCareNavigation && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigateToCareNavigation(); }}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center gap-1.5"
                  >
                    <Compass className="h-3.5 w-3.5 text-blue-600" />
                    <span>AI Care Nav</span>
                  </button>
                )}
                {onNavigateToVideoConsultation && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigateToVideoConsultation(); }}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center gap-1.5"
                  >
                    <Video className="h-3.5 w-3.5 text-purple-600" />
                    <span>Video Consult</span>
                  </button>
                )}
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateToMR(); }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center gap-1.5"
                >
                  <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                  <span>MR Portal</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigateToAdmin(); }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center gap-1.5"
                >
                  <Terminal className="h-3.5 w-3.5 text-slate-600" />
                  <span>Clinic Leads</span>
                </button>
              </div>
            </div>

            {/* Mobile CTAs */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateToDashboard(); }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4 text-sky-600" />
                <span>Launch Doctor EHR</span>
              </button>
              <a
                href="#signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl gradient-btn-cura text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Start Free 14-Day Trial</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="gradient-bg-cura pt-32 pb-24 px-4 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="300" fill="white" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/10"
              >
                <span className="pulse-dot h-2.5 w-2.5 bg-emerald-400 rounded-full inline-block"></span>
                <span>Trusted by 500+ Smart Clinics across India</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight"
              >
                Care. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
                  Connected.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg sm:text-xl text-sky-100 mt-6 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed"
              >
                CURA helps doctors save 2+ hours daily, manage patient medical histories,
                and send diagnostic summaries instantly via WhatsApp—all from one beautiful AI-powered dashboard.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8 justify-center lg:justify-start"
              >
                <button 
                  onClick={() => setIsTourOpen(true)}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  <Play className="h-5 w-5 fill-slate-950" />
                  🎥 Self-Demo Video Tour
                </button>
                <a 
                  href="#signup" 
                  className="bg-white text-cura-primary-dark hover:bg-slate-50 px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  Start 14-Day Free Trial
                  <ArrowRight className="h-5 w-5 text-cura-primary" />
                </a>
                <button 
                  onClick={onNavigateToDashboard}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-sky-500/10 hover:shadow-sky-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  🏥 Allopathic Doctor Portal
                </button>
                {onNavigateToNeurology && (
                  <button 
                    onClick={onNavigateToNeurology}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    🧠 Neurology Suite
                  </button>
                )}
                {onNavigateToOncology && (
                  <button 
                    onClick={onNavigateToOncology}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-rose-500/10 hover:shadow-rose-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    🧬 Oncology Suite
                  </button>
                )}
                {onNavigateToEmergency && (
                  <button 
                    onClick={onNavigateToEmergency}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-red-500/10 hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    🚑 Emergency & ICU Suite
                  </button>
                )}
                {onNavigateToENT && (
                  <button 
                    onClick={onNavigateToENT}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    👂 ENT & Audiology Suite
                  </button>
                )}
                {onNavigateToOphthalmology && (
                  <button 
                    onClick={onNavigateToOphthalmology}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    👁️ Ophthalmology Suite
                  </button>
                )}
                {onNavigateToHematology && (
                  <button 
                    onClick={onNavigateToHematology}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-red-500/10 hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    🩸 Hematology Suite
                  </button>
                )}
                {onNavigateToNephrology && (
                  <button 
                    onClick={onNavigateToNephrology}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    🧪 Nephrology Suite
                  </button>
                )}
                {onNavigateToRheumatology && (
                  <button 
                    onClick={onNavigateToRheumatology}
                    className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-pink-500/10 hover:shadow-pink-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    🦴 Rheumatology Suite
                  </button>
                )}
                {onNavigateToCriticalCare && (
                  <button 
                    onClick={onNavigateToCriticalCare}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-red-500/10 hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    ⚡ Critical Care (ICU) Suite
                  </button>
                )}
                {onNavigateToGastroenterology && (
                  <button 
                    onClick={onNavigateToGastroenterology}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    🩺 Gastroenterology Suite
                  </button>
                )}
                {onNavigateToAnalytics && (
                  <button 
                    onClick={onNavigateToAnalytics}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    📊 Analytics & Reporting Hub
                  </button>
                )}
                {onNavigateToAICore && (
                  <button 
                    onClick={onNavigateToAICore}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    🧠 Shared AI Clinical Core
                  </button>
                )}
                <button 
                  onClick={onNavigateToPatient}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-full text-lg font-black shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  📱 Patient App
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap gap-6 justify-center lg:justify-start mt-8 text-sky-100/80 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-base">✓</span> No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-base">✓</span> Setup in 60 seconds
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-base">✓</span> WhatsApp integration preloaded
                </span>
              </motion.div>
            </div>

            {/* Right Image / Live Dashboard Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 w-full"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-white/10 shadow-glow-cta">
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl text-slate-800">
                  <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-rose-400 rounded-full"></span>
                      <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                      <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
                      <span className="text-xs font-mono font-bold text-slate-500 ml-2">❤️ Dr. Sharma's Clinic Portal — CURA.OS</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full pulse-dot">
                      Live AI Agent Ready
                    </span>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Patient</span>
                        <p className="font-extrabold text-xl text-slate-800">Rajesh Kumar (45, Male)</p>
                      </div>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Allergy: Penicillin
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Voice Dictation Symptoms</p>
                      <p className="text-sm font-semibold text-slate-700 italic">
                        &ldquo;Patient has acute productive cough, high fever for 3 days, sore throat. Currently taking Amlodipine for hypertension.&rdquo;
                      </p>
                    </div>

                    <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" /> AI Suggestion
                        </span>
                        <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded">
                          Safe & Contraindication-checked
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-800 mb-1">Diagnoses: Acute Viral Pharyngitis</p>
                      <p className="text-xs text-slate-600">Prescribing: Azithromycin 500mg (1-0-0) — Amoxicillin avoided due to Penicillin allergy.</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-medium text-slate-400">Prescription ready for approval</span>
                      <button 
                        onClick={onNavigateToDashboard}
                        className="gradient-btn-cura text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 shadow-md shadow-sky-500/20"
                      >
                        Accept & WhatsApp <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-12 px-4 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-black text-cura-primary">500+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Clinics in India</p>
            </div>
            <div>
              <p className="text-4xl font-black text-cura-primary">2+ Hours</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Saved Daily Per Doctor</p>
            </div>
            <div>
              <p className="text-4xl font-black text-cura-primary">98%</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Patient Satisfaction</p>
            </div>
            <div>
              <p className="text-4xl font-black text-cura-primary">4.9</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">⭐ Trustpilot Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-cura-primary font-bold text-xs uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Powerful Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-cura-primary-dark mt-4 tracking-tight">
              Everything You Need to Run a Smart Clinic
            </h2>
            <p className="text-slate-500 mt-4 text-base font-normal">
              CURA bundles state-of-the-art AI, instant WhatsApp notifications, and comprehensive EHR records into a fast, intuitive clinical workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1">
              <div className="w-12 h-12 bg-sky-100 text-cura-primary rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Voice-Powered AI Assistant</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Dictate patient notes casually. CURA automatically isolates symptoms, diagnoses, recommends diagnostic tests, and drafts prescriptions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-cura-secondary rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">WhatsApp Prescription</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Deliver digital prescriptions securely directly to patients' WhatsApp. Zero paper waste, clean, highly professional, and impossible to lose.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <History className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Unified Patient Timeline</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Fetch a patient's historical records across several consultations in under a second. Spot longitudinal patterns and adjust protocols immediately.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Drug Interaction Checker</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                CURA continuously monitors drugs against patient-reported allergies and existing medications, flashing immediate warnings to avoid severe side effects.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Tele-consultations</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Launch video consultations with a single tap. Ideal for chronic reviews, outstation follow-ups, and convenient specialist guidance.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smart Lab Integrations</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Enable patients to upload lab diagnostics. Our AI reads tables, highlights out-of-bounds metrics, and lists them clearly in the profile timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-cura-primary font-bold text-xs uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Three Steps
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-cura-primary-dark mt-4 tracking-tight">
              Simplified Practice Workflow
            </h2>
            <p className="text-slate-500 mt-4 text-base">
              Say goodbye to messy clinical paperwork. CURA converts manual processes into an intelligent digital pipeline in three simple stages.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-400 to-emerald-400 text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-lg shadow-sky-500/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Select Patient Profile</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xs mx-auto">
                Search the patient's name or code. Instantly view allergies, active prescriptions, and dynamic clinical history timeline.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-400 to-emerald-400 text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-lg shadow-sky-500/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dictate and Assisted Drafting</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xs mx-auto">
                Type symptoms or capture clinical speech. Gemini AI suggests diagnoses, contraindications, tests, and medication rosters.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-400 to-emerald-400 text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-lg shadow-sky-500/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">WhatsApp Broadcast</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xs mx-auto">
                Confirm suggestions. With one click, dispatch a beautiful interactive prescription to the patient's WhatsApp. Safe, efficient, and direct.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-cura-primary font-bold text-xs uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Simple Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-cura-primary-dark mt-4 tracking-tight">
              Honest plans with no lock-ins
            </h2>
            <p className="text-slate-500 mt-4 text-base">
              Try full capabilities free for 14 days. Pay monthly, cancel when you want.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Solo Clinic */}
            <div className="p-8 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Solo Clinic</h3>
                <p className="text-xs text-slate-500 mt-1">Excellent for independent practitioners</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900">₹1,499</span>
                  <span className="text-sm font-semibold text-slate-500"> / month</span>
                </div>
                <hr className="border-slate-100 mb-6" />
                <ul className="space-y-4 text-xs font-semibold text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> 1 Doctor, 2 Staff accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Complete Voice AI assistant
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> WhatsApp prescription broadcast
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Up to 500 patient records
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    ✕ Video consults excluded
                  </li>
                </ul>
              </div>
              <a href="#signup" className="mt-8 block text-center bg-slate-50 border border-slate-200 hover:bg-slate-100 text-cura-primary-dark text-xs font-bold py-3 px-4 rounded-xl transition-all">
                Select Plan
              </a>
            </div>

            {/* Nursing Home */}
            <div className="p-8 rounded-3xl border-2 border-cura-primary bg-white relative shadow-xl shadow-sky-100/50 flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-400 to-emerald-400 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-md shadow-sky-500/20">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Nursing Home</h3>
                <p className="text-xs text-slate-500 mt-1">Perfect for group clinics & centers</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900">₹4,999</span>
                  <span className="text-sm font-semibold text-slate-500"> / month</span>
                </div>
                <hr className="border-slate-100 mb-6" />
                <ul className="space-y-4 text-xs font-semibold text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Up to 10 Doctor logins
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Unlimited patients & prescriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> AI-driven Drug Interaction engine
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Standard tele-consultations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Lab diagnostic importer & timeline
                  </li>
                </ul>
              </div>
              <a href="#signup" className="mt-8 block text-center gradient-btn-cura hover:opacity-95 text-white text-xs font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-sky-500/10">
                Start 14-Day Trial
              </a>
            </div>

            {/* Hospital Suite */}
            <div className="p-8 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Hospital Suite</h3>
                <p className="text-xs text-slate-500 mt-1">Multi-specialty hospital deployment</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900">Custom</span>
                  <span className="text-sm font-semibold text-slate-500"> quote</span>
                </div>
                <hr className="border-slate-100 mb-6" />
                <ul className="space-y-4 text-xs font-semibold text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Unlimited doctors & departments
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Custom integration with IPD/OPD billing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> On-premise or secure cloud servers
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Custom consent forms, templates
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> Dedicated 24/7 support SLA
                  </li>
                </ul>
              </div>
              <a href="mailto:mcshekhar077@gmail.com?subject=CURA Hospital Suite inquiry" className="mt-8 block text-center bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* LEAD CAPTURE / SIGNUP */}
      <section id="signup" className="py-24 px-4 gradient-bg-cura text-slate-800">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden shadow-glow-cta border border-sky-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
            <h2 className="text-3xl font-extrabold text-cura-primary-dark tracking-tight">
              Start Your 14-Day Free Trial
            </h2>
          </div>
          <p className="text-slate-500 text-center max-w-md mx-auto">
            Experience the future of healthcare software. Fully compliant, ultra-secure, and intuitive.
          </p>

          {!signupSuccess ? (
            <form onSubmit={handleSignupSubmit} className="mt-10 space-y-6 max-w-xl mx-auto">
              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> {errorMsg}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Your Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      required 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Rajesh Sharma" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cura-primary/20 focus:border-cura-primary outline-none text-sm transition-all text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dr.sharma@clinic.com" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cura-primary/20 focus:border-cura-primary outline-none text-sm transition-all text-slate-800 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone (with WhatsApp) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cura-primary/20 focus:border-cura-primary outline-none text-sm transition-all text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Clinic / Hospital Name *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      required 
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="Sharma Multispecialty Clinic" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cura-primary/20 focus:border-cura-primary outline-none text-sm transition-all text-slate-800 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Doctor Count</label>
                  <select 
                    value={doctorCount}
                    onChange={(e) => setDoctorCount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cura-primary/20 focus:border-cura-primary outline-none text-sm transition-all text-slate-800 font-semibold bg-white"
                  >
                    <option value="1">1 (Independent Clinic)</option>
                    <option value="2-5">2-5 (Medium Clinic)</option>
                    <option value="6-10">6-10 (Nursing Home)</option>
                    <option value="10+">10+ (Large Hospital)</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Create Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cura-primary/20 focus:border-cura-primary outline-none text-sm transition-all text-slate-800 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative sm:col-span-2">
                  <label className="block text-xs font-bold text-indigo-600 uppercase mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Referral Code (Optional)
                  </label>
                  <div className="relative">
                    <Sparkles className="absolute left-3.5 top-3.5 h-4 w-4 text-indigo-400" />
                    <input 
                      type="text" 
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="e.g., MRAMI1234 (Applies 10% discount for 3 months)" 
                      className="w-full pl-10 pr-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all text-indigo-950 font-bold placeholder-indigo-400/60 uppercase tracking-wide"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2">
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4.5 w-4.5 text-cura-primary border-slate-300 rounded focus:ring-cura-primary"
                />
                <label htmlFor="agree" className="text-xs font-semibold text-slate-500 select-none cursor-pointer">
                  I agree to CURA&apos;s <a href="#" className="text-cura-primary hover:underline">Terms of Service</a>, <a href="#" className="text-cura-primary hover:underline">Privacy Policy</a> and consent to receiving a confirmation message on WhatsApp.
                </label>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 gradient-btn-cura hover:opacity-95 text-white font-extrabold text-base rounded-full shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {submitting ? "⏳ Creating Your Clinic Space..." : "Create 14-Day Free Trial Account"}
              </button>
              
              <p className="text-center text-xs font-bold text-slate-400">🔒 AES-256 Cloud Encryption & HIPAA/DPDP Compliant Data Sovereignty</p>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-10 text-center max-w-xl mx-auto space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 font-black" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                🎉 Congratulations, Dr. {signupSuccess.fullName}!
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Your smart clinic node for <strong className="text-slate-800">{signupSuccess.clinicName}</strong> has been successfully instantiated.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100 space-y-3 font-medium">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-extrabold">Your Instantiated Tenant Space</p>
                <p className="text-sm text-slate-700">📧 Clinical Admin login ID: <span className="text-slate-900 font-bold">{email}</span></p>
                <p className="text-sm text-slate-700">🔗 Allocated secure domain: 
                  <span className="text-cura-primary font-bold ml-1 hover:underline select-all">
                    https://{signupSuccess.subdomain}.cura.in
                  </span>
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold">
                📱 Simulated WhatsApp confirmation dispatched successfully to {phone}!
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={onNavigateToDashboard}
                  className="gradient-btn-cura text-white font-extrabold px-8 py-3.5 rounded-full shadow-lg shadow-sky-500/20 hover:opacity-95"
                >
                  Enter Clinic Portal
                </button>
                <button 
                  onClick={onNavigateToAdmin}
                  className="bg-slate-100 text-slate-700 font-bold px-8 py-3.5 rounded-full hover:bg-slate-200"
                >
                  Inspect leads database
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 border-b border-slate-800 pb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-red-600 fill-red-600" />
              <span className="text-2xl font-black text-white">
                CURA<span className="text-red-600">.</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              The operating system for smarter healthcare clinics, multi-specialty hubs, and digital consultation.
            </p>
            <p className="text-xs text-slate-500 mt-6 font-semibold">
              © 2026 CURA Technologies Private Limited. All rights reserved.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Product Capabilties</h4>
            <ul className="space-y-3 text-xs font-semibold">
              <li><a href="#features" className="hover:text-white transition">Voice-Powered Diagnosis Assistant</a></li>
              <li><a href="#features" className="hover:text-white transition">WhatsApp Prescription Node</a></li>
              <li><a href="#features" className="hover:text-white transition">Electronic Health Records (EHR)</a></li>
              <li><a href="#features" className="hover:text-white transition">Contraindication Checker</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Our Technology</h4>
            <ul className="space-y-3 text-xs font-semibold">
              <li><a href="#" className="hover:text-white transition">HIPAA & GDPR Compliance</a></li>
              <li><a href="#" className="hover:text-white transition">DPDP 2023 India Guardrails</a></li>
              <li><a href="#" className="hover:text-white transition">Google Cloud Run Orchestration</a></li>
              <li><a href="#" className="hover:text-white transition">Gemini Clinical Agent Engine</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4">System Console</h4>
            <div className="space-y-3 font-semibold">
              <button 
                onClick={onNavigateToDashboard} 
                className="w-full text-left text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white px-3.5 py-2 rounded-lg flex items-center justify-between transition-all"
              >
                <span>Live Doctor Console</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button 
                onClick={onNavigateToPharmacy} 
                className="w-full text-left text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white px-3.5 py-2 rounded-lg flex items-center justify-between transition-all"
              >
                <span>Central Pharmacy Portal</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button 
                onClick={onNavigateToAdmin} 
                className="w-full text-left text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white px-3.5 py-2 rounded-lg flex items-center justify-between transition-all"
              >
                <span>Registered Leads Database</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button 
                onClick={onNavigateToMR} 
                className="w-full text-left text-xs bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/60 text-purple-200 px-3.5 py-2 rounded-lg flex items-center justify-between transition-all"
              >
                <span>🤝 MR Referral Program</span>
                <ArrowRight className="h-3 w-3 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-slate-500 gap-4">
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">HIPAA Disclosures</a>
          </div>
          <p>Designed with ❤️ for doctors worldwide.</p>
        </div>
      </footer>

      {/* PRODUCT TOUR MODAL ON LANDING PAGE */}
      <ProductTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateToFeature={() => {
          setIsTourOpen(false);
          onNavigateToDashboard();
        }}
      />
    </div>
  );
}
