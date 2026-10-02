import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  ArrowRight, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Activity, 
  Video, 
  FileText, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Play, 
  ChevronRight, 
  Stethoscope, 
  Layers, 
  LayoutDashboard, 
  ShieldCheck, 
  Brain, 
  LogOut, 
  UserCheck, 
  Network, 
  Smartphone, 
  Pill, 
  Compass, 
  Menu, 
  X, 
  Calendar, 
  Building2, 
  Users, 
  Clock, 
  Mic, 
  Database, 
  FileCheck, 
  Share2, 
  Eye, 
  Microscope, 
  HeartPulse, 
  Smile, 
  Zap, 
  Scale, 
  AlertCircle,
  Palette
} from "lucide-react";
import ProductTour from "./ProductTour";
import { useAuth } from "../context/AuthContext";
import ClinitialAuthModal from "./ClinitialAuthModal";
import { useTheme } from "./ThemeSelector";

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
  onNavigateToBlueprint?: () => void;
}

export default function LandingPage({ 
  onNavigateToDashboard, 
  onNavigateToAdmin, 
  onNavigateToPatient, 
  onNavigateToPharmacy, 
  onNavigateToAyush, 
  onNavigateToMR, 
  onNavigateToMentalHealth, 
  onNavigateToCardiology, 
  onNavigateToPediatrics, 
  onNavigateToWomensHealth, 
  onNavigateToOrthopedics, 
  onNavigateToDermatology, 
  onNavigateToNeurology, 
  onNavigateToOncology, 
  onNavigateToEmergency, 
  onNavigateToENT, 
  onNavigateToAICore, 
  onNavigateToOphthalmology, 
  onNavigateToHematology, 
  onNavigateToNephrology, 
  onNavigateToRheumatology, 
  onNavigateToCriticalCare, 
  onNavigateToGastroenterology, 
  onNavigateToAnalytics, 
  onNavigateToDentistry, 
  onNavigateToPhysiology, 
  onNavigateToVideoConsultation, 
  onNavigateToCareNavigation,
  onNavigateToBlueprint
}: LandingPageProps) {
  const { currentUser, isAuthenticated, logout, signup } = useAuth();
  const { openPalette, currentTheme, customPrimary } = useTheme();

  // Navigation & Authentication Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [intendedModuleTitle, setIntendedModuleTitle] = useState<string | null>(null);
  const [pendingNavigationAction, setPendingNavigationAction] = useState<(() => void) | null>(null);

  // Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    role: "Doctor / Medical Director",
    notes: ""
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // Free Trial Signup Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [doctorCount, setDoctorCount] = useState("1");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // UI Navigation & Interactive State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [activeDoctorTab, setActiveDoctorTab] = useState<"docs" | "timeline" | "prescribe">("docs");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) {
      setReferralCode(refParam.toUpperCase());
    }
  }, []);

  const isUserAdmin = Boolean(
    currentUser && (
      currentUser.role === "admin" ||
      (currentUser as any).role === "super_admin" ||
      (currentUser as any).role === "hospital_admin"
    )
  );

  const triggerGuardedNavigation = (navFn: (() => void) | undefined, moduleTitle: string) => {
    if (!navFn) return;
    
    // Strict RBAC boundary check for Admin OS
    if (navFn === onNavigateToAdmin) {
      if (isAuthenticated && isUserAdmin) {
        onNavigateToAdmin();
        return;
      }
      setIntendedModuleTitle("Clinitial Admin OS & Governance Console (Restricted)");
      setPendingNavigationAction(() => onNavigateToAdmin);
      setAuthModalOpen(true);
      return;
    }

    if (isAuthenticated) {
      navFn();
    } else {
      setIntendedModuleTitle(moduleTitle);
      setPendingNavigationAction(() => navFn);
      setAuthModalOpen(true);
    }
  };

  const handleAuthModalSuccess = () => {
    if (pendingNavigationAction) {
      const action = pendingNavigationAction;
      setPendingNavigationAction(null);
      action();
      return;
    }
    // Smart routing based on authenticated identity role
    if (isUserAdmin) {
      onNavigateToAdmin();
    } else if (currentUser?.role === "patient") {
      onNavigateToPatient();
    } else if (currentUser?.role === "pharmacist") {
      onNavigateToPharmacy();
    } else {
      onNavigateToDashboard();
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setErrorMsg("Please accept the Terms of Service and Privacy Notice.");
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
          fullName,
          clinicName
        });
        
        await signup({
          fullName,
          email,
          phone,
          role: "doctor",
          clinicName,
          doctorCount,
          password: password || "trial123"
        });
      } else {
        setErrorMsg(result.detail || "Unable to complete trial creation. Please check your details.");
      }
    } catch {
      setErrorMsg("Network error. Please ensure your connection is active and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
  };

  // Specialty items configuration for clean grid presentation
  const specialties = [
    {
      id: "cardiology",
      name: "Cardiology",
      icon: HeartPulse,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      description: "ECG interpretation assistance, cardiac risk scoring, and echocardiogram workflows.",
      action: onNavigateToCardiology
    },
    {
      id: "neurology",
      name: "Neurology",
      icon: Brain,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      description: "Stroke triage, seizure logs, cognitive evaluations, and neuromuscular protocols.",
      action: onNavigateToNeurology
    },
    {
      id: "oncology",
      name: "Oncology",
      icon: Activity,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description: "Chemotherapy regimen staging, tumor board reviews, and longitudinal lab tracking.",
      action: onNavigateToOncology
    },
    {
      id: "pediatrics",
      name: "Pediatrics",
      icon: Users,
      color: "text-sky-600 bg-sky-50 border-sky-200",
      description: "Growth chart percentile curves, immunization tracking, and pediatric dosage safety.",
      action: onNavigateToPediatrics
    },
    {
      id: "dermatology",
      name: "Dermatology",
      icon: Sparkles,
      color: "text-orange-600 bg-orange-50 border-orange-200",
      description: "Dermatoscopic lesion categorization, skin symptom imaging, and topical care plans.",
      action: onNavigateToDermatology
    },
    {
      id: "ophthalmology",
      name: "Ophthalmology",
      icon: Eye,
      color: "text-teal-600 bg-teal-50 border-teal-200",
      description: "Visual acuity tracking, fundus scan notes, refraction tables, and IOP monitoring.",
      action: onNavigateToOphthalmology
    },
    {
      id: "ent",
      name: "ENT",
      icon: Mic,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      description: "Audiometry graphs, endonasal endoscopy notes, and airway assessment records.",
      action: onNavigateToENT
    },
    {
      id: "orthopedics",
      name: "Orthopedics",
      icon: ShieldCheck,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "Joint range of motion, post-op physiotherapy tracking, and implant registries.",
      action: onNavigateToOrthopedics
    },
    {
      id: "nephrology",
      name: "Nephrology",
      icon: Layers,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
      description: "eGFR progression trends, dialysis schedule planning, and electrolyte balance alerts.",
      action: onNavigateToNephrology
    },
    {
      id: "gastroenterology",
      name: "Gastroenterology",
      icon: Stethoscope,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      description: "Endoscopy reports, liver function tracking, and dietary management pipelines.",
      action: onNavigateToGastroenterology
    },
    {
      id: "hematology",
      name: "Hematology",
      icon: Activity,
      color: "text-red-600 bg-red-50 border-red-200",
      description: "CBC differential panels, coagulation logs, and transfusion order tracking.",
      action: onNavigateToHematology
    },
    {
      id: "rheumatology",
      name: "Rheumatology",
      icon: Heart,
      color: "text-pink-600 bg-pink-50 border-pink-200",
      description: "DAS28 score monitoring, biologic therapy management, and autoimmune profiles.",
      action: onNavigateToRheumatology
    },
    {
      id: "critical_care",
      name: "Critical Care",
      icon: Zap,
      color: "text-rose-700 bg-rose-50 border-rose-200",
      description: "Continuous ICU vital telemetry, ventilator metrics, and emergency code alerts.",
      action: onNavigateToCriticalCare
    },
    {
      id: "womens_health",
      name: "Women's Health",
      icon: Users,
      color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200",
      description: "Antenatal trimesters, ultrasound metrics, gestational logs, and pelvic health.",
      action: onNavigateToWomensHealth
    },
    {
      id: "dentistry",
      name: "Dentistry",
      icon: Smile,
      color: "text-cyan-700 bg-cyan-50 border-cyan-200",
      description: "Interactive tooth charting, periodontal indexing, and procedural cost estimates.",
      action: onNavigateToDentistry
    },
    {
      id: "ayush",
      name: "Clinitial AYUSH — Integrated Traditional Medicine",
      icon: Sparkles,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      description: "Clinical AYUSH EHR, AI CDSS (Prakriti, Mizaj, Mukkuttram), Herb-Allopathic interaction engine, and longitudinal care journeys.",
      action: onNavigateToAyush
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* GLOBAL AUTHENTICATION MODAL */}
      <ClinitialAuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingNavigationAction(null);
        }}
        intendedModuleTitle={intendedModuleTitle}
        onSuccess={handleAuthModalSuccess}
      />

      {/* BOOK A DEMO MODAL */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl text-slate-100 relative"
            >
              <button 
                onClick={() => { setIsDemoModalOpen(false); setDemoSubmitted(false); }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>

              {!demoSubmitted ? (
                <>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Personalized Walkthrough</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Book a Demo with Clinical Specialists</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
                    Discover how Clinitial unified clinical intelligence connects doctors, patients, and hospital systems.
                  </p>

                  <form onSubmit={handleDemoSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={demoForm.name}
                        onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                        placeholder="Dr. Anand Varma"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                        <input 
                          type="email" 
                          required
                          value={demoForm.email}
                          onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                          placeholder="anand@hospital.org"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          value={demoForm.phone}
                          onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Hospital / Clinic / Organization</label>
                      <input 
                        type="text" 
                        required
                        value={demoForm.organization}
                        onChange={(e) => setDemoForm({ ...demoForm, organization: e.target.value })}
                        placeholder="Apex Multispecialty Hospital"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Primary Role</label>
                      <select
                        value={demoForm.role}
                        onChange={(e) => setDemoForm({ ...demoForm, role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option>Doctor / Independent Practitioner</option>
                        <option>Hospital Medical Director / CMO</option>
                        <option>Healthcare Operations / IT Head</option>
                        <option>Clinical Research / Academic</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition text-sm shadow-md shadow-cyan-500/20"
                    >
                      Schedule Demo
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Demonstration Requested</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    Thank you, {demoForm.name}. A clinical solutions specialist will reach out to <strong className="text-slate-200">{demoForm.email}</strong> within 24 business hours.
                  </p>
                  <button 
                    onClick={() => { setIsDemoModalOpen(false); setDemoSubmitted(false); }}
                    className="mt-6 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOP NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <a href="#" className="flex items-center gap-2.5 group">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 transition-transform group-hover:scale-105">
                  <Heart className="h-4.5 w-4.5 fill-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold tracking-tight text-white">Clinitial</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                      OS
                    </span>
                  </div>
                  <p className="hidden sm:block text-[9px] text-slate-400 tracking-tight leading-none">
                    AI Healthcare Operating System
                  </p>
                </div>
              </a>

              {/* Clean Marketing Nav Links */}
              <div className="hidden lg:flex items-center space-x-1 pl-4 border-l border-slate-800">
                <a href="#solutions" className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition">Solutions</a>
                <a href="#ai-core" className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition">AI Core</a>
                <a href="#for-doctors" className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition">For Doctors</a>
                <a href="#for-patients" className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition">For Patients</a>
                <a href="#for-hospitals" className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition">For Hospitals</a>
                <a href="#specialties" className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition">Specialties</a>
                <a href="#pricing" className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition">Pricing</a>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Palette / Theme Quick Access */}
              <button 
                onClick={openPalette}
                id="landing-palette-toggle-btn"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl transition cursor-pointer shadow-xs"
                title="Change Platform Color Palette & Theme"
              >
                <Palette className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Palette</span>
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow-xs"
                  style={{ backgroundColor: customPrimary || currentTheme.primaryColor }}
                />
              </button>

              <button 
                onClick={() => setIsDemoModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl transition"
              >
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                <span>Book Demo</span>
              </button>

              {isAuthenticated && currentUser ? (
                <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl p-1 pl-3">
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white truncate max-w-[120px]">{currentUser.fullName}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${
                      isUserAdmin ? "text-purple-400" : "text-cyan-400"
                    }`}>
                      {isUserAdmin ? "Admin OS" : currentUser.role}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (isUserAdmin) {
                        onNavigateToAdmin();
                      } else if (currentUser.role === "patient") {
                        onNavigateToPatient();
                      } else if (currentUser.role === "pharmacist") {
                        onNavigateToPharmacy();
                      } else {
                        triggerGuardedNavigation(onNavigateToDashboard, "Doctor Clinical Workspace");
                      }
                    }}
                    className={`px-2.5 py-1.5 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                      isUserAdmin 
                        ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30" 
                        : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30"
                    }`}
                  >
                    {isUserAdmin ? "Admin OS" : "Open Console"}
                  </button>
                  <button 
                    onClick={logout} 
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setIntendedModuleTitle("Clinitial Healthcare OS");
                      setPendingNavigationAction(null);
                      setAuthModalOpen(true);
                    }}
                    className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition cursor-pointer"
                  >
                    Sign In
                  </button>
                  <a 
                    href="#signup"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-4 py-2 rounded-xl shadow-md shadow-cyan-500/20 transition hover:scale-[1.01]"
                  >
                    <span>Start Free</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </>
              )}

              {/* Mobile toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-2">
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-slate-300 hover:text-white py-1.5">Solutions</a>
            <a href="#ai-core" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-slate-300 hover:text-white py-1.5">AI Core</a>
            <a href="#for-doctors" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-slate-300 hover:text-white py-1.5">For Doctors</a>
            <a href="#for-patients" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-slate-300 hover:text-white py-1.5">For Patients</a>
            <a href="#for-hospitals" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-slate-300 hover:text-white py-1.5">For Hospitals</a>
            <a href="#specialties" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-slate-300 hover:text-white py-1.5">Clinical Specialties</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-slate-300 hover:text-white py-1.5">Pricing</a>
            <div className="pt-2 flex flex-col gap-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); setIsDemoModalOpen(true); }}
                className="w-full py-2.5 text-center text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition"
              >
                Book a Demo
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-cyan-300 mb-6"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Healthcare Operating System</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight"
          >
            Healthcare, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
              intelligently connected.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            One intelligent platform connecting doctors, patients, hospitals, and AI — from consultation to continuous care.
          </motion.p>

          {/* Clean 2-CTA Action Set */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <a 
              href="#signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
            >
              <span>Start Free</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-sm font-semibold transition"
            >
              <Calendar className="h-4 w-4 text-cyan-400" />
              <span>Book a Demo</span>
            </button>
            <button 
              onClick={() => setIsTourOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-sm font-medium transition"
            >
              <Play className="h-3.5 w-3.5 text-slate-400" />
              <span>Watch Overview</span>
            </button>
          </motion.div>

          {/* HERO VISUAL: CURA AI CLINICAL WORKSPACE & PATIENT TIMELINE PREVIEW */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-14 max-w-5xl mx-auto rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-2 sm:p-4 text-left overflow-hidden"
          >
            {/* Window header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-slate-400 ml-2 text-[11px]">clinitial.clinical.os / consultation-view</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AI Clinical Copilot Active</span>
              </div>
            </div>

            {/* Mock clinical interface grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-3 sm:p-4 text-xs">
              {/* Patient timeline sidebar */}
              <div className="md:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-sm">Rajesh Kumar</h4>
                    <span className="text-[11px] text-slate-400">45 Y • M • ABHA 91-8273-1092</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                    Penicillin Allergy
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Longitudinal History</div>
                  <div className="text-[11px] text-slate-300 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-cyan-400 font-semibold">12 days ago:</span> Reported persistent productive cough and nocturnal fever.
                  </div>
                  <div className="text-[11px] text-slate-300 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-slate-400 font-semibold">1 month ago:</span> Normal HbA1c (5.8%), Blood Pressure 124/82 mmHg.
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Vitals</div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/60">
                      <div className="text-slate-400 text-[10px]">Heart Rate</div>
                      <div className="text-sm font-bold text-white">76 bpm</div>
                    </div>
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/60">
                      <div className="text-slate-400 text-[10px]">SpO2</div>
                      <div className="text-sm font-bold text-emerald-400">98%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central consultation and AI assistant */}
              <div className="md:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-cyan-400" />
                    <span className="font-semibold text-slate-200">Voice Clinical Capture</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Continuous Ambient Mode</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300 italic text-[11px] leading-relaxed">
                  &ldquo;Patient notes localized throat soreness over 3 days, body aches, no dyspnea. Currently on Amlodipine 5mg for mild hypertension.&rdquo;
                </div>

                {/* AI clinical decision support note */}
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Assistive CDSS Suggestion</span>
                    </div>
                    <span className="text-[10px] bg-cyan-900/50 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-700/50">
                      Differential Match
                    </span>
                  </div>
                  <p className="text-slate-300">
                    Suspected: <strong className="text-white">Acute Viral Pharyngitis</strong>. Cross-referenced contraindications: Amoxicillin safely suppressed due to declared Penicillin hypersensitivity.
                  </p>
                </div>

                {/* Simulated action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">Prescription auto-structured for clinician validation</span>
                  <button 
                    onClick={() => triggerGuardedNavigation(onNavigateToDashboard, "Doctor Clinical Workspace")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-xs transition"
                  >
                    <span>Launch Live Workspace</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST / POSITIONING PILLARS */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-slate-800/80 bg-slate-950/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Positioning</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">One platform. Every layer of care.</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <Stethoscope className="h-5 w-5 text-cyan-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">Doctor Care</div>
              <p className="text-[11px] text-slate-400 mt-1">Intelligent OPD & documentation</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <Smartphone className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">Patient Care</div>
              <p className="text-[11px] text-slate-400 mt-1">Health timeline & navigation</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <Building2 className="h-5 w-5 text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">Hospital Operations</div>
              <p className="text-[11px] text-slate-400 mt-1">Pharmacy, labs & departments</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <Brain className="h-5 w-5 text-purple-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">AI Intelligence</div>
              <p className="text-[11px] text-slate-400 mt-1">Clinical decision support layer</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 col-span-2 md:col-span-1">
              <Share2 className="h-5 w-5 text-amber-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">Digital Health</div>
              <p className="text-[11px] text-slate-400 mt-1">Standards-ready interoperability</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">The Problem</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Healthcare is fragmented.</h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              When clinical information is trapped across isolated islands, patient outcomes suffer and physicians burn out.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">Point A</div>
              <div className="text-sm font-semibold text-white">Patient records here</div>
              <p className="text-xs text-slate-400 mt-1">Locked in legacy desktop software.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">Point B</div>
              <div className="text-sm font-semibold text-white">Reports there</div>
              <p className="text-xs text-slate-400 mt-1">Printed lab papers and email attachments.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">Point C</div>
              <div className="text-sm font-semibold text-white">WhatsApp chats</div>
              <p className="text-xs text-slate-400 mt-1">Informal prescription exchanges lost over time.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">Point D</div>
              <div className="text-sm font-semibold text-white">Doctor burnout</div>
              <p className="text-xs text-slate-400 mt-1">Switching between multiple disparate interfaces.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 sm:col-span-2 lg:col-span-1">
              <div className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">Point E</div>
              <div className="text-sm font-semibold text-white">Repeating history</div>
              <p className="text-xs text-slate-400 mt-1">Patients recounting previous conditions endlessly.</p>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-800/40 text-center">
            <p className="text-sm font-semibold text-cyan-300">
              Clinitial brings every thread into one unified, intelligent continuum.
            </p>
          </div>
        </div>
      </section>

      {/* CLINITIAL PLATFORM ARCHITECTURE SECTION */}
      <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/80 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Clinitial Platform</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">One healthcare operating system</h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Architected to connect clinical intelligence, patient engagement, and operational scale.
            </p>
          </div>

          {/* Clean architectural tree diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Top Node */}
            <div className="max-w-xs mx-auto p-3.5 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/50 text-center shadow-lg shadow-cyan-950/50">
              <div className="flex items-center justify-center gap-1.5 text-cyan-300 font-bold text-sm">
                <Brain className="h-4 w-4 text-cyan-400" />
                <span>CLINITIAL AI CORE</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Central intelligence & decision support engine</p>
            </div>

            {/* Connecting lines */}
            <div className="hidden sm:flex justify-center items-center">
              <div className="w-2/3 h-px bg-slate-800 relative">
                <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-cyan-400" />
                <div className="absolute left-1/2 -top-1 w-2 h-2 rounded-full bg-blue-400 -translate-x-1/2" />
                <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Three Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pillar 1: Clinical Intelligence */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 pb-2 border-b border-slate-800 mb-3 flex items-center justify-between">
                  <span>Clinical Intelligence</span>
                  <Stethoscope className="h-3.5 w-3.5" />
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Smart Electronic Health Records
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Ambient AI Voice Assistant
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> 16+ Specialty AI Suites
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Multimodal Diagnostic Analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Medication Contraindication Engine
                  </li>
                </ul>
              </div>

              {/* Pillar 2: Patient Experience */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 pb-2 border-b border-slate-800 mb-3 flex items-center justify-between">
                  <span>Patient Experience</span>
                  <Smartphone className="h-3.5 w-3.5" />
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-blue-400" /> Longitudinal Health Memory
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-blue-400" /> Conversational AI Health Coach
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-blue-400" /> WebRTC Telemedicine
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-blue-400" /> Digital Records & Lab Vault
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-blue-400" /> Intelligent Care Navigation
                  </li>
                </ul>
              </div>

              {/* Pillar 3: Hospital Operations */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-slate-800 mb-3 flex items-center justify-between">
                  <span>Hospital Operations</span>
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Integrated HIS / IMS
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Pharmacy Dispensing Hub
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Laboratory & Diagnostics Routing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Emergency & ICU Telemetry
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Multi-location Analytics
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI CORE SECTION */}
      <section id="ai-core" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Intelligence Engine</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">The intelligence layer behind Clinitial.</h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Clinical decision support grounded in medical reasoning, voice intelligence, and patient context.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <Sparkles className="h-5 w-5 text-cyan-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">AI Clinical Assistant</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Assists doctors with note structuring, differential suggestions, and coding.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <Mic className="h-5 w-5 text-blue-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">Voice AI</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ambient conversational transcription tailored for multi-lingual clinical terms.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <FileText className="h-5 w-5 text-purple-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">Document Intelligence</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Extracts key bio-markers, diagnostic flags, and historical labs from PDF uploads.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <Database className="h-5 w-5 text-emerald-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">Patient Health Memory</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Continuous longitudinal memory providing context across years of visits.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <Scale className="h-5 w-5 text-amber-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">Clinical Decision Support</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Evidence-informed guidelines and red-flag alerts during active consultations.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <Compass className="h-5 w-5 text-teal-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">Care Navigation</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Directs patients to the appropriate specialty or triage level based on symptoms.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <Pill className="h-5 w-5 text-rose-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">Medication Intelligence</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Cross-checks allergy clashes, duplicate therapies, and food-drug interactions.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
              <Activity className="h-5 w-5 text-indigo-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">AI Clinical Analytics</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Cohort trending, chronic disease registries, and departmental operational KPIs.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => triggerGuardedNavigation(onNavigateToAICore, "Clinitial AI Clinical Core")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition"
            >
              <span>Explore Clinitial AI Core</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* FOR DOCTORS SECTION */}
      <section id="for-doctors" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/80 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left description */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">For Doctors</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 leading-tight">
                  Spend less time managing information. <br />
                  <span className="text-slate-400 font-semibold">More time caring for patients.</span>
                </h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Clinitial re-engineers the documentation burden into ambient assistance, keeping your eyes on the patient rather than the screen.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> AI-assisted documentation
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Voice clinical workflows
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Patient timeline
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Medical records
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Prescription assistance
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Specialty workflows
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Diagnostics reviews
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Telemedicine integration
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => triggerGuardedNavigation(onNavigateToDashboard, "Doctor Clinical Console")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition"
                >
                  <span>Experience Doctor Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right Interactive Dashboard View */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveDoctorTab("docs")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${activeDoctorTab === "docs" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"}`}
                  >
                    Clinical Documentation
                  </button>
                  <button 
                    onClick={() => setActiveDoctorTab("timeline")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${activeDoctorTab === "timeline" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"}`}
                  >
                    Patient Timeline
                  </button>
                  <button 
                    onClick={() => setActiveDoctorTab("prescribe")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${activeDoctorTab === "prescribe" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"}`}
                  >
                    Rx & Delivery
                  </button>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 font-mono">
                  LIVE EHR PREVIEW
                </span>
              </div>

              {activeDoctorTab === "docs" && (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Chief Complaint</div>
                    <p className="text-slate-200">Patient presenting with 4-day history of recurrent epistaxis and mild nasal congestion.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-cyan-400 mb-1">CDSS Assisted Observations</div>
                    <p className="text-slate-300">Anterior rhinosocopy reveals prominent Kiesselbach plexus congestion. Blood pressure elevated (142/88 mmHg). Recommend gentle topical hydration and BP monitoring.</p>
                  </div>
                </div>
              )}

              {activeDoctorTab === "timeline" && (
                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Aug 18, 2026 • General Medicine</div>
                      <div className="text-[11px] text-slate-400">Viral upper respiratory infection. Resolved without antibiotics.</div>
                    </div>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-1 rounded">Dr. Sharma</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">May 02, 2026 • Cardiology Consult</div>
                      <div className="text-[11px] text-slate-400">Baseline ECG normal sinus rhythm. Commenced lifestyle management.</div>
                    </div>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-1 rounded">Dr. Reddy</span>
                  </div>
                </div>
              )}

              {activeDoctorTab === "prescribe" && (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Saline Nasal Spray (0.9%)</span>
                      <span className="text-[11px] text-slate-400">2 puffs BID • 7 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Vitamin C 500mg</span>
                      <span className="text-[11px] text-slate-400">1 tablet OD • 10 days</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2">
                    <Check className="h-4 w-4" /> Ready for instant WhatsApp dispatch with verified digital signature.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOR PATIENTS SECTION */}
      <section id="for-patients" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Mock Mobile View */}
            <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl bg-slate-950 border-4 border-slate-800 p-4 shadow-2xl text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      RK
                    </div>
                    <div>
                      <div className="font-bold text-white">Health Companion</div>
                      <div className="text-[10px] text-slate-400">ABHA 91-8273-1092</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">Synced</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Next Appointment</div>
                  <div className="font-bold text-white text-sm">Tomorrow at 10:30 AM</div>
                  <p className="text-[11px] text-slate-400">Follow-up with Dr. Sharma • Cardiology OPD</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Medication Reminders</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-200">
                    <span>Amlodipine 5mg</span>
                    <span className="text-emerald-400 font-mono">08:00 AM ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-200">
                    <span>Atorvastatin 10mg</span>
                    <span className="text-amber-400 font-mono">09:00 PM Due</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/50 to-cyan-950/50 border border-cyan-800/40 text-[11px] text-cyan-200">
                  💬 Have a question about your medication? Ask Clinitial AI Health Coach in Hindi, English, or 8 regional languages.
                </div>
              </div>
            </div>

            {/* Right text */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">For Patients</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 leading-tight">
                  Your health. <br />
                  <span className="text-slate-400 font-semibold">One intelligent companion.</span>
                </h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Empowering individuals with transparent health histories, direct doctor messaging, and smart medication reminders.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Longitudinal health timeline
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Digital reports & prescriptions
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> AI health companion
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Multilingual voice queries
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Medication intelligence
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> One-tap appointment booking
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Telemedicine consults
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Care navigation guidance
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => triggerGuardedNavigation(onNavigateToPatient, "Patient Health Companion")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
                >
                  <span>Explore Patient App</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR HOSPITALS SECTION */}
      <section id="for-hospitals" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/80 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">For Hospitals</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Connect clinical care with hospital operations.</h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Eliminate information bottlenecks between outpatient clinics, inpatient beds, pharmacy dispensaries, and diagnostic labs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <Building2 className="h-5 w-5 text-blue-400 mb-2" />
              <h4 className="text-xs font-bold text-white">HIS / IMS</h4>
              <p className="text-[11px] text-slate-400 mt-1">Bed allocation, admissions, and discharge summaries.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <Pill className="h-5 w-5 text-cyan-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Pharmacy</h4>
              <p className="text-[11px] text-slate-400 mt-1">Real-time inventory, batch tracking, and dispensing.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <Microscope className="h-5 w-5 text-purple-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Laboratory</h4>
              <p className="text-[11px] text-slate-400 mt-1">Direct equipment integration and automated reporting.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <Eye className="h-5 w-5 text-amber-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Radiology</h4>
              <p className="text-[11px] text-slate-400 mt-1">DICOM imaging integration and radiologist sign-off.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <HeartPulse className="h-5 w-5 text-emerald-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Nursing Stations</h4>
              <p className="text-[11px] text-slate-400 mt-1">Medication rounds, vitals charting, and shift handovers.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <Zap className="h-5 w-5 text-rose-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Emergency</h4>
              <p className="text-[11px] text-slate-400 mt-1">Rapid triage protocols and red-flag escalation.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <Activity className="h-5 w-5 text-red-500 mb-2" />
              <h4 className="text-xs font-bold text-white">Blood Bank</h4>
              <p className="text-[11px] text-slate-400 mt-1">Cross-match tracking and donor registry.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <FileCheck className="h-5 w-5 text-teal-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Audit & Consent</h4>
              <p className="text-[11px] text-slate-400 mt-1">Granular consent trails and row-level audit logs.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <Users className="h-5 w-5 text-indigo-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Analytics Hub</h4>
              <p className="text-[11px] text-slate-400 mt-1">Departmental throughput and outcome metrics.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <Network className="h-5 w-5 text-sky-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Multi-Location</h4>
              <p className="text-[11px] text-slate-400 mt-1">Multi-clinic tenant isolation with unified governance.</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => triggerGuardedNavigation(onNavigateToPharmacy, "Central Pharmacy & Operations")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold border border-slate-700 transition"
            >
              <span>Explore Hospital Operations</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* SPECIALTY INTELLIGENCE SECTION (VISUAL GRID, NOT 20 HERO BUTTONS) */}
      <section id="specialties" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Clinical Suites</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">AI-powered workflows across specialties.</h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Every medical discipline has unique documentation needs. Clinitial provides dedicated, specialized suites configured for specific clinical requirements.
            </p>
          </div>

          {/* Clean Visual Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {specialties.map((spec) => {
              const IconComp = spec.icon;
              return (
                <div 
                  key={spec.id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${spec.color}`}>
                        <IconComp className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">SPECIALTY</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{spec.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{spec.description}</p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => triggerGuardedNavigation(spec.action, `${spec.name} Clinical Suite`)}
                      className="w-full inline-flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-cyan-300 transition py-1"
                    >
                      <span>Explore Suite</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <button 
              onClick={() => triggerGuardedNavigation(onNavigateToDashboard, "Comprehensive Clinical Suites")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
            >
              <span>Explore Clinical Intelligence</span>
              <ArrowRight className="h-4 w-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </section>

      {/* CONNECTED HEALTHCARE ECOSYSTEM FLOW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/80 border-t border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">The Connected Ecosystem</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Clinitial connects the healthcare ecosystem.</h2>
          <p className="text-sm text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
            Real-time synchronization ensures that when a patient visits an OPD or undergoes a test, every relevant care stakeholder has synchronized visibility.
          </p>

          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium">
              <span className="px-3.5 py-2 rounded-xl bg-slate-950 text-emerald-400 border border-emerald-900/40">
                Patient
              </span>
              <span className="text-slate-600">↕</span>
              <span className="px-3.5 py-2 rounded-xl bg-slate-950 text-cyan-400 border border-cyan-900/40">
                Doctor
              </span>
              <span className="text-slate-600">↕</span>
              <span className="px-3.5 py-2 rounded-xl bg-slate-950 text-blue-400 border border-blue-900/40">
                Hospital
              </span>
              <span className="text-slate-600">↕</span>
              <span className="px-3.5 py-2 rounded-xl bg-slate-950 text-amber-400 border border-amber-900/40">
                Pharmacy
              </span>
              <span className="text-slate-600">↕</span>
              <span className="px-3.5 py-2 rounded-xl bg-slate-950 text-purple-400 border border-purple-900/40">
                Laboratory
              </span>
              <span className="text-slate-600">↕</span>
              <span className="px-3.5 py-2 rounded-xl bg-slate-950 text-rose-400 border border-rose-900/40">
                Specialists
              </span>
              <span className="text-slate-600">↕</span>
              <span className="px-3.5 py-2 rounded-xl bg-slate-950 text-indigo-400 border border-indigo-900/40">
                Digital Health Systems
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW CLINITIAL WORKS (5 STEPS) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Methodology</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">How Clinitial Works</h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              A five-stage clinical intelligence cycle designed for speed and diagnostic rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xl font-bold font-mono text-cyan-400 mb-2">01</div>
              <h4 className="text-sm font-semibold text-white">Capture</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ambient multi-lingual voice recording, photo symptom scans, and rapid vital entry.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xl font-bold font-mono text-blue-400 mb-2">02</div>
              <h4 className="text-sm font-semibold text-white">Understand</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Medical NLP extracts clinical entities, symptoms, duration, and patient timeline.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xl font-bold font-mono text-purple-400 mb-2">03</div>
              <h4 className="text-sm font-semibold text-white">Assist</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Generates draft observations, contraindication alerts, and differential considerations.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xl font-bold font-mono text-emerald-400 mb-2">04</div>
              <h4 className="text-sm font-semibold text-white">Connect</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Dispatches digital records to patient WhatsApp, the hospital pharmacy, and lab queues.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 sm:col-span-2 lg:col-span-1">
              <div className="text-xl font-bold font-mono text-amber-400 mb-2">05</div>
              <h4 className="text-sm font-semibold text-white">Continuously Learn</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Builds cumulative longitudinal understanding for each patient's next clinical visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY & TRUST (RESPONSIBLE, FACTUAL SECURITY CLAIMS) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/80 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Security Engineering</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Built for sensitive healthcare data.</h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Designed according to modern health data privacy standards and strict consent governance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <Lock className="h-5 w-5 text-emerald-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">Privacy & Consent First</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Explicit patient consent collection prior to data sharing, with revocable digital authorization controls.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <FileCheck className="h-5 w-5 text-cyan-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">Immutable Auditability</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Granular, tamper-evident audit logs recording every clinical data read, modification, and export event.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <ShieldCheck className="h-5 w-5 text-blue-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">Role-Based Access Control</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Strict least-privilege role validation separating doctors, pharmacists, administrative staff, and patients.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <Network className="h-5 w-5 text-purple-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">Tenant Isolation</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Logical multi-tenant isolation ensuring clinic and hospital data partitions remain strictly segregated.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <Database className="h-5 w-5 text-amber-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">FHIR-Ready Architecture</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Data models engineered around standard HL7 FHIR resource schemas for healthcare interoperability.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <Share2 className="h-5 w-5 text-teal-400 mb-3" />
              <h4 className="text-sm font-semibold text-white">ABDM-Ready Architecture</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Engineered for seamless integration with national digital health accounts (ABHA) and consent managers.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Security Note:</span> Regulatory certifications undergo periodic external auditing. Technical specifications and compliance roadmap available upon request.
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Simple plans.</h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Transparent tiers scaled for independent practitioners, community clinics, and hospital networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Solo / Clinic Plan */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Doctor / Clinic</h3>
                <p className="text-xs text-slate-400 mt-1">For independent clinics and OPD practices</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-white">₹1,499</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> 1 Doctor & 2 Staff logins
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Full Voice AI documentation
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> WhatsApp prescription dispatch
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Patient health record vault
                  </div>
                </div>
              </div>
              <a 
                href="#signup" 
                className="mt-6 block w-full text-center py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-slate-700"
              >
                Start Free 14-Day Trial
              </a>
            </div>

            {/* Hospital Plan */}
            <div className="p-6 rounded-2xl bg-slate-900 border-2 border-cyan-500 relative flex flex-col justify-between shadow-xl shadow-cyan-500/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full">
                Most Popular
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Hospital</h3>
                <p className="text-xs text-slate-400 mt-1">For nursing homes & multi-specialty centers</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-white">₹4,999</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Up to 10 Doctor logins
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Unlimited patient records
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Pharmacy dispensing hub
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Multi-specialty clinical suites
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> WebRTC Telemedicine
                  </div>
                </div>
              </div>
              <a 
                href="#signup" 
                className="mt-6 block w-full text-center py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-500/20 transition"
              >
                Start Free Trial
              </a>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1">For multi-center chains & large health systems</p>
                <div className="my-5">
                  <span className="text-3xl font-extrabold text-white">Custom</span>
                  <span className="text-xs text-slate-400"> pricing</span>
                </div>
                <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Unlimited departments & doctors
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Custom HIS / ERP integration
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> Dedicated tenant hosting
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400" /> 24/7 Priority clinical SLA
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsDemoModalOpen(true)}
                className="mt-6 block w-full text-center py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-slate-700"
              >
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNUP / LEAD SECTION (CLEAN HEALTHCARE ONBOARDING) */}
      <section id="signup" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/80 border-t border-slate-800">
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Getting Started</span>
            <h2 className="text-2xl font-bold text-white mt-1">Start your 14-day free trial</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Experience modern clinical documentation and patient connection with zero upfront commitment.
            </p>
          </div>

          {!signupSuccess ? (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Rajesh Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dr.sharma@clinic.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone (with WhatsApp)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Clinic / Hospital Name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input 
                      type="text" 
                      required 
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="Sharma Multispecialty"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Number of Doctors</label>
                  <select 
                    value={doctorCount}
                    onChange={(e) => setDoctorCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="1">1 (Independent Practice)</option>
                    <option value="2-5">2-5 (Group Clinic)</option>
                    <option value="6-15">6-15 (Nursing Home)</option>
                    <option value="15+">15+ (Hospital Network)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="agree" className="text-xs text-slate-400 select-none cursor-pointer leading-relaxed">
                  I agree to Clinitial&apos;s <a href="#" className="text-cyan-400 hover:underline">Terms of Service</a> and <a href="#" className="text-cyan-400 hover:underline">Privacy Notice</a>.
                </label>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                {submitting ? "Setting Up Clinic Workspace..." : "Create Free Trial Account"}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Welcome, Dr. {signupSuccess.fullName}</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Your clinic workspace for <strong className="text-white">{signupSuccess.clinicName}</strong> is ready.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                Administrative account registered with <span className="text-white font-mono">{email}</span>.
              </div>
              <button 
                onClick={() => triggerGuardedNavigation(onNavigateToDashboard, "Doctor EHR Workspace")}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-cyan-600/20"
              >
                Open Clinical Console
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Healthcare shouldn&apos;t work in silos.
          </h2>
          <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Clinitial connects the intelligence, people, and systems behind better care.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a 
              href="#signup"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition"
            >
              Start with Clinitial
            </a>
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-sm font-semibold transition"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* CLEAN PROFESSIONAL FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-14 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <Heart className="h-3.5 w-3.5 fill-red-500" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">Clinitial.OS</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The AI healthcare operating system connecting doctors, patients, and hospital operations from consultation to continuous care.
            </p>
            <p className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} Clinitial Health Technologies. All rights reserved.
            </p>
          </div>

          {/* Solutions Column */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Solutions</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#for-doctors" className="hover:text-slate-200 transition">For Doctors & Clinics</a></li>
              <li><a href="#for-patients" className="hover:text-slate-200 transition">For Patients & Families</a></li>
              <li><a href="#for-hospitals" className="hover:text-slate-200 transition">For Hospitals & Nursing Homes</a></li>
              <li><a href="#specialties" className="hover:text-slate-200 transition">Clinical Specialties</a></li>
            </ul>
          </div>

          {/* Technology & Security Column */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Platform & AI</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#ai-core" className="hover:text-slate-200 transition">Clinitial AI Core</a></li>
              <li><a href="#ai-core" className="hover:text-slate-200 transition">Ambient Voice Capture</a></li>
              <li><a href="#ai-core" className="hover:text-slate-200 transition">Clinical Decision Support</a></li>
              {onNavigateToBlueprint && (
                <li>
                  <button 
                    onClick={onNavigateToBlueprint}
                    className="hover:text-cyan-400 text-left transition flex items-center gap-1 text-slate-400"
                  >
                    <span>Architecture Blueprint</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Access / Support */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Access & Legal</div>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button 
                  onClick={() => {
                    setIntendedModuleTitle("Doctor Clinical Workspace");
                    setPendingNavigationAction(() => onNavigateToDashboard);
                    setAuthModalOpen(true);
                  }}
                  className="hover:text-slate-200 transition text-left cursor-pointer"
                >
                  Clinician Sign In
                </button>
              </li>
              <li>
                <button 
                  onClick={() => triggerGuardedNavigation(onNavigateToAdmin, "Clinitial Admin OS & Governance Console")}
                  className="hover:text-purple-400 transition text-left flex items-center gap-1.5 cursor-pointer text-slate-400"
                >
                  <Lock className="h-3 w-3 text-purple-400/80" />
                  <span>Administrator Portal</span>
                </button>
              </li>
              <li><a href="#" className="hover:text-slate-200 transition">Privacy Notice</a></li>
              <li><a href="#" className="hover:text-slate-200 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-slate-200 transition">Security Engineering</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-3">
          <p>Designed for clinical safety, accessibility, and high-performance healthcare operations.</p>
          <div className="flex gap-4">
            <a href="#solutions" className="hover:text-slate-400 transition">Solutions</a>
            <a href="#specialties" className="hover:text-slate-400 transition">Specialties</a>
            <a href="#pricing" className="hover:text-slate-400 transition">Pricing</a>
          </div>
        </div>
      </footer>

      {/* PRODUCT TOUR MODAL */}
      <ProductTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateToFeature={() => {
          setIsTourOpen(false);
          triggerGuardedNavigation(onNavigateToDashboard, "Doctor Clinical Workspace");
        }}
      />
    </div>
  );
}
