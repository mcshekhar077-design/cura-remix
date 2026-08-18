import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  UserPlus, 
  UserCheck, 
  KeyRound, 
  Smartphone, 
  Search, 
  ArrowRight, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Fingerprint, 
  ChevronRight,
  Sparkles,
  Heart,
  LogOut,
  Settings,
  Bell,
  Loader2,
  ListOrdered
} from "lucide-react";
import { Patient } from "../types";
import { MFAVerification } from "./PatientAuthScreen/MFAVerification";
import { SocialLogin } from "./PatientAuthScreen/SocialLogin";
import { RegistrationSteps } from "./PatientAuthScreen/RegistrationSteps";

// ============================================
// TYPES
// ============================================

export interface AuthState {
  isAuthenticated: boolean;
  patient: Patient | null;
  token: string | null;
  sessionId: string | null;
  expiresAt: string | null;
}

export interface PatientAuthScreenProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onPatientCreated: (newPatient: Patient) => void;
  onInstallPWA?: () => void;
  isPwaInstalled?: boolean;
  isSimulator?: boolean;
  isBiometricSupported?: boolean;
  onAuthenticateBiometric?: () => void;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onNotificationClick?: () => void;
}

// ============================================
// SUB-COMPONENTS
// ============================================

const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = useCallback(() => {
    let score = 0;
    if (password.length >= 4) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    return score;
  }, [password]);

  const strength = getStrength();
  const maxStrength = 5;
  const percentage = (strength / maxStrength) * 100;

  const getColor = () => {
    if (strength <= 1) return 'bg-rose-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-cyan-500';
    return 'bg-emerald-500';
  };

  const getLabel = () => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  };

  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-slate-400">{getLabel()}</span>
      </div>
    </div>
  );
};

const PatientCard: React.FC<{
  patient: Patient;
  onSelect: () => void;
  isActive?: boolean;
}> = ({ patient, onSelect, isActive }) => {
  return (
    <button
      id={`patient-card-${patient.id}`}
      type="button"
      onClick={onSelect}
      className={`w-full p-3 bg-slate-950/40 hover:bg-slate-950 border rounded-xl text-left hover:border-emerald-500/40 transition-all flex items-center justify-between cursor-pointer group ${
        isActive ? 'border-emerald-500/60 bg-slate-950' : 'border-slate-800/90'
      }`}
    >
      <div className="min-w-0 pr-2">
        <p className="text-[11px] font-extrabold text-white group-hover:text-emerald-400 transition-colors truncate flex items-center gap-2">
          {patient.fullName}
          {isActive && (
            <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </p>
        <p className="text-[9px] font-semibold text-slate-500 font-mono truncate">
          Code: {patient.patientCode || patient.id} • {patient.phone}
        </p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 transition-all shrink-0" />
    </button>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function PatientAuthScreen({
  patients,
  onSelectPatient,
  onPatientCreated,
  onInstallPWA,
  isPwaInstalled = false,
  isSimulator = true,
  isBiometricSupported = false,
  onAuthenticateBiometric,
  onLogout,
  onSettingsClick,
  onNotificationClick
}: PatientAuthScreenProps): React.ReactElement {
  // ============================================
  // STATE
  // ============================================

  const [authTab, setAuthTab] = useState<"signin" | "signup" | "otp">("signin");
  const [useGuidedRegistration, setUseGuidedRegistration] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [pendingMFAPatient, setPendingMFAPatient] = useState<Patient | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [sessionTimeout] = useState<number | null>(null);

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up State
  const [signUpFullName, setSignUpFullName] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpAge, setSignUpAge] = useState("28");
  const [signUpGender, setSignUpGender] = useState<"Male" | "Female" | "Other">("Male");
  const [signUpBloodGroup, setSignUpBloodGroup] = useState("O+");
  const [signUpAbhaId, setSignUpAbhaId] = useState("");
  const [signUpTermsAccepted, setSignUpTermsAccepted] = useState(true);
  const [signUpAgreedToConsent, setSignUpAgreedToConsent] = useState(false);

  // OTP State
  const [otpPhone, setOtpPhone] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [, setOtpResendCount] = useState(0);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // EFFECTS
  // ============================================

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      timerRef.current = setTimeout(() => {
        setOtpCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [otpCooldown]);

  // Session timeout
  useEffect(() => {
    if (sessionTimeout) {
      const timeout = setTimeout(() => {
        setAuthError("Session expired. Please sign in again.");
        localStorage.removeItem("cura_patient_session");
      }, sessionTimeout);
      return () => clearTimeout(timeout);
    }
  }, [sessionTimeout]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleTabChange = useCallback((tab: "signin" | "signup" | "otp") => {
    setAuthTab(tab);
    setAuthError(null);
    setAuthSuccessMsg(null);
    setOtpSent(false);
    setGeneratedOtp(null);
  }, []);

  const validatePhone = useCallback((phone: string): boolean => {
    const cleaned = phone.replace(/\s+/g, '');
    return cleaned.length >= 8 && cleaned.length <= 15;
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const completeLoginForPatient = useCallback((pat: Patient, isFamilyShare = false) => {
    localStorage.setItem("cura_patient_session", JSON.stringify({
      id: pat.id,
      patientCode: pat.patientCode,
      fullName: pat.fullName,
      timestamp: Date.now(),
      isFamilyShare
    }));

    setAuthSuccessMsg(`Welcome back, ${pat.fullName}!`);
    setTimeout(() => {
      onSelectPatient(pat);
      setIsLoading(false);
    }, 400);
  }, [onSelectPatient]);

  const handleSignInSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    const identifier = signInIdentifier.trim();
    if (!identifier) {
      setAuthError("Please enter your Phone, Email, Patient Code, or ABHA ID.");
      return;
    }

    setIsLoading(true);

    try {
      // Check for family share code
      if (identifier.toUpperCase().startsWith("CURA-FAM-")) {
        const matchedPatient = patients.find(p => 
          p.id.toUpperCase() === identifier.toUpperCase() ||
          (p.patientCode && p.patientCode.toUpperCase() === identifier.toUpperCase())
        );
        
        if (matchedPatient) {
          completeLoginForPatient(matchedPatient, true);
          return;
        }
        setAuthError("Invalid or expired Family Share Code.");
        setIsLoading(false);
        return;
      }

      // Try local patient match first
      const trimmed = identifier.toLowerCase();
      const match = patients.find(
        p => p.id.toLowerCase() === trimmed ||
             (p.patientCode && p.patientCode.toLowerCase() === trimmed) ||
             (p.phone && p.phone.replace(/\s+/g, "").includes(identifier.replace(/\s+/g, ""))) ||
             (p.email && p.email.toLowerCase() === trimmed) ||
             (p.abhaId && p.abhaId.toLowerCase() === trimmed)
      );

      if (match) {
        completeLoginForPatient(match);
      } else {
        // Try API call
        try {
          const response = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              identifier, 
              password: signInPassword || undefined 
            })
          });

          if (response.ok) {
            const data = await response.json();
            completeLoginForPatient(data.patient);
          } else {
            const errData = await response.json();
            setAuthError(errData.detail || "Invalid credentials. Please try again.");
            setIsLoading(false);
          }
        } catch (apiError) {
          setAuthError("Network error. Please check your connection and try again.");
          setIsLoading(false);
        }
      }
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }, [signInIdentifier, signInPassword, patients, completeLoginForPatient]);

  const handleSignUpSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    // Validate fields
    if (!signUpFullName.trim()) {
      setAuthError("Please enter your Full Name.");
      return;
    }
    if (!validatePhone(signUpPhone)) {
      setAuthError("Please enter a valid mobile phone number (8-15 digits).");
      return;
    }
    if (signUpEmail && !validateEmail(signUpEmail)) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!signUpPassword || signUpPassword.length < 4) {
      setAuthError("Please set a password or 4-digit Security PIN (minimum 4 characters).");
      return;
    }
    if (!signUpTermsAccepted || !signUpAgreedToConsent) {
      setAuthError("Please accept the Terms of Service & Health Data Consent.");
      return;
    }

    setIsLoading(true);

    try {
      // Local fallback
      const newPatient: Patient = {
        id: `PAT-${Date.now()}`,
        fullName: signUpFullName.trim(),
        patientCode: `CURA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        phone: signUpPhone.trim(),
        email: signUpEmail.trim() || "",
        age: Number(signUpAge) || 30,
        gender: signUpGender,
        bloodGroup: signUpBloodGroup,
        abhaId: signUpAbhaId.trim() || undefined,
        allergies: [],
        currentMedications: [],
        history: [],
        createdAt: new Date().toISOString()
      };

      onPatientCreated(newPatient);
      localStorage.setItem("cura_patient_session", JSON.stringify({
        id: newPatient.id,
        patientCode: newPatient.patientCode,
        fullName: newPatient.fullName,
        timestamp: Date.now()
      }));

      setAuthSuccessMsg(`✓ Account Created! Patient Code: ${newPatient.patientCode}`);
      
      setTimeout(() => {
        onSelectPatient(newPatient);
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      setAuthError("Failed to create account. Please try again.");
      setIsLoading(false);
    }
  }, [
    signUpFullName, signUpPhone, signUpEmail, signUpPassword,
    signUpAge, signUpGender, signUpBloodGroup, signUpAbhaId,
    signUpTermsAccepted, signUpAgreedToConsent,
    validatePhone, validateEmail, onPatientCreated, onSelectPatient
  ]);

  const handleSendOtp = useCallback(() => {
    if (!validatePhone(otpPhone)) {
      setAuthError("Please enter a valid mobile number.");
      return;
    }

    if (otpCooldown > 0) {
      setAuthError(`Please wait ${otpCooldown} seconds before requesting another OTP.`);
      return;
    }

    setAuthError(null);
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(verificationCode);
    setEnteredOtp("");
    setOtpSent(true);
    setOtpResendCount(prev => prev + 1);
    setOtpCooldown(30);
    setAuthSuccessMsg(`Verification code sent to ${otpPhone}. (Security code: ${verificationCode})`);
  }, [otpPhone, otpCooldown, validatePhone]);

  const handleVerifyOtp = useCallback(async () => {
    if (enteredOtp.length !== 6) {
      setAuthError("Please enter a valid 6-digit OTP code.");
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setAuthError("Invalid OTP code. Please try again.");
      return;
    }

    setIsLoading(true);

    // Find patient by phone
    const match = patients.find(p => 
      p.phone.replace(/\s+/g, "").includes(otpPhone.replace(/\s+/g, ""))
    );

    if (match) {
      completeLoginForPatient(match);
    } else {
      setAuthError("No account registered with this phone number. Please Sign Up.");
      setIsLoading(false);
    }
  }, [enteredOtp, generatedOtp, otpPhone, patients, completeLoginForPatient]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (authTab === 'signin') {
        handleSignInSubmit();
      } else if (authTab === 'signup' && formRef.current) {
        formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  }, [authTab, handleSignInSubmit]);

  // ============================================
  // MEMOIZED VALUES
  // ============================================

  const activePatients = useMemo(() => {
    return patients.slice(0, 6);
  }, [patients]);

  const hasPatients = useMemo(() => patients.length > 0, [patients]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <motion.div 
      id="patient-auth-screen-root"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex-1 flex flex-col justify-between overflow-y-auto ${
        isSimulator ? "p-5" : "p-6 md:p-10 max-w-lg mx-auto"
      }`}
      role="main"
      aria-label="Patient Authentication"
    >
      {/* 2FA MFA Verification Modal */}
      {showMFA && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <MFAVerification
              onVerify={() => {
                setShowMFA(false);
                if (pendingMFAPatient) {
                  completeLoginForPatient(pendingMFAPatient);
                }
              }}
              onBack={() => setShowMFA(false)}
              email={pendingMFAPatient?.email || signUpEmail}
              phone={pendingMFAPatient?.phone || signUpPhone}
              isRequired={false}
            />
          </div>
        </div>
      )}

      {/* Top Header Logo & Welcome */}
      <div className="text-center pt-2 space-y-2">
        <div className="inline-flex h-13 w-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20">
          <Heart className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            CURA Patient Portal
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase font-mono font-bold">
              v2.4
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Secure Digital Health Vault, EMR History, Tele-Consultations & AI Vitals.
          </p>
        </div>

        {/* PWA Install Button */}
        {onInstallPWA && (
          <div className="pt-1">
            <button
              id="btn-install-pwa"
              type="button"
              onClick={onInstallPWA}
              className={`w-full py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isPwaInstalled
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border-emerald-400 shadow-emerald-500/20 animate-pulse"
              }`}
              aria-label={isPwaInstalled ? "App installed" : "Install app"}
            >
              <span>📲</span>
              <span>{isPwaInstalled ? "✓ App Installed on Device" : "Install CURA App"}</span>
            </button>
          </div>
        )}

        {/* Session Status */}
        {localStorage.getItem("cura_patient_session") && (
          <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            <span>Session Active</span>
            <button
              id="btn-clear-patient-session"
              type="button"
              onClick={() => {
                localStorage.removeItem("cura_patient_session");
                if (onLogout) onLogout();
                window.location.reload();
              }}
              className="text-rose-400 hover:text-rose-300 ml-2 cursor-pointer"
              aria-label="Logout"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Auth Mode Tabs */}
      <div className="my-4">
        <div className="flex bg-slate-950/90 p-1 rounded-2xl border border-slate-800/80 gap-1" role="tablist">
          <button
            id="tab-auth-signin"
            type="button"
            onClick={() => handleTabChange("signin")}
            className={`flex-1 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authTab === "signin"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            role="tab"
            aria-selected={authTab === "signin"}
            aria-label="Sign in"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Sign In
          </button>

          <button
            id="tab-auth-signup"
            type="button"
            onClick={() => handleTabChange("signup")}
            className={`flex-1 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authTab === "signup"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            role="tab"
            aria-selected={authTab === "signup"}
            aria-label="Sign up"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Sign Up
          </button>

          <button
            id="tab-auth-otp"
            type="button"
            onClick={() => handleTabChange("otp")}
            className={`flex-1 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authTab === "otp"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            role="tab"
            aria-selected={authTab === "otp"}
            aria-label="OTP login"
          >
            <Smartphone className="h-3.5 w-3.5" />
            OTP Login
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-semibold p-3 rounded-2xl text-center flex items-center justify-center gap-2"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{authError}</span>
          </motion.div>
        )}

        {authSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold p-3 rounded-2xl text-center flex items-center justify-center gap-2"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{authSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB: SIGN IN */}
      {authTab === "signin" && (
        <div className="space-y-3">
          <form onSubmit={handleSignInSubmit} className="space-y-3 my-1" role="form" aria-label="Sign in form">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1" htmlFor="signInIdentifier">
                <User className="h-3 w-3" />
                Patient Identifier
              </label>
              <div className="relative">
                <input 
                  id="signInIdentifier"
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Mobile No / Email / Patient Code / ABHA ID"
                  className="w-full bg-slate-950/90 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 px-3.5 py-3 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  aria-label="Patient identifier"
                  autoComplete="username"
                  ref={inputRef}
                />
                <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" aria-hidden="true" />
              </div>
              <p className="text-[9.5px] text-slate-400 pl-1">
                Accepts Phone, Email, Patient Code, or ABHA ID
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center justify-between" htmlFor="signInPassword">
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Password or Security PIN
                </span>
                <span className="text-[9px] text-slate-500 font-normal">Optional in demo</span>
              </label>
              <div className="relative">
                <input 
                  id="signInPassword"
                  type={showPassword ? "text" : "password"}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/90 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 px-3.5 py-3 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  aria-label="Password"
                  autoComplete="current-password"
                />
                <button
                  id="btn-toggle-show-password"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Options */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold cursor-pointer">
                <input 
                  id="remember-me-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-emerald-500 bg-slate-950 border-slate-800 h-3.5 w-3.5"
                  aria-label="Remember this device"
                />
                Remember this device
              </label>

              <div className="flex items-center gap-3">
                <button
                  id="btn-open-mfa-modal"
                  type="button"
                  onClick={() => {
                    const match = patients.find(p => p.id === signInIdentifier || p.patientCode === signInIdentifier);
                    setPendingMFAPatient(match || patients[0] || null);
                    setShowMFA(true);
                  }}
                  className="text-[10px] text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  aria-label="Configure 2FA MFA"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  2FA
                </button>

                {isBiometricSupported && onAuthenticateBiometric && (
                  <button
                    id="btn-biometric-passkey"
                    type="button"
                    onClick={onAuthenticateBiometric}
                    className="text-[10px] text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    aria-label="Use biometric authentication"
                  >
                    <Fingerprint className="h-3.5 w-3.5" />
                    Passkey
                  </button>
                )}
              </div>
            </div>

            <button
              id="btn-signin-submit"
              type="submit"
              disabled={isLoading || !signInIdentifier.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-2xl shadow-md tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign in to EHR Vault"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to EHR Vault <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Social OAuth Integration */}
          <SocialLogin
            onSuccess={(provider, data) => {
              const matchedOrNew: Patient = patients.find(p => p.email === data.email) || {
                id: data.id,
                fullName: data.name,
                email: data.email,
                phone: "+91 98765 43210",
                age: 32,
                gender: "Male",
                bloodGroup: "O+",
                patientCode: `CURA-${provider.toUpperCase()}-${Date.now().toString().slice(-4)}`,
                allergies: [],
                currentMedications: [],
                history: [],
                createdAt: new Date().toISOString()
              };
              if (!patients.some(p => p.id === matchedOrNew.id)) {
                onPatientCreated(matchedOrNew);
              }
              completeLoginForPatient(matchedOrNew);
            }}
            onError={(err) => setAuthError(err)}
          />

          <p className="text-[10.5px] text-slate-400 text-center font-medium pt-1">
            Don&apos;t have an account?{" "}
            <button
              id="btn-switch-to-signup"
              type="button"
              onClick={() => handleTabChange("signup")}
              className="text-emerald-400 font-bold hover:underline cursor-pointer"
              aria-label="Navigate to sign up"
            >
              Sign Up Now
            </button>
          </p>
        </div>
      )}

      {/* TAB: SIGN UP */}
      {authTab === "signup" && (
        <div className="space-y-3">
          {/* Mode Switcher: Simple vs Guided Multi-Step */}
          <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 pl-1 flex items-center gap-1">
              <ListOrdered className="h-3 w-3 text-emerald-400" />
              Registration Mode:
            </span>
            <div className="flex gap-1">
              <button
                id="btn-mode-quick"
                type="button"
                onClick={() => setUseGuidedRegistration(false)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  !useGuidedRegistration
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Quick
              </button>
              <button
                id="btn-mode-guided"
                type="button"
                onClick={() => setUseGuidedRegistration(true)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  useGuidedRegistration
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Guided (5-Step)
              </button>
            </div>
          </div>

          {useGuidedRegistration ? (
            <RegistrationSteps
              onComplete={(createdPatient) => {
                onPatientCreated(createdPatient);
                completeLoginForPatient(createdPatient);
              }}
              onBack={() => setUseGuidedRegistration(false)}
            />
          ) : (
            <form ref={formRef} onSubmit={handleSignUpSubmit} className="space-y-3 my-1" role="form" aria-label="Sign up form">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest" htmlFor="signUpFullName">
                  Full Name *
                </label>
                <input 
                  id="signUpFullName"
                  type="text"
                  required
                  value={signUpFullName}
                  onChange={(e) => setSignUpFullName(e.target.value)}
                  placeholder="e.g. Aarav Verma"
                  className="w-full bg-slate-950/90 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 transition-all"
                  aria-label="Full name"
                  autoComplete="name"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest" htmlFor="signUpPhone">
                    Mobile Phone *
                  </label>
                  <input 
                    id="signUpPhone"
                    type="tel"
                    required
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950/90 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 transition-all font-mono"
                    aria-label="Phone number"
                    autoComplete="tel"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest" htmlFor="signUpEmail">
                    Email Address
                  </label>
                  <input 
                    id="signUpEmail"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="aarav@example.com"
                    className="w-full bg-slate-950/90 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 transition-all"
                    aria-label="Email address"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest" htmlFor="signUpAge">
                    Age *
                  </label>
                  <input 
                    id="signUpAge"
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={signUpAge}
                    onChange={(e) => setSignUpAge(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 text-xs font-bold text-white px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 text-center"
                    aria-label="Age"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest" htmlFor="signUpGender">
                    Gender *
                  </label>
                  <select
                    id="signUpGender"
                    value={signUpGender}
                    onChange={(e) => setSignUpGender(e.target.value as any)}
                    className="w-full bg-slate-950/90 border border-slate-800 text-xs font-bold text-white px-2 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                    aria-label="Gender"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest" htmlFor="signUpBloodGroup">
                    Blood Group
                  </label>
                  <select
                    id="signUpBloodGroup"
                    value={signUpBloodGroup}
                    onChange={(e) => setSignUpBloodGroup(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 text-xs font-bold text-white px-2 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                    aria-label="Blood group"
                  >
                    {["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest" htmlFor="signUpPassword">
                    Password / Security PIN *
                  </label>
                  <input 
                    id="signUpPassword"
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="4+ characters"
                    className="w-full bg-slate-950/90 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                    aria-label="Password"
                    autoComplete="new-password"
                  />
                  <PasswordStrengthIndicator password={signUpPassword} />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest" htmlFor="signUpAbhaId">
                    ABHA Health ID
                  </label>
                  <input 
                    id="signUpAbhaId"
                    type="text"
                    value={signUpAbhaId}
                    onChange={(e) => setSignUpAbhaId(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="w-full bg-slate-950/90 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                    aria-label="ABHA ID"
                  />
                </div>
              </div>

              <div className="pt-1 space-y-1.5">
                <label className="flex items-start gap-2 text-[10px] text-slate-400 font-medium cursor-pointer leading-tight">
                  <input 
                    id="checkbox-terms"
                    type="checkbox"
                    checked={signUpTermsAccepted}
                    onChange={(e) => setSignUpTermsAccepted(e.target.checked)}
                    className="rounded accent-emerald-500 bg-slate-950 border-slate-800 h-3.5 w-3.5 mt-0.5 shrink-0"
                    aria-label="Accept terms"
                  />
                  <span>
                    I agree to the <span className="text-emerald-400 font-bold">Terms of Service</span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-[10px] text-slate-400 font-medium cursor-pointer leading-tight">
                  <input 
                    id="checkbox-consent"
                    type="checkbox"
                    checked={signUpAgreedToConsent}
                    onChange={(e) => setSignUpAgreedToConsent(e.target.checked)}
                    className="rounded accent-emerald-500 bg-slate-950 border-slate-800 h-3.5 w-3.5 mt-0.5 shrink-0"
                    aria-label="Consent to data processing"
                  />
                  <span>
                    I consent to the <span className="text-emerald-400 font-bold">DPDP Health Data Processing</span> & Digital Records Storage
                  </span>
                </label>
              </div>

              <button
                id="btn-signup-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-md tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                aria-label="Create account"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-[10.5px] text-slate-400 text-center font-medium pt-0.5">
            Already have an account?{" "}
            <button
              id="btn-switch-to-signin-from-up"
              type="button"
              onClick={() => handleTabChange("signin")}
              className="text-emerald-400 font-bold hover:underline cursor-pointer"
              aria-label="Navigate to sign in"
            >
              Sign In Here
            </button>
          </p>
        </div>
      )}

      {/* TAB: OTP LOGIN */}
      {authTab === "otp" && (
        <div className="space-y-4 my-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest" htmlFor="otpPhone">
              Registered Mobile Number
            </label>
            <div className="flex gap-2">
              <input 
                id="otpPhone"
                type="tel"
                value={otpPhone}
                onChange={(e) => setOtpPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="flex-1 bg-slate-950/90 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 px-3.5 py-3 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                aria-label="Phone number for OTP"
                autoComplete="tel"
              />
              <button
                id="btn-send-otp"
                type="button"
                onClick={handleSendOtp}
                disabled={otpCooldown > 0}
                className="px-3.5 py-3 bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold rounded-xl transition-all uppercase tracking-wider shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send OTP"
              >
                {otpCooldown > 0 ? `${otpCooldown}s` : 'Send OTP'}
              </button>
            </div>
          </div>

          {otpSent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Enter 6-Digit Verification Code</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  SMS Delivered
                </span>
              </div>

              <input 
                id="input-otp-code"
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-slate-900 border border-slate-700 text-center text-lg font-mono font-black text-emerald-400 tracking-widest py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                aria-label="Enter OTP code"
                inputMode="numeric"
                pattern="[0-9]{6}"
              />

              <button
                id="btn-verify-otp"
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading || enteredOtp.length !== 6}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Verify OTP"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP & Enter Vault'
                )}
              </button>
            </motion.div>
          )}

          <p className="text-[10.5px] text-slate-400 text-center font-medium">
            Prefer Password?{" "}
            <button
              id="btn-switch-to-password"
              type="button"
              onClick={() => handleTabChange("signin")}
              className="text-emerald-400 font-bold hover:underline cursor-pointer"
              aria-label="Navigate to sign in"
            >
              Sign In with Password
            </button>
          </p>
        </div>
      )}

      {/* Quick Demo Accounts */}
      <div className="border-t border-slate-800/80 pt-3 mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Quick Demo Accounts
          </p>
          <span className="text-[9px] font-mono text-emerald-400 font-bold">{patients.length} Active</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-0.5" role="list">
          {hasPatients ? (
            activePatients.map((pat) => (
              <PatientCard
                key={pat.id}
                patient={pat}
                onSelect={() => onSelectPatient(pat)}
                isActive={localStorage.getItem("cura_patient_session")?.includes(pat.id) || false}
              />
            ))
          ) : (
            <div className="text-center py-3 text-xs text-slate-500 font-semibold">
              Loading patient records...
              <Loader2 className="h-4 w-4 animate-spin mx-auto mt-2 text-emerald-400" />
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
        <div className="flex items-center gap-3">
          <button
            id="btn-auth-settings"
            type="button"
            onClick={() => {
              if (onSettingsClick) onSettingsClick();
            }}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>
          <button
            id="btn-auth-notifications"
            type="button"
            onClick={() => {
              if (onNotificationClick) onNotificationClick();
            }}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>HIPAA Compliant</span>
        </div>
      </div>
    </motion.div>
  );
}
