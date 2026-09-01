import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  UserCheck, 
  Smartphone, 
  Pill, 
  Stethoscope, 
  Briefcase, 
  Shield, 
  KeyRound
} from "lucide-react";
import { useAuth, DEMO_PRESETS, DemoUserPreset } from "../context/AuthContext";
import { UserRole } from "../types";

export interface CuraAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  intendedModuleTitle?: string | null;
  onSuccess?: () => void;
}

export default function CuraAuthModal({
  isOpen,
  onClose,
  intendedModuleTitle,
  onSuccess
}: CuraAuthModalProps) {
  const { login, signup, loginWithPreset } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"signup" | "login" | "demo">("signup");
  
  // Sign up state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("doctor");
  const [clinicName, setClinicName] = useState("");
  const [doctorCount, setDoctorCount] = useState("1");
  const [abhaId, setAbhaId] = useState("");
  const [agreed, setAgreed] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setErrorMessage("Please enter a valid phone/WhatsApp number");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    if (!agreed) {
      setErrorMessage("Please agree to the privacy policy and DPDP compliance terms");
      return;
    }

    setSubmitting(true);
    try {
      const res = await signup({
        fullName,
        email,
        phone,
        password,
        role,
        clinicName: clinicName || (role === "patient" ? "Self" : `${fullName}'s Practice`),
        doctorCount,
        abhaId
      });

      if (res.success) {
        setSuccessMessage("Account created successfully! Entering CURA...");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.error || "Failed to create account. Please try again.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred during signup.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage("Please enter your registered email address");
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        setSuccessMessage("Welcome back! Signing you in...");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 500);
      } else {
        setErrorMessage(res.error || "Invalid credentials. Please verify your email.");
      }
    } catch {
      setErrorMessage("Network error during login.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePresetSelect = (preset: DemoUserPreset) => {
    setErrorMessage(null);
    setSuccessMessage(`Authenticating as ${preset.name}...`);
    setTimeout(() => {
      loginWithPreset(preset);
      onSuccess?.();
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                  <Heart className="h-7 w-7 text-rose-400 fill-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-white">
                      CURA<span className="text-red-500">.</span>
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-300/30">
                      Universal Auth Gate
                    </span>
                  </div>
                  <p className="text-xs text-sky-200/80 mt-0.5">
                    Operating System for Clinics & Connected Healthcare
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contextual Notice */}
            {intendedModuleTitle ? (
              <div className="mt-4 p-3 bg-sky-500/15 border border-sky-400/30 rounded-2xl flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-sky-300 shrink-0" />
                <div className="text-xs text-sky-100">
                  <span className="font-semibold text-white">Sign up / Log in required</span> to enter{" "}
                  <strong className="text-sky-300 underline underline-offset-2">{intendedModuleTitle}</strong>.
                </div>
              </div>
            ) : (
              <div className="mt-4 p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-sky-100/90 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Protected by AES-256 Encryption & DPDP Act 2023 India Compliance</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2">
            <button
              onClick={() => { setActiveTab("signup"); setErrorMessage(null); }}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === "signup"
                  ? "border-sky-600 text-sky-700 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <User className="h-4 w-4" />
              <span>1. Create Account (Sign Up)</span>
            </button>

            <button
              onClick={() => { setActiveTab("login"); setErrorMessage(null); }}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === "login"
                  ? "border-sky-600 text-sky-700 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <KeyRound className="h-4 w-4" />
              <span>2. Sign In (Log In)</span>
            </button>

            <button
              onClick={() => { setActiveTab("demo"); setErrorMessage(null); }}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ml-auto ${
                activeTab === "demo"
                  ? "border-amber-500 text-amber-800 font-extrabold"
                  : "border-transparent text-amber-600/80 hover:text-amber-800"
              }`}
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span>⚡ 1-Click Instant Demo</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 max-h-[68vh] overflow-y-auto">
            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-fadeIn">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: SIGN UP FORM */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {/* Role Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Select Your Role in Healthcare *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "doctor", label: "Doctor / Clinician", icon: Stethoscope, color: "text-sky-600 bg-sky-50 border-sky-200" },
                      { id: "patient", label: "Patient / Individual", icon: Smartphone, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                      { id: "pharmacist", label: "Pharmacist / Chemist", icon: Pill, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
                      { id: "admin", label: "Clinic Admin / Staff", icon: Building2, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
                      { id: "ayush_practitioner", label: "AYUSH / Wellness", icon: Sparkles, color: "text-purple-600 bg-purple-50 border-purple-200" },
                      { id: "mr_representative", label: "MR Representative", icon: Briefcase, color: "text-amber-600 bg-amber-50 border-amber-200" }
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as UserRole)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          role === r.id
                            ? `${r.color} font-bold ring-2 ring-sky-500/30 shadow-2xs`
                            : "border-slate-200 hover:bg-slate-50 text-slate-700 text-xs"
                        }`}
                      >
                        <r.icon className="h-4 w-4 shrink-0" />
                        <span className="text-xs truncate">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name and Email */}
                <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={role === "doctor" ? "Dr. Rajesh Sharma" : "Rajesh Kumar"}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@clinic.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone & Password */}
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clinic / ABHA Details */}
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      {role === "patient" ? "ABHA ID / National Health ID (Optional)" : "Clinic / Hospital / Organization Name"}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={role === "patient" ? abhaId : clinicName}
                        onChange={(e) => role === "patient" ? setAbhaId(e.target.value) : setClinicName(e.target.value)}
                        placeholder={role === "patient" ? "e.g. 14-digit ABHA or name@abdm" : "Sharma Multispecialty Clinic"}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>

                  {role !== "patient" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Doctor / Practitioner Count
                      </label>
                      <select
                        value={doctorCount}
                        onChange={(e) => setDoctorCount(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                      >
                        <option value="1">1 (Solo Practice)</option>
                        <option value="2-5">2 to 5 Doctors (Group Clinic)</option>
                        <option value="6-10">6 to 10 Doctors (Nursing Home)</option>
                        <option value="10+">10+ Doctors (Multi-Specialty Hospital)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Consent & Compliance Check */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="signup-agree"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <label htmlFor="signup-agree" className="text-[11px] font-medium text-slate-500 select-none cursor-pointer leading-tight">
                    I agree to CURA Terms, DPDP Act 2023 patient data confidentiality guardrails, and consent to clinical notifications.
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-extrabold text-xs tracking-wide shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
                >
                  {submitting ? (
                    <span>⏳ Registering Clinical Node...</span>
                  ) : (
                    <>
                      <span>Create Account & Enter {intendedModuleTitle || "CURA"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <span className="text-xs text-slate-500">Already registered with CURA? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    Log In here
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: LOG IN FORM */}
            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Registered Email Address / Login ID *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. dr.sharma@cura.in or patient@gmail.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                    <span>Keep me logged in</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab("demo")}
                    className="text-sky-600 font-bold hover:underline"
                  >
                    Quick demo credentials?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl gradient-btn-cura text-white font-extrabold text-xs tracking-wide shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
                >
                  {submitting ? (
                    <span>⏳ Verifying Credentials...</span>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Log In & Enter {intendedModuleTitle || "Portal"}</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">Need a new practice account? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    Create one in 30 seconds
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: 1-CLICK INSTANT DEMO ROLES */}
            {activeTab === "demo" && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 mb-2">
                  Click any verified clinical profile below to test CURA with realistic pre-configured hospital and patient data:
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5">
                  {DEMO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className="p-3 bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 rounded-2xl text-left transition-all group flex items-start gap-3 cursor-pointer shadow-2xs hover:shadow-sm"
                    >
                      <div className="text-2xl p-2 rounded-xl bg-white border border-slate-100 group-hover:scale-105 transition-transform shadow-2xs">
                        {preset.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-800 group-hover:text-sky-900 truncate">
                            {preset.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 uppercase tracking-wider">
                            {preset.role}
                          </span>
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                          {preset.clinicName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {preset.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                  <Zap className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>1-click demo immediately authenticates your session without requiring email verification.</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer security tag */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Zero-Knowledge EHR Data Sovereignty</span>
            </span>
            <span>Version 3.4 Enterprise</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
