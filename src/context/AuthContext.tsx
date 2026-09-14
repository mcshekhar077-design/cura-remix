import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, UserRole } from "../types";

export type ViewState = 
  | "landing" 
  | "dashboard" 
  | "admin" 
  | "patient" 
  | "pharmacy" 
  | "ayush" 
  | "mr" 
  | "mental_health" 
  | "cardiology" 
  | "pediatrics" 
  | "womens_health" 
  | "orthopedics" 
  | "dermatology" 
  | "neurology" 
  | "oncology" 
  | "emergency" 
  | "ent" 
  | "ai_core" 
  | "ophthalmology" 
  | "hematology" 
  | "nephrology" 
  | "rheumatology" 
  | "critical_care" 
  | "gastroenterology" 
  | "analytics" 
  | "dentistry" 
  | "physiology" 
  | "video_consultation" 
  | "care_navigation";

export interface DemoUserPreset {
  id: string;
  name: string;
  role: UserRole;
  clinicName: string;
  email: string;
  specialty?: string;
  icon: string;
  description: string;
}

export const DEMO_PRESETS: DemoUserPreset[] = [
  {
    id: "demo-doc-1",
    name: "Dr. Rajesh Sharma",
    role: "doctor",
    clinicName: "Sharma Multispecialty Care",
    email: "dr.sharma@cura.in",
    specialty: "Internal Medicine & Allopathy",
    icon: "👨‍⚕️",
    description: "General OPD, IPD, Prescription & CDSS Suite"
  },
  {
    id: "demo-pat-1",
    name: "Rajesh Kumar",
    role: "patient",
    clinicName: "Patient Mobile Portal",
    email: "rajesh.kumar@gmail.com",
    specialty: "Personal Health Records (ABHA ID: 91-4582-9012-3456)",
    icon: "📱",
    description: "Digital PHR, Prescription viewer & self-booking"
  },
  {
    id: "demo-ayush-1",
    name: "Dr. Priya Nair",
    role: "ayush_practitioner",
    clinicName: "Vaidya Ayurveda & Holistic Wellness",
    email: "dr.priya@ayush.cura.in",
    specialty: "Ayurveda & Nadi Pariksha",
    icon: "🌿",
    description: "Prakriti Assessment, Dosha balances & herbal dispensary"
  },
  {
    id: "demo-cardio-1",
    name: "Dr. Ananya Sen",
    role: "specialist",
    clinicName: "Apex Heart & Echo Centre",
    email: "dr.ananya@apexcardio.com",
    specialty: "Cardiology & Echo Suite",
    icon: "❤️",
    description: "ECG Telemetry, Echo viewer & Framingham Risk Calculator"
  },
  {
    id: "demo-pharm-1",
    name: "Vikram Patel (Chemist)",
    role: "pharmacist",
    clinicName: "MedPlus Central Pharmacy",
    email: "dispenser@medplus.cura.in",
    specialty: "Central Dispensing & Barcode POS",
    icon: "💊",
    description: "Real-time prescription dispensing & inventory alerts"
  },
  {
    id: "demo-admin-1",
    name: "Dr. K.S. Murthy (CMO)",
    role: "admin",
    clinicName: "CURA General Hospital Network",
    email: "admin@cura.in",
    specialty: "Clinical Governance & Leads CRM",
    icon: "🏥",
    description: "Hospital Operations, Staff Rostering & Lead Ingestion"
  },
  {
    id: "demo-mr-1",
    name: "Amit Verma (Pharma Rep)",
    role: "mr_representative",
    clinicName: "Sun Pharma & Biocon Alliances",
    email: "amit.verma@sunpharma.com",
    specialty: "Medical Representative Portal",
    icon: "🤝",
    description: "Doctor detailing, digital samples & referral tracking"
  }
];

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  intendedView: ViewState | null;
  intendedModuleTitle: string | null;
  openAuthModal: (targetView?: ViewState, moduleTitle?: string) => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    role?: UserRole;
    clinicName?: string;
    doctorCount?: string;
    abhaId?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithPreset: (preset: DemoUserPreset) => void;
  logout: () => void;
  executeGuardedAction: (targetView: ViewState, moduleTitle: string, navigateCallback: () => void) => void;
}

const AuthContextSyst = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "cura_auth_user_session_v3";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [intendedView, setIntendedView] = useState<ViewState | null>(null);
  const [intendedModuleTitle, setIntendedModuleTitle] = useState<string | null>(null);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save auth state to localStorage:", e);
    }
  }, [currentUser]);

  const openAuthModal = (targetView?: ViewState, moduleTitle?: string) => {
    if (targetView) setIntendedView(targetView);
    if (moduleTitle) setIntendedModuleTitle(moduleTitle);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const executeGuardedAction = (
    targetView: ViewState, 
    moduleTitle: string, 
    navigateCallback: () => void
  ) => {
    if (currentUser) {
      navigateCallback();
    } else {
      setIntendedView(targetView);
      setIntendedModuleTitle(moduleTitle);
      setPendingCallback(() => navigateCallback);
      setIsAuthModalOpen(true);
    }
  };

  const onAuthenticationSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    
    // Execute pending navigation if queued
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/v1/auth/universal-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          onAuthenticationSuccess(data.user);
          return { success: true };
        }
      }

      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.detail || errData.error || "Invalid credentials provided." };
    } catch (e: any) {
      return { success: false, error: "Network error: Unable to connect to authentication server." };
    }
  };

  const signup = async (payload: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    role?: UserRole;
    clinicName?: string;
    doctorCount?: string;
    abhaId?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/v1/auth/universal-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          onAuthenticationSuccess(data.user);
          return { success: true };
        }
      }

      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.detail || errData.error || "Signup failed. Please verify your details." };
    } catch {
      return { success: false, error: "Network error: Could not reach registration service." };
    }
  };

  const loginWithPreset = async (preset: DemoUserPreset) => {
    // Authenticate preset via server to acquire signed session token
    const presetPasswords: Record<string, string> = {
      "dr.sharma@cura.in": "CuraDoctor@2026!",
      "rajesh.kumar@gmail.com": "CuraPatient@2026!",
      "dr.priya@ayush.cura.in": "CuraAyush@2026!",
      "dr.ananya@apexcardio.com": "CuraSpecialist@2026!",
      "dispenser@medplus.cura.in": "CuraPharmacist@2026!",
      "admin@cura.in": "CuraAdmin@2026!",
      "amit.verma@sunpharma.com": "CuraMR@2026!"
    };

    const password = presetPasswords[preset.email] || "CuraDoctor@2026!";
    const res = await login(preset.email, password);
    if (!res.success) {
      console.warn("Preset server login failed, fallback to local preset identity:", res.error);
      const user: AuthUser = {
        id: preset.id,
        fullName: preset.name,
        email: preset.email,
        role: preset.role,
        clinicName: preset.clinicName,
        specialty: preset.specialty,
        phone: "+91 98765 43210",
        createdAt: new Date().toISOString()
      };
      onAuthenticationSuccess(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    try {
      fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  };

  return (
    <AuthContextSyst.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAuthModalOpen,
        intendedView,
        intendedModuleTitle,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        loginWithPreset,
        logout,
        executeGuardedAction
      }}
    >
      {children}
    </AuthContextSyst.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContextSyst);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
