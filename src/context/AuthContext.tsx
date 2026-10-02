import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, UserRole } from "../types";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile 
} from "firebase/auth";
import { auth } from "../firebase";

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
    email: "dr.sharma@clinitial.in",
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
    email: "dr.priya@ayush.clinitial.in",
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
    email: "dispenser@medplus.clinitial.in",
    specialty: "Central Dispensing & Barcode POS",
    icon: "💊",
    description: "Real-time prescription dispensing & inventory alerts"
  },
  {
    id: "demo-admin-1",
    name: "Dr. K.S. Murthy (CMO & Super Admin)",
    role: "admin",
    clinicName: "Clinitial Healthcare Operations & Hospital Network",
    email: "admin@clinitial.in",
    specialty: "Platform Administration & Multi-Tenant Governance",
    icon: "🏥",
    description: "Clinitial Admin OS: Tenants, AI Analytics, WhatsApp CRM, Revenue & Audit Logs"
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
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  intendedView: ViewState | null;
  intendedModuleTitle: string | null;
  roleMismatchError: string | null;
  clearRoleMismatchError: () => void;
  openAuthModal: (targetView?: ViewState, moduleTitle?: string) => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; role?: string }>;
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
  resetPasswordRequest: (email: string) => Promise<{ success: boolean; message?: string; resetCode?: string; resetToken?: string; error?: string }>;
  resetPasswordConfirm: (payload: { email: string; newPassword: string; resetCode?: string; token?: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  executeGuardedAction: (
    targetView: ViewState, 
    moduleTitle: string, 
    navigateCallback: () => void,
    requiredRole?: UserRole | "admin"
  ) => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContextSyst = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "clinitial_auth_user_session_v3";
const TOKEN_KEY = "clinitial_auth_token";

export const getAuthHeaders = (): Record<string, string> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const u = JSON.parse(cached);
      if (u.token) {
        return { Authorization: `Bearer ${u.token}` };
      }
    }
  } catch {
    // ignore
  }
  return {};
};

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
  const [roleMismatchError, setRoleMismatchError] = useState<string | null>(null);

  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === "admin" ||
      (currentUser as any).role === "super_admin" ||
      (currentUser as any).role === "hospital_admin"
    )
  );

  // Sync to local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        if (currentUser.token) {
          localStorage.setItem(TOKEN_KEY, currentUser.token);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error("Failed to save auth state to localStorage:", e);
    }
  }, [currentUser]);

  const openAuthModal = (targetView?: ViewState, moduleTitle?: string) => {
    if (targetView) setIntendedView(targetView);
    if (moduleTitle) setIntendedModuleTitle(moduleTitle);
    setRoleMismatchError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setRoleMismatchError(null);
  };

  const clearRoleMismatchError = () => {
    setRoleMismatchError(null);
  };

  const executeGuardedAction = (
    targetView: ViewState, 
    moduleTitle: string, 
    navigateCallback: () => void,
    requiredRole?: UserRole | "admin"
  ) => {
    const isTargetAdmin = targetView === "admin" || requiredRole === "admin";

    if (currentUser) {
      if (isTargetAdmin) {
        const userHasAdminPrivileges = 
          currentUser.role === "admin" || 
          (currentUser as any).role === "super_admin" || 
          (currentUser as any).role === "hospital_admin";

        if (userHasAdminPrivileges) {
          navigateCallback();
          return;
        } else {
          // Logged in as non-admin trying to access Admin Console
          setIntendedView(targetView);
          setIntendedModuleTitle("Clinitial Admin OS & Governance Console (Restricted)");
          setPendingCallback(() => navigateCallback);
          setRoleMismatchError(
            `Administrator authorization required. You are signed in as ${currentUser.fullName} (${currentUser.role}). Please authenticate with an Administrator account.`
          );
          setIsAuthModalOpen(true);
          return;
        }
      }
      navigateCallback();
    } else {
      setIntendedView(targetView);
      setIntendedModuleTitle(moduleTitle);
      setPendingCallback(() => navigateCallback);
      setRoleMismatchError(null);
      setIsAuthModalOpen(true);
    }
  };

  const onAuthenticationSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setRoleMismatchError(null);
    
    // Execute pending navigation if queued
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string; role?: string }> => {
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
          const userWithToken: AuthUser = {
            ...data.user,
            token: data.token || ""
          };
          if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
          }
          onAuthenticationSuccess(userWithToken);
          return { success: true, role: userWithToken.role };
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

  const resetPasswordRequest = async (email: string): Promise<{ success: boolean; message?: string; resetCode?: string; resetToken?: string; error?: string }> => {
    try {
      // Optional Firebase Auth client password reset trigger
      if (auth && email.includes("@")) {
        sendPasswordResetEmail(auth, email).catch(() => {
          // Benign if Firebase Email provider is not toggled in console
        });
      }

      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: data.message,
          resetCode: data.resetCode,
          resetToken: data.resetToken
        };
      }

      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || errData.error || "Failed to initiate password reset."
      };
    } catch {
      return {
        success: false,
        error: "Network error: Unable to contact password reset service."
      };
    }
  };

  const resetPasswordConfirm = async (payload: {
    email: string;
    newPassword: string;
    resetCode?: string;
    token?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          const userWithToken: AuthUser = {
            ...data.user,
            token: data.token || ""
          };
          if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
          }
          onAuthenticationSuccess(userWithToken);
        }
        return {
          success: true,
          message: data.message || "Password reset successful!"
        };
      }

      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || errData.error || "Password reset failed. Please verify your verification code."
      };
    } catch {
      return {
        success: false,
        error: "Network error: Unable to submit new password."
      };
    }
  };

  const loginWithPreset = async (preset: DemoUserPreset) => {
    // Authenticate preset via server to acquire signed session token
    const presetPasswords: Record<string, string> = {
      "dr.sharma@clinitial.in": "ClinitialDoctor@2026!",
      "dr.sharma@cura.in": "ClinitialDoctor@2026!",
      "rajesh.kumar@gmail.com": "ClinitialPatient@2026!",
      "dr.priya@ayush.clinitial.in": "ClinitialAyush@2026!",
      "dr.priya@ayush.cura.in": "ClinitialAyush@2026!",
      "dr.ananya@apexcardio.com": "ClinitialSpecialist@2026!",
      "dispenser@medplus.clinitial.in": "ClinitialPharmacist@2026!",
      "dispenser@medplus.cura.in": "ClinitialPharmacist@2026!",
      "admin@clinitial.in": "ClinitialAdmin@2026!",
      "admin@cura.in": "ClinitialAdmin@2026!",
      "amit.verma@sunpharma.com": "ClinitialMR@2026!"
    };

    const password = presetPasswords[preset.email] || "ClinitialDoctor@2026!";
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
        isAdmin,
        isAuthModalOpen,
        intendedView,
        intendedModuleTitle,
        roleMismatchError,
        clearRoleMismatchError,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        loginWithPreset,
        resetPasswordRequest,
        resetPasswordConfirm,
        logout,
        executeGuardedAction,
        getAuthHeaders
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
