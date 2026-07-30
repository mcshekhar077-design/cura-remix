import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
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
  ChevronDown
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
}

export default function LandingPage({ onNavigateToDashboard, onNavigateToAdmin, onNavigateToPatient, onNavigateToPharmacy, onNavigateToAyush, onNavigateToMR, onNavigateToMentalHealth, onNavigateToCardiology, onNavigateToPediatrics, onNavigateToWomensHealth, onNavigateToOrthopedics, onNavigateToDermatology, onNavigateToNeurology, onNavigateToOncology, onNavigateToEmergency, onNavigateToENT, onNavigateToAICore, onNavigateToOphthalmology, onNavigateToHematology, onNavigateToNephrology, onNavigateToRheumatology, onNavigateToCriticalCare, onNavigateToGastroenterology, onNavigateToAnalytics, onNavigateToDentistry, onNavigateToPhysiology }: LandingPageProps) {
  // Signup Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [allopathyDropdownOpen, setAllopathyDropdownOpen] = useState(false);
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
      <nav className="bg-white/90 backdrop-blur-md fixed w-full z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Heart className="h-6 w-6 text-red-600 fill-red-600" />
              <span className="text-2xl font-black text-cura-primary-dark">
                CURA<span className="text-red-600">.</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <a href="#features" className="text-xs font-semibold text-slate-600 hover:text-cura-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-xs font-semibold text-slate-600 hover:text-cura-primary transition-colors">How It Works</a>
              <a href="#pricing" className="text-xs font-semibold text-slate-600 hover:text-cura-primary transition-colors">Pricing</a>

              {/* 1. ALLOPATHY WITH DROPDOWN MENU */}
              <div className="relative" onMouseLeave={() => setAllopathyDropdownOpen(false)}>
                <div className="flex items-center">
                  <button 
                    onClick={onNavigateToDashboard} 
                    className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-100 hover:bg-sky-200 px-3 py-1.5 rounded-l-xl flex items-center gap-1 transition-all border border-sky-300 cursor-pointer shadow-xs"
                  >
                    🏥 Allopathy
                  </button>
                  <button
                    onClick={() => setAllopathyDropdownOpen(!allopathyDropdownOpen)}
                    onMouseEnter={() => setAllopathyDropdownOpen(true)}
                    className="text-xs font-black text-sky-800 bg-sky-200 hover:bg-sky-300 px-1.5 py-1.5 rounded-r-xl border border-l-0 border-sky-300 cursor-pointer transition-all"
                    title="View Allopathy Specialty Modules"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${allopathyDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* ALLOPATHY SPECIALTY DROPDOWN POPUP */}
                {allopathyDropdownOpen && (
                  <div 
                    onMouseEnter={() => setAllopathyDropdownOpen(true)}
                    className="absolute top-full left-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn space-y-2"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 px-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Allopathy Specialty Suites</span>
                      <button
                        onClick={() => { setAllopathyDropdownOpen(false); onNavigateToDashboard(); }}
                        className="text-[10px] font-bold text-sky-700 hover:underline flex items-center gap-0.5"
                      >
                        Main Portal →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1 max-h-[380px] overflow-y-auto pr-1">
                      <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToDashboard(); }} className="p-2 text-left rounded-xl hover:bg-sky-50 text-slate-700 hover:text-sky-900 transition-all flex items-center gap-2 text-xs font-bold">
                        <span>🏥 Main Dashboard</span>
                      </button>
                      {onNavigateToCardiology && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToCardiology(); }} className="p-2 text-left rounded-xl hover:bg-rose-50 text-slate-700 hover:text-rose-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>❤️ Cardiology</span>
                        </button>
                      )}
                      {onNavigateToPediatrics && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToPediatrics(); }} className="p-2 text-left rounded-xl hover:bg-pink-50 text-slate-700 hover:text-pink-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>👶 Pediatrics</span>
                        </button>
                      )}
                      {onNavigateToWomensHealth && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToWomensHealth(); }} className="p-2 text-left rounded-xl hover:bg-fuchsia-50 text-slate-700 hover:text-fuchsia-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>👩 Women&apos;s Health</span>
                        </button>
                      )}
                      {onNavigateToOrthopedics && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToOrthopedics(); }} className="p-2 text-left rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>🦴 Orthopedics</span>
                        </button>
                      )}
                      {onNavigateToDermatology && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToDermatology(); }} className="p-2 text-left rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>☀️ Dermatology</span>
                        </button>
                      )}
                      {onNavigateToMentalHealth && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToMentalHealth(); }} className="p-2 text-left rounded-xl hover:bg-purple-50 text-slate-700 hover:text-purple-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>🧠 Psychiatry</span>
                        </button>
                      )}
                      {onNavigateToNeurology && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToNeurology(); }} className="p-2 text-left rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>⚡ Neurology</span>
                        </button>
                      )}
                      {onNavigateToOncology && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToOncology(); }} className="p-2 text-left rounded-xl hover:bg-rose-50 text-slate-700 hover:text-rose-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>🎗️ Oncology</span>
                        </button>
                      )}
                      {onNavigateToEmergency && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToEmergency(); }} className="p-2 text-left rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>🚑 Emergency</span>
                        </button>
                      )}
                      {onNavigateToENT && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToENT(); }} className="p-2 text-left rounded-xl hover:bg-purple-50 text-slate-700 hover:text-purple-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>👂 ENT</span>
                        </button>
                      )}
                      {onNavigateToOphthalmology && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToOphthalmology(); }} className="p-2 text-left rounded-xl hover:bg-sky-50 text-slate-700 hover:text-sky-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>👁️ Ophthalmology</span>
                        </button>
                      )}
                      {onNavigateToHematology && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToHematology(); }} className="p-2 text-left rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>🩸 Hematology</span>
                        </button>
                      )}
                      {onNavigateToNephrology && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToNephrology(); }} className="p-2 text-left rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>🫘 Nephrology</span>
                        </button>
                      )}
                      {onNavigateToRheumatology && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToRheumatology(); }} className="p-2 text-left rounded-xl hover:bg-pink-50 text-slate-700 hover:text-pink-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>🦴 Rheumatology</span>
                        </button>
                      )}
                      {onNavigateToCriticalCare && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToCriticalCare(); }} className="p-2 text-left rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>🏥 Critical Care</span>
                        </button>
                      )}
                      {onNavigateToGastroenterology && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToGastroenterology(); }} className="p-2 text-left rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>🩺 Gastroenterology</span>
                        </button>
                      )}
                      {onNavigateToAnalytics && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToAnalytics(); }} className="p-2 text-left rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>📊 Analytics</span>
                        </button>
                      )}
                      {onNavigateToAICore && (
                        <button onClick={() => { setAllopathyDropdownOpen(false); onNavigateToAICore(); }} className="p-2 text-left rounded-xl hover:bg-cyan-50 text-slate-700 hover:text-cyan-900 transition-all flex items-center gap-2 text-xs font-bold">
                          <span>🧠 AI Core</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. AYUSH */}
              <button 
                onClick={onNavigateToAyush} 
                className="text-xs font-black uppercase tracking-wider text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border border-purple-200 cursor-pointer shadow-xs"
              >
                🌿 AYUSH
              </button>

              {/* 3. DENTISTRY */}
              {onNavigateToDentistry && (
                <button 
                  onClick={onNavigateToDentistry} 
                  className="text-xs font-black uppercase tracking-wider text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border border-cyan-200 cursor-pointer shadow-xs"
                >
                  🦷 Dentistry
                </button>
              )}

              {/* 4. PHYSIOLOGY */}
              {onNavigateToPhysiology && (
                <button 
                  onClick={onNavigateToPhysiology} 
                  className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all border border-teal-200 cursor-pointer shadow-xs"
                >
                  ⚡ Physiology
                </button>
              )}

              {/* SECONDARY PORTAL LINK BUTTONS */}
              <button 
                onClick={onNavigateToPatient} 
                className="text-[11px] font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded flex items-center gap-1 transition-all border border-emerald-200 cursor-pointer"
                title="Patient Mobile App"
              >
                📱 Patient
              </button>
              <button 
                onClick={onNavigateToPharmacy} 
                className="text-[11px] font-mono text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-2 py-1 rounded flex items-center gap-1 transition-all border border-cyan-200 cursor-pointer"
                title="Pharmacy Dashboard"
              >
                💊 Pharmacy
              </button>
              <button 
                onClick={onNavigateToMR} 
                className="text-[11px] font-mono text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded flex items-center gap-1 transition-all border border-indigo-200 cursor-pointer"
                title="MR Partner Referral Portal"
              >
                🤝 MR
              </button>
              <button 
                onClick={onNavigateToAdmin} 
                className="text-[10px] font-mono text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded flex items-center gap-1 transition-all cursor-pointer"
                title="Clinic Leads"
              >
                <Terminal className="h-3 w-3" /> Leads
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={onNavigateToDashboard} 
                className="hidden sm:inline-flex text-sm font-semibold text-cura-primary-dark hover:text-cura-primary transition-colors px-4 py-2"
              >
                Launch Demo Portal
              </button>
              <a 
                href="#signup" 
                className="gradient-btn-cura text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md shadow-sky-500/10 hover:shadow-lg hover:shadow-sky-500/20 hover:scale-[1.02]"
              >
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
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
                  I agree to CURA&apos;s <a href="#" className="text-cura-primary hover:underline">Terms of Service</a>, <a href="#" className="text-cura-primary hover:underline">Privacy Policy</a> and consent to receiving a mock confirmation message on WhatsApp.
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
