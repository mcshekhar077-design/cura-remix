import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Plus, 
  UserPlus, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  Check, 
  X, 
  Phone, 
  Clock, 
  Calendar, 
  Send, 
  Printer, 
  FileCheck, 
  Share2, 
  Heart,
  Briefcase,
  ChevronRight,
  Database,
  Globe,
  User,
  Bell,
  Layers,
  XCircle,
  RefreshCw,
  Shield,
  Key,
  Terminal,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ShieldAlert,
  ArrowRight,
  Pill,
  Info,
  PlusCircle,
  Sliders,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { Patient, AISuggestion, Appointment } from "../types";
import HospitalImsSuite from "./HospitalImsSuite";
import { CalendarView } from "./CalendarView";
import TelemedicineCenter from "./TelemedicineCenter";
import { DoctorDocumentScanner } from "./DoctorDocumentScanner";
import HealthcareIntelligence from "./HealthcareIntelligence";
import ProductTour from "./ProductTour";
import MentalHealthConsult from "./MentalHealthConsult";
import CardiologySuite from "./CardiologySuite";
import PediatricsSuite from "./PediatricsSuite";
import WomensHealthSuite from "./WomensHealthSuite";
import OrthopedicsSuite from "./OrthopedicsSuite";
import DermatologySuite from "./DermatologySuite";
import NeurologySuite from "./NeurologySuite";
import OncologySuite from "./OncologySuite";
import EmergencySuite from "./EmergencySuite";
import ENTSuite from "./ENTSuite";
import SharedAICoreSuite from "./SharedAICoreSuite";
import OphthalmologySuite from "./OphthalmologySuite";
import HematologySuite from "./HematologySuite";
import NephrologySuite from "./NephrologySuite";
import RheumatologySuite from "./RheumatologySuite";
import CriticalCareSuite from "./CriticalCareSuite";
import GastroenterologySuite from "./GastroenterologySuite";
import AnalyticsSuite from "./AnalyticsSuite";
import { PmjaySuite } from "./PmjaySuite";

interface DoctorDashboardProps {
  onBackToLanding: () => void;
  initialMedicalSystem?: "allopathy" | "ayurveda" | "homeopathy" | "unani" | "siddha" | "yoga";
}

export default function DoctorDashboard({ onBackToLanding, initialMedicalSystem = "allopathy" }: DoctorDashboardProps) {
  // State
  const [medicalSystem, setMedicalSystem] = useState<"allopathy" | "ayurveda" | "homeopathy" | "unani" | "siddha" | "yoga">(initialMedicalSystem);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Clinical notes / symptoms input
  const [symptomsInput, setSymptomsInput] = useState("");
  
  // AI Suggestions State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState<AISuggestion | null>(null);
  const [aiEngine, setAiEngine] = useState<"gemini" | "deepseek" | "auto">("auto");

  // Active Prescription compilation
  const [activePrescriptions, setActivePrescriptions] = useState<Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    reason: string;
  }>>([]);
  const [customDiagnosis, setCustomDiagnosis] = useState("");
  const [selectedHistoryIndices, setSelectedHistoryIndices] = useState<number[]>([]);

  // === COMMERCIAL SAAS STATES ===
  const [activeTab, setActiveTab] = useState<"clinical" | "saas" | "frontoffice" | "enterprise" | "telemedicine" | "hims" | "intelligence" | "mental_health" | "cardiology" | "pediatrics" | "womens_health" | "orthopedics" | "dermatology" | "neurology" | "oncology" | "emergency" | "ent" | "ai_core" | "ophthalmology" | "hematology" | "nephrology" | "rheumatology" | "critical_care" | "gastroenterology" | "analytics">("clinical");
  const [tenantConfig, setTenantConfig] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // === ENTERPRISE SECURITY, COMPLIANCE & STRATEGIC ROADMAP STATES ===
  const [enterpriseSubTab, setEnterpriseSubTab] = useState<"audit" | "encryption" | "ai" | "tasks">("audit");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [rawDbPreview, setRawDbPreview] = useState<any[]>([]);
  const [promptVersions, setPromptVersions] = useState<any[]>([]);
  const [backgroundTasks, setBackgroundTasks] = useState<any[]>([]);
  const [abdmSearchAbha, setAbdmSearchAbha] = useState("");
  const [abdmRecordResult, setAbdmRecordResult] = useState<any | null>(null);
  const [abdmError, setAbdmError] = useState("");
  const [abdmSuccess, setAbdmSuccess] = useState("");
  const [activeTenantId, setActiveTenantId] = useState("tenant_default");
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [hitlEnabled, setHitlEnabled] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false); // Offline compliance test

  // === PM-JAY API SETU INTEGRATION IN PATIENT PROFILES ===
  const [isPmjayModalOpen, setIsPmjayModalOpen] = useState(false);
  const [patientPmjayMap, setPatientPmjayMap] = useState<Record<string, any>>({});
  const [pmjayFetchLoading, setPmjayFetchLoading] = useState(false);
  const [pmjayFetchError, setPmjayFetchError] = useState("");
  const [pmjayCustomIdInput, setPmjayCustomIdInput] = useState("PMJAY0000");
  const [pmjayFormatChoice, setPmjayFormatChoice] = useState<"pdf" | "json" | "xml">("pdf");

  const fetchPatientPmjayDetails = async (patientId: string, pmjayIdToFetch?: string) => {
    const idToUse = (pmjayIdToFetch || pmjayCustomIdInput || "PMJAY0000").trim().toUpperCase();
    setPmjayFetchLoading(true);
    setPmjayFetchError("");
    try {
      const res = await fetch("/api/v1/pmjay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-APIKey": "APISETU_BEARER_KEY_DEMO_2026"
        },
        body: JSON.stringify({
          txnId: `txn_profile_${Date.now()}`,
          format: pmjayFormatChoice,
          certificateParameters: {
            UDF1: idToUse
          },
          consentArtifact: {
            consent: {
              consentId: `consent_${Date.now()}`,
              timestamp: new Date().toISOString(),
              purpose: { description: "Hospital PM-JAY Insurance Details Verification" },
              user: { idType: "AADHAAR", idNumber: "XXXXXXXX1234" }
            },
            signature: { signature: "VERIFIED_HOSPITAL_PORTAL_SEAL" }
          }
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ errorDescription: "PM-JAY service returned error" }));
        setPmjayFetchError(errJson.errorDescription || `HTTP ${res.status} Error`);
      } else {
        if (pmjayFormatChoice === "xml") {
          const xmlText = await res.text();
          setPatientPmjayMap(prev => ({
            ...prev,
            [patientId]: {
              rawXml: xmlText,
              format: "xml",
              fetchedAt: new Date().toLocaleTimeString()
            }
          }));
        } else {
          const data = await res.json();
          setPatientPmjayMap(prev => ({
            ...prev,
            [patientId]: {
              ...data,
              format: pmjayFormatChoice,
              fetchedAt: new Date().toLocaleTimeString()
            }
          }));
        }
      }
    } catch (err: any) {
      setPmjayFetchError(err?.message || "Failed to connect to API Setu gateway");
    } finally {
      setPmjayFetchLoading(false);
    }
  };

  // === DPDP ACT RBAC & mfa STATES ===
  const [activeUserRole, setActiveUserRole] = useState<"doctor" | "receptionist" | "compliance">("doctor");
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");

  const fetchRbacStates = async () => {
    try {
      const res = await fetch("/api/v1/enterprise/rbac");
      if (res.ok) {
        const d = await res.json();
        setActiveUserRole(d.role);
        setMfaEnforced(d.mfaEnforced);
        setMfaVerified(d.mfaVerified);
      }
    } catch (e) {
      console.error("Failed to fetch RBAC states", e);
    }
  };

  const updateRbacRole = async (role: "doctor" | "receptionist" | "compliance") => {
    try {
      const res = await fetch("/api/v1/enterprise/rbac/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        const d = await res.json();
        setActiveUserRole(d.role);
        setSuccessMsg(`Role re-mapped to: ${role.toUpperCase()}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchPatients();
        await fetchEnterpriseStates();
      }
    } catch (e) {
      console.error("Failed to update role", e);
    }
  };

  const toggleMfaEnforcement = async () => {
    try {
      const res = await fetch("/api/v1/enterprise/rbac/toggle-mfa", {
        method: "POST"
      });
      if (res.ok) {
        const d = await res.json();
        setMfaEnforced(d.mfaEnforced);
        setMfaVerified(d.mfaVerified);
        setSuccessMsg(`MFA Enforcement: ${d.mfaEnforced ? "ENABLED" : "DISABLED"}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchEnterpriseStates();
      }
    } catch (e) {
      console.error("Failed to toggle MFA", e);
    }
  };

  const verifyMfaCode = async (code: string) => {
    try {
      setMfaError("");
      const res = await fetch("/api/v1/enterprise/rbac/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        setMfaVerified(true);
        setMfaCode("");
        setSuccessMsg("MFA code verified. Session unlocked.");
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchEnterpriseStates();
      } else {
        const d = await res.json();
        setMfaError(d.detail || "Incorrect MFA code.");
      }
    } catch (e) {
      console.error("Failed to verify MFA", e);
    }
  };

  const resetMfaSession = async () => {
    try {
      const res = await fetch("/api/v1/enterprise/rbac/reset-mfa-session", {
        method: "POST"
      });
      if (res.ok) {
        setMfaVerified(false);
        await fetchEnterpriseStates();
      }
    } catch (e) {
      console.error("Failed to reset MFA session", e);
    }
  };
  const getSignatureForSystem = (sys: string) => {
    if (sys === "allopathy") return "Dr. Rajesh Sharma, MD, FACC";
    if (sys === "ayurveda") return "Vaidya Rajesh Sharma, BAMS (Ayurvedacharya)";
    if (sys === "homeopathy") return "Dr. Rajesh Sharma, BHMS (Homeopath)";
    if (sys === "unani") return "Hakim Rajesh Sharma, BUMS (Unani Specialist)";
    if (sys === "siddha") return "Siddhar Rajesh Sharma, BSMS (Siddha Varmam Specialist)";
    if (sys === "yoga") return "Yogacharya Rajesh Sharma, DNYS (Naturopathy)";
    return "Dr. Rajesh Sharma, MD, FACC";
  };

  const [doctorSignature, setDoctorSignature] = useState(getSignatureForSystem(initialMedicalSystem)); // HITL Signature
  const [doctorSignatureInput, setDoctorSignatureInput] = useState(getSignatureForSystem(initialMedicalSystem));
  
  // Doctor RMP Profile and Onboarding state
  const [doctorProfile, setDoctorProfile] = useState<{
    fullName: string;
    qualification: string;
    registrationNumber: string;
    medicalCouncil: string;
    yearsOfExperience: string;
    isVerified: boolean;
    licenseFileUploaded: string;
  }>({
    fullName: "Dr. Rajesh Sharma",
    qualification: "MD, FACC",
    registrationNumber: "MCI-18452-A",
    medicalCouncil: "National Medical Commission (NMC)",
    yearsOfExperience: "15",
    isVerified: false,
    licenseFileUploaded: ""
  });
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const [isOnboardingVerifying, setIsOnboardingVerifying] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");
  const [onboardingSuccess, setOnboardingSuccess] = useState(false);
  const [onboardingFile, setOnboardingFile] = useState<any>(null);
  const [onboardingFileName, setOnboardingFileName] = useState("");
  const [onboardingDragOver, setOnboardingDragOver] = useState(false);

  // Form fields for onboarding
  const [obName, setObName] = useState("Dr. Rajesh Sharma");
  const [obQual, setObQual] = useState("MD, FACC");
  const [obRegNo, setObRegNo] = useState("MCI-18452-A");
  const [obCouncil, setObCouncil] = useState("National Medical Commission (NMC)");
  const [obExp, setObExp] = useState("15");
  const [obAgreed, setObAgreed] = useState(false);
  const [obFeedbackMsg, setObFeedbackMsg] = useState("");

  const fetchDoctorProfile = async () => {
    try {
      const res = await fetch("/api/v1/doctor/profile");
      if (res.ok) {
        const data = await res.json();
        setDoctorProfile(data);
        if (data.fullName) {
          setObName(data.fullName);
          setObQual(data.qualification);
          setObRegNo(data.registrationNumber);
          setObCouncil(data.medicalCouncil);
          setObExp(data.yearsOfExperience);
          setDoctorSignature(`${data.fullName}, ${data.qualification} (Reg #${data.registrationNumber})`);
          setDoctorSignatureInput(`${data.fullName}, ${data.qualification} (Reg #${data.registrationNumber})`);
        }
      }
    } catch (e) {
      console.error("Failed to fetch doctor profile", e);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obAgreed) {
      setOnboardingError("You must accept the AI Decision-Support and clinical responsibility agreement to proceed.");
      return;
    }
    if (!obName.trim() || !obQual.trim() || !obRegNo.trim() || !obCouncil.trim()) {
      setOnboardingError("Please fill out all required fields.");
      return;
    }
    
    setIsOnboardingVerifying(true);
    setOnboardingError("");
    setObFeedbackMsg("Verifying RMP license with National Medical Registry...");
    
    // Simulate real-time NMC query challenge-handshake
    await new Promise(resolve => setTimeout(resolve, 1500));
    setObFeedbackMsg("Active license state matched in central NMC directory! Stamping EHR credentials...");
    await new Promise(resolve => setTimeout(resolve, 1200));
    setObFeedbackMsg("Setting up secure HL7/ABDM clinician registry node... Done.");
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const res = await fetch("/api/v1/doctor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: obName,
          qualification: obQual,
          registrationNumber: obRegNo,
          medicalCouncil: obCouncil,
          yearsOfExperience: obExp,
          licenseFileUploaded: onboardingFileName || "rmp_license_submitted.pdf"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDoctorProfile(data);
        setOnboardingSuccess(true);
        setSuccessMsg("Welcome Dr. " + data.fullName + "! RMP Telemedicine Onboarding verified successfully.");
        setDoctorSignature(`${data.fullName}, ${data.qualification} (Reg #${data.registrationNumber})`);
        setDoctorSignatureInput(`${data.fullName}, ${data.qualification} (Reg #${data.registrationNumber})`);
      } else {
        const errData = await res.json();
        setOnboardingError(errData.detail || "Failed to submit onboarding profile.");
      }
    } catch (err) {
      setOnboardingError("Network failure connecting to RMP registry server.");
    } finally {
      setIsOnboardingVerifying(false);
      setObFeedbackMsg("");
    }
  };
  
  // AI Router Settings State
  const [aiPreference, setAiPreference] = useState<"auto" | "gemini" | "deepseek">("auto");
  const [aiFallbackEnabled, setAiFallbackEnabled] = useState(true);
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(0.7);

  // === HOSPITAL IMS STATES ===
  const [himsSubTab, setHimsSubTab] = useState<"ipd" | "ot" | "rcm" | "nabh" | "emergency" | "nursing" | "ward" | "radiology" | "bloodBank" | "cathLab" | "geofencing" | "multilocation">("ipd");
  const [wards, setWards] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [ots, setOts] = useState<any[]>([]);
  const [otSchedules, setOtSchedules] = useState<any[]>([]);
  const [insuranceProviders, setInsuranceProviders] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [nabhStandards, setNabhStandards] = useState<any[]>([]);
  const [complianceAudits, setComplianceAudits] = useState<any[]>([]);
  const [emergencyCases, setEmergencyCases] = useState<any[]>([]);

  const fetchHimsStates = async () => {
    try {
      const [rWards, rBeds, rAdmissions, rOts, rSchedules, rProviders, rClaims, rStandards, rAudits, rEmergency] = await Promise.all([
        fetch("/api/v1/hims/wards"),
        fetch("/api/v1/hims/beds"),
        fetch("/api/v1/hims/admissions"),
        fetch("/api/v1/hims/ots"),
        fetch("/api/v1/hims/ot-schedules"),
        fetch("/api/v1/hims/insurance-providers"),
        fetch("/api/v1/hims/claims"),
        fetch("/api/v1/hims/nabh-standards"),
        fetch("/api/v1/hims/compliance-audits"),
        fetch("/api/v1/hims/emergency-cases")
      ]);
      if (rWards.ok) setWards(await rWards.json());
      if (rBeds.ok) setBeds(await rBeds.json());
      if (rAdmissions.ok) setAdmissions(await rAdmissions.json());
      if (rOts.ok) setOts(await rOts.json());
      if (rSchedules.ok) setOtSchedules(await rSchedules.json());
      if (rProviders.ok) setInsuranceProviders(await rProviders.json());
      if (rClaims.ok) setClaims(await rClaims.json());
      if (rStandards.ok) setNabhStandards(await rStandards.json());
      if (rAudits.ok) setComplianceAudits(await rAudits.json());
      if (rEmergency.ok) setEmergencyCases(await rEmergency.json());
    } catch (e) {
      console.error("Failed to load HIMS states", e);
    }
  };
  
  const [isSigningRx, setIsSigningRx] = useState(false);
  const [isRxSigned, setIsRxSigned] = useState(false);

  // === RECEPTIONIST / FRONT OFFICE ONBOARDING STATES ===
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recFullName, setRecFullName] = useState("");
  const [recPhone, setRecPhone] = useState("");
  const [recEmail, setRecEmail] = useState("");
  const [recDob, setRecDob] = useState("");
  const [recGender, setRecGender] = useState<"Male" | "Female" | "Other">("Male");
  const [recBloodGroup, setRecBloodGroup] = useState("O+");
  const [recAllergies, setRecAllergies] = useState("");
  const [recMeds, setRecMeds] = useState("");
  const [recEmergencyContact, setRecEmergencyContact] = useState("");
  const [recAddress, setRecAddress] = useState("");
  const [recPincode, setRecPincode] = useState("");
  const [recCity, setRecCity] = useState("");
  const [recState, setRecState] = useState("");
  const [recAbhaId, setRecAbhaId] = useState("");

  const [onboardingSuccessPatient, setOnboardingSuccessPatient] = useState<Patient | null>(null);
  const [isRegisteringRec, setIsRegisteringRec] = useState(false);

  // Appointment Scheduling States
  const [schedPatientId, setSchedPatientId] = useState("");
  const [schedPatientName, setSchedPatientName] = useState("");
  const [schedPatientCode, setSchedPatientCode] = useState("");
  const [schedPhone, setSchedPhone] = useState("");
  const [schedDoctorName, setSchedDoctorName] = useState("Dr. Rajesh Sharma");
  const [schedAt, setSchedAt] = useState("");
  const [schedType, setSchedType] = useState<"in_person" | "video" | "voice">("in_person");
  const [schedReason, setSchedReason] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedSuccessMsg, setSchedSuccessMsg] = useState("");

  // === AUTOMATED SCHEDULER STATES ===
  const [frontOfficeSubTab, setFrontOfficeSubTab] = useState<"queue" | "scheduler" | "calendar">("queue");
  const [schedulerActiveTab, setSchedulerActiveTab] = useState<"follow_up" | "medication" | "pending" | "rules">("follow_up");
  const [schedulerMessages, setSchedulerMessages] = useState<any[]>([]);
  const [schedulerRules, setSchedulerRules] = useState<any[]>([]);
  
  // Follow-Up Scheduler States
  const [schedFollowUpPatientId, setSchedFollowUpPatientId] = useState("");
  const [schedFollowUpDoctor, setSchedFollowUpDoctor] = useState("Dr. Rajesh Sharma");
  const [schedFollowUpDate, setSchedFollowUpDate] = useState("");
  const [schedFollowUpReason, setSchedFollowUpReason] = useState("");
  const [isSchedulingFollowUp, setIsSchedulingFollowUp] = useState(false);
  const [followUpSuccessMsg, setFollowUpSuccessMsg] = useState("");

  // Medication Scheduler States
  const [schedMedicationPatientId, setSchedMedicationPatientId] = useState("");
  const [schedMedicationName, setSchedMedicationName] = useState("");
  const [schedMedicationDosage, setSchedMedicationDosage] = useState("");
  const [schedMedicationTime, setSchedMedicationTime] = useState("09:00");
  const [schedMedicationInstructions, setSchedMedicationInstructions] = useState("");
  const [isSchedulingMedication, setIsSchedulingMedication] = useState(false);
  const [medicationSuccessMsg, setMedicationSuccessMsg] = useState("");

  // Rules Scheduler States
  const [schedRuleName, setSchedRuleName] = useState("");
  const [schedRuleType, setSchedRuleType] = useState<"appointment" | "reminder" | "follow_up" | "medication" | "lab_report" | "feedback" | "health_tip" | "payment" | "custom">("appointment");
  const [schedRuleTriggerHours, setSchedRuleTriggerHours] = useState("24");
  const [schedRuleTemplate, setSchedRuleTemplate] = useState("APPOINTMENT_REMINDER");
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [ruleSuccessMsg, setRuleSuccessMsg] = useState("");

  // Print ID Card Modal States
  const [showPrintCardPatient, setShowPrintCardPatient] = useState<Patient | null>(null);

  // White-label Forms
  const [brandingClinicName, setBrandingClinicName] = useState("");
  const [brandingLogoUrl, setBrandingLogoUrl] = useState("");
  const [brandingPrimaryColor, setBrandingPrimaryColor] = useState("#0ea5e9");
  const [brandingCustomDomain, setBrandingCustomDomain] = useState("");

  // Advanced White Label Settings
  const [wlLevel, setWlLevel] = useState<"semi" | "full" | "mobile" | "enterprise">("semi");
  const [wlLogoDarkUrl, setWlLogoDarkUrl] = useState("");
  const [wlFaviconUrl, setWlFaviconUrl] = useState("");
  const [wlLoginPageLogo, setWlLoginPageLogo] = useState("");
  const [wlSecondaryColor, setWlSecondaryColor] = useState("#10b981");
  const [wlTertiaryColor, setWlTertiaryColor] = useState("#0c4a6e");
  const [wlBackgroundColor, setWlBackgroundColor] = useState("#ffffff");
  const [wlFontFamily, setWlFontFamily] = useState("Inter");
  const [wlCompanyTagline, setWlCompanyTagline] = useState("");
  const [wlEmailFromName, setWlEmailFromName] = useState("");
  const [wlEmailFromAddress, setWlEmailFromAddress] = useState("");
  const [wlEmailFooterText, setWlEmailFooterText] = useState("");
  const [wlSidebarModules, setWlSidebarModules] = useState<Array<{ id: string; label: string; icon: string; visible: boolean }>>([]);
  const [wlPrivacyPolicyUrl, setWlPrivacyPolicyUrl] = useState("");
  const [wlTermsOfServiceUrl, setWlTermsOfServiceUrl] = useState("");
  const [wlSupportUrl, setWlSupportUrl] = useState("");
  const [wlSupportEmail, setWlSupportEmail] = useState("");
  const [wlMobileAppName, setWlMobileAppName] = useState("");
  const [wlMobileAppIcon, setWlMobileAppIcon] = useState("");
  const [wlMobileAppSplashScreen, setWlMobileAppSplashScreen] = useState("");
  const [wlMobileAppIosUrl, setWlMobileAppIosUrl] = useState("");
  const [wlMobileAppAndroidUrl, setWlMobileAppAndroidUrl] = useState("");
  const [wlEnableSso, setWlEnableSso] = useState(false);
  const [wlSsoProvider, setWlSsoProvider] = useState("google");
  const [wlSsoClientId, setWlSsoClientId] = useState("");
  const [wlSsoClientSecret, setWlSsoClientSecret] = useState("");
  const [wlSsoRedirectUri, setWlSsoRedirectUri] = useState("");
  const [wlEnableSubOrganizations, setWlEnableSubOrganizations] = useState(true);

  const [wlSubOrganizations, setWlSubOrganizations] = useState<any[]>([]);
  const [whitelabelSubTab, setWhitelabelSubTab] = useState<"branding" | "domain" | "sidebar" | "email-mobile" | "sso" | "franchises">("branding");

  // Franchise Form States
  const [newFranchiseName, setNewFranchiseName] = useState("");
  const [newFranchiseSubdomain, setNewFranchiseSubdomain] = useState("");
  const [newFranchiseLogo, setNewFranchiseLogo] = useState("");
  const [newFranchisePrimary, setNewFranchisePrimary] = useState("#0ea5e9");
  const [newFranchiseSecondary, setNewFranchiseSecondary] = useState("#10b981");
  const [newFranchiseAdminEmail, setNewFranchiseAdminEmail] = useState("");

  // Pluggable WhatsApp Gateway Forms
  const [whatsappGateway, setWhatsappGateway] = useState<"simulated" | "custom">("simulated");
  const [whatsappEndpoint, setWhatsappEndpoint] = useState("");
  const [whatsappKey, setWhatsappKey] = useState("");

  // Checkout Simulator Modal States
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [cardName, setCardName] = useState("Dr. Rajesh Sharma");

  // Modal States
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappSentMessage, setWhatsappSentMessage] = useState("");

  // New Patient Form state
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState<"Male" | "Female" | "Other">("Male");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [newPatientBlood, setNewPatientBlood] = useState("O+");
  const [newPatientAllergies, setNewPatientAllergies] = useState("");
  const [newPatientMeds, setNewPatientMeds] = useState("");

  // Fetch patients on mount or search
  const fetchPatients = async (query = "") => {
    try {
      const url = query ? `/api/v1/patients?q=${encodeURIComponent(query)}` : "/api/v1/patients";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
        if (data.length > 0 && !selectedPatient) {
          // Default select first patient
          setSelectedPatient(data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch patients", e);
    }
  };

  const fetchEnterpriseStates = async () => {
    try {
      // 0. Fetch RBAC states
      await fetchRbacStates();

      const safeFetch = async (url: string, name: string) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.warn(`[fetchEnterpriseStates] ${name} returned status ${res.status}`);
            return null;
          }
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (err) {
            console.error(`[fetchEnterpriseStates] Failed to parse JSON for ${name} (${url}). Content:`, text.substring(0, 150));
            return null;
          }
        } catch (err) {
          console.error(`[fetchEnterpriseStates] Network error for ${name} (${url})`, err);
          return null;
        }
      };

      // 1. Audit logs
      const dAud = await safeFetch("/api/v1/enterprise/audit-logs", "audit-logs");
      if (dAud) setAuditLogs(dAud);

      // 2. Encryption
      const dEnc = await safeFetch("/api/v1/enterprise/encryption", "encryption");
      if (dEnc) {
        setEncryptionEnabled(dEnc.enabled);
        setRawDbPreview(dEnc.rawDbPreview);
      }

      // 3. Prompts
      const dPrm = await safeFetch("/api/v1/enterprise/prompts", "prompts");
      if (dPrm) setPromptVersions(dPrm);

      // 4. Background tasks
      const dTsk = await safeFetch("/api/v1/enterprise/tasks", "tasks");
      if (dTsk) setBackgroundTasks(dTsk);

      // 5. Tenant isolation switcher info
      const dTen = await safeFetch("/api/v1/enterprise/tenant-isolation", "tenant-isolation");
      if (dTen) {
        setActiveTenantId(dTen.activeTenantId);
        setTenantsList(dTen.tenants);
      }

      // 6. HITL control status
      const dHitl = await safeFetch("/api/v1/enterprise/hitl", "hitl");
      if (dHitl) {
        setHitlEnabled(dHitl.enabled);
      }

      // 7. Doctor AI Router Settings
      const dAiPref = await safeFetch("/api/v1/doctor/ai-engine", "ai-engine");
      if (dAiPref) {
        setAiPreference(dAiPref.preference);
        setAiFallbackEnabled(dAiPref.fallbackEnabled);
        setAiConfidenceThreshold(dAiPref.confidenceThreshold);
      }
    } catch (e) {
      console.error("Failed to load enterprise states", e);
    }
  };

  const toggleEncryption = async () => {
    try {
      const res = await fetch("/api/v1/enterprise/encryption/toggle", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setEncryptionEnabled(d.enabled);
        fetchEnterpriseStates();
        fetchPatients(); // Refetch patient store
        setSuccessMsg(`Database row-level storage encryption is now ${d.enabled ? "ENABLED (AES-256 Mocked)" : "DISABLED"}`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearAuditLogs = async () => {
    try {
      const res = await fetch("/api/v1/enterprise/audit-logs", { method: "DELETE" });
      if (res.ok) {
        setAuditLogs([]);
        setSuccessMsg("Security audit log has been scrubbed & re-initialized.");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleHitlSetting = async () => {
    try {
      const res = await fetch("/api/v1/enterprise/hitl/toggle", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setHitlEnabled(d.enabled);
        setSuccessMsg(`Clinical Human-in-the-Loop validation constraints ${d.enabled ? "ENABLED" : "DISABLED"}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveAiRouterSettings = async (pref: "auto" | "gemini" | "deepseek", fallback: boolean, threshold: number) => {
    try {
      const res = await fetch("/api/v1/doctor/ai-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preference: pref,
          fallbackEnabled: fallback,
          confidenceThreshold: threshold
        })
      });
      if (res.ok) {
        const d = await res.json();
        setAiPreference(d.preference);
        setAiFallbackEnabled(d.fallbackEnabled);
        setAiConfidenceThreshold(d.confidenceThreshold);
        setSuccessMsg("AI Engine Router settings updated and logged!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error("Failed to save AI router preferences", e);
    }
  };

  const switchTenant = async (tenantId: string) => {
    try {
      const res = await fetch("/api/v1/enterprise/tenant-isolation/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId })
      });
      if (res.ok) {
        const d = await res.json();
        setActiveTenantId(d.activeTenantId);
        fetchPatients(); // patientStore completely swaps out
        fetchEnterpriseStates();
        setSelectedPatient(null); // Clear selected patient
        setSuccessMsg(`Switched isolation container. Displaying virtual patient pool for tenant: ${tenantId}`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activatePromptVersion = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/enterprise/prompts/${id}/activate`, { method: "POST" });
      if (res.ok) {
        fetchEnterpriseStates();
        setSuccessMsg("System AI prompt updated. Ready to generate clinical prescriptions.");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerBackgroundTick = async () => {
    try {
      const res = await fetch("/api/v1/enterprise/tasks/tick", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setBackgroundTasks(d);
        fetchTenantConfig(); // update usage counter
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addBackgroundTask = async (type: string, payload: any) => {
    try {
      const res = await fetch("/api/v1/enterprise/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload })
      });
      if (res.ok) {
        fetchEnterpriseStates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const searchAbdmRecords = async () => {
    if (!abdmSearchAbha) return;
    setAbdmError("");
    setAbdmRecordResult(null);
    try {
      const res = await fetch(`/api/v1/enterprise/abdm/records/${abdmSearchAbha}`);
      if (res.ok) {
        const d = await res.json();
        setAbdmRecordResult(d);
      } else {
        setAbdmError("No patient record matching this ABHA ID is registered on external NDHM networks.");
      }
    } catch (e) {
      setAbdmError("Error looking up National Digital Health Network.");
    }
  };

  const linkAbdmRecord = async (abhaId: string, patientId: string) => {
    try {
      const res = await fetch("/api/v1/enterprise/abdm/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abhaId, patientId })
      });
      if (res.ok) {
        setAbdmSuccess("Successfully synchronized external medical history from NDHM gateway into local EMR file!");
        setAbdmRecordResult(null);
        fetchPatients();
        fetchEnterpriseStates();
        setTimeout(() => setAbdmSuccess(""), 5000);
      } else {
        const err = await res.json();
        setAbdmError(err.detail || "Failed to link records.");
      }
    } catch (e) {
      setAbdmError("Critical error syncing ABDM registry files.");
    }
  };

  const fetchTenantConfig = async () => {
    try {
      const res = await fetch("/api/v1/tenant/config");
      if (res.ok) {
        const data = await res.json();
        setTenantConfig(data.config);
        setLimits(data.limits);

        // Pre-fill forms
        setBrandingClinicName(data.config.branding.clinicName || "");
        setBrandingLogoUrl(data.config.branding.logoUrl || "");
        setBrandingPrimaryColor(data.config.branding.primaryColor || "#0ea5e9");
        setBrandingCustomDomain(data.config.branding.customDomain || "");

        setWhatsappGateway(data.config.whatsapp.gateway || "simulated");
        setWhatsappEndpoint(data.config.whatsapp.apiEndpoint || "");
        setWhatsappKey(data.config.whatsapp.apiKey || "");

        // Dynamically apply primary color!
        document.documentElement.style.setProperty("--color-cura-primary", data.config.branding.primaryColor);
        document.documentElement.style.setProperty("--cura-primary", data.config.branding.primaryColor);
      }
    } catch (e) {
      console.error("Failed to fetch tenant configuration", e);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlert(null);
    setSuccessMsg(null);
    try {
      const response = await fetch("/api/v1/tenant/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branding: {
            clinicName: brandingClinicName,
            logoUrl: brandingLogoUrl,
            primaryColor: brandingPrimaryColor,
            customDomain: brandingCustomDomain
          },
          whatsapp: {
            gateway: whatsappGateway,
            apiEndpoint: whatsappEndpoint,
            apiKey: whatsappKey
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTenantConfig(data.config);
        setSuccessMsg("Settings saved! Branding theme and custom WhatsApp gateway configured successfully.");
        setTimeout(() => setSuccessMsg(null), 4000);
        
        // Dynamically apply primary color
        document.documentElement.style.setProperty("--color-cura-primary", data.config.branding.primaryColor);
        document.documentElement.style.setProperty("--cura-primary", data.config.branding.primaryColor);
      } else {
        const err = await response.json();
        setErrorAlert(err.detail || "Failed to save configuration.");
      }
    } catch (e) {
      console.error(e);
      setErrorAlert("Network error saving configuration.");
    }
  };

  const fetchWhitelabelData = async () => {
    try {
      // 1. Fetch Config
      const rConf = await fetch("/api/v1/whitelabel/config");
      if (rConf.ok) {
        const res = await rConf.json();
        const d = res.data;
        if (d) {
          setWlLevel(d.level || "semi");
          setWlLogoDarkUrl(d.logoDarkUrl || "");
          setWlFaviconUrl(d.faviconUrl || "");
          setWlLoginPageLogo(d.loginPageLogo || "");
          setWlSecondaryColor(d.secondaryColor || "#10b981");
          setWlTertiaryColor(d.tertiaryColor || "#0c4a6e");
          setWlBackgroundColor(d.backgroundColor || "#ffffff");
          setWlFontFamily(d.fontFamily || "Inter");
          setWlCompanyTagline(d.companyTagline || "");
          setWlEmailFromName(d.emailFromName || "");
          setWlEmailFromAddress(d.emailFromAddress || "");
          setWlEmailFooterText(d.emailFooterText || "");
          setWlSidebarModules(d.sidebarConfig?.modules || []);
          setWlPrivacyPolicyUrl(d.privacyPolicyUrl || "");
          setWlTermsOfServiceUrl(d.termsOfServiceUrl || "");
          setWlSupportUrl(d.supportUrl || "");
          setWlSupportEmail(d.supportEmail || "");
          setWlMobileAppName(d.mobileAppName || "");
          setWlMobileAppIcon(d.mobileAppIcon || "");
          setWlMobileAppSplashScreen(d.mobileAppSplashScreen || "");
          setWlMobileAppIosUrl(d.mobileAppStoreUrls?.ios || "");
          setWlMobileAppAndroidUrl(d.mobileAppStoreUrls?.android || "");
          setWlEnableSso(d.enableSso || false);
          setWlSsoProvider(d.ssoProvider || "google");
          setWlSsoClientId(d.ssoClientId || "");
          setWlSsoClientSecret(d.ssoClientSecret || "");
          setWlSsoRedirectUri(d.ssoRedirectUri || "");
          setWlEnableSubOrganizations(d.enableSubOrganizations !== false);
        }
      }

      // 2. Fetch Sub-Organizations
      const rSub = await fetch("/api/v1/whitelabel/sub-organizations");
      if (rSub.ok) {
        const res = await rSub.json();
        setWlSubOrganizations(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch white-label configurations", err);
    }
  };

  const handleSaveWhitelabelConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlert(null);
    setSuccessMsg(null);
    try {
      const response = await fetch("/api/v1/whitelabel/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: wlLevel,
          logoUrl: brandingLogoUrl,
          logoDarkUrl: wlLogoDarkUrl,
          faviconUrl: wlFaviconUrl,
          loginPageLogo: wlLoginPageLogo,
          primaryColor: brandingPrimaryColor,
          secondaryColor: wlSecondaryColor,
          tertiaryColor: wlTertiaryColor,
          backgroundColor: wlBackgroundColor,
          fontFamily: wlFontFamily,
          customDomain: brandingCustomDomain,
          companyName: brandingClinicName,
          companyTagline: wlCompanyTagline,
          emailFromName: wlEmailFromName,
          emailFromAddress: wlEmailFromAddress,
          emailFooterText: wlEmailFooterText,
          privacyPolicyUrl: wlPrivacyPolicyUrl,
          termsOfServiceUrl: wlTermsOfServiceUrl,
          supportUrl: wlSupportUrl,
          supportEmail: wlSupportEmail,
          mobileAppName: wlMobileAppName,
          mobileAppIcon: wlMobileAppIcon,
          mobileAppSplashScreen: wlMobileAppSplashScreen,
          mobileAppStoreUrls: { ios: wlMobileAppIosUrl, android: wlMobileAppAndroidUrl },
          enableSso: wlEnableSso,
          ssoProvider: wlSsoProvider,
          ssoClientId: wlSsoClientId,
          ssoClientSecret: wlSsoClientSecret,
          ssoRedirectUri: wlSsoRedirectUri,
          enableSubOrganizations: wlEnableSubOrganizations,
          sidebarConfig: { modules: wlSidebarModules }
        })
      });

      if (response.ok) {
        setSuccessMsg("White-label branding parameters compiled and synced successfully!");
        setTimeout(() => setSuccessMsg(null), 4000);
        
        // Dynamically apply primary color
        document.documentElement.style.setProperty("--color-cura-primary", brandingPrimaryColor);
        document.documentElement.style.setProperty("--cura-primary", brandingPrimaryColor);
        
        // Refresh
        fetchWhitelabelData();
        fetchTenantConfig();
      } else {
        const err = await response.json();
        setErrorAlert(err.detail || "Failed to save white-label configurations.");
      }
    } catch (err) {
      console.error(err);
      setErrorAlert("Network error saving white-label configuration.");
    }
  };

  const handleVerifyDomain = async () => {
    if (!brandingCustomDomain) {
      setErrorAlert("Please specify a custom domain before verifying.");
      return;
    }
    setErrorAlert(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/v1/whitelabel/domain/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: brandingCustomDomain })
      });
      if (res.ok) {
        setSuccessMsg(`Domain ${brandingCustomDomain} CNAME routing verified! Active branding deployed.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchWhitelabelData();
      } else {
        const err = await res.json();
        setErrorAlert(err.detail || "Domain verification failed.");
      }
    } catch (err) {
      setErrorAlert("Network error during domain verification.");
    }
  };

  const handleCreateFranchise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFranchiseName || !newFranchiseSubdomain || !newFranchiseAdminEmail) {
      setErrorAlert("Name, subdomain, and admin email are required for franchises.");
      return;
    }
    setErrorAlert(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/v1/whitelabel/sub-organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFranchiseName,
          subdomain: newFranchiseSubdomain,
          logo_url: newFranchiseLogo,
          primary_color: newFranchisePrimary,
          secondary_color: newFranchiseSecondary,
          admin_email: newFranchiseAdminEmail
        })
      });
      if (res.ok) {
        setSuccessMsg(`Franchise "${newFranchiseName}" successfully initialized! Custom branding overrides deployed.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        
        // Reset form
        setNewFranchiseName("");
        setNewFranchiseSubdomain("");
        setNewFranchiseLogo("");
        setNewFranchisePrimary("#0ea5e9");
        setNewFranchiseSecondary("#10b981");
        setNewFranchiseAdminEmail("");

        // Refresh list
        fetchWhitelabelData();
      } else {
        const err = await res.json();
        setErrorAlert(err.detail || "Failed to register franchise.");
      }
    } catch (err) {
      setErrorAlert("Network error registering franchise.");
    }
  };

  const moveSidebarModuleUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...wlSidebarModules];
    const temp = arr[idx];
    arr[idx] = arr[idx - 1];
    arr[idx - 1] = temp;
    setWlSidebarModules(arr);
  };

  const moveSidebarModuleDown = (idx: number) => {
    if (idx === wlSidebarModules.length - 1) return;
    const arr = [...wlSidebarModules];
    const temp = arr[idx];
    arr[idx] = arr[idx + 1];
    arr[idx + 1] = temp;
    setWlSidebarModules(arr);
  };

  const toggleSidebarModuleVisible = (idx: number) => {
    const arr = [...wlSidebarModules];
    arr[idx] = { ...arr[idx], visible: !arr[idx].visible };
    setWlSidebarModules(arr);
  };

  const handleUpgradeTier = async () => {
    if (!checkoutTier) return;
    setIsProcessingPayment(true);
    setErrorAlert(null);

    // Randomly choose gateway to showcase both Stripe and Razorpay flows in the demo
    const gateway = Math.random() > 0.5 ? "stripe" : "razorpay";

    try {
      // Step 1: Initiate payment order in the backend database
      const checkoutResponse = await fetch("/api/v1/subscription/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: checkoutTier, gateway })
      });

      if (!checkoutResponse.ok) {
        const err = await checkoutResponse.json();
        throw new Error(err.detail || "Failed to initiate secure checkout session.");
      }

      const checkoutData = await checkoutResponse.json();
      const order = checkoutData.order;

      // Simulate 1.5 second loading delay for Stripe / Razorpay authorization handshake
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Call payment verification endpoint with simulated signature/payment parameters
      const verifyResponse = await fetch("/api/v1/subscription/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          paymentId: gateway === "razorpay" ? `pay_rzp_mock_${Math.random().toString(36).substring(2, 9)}` : undefined,
          signature: gateway === "razorpay" ? `sig_rzp_mock_${Math.random().toString(36).substring(2, 16)}` : undefined,
          gateway
        })
      });

      if (verifyResponse.ok) {
        const data = await verifyResponse.json();
        setTenantConfig(data.config);
        
        // Fetch refreshed limits
        const limitsResponse = await fetch("/api/v1/tenant/config");
        if (limitsResponse.ok) {
          const limitsData = await limitsResponse.json();
          setLimits(limitsData.limits);
        }

        setPaymentSuccess(true);
        setIsProcessingPayment(false);
        fetchPatients(); // refresh patients list
        
        // Apply primary color
        document.documentElement.style.setProperty("--color-cura-primary", data.config.branding.primaryColor);
        document.documentElement.style.setProperty("--cura-primary", data.config.branding.primaryColor);
      } else {
        const err = await verifyResponse.json();
        setErrorAlert(err.detail || "Subscription simulation upgrade failed.");
        setIsProcessingPayment(false);
      }
    } catch (e: any) {
      console.error(e);
      setErrorAlert(e.message || "Connection failed during secure checkout.");
      setIsProcessingPayment(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/v1/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (e) {
      console.error("Failed to fetch appointments", e);
    }
  };

  const handleReceptionOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegisteringRec(true);
    setErrorAlert(null);
    setSuccessMsg(null);

    try {
      const body = {
        fullName: recFullName,
        phone: recPhone,
        email: recEmail,
        dateOfBirth: recDob,
        gender: recGender,
        bloodGroup: recBloodGroup,
        allergies: recAllergies,
        currentMedications: recMeds,
        emergencyContact: recEmergencyContact,
        address: recAddress,
        pincode: recPincode,
        city: recCity,
        state: recState,
        abhaId: recAbhaId
      };

      const response = await fetch("/api/v1/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const newPatient = await response.json();
        setOnboardingSuccessPatient(newPatient);
        fetchPatients(); // refresh main patients list
        
        // Auto select this patient for scheduling
        setSchedPatientId(newPatient.id);
        setSchedPatientName(newPatient.fullName);
        setSchedPatientCode(newPatient.patientCode || "");
        setSchedPhone(newPatient.phone);

        setSuccessMsg(`Patient onboarded successfully with Code: ${newPatient.patientCode || newPatient.id}`);
        
        // Reset form
        setRecFullName("");
        setRecPhone("");
        setRecEmail("");
        setRecDob("");
        setRecGender("Male");
        setRecBloodGroup("O+");
        setRecAllergies("");
        setRecMeds("");
        setRecEmergencyContact("");
        setRecAddress("");
        setRecPincode("");
        setRecCity("");
        setRecState("");
        setRecAbhaId("");
      } else {
        const err = await response.json();
        setErrorAlert(err.detail || "Failed to onboard patient.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorAlert("Failed to connect to backend for onboarding.");
    } finally {
      setIsRegisteringRec(false);
    }
  };

  const handleScheduleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedPatientName || !schedPhone || !schedAt) {
      setErrorAlert("Patient details and time are required for scheduling.");
      return;
    }
    setIsScheduling(true);
    setSchedSuccessMsg("");

    try {
      const body = {
        patientId: schedPatientId || undefined,
        patientName: schedPatientName,
        patientCode: schedPatientCode || undefined,
        phone: schedPhone,
        doctorName: schedDoctorName,
        scheduledAt: schedAt,
        type: schedType,
        reason: schedReason
      };

      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setSchedSuccessMsg("Appointment successfully scheduled and WhatsApp alert dispatched!");
        fetchAppointments();
        
        // Reset scheduling fields
        setSchedPatientId("");
        setSchedPatientName("");
        setSchedPatientCode("");
        setSchedPhone("");
        setSchedAt("");
        setSchedReason("");
      } else {
        const err = await res.json();
        setErrorAlert(err.detail || "Failed to schedule appointment.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorAlert("Connection failed during appointment scheduling.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAppointments();
      } else {
        const err = await res.json();
        console.error(err.detail || "Failed to update appointment status");
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const fetchSchedulerMessages = async (status?: string) => {
    try {
      const url = status ? `/api/v1/scheduler/pending?status=${status}` : "/api/v1/scheduler/pending";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSchedulerMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch scheduler messages", err);
    }
  };

  const fetchSchedulerRules = async () => {
    try {
      const res = await fetch("/api/v1/scheduler/rules");
      if (res.ok) {
        const data = await res.json();
        setSchedulerRules(data);
      }
    } catch (err) {
      console.error("Failed to fetch scheduler rules", err);
    }
  };

  const handleScheduleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedFollowUpPatientId || !schedFollowUpDoctor || !schedFollowUpDate) {
      setErrorAlert("Please fill in patient, doctor, and date for follow-up.");
      return;
    }
    setIsSchedulingFollowUp(true);
    setFollowUpSuccessMsg("");
    try {
      const res = await fetch("/api/v1/scheduler/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: schedFollowUpPatientId,
          doctorName: schedFollowUpDoctor,
          followUpDate: schedFollowUpDate,
          reason: schedFollowUpReason
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFollowUpSuccessMsg(`Successfully scheduled follow-up alert! Message ID: ${data.scheduledMessage.id}`);
        setSchedFollowUpPatientId("");
        setSchedFollowUpReason("");
        setSchedFollowUpDate("");
        fetchSchedulerMessages();
      } else {
        const err = await res.json();
        setErrorAlert(err.detail || "Failed to schedule follow-up.");
      }
    } catch (err) {
      console.error(err);
      setErrorAlert("Connection error during scheduling follow-up.");
    } finally {
      setIsSchedulingFollowUp(false);
    }
  };

  const handleScheduleMedicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedMedicationPatientId || !schedMedicationName || !schedMedicationDosage || !schedMedicationTime) {
      setErrorAlert("Please fill in patient, medication, dosage, and time.");
      return;
    }
    setIsSchedulingMedication(true);
    setMedicationSuccessMsg("");
    try {
      const res = await fetch("/api/v1/scheduler/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: schedMedicationPatientId,
          medicineName: schedMedicationName,
          dosage: schedMedicationDosage,
          time: schedMedicationTime,
          instructions: schedMedicationInstructions
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMedicationSuccessMsg(`Medication reminder scheduled successfully! Message ID: ${data.scheduledMessage.id}`);
        setSchedMedicationPatientId("");
        setSchedMedicationName("");
        setSchedMedicationDosage("");
        setSchedMedicationInstructions("");
        fetchSchedulerMessages();
      } else {
        const err = await res.json();
        setErrorAlert(err.detail || "Failed to schedule medication reminder.");
      }
    } catch (err) {
      console.error(err);
      setErrorAlert("Connection error during medication scheduling.");
    } finally {
      setIsSchedulingMedication(false);
    }
  };

  const handleCancelScheduledMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/scheduler/${id}/cancel`, {
        method: "PATCH"
      });
      if (res.ok) {
        fetchSchedulerMessages();
      } else {
        const err = await res.json();
        console.error("Cancel failed:", err.detail);
      }
    } catch (err) {
      console.error("Failed to cancel message", err);
    }
  };

  const handleCreateRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedRuleName || !schedRuleType || !schedRuleTemplate) {
      setErrorAlert("Rule name, type, and template are required.");
      return;
    }
    setIsCreatingRule(true);
    setRuleSuccessMsg("");
    try {
      const res = await fetch("/api/v1/scheduler/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleName: schedRuleName,
          scheduleType: schedRuleType,
          triggerBeforeHours: schedRuleType === "appointment" ? Number(schedRuleTriggerHours) : undefined,
          templateName: schedRuleTemplate,
          isActive: true
        })
      });
      if (res.ok) {
        setRuleSuccessMsg("Rule created successfully!");
        setSchedRuleName("");
        fetchSchedulerRules();
      } else {
        const err = await res.json();
        setErrorAlert(err.detail || "Failed to create rule.");
      }
    } catch (err) {
      console.error(err);
      setErrorAlert("Connection failed during rule creation.");
    } finally {
      setIsCreatingRule(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchTenantConfig();
    fetchAppointments();
    fetchSchedulerMessages();
    fetchSchedulerRules();
    fetchEnterpriseStates();
    fetchHimsStates();
    fetchDoctorProfile();
    fetchWhitelabelData();
  }, []);

  useEffect(() => {
    if (activeTab === "hims") {
      fetchHimsStates();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedPatient) {
      setSelectedHistoryIndices(selectedPatient.history ? selectedPatient.history.map((_, i) => i) : []);
    } else {
      setSelectedHistoryIndices([]);
    }
  }, [selectedPatient]);

  useEffect(() => {
    const sig = getSignatureForSystem(medicalSystem);
    setDoctorSignature(sig);
    setDoctorSignatureInput(sig);
  }, [medicalSystem]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchPatients(val);
  };

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setAiResult(null);
    setSymptomsInput("");
    setActivePrescriptions([]);
    setCustomDiagnosis("");
  };

  // Add Patient Submit
  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName || !newPatientAge || !newPatientPhone) return;

    try {
      const response = await fetch("/api/v1/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newPatientName,
          age: Number(newPatientAge),
          gender: newPatientGender,
          phone: newPatientPhone,
          email: newPatientEmail,
          bloodGroup: newPatientBlood,
          allergies: newPatientAllergies ? newPatientAllergies.split(",").map(s => s.trim()) : [],
          currentMedications: newPatientMeds ? newPatientMeds.split(",").map(s => s.trim()) : []
        })
      });

      if (response.ok) {
        const created = await response.json();
        setPatients(prev => [created, ...prev]);
        setSelectedPatient(created);
        setShowAddPatient(false);
        // Reset form
        setNewPatientName("");
        setNewPatientAge("");
        setNewPatientPhone("");
        setNewPatientEmail("");
        setNewPatientAllergies("");
        setNewPatientMeds("");
        // Sync config usage counts
        fetchTenantConfig();
      } else {
        const err = await response.json();
        setErrorAlert(err.detail || "Failed to register patient due to subscription limits.");
        setShowAddPatient(false);
      }
    } catch (error) {
      console.error("Error creating patient", error);
      setErrorAlert("Network failure while registering patient.");
      setShowAddPatient(false);
    }
  };

  // Call Gemini API prescription assist route
  const handleGenerateAISuggestion = async () => {
    if (!symptomsInput.trim() || !selectedPatient) return;
    setIsGeneratingAI(true);
    setAiResult(null);

    const historyForContext = selectedPatient.history
      ? selectedPatient.history.filter((_, idx) => selectedHistoryIndices.includes(idx))
      : [];

    try {
      const response = await fetch("/api/gemini/prescription-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptomsInput,
          medicalSystem: medicalSystem,
          aiEngine: aiEngine,
          patientInfo: {
            age: selectedPatient.age,
            gender: selectedPatient.gender,
            allergies: selectedPatient.allergies,
            currentMedications: selectedPatient.currentMedications
          },
          selectedHistory: historyForContext
        })
      });

      if (response.ok) {
        const data: AISuggestion = await response.json();
        setAiResult(data);
        if (data.diagnoses && data.diagnoses.length > 0) {
          setCustomDiagnosis(data.diagnoses[0]);
        }
        // Sync config usage counts
        fetchTenantConfig();
      } else {
        const err = await response.json();
        setErrorAlert(err.detail || "AI clinical helper is unavailable. Please check your plan limits.");
      }
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Quick symptom click presets to make demonstrating extremely clean
  const handleSymptomPreset = (presetText: string) => {
    setSymptomsInput(presetText);
  };

  // Custom medication adder states
  const [customMedName, setCustomMedName] = useState("");
  const [customMedDosage, setCustomMedDosage] = useState("500mg");
  const [customMedFreq, setCustomMedFreq] = useState("1-0-1");
  const [customMedDuration, setCustomMedDuration] = useState("5 days");
  const [customMedReason, setCustomMedReason] = useState("Clinical indication");
  const [overrideNotes, setOverrideNotes] = useState<{ [key: string]: string }>({});

  // Interactive Tooltip & Dosage Adjustment Modal States
  const [hoveredAlertKey, setHoveredAlertKey] = useState<string | null>(null);
  const [dosageAdjustmentModal, setDosageAdjustmentModal] = useState<{
    isOpen: boolean;
    med: { drugName: string; dosage?: string; frequency?: string; duration?: string; reason?: string } | null;
    alerts: Array<any>;
    activeIndex?: number;
    isCustomInput?: boolean;
  }>({
    isOpen: false,
    med: null,
    alerts: [],
    activeIndex: undefined,
    isCustomInput: false
  });

  // Real-time Clinical Drug Safety & Interaction Engine
  const evaluateMedicationSafety = (
    med: { drugName: string; dosage?: string; frequency?: string; duration?: string; reason?: string },
    activeList: Array<{ drugName: string; dosage?: string; frequency?: string; duration?: string; reason?: string }>,
    patient: Patient | null
  ) => {
    if (!med || !med.drugName) return [];
    const alerts: Array<{
      type: "allergy" | "drug-drug" | "drug-disease" | "dosage";
      severity: "critical" | "high" | "moderate";
      title: string;
      medicationName: string;
      triggerSource: string;
      description: string;
      suggestedAlternativeDrug?: {
        drugName: string;
        dosage: string;
        frequency: string;
        duration: string;
        reason: string;
      };
      suggestedAlternativeDose?: {
        dosage: string;
        frequency: string;
        duration: string;
        reason: string;
      };
    }> = [];

    const drugLower = med.drugName.toLowerCase();
    const dosageLower = (med.dosage || "").toLowerCase();
    const durationText = med.duration || "5 days";

    const patientAllergies = patient?.allergies ? patient.allergies.map(a => a.toLowerCase()) : [];
    const chronicMeds = patient?.currentMedications ? patient.currentMedications.map(m => m.toLowerCase()) : [];
    
    // Exclude current med from active list to avoid self-matching
    const otherActiveMeds = activeList.filter(m => m.drugName.toLowerCase() !== drugLower);
    const allOtherMedsText = [...otherActiveMeds.map(m => m.drugName.toLowerCase()), ...chronicMeds];

    // 1. ALLERGY CHECK
    const isBetaLactam = drugLower.includes("amoxicillin") || drugLower.includes("penicillin") || drugLower.includes("augmentin") || drugLower.includes("ampicillin") || drugLower.includes("clavulanate");
    const hasPenicillinAllergy = patientAllergies.some(a => a.includes("penicillin") || a.includes("amoxicillin") || a.includes("beta-lactam"));
    if (isBetaLactam && hasPenicillinAllergy) {
      alerts.push({
        type: "allergy",
        severity: "critical",
        title: "🚨 SEVERE ALLERGY CONTRAINDICATION",
        medicationName: med.drugName,
        triggerSource: "Documented Penicillin Allergy",
        description: `Patient has a recorded Penicillin allergy. Prescribing ${med.drugName} risks acute anaphylaxis or severe hypersensitivity reaction.`,
        suggestedAlternativeDrug: {
          drugName: "Cefuroxime Axetil 500mg",
          dosage: "500mg",
          frequency: "1-0-1 (after meals)",
          duration: durationText,
          reason: "Safe 2nd generation oral cephalosporin alternative with minimal cross-reactivity"
        }
      });
    }

    const isNSAID = drugLower.includes("aspirin") || drugLower.includes("ibuprofen") || drugLower.includes("naproxen") || drugLower.includes("diclofenac") || drugLower.includes("ketorolac") || drugLower.includes("mefenamic") || drugLower.includes("piroxicam");
    const hasAspirinAllergy = patientAllergies.some(a => a.includes("aspirin") || a.includes("nsaid") || a.includes("brufen"));
    if (isNSAID && hasAspirinAllergy) {
      alerts.push({
        type: "allergy",
        severity: "critical",
        title: "🚨 SEVERE NSAID HYPERSENSITIVITY CONTRAINDICATION",
        medicationName: med.drugName,
        triggerSource: "Documented Aspirin / NSAID Allergy",
        description: `Patient reported Aspirin / NSAID allergy. Prescribing ${med.drugName} risks severe asthma exacerbation or angioedema.`,
        suggestedAlternativeDrug: {
          drugName: "Paracetamol 650mg",
          dosage: "650mg",
          frequency: "1-0-1 (after meals)",
          duration: durationText,
          reason: "Non-NSAID central analgesic alternative safe in Aspirin hypersensitivity"
        }
      });
    }

    const isSulfaOrQuinolone = drugLower.includes("ciprofloxacin") || drugLower.includes("levofloxacin") || drugLower.includes("ofloxacin") || drugLower.includes("bactrim") || drugLower.includes("cotrimoxazole") || drugLower.includes("sulfa");
    const hasSulfaAllergy = patientAllergies.some(a => a.includes("sulfa") || a.includes("quinolone") || a.includes("cipro"));
    if (isSulfaOrQuinolone && hasSulfaAllergy) {
      alerts.push({
        type: "allergy",
        severity: "high",
        title: "⚠️ ALLERGY WARNING: SULFA / QUINOLONE HYPERSENSITIVITY",
        medicationName: med.drugName,
        triggerSource: "Documented Sulfa / Quinolone Allergy",
        description: `Patient reported sensitivity to Sulfa or Fluoroquinolones. Risk of severe Stevens-Johnson syndrome or allergic skin eruption.`,
        suggestedAlternativeDrug: {
          drugName: "Cefixime 200mg",
          dosage: "200mg",
          frequency: "1-0-1",
          duration: durationText,
          reason: "Cephalosporin oral antibiotic safe in Sulfa and Quinolone allergies"
        }
      });
    }

    // 2. DRUG-DRUG INTERACTIONS
    const isAspirin = drugLower.includes("aspirin") || drugLower.includes("ecosprin");
    const isClopidogrelOrAnticoagulant = allOtherMedsText.some(m => m.includes("clopidogrel") || m.includes("plavix") || m.includes("warfarin") || m.includes("heparin") || m.includes("rivaroxaban") || m.includes("apixaban"));
    if (isAspirin && isClopidogrelOrAnticoagulant) {
      alerts.push({
        type: "drug-drug",
        severity: "high",
        title: "⚡ MAJOR DRUG INTERACTION: DUAL ANTIPLATELET BLEED RISK",
        medicationName: med.drugName,
        triggerSource: "Co-prescribed with Clopidogrel / Anticoagulant Therapy",
        description: `Co-administering Aspirin with Clopidogrel or oral anticoagulants increases major upper GI hemorrhage risk by 3.8x. Mandatory PPI gastric protection required.`,
        suggestedAlternativeDose: {
          dosage: "75mg Low Dose",
          frequency: "1-0-0 with Pantoprazole 40mg",
          duration: durationText,
          reason: "Cap Aspirin at low 75mg daily dose and co-prescribe Pantoprazole 40mg OD for ulcer prevention"
        },
        suggestedAlternativeDrug: {
          drugName: "Pantoprazole 40mg + Low-Dose Aspirin 75mg",
          dosage: "75mg + 40mg PPI",
          frequency: "1-0-0 (before breakfast)",
          duration: durationText,
          reason: "Combined antiplatelet with gastroprotective PPI cover"
        }
      });
    }

    const isMacrolide = drugLower.includes("clarithromycin") || drugLower.includes("erythromycin");
    const isStatinInProfile = allOtherMedsText.some(m => m.includes("atorvastatin") || m.includes("simvastatin") || m.includes("statin"));
    if (isMacrolide && isStatinInProfile) {
      alerts.push({
        type: "drug-drug",
        severity: "critical",
        title: "🚨 SEVERE DRUG INTERACTION: RHABDOMYOLYSIS RISK",
        medicationName: med.drugName,
        triggerSource: "Patient on active Statin therapy (Atorvastatin / Simvastatin)",
        description: `Clarithromycin potently inhibits hepatic CYP3A4, raising serum Statin concentrations up to 10-fold and triggering severe rhabdomyolysis and acute kidney injury.`,
        suggestedAlternativeDrug: {
          drugName: "Azithromycin 500mg",
          dosage: "500mg",
          frequency: "1-0-0 (once daily)",
          duration: "3 days",
          reason: "Macrolide antibiotic that does NOT inhibit CYP3A4; completely safe alongside active Statin therapy"
        }
      });
    }

    if (isNSAID && !isAspirin && allOtherMedsText.some(m => m.includes("aspirin") || m.includes("ecosprin"))) {
      alerts.push({
        type: "drug-drug",
        severity: "high",
        title: "⚠️ DRUG INTERACTION: CARDIOPROTECTION INHIBITION & PEPTIC ULCER",
        medicationName: med.drugName,
        triggerSource: "Patient taking daily Cardioprotective Aspirin",
        description: `Non-selective NSAIDs (Ibuprofen/Naproxen) competitively block Aspirin's irreversible COX-1 platelet binding, negating cardioprotection and causing severe gastric erosion.`,
        suggestedAlternativeDrug: {
          drugName: "Paracetamol 650mg",
          dosage: "650mg",
          frequency: "1-0-1 (after meals)",
          duration: durationText,
          reason: "Analgesic alternative that does not interfere with Aspirin antiplatelet cardioprotection"
        }
      });
    }

    const isACEi = drugLower.includes("enalapril") || drugLower.includes("ramipril") || drugLower.includes("lisinopril") || drugLower.includes("perindopril");
    const hasSpironolactone = allOtherMedsText.some(m => m.includes("spironolactone") || m.includes("aldactone") || m.includes("potassium"));
    if (isACEi && hasSpironolactone) {
      alerts.push({
        type: "drug-drug",
        severity: "high",
        title: "⚡ MAJOR DRUG INTERACTION: SEVERE HYPERKALEMIA RISK",
        medicationName: med.drugName,
        triggerSource: "Co-prescribed with Spironolactone / Potassium Supplement",
        description: `Synergistic urinary potassium retention can elevate serum K+ > 5.5 mEq/L, risking cardiac conduction block or ventricular arrhythmias.`,
        suggestedAlternativeDose: {
          dosage: "2.5mg (Half Dose)",
          frequency: "1-0-0",
          duration: durationText,
          reason: "Reduce ACE inhibitor dose by 50% with mandatory serum K+ check in 7 days"
        }
      });
    }

    // 3. DRUG-DISEASE INTERACTIONS
    const isBetaBlocker = drugLower.includes("propranolol") || drugLower.includes("atenolol") || drugLower.includes("metoprolol") || drugLower.includes("labetalol");
    const historyText = patient?.history ? JSON.stringify(patient.history).toLowerCase() : "";
    const symptomsText = (patient?.history?.[0]?.symptoms || "").toLowerCase();
    const isAsthmatic = historyText.includes("asthma") || historyText.includes("bronchospasm") || historyText.includes("wheezing") || symptomsText.includes("asthma");
    if (isBetaBlocker && isAsthmatic) {
      alerts.push({
        type: "drug-disease",
        severity: "high",
        title: "⚠️ DRUG-DISEASE CONTRAINDICATION: BRONCHOSPASM IN ASTHMA",
        medicationName: med.drugName,
        triggerSource: "Patient Medical History of Asthma / Wheezing",
        description: `Beta-blockers antagonize beta-2 receptors in bronchial smooth muscle, triggering severe bronchospasm or refractory asthmatic attack.`,
        suggestedAlternativeDrug: {
          drugName: "Amlodipine 5mg",
          dosage: "5mg",
          frequency: "1-0-0",
          duration: durationText,
          reason: "Dihydropyridine calcium channel blocker safe in bronchial asthma for blood pressure control"
        }
      });
    }

    // 4. DOSAGE CAP ALERT
    if (drugLower.includes("paracetamol") || drugLower.includes("acetaminophen") || drugLower.includes("crocin") || drugLower.includes("dolo")) {
      if (dosageLower.includes("1000mg") || dosageLower.includes("1g") || dosageLower.includes("1000")) {
        alerts.push({
          type: "dosage",
          severity: "moderate",
          title: "⚡ DOSAGE CAP ALERT: HEPATOTOXICITY LIMIT",
          medicationName: med.drugName,
          triggerSource: "High Dose Single Administration (1000mg)",
          description: `Single paracetamol doses of 1000mg must be capped to a maximum of 3 doses daily (3g total) to prevent hepatic glutathione depletion and liver injury.`,
          suggestedAlternativeDose: {
            dosage: "650mg",
            frequency: "1-0-1 (Thrice daily max)",
            duration: durationText,
            reason: "Safe 650mg dose providing optimal analgesia without exceeding 2000mg daily hepatotoxic threshold"
          }
        });
      }
    }

    return alerts;
  };

  // Replace a medication in activePrescriptions with a safe alternative
  const handleApplyAlternativeDrugInActive = (index: number, altDrug: any) => {
    setActivePrescriptions(prev => {
      const updated = [...prev];
      updated[index] = {
        drugName: altDrug.drugName,
        dosage: altDrug.dosage,
        frequency: altDrug.frequency,
        duration: altDrug.duration,
        reason: altDrug.reason
      };
      return updated;
    });
  };

  // Adjust dose of a medication in activePrescriptions with safe alternative dose
  const handleApplyAlternativeDoseInActive = (index: number, altDose: any) => {
    setActivePrescriptions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        dosage: altDose.dosage,
        frequency: altDose.frequency,
        duration: altDose.duration,
        reason: `Safe Dose Adjustment: ${altDose.reason}`
      };
      return updated;
    });
  };

  // Add safe alternative drug directly from AI suggestion
  const handleAddSafeAlternativeFromSuggested = (altDrug: any) => {
    const exists = activePrescriptions.some(m => m.drugName.toLowerCase() === altDrug.drugName.toLowerCase());
    if (!exists) {
      setActivePrescriptions(prev => [...prev, {
        drugName: altDrug.drugName,
        dosage: altDrug.dosage,
        frequency: altDrug.frequency,
        duration: altDrug.duration,
        reason: `Safe Alternative: ${altDrug.reason}`
      }]);
    }
  };

  // Custom medication quick adder handler
  const handleAddCustomMedication = () => {
    if (!customMedName.trim()) return;
    const newMed = {
      drugName: customMedName.trim(),
      dosage: customMedDosage || "500mg",
      frequency: customMedFreq || "1-0-1",
      duration: customMedDuration || "5 days",
      reason: customMedReason || "Clinical indication"
    };
    setActivePrescriptions(prev => [...prev, newMed]);
    setCustomMedName("");
  };

  // Add Suggested Medication to local Active list
  const addMedicationToActive = (med: any) => {
    const exists = activePrescriptions.some(m => m.drugName.toLowerCase() === med.drugName.toLowerCase());
    if (!exists) {
      setActivePrescriptions(prev => [...prev, med]);
    }
  };

  const addAllSuggestedToActive = () => {
    if (!aiResult) return;
    setActivePrescriptions(aiResult.medications);
  };

  const removeMedicationFromActive = (index: number) => {
    setActivePrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  // Finalize visit prescription write & mock WhatsApp send
  const handleFinalizeVisit = async () => {
    if (!selectedPatient || activePrescriptions.length === 0) return;

    try {
      const finalDiagnosis = customDiagnosis || "General Consultation";
      const response = await fetch(`/api/v1/patients/${selectedPatient.id}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: finalDiagnosis,
          symptoms: symptomsInput || "Regular consult",
          prescriptions: activePrescriptions.map(m => `${m.drugName} - ${m.dosage} (${m.frequency}) for ${m.duration}`)
        })
      });

      if (response.ok) {
        const updatedPatient = await response.json();
        // Update selection and lists
        setSelectedPatient(updatedPatient);
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));

        // Format prescription details for simulated WhatsApp
        const medsListText = activePrescriptions.map(
          (m, idx) => `\n${idx+1}. *${m.drugName}* - ${m.dosage} [${m.frequency}] for ${m.duration}`
        ).join("");

        const waText = `*Digital Prescription - ${tenantConfig?.branding?.clinicName || "CURA healthcare"}*\n\n*Patient:* ${selectedPatient.fullName}\n*Date:* ${new Date().toISOString().split("T")[0]}\n*Diagnosis:* ${finalDiagnosis}\n*Rx Medications:*${medsListText}\n\n*General Advice:* Follow dosage guidelines. Avoid allergic triggers.\n\n📄 _Download PDF receipt: https://rx.cura.in/d/9F2A90_`;
        
        try {
          const waResponse = await fetch("/api/v1/tenant/whatsapp-send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: selectedPatient.phone,
              message: waText
            })
          });

          if (waResponse.ok) {
            setWhatsappSentMessage(waText);
            setShowWhatsAppModal(true);
            fetchTenantConfig(); // Sync counts
          } else {
            const waErr = await waResponse.json();
            setErrorAlert(waErr.detail || "Prescription saved to EMR, but WhatsApp broadcast was blocked by subscription limits.");
          }
        } catch (waErrEx) {
          console.error("WhatsApp dispatch error", waErrEx);
          setErrorAlert("Prescription saved to EMR, but failed to connect to the WhatsApp API gateway.");
        }

        // Clear consultation fields
        setAiResult(null);
        setSymptomsInput("");
        setActivePrescriptions([]);
        setCustomDiagnosis("");
      }
    } catch (e) {
      console.error(e);
      setErrorAlert("Failed to save prescription to EMR timeline.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* MANDATORY RMP DOCTOR ONBOARDING FLOW */}
      {!doctorProfile.isVerified && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl mx-auto shadow-sm">
                🛡️
              </div>
              <h2 className="text-lg font-black text-slate-950 tracking-tight">Registered Medical Practitioner (RMP) Onboarding</h2>
              <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
                As per Section 3.7.1 of the Telemedicine Practice Guidelines of India, all practicing clinicians must register, verify credentials, and accept AI decision-support boundaries before consulting.
              </p>
            </div>

            {onboardingError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <span>{onboardingError}</span>
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Full Name (Prefix required)</label>
                  <input
                    type="text"
                    value={obName}
                    onChange={(e) => setObName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Clinical Qualifications</label>
                  <input
                    type="text"
                    value={obQual}
                    onChange={(e) => setObQual(e.target.value)}
                    placeholder="e.g. MBBS, MD (Cardiology)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wider block">RMP Registration / License No.</label>
                  <input
                    type="text"
                    value={obRegNo}
                    onChange={(e) => setObRegNo(e.target.value)}
                    placeholder="e.g. MCI-18452-A"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Years of Active Experience</label>
                  <input
                    type="number"
                    value={obExp}
                    onChange={(e) => setObExp(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Registering Medical Council</label>
                <input
                  type="text"
                  value={obCouncil}
                  onChange={(e) => setObCouncil(e.target.value)}
                  placeholder="e.g. National Medical Commission (NMC)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Drag-and-Drop + Manual click License File Upload */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-500 uppercase tracking-wider block">Upload Valid Medical Council License Copy</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setOnboardingDragOver(true); }}
                  onDragLeave={() => setOnboardingDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setOnboardingDragOver(false);
                    const files = e.dataTransfer.files;
                    if (files && files[0]) {
                      setOnboardingFile(files[0]);
                      setOnboardingFileName(files[0].name);
                    }
                  }}
                  onClick={() => {
                    const el = document.getElementById("rmp-file-input");
                    el?.click();
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    onboardingDragOver 
                      ? "border-indigo-500 bg-indigo-50/50" 
                      : onboardingFileName 
                        ? "border-emerald-300 bg-emerald-50/20" 
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                >
                  <input
                    id="rmp-file-input"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files[0]) {
                        setOnboardingFile(files[0]);
                        setOnboardingFileName(files[0].name);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="space-y-1 font-semibold text-slate-500">
                    <span className="text-lg block">📄</span>
                    {onboardingFileName ? (
                      <p className="text-emerald-700 font-bold">✓ Attached: {onboardingFileName}</p>
                    ) : (
                      <>
                        <p className="text-slate-800">Drag & drop your licensing document or <span className="text-indigo-600 underline">browse</span></p>
                        <p className="text-[10px] text-slate-400">Accepts PDF, PNG, or JPG (Max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* AI ROLE EXPLICIT DISCLAIMER & ACKNOWLEDGMENT */}
              <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 text-sm mt-0.5 font-bold">🤖</span>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-indigo-950 uppercase tracking-wide text-[10px]">AI Clinical Decision-Support Bound Agreement</h4>
                    <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
                      In accordance with Telehealth policies, Gemini AI is strictly structured as an interactive <strong>decision-support tool</strong>. Under no circumstances will the AI counsel, diagnose, or prescribe directly to patients. The RMP retains absolute clinical responsibility for modifying and authorizing all EMR items, treatment lines, and prescriptions.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={obAgreed}
                    onChange={(e) => setObAgreed(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                  />
                  <span className="text-[10px] text-slate-700 font-extrabold leading-tight">
                    I acknowledge and accept absolute clinical responsibility as the verified RMP for all telehealth generated prescriptions.
                  </span>
                </label>
              </div>

              {/* Status Message */}
              {obFeedbackMsg && (
                <div className="flex items-center gap-2 text-indigo-600 font-bold justify-center bg-indigo-50/50 py-2 rounded-xl border border-indigo-100 animate-pulse">
                  <span className="inline-block h-3.5 w-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                  <span>{obFeedbackMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isOnboardingVerifying}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-lg shadow-slate-100 cursor-pointer disabled:opacity-50 transition-all uppercase tracking-wider"
              >
                {isOnboardingVerifying ? "Verifying NMC Live Node..." : "Onboard & Unlock Telemedicine Terminal"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* 🛡️ DPDP MULTI-FACTOR AUTHENTICATION ACCESS GUARD OVERLAY */}
      {doctorProfile.isVerified && mfaEnforced && !mfaVerified && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[99999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl text-center space-y-6"
          >
            <div className="space-y-3">
              <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner animate-pulse">
                🔒
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">DPDP Act Secure Gateway</h2>
              <p className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest">Multi-Factor Authentication Required</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                As per Section 8 of India's Digital Personal Data Protection (DPDP) Act, 2023, access to sensitive clinical health records, diagnosis templates, and patient history lists is restricted to authenticated RMPs via Multi-Factor verification.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl text-[11px] text-slate-400 flex items-center gap-2 justify-center font-semibold">
              <span className="text-sm">🔑</span>
              <span>Enter secure auth token code: <strong className="text-emerald-400 font-mono text-xs">123456</strong></span>
            </div>

            {mfaError && (
              <div className="bg-red-950/40 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 text-left">
                <span>⚠️</span>
                <span>{mfaError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyMfaCode(mfaCode);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-Digit TOTP"
                  className="w-full text-center tracking-[1em] text-lg bg-slate-950 border border-slate-800 focus:border-red-500 rounded-2xl py-3 focus:outline-none text-white font-black font-mono placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-red-900/10 cursor-pointer transition-all uppercase tracking-wider"
              >
                Verify TOTP & Unlock Session
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0 z-10 shadow-sm shadow-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={onBackToLanding}>
            {tenantConfig?.branding?.logoUrl ? (
              <img 
                src={tenantConfig.branding.logoUrl} 
                className="h-6 w-auto object-contain max-h-[30px] rounded" 
                alt="Clinic Logo" 
                referrerPolicy="no-referrer" 
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Heart className="h-5 w-5 text-red-600 fill-red-600" />
            )}
            <span className="text-xl font-black text-cura-primary-dark">
              {tenantConfig?.branding?.clinicName ? tenantConfig.branding.clinicName.split(" ")[0] : "CURA"}<span className="text-red-600">.</span>
            </span>
          </div>
          <span className="h-4 w-[1px] bg-slate-200 mx-2"></span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block pulse-dot"></span> 
            {tenantConfig?.branding?.clinicName || "CURA Healthcare"} EMR Terminal
          </span>
          {tenantConfig?.tier && (
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border hidden md:inline-block ${
              tenantConfig.tier === "trial" 
                ? "bg-amber-50 border-amber-200 text-amber-700" 
                : tenantConfig.tier === "solo-clinic"
                ? "bg-sky-50 border-sky-200 text-sky-700"
                : tenantConfig.tier === "nursing-home"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-indigo-50 border-indigo-200 text-indigo-700"
            }`}>
              🏆 {tenantConfig.tier.replace("-", " ")}
            </span>
          )}
        </div>

        {/* WORKSPACE & SAAS CONTROLS TAB SWITCHER */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              setActiveTab("clinical");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
              activeTab === "clinical" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🩺 Clinical Practice
          </button>
          <button
            onClick={() => {
              setActiveTab("frontoffice");
              setErrorAlert(null);
              fetchAppointments();
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
              activeTab === "frontoffice" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🛎️ Front Office Terminal
          </button>
          <button
            onClick={() => {
              setActiveTab("telemedicine");
              setErrorAlert(null);
              fetchAppointments();
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === "telemedicine" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            📹 Telemedicine Center
          </button>
          <button
            onClick={() => {
              setActiveTab("saas");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "saas" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            ⚙️ SaaS Control Center
            {tenantConfig?.tier === "trial" && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("enterprise");
              setErrorAlert(null);
              fetchEnterpriseStates();
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "enterprise" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🛡️ Enterprise & Security
          </button>
          <button
            onClick={() => {
              setActiveTab("hims");
              setErrorAlert(null);
              fetchHimsStates();
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "hims" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🏥 Hospital IMS Suite
          </button>
          <button
            onClick={() => {
              setActiveTab("intelligence");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "intelligence" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "text-indigo-600 hover:text-indigo-800"
            }`}
          >
            🧠 CURA Intelligence
            <span className="bg-amber-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">ROI</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("mental_health");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "mental_health" 
                ? "bg-purple-700 text-white shadow-sm" 
                : "text-purple-700 hover:text-purple-900"
            }`}
          >
            🧠 Psychiatry & Mind
            <span className="bg-purple-300 text-purple-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">DSM-5</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("cardiology");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "cardiology" 
                ? "bg-rose-700 text-white shadow-sm" 
                : "text-rose-700 hover:text-rose-900"
            }`}
          >
            ❤️ Cardiology AI
            <span className="bg-rose-300 text-rose-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">ECG/Echo</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("pediatrics");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "pediatrics" 
                ? "bg-pink-700 text-white shadow-sm" 
                : "text-pink-700 hover:text-pink-900"
            }`}
          >
            👶 Pediatrics AI
            <span className="bg-pink-300 text-pink-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">WHO/IAP</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("womens_health");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "womens_health" 
                ? "bg-fuchsia-700 text-white shadow-sm" 
                : "text-fuchsia-700 hover:text-fuchsia-900"
            }`}
          >
            👩 Women&apos;s Health AI
            <span className="bg-fuchsia-300 text-fuchsia-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">OB-GYN</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("orthopedics");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "orthopedics" 
                ? "bg-blue-700 text-white shadow-sm" 
                : "text-blue-700 hover:text-blue-900"
            }`}
          >
            🦴 Orthopedics AI
            <span className="bg-blue-300 text-blue-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">AO Trauma</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("dermatology");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "dermatology" 
                ? "bg-rose-700 text-white shadow-sm" 
                : "text-rose-700 hover:text-rose-900"
            }`}
          >
            ☀️ Dermatology AI
            <span className="bg-rose-300 text-rose-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">AAD Dermpath</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("neurology");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "neurology" 
                ? "bg-purple-700 text-white shadow-sm" 
                : "text-purple-700 hover:text-purple-900"
            }`}
          >
            🧠 Neurology AI
            <span className="bg-purple-300 text-purple-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">AAN Brain</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("oncology");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "oncology" 
                ? "bg-rose-700 text-white shadow-sm" 
                : "text-rose-700 hover:text-rose-900"
            }`}
          >
            🧬 Oncology AI
            <span className="bg-rose-300 text-rose-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">NCCN Cancer</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("emergency");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "emergency" 
                ? "bg-red-700 text-white shadow-sm" 
                : "text-red-700 hover:text-red-900"
            }`}
          >
            🚑 Emergency & ICU AI
            <span className="bg-red-300 text-red-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">ESI 2026</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("ent");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "ent" 
                ? "bg-purple-700 text-white shadow-sm" 
                : "text-purple-700 hover:text-purple-900"
            }`}
          >
            👂 ENT & Audiology AI
            <span className="bg-purple-300 text-purple-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">AAO-HNS</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("ophthalmology");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "ophthalmology" 
                ? "bg-blue-700 text-white shadow-sm" 
                : "text-blue-700 hover:text-blue-900"
            }`}
          >
            👁️ Ophthalmology AI
            <span className="bg-blue-300 text-blue-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">AAO 2026</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("hematology");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "hematology" 
                ? "bg-red-700 text-white shadow-sm" 
                : "text-red-700 hover:text-red-900"
            }`}
          >
            🩸 Hematology AI
            <span className="bg-red-300 text-red-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">ASH 2026</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("nephrology");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "nephrology" 
                ? "bg-purple-700 text-white shadow-sm" 
                : "text-purple-700 hover:text-purple-900"
            }`}
          >
            🧪 Nephrology AI
            <span className="bg-purple-300 text-purple-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">KDIGO 2026</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("rheumatology");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "rheumatology" 
                ? "bg-pink-700 text-white shadow-sm" 
                : "text-pink-700 hover:text-pink-900"
            }`}
          >
            🦴 Rheumatology AI
            <span className="bg-pink-300 text-pink-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">ACR 2026</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("critical_care");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "critical_care" 
                ? "bg-red-700 text-white shadow-sm" 
                : "text-red-700 hover:text-red-900"
            }`}
          >
            ⚡ Critical Care AI
            <span className="bg-red-300 text-red-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">SCCM 2026</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("gastroenterology");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "gastroenterology" 
                ? "bg-emerald-700 text-white shadow-sm" 
                : "text-emerald-700 hover:text-emerald-900"
            }`}
          >
            🩺 Gastroenterology AI
            <span className="bg-emerald-300 text-emerald-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">ACG 2026</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("analytics");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "analytics" 
                ? "bg-blue-700 text-white shadow-sm" 
                : "text-blue-700 hover:text-blue-900"
            }`}
          >
            📊 Analytics & Reporting Hub
            <span className="bg-blue-300 text-blue-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">REAL-TIME</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("ai_core");
              setErrorAlert(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "ai_core" 
                ? "bg-cyan-700 text-white shadow-sm" 
                : "text-cyan-700 hover:text-cyan-900"
            }`}
          >
            🧠 Universal AI Core
            <span className="bg-cyan-300 text-cyan-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">Router v3</span>
          </button>

          <button
            onClick={() => setIsTourOpen(true)}
            className="text-xs font-black px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-1.5 border border-purple-400/30"
            title="Launch CURA Autonomous Self-Demo Product Tour"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span>🎥 Self-Demo Video</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* 🛡️ DPDP RBAC Active Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1.5 rounded-full shadow-sm">
            <span className="text-[9px] font-black text-slate-700 uppercase px-2 tracking-wider">Active Role:</span>
            <select
              value={activeUserRole}
              onChange={(e) => updateRbacRole(e.target.value as any)}
              className={`text-xs font-black rounded-full py-1 px-3 focus:outline-none cursor-pointer shadow-sm ${
                activeUserRole === "doctor"
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : activeUserRole === "receptionist"
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-red-600 text-white border-red-500"
              }`}
            >
              <option value="doctor">🩺 Doctor</option>
              <option value="receptionist">🛎️ Receptionist</option>
              <option value="compliance">🛡️ Compliance (DPO)</option>
            </select>
          </div>

          {/* Same Platform Specialization Profile Selector */}
          <div className="flex items-center gap-1.5 bg-teal-50/70 border border-teal-200 p-1.5 rounded-full shadow-sm">
            <span className="text-[9px] font-black text-teal-800 uppercase px-2 tracking-wider">SPECIALIZATION MODE:</span>
            <select
              value={medicalSystem}
              onChange={(e) => {
                const sys = e.target.value as any;
                setMedicalSystem(sys);
                // Calibrate success alert
                setSuccessMsg(`Switched terminal mode to ${sys.toUpperCase()}. AI assistant and EMR templates have been fully calibrated.`);
                setTimeout(() => setSuccessMsg(null), 4000);
              }}
              className="text-xs font-black text-teal-950 bg-white border border-teal-200 rounded-full py-1 px-3 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-sm"
            >
              <option value="allopathy">🩺 Allopathy (MBBS/MD)</option>
              <option value="ayurveda">🌿 Ayurveda (BAMS)</option>
              <option value="homeopathy">🌸 Homeopathy (BHMS)</option>
              <option value="unani">🧪 Unani (BUMS)</option>
              <option value="siddha">🧬 Siddha (BSMS)</option>
              <option value="yoga">🧘 Yoga & Naturopathy</option>
            </select>
          </div>

          <button 
            onClick={onBackToLanding}
            className="text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-full transition-all"
          >
            ← Exit Terminal
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "clinical" ? (
          <>
            {/* LEFT SIDEBAR: PATIENTS LIST */}
            <aside className="w-80 bg-white border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-800">Patients Directory</h2>
              <button 
                onClick={() => setShowAddPatient(true)}
                className="gradient-btn-cura hover:opacity-95 text-white p-2 rounded-full shadow-md shadow-sky-500/10 transition-all hover:scale-[1.05]"
                title="Register New Patient"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search name, phone, code..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cura-primary/10 text-slate-700"
              />
            </div>
          </div>

          {/* Patient Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-1">
            {patients.length > 0 ? (
              patients.map(p => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all duration-150 flex flex-col gap-1 ${
                      isSelected 
                        ? "bg-sky-50/80 border border-sky-100 text-cura-primary-dark" 
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-extrabold text-sm">{p.fullName}</span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                        {p.id}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                      <span>{p.age} years • {p.gender}</span>
                      <span className="text-slate-500">{p.phone}</span>
                    </div>
                    {p.allergies && p.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.allergies.map(all => (
                          <span key={all} className="text-[9px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded-full border border-rose-100">
                            ⚠️ Allergy: {all}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs font-semibold text-slate-400 space-y-2">
                <p>No patients matched search criteria.</p>
                <button 
                  onClick={() => setShowAddPatient(true)}
                  className="text-cura-primary hover:underline font-bold flex items-center gap-1 mx-auto"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Register new patient
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN PANEL: PATIENT FILE & AI CONSULTATION */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {selectedPatient ? (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* PROMINENT MEDICATION ALLERGY WARNING INDICATOR BANNER */}
              {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white rounded-3xl p-5 shadow-lg border-2 border-rose-500/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-3 bg-white/20 rounded-2xl text-white shrink-0 shadow-inner flex items-center justify-center">
                      <AlertTriangle className="h-7 w-7 text-amber-200 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-amber-300 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <ShieldAlert className="h-3 w-3 text-rose-900" /> Critical Safety Alert
                        </span>
                        <span className="text-[11px] font-extrabold text-rose-100 uppercase tracking-wide">
                          Prescription Safety Guard Active
                        </span>
                      </div>
                      <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                        <span>KNOWN MEDICATION ALLERGY WARNING</span>
                      </h2>
                      <p className="text-xs font-bold text-rose-100 leading-relaxed">
                        This patient has verified severe drug allergies to:{" "}
                        <span className="underline decoration-amber-300 decoration-2 underline-offset-4 text-amber-200 font-black text-sm bg-rose-900/40 px-2 py-0.5 rounded-lg border border-amber-300/30">
                          {selectedPatient.allergies.join(", ")}
                        </span>
                        . Do not prescribe these or cross-reactive medication classes.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 bg-rose-950/60 border border-rose-300/30 px-3.5 py-2 rounded-2xl text-right space-y-0.5">
                    <span className="text-[10px] font-extrabold text-rose-200 uppercase tracking-wider block">Safety Protocol</span>
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1 justify-end">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> EHR Safety Verified
                    </span>
                  </div>
                </div>
              )}

              {/* PATIENT HEADER CARD */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                      {selectedPatient.fullName}
                    </h1>
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                      {selectedPatient.gender} • {selectedPatient.age} Yrs
                    </span>
                    <span className="text-xs font-bold bg-sky-100 text-cura-primary-dark px-2 py-0.5 rounded-md">
                      Blood Group: {selectedPatient.bloodGroup}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> WhatsApp: {selectedPatient.phone}
                    </span>
                    {selectedPatient.email && (
                      <span>📧 Email: {selectedPatient.email}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Allergies tag list */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Drug Allergies</span>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedPatient.allergies.map(all => (
                          <span key={all} className="text-xs bg-rose-50 text-rose-600 font-extrabold px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" /> {all}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        ✓ No Known Drug Allergies (NKDA)
                      </span>
                    )}
                  </div>

                  {/* Chronic Medications */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Chronic Meds</span>
                    {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedPatient.currentMedications.map(med => (
                          <span key={med} className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-lg border border-amber-100">
                            {med}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 italic">None reported</span>
                    )}
                  </div>
                </div>
              </div>

              {/* AYUSHMAN BHARAT PM-JAY E-CARD & ELIGIBILITY FETCH CARD (API SETU) */}
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-emerald-500/10 rounded-3xl p-6 border border-orange-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-orange-200/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-orange-600 text-white rounded-2xl shadow-md">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">
                          Ayushman Bharat PM-JAY e-Card Verification
                        </h3>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          NHA API Setu Gateway
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Hospital Details Fetch & Verified Beneficiary e-Card for {selectedPatient.fullName}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPmjayModalOpen(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-orange-300 text-orange-800 hover:bg-orange-50 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-orange-600" />
                    <span>Open API Setu Playground</span>
                  </button>
                </div>

                {/* INPUT & FETCH BAR */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        PM-JAY ID / UDF Parameter
                      </label>
                      <input
                        type="text"
                        value={pmjayCustomIdInput}
                        onChange={(e) => setPmjayCustomIdInput(e.target.value)}
                        placeholder="e.g. PMJAY0000 or PMJAY884920"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Response Format
                      </label>
                      <select
                        value={pmjayFormatChoice}
                        onChange={(e: any) => setPmjayFormatChoice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="pdf">📄 PDF Artifact</option>
                        <option value="json">⚡ Structured JSON</option>
                        <option value="xml">🏷️ XML Certificate</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4 flex items-end">
                      <button
                        onClick={() => fetchPatientPmjayDetails(selectedPatient.id)}
                        disabled={pmjayFetchLoading}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {pmjayFetchLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-white" />
                            <span>Connecting API Setu...</span>
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4" />
                            <span>Fetch Hospital PM-JAY Card</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {pmjayFetchError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>{pmjayFetchError}</span>
                    </div>
                  )}

                  {/* DISPLAY FETCHED PM-JAY RECORD FOR SELECTED PATIENT */}
                  {patientPmjayMap[selectedPatient.id] && (
                    <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 border border-slate-800 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active Beneficiary Verified
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Fetched: {patientPmjayMap[selectedPatient.id].fetchedAt}
                          </span>
                        </div>
                        <span className="text-[11px] font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-lg">
                          💰 Health Cover: ₹5,00,000 / Year
                        </span>
                      </div>

                      {patientPmjayMap[selectedPatient.id].certificateData ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Beneficiary Name</span>
                            <span className="font-extrabold text-white text-sm">
                              {patientPmjayMap[selectedPatient.id].certificateData.beneficiaryName || selectedPatient.fullName}
                            </span>
                          </div>
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PM-JAY ID</span>
                            <span className="font-mono font-extrabold text-amber-300 text-sm">
                              {patientPmjayMap[selectedPatient.id].certificateData.pmjayId}
                            </span>
                          </div>
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Family HHID</span>
                            <span className="font-mono font-bold text-slate-200">
                              {patientPmjayMap[selectedPatient.id].certificateData.familyId}
                            </span>
                          </div>
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Issuer Agency</span>
                            <span className="font-semibold text-slate-300">
                              {patientPmjayMap[selectedPatient.id].certificateData.issuedBy}
                            </span>
                          </div>
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DigiLocker Artifact ID</span>
                            <span className="font-mono text-[11px] text-sky-300">
                              {patientPmjayMap[selectedPatient.id].certificateData.digiLockerArtifactId}
                            </span>
                          </div>
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Digital Signature Seal</span>
                            <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1">
                              🛡️ {patientPmjayMap[selectedPatient.id].certificateData.digiLockerSignature}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <pre className="p-3 bg-slate-950 text-emerald-400 text-[11px] font-mono rounded-xl max-h-40 overflow-y-auto whitespace-pre-wrap">
                          {patientPmjayMap[selectedPatient.id].rawXml || JSON.stringify(patientPmjayMap[selectedPatient.id], null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* TWO COLUMN INTERACTION: CONSULT & EHR TIMELINE */}
              {activeUserRole === "receptionist" ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-4 shadow-sm">
                  <div className="inline-flex p-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full animate-pulse">
                    <AlertCircle className="h-8 w-8 text-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">🔒 Clinical Notes & EMR Timeline Masked</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      As per Section 8 of the DPDP Act 2023 (Role-Based Access Control policy), receptionist credentials are restricted from viewing or modifying active consultation logs, prescriptions, drug allergies, diagnostic scans, and clinical histories.
                    </p>
                    <div className="text-[10px] bg-slate-50 border border-slate-100 py-2 px-4 rounded-xl inline-block text-slate-500 font-mono">
                      Current Session RBAC: <span className="font-extrabold text-amber-600">RECEPTIONIST_FRONT_OFFICE_ROLE</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-12 gap-6 items-start">
                
                {/* ACTIVE CONSULTATION ENGINE */}
                <div className="lg:col-span-8 space-y-6">
                  
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="h-5 w-5 text-cura-primary" /> Active Clinical Dictation Assistant
                      </h3>
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase">
                        AI-Guided EMR Draft
                      </span>
                    </div>

                    {/* Unified EMR & AYUSH Integration Banner */}
                    {medicalSystem !== "allopathy" && (
                      <div className="bg-teal-50/50 border border-teal-200/50 p-4 rounded-2xl flex items-start gap-3 animate-fadeIn">
                        <span className="text-xl">🌿</span>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wide">Unified EMR & AYUSH Integration Active</h4>
                          <p className="text-[11px] font-semibold text-teal-800 leading-relaxed">
                            CURA's unified core platform links AYUSH and Allopathic practices. Your active patient files, billing registries, and automated WhatsApp alert triggers remain fully synchronized while your clinical EMR switches to classical diagnostics, herbals, and formulations.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Presets Helper */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Demo Consultation Presets ({medicalSystem.toUpperCase()} Mode)
                        </span>
                        {medicalSystem !== "allopathy" && (
                          <span className="text-[9px] bg-teal-100 text-teal-800 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                            🛡️ Unified AYUSH Grid
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {medicalSystem === "allopathy" ? (
                          <>
                            <button 
                              onClick={() => handleSymptomPreset("Patient complaining of severe chest congestion, wet chesty cough for 3 days, body aches, high temperature 101F. Also reports a sore swallowing throat.")}
                              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
                            >
                              Cough & Fever 🩺
                            </button>
                            <button 
                              onClick={() => handleSymptomPreset("Stomach pain and heavy burning acidity sensation after heavy meals. Mild bloating, dry vomiting in morning. Stool is normal.")}
                              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
                            >
                              Acidity & Stomach pain 🩺
                            </button>
                            <button 
                              onClick={() => handleSymptomPreset("Diabetic follow up. Complains of frequent urination in night times and excessive thirst. Fasting sugar checked this morning was 180 mg/dL.")}
                              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
                            >
                              Diabetes Follow-up 🩺
                            </button>
                          </>
                        ) : medicalSystem === "ayurveda" ? (
                          <>
                            <button 
                              onClick={() => handleSymptomPreset("Kasa (Severe dry cough) and Peenasa (nasal congestion) for 4 days, with body fatigue and slightly sluggish digestion (Manda Agni).")}
                              className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 transition-all"
                            >
                              Kasa & Swasa (Cough) 🌿
                            </button>
                            <button 
                              onClick={() => handleSymptomPreset("Amlapitta (burning chest hyperacidity) after spicy meals, mild flatulence, and a sticky coated tongue indicating Ama presence.")}
                              className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 transition-all"
                            >
                              Amlapitta (Acidity) 🌿
                            </button>
                            <button 
                              onClick={() => handleSymptomPreset("Madhumēha follow-up. Polyuria at night, high fatigue, and irregularities in Vishamagni digestive fire.")}
                              className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 transition-all"
                            >
                              Madhumēha (Diabetes) 🌿
                            </button>
                          </>
                        ) : medicalSystem === "homeopathy" ? (
                          <>
                            <button 
                              onClick={() => handleSymptomPreset("Severe spasmodic wet cough, nose running with burning acrid discharge, extreme restlessness, worse after midnight.")}
                              className="text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg border border-purple-200 transition-all"
                            >
                              Coryza & Spasmodic Cough 🌸
                            </button>
                            <button 
                              onClick={() => handleSymptomPreset("Severe gastralgia, acidic vomiting, flatulence, sedentary lifestyle with high intake of spicy food and coffee.")}
                              className="text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg border border-purple-200 transition-all"
                            >
                              Gastric Dyspepsia 🌸
                            </button>
                          </>
                        ) : medicalSystem === "unani" ? (
                          <>
                            <button 
                              onClick={() => handleSymptomPreset("Nazla-e-Zukaam (excessive chest catarrh and cough), heavy forehead, feeling cold with Balgham (phlegm) overload.")}
                              className="text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 px-3 py-1.5 rounded-lg border border-teal-200 transition-all"
                            >
                              Nazla-e-Zukaam (Catarrh) 🧪
                            </button>
                          </>
                        ) : medicalSystem === "siddha" ? (
                          <>
                            <button 
                              onClick={() => handleSymptomPreset("Kaba Suram respiratory fever with severe body aches, dry cough, and loss of taste.")}
                              className="text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 px-3 py-1.5 rounded-lg border border-cyan-200 transition-all"
                            >
                              Kaba Suram (Fever) 🧬
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleSymptomPreset("Severe chronic back stiffness, mental fatigue, shallow breathing pattern, and postural muscle tension.")}
                              className="text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 transition-all"
                            >
                              Prana Alignment & Tension 🧘
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Text symptoms input */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase">Presenting Symptoms / Clinical Observations</label>
                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-0.5 rounded-full shadow-inner">
                          <button
                            type="button"
                            onClick={() => setAiEngine("auto")}
                            className={`text-[9px] font-black px-2.5 py-1 rounded-full transition-all flex items-center gap-0.5 cursor-pointer ${
                              aiEngine === "auto"
                                ? "bg-white text-indigo-700 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            🤖 Auto Router
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiEngine("gemini")}
                            className={`text-[9px] font-black px-2.5 py-1 rounded-full transition-all flex items-center gap-0.5 cursor-pointer ${
                              aiEngine === "gemini"
                                ? "bg-white text-cura-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            ✦ Gemini
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiEngine("deepseek")}
                            className={`text-[9px] font-black px-2.5 py-1 rounded-full transition-all flex items-center gap-0.5 cursor-pointer ${
                              aiEngine === "deepseek"
                                ? "bg-white text-teal-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            🐳 DeepSeek
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={symptomsInput}
                        onChange={(e) => setSymptomsInput(e.target.value)}
                        placeholder="Type symptoms or select a preset above..."
                        rows={4}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cura-primary/10"
                      />
                    </div>

                    <button
                      onClick={handleGenerateAISuggestion}
                      disabled={isGeneratingAI || !symptomsInput.trim()}
                      className="w-full py-3 bg-gradient-to-r from-sky-400 to-emerald-400 hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-45"
                    >
                      {isGeneratingAI ? (
                        <>⏳ Consulting EMR AI Agent...</>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> Analyse Symptoms & Draft Prescription
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI SUGGESTION RESULTS PANEL */}
                  <AnimatePresence>
                    {aiResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="bg-white rounded-3xl p-6 border-2 border-emerald-400/30 bg-emerald-50/50 shadow-lg space-y-6"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> EMR Assistant Suggestions
                              </span>
                              {aiResult.engineUsed && (
                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                  aiResult.engineUsed === "deepseek"
                                    ? "bg-teal-100 text-teal-800 border border-teal-200"
                                    : aiResult.engineUsed === "gemini"
                                    ? "bg-sky-100 text-sky-800 border border-sky-200"
                                    : "bg-slate-100 text-slate-800 border border-slate-200"
                                }`}>
                                  {aiResult.engineUsed === "deepseek" ? "🐳 DeepSeek Active" : aiResult.engineUsed === "gemini" ? "✦ Gemini Active" : "⚙️ Clinical Heuristics"}
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-black text-slate-800 mt-2">Diagnoses Suggestion</h4>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {aiResult.diagnoses && aiResult.diagnoses.map(d => (
                                <span key={d} className="text-xs bg-slate-900 text-white font-extrabold px-3 py-1 rounded-full">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <button 
                            onClick={addAllSuggestedToActive}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                          >
                            <Check className="h-4 w-4" /> Add All Medications
                          </button>
                        </div>

                        {/* Intelligent Routing Analysis & Logs */}
                        {(aiResult.routingExplanation || aiResult.confidence !== undefined) && (
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 space-y-2.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> AI Engine Router Log
                              </span>
                              {aiResult.confidence !== undefined && (
                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                  aiResult.confidence >= 0.85
                                    ? "bg-emerald-100 text-emerald-800"
                                    : aiResult.confidence >= 0.70
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}>
                                  Confidence: {(aiResult.confidence * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                            {aiResult.routingExplanation && (
                              <p className="text-xs font-semibold text-indigo-950 leading-relaxed">
                                {aiResult.routingExplanation}
                              </p>
                            )}
                            {aiResult.fallbackUsed && (
                              <div className="text-[11px] bg-amber-50 text-amber-900 rounded-xl p-2.5 border border-amber-200/50 space-y-1">
                                <span className="font-extrabold flex items-center gap-1 uppercase tracking-wide text-amber-800">
                                  ⚠️ Fallback Triggered
                                </span>
                                <p className="font-medium text-amber-700 leading-snug">
                                  {aiResult.fallbackReason || "Primary engine returned low confidence or failed. Seamlessly switched to secondary engine."}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Summary */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI Clinical Summary</span>
                          <p className="text-xs font-semibold text-slate-600 leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-slate-100">
                            {aiResult.summary}
                          </p>
                        </div>

                        {/* Lab Tests */}
                        {aiResult.recommendedTests && aiResult.recommendedTests.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Recommended Diagnostic Tests</span>
                            <div className="flex flex-wrap gap-1.5">
                              {aiResult.recommendedTests.map(test => (
                                <span key={test} className="text-xs bg-sky-50 text-cura-primary-dark font-semibold px-3 py-1 rounded-lg border border-sky-100">
                                  📋 {test}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Allergy Warnings */}
                        {aiResult.drugInteractions && aiResult.drugInteractions.length > 0 && (
                          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 space-y-2">
                            <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                              <AlertCircle className="h-4 w-4" /> DRUG CONTRAINDICATIONS & SAFETY WARNINGS
                            </span>
                            <ul className="list-disc pl-5 text-xs font-semibold text-rose-600 space-y-1">
                              {aiResult.drugInteractions.map((alert, idx) => (
                                <li key={idx}>{alert}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Medications suggestion list */}
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Suggested Medication Prescriptions (AI Clinical Copilot)</span>
                          <div className="space-y-3">
                            {aiResult.medications && aiResult.medications.map((med, idx) => {
                              const medAlerts = evaluateMedicationSafety(med, activePrescriptions, selectedPatient);
                              const hasAlerts = medAlerts.length > 0;

                              if (hasAlerts) {
                                const primaryAlert = medAlerts[0];
                                return (
                                  <div key={idx} className="p-4 bg-rose-50/40 border-2 border-rose-400 rounded-2xl space-y-3 shadow-sm relative">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-black text-sm text-rose-950 flex items-center gap-1.5">
                                            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                                            {med.drugName}
                                          </span>
                                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                                            {med.dosage}
                                          </span>
                                          <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded">
                                            {med.frequency}
                                          </span>
                                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                                            {med.duration}
                                          </span>
                                        </div>
                                        <p className="text-xs text-rose-800 font-semibold">
                                          <strong>Reason:</strong> {med.reason}
                                        </p>
                                      </div>

                                      <button 
                                        onClick={() => addMedicationToActive(med)}
                                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-300 bg-white text-rose-700 hover:bg-rose-100 transition-all shrink-0 cursor-pointer"
                                      >
                                        ⚠️ Add Original (Override)
                                      </button>
                                    </div>

                                    {/* Interaction Banner */}
                                    <div className="bg-white border border-rose-200 rounded-xl p-3 space-y-2 text-xs">
                                      <p className="font-extrabold text-rose-700 flex items-center gap-1.5">
                                        <ShieldAlert className="h-4 w-4 text-rose-600" /> {primaryAlert.title}
                                      </p>
                                      <p className="text-slate-600 font-medium">
                                        <strong className="text-rose-800">Trigger Source:</strong> {primaryAlert.triggerSource} — {primaryAlert.description}
                                      </p>

                                      {/* Suggested Safe Alternative Drug */}
                                      {primaryAlert.suggestedAlternativeDrug && (
                                        <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                          <div>
                                            <p className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                                              <Zap className="h-3.5 w-3.5 text-emerald-600" /> Recommended Safe Alternative Drug:
                                            </p>
                                            <p className="text-xs font-bold text-emerald-800 mt-0.5">
                                              💊 {primaryAlert.suggestedAlternativeDrug.drugName} • {primaryAlert.suggestedAlternativeDrug.dosage} ({primaryAlert.suggestedAlternativeDrug.frequency})
                                            </p>
                                            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                                              {primaryAlert.suggestedAlternativeDrug.reason}
                                            </p>
                                          </div>
                                          <button
                                            onClick={() => handleAddSafeAlternativeFromSuggested(primaryAlert.suggestedAlternativeDrug)}
                                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                                          >
                                            <Zap className="h-3.5 w-3.5" /> + Add Safe Alternative
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-extrabold text-sm text-slate-800">{med.drugName}</span>
                                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                                        {med.dosage}
                                      </span>
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                                        {med.frequency}
                                      </span>
                                      <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded">
                                        {med.duration}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">
                                      <strong className="text-slate-600">Reason:</strong> {med.reason}
                                    </p>
                                  </div>

                                  <button 
                                    onClick={() => addMedicationToActive(med)}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
                                  >
                                    + Add Rx
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Lifestyle Advice */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI Advice / Safety Instructions</span>
                          <p className="text-xs font-semibold text-slate-600 bg-white/70 p-3.5 rounded-2xl border border-slate-100">
                            {aiResult.additionalAdvice}
                          </p>
                        </div>

                        {/* Notice for lack of API keys */}
                        {aiResult.apiNotice && (
                          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-[10px] text-purple-700 font-mono font-bold flex items-center gap-1.5">
                            <Database className="h-3.5 w-3.5" /> Note: {aiResult.apiNotice}
                          </div>
                        )}

                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ACTIVE PRESCRIPTION COMPILED WRITER */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <span>Active Consultation Prescription Writer</span>
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                          Real-Time Safety Engine
                        </span>
                      </h3>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Finalized Diagnosis *</label>
                        <input 
                          type="text" 
                          value={customDiagnosis}
                          onChange={(e) => setCustomDiagnosis(e.target.value)}
                          placeholder="e.g. Acute Viral Pharyngitis"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-400 uppercase">Compiled Medications ({activePrescriptions.length})</label>
                      </div>

                      {/* Safety Summary Banner */}
                      {(() => {
                        const allActiveAlerts = activePrescriptions.flatMap(m => evaluateMedicationSafety(m, activePrescriptions, selectedPatient));
                        if (allActiveAlerts.length > 0) {
                          return (
                            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3 text-rose-800">
                              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                              <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-wider text-rose-800">
                                  🚨 {allActiveAlerts.length} Clinical Safety Interaction Alert{allActiveAlerts.length > 1 ? "s" : ""} Triggered
                                </p>
                                <p className="text-xs font-semibold text-rose-700">
                                  One or more compiled medications clash with the patient's allergy profile, chronic medications, or safe dose limits. Please apply safe alternatives below before finalizing.
                                </p>
                              </div>
                            </div>
                          );
                        } else if (activePrescriptions.length > 0) {
                          return (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span>100% Interaction Safe — No allergy contraindications or drug-drug clashes detected across active Rx.</span>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {activePrescriptions.length > 0 ? (
                        <div className="space-y-3">
                          {activePrescriptions.map((med, idx) => {
                            const medAlerts = evaluateMedicationSafety(med, activePrescriptions, selectedPatient);
                            const hasAlerts = medAlerts.length > 0;

                            if (hasAlerts) {
                              return (
                                <div key={idx} className="p-4 bg-rose-50/40 border-2 border-rose-400 rounded-2xl space-y-3 relative shadow-sm">
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-black text-sm text-rose-950 flex items-center gap-1.5">
                                          <Pill className="h-4 w-4 text-rose-600" />
                                          {med.drugName}
                                        </span>
                                        <span className="font-mono text-xs font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                                          {med.dosage}
                                        </span>
                                        <span className="text-xs font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                                          {med.frequency}
                                        </span>
                                        <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                                          {med.duration}
                                        </span>
                                      </div>
                                      <p className="text-xs font-medium text-rose-700 mt-1">
                                        <strong>Reason:</strong> {med.reason}
                                      </p>
                                    </div>
                                    <button 
                                      onClick={() => removeMedicationFromActive(idx)}
                                      className="text-rose-500 hover:text-rose-800 p-1.5 hover:bg-rose-100 rounded-full transition-all"
                                      title="Remove medication"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>

                                  {/* Active alerts for this medication */}
                                  {medAlerts.map((alert, aIdx) => (
                                    <div key={aIdx} className="bg-white border border-rose-200 rounded-xl p-3 space-y-2 text-xs">
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div className="flex items-center gap-1.5 font-black text-rose-700">
                                          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                                          <span>{alert.title}</span>

                                          {/* Hover Tooltip trigger icon */}
                                          <div className="relative inline-block">
                                            <button
                                              onMouseEnter={() => setHoveredAlertKey(`active-med-${idx}-${aIdx}`)}
                                              onMouseLeave={() => setHoveredAlertKey(null)}
                                              className="p-1 bg-rose-100 text-rose-800 rounded-full hover:bg-rose-200 transition-all cursor-pointer"
                                              title="Hover to view dosage guidance"
                                            >
                                              <Info className="h-3.5 w-3.5" />
                                            </button>

                                            {/* HOVER TOOLTIP POPUP */}
                                            {hoveredAlertKey === `active-med-${idx}-${aIdx}` && (
                                              <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-2xl z-50 pointer-events-none border border-slate-700 space-y-1">
                                                <p className="font-extrabold text-amber-400">💡 Clinical AI Guidance Tooltip:</p>
                                                <p className="text-slate-300 font-medium leading-tight">{alert.description}</p>
                                                {alert.suggestedAlternativeDose && (
                                                  <p className="text-emerald-300 font-bold">Suggested Dose: {alert.suggestedAlternativeDose.dosage} ({alert.suggestedAlternativeDose.frequency})</p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <button
                                          onClick={() => setDosageAdjustmentModal({
                                            isOpen: true,
                                            med: med,
                                            alerts: medAlerts,
                                            activeIndex: idx,
                                            isCustomInput: false
                                          })}
                                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1 shrink-0"
                                        >
                                          <Sliders className="h-3 w-3" /> Dosage Adjustment Modal
                                        </button>
                                      </div>

                                      <p className="text-slate-600 font-medium leading-relaxed">
                                        <strong className="text-rose-800">Trigger:</strong> {alert.triggerSource} — {alert.description}
                                      </p>

                                      {/* Actionable safe alternative buttons */}
                                      <div className="pt-1 flex flex-wrap gap-2 items-center">
                                        {alert.suggestedAlternativeDrug && (
                                          <button
                                            onClick={() => handleApplyAlternativeDrugInActive(idx, alert.suggestedAlternativeDrug)}
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                          >
                                            <Zap className="h-3.5 w-3.5" />
                                            <span>Apply Safe Alternative Drug: <strong>{alert.suggestedAlternativeDrug.drugName}</strong></span>
                                          </button>
                                        )}

                                        {alert.suggestedAlternativeDose && (
                                          <button
                                            onClick={() => handleApplyAlternativeDoseInActive(idx, alert.suggestedAlternativeDose)}
                                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                          >
                                            <Zap className="h-3.5 w-3.5" />
                                            <span>Apply Safe Dose: <strong>{alert.suggestedAlternativeDose.dosage}</strong></span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  {/* Override Justification Input */}
                                  <div className="pt-1">
                                    <input
                                      type="text"
                                      placeholder="Override clinical note (optional justification for co-prescription)..."
                                      value={overrideNotes[idx] || ""}
                                      onChange={(e) => setOverrideNotes(prev => ({ ...prev, [idx]: e.target.value }))}
                                      className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-rose-400"
                                    />
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs font-semibold">
                                <div>
                                  <p className="font-extrabold text-slate-800 text-sm">
                                    {med.drugName} <span className="font-mono text-xs font-bold bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded ml-1">{med.dosage}</span>
                                  </p>
                                  <p className="text-slate-500 mt-1">
                                    Frequency: <span className="text-slate-800 font-bold">{med.frequency}</span> • Duration: <span className="text-slate-800 font-bold">{med.duration}</span>
                                  </p>
                                </div>
                                <button 
                                  onClick={() => removeMedicationFromActive(idx)}
                                  className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-full transition-all cursor-pointer"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                          No medications in current Rx. Accept EMR recommendations or type custom medications below.
                        </div>
                      )}

                      {/* Custom Medication Quick Adder */}
                      {(() => {
                        const customInputAlerts = customMedName.trim() ? evaluateMedicationSafety(
                          {
                            drugName: customMedName,
                            dosage: customMedDosage,
                            frequency: customMedFreq,
                            duration: customMedDuration,
                            reason: customMedReason
                          },
                          activePrescriptions,
                          selectedPatient
                        ) : [];
                        const hasCustomAlert = customInputAlerts.length > 0;
                        const primaryCustomAlert = customInputAlerts[0];

                        return (
                          <div className={`rounded-2xl p-4 space-y-3 transition-all ${
                            hasCustomAlert 
                              ? "bg-rose-50/80 border-2 border-rose-400 ring-4 ring-rose-500/10 shadow-lg shadow-rose-500/10" 
                              : "bg-slate-50 border border-slate-200"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <PlusCircle className={`h-4 w-4 ${hasCustomAlert ? "text-rose-600" : "text-emerald-600"}`} /> 
                                Add Custom Medication to Rx
                              </span>
                              {hasCustomAlert ? (
                                <span className="text-[10px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                  <AlertTriangle className="h-3 w-3" /> Live Interaction Warning
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400">Live Safety Checks Active</span>
                              )}
                            </div>

                            {/* Live Alert Warning Ribbon with Tooltip & Modal Trigger */}
                            {hasCustomAlert && primaryCustomAlert && (
                              <div className="bg-white border-2 border-rose-300 rounded-xl p-3 space-y-2 relative shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                                    <span className="text-xs font-black text-rose-900">{primaryCustomAlert.title}</span>
                                    
                                    {/* Hover Tooltip trigger icon */}
                                    <div className="relative inline-block">
                                      <button
                                        onMouseEnter={() => setHoveredAlertKey("custom-input")}
                                        onMouseLeave={() => setHoveredAlertKey(null)}
                                        className="p-1 bg-rose-100 text-rose-800 rounded-full hover:bg-rose-200 transition-all cursor-pointer"
                                        title="Hover to view dosage adjustment advice"
                                      >
                                        <Info className="h-3.5 w-3.5" />
                                      </button>

                                      {/* HOVER TOOLTIP POPUP */}
                                      {hoveredAlertKey === "custom-input" && (
                                        <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-2xl z-50 pointer-events-none border border-slate-700 space-y-1">
                                          <p className="font-extrabold text-amber-400">💡 Clinical AI Guidance Tooltip:</p>
                                          <p className="text-slate-300 font-medium leading-tight">{primaryCustomAlert.description}</p>
                                          {primaryCustomAlert.suggestedAlternativeDose && (
                                            <p className="text-emerald-300 font-bold">Suggested Dose: {primaryCustomAlert.suggestedAlternativeDose.dosage} ({primaryCustomAlert.suggestedAlternativeDose.frequency})</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => setDosageAdjustmentModal({
                                      isOpen: true,
                                      med: {
                                        drugName: customMedName,
                                        dosage: customMedDosage,
                                        frequency: customMedFreq,
                                        duration: customMedDuration,
                                        reason: customMedReason
                                      },
                                      alerts: customInputAlerts,
                                      isCustomInput: true
                                    })}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
                                  >
                                    <Sliders className="h-3.5 w-3.5" /> Open Dosage Adjustment Modal
                                  </button>
                                </div>

                                <p className="text-[11px] text-rose-800 font-medium">
                                  <strong>Trigger Source:</strong> {primaryCustomAlert.triggerSource} — {primaryCustomAlert.description}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                              <input
                                type="text"
                                placeholder="Drug Name (e.g. Paracetamol, Aspirin)"
                                value={customMedName}
                                onChange={(e) => setCustomMedName(e.target.value)}
                                className={`sm:col-span-2 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                                  hasCustomAlert
                                    ? "bg-rose-50/90 border-2 border-rose-400 text-rose-950 font-bold focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                    : "bg-white border border-slate-200 focus:border-emerald-500"
                                }`}
                              />
                              <input
                                type="text"
                                placeholder="Dosage (e.g. 500mg)"
                                value={customMedDosage}
                                onChange={(e) => setCustomMedDosage(e.target.value)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                                  hasCustomAlert
                                    ? "bg-rose-50/90 border-2 border-rose-400 text-rose-950 font-bold focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                    : "bg-white border border-slate-200 focus:border-emerald-500"
                                }`}
                              />
                              <input
                                type="text"
                                placeholder="Frequency (e.g. 1-0-1)"
                                value={customMedFreq}
                                onChange={(e) => setCustomMedFreq(e.target.value)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                                  hasCustomAlert
                                    ? "bg-rose-50/90 border-2 border-rose-400 text-rose-950 font-bold focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                    : "bg-white border border-slate-200 focus:border-emerald-500"
                                }`}
                              />
                              <button
                                onClick={handleAddCustomMedication}
                                disabled={!customMedName.trim()}
                                className={`py-2 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1 ${
                                  hasCustomAlert
                                    ? "bg-rose-700 hover:bg-rose-800"
                                    : "bg-slate-900 hover:bg-black"
                                }`}
                              >
                                <Plus className="h-4 w-4" /> Add Rx
                              </button>
                            </div>

                            {/* Quick Click Drug Presets */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="text-[10px] font-bold text-slate-400">Common Presets:</span>
                              {[
                                { name: "Paracetamol 650mg", dose: "650mg", freq: "1-0-1", dur: "5 days", reason: "Analgesic" },
                                { name: "Amoxicillin 500mg", dose: "500mg", freq: "1-0-1", dur: "5 days", reason: "Antibiotic" },
                                { name: "Pantoprazole 40mg", dose: "40mg", freq: "1-0-0", dur: "10 days", reason: "PPI Gastric Protection" },
                                { name: "Aspirin 75mg", dose: "75mg", freq: "1-0-0", dur: "30 days", reason: "Antiplatelet" },
                                { name: "Clarithromycin 500mg", dose: "500mg", freq: "1-0-1", dur: "5 days", reason: "Macrolide Antibiotic" },
                                { name: "Cefuroxime 500mg", dose: "500mg", freq: "1-0-1", dur: "5 days", reason: "Cephalosporin Antibiotic" }
                              ].map((preset, pIdx) => (
                                <button
                                  key={pIdx}
                                  onClick={() => {
                                    setCustomMedName(preset.name);
                                    setCustomMedDosage(preset.dose);
                                    setCustomMedFreq(preset.freq);
                                    setCustomMedDuration(preset.dur);
                                    setCustomMedReason(preset.reason);
                                  }}
                                  className="text-[10px] bg-white border border-slate-200 hover:border-slate-400 text-slate-700 font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer"
                                >
                                  + {preset.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {activeUserRole === "compliance" ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5">
                        <span>🔒</span>
                        <span>Read-Only Compliance: DPO role cannot finalize prescriptions under DPDP Act separation of duties.</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleFinalizeVisit}
                        disabled={activePrescriptions.length === 0}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md disabled:opacity-45 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="h-4.5 w-4.5" /> Finalize Consultation & WhatsApp Prescribe
                      </button>
                    )}
                  </div>

                </div>

                {/* RIGHT COLUMN: RECENT EHR HISTORY TIMELINE */}
                <div className="lg:col-span-4 space-y-6">
                  {selectedPatient && (
                    <DoctorDocumentScanner 
                      patient={selectedPatient}
                      onReportSaved={(updatedPatient) => {
                        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
                        setSelectedPatient(updatedPatient);
                      }}
                      activePrescriptions={activePrescriptions}
                      setActivePrescriptions={setActivePrescriptions}
                      setSuccessMsg={setSuccessMsg}
                      setErrorAlert={setErrorAlert}
                    />
                  )}

                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-800">
                        EHR Historical Records
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                        Consultation History Timeline
                      </p>
                    </div>

                    {selectedPatient.history && selectedPatient.history.length > 0 && (
                      <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-cura-primary-dark uppercase tracking-widest">
                            AI Context Memories ({selectedHistoryIndices.length} active)
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              if (selectedHistoryIndices.length === selectedPatient.history.length) {
                                setSelectedHistoryIndices([]);
                              } else {
                                setSelectedHistoryIndices(selectedPatient.history.map((_, i) => i));
                              }
                            }}
                            className="text-[10px] text-cura-primary font-black uppercase tracking-wider hover:underline"
                          >
                            {selectedHistoryIndices.length === selectedPatient.history.length ? "Clear All" : "Select All"}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          Click any historical record below to select/deselect it as context memory for Gemini's dosage and interaction analysis.
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {selectedPatient.history && selectedPatient.history.length > 0 ? (
                        selectedPatient.history.map((record, index) => {
                          const isSelected = selectedHistoryIndices.includes(index);
                          return (
                            <div 
                              key={index} 
                              onClick={() => {
                                setSelectedHistoryIndices(prev => 
                                  prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
                                );
                              }}
                              className="relative pl-6 pb-2 border-l-2 border-slate-100 last:border-0 last:pb-0 font-medium cursor-pointer transition-all duration-150 group"
                            >
                              {/* Dot icon / Checkbox */}
                              <div className={`absolute left-[-6px] top-1.5 h-3 w-3 rounded-full border-2 transition-all flex items-center justify-center ${
                                isSelected 
                                  ? "bg-sky-500 border-sky-500 text-white" 
                                  : "bg-white border-slate-300 group-hover:border-sky-400"
                              }`}>
                                {isSelected && <Check className="h-2 w-2 stroke-[4px]" />}
                              </div>
                              
                              <div className={`p-3 rounded-2xl border transition-all ${
                                isSelected 
                                  ? "bg-sky-50/40 border-sky-100 shadow-sm" 
                                  : "border-transparent opacity-65 group-hover:opacity-100 hover:bg-slate-50/50"
                              }`}>
                                <div className="flex justify-between items-start text-xs">
                                  <span className={`font-bold px-2 py-0.5 rounded-md ${
                                    isSelected ? "bg-sky-100 text-cura-primary-dark" : "bg-slate-100 text-slate-600"
                                  }`}>
                                    {record.date}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {record.doctor}
                                  </span>
                                </div>
                                
                                <p className="text-sm font-extrabold text-slate-800 mt-2 flex items-center gap-1">
                                  {record.diagnosis}
                                  {isSelected && (
                                    <span className="text-[8px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ml-auto">
                                      AI context
                                    </span>
                                  )}
                                </p>
                                
                                {record.symptoms && (
                                  <p className="text-xs text-slate-500 italic mt-1 leading-relaxed">
                                    &ldquo;{record.symptoms}&rdquo;
                                  </p>
                                )}

                                <div className="mt-2 space-y-1">
                                  {record.prescriptions && record.prescriptions.map((rx, rIdx) => (
                                    <span key={rIdx} className="block text-[11px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-100 font-mono">
                                      💊 {rx}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-xs font-semibold text-slate-400 italic">
                          No previous consultation timeline records found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              )}

            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <p className="text-slate-400 font-bold">Please select or register a patient from the directory sidebar.</p>
            </div>
          )}
        </main>
          </>
        ) : activeTab === "frontoffice" ? (
          /* FRONT OFFICE TERMINAL */
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 space-y-6">
            
            {/* FRONT OFFICE GREETING HEADER */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>🛎️ Front Office Receptionist Terminal</span>
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                  Patient Registration, Digital Clinical Identity (ABHA), and Doctor Appointment Queue Management
                </p>
              </div>
              <div className="flex gap-2">
                <div className="bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Front Desk Active</span>
                </div>
              </div>
            </div>

            {/* SUB-TAB NAVIGATOR */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setFrontOfficeSubTab("queue")}
                className={`py-3 px-6 text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  frontOfficeSubTab === "queue"
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <span>📋 Onboarding & Booking Queue</span>
              </button>
              <button
                onClick={() => {
                  setFrontOfficeSubTab("scheduler");
                  fetchSchedulerMessages();
                  fetchSchedulerRules();
                }}
                className={`py-3 px-6 text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  frontOfficeSubTab === "scheduler"
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <span>⏰ Automated Scheduler System</span>
                <span className="bg-sky-100 text-sky-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
                  {schedulerMessages.filter(m => m.status === "pending").length} Pending
                </span>
              </button>
              <button
                onClick={() => {
                  setFrontOfficeSubTab("calendar");
                  fetchAppointments();
                }}
                className={`py-3 px-6 text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  frontOfficeSubTab === "calendar"
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <span>📅 Appointments Calendar</span>
                <span className="bg-sky-100 text-sky-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
                  {appointments.length} Total
                </span>
              </button>
            </div>

            {frontOfficeSubTab === "queue" && (
              /* MAIN PORTAL SPLIT GRID */
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: PATIENT ONBOARDING FORM */}
              <div className="xl:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-sky-500" /> Onboard New Patient
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">EHR Creation</span>
                  </div>

                  {onboardingSuccessPatient ? (
                    /* ONBOARDING SUCCESS CARD */
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4"
                    >
                      <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                        <Check className="h-6 w-6" />
                      </div>
                      
                      <div>
                        <h4 className="font-extrabold text-emerald-800 text-base">Patient Onboarded!</h4>
                        <p className="text-xs text-emerald-600 font-medium mt-1">EHR Folder initialized on Cura Cloud Server</p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-3 text-left">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Patient Name</span>
                          <span className="text-xs font-bold text-slate-800">{onboardingSuccessPatient.fullName}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Patient Code</span>
                          <span className="text-xs font-mono font-bold text-sky-600">{onboardingSuccessPatient.patientCode || onboardingSuccessPatient.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">ABHA ID (NDHM)</span>
                          <span className="text-xs font-mono font-bold text-emerald-600">{onboardingSuccessPatient.abhaId || "Not generated"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          onClick={() => setShowPrintCardPatient(onboardingSuccessPatient)}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Printer className="h-3.5 w-3.5" /> Print Patient Clinical ID Card
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              // Focus on scheduling form with this patient
                              setSchedPatientId(onboardingSuccessPatient.id);
                              setSchedPatientName(onboardingSuccessPatient.fullName);
                              setSchedPatientCode(onboardingSuccessPatient.patientCode || "");
                              setSchedPhone(onboardingSuccessPatient.phone);
                              // Smooth scroll to the scheduling card
                              document.getElementById("sched-card")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold text-xs rounded-xl border border-sky-200 transition-all cursor-pointer"
                          >
                            📅 Book Visit
                          </button>
                          
                          <button
                            onClick={() => setOnboardingSuccessPatient(null)}
                            className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
                          >
                            Add Another
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* ONBOARDING REGISTRATION FORM */
                    <form onSubmit={handleReceptionOnboardingSubmit} className="space-y-4">
                      {/* Section 1: Demographics */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1. Demographics & Contact</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                            <input 
                              type="text" 
                              required 
                              value={recFullName}
                              onChange={(e) => setRecFullName(e.target.value)}
                              placeholder="e.g. Amit Patel"
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Phone (WhatsApp) *</label>
                            <input 
                              type="tel" 
                              required 
                              value={recPhone}
                              onChange={(e) => setRecPhone(e.target.value)}
                              placeholder="+91 99887 76655"
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                            <input 
                              type="email" 
                              value={recEmail}
                              onChange={(e) => setRecEmail(e.target.value)}
                              placeholder="amit@gmail.com"
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Date of Birth</label>
                            <input 
                              type="date" 
                              value={recDob}
                              onChange={(e) => setRecDob(e.target.value)}
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Gender *</label>
                            <select 
                              value={recGender}
                              onChange={(e: any) => setRecGender(e.target.value)}
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Blood Group</label>
                            <select 
                              value={recBloodGroup}
                              onChange={(e) => setRecBloodGroup(e.target.value)}
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white"
                            >
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Clinical NDHM */}
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. NDHM ABHA Health ID</p>
                          <button
                            type="button"
                            onClick={() => {
                              const randomAbha = `ABHA26${Math.floor(10000000 + Math.random() * 90000000)}`;
                              setRecAbhaId(randomAbha);
                            }}
                            className="text-[9px] text-sky-600 hover:text-sky-800 font-extrabold uppercase hover:underline cursor-pointer"
                          >
                            🪄 Generate Mock ABHA
                          </button>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">ABHA ID / Health Number (14 digits)</label>
                          <input 
                            type="text" 
                            value={recAbhaId}
                            onChange={(e) => setRecAbhaId(e.target.value)}
                            placeholder="e.g. ABHA2612345678"
                            className="w-full px-3 py-2 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      {/* Section 3: Medical Notes */}
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">3. Clinical Intake Notes</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Drug Allergies (comma separated)</label>
                            <input 
                              type="text" 
                              value={recAllergies}
                              onChange={(e) => setRecAllergies(e.target.value)}
                              placeholder="Sulfa, Penicillin"
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Chronic Meds (comma separated)</label>
                            <input 
                              type="text" 
                              value={recMeds}
                              onChange={(e) => setRecMeds(e.target.value)}
                              placeholder="Metformin 500mg, etc."
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Emergency Contact Number</label>
                          <input 
                            type="tel" 
                            value={recEmergencyContact}
                            onChange={(e) => setRecEmergencyContact(e.target.value)}
                            placeholder="+91 99887 76655"
                            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      {/* Section 4: Address */}
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">4. Billing & Postal Address</p>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Street Address</label>
                          <input 
                            type="text" 
                            value={recAddress}
                            onChange={(e) => setRecAddress(e.target.value)}
                            placeholder="G-12, Sector 5, Medical Enclave"
                            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Pincode</label>
                            <input 
                              type="text" 
                              value={recPincode}
                              onChange={(e) => setRecPincode(e.target.value)}
                              placeholder="110001"
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">City</label>
                            <input 
                              type="text" 
                              value={recCity}
                              onChange={(e) => setRecCity(e.target.value)}
                              placeholder="New Delhi"
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">State</label>
                            <input 
                              type="text" 
                              value={recState}
                              onChange={(e) => setRecState(e.target.value)}
                              placeholder="Delhi"
                              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isRegisteringRec}
                        className="w-full py-3.5 mt-2 gradient-btn-cura hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isRegisteringRec ? (
                          <span>Registering Patient...</span>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" /> Initialize EHR File & Generate Code
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: APPOINTMENT BOOKING & QUEUE MANAGER */}
              <div className="xl:col-span-7 space-y-6">
                
                {/* APPOINTMENT BOOKING FORM CARD */}
                <div id="sched-card" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-sky-500" /> Book Patient Appointment
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Token Dispatch</span>
                  </div>

                  {schedSuccessMsg && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center justify-between">
                      <span>🎉 {schedSuccessMsg}</span>
                      <button onClick={() => setSchedSuccessMsg("")} className="text-emerald-500 font-black cursor-pointer">✕</button>
                    </div>
                  )}

                  <form onSubmit={handleScheduleAppointmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Select Onboarded Patient *</label>
                      <select
                        required
                        value={schedPatientId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSchedPatientId(val);
                          const patient = patients.find(p => p.id === val);
                          if (patient) {
                            setSchedPatientName(patient.fullName);
                            setSchedPatientCode(patient.patientCode || "");
                            setSchedPhone(patient.phone);
                          } else {
                            setSchedPatientName("");
                            setSchedPatientCode("");
                            setSchedPhone("");
                          }
                        }}
                        className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white"
                      >
                        <option value="">-- Choose Patient from Directory --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.fullName} ({p.patientCode || p.id}) - {p.phone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Doctor In-Charge *</label>
                      <select
                        required
                        value={schedDoctorName}
                        onChange={(e) => setSchedDoctorName(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white"
                      >
                        <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma (Cardiology)</option>
                        <option value="Dr. Ananya Reddy">Dr. Ananya Reddy (General Physician)</option>
                        <option value="Dr. Vikram Malhotra">Dr. Vikram Malhotra (Pediatrician)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Consultation Type *</label>
                      <select
                        required
                        value={schedType}
                        onChange={(e: any) => setSchedType(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white"
                      >
                        <option value="in_person">In-Clinic Physical Visit 🩺</option>
                        <option value="video">Tele-Medicine Video Consult 📹</option>
                        <option value="voice">Audio Call Consultation 📞</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Appointment Date & Time *</label>
                      <input
                        type="datetime-local"
                        required
                        value={schedAt}
                        onChange={(e) => setSchedAt(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-white"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Reason for Visit / Main Complaints</label>
                      <input
                        type="text"
                        value={schedReason}
                        onChange={(e) => setSchedReason(e.target.value)}
                        placeholder="e.g. 3-day history of high fever, routine cardiac review"
                        className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isScheduling}
                        className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {isScheduling ? "Booking Token..." : "📅 Confirm Appointment & Send WhatsApp"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* CLINIC APPOINTMENTS LOG QUEUE TIMER */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-sky-500" /> Active Consultation Queue Timeline
                    </h3>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {appointments.length} Scheduled
                    </span>
                  </div>

                  {appointments.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6 font-semibold">No appointments scheduled for today.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto pr-1">
                      {appointments.map((apt) => {
                        const originalPatient = patients.find(p => p.id === apt.patientId || p.patientCode === apt.patientCode);
                        return (
                          <div key={apt.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-slate-800">{apt.patientName}</span>
                                <span className="text-[10px] font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">{apt.patientCode}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  apt.status === "scheduled" ? "bg-amber-100 text-amber-800" :
                                  apt.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                                  apt.status === "in_progress" ? "bg-purple-100 text-purple-800 animate-pulse" :
                                  apt.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                                  "bg-rose-100 text-rose-800"
                                }`}>
                                  {apt.status}
                                </span>
                              </div>
                              <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-3 flex-wrap">
                                <span>🩺 {apt.doctorName}</span>
                                <span>📞 {apt.phone}</span>
                                <span>📅 {new Date(apt.scheduledAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                              </div>
                              <p className="text-[11px] font-medium text-slate-500 italic">"Reason: {apt.reason}"</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                              {/* Quick Print Patient ID Card */}
                              <button
                                onClick={() => {
                                  if (originalPatient) {
                                    setShowPrintCardPatient(originalPatient);
                                  } else {
                                    // Create full patient object for quick viewing
                                    setShowPrintCardPatient({
                                      id: apt.patientId,
                                      fullName: apt.patientName,
                                      age: 35,
                                      gender: "Male",
                                      phone: apt.phone,
                                      email: "",
                                      bloodGroup: "O+",
                                      allergies: [],
                                      currentMedications: [],
                                      history: [],
                                      patientCode: apt.patientCode,
                                      createdAt: new Date().toISOString()
                                    });
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                                title="Print Patient Card"
                              >
                                <Printer className="h-4 w-4" />
                              </button>

                              {/* Status transitions */}
                              <select
                                value={apt.status}
                                onChange={(e) => handleUpdateAppointmentStatus(apt.id, e.target.value)}
                                className="text-[10px] font-extrabold bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none bg-white"
                              >
                                <option value="scheduled">Scheduled</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="in_progress">In-Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>
            )}

            {frontOfficeSubTab === "scheduler" && (
              /* AUTOMATED SCHEDULER SYSTEM VIEW */
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* LEFT SIDEBAR: SCHEDULER CONTROLS & NEW ACTION FORM */}
                <div className="xl:col-span-5 space-y-6">
                  
                  {/* TAB SWITCHER */}
                  <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSchedulerActiveTab("follow_up")}
                      className={`flex-1 py-2 px-3 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        schedulerActiveTab === "follow_up"
                          ? "bg-sky-500 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span>📅 Follow-Up</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchedulerActiveTab("medication")}
                      className={`flex-1 py-2 px-3 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        schedulerActiveTab === "medication"
                          ? "bg-sky-500 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span>💊 Medication</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchedulerActiveTab("rules")}
                      className={`flex-1 py-2 px-3 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        schedulerActiveTab === "rules"
                          ? "bg-sky-500 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span>⚙️ Rules</span>
                    </button>
                  </div>

                  {/* FORM DEPENDING ON ACTIVE SCHEDULER TAB */}
                  {schedulerActiveTab === "follow_up" && (
                    <form onSubmit={handleScheduleFollowUpSubmit} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                          <Bell className="h-4 w-4 text-sky-500" /> Schedule Follow-Up
                        </h3>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Automated SMS/WA</span>
                      </div>

                      {followUpSuccessMsg && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-2xl font-semibold">
                          {followUpSuccessMsg}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Patient Profile *</label>
                        <select
                          value={schedFollowUpPatientId}
                          onChange={(e) => setSchedFollowUpPatientId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          required
                        >
                          <option value="">-- Choose Onboarded Patient --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.fullName} ({p.patientCode || p.id}) - {p.phone}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Doctor In Charge *</label>
                        <input
                          type="text"
                          value={schedFollowUpDoctor}
                          onChange={(e) => setSchedFollowUpDoctor(e.target.value)}
                          placeholder="e.g. Dr. Rajesh Sharma"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Follow-Up Target Date *</label>
                        <input
                          type="datetime-local"
                          value={schedFollowUpDate}
                          onChange={(e) => setSchedFollowUpDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Reason / Diagnostic Context</label>
                        <input
                          type="text"
                          value={schedFollowUpReason}
                          onChange={(e) => setSchedFollowUpReason(e.target.value)}
                          placeholder="e.g. Review Hemoglobin/BP reports, post-surgery check"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSchedulingFollowUp}
                        className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white text-xs font-black py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm border-0"
                      >
                        {isSchedulingFollowUp ? "Creating Dispatch Rule..." : "📅 Confirm & Schedule Follow-Up"}
                      </button>

                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        💡 Reminders are auto-dispatched exactly 2 days prior to the target follow-up time. If the date is closer, they schedule immediately!
                      </p>
                    </form>
                  )}

                  {schedulerActiveTab === "medication" && (
                    <form onSubmit={handleScheduleMedicationSubmit} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                          <Bell className="h-4 w-4 text-sky-500" /> Medication Alert
                        </h3>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Chronic Care / Prescriptions</span>
                      </div>

                      {medicationSuccessMsg && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-2xl font-semibold">
                          {medicationSuccessMsg}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Patient Profile *</label>
                        <select
                          value={schedMedicationPatientId}
                          onChange={(e) => setSchedMedicationPatientId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          required
                        >
                          <option value="">-- Choose Onboarded Patient --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.fullName} ({p.patientCode || p.id}) - {p.phone}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Medicine Name *</label>
                          <input
                            type="text"
                            value={schedMedicationName}
                            onChange={(e) => setSchedMedicationName(e.target.value)}
                            placeholder="e.g. Metformin"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Dosage *</label>
                          <input
                            type="text"
                            value={schedMedicationDosage}
                            onChange={(e) => setSchedMedicationDosage(e.target.value)}
                            placeholder="e.g. 500mg"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Daily Time *</label>
                          <input
                            type="time"
                            value={schedMedicationTime}
                            onChange={(e) => setSchedMedicationTime(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Special Instructions</label>
                          <input
                            type="text"
                            value={schedMedicationInstructions}
                            onChange={(e) => setSchedMedicationInstructions(e.target.value)}
                            placeholder="e.g. After meals"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSchedulingMedication}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-black py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm border-0"
                      >
                        {isSchedulingMedication ? "Activating Prescription Alerts..." : "💊 Activate Daily Medication Alarm"}
                      </button>
                    </form>
                  )}

                  {schedulerActiveTab === "rules" && (
                    <form onSubmit={handleCreateRuleSubmit} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                          <Layers className="h-4 w-4 text-sky-500" /> Automation Rule
                        </h3>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cron Engine Config</span>
                      </div>

                      {ruleSuccessMsg && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-2xl font-semibold">
                          {ruleSuccessMsg}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Rule Name *</label>
                        <input
                          type="text"
                          value={schedRuleName}
                          onChange={(e) => setSchedRuleName(e.target.value)}
                          placeholder="e.g. 48-Hour Follow-Up Reminder"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Trigger Event Type *</label>
                        <select
                          value={schedRuleType}
                          onChange={(e) => setSchedRuleType(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          required
                        >
                          <option value="appointment">Appointment Booking</option>
                          <option value="medication">Medication Log</option>
                          <option value="follow_up">Clinical Follow-up</option>
                        </select>
                      </div>

                      {schedRuleType === "appointment" && (
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase">Trigger Timing (Hours before event) *</label>
                          <input
                            type="number"
                            value={schedRuleTriggerHours}
                            onChange={(e) => setSchedRuleTriggerHours(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            required
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">WhatsApp / SMS Template *</label>
                        <select
                          value={schedRuleTemplate}
                          onChange={(e) => setSchedRuleTemplate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          required
                        >
                          <option value="APPOINTMENT_REMINDER">APPOINTMENT_REMINDER (Standard Confirmation)</option>
                          <option value="MEDICATION_REMINDER">MEDICATION_REMINDER (Prescription Alert)</option>
                          <option value="FOLLOW_UP_REMINDER">FOLLOW_UP_REMINDER (Clinical Review Call)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isCreatingRule}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-black py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm border-0"
                      >
                        {isCreatingRule ? "Deploying Trigger..." : "⚙️ Activate Autopilot Rule"}
                      </button>
                    </form>
                  )}

                </div>

                {/* RIGHT COLUMN: OUTBOX & MESSAGE QUEUE VIEW */}
                <div className="xl:col-span-7 space-y-6">
                  
                  {/* LIVE MESSAGE MONITOR */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-sm">
                          ⏳ Live Queue Monitor & Message Outbox
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Real-time processing log. Queue auto-polls and dispatches every 10 seconds.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          fetchSchedulerMessages();
                          fetchSchedulerRules();
                        }}
                        className="p-2 text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-black border-0"
                      >
                        <RefreshCw className="h-3 w-3" /> Refresh Outbox
                      </button>
                    </div>

                    {/* RULES AUTOPILOT SUB-DISPLAY */}
                    {schedulerRules.length > 0 && (
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          🤖 Active Autopilot Rule Triggers ({schedulerRules.length})
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {schedulerRules.map((rule: any) => (
                            <div key={rule.id} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-slate-700">{rule.ruleName}</p>
                                <p className="text-[9px] text-slate-400 font-semibold">
                                  Type: {rule.scheduleType} | Template: {rule.templateName}
                                </p>
                              </div>
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase">
                                Active
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LIVE QUEUED MESSAGES LIST */}
                    <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                      {schedulerMessages.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <p className="font-bold text-sm">No scheduled actions found</p>
                          <p className="text-xs mt-1">Use the forms on the left to schedule a new patient communication rule.</p>
                        </div>
                      ) : (
                        schedulerMessages.map((msg: any) => {
                          const isPending = msg.status === "pending" || msg.status === "retry";
                          return (
                            <div 
                              key={msg.id} 
                              className={`p-4 rounded-2xl border border-slate-100 transition-all ${
                                msg.status === "sent" 
                                  ? "bg-slate-50 border-slate-100" 
                                  : msg.status === "cancelled" 
                                    ? "bg-slate-50/50 opacity-60 border-slate-100" 
                                    : "bg-amber-50/30 border-amber-150/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-black text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                                      {msg.id}
                                    </span>
                                    <span className="text-xs font-black text-slate-800">
                                      {msg.patientName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                      {msg.phone}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                      msg.scheduleType === "medication"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : msg.scheduleType === "follow_up"
                                          ? "bg-purple-50 text-purple-700 border border-purple-100"
                                          : "bg-sky-50 text-sky-700 border border-sky-100"
                                    }`}>
                                      {msg.scheduleType}
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium text-slate-600 leading-relaxed pt-1 font-sans">
                                    {msg.messageContent}
                                  </p>
                                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold pt-1">
                                    <span>
                                      ⏰ Scheduled: {new Date(msg.scheduledAt).toLocaleString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </span>
                                    {msg.sentAt && (
                                      <span className="text-emerald-600 font-bold">
                                        ✓ Dispatched: {new Date(msg.sentAt).toLocaleTimeString("en-IN", {
                                          hour: "2-digit",
                                          minute: "2-digit"
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 border ${
                                    msg.status === "sent"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                      : msg.status === "pending"
                                        ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                        : msg.status === "cancelled"
                                          ? "bg-slate-100 text-slate-500 border-slate-200"
                                          : "bg-rose-50 text-rose-700 border-rose-150"
                                  }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                      msg.status === "sent"
                                        ? "bg-emerald-500"
                                        : msg.status === "pending"
                                          ? "bg-amber-500"
                                          : msg.status === "cancelled"
                                            ? "bg-slate-400"
                                            : "bg-rose-500"
                                    }`}></span>
                                    {msg.status}
                                  </span>

                                  {isPending && (
                                    <button
                                      type="button"
                                      onClick={() => handleCancelScheduledMessage(msg.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer border-0"
                                      title="Cancel Scheduled Alert"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {frontOfficeSubTab === "calendar" && (
              <CalendarView 
                appointments={appointments} 
                onRefresh={fetchAppointments} 
                onSelectDayForBooking={(dateStr) => {
                  setFrontOfficeSubTab("queue");
                  setSchedAt(`${dateStr}T10:00`); // Pre-populate date for booking
                }}
              />
            )}

          </div>
        ) : activeTab === "saas" ? (
          /* FULL WIDTH SAAS HUB VIEW */
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 space-y-6">
            {/* TOP HEADER SUMMARY */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>⚙️ SaaS Multi-Tenant Control Hub</span>
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                  Admin, Billing, White-Label Theme Engines & Custom Gateways
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400">STATUS:</span>
                <span className="text-[11px] font-black uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  {tenantConfig?.status || "ACTIVE"}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 ml-2">EXPIRY:</span>
                <span className="text-[11px] font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  {tenantConfig?.expiryDate ? new Date(tenantConfig.expiryDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : "Unlimited"}
                </span>
              </div>
            </div>

            {/* ERROR / SUCCESS ALERTS */}
            {errorAlert && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-start gap-3 text-xs font-bold shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
                <div className="flex-1">
                  <p>{errorAlert}</p>
                  <button 
                    onClick={() => setErrorAlert(null)}
                    className="text-rose-800 underline mt-1 hover:text-rose-950 block text-[10px]"
                  >
                    Dismiss Warning
                  </button>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl flex items-start gap-3 text-xs font-bold shadow-sm">
                <Check className="h-5 w-5 shrink-0 text-emerald-500" />
                <div className="flex-1">
                  <p>{successMsg}</p>
                </div>
              </div>
            )}

            {/* IF TRIAL PLAN ACTIVE, SHOW PREMIUM PROMO BANNER */}
            {tenantConfig?.tier === "trial" && (
              <div className="relative overflow-hidden bg-gradient-to-r from-sky-500 to-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-sky-500/10">
                <div className="relative z-10 space-y-2 max-w-xl">
                  <span className="bg-white/20 uppercase text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full">
                    💡 Upgrade To Unlock Enterprise Customizations
                  </span>
                  <h3 className="text-lg font-black tracking-tight">Your 14-Day Free Trial is Active</h3>
                  <p className="text-white/90 text-xs font-medium leading-relaxed">
                    You're currently using the trial sandbox. Upgrade to a premium plan below to map custom domains, connect private Twilio/custom REST API WhatsApp gateways, and configure unlimited EMR clinical patient records.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pointer-events-none">
                  <Sparkles className="h-48 w-48" />
                </div>
              </div>
            )}

            {/* BENTO GRID: USAGE, GATEWAY, BRANDING */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* CARD 1: REAL-TIME QUOTA MONITOR */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Database className="h-4 w-4 text-cura-primary" />
                    Real-time Quota Monitor
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    SaaS Resource Metering
                  </p>
                </div>

                {limits && tenantConfig && (
                  <div className="space-y-5">
                    {/* Patients Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Registered Patients</span>
                        <span className="text-slate-800 font-mono">
                          {tenantConfig.usage.patients} / {limits.maxPatients >= 1000000 ? "Unlimited" : limits.maxPatients}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, (tenantConfig.usage.patients / limits.maxPatients) * 100)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            (tenantConfig.usage.patients / limits.maxPatients) >= 0.9 
                              ? "bg-rose-500" 
                              : (tenantConfig.usage.patients / limits.maxPatients) >= 0.7 
                              ? "bg-amber-500" 
                              : "bg-sky-500"
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* AI Assist calls */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Voice / Assistant AI Calls</span>
                        <span className="text-slate-800 font-mono">
                          {tenantConfig.usage.aiCalls} / {limits.maxAiCalls >= 1000000 ? "Unlimited" : limits.maxAiCalls}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, (tenantConfig.usage.aiCalls / limits.maxAiCalls) * 100)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            (tenantConfig.usage.aiCalls / limits.maxAiCalls) >= 0.9 
                              ? "bg-rose-500" 
                              : (tenantConfig.usage.aiCalls / limits.maxAiCalls) >= 0.7 
                              ? "bg-amber-500" 
                              : "bg-emerald-500"
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* WhatsApp Messages */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">WhatsApp Broadcasts</span>
                        <span className="text-slate-800 font-mono">
                          {tenantConfig.usage.whatsappMessages} / {limits.maxWhatsappMessages >= 1000000 ? "Unlimited" : limits.maxWhatsappMessages}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, (tenantConfig.usage.whatsappMessages / limits.maxWhatsappMessages) * 100)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            (tenantConfig.usage.whatsappMessages / limits.maxWhatsappMessages) >= 0.9 
                              ? "bg-rose-500" 
                              : (tenantConfig.usage.whatsappMessages / limits.maxWhatsappMessages) >= 0.7 
                              ? "bg-amber-500" 
                              : "bg-sky-500"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-slate-700">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">🔒 Current Billing Level</p>
                  <p className="text-xs font-bold leading-relaxed">
                    Your clinic is subscribed to the <span className="text-cura-primary font-black">{limits?.label || "Trial"}</span> tier. Subscription charges are billed monthly.
                  </p>
                </div>
              </div>

              {/* CARD 2: WHATSAPP PLUGGABLE ADAPTER GATEWAY */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-emerald-500 animate-pulse" />
                    Pluggable WhatsApp Gateway
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    Configure Custom REST API Endpoint
                  </p>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase">Gateway Router Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWhatsappGateway("simulated")}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition-all ${
                          whatsappGateway === "simulated"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Simulated Sandbox
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (tenantConfig?.tier === "trial" || tenantConfig?.tier === "solo-clinic") {
                            setErrorAlert("Gateway customization is locked. Custom APIs require the Nursing Home or Hospital Suite Plan.");
                            return;
                          }
                          setWhatsappGateway("custom");
                        }}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                          whatsappGateway === "custom"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        } ${
                          (tenantConfig?.tier === "trial" || tenantConfig?.tier === "solo-clinic") ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        {(tenantConfig?.tier === "trial" || tenantConfig?.tier === "solo-clinic") ? "🔒 Custom Gateway" : "Custom Gateway"}
                      </button>
                    </div>
                  </div>

                  {whatsappGateway === "custom" && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">API Endpoint URL</label>
                        <input 
                          type="url" 
                          required
                          value={whatsappEndpoint}
                          onChange={(e) => setWhatsappEndpoint(e.target.value)}
                          placeholder="https://yourdomain.com/api/v1/send"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cura-primary/20 text-slate-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Auth Secret/Bearer Token</label>
                        <input 
                          type="password" 
                          required
                          value={whatsappKey}
                          onChange={(e) => setWhatsappKey(e.target.value)}
                          placeholder="Bearer app-token..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cura-primary/20 text-slate-700 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {whatsappGateway === "simulated" && (
                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-[10px] text-emerald-800 leading-relaxed font-semibold">
                      💬 Sandbox Gateway active. Finalized prescriptions will prompt an EMR simulated WhatsApp preview modal containing complete drug regimens and interactive links.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    Save Gateway Settings
                  </button>
                </form>
              </div>

              {/* CARD 3: WHITE-LABEL BRANDING & THEME ENGINE (PREVIEW STATUS CARD) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-cura-primary" />
                    White-label Status Preview
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    Rebranded System Pointers
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      {brandingLogoUrl ? (
                        <img src={brandingLogoUrl} alt="Main Logo" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[10px] font-black text-slate-400">NO LOGO</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-700 truncate max-w-[150px]">
                        {brandingClinicName || "CURA Healthcare"}
                      </h4>
                      <p className="text-[9px] font-semibold text-slate-400 tracking-wide uppercase mt-0.5">
                        Domain: {brandingCustomDomain || "Not mapped"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">CUSTOMIZATION LEVEL</span>
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full text-[9px] uppercase font-black">
                        {wlLevel} White Label
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">ACCENT HEX CODE</span>
                      <div className="flex items-center gap-1.5 font-mono text-slate-600">
                        <span className="inline-block h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: brandingPrimaryColor }}></span>
                        {brandingPrimaryColor.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">FRANCHISES ACTIVE</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black">
                        {wlSubOrganizations.length} Affiliates
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("whitelabel-advanced-suite");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  Configure Advanced Settings &darr;
                </button>
              </div>

            </div>

            {/* FULL ENTERPRISE WHITE LABELLING COMMAND CONSOLE */}
            <div id="whitelabel-advanced-suite" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 scroll-mt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <span>🏷️ CURA Enterprise White-Labelling Command Console</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-100">
                      Reseller Ready
                    </span>
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">
                    Instantly customize client logos, active themes, custom head scripts, secure SSO protocols, customized transactional emails, and affiliate sub-networks.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Engine License</span>
                  <span className="text-xs font-extrabold text-slate-700">Enterprise Multi-Tenant</span>
                </div>
              </div>

              {/* CONSOLE SUBTABS */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setWhitelabelSubTab("branding")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    whitelabelSubTab === "branding"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🎨 Custom Theme & Logos
                </button>
                <button
                  type="button"
                  onClick={() => setWhitelabelSubTab("domain")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    whitelabelSubTab === "domain"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🌐 Domain Mapping & DNS
                </button>
                <button
                  type="button"
                  onClick={() => setWhitelabelSubTab("sidebar")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    whitelabelSubTab === "sidebar"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🗺️ Sidebar Module Ordering
                </button>
                <button
                  type="button"
                  onClick={() => setWhitelabelSubTab("email-mobile")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    whitelabelSubTab === "email-mobile"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  ✉️ Email & 📱 Mobile App
                </button>
                <button
                  type="button"
                  onClick={() => setWhitelabelSubTab("sso")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    whitelabelSubTab === "sso"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🔑 Single Sign-On (SSO)
                </button>
                <button
                  type="button"
                  onClick={() => setWhitelabelSubTab("franchises")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    whitelabelSubTab === "franchises"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🏢 Franchise Network ({wlSubOrganizations.length})
                </button>
              </div>

              {/* CONSOLE CONTROLS */}
              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                {whitelabelSubTab === "branding" && (
                  <form onSubmit={handleSaveWhitelabelConfig} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Branding & Company Profile</h4>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Clinic / Reseller Company Name</label>
                          <input 
                            type="text" 
                            required
                            value={brandingClinicName}
                            onChange={(e) => setBrandingClinicName(e.target.value)}
                            placeholder="e.g. Apex Hospital Group"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Company Tagline / Slogan</label>
                          <input 
                            type="text" 
                            value={wlCompanyTagline}
                            onChange={(e) => setWlCompanyTagline(e.target.value)}
                            placeholder="e.g. Compassionate Care, Redefined"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">White label Level</label>
                            <select
                              value={wlLevel}
                              onChange={(e) => setWlLevel(e.target.value as any)}
                              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                            >
                              <option value="semi">Semi (Logo + Colors)</option>
                              <option value="full">Full (Zero CURA mentions)</option>
                              <option value="mobile">Mobile (App Rebranding)</option>
                              <option value="enterprise">Enterprise (Franchises)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Font Family</label>
                            <select
                              value={wlFontFamily}
                              onChange={(e) => setWlFontFamily(e.target.value)}
                              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                            >
                              <option value="Inter">Inter (Swiss Modern)</option>
                              <option value="Space Grotesk">Space Grotesk (Tech Modern)</option>
                              <option value="Outfit">Outfit (Clean Geometric)</option>
                              <option value="Playfair Display">Playfair Display (Serif/Editorial)</option>
                              <option value="JetBrains Mono">JetBrains Mono (Technical Mono)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Color Palette Theme</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Color</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={brandingPrimaryColor}
                                onChange={(e) => setBrandingPrimaryColor(e.target.value)}
                                className="h-10 w-12 p-0.5 border border-slate-200 bg-white rounded-xl cursor-pointer shrink-0"
                              />
                              <input 
                                type="text" 
                                value={brandingPrimaryColor}
                                onChange={(e) => setBrandingPrimaryColor(e.target.value)}
                                placeholder="#0ea5e9"
                                className="w-full px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none text-slate-700"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Secondary Color</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={wlSecondaryColor}
                                onChange={(e) => setWlSecondaryColor(e.target.value)}
                                className="h-10 w-12 p-0.5 border border-slate-200 bg-white rounded-xl cursor-pointer shrink-0"
                              />
                              <input 
                                type="text" 
                                value={wlSecondaryColor}
                                onChange={(e) => setWlSecondaryColor(e.target.value)}
                                placeholder="#10b981"
                                className="w-full px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none text-slate-700"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tertiary Color (Text)</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={wlTertiaryColor}
                                onChange={(e) => setWlTertiaryColor(e.target.value)}
                                className="h-10 w-12 p-0.5 border border-slate-200 bg-white rounded-xl cursor-pointer shrink-0"
                              />
                              <input 
                                type="text" 
                                value={wlTertiaryColor}
                                onChange={(e) => setWlTertiaryColor(e.target.value)}
                                placeholder="#0c4a6e"
                                className="w-full px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none text-slate-700"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Background Color</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={wlBackgroundColor}
                                onChange={(e) => setWlBackgroundColor(e.target.value)}
                                className="h-10 w-12 p-0.5 border border-slate-200 bg-white rounded-xl cursor-pointer shrink-0"
                              />
                              <input 
                                type="text" 
                                value={wlBackgroundColor}
                                onChange={(e) => setWlBackgroundColor(e.target.value)}
                                placeholder="#ffffff"
                                className="w-full px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none text-slate-700"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-150 pt-5 space-y-4">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Asset URL Endpoints</h4>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Light Theme Logo URL</label>
                          <input 
                            type="url" 
                            value={brandingLogoUrl}
                            onChange={(e) => setBrandingLogoUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/your-logo.png"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dark Theme Logo URL</label>
                          <input 
                            type="url" 
                            value={wlLogoDarkUrl}
                            onChange={(e) => setWlLogoDarkUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/your-logo-dark.png"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Favicon Asset URL (.ico / .png)</label>
                          <input 
                            type="url" 
                            value={wlFaviconUrl}
                            onChange={(e) => setWlFaviconUrl(e.target.value)}
                            placeholder="https://yourdomain.com/favicon.ico"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rebranded LoginPage Banner Logo</label>
                          <input 
                            type="url" 
                            value={wlLoginPageLogo}
                            onChange={(e) => setWlLoginPageLogo(e.target.value)}
                            placeholder="https://yourdomain.com/login-logo.png"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                      >
                        💾 Compile & Deploy Brand Style
                      </button>
                    </div>
                  </form>
                )}

                {whitelabelSubTab === "domain" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Custom Domain Router</h4>
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                          Enter your company's proprietary subdomain or main URL. The system will route all multi-tenant healthcare data transparently underneath this domain namespace.
                        </p>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Proprietary Custom Domain Name</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={brandingCustomDomain}
                              onChange={(e) => setBrandingCustomDomain(e.target.value)}
                              placeholder="emr.yourbrand.com"
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 font-mono"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyDomain}
                              className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 shadow-sm"
                            >
                              Verify DNS
                            </button>
                          </div>
                        </div>

                        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
                          <Check className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                          <div>
                            <h5 className="text-xs font-black text-emerald-800">SSL Certificate Status: SECURED & ACTIVE</h5>
                            <p className="text-[10px] font-semibold text-emerald-600/90 mt-1 leading-relaxed">
                              CURA automatically provisions Let's Encrypt Wildcard SSL certificates for all custom domains mapped. Point your records, and we'll handle the handshakes.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">DNS Configuration Guide</h4>
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                          To successfully map your white-label portal, configure the following record within your DNS registrar (GoDaddy, Cloudflare, AWS Route53):
                        </p>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="p-3">TYPE</th>
                                <th className="p-3">HOST</th>
                                <th className="p-3">VALUE / POINTER</th>
                                <th className="p-3 text-right">TTL</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 text-[11px] font-semibold text-slate-600">
                              <tr>
                                <td className="p-3 font-mono font-black text-slate-800 text-[10px]">CNAME</td>
                                <td className="p-3 font-mono">emr</td>
                                <td className="p-3 font-mono">routing.cura.in</td>
                                <td className="p-3 text-right font-mono text-[10px]">Automatic</td>
                              </tr>
                              <tr>
                                <td className="p-3 font-mono font-black text-slate-800 text-[10px]">TXT</td>
                                <td className="p-3 font-mono">_cura-verify</td>
                                <td className="p-3 font-mono text-emerald-600">cura-tenant-4a81c</td>
                                <td className="p-3 text-right font-mono text-[10px]">3600 sec</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {whitelabelSubTab === "sidebar" && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Sidebar Navigation Layout Manager</h4>
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed mt-1">
                          Rearrange modules or hide specific items entirely to restrict clinician workflows based on your white-label suite configuration.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveWhitelabelConfig}
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all shadow-sm shrink-0"
                      >
                        Save Navigation Layout
                      </button>
                    </div>

                    <div className="space-y-2 max-w-xl">
                      {wlSidebarModules && wlSidebarModules.length > 0 ? (
                        wlSidebarModules.map((mod, idx) => (
                          <div 
                            key={mod.id} 
                            className={`flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm transition-all ${
                              mod.visible ? "border-slate-200" : "border-slate-100 opacity-60 bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 font-mono text-xs w-4">#{idx + 1}</span>
                              <span className="text-xs font-bold text-slate-700">{mod.label}</span>
                              <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                                Icon: {mod.icon}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => moveSidebarModuleUp(idx)}
                                disabled={idx === 0}
                                className={`p-1.5 rounded-lg border text-xs font-bold ${idx === 0 ? "text-slate-300 border-slate-100" : "text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                              >
                                &uarr;
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSidebarModuleDown(idx)}
                                disabled={idx === wlSidebarModules.length - 1}
                                className={`p-1.5 rounded-lg border text-xs font-bold ${idx === wlSidebarModules.length - 1 ? "text-slate-300 border-slate-100" : "text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                              >
                                &darr;
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleSidebarModuleVisible(idx)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase ${
                                  mod.visible 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-rose-50 text-rose-700 border border-rose-100"
                                }`}
                              >
                                {mod.visible ? "VISIBLE" : "HIDDEN"}
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-bold text-slate-400 py-4 text-center bg-white border border-slate-150 rounded-2xl">
                          No navigation modules found. Save custom styles to compile defaults.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {whitelabelSubTab === "email-mobile" && (
                  <form onSubmit={handleSaveWhitelabelConfig} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Transactional Email Customization</h4>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email From Name</label>
                          <input 
                            type="text" 
                            value={wlEmailFromName}
                            onChange={(e) => setWlEmailFromName(e.target.value)}
                            placeholder="Apex Healthcare Support"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email From Address</label>
                          <input 
                            type="email" 
                            value={wlEmailFromAddress}
                            onChange={(e) => setWlEmailFromAddress(e.target.value)}
                            placeholder="notifications@yourdomain.com"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Footer Legal Disclaimer</label>
                          <textarea 
                            value={wlEmailFooterText}
                            onChange={(e) => setWlEmailFooterText(e.target.value)}
                            placeholder="© 2026 Apex Healthcare. Confidentially protected under HIPAA standards."
                            rows={3}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Mobile App Rebranding</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile App Name</label>
                            <input 
                              type="text" 
                              value={wlMobileAppName}
                              onChange={(e) => setWlMobileAppName(e.target.value)}
                              placeholder="Apex Companion"
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">App Icon URL</label>
                            <input 
                              type="url" 
                              value={wlMobileAppIcon}
                              onChange={(e) => setWlMobileAppIcon(e.target.value)}
                              placeholder="https://images.unsplash.com/icon.png"
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Splash Screen Background image</label>
                          <input 
                            type="url" 
                            value={wlMobileAppSplashScreen}
                            onChange={(e) => setWlMobileAppSplashScreen(e.target.value)}
                            placeholder="https://images.unsplash.com/splash.png"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Apple iOS App Store URL</label>
                            <input 
                              type="url" 
                              value={wlMobileAppIosUrl}
                              onChange={(e) => setWlMobileAppIosUrl(e.target.value)}
                              placeholder="https://apps.apple.com/..."
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Android Google Play Store URL</label>
                            <input 
                              type="url" 
                              value={wlMobileAppAndroidUrl}
                              onChange={(e) => setWlMobileAppAndroidUrl(e.target.value)}
                              placeholder="https://play.google.com/..."
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end border-t border-slate-150 pt-5">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                      >
                        💾 Apply Email & Mobile Brand configurations
                      </button>
                    </div>
                  </form>
                )}

                {whitelabelSubTab === "sso" && (
                  <form onSubmit={handleSaveWhitelabelConfig} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Single Sign-On (SSO) Gatekeeper</h4>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={wlEnableSso}
                              onChange={(e) => setWlEnableSso(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                            <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase">
                              {wlEnableSso ? "Enabled" : "Disabled"}
                            </span>
                          </label>
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                          Secure logins for your hospital staff by connecting with federated corporate Identity Providers. This enforces active directory credential rules.
                        </p>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Corporate Identity Provider</label>
                          <select
                            value={wlSsoProvider}
                            onChange={(e) => setWlSsoProvider(e.target.value)}
                            disabled={!wlEnableSso}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 disabled:opacity-50"
                          >
                            <option value="google">Google Workspace SAML</option>
                            <option value="okta">Okta Enterprise SSO</option>
                            <option value="auth0">Auth0 Identity Engine</option>
                            <option value="azure">Microsoft Azure Active Directory</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Authorized Callback / Redirect URI</label>
                          <input 
                            type="text" 
                            disabled
                            value={wlSsoRedirectUri || `https://${brandingCustomDomain || "emr.cura.in"}/api/v1/auth/sso/callback`}
                            placeholder="https://emr.yourbrand.com/api/v1/auth/sso/callback"
                            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Federation Credentials</h4>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client ID / Client Identifier</label>
                          <input 
                            type="text" 
                            disabled={!wlEnableSso}
                            value={wlSsoClientId}
                            onChange={(e) => setWlSsoClientId(e.target.value)}
                            placeholder="client_id_saml_or_oidc_18f2d9..."
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 font-mono disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client Secret</label>
                          <input 
                            type="password" 
                            disabled={!wlEnableSso}
                            value={wlSsoClientSecret}
                            onChange={(e) => setWlSsoClientSecret(e.target.value)}
                            placeholder="••••••••••••••••••••••••••••••••"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 font-mono disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end border-t border-slate-150 pt-5">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                      >
                        💾 Deploy SSO Gatekeeper Protocol
                      </button>
                    </div>
                  </form>
                )}

                {whitelabelSubTab === "franchises" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Franchise registration Form */}
                      <form onSubmit={handleCreateFranchise} className="space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Register Franchise Affiliate</h4>
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                          Deploy a standalone rebranded sub-organization tenant on our cluster. This allows franchise groups to override primary colors, administrator credentials, and logos.
                        </p>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Affiliate Organization Name</label>
                          <input 
                            type="text" 
                            required
                            value={newFranchiseName}
                            onChange={(e) => setNewFranchiseName(e.target.value)}
                            placeholder="e.g. Apex Bangalore Heart Clinic"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Subdomain</label>
                            <div className="flex items-center">
                              <input 
                                type="text" 
                                required
                                value={newFranchiseSubdomain}
                                onChange={(e) => setNewFranchiseSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                placeholder="apexblr"
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 border-r-0 rounded-l-xl text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-slate-800/10 text-slate-700"
                              />
                              <span className="bg-slate-100 border border-slate-200 border-l-0 px-2.5 py-2.5 rounded-r-xl text-[10px] font-black text-slate-500 font-mono">
                                .cura.in
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Admin Email Credentials</label>
                            <input 
                              type="email" 
                              required
                              value={newFranchiseAdminEmail}
                              onChange={(e) => setNewFranchiseAdminEmail(e.target.value)}
                              placeholder="admin@apexblr.in"
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Accent Color Picker</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={newFranchisePrimary}
                                onChange={(e) => setNewFranchisePrimary(e.target.value)}
                                className="h-10 w-12 p-0.5 border border-slate-200 bg-white rounded-xl cursor-pointer shrink-0"
                              />
                              <input 
                                type="text" 
                                value={newFranchisePrimary}
                                onChange={(e) => setNewFranchisePrimary(e.target.value)}
                                className="w-full px-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none text-slate-700"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Secondary Accent</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={newFranchiseSecondary}
                                onChange={(e) => setNewFranchiseSecondary(e.target.value)}
                                className="h-10 w-12 p-0.5 border border-slate-200 bg-white rounded-xl cursor-pointer shrink-0"
                              />
                              <input 
                                type="text" 
                                value={newFranchiseSecondary}
                                onChange={(e) => setNewFranchiseSecondary(e.target.value)}
                                className="w-full px-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none text-slate-700"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logo Asset URL</label>
                          <input 
                            type="url" 
                            value={newFranchiseLogo}
                            onChange={(e) => setNewFranchiseLogo(e.target.value)}
                            placeholder="https://images.unsplash.com/logo-override.png"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-slate-700"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <UserPlus className="h-4 w-4" /> Deploy Standalone Sub-Organization Tenant
                        </button>
                      </form>

                      {/* Franchises List */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Active Affiliate Tenants ({wlSubOrganizations.length})</h4>
                        
                        <div className="space-y-3">
                          {wlSubOrganizations && wlSubOrganizations.length > 0 ? (
                            wlSubOrganizations.map(sub => (
                              <div key={sub.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                    <img src={sub.logoUrl} alt={sub.name} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-black text-slate-800">{sub.name}</h5>
                                    <p className="text-[10px] font-bold text-sky-600 font-mono mt-0.5">
                                      http://{sub.subdomain}.cura.in
                                    </p>
                                    <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">
                                      Admin: {sub.adminEmail}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase">
                                    ACTIVE
                                  </span>
                                  <div className="flex items-center gap-1 mt-2 justify-end">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full border border-slate-100" style={{ backgroundColor: sub.primaryColor }}></span>
                                    <span className="inline-block h-2.5 w-2.5 rounded-full border border-slate-100" style={{ backgroundColor: sub.secondaryColor }}></span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs font-bold text-slate-400 py-6 text-center bg-white border border-slate-150 rounded-2xl">
                              No affiliate tenants registered. Use the registry form to launch standalone tenants.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BILLING AND SUBSCRIPTION TIERS SECTION */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-800">SaaS Premium Subscription Tiers</h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                  Select a subscription plan to unlock advanced resources & gateways
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                
                {/* PLAN 1: TRIAL */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 relative ${
                  tenantConfig?.tier === "trial" 
                    ? "border-sky-500 bg-sky-50/10 shadow-md ring-2 ring-sky-500/10" 
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}>
                  {tenantConfig?.tier === "trial" && (
                    <span className="absolute -top-3 right-4 bg-sky-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
                      ACTIVE
                    </span>
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">SANDBOX TRIAL</p>
                    <p className="text-2xl font-black text-slate-900">Free</p>
                    <p className="text-[11px] font-semibold text-slate-500">14-day basic testbed for clinic validation.</p>
                  </div>
                  <ul className="text-xs font-semibold text-slate-500 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5 text-slate-700">✓ 1 Doctor / 2 Staff</li>
                    <li className="flex items-center gap-1.5 text-slate-700 font-bold">✓ 10 Max Patient Files</li>
                    <li className="flex items-center gap-1.5 text-slate-700">✓ 15 AI Assisted Calls</li>
                    <li className="flex items-center gap-1.5 text-slate-700">✓ 20 WhatsApp SMS</li>
                    <li className="text-slate-300">✗ Custom Domains</li>
                    <li className="text-slate-300">✗ Pluggable Gateway</li>
                  </ul>
                  <button
                    onClick={() => {
                      setCheckoutTier("trial");
                      setPaymentSuccess(false);
                      setShowCheckoutModal(true);
                    }}
                    disabled={tenantConfig?.tier === "trial"}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      tenantConfig?.tier === "trial"
                        ? "bg-slate-100 text-slate-400 cursor-default"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tenantConfig?.tier === "trial" ? "Current Tier" : "Reset Trial"}
                  </button>
                </div>

                {/* PLAN 2: SOLO CLINIC */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 relative ${
                  tenantConfig?.tier === "solo-clinic" 
                    ? "border-sky-500 bg-sky-50/10 shadow-md ring-2 ring-sky-500/10" 
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}>
                  {tenantConfig?.tier === "solo-clinic" && (
                    <span className="absolute -top-3 right-4 bg-sky-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
                      ACTIVE
                    </span>
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold text-sky-500 uppercase tracking-widest">SOLO CLINIC</p>
                    <p className="text-2xl font-black text-slate-900">₹1,499<span className="text-xs text-slate-400 font-medium">/mo</span></p>
                    <p className="text-[11px] font-semibold text-slate-500">Ideal for standalone medical practitioners.</p>
                  </div>
                  <ul className="text-xs font-semibold text-slate-500 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5 text-slate-700">✓ 1 Doctor / 2 Staff</li>
                    <li className="flex items-center gap-1.5 font-bold text-sky-600">✓ 500 Patient Limit</li>
                    <li className="flex items-center gap-1.5 text-slate-700">✓ 200 AI Assisted Calls</li>
                    <li className="flex items-center gap-1.5 text-slate-700">✓ 300 WhatsApp SMS</li>
                    <li className="text-slate-300">✗ Custom Domains</li>
                    <li className="text-slate-300">✗ Pluggable Gateway</li>
                  </ul>
                  <button
                    onClick={() => {
                      setCheckoutTier("solo-clinic");
                      setPaymentSuccess(false);
                      setShowCheckoutModal(true);
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      tenantConfig?.tier === "solo-clinic"
                        ? "bg-slate-100 text-slate-400 cursor-default"
                        : "bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/10"
                    }`}
                  >
                    {tenantConfig?.tier === "solo-clinic" ? "Current Tier" : "Upgrade Plan"}
                  </button>
                </div>

                {/* PLAN 3: NURSING HOME */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 relative ${
                  tenantConfig?.tier === "nursing-home" 
                    ? "border-emerald-500 bg-emerald-50/10 shadow-md ring-2 ring-emerald-500/10" 
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}>
                  {tenantConfig?.tier === "nursing-home" && (
                    <span className="absolute -top-3 right-4 bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
                      ACTIVE
                    </span>
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold text-emerald-500 uppercase tracking-widest">NURSING HOME</p>
                    <p className="text-2xl font-black text-slate-900">₹4,999<span className="text-xs text-slate-400 font-medium">/mo</span></p>
                    <p className="text-[11px] font-semibold text-slate-500">Perfect for private centers and diagnostic clinics.</p>
                  </div>
                  <ul className="text-xs font-semibold text-slate-500 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5 text-slate-700">✓ Up to 10 Doctors / 5 Staff</li>
                    <li className="flex items-center gap-1.5 font-bold text-emerald-600">✓ 10,000 Patient Limit</li>
                    <li className="flex items-center gap-1.5 text-slate-700">✓ 2,000 AI Assisted Calls</li>
                    <li className="flex items-center gap-1.5 text-slate-700">✓ 3,000 WhatsApp SMS</li>
                    <li className="flex items-center gap-1.5 font-bold text-emerald-600">✓ Custom Gateway API</li>
                    <li className="text-slate-300">✗ Custom Domains</li>
                  </ul>
                  <button
                    onClick={() => {
                      setCheckoutTier("nursing-home");
                      setPaymentSuccess(false);
                      setShowCheckoutModal(true);
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      tenantConfig?.tier === "nursing-home"
                        ? "bg-slate-100 text-slate-400 cursor-default"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                    }`}
                  >
                    {tenantConfig?.tier === "nursing-home" ? "Current Tier" : "Upgrade Plan"}
                  </button>
                </div>

                {/* PLAN 4: HOSPITAL SUITE */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 relative ${
                  tenantConfig?.tier === "hospital-suite" 
                    ? "border-indigo-500 bg-indigo-50/10 shadow-md ring-2 ring-indigo-500/10" 
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}>
                  {tenantConfig?.tier === "hospital-suite" && (
                    <span className="absolute -top-3 right-4 bg-indigo-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
                      ACTIVE
                    </span>
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold text-indigo-500 uppercase tracking-widest">HOSPITAL SUITE</p>
                    <p className="text-2xl font-black text-slate-900">Custom Quote</p>
                    <p className="text-[11px] font-semibold text-slate-500">Full HMS orchestration for large enterprise clinical networks.</p>
                  </div>
                  <ul className="text-xs font-semibold text-slate-500 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5 text-slate-700 font-bold">✓ Unlimited Doctors / Staff</li>
                    <li className="flex items-center gap-1.5 font-bold text-indigo-600">✓ Unlimited Patient EMR</li>
                    <li className="flex items-center gap-1.5 text-slate-700 font-bold">✓ Unlimited AI Assistance</li>
                    <li className="flex items-center gap-1.5 text-slate-700">✓ Unlimited WhatsApp SMS</li>
                    <li className="flex items-center gap-1.5 text-slate-700 font-bold">✓ Custom Gateway API</li>
                    <li className="flex items-center gap-1.5 font-bold text-indigo-600 font-bold">✓ Custom Domain Maps</li>
                  </ul>
                  <button
                    onClick={() => {
                      setCheckoutTier("hospital-suite");
                      setPaymentSuccess(false);
                      setShowCheckoutModal(true);
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      tenantConfig?.tier === "hospital-suite"
                        ? "bg-slate-100 text-slate-400 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10"
                    }`}
                  >
                    {tenantConfig?.tier === "hospital-suite" ? "Current Tier" : "Upgrade Plan"}
                  </button>
                </div>

              </div>
            </div>

          </div>
        ) : activeTab === "telemedicine" ? (
          <TelemedicineCenter 
            appointments={appointments}
            patients={patients}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            fetchAppointments={fetchAppointments}
            fetchPatients={fetchPatients}
            tenantConfig={tenantConfig}
            fetchTenantConfig={fetchTenantConfig}
          />
        ) : activeTab === "hims" ? (
          <HospitalImsSuite 
            patients={patients}
            wards={wards}
            beds={beds}
            admissions={admissions}
            ots={ots}
            otSchedules={otSchedules}
            insuranceProviders={insuranceProviders}
            claims={claims}
            nabhStandards={nabhStandards}
            complianceAudits={complianceAudits}
            emergencyCases={emergencyCases}
            himsSubTab={himsSubTab}
            setHimsSubTab={setHimsSubTab}
            fetchHimsStates={fetchHimsStates}
            setSuccessMsg={setSuccessMsg}
            setErrorAlert={setErrorAlert}
          />
        ) : activeTab === "intelligence" ? (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 space-y-6">
            <HealthcareIntelligence
              patients={patients}
              setSuccessMsg={setSuccessMsg}
              setErrorAlert={setErrorAlert}
            />
          </div>
        ) : activeTab === "mental_health" ? (
          <div className="flex-1 overflow-y-auto">
            <MentalHealthConsult
              patientName={selectedPatient ? selectedPatient.name : "Ananya Sharma"}
              patientAge={selectedPatient ? selectedPatient.age : 29}
              patientGender={selectedPatient ? selectedPatient.gender : "Female"}
            />
          </div>
        ) : activeTab === "cardiology" ? (
          <div className="flex-1 overflow-y-auto">
            <CardiologySuite
              patientName={selectedPatient ? selectedPatient.name : "Rajesh Verma"}
              patientAge={selectedPatient ? selectedPatient.age : 56}
              patientGender={selectedPatient ? selectedPatient.gender : "Male"}
            />
          </div>
        ) : activeTab === "pediatrics" ? (
          <div className="flex-1 overflow-y-auto">
            <PediatricsSuite
              patientName={selectedPatient ? selectedPatient.name : "Aarav Mehta"}
              patientAgeMonths={18}
              patientGender="Male"
            />
          </div>
        ) : activeTab === "womens_health" ? (
          <div className="flex-1 overflow-y-auto">
            <WomensHealthSuite
              patientName={selectedPatient ? selectedPatient.name : "Priya Sharma"}
              patientAge={selectedPatient ? selectedPatient.age : 28}
              patientGender="Female"
            />
          </div>
        ) : activeTab === "orthopedics" ? (
          <div className="flex-1 overflow-y-auto">
            <OrthopedicsSuite
              patientName={selectedPatient ? selectedPatient.name : "Rajesh Kumar"}
              patientAge={selectedPatient ? selectedPatient.age : 45}
              patientGender={selectedPatient ? selectedPatient.gender : "Male"}
            />
          </div>
        ) : activeTab === "dermatology" ? (
          <div className="flex-1 overflow-y-auto">
            <DermatologySuite
              patientName={selectedPatient ? selectedPatient.name : "Sunita Verma"}
              patientAge={selectedPatient ? selectedPatient.age : 34}
              patientGender={selectedPatient ? selectedPatient.gender : "Female"}
            />
          </div>
        ) : activeTab === "neurology" ? (
          <div className="flex-1 overflow-y-auto">
            <NeurologySuite
              patientName={selectedPatient ? selectedPatient.name : "Ramesh Chandra"}
              patientAge={selectedPatient ? selectedPatient.age : 62}
              patientGender={selectedPatient ? selectedPatient.gender : "Male"}
            />
          </div>
        ) : activeTab === "oncology" ? (
          <div className="flex-1 overflow-y-auto">
            <OncologySuite
              patientName={selectedPatient ? selectedPatient.name : "Ananya Mukherjee"}
              patientAge={selectedPatient ? selectedPatient.age : 54}
              patientGender={selectedPatient ? selectedPatient.gender : "Female"}
            />
          </div>
        ) : activeTab === "emergency" ? (
          <div className="flex-1 overflow-y-auto">
            <EmergencySuite
              patientName={selectedPatient ? selectedPatient.name : "Vikram Malhotra"}
              patientAge={selectedPatient ? selectedPatient.age : 48}
              patientGender={selectedPatient ? selectedPatient.gender : "Male"}
            />
          </div>
        ) : activeTab === "ent" ? (
          <div className="flex-1 overflow-y-auto">
            <ENTSuite
              patientName={selectedPatient ? selectedPatient.name : "Siddharth Nambiar"}
              patientAge={selectedPatient ? selectedPatient.age : 42}
              patientGender={selectedPatient ? selectedPatient.gender : "Male"}
            />
          </div>
        ) : activeTab === "ophthalmology" ? (
          <div className="flex-1 overflow-y-auto">
            <OphthalmologySuite
              patientName={selectedPatient ? selectedPatient.name : "Meenakshi Sundaram"}
              patientAge={selectedPatient ? selectedPatient.age : 64}
              patientGender={selectedPatient ? selectedPatient.gender : "Female"}
            />
          </div>
        ) : activeTab === "hematology" ? (
          <div className="flex-1 overflow-y-auto">
            <HematologySuite
              patientName={selectedPatient ? selectedPatient.name : "Devendra Roy"}
              patientAge={selectedPatient ? selectedPatient.age : 54}
              patientGender={selectedPatient ? selectedPatient.gender : "Male"}
            />
          </div>
        ) : activeTab === "nephrology" ? (
          <div className="flex-1 overflow-y-auto">
            <NephrologySuite
              patientName={selectedPatient ? selectedPatient.name : "Suresh Nambiar"}
              patientAge={selectedPatient ? selectedPatient.age : 61}
              patientGender={selectedPatient ? selectedPatient.gender : "Male"}
            />
          </div>
        ) : activeTab === "rheumatology" ? (
          <div className="flex-1 overflow-y-auto">
            <RheumatologySuite
              patientName={selectedPatient ? selectedPatient.name : "Sunita Deshmukh"}
              patientAge={selectedPatient ? selectedPatient.age : 46}
              patientGender={selectedPatient ? selectedPatient.gender : "Female"}
            />
          </div>
        ) : activeTab === "critical_care" ? (
          <div className="flex-1 overflow-y-auto">
            <CriticalCareSuite
              patientName={selectedPatient ? selectedPatient.name : "Rajesh Sharma"}
              patientAge={selectedPatient ? selectedPatient.age : 58}
              patientGender={selectedPatient ? selectedPatient.gender : "Male"}
            />
          </div>
        ) : activeTab === "gastroenterology" ? (
          <div className="flex-1 overflow-y-auto">
            <GastroenterologySuite
              patientName={selectedPatient ? selectedPatient.name : "Anil Kulkarni"}
              patientAge={selectedPatient ? selectedPatient.age : 52}
              patientGender={selectedPatient ? selectedPatient.gender : "Male"}
            />
          </div>
        ) : activeTab === "analytics" ? (
          <div className="flex-1 overflow-y-auto">
            <AnalyticsSuite />
          </div>
        ) : activeTab === "ai_core" ? (
          <div className="flex-1 overflow-y-auto">
            <SharedAICoreSuite
              initialSpecialty="cardiology"
            />
          </div>
        ) : activeTab === "pmjay_api" ? (
          <div className="flex-1 overflow-y-auto">
            <PmjaySuite />
          </div>
        ) : (
          /* ENTERPRISE SECURITY & COMPLIANCE SUITE VIEW */
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 space-y-6">
            
            {/* TOP HEADER STATUS */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest flex items-center gap-1 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> SECURE SHELL
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">COMPLIANCE SUITE v2.4</span>
                </div>
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
                  🛡️ <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">Enterprise Console</span>
                </h2>
                <p className="text-xs font-semibold text-slate-400">
                  HIPAA Audits, Row-Level Encryption, Multi-Tenant Isolation, and Government ABDM Sandbox Integrations
                </p>
              </div>

              {/* Quick Config Toggles Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto text-xs shrink-0">
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-750 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">ACTIVE TENANT</span>
                  <span className="font-extrabold text-slate-200 mt-1 truncate">
                    {activeTenantId === "tenant_default" ? "Apex Cardiology" : activeTenantId === "tenant_metro" ? "Metro General" : "CURA Primary"}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-750 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">ENCRYPTION ENGINE</span>
                  <span className={`font-extrabold mt-1 flex items-center gap-1.5 ${encryptionEnabled ? "text-emerald-400" : "text-amber-500"}`}>
                    {encryptionEnabled ? "🔒 AES-256 ACTIVE" : "🔓 RAW CLEARTEXT"}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-750 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">HITL SIGNATURES</span>
                  <span className={`font-extrabold mt-1 flex items-center gap-1.5 ${hitlEnabled ? "text-sky-400" : "text-slate-400"}`}>
                    {hitlEnabled ? "✅ STRICT (STAMPED)" : "⚠️ BYPASSED"}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-750 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">DPDP MFA ENFORCE</span>
                  <button
                    onClick={toggleMfaEnforcement}
                    className={`font-black mt-1 text-[10px] text-left uppercase flex items-center gap-1.5 cursor-pointer hover:underline ${
                      mfaEnforced ? "text-red-400 animate-pulse" : "text-slate-400"
                    }`}
                  >
                    {mfaEnforced ? "🛡️ ENFORCED (ON)" : "🔓 OFF (CLICK TO ON)"}
                  </button>
                </div>
              </div>
            </div>

            {/* SUB-NAVIGATOR TAB BUTTONS */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-150 shadow-sm overflow-x-auto gap-1">
              <button
                onClick={() => {
                  setEnterpriseSubTab("audit");
                  fetchEnterpriseStates();
                }}
                className={`py-3 px-5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  enterpriseSubTab === "audit"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span>📜 Compliance Audit Trail</span>
                {auditLogs.length > 0 && (
                  <span className="bg-red-500/20 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {auditLogs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setEnterpriseSubTab("encryption");
                  fetchEnterpriseStates();
                }}
                className={`py-3 px-5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  enterpriseSubTab === "encryption"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span>🔐 Row Encryption & Tenants</span>
                <span className={`h-1.5 w-1.5 rounded-full ${encryptionEnabled ? "bg-emerald-500" : "bg-amber-500"}`}></span>
              </button>

              <button
                onClick={() => {
                  setEnterpriseSubTab("ai");
                  fetchEnterpriseStates();
                }}
                className={`py-3 px-5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  enterpriseSubTab === "ai"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span>🧠 AI Prompts & HITL Control</span>
                <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  v{promptVersions.find(p => p.isActive)?.version || "1.0"}
                </span>
              </button>

              <button
                onClick={() => {
                  setEnterpriseSubTab("tasks");
                  fetchEnterpriseStates();
                }}
                className={`py-3 px-5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  enterpriseSubTab === "tasks"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span>🚀 Celery Queue & ABDM Sandbox</span>
                {backgroundTasks.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {backgroundTasks.filter(t => t.status !== "completed").length} active
                  </span>
                )}
              </button>
            </div>

            {/* INNER PANELS */}
            {enterpriseSubTab === "audit" && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-800">📜 HIPAA Security Audit Trail Logging</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Raw compliance logs monitoring medical record views, decryptions, and credential actions
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={clearAuditLogs}
                      className="text-xs font-black px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border-0 cursor-pointer"
                    >
                      Clear Audit Log File
                    </button>
                    <button
                      onClick={fetchEnterpriseStates}
                      className="text-xs font-black px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="h-3 w-3" /> Refresh Logs
                    </button>
                  </div>
                </div>

                <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-inner max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs font-medium text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Operator ID</th>
                        <th className="p-4">Tenant Code</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Resource Target</th>
                        <th className="p-4">Raw Ledger Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-sans italic font-bold">
                            No HIPAA access logs recorded in the ledger. Trigger database reads/writes in the dashboard to populate.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="p-4 text-slate-400 text-[10px] whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString("en-IN", { hour12: false })}
                            </td>
                            <td className="p-4 text-indigo-600 font-bold">{log.userId}</td>
                            <td className="p-4 text-slate-500 uppercase">{log.tenantId}</td>
                            <td className="p-4 text-slate-400 text-[11px]">{log.ipAddress}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                log.action === "decrypt" ? "bg-amber-100 text-amber-800" :
                                log.action === "delete" ? "bg-rose-100 text-rose-800" :
                                log.action === "create" ? "bg-emerald-100 text-emerald-800" :
                                log.action === "update" ? "bg-indigo-100 text-indigo-800" :
                                "bg-slate-100 text-slate-800"
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 text-[11px] font-sans font-bold">{log.resourceType} #{log.resourceId}</td>
                            <td className="p-4 text-slate-500 max-w-xs truncate font-sans text-xs" title={JSON.stringify(log.details)}>
                              {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex gap-3 text-sky-800 text-xs font-semibold leading-relaxed">
                  <div className="text-xl">ℹ️</div>
                  <div>
                    <h4 className="font-extrabold mb-0.5">HIPAA Access Controller Compliance Indicator</h4>
                    <p className="text-[11px] font-medium text-sky-700">
                      The CURA Audit System enforces strict audit trails by recording user identity, tenant scopes, IP-bound tokens, and encryption decodes. This guarantees real-time logs that are tamper-evident and compliant with global EHR protocols.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {enterpriseSubTab === "encryption" && (
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* COLUMN 1: CONTROL PANEL */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">🔐 Storage Cryptography & Partition Settings</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Configure row-level column encryption and tenant partitioning
                    </p>
                  </div>

                  {/* Toggle Encryption */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block">AES-256 Storage Scrambler</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Enforce database-level block ciphering</span>
                      </div>
                      <button
                        onClick={toggleEncryption}
                        className={`text-xs font-black px-4 py-2 rounded-xl transition-all border-0 cursor-pointer ${
                          encryptionEnabled 
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md" 
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {encryptionEnabled ? "🔒 Cryptography ACTIVE" : "🔓 Cryptography DISABLED"}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      {encryptionEnabled 
                        ? "✅ ENCRYPT_MODE: Patient diagnostic notes, diagnoses, and allergies are encrypted with an AES-256-GCM symmetric block key prior to saving. Raw memory is scrambled."
                        : "⚠️ CLEAR_TEXT_MODE: Columns are written raw in plaintext. Warn: Not HIPAA compliant for cloud persistence nodes."
                      }
                    </p>
                  </div>

                  {/* Partitioned Tenants */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-4">
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">Tenant Isolation Partition</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Simulate multi-clinic SaaS isolation scope</span>
                    </div>

                    <div className="space-y-2">
                      {tenantsList.map((tenant) => {
                        const isSelected = tenant.id === activeTenantId;
                        return (
                          <button
                            key={tenant.id}
                            onClick={() => switchTenant(tenant.id)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected 
                                ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-black">{tenant.name}</p>
                              <p className={`text-[10px] font-semibold ${isSelected ? "text-slate-400" : "text-slate-450"}`}>
                                Tier: <span className="uppercase">{tenant.tier}</span> • Code: {tenant.id}
                              </p>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                            }`}>
                              {isSelected ? "Active Workspace" : "Mount"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-[10px] text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100 leading-relaxed">
                      ⚠️ Switching workspaces isolates active state context. You will only see patient files mapped to the active workspace. This enforces strict row-level database partitioning!
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: REAL-TIME COMPARATIVE VIEW */}
                <div className="lg:col-span-7 bg-slate-900 text-slate-200 rounded-3xl border border-slate-800 shadow-xl p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="bg-amber-400/20 text-amber-400 border border-amber-400/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest flex items-center gap-1">
                        <Terminal className="h-3 w-3" /> SECURE SHELL TERMINAL
                      </span>
                      <span className="text-slate-500 text-[10px] font-mono">SCHEMA_PORT_VERIFIED</span>
                    </div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      📊 Row-Level DB Comparative Visualization
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Live comparative representation of storage tables vs. application clinician UI render
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    {/* Raw DB Storage state */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between h-[380px]">
                      <div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
                          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">🔐 RAW DISK STORAGE</span>
                          <span className="text-[9px] text-rose-500 font-extrabold uppercase">SCRAMBLED</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mb-3">
                          What is physically written to database files (HIPAA block storage nodes):
                        </p>
                      </div>

                      <div className="flex-1 font-mono text-[10px] text-rose-400 overflow-y-auto p-3 rounded-xl leading-relaxed select-none space-y-2">
                        {rawDbPreview.length === 0 ? (
                          <div className="text-center py-12 text-slate-600 font-sans italic">
                            Empty database table node. Register a patient under active workspace.
                          </div>
                        ) : (
                          rawDbPreview.map((item, idx) => (
                            <div key={idx} className="pb-2 border-b border-slate-800/30 last:border-0">
                              <p className="font-bold text-slate-400 text-[9px]">ID: {item.id} ({item.name})</p>
                              <p className="text-emerald-500 font-extrabold text-[9px]">TENANT: {item.tenantId}</p>
                              <p className="text-rose-400 truncate"><span className="text-slate-500">Allergies:</span> {item.allergies}</p>
                              <p className="text-rose-400 truncate"><span className="text-slate-500">Meds:</span> {item.meds}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Decrypted Clinician Decrypted Node */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between h-[380px]">
                      <div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
                          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">🧑‍⚕️ CLINICIAN VIEWPORT</span>
                          <span className="text-[9px] text-emerald-500 font-extrabold uppercase">DECRYPTED</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mb-3">
                          What is rendered in the verified clinician screen (bound to SSL audit token):
                        </p>
                      </div>

                      <div className="flex-1 font-mono text-[10px] text-emerald-400 overflow-y-auto p-3 rounded-xl leading-relaxed space-y-2">
                        {rawDbPreview.length === 0 ? (
                          <div className="text-center py-12 text-slate-600 font-sans italic">
                            Empty active viewport context.
                          </div>
                        ) : (
                          rawDbPreview.map((item, idx) => (
                            <div key={idx} className="pb-2 border-b border-slate-800/30 last:border-0">
                              <p className="font-bold text-slate-300 text-[9px]">ID: {item.id} ({item.name})</p>
                              <p className="text-indigo-400 font-extrabold text-[9px]">TENANT: {item.tenantId} (VERIFIED)</p>
                              <p className="text-emerald-400 truncate"><span className="text-slate-500">Allergies:</span> {item.decryptedAllergies}</p>
                              <p className="text-emerald-400 truncate"><span className="text-slate-500">Meds:</span> {item.decryptedMeds}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-medium text-slate-400 text-center leading-normal border-t border-slate-800 pt-3">
                    🚀 The system dynamically checks permission on disk reading. If encryption is enabled, raw disk entries remain scrambled blocks. The application core instantly logs a <span className="text-amber-400">&quot;decrypt&quot; audit ledger</span> once and yields clear text in-browser safely!
                  </div>
                </div>
              </div>
            )}

            {enterpriseSubTab === "ai" && (
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* AI PROMPT MANAGEMENT (LEFT PANEL) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-800 font-sans">🧠 Prompt Versioning & Sandbox Controller</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 font-sans">
                        Manage active system prompt models and deploy clinical guardrails
                      </p>
                    </div>
                    <button
                      onClick={fetchEnterpriseStates}
                      className="p-2 text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="h-3 w-3" /> Refresh
                    </button>
                  </div>

                  {/* Versions list */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">Deployed Prompt Templates</span>
                    <div className="grid grid-cols-1 gap-3">
                      {promptVersions.map((pv) => (
                        <div 
                          key={pv.id} 
                          className={`p-4 rounded-2xl border transition-all ${
                            pv.isActive 
                              ? "border-indigo-500 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-500/10" 
                              : "border-slate-150 bg-slate-50/50"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-800">{pv.title}</span>
                                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  v{pv.version}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold mt-1">
                                Author: {pv.author} • Updated: {new Date(pv.updatedAt).toLocaleDateString()}
                              </p>
                              <pre className="bg-slate-900 text-slate-300 text-[10.5px] font-mono leading-relaxed p-3 rounded-xl border border-slate-800 max-h-[140px] overflow-y-auto mt-2.5 whitespace-pre-wrap">
                                {pv.promptTemplate}
                              </pre>
                            </div>

                            <button
                              disabled={pv.isActive}
                              onClick={() => activatePromptVersion(pv.id)}
                              className={`text-[10px] font-black uppercase px-3.5 py-1.5 rounded-lg border transition-all shrink-0 ${
                                pv.isActive
                                  ? "bg-indigo-600 text-white border-indigo-600 cursor-default"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                              }`}
                            >
                              {pv.isActive ? "🟢 Active Engine" : "Activate"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add New Version Form */}
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                      const version = (form.elements.namedItem("version") as HTMLInputElement).value;
                      const author = (form.elements.namedItem("author") as HTMLInputElement).value;
                      const template = (form.elements.namedItem("template") as HTMLTextAreaElement).value;

                      try {
                        const response = await fetch("/api/v1/enterprise/prompts", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ title, version, author, promptTemplate: template })
                        });
                        if (response.ok) {
                          setSuccessMsg("Prompt template v" + version + " deployed successfully!");
                          fetchEnterpriseStates();
                          form.reset();
                        } else {
                          setErrorAlert("Error creating prompt template.");
                        }
                      } catch (err) {
                        setErrorAlert("Failed to save template.");
                      }
                    }} 
                    className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4"
                  >
                    <div>
                      <span className="text-xs font-black text-slate-800 block">Deploy New Clinical Prompt Version</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Author custom instruction sets for Gemini suggestion routines</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Title</label>
                        <input 
                          type="text" 
                          name="title" 
                          required
                          placeholder="e.g., Pediatric Focus"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Version</label>
                        <input 
                          type="text" 
                          name="version" 
                          required
                          placeholder="e.g., 3.1.0"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Author</label>
                        <input 
                          type="text" 
                          name="author" 
                          required
                          placeholder="Dr. Sharma"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Prompt Instructions Template</label>
                      <textarea 
                        name="template" 
                        required
                        rows={3}
                        placeholder="You are an enterprise medical EHR validator. Carefully check dosages for pediatric/adult groups..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      🚀 Compile & Defer Deploy Prompt Version
                    </button>
                  </form>
                </div>

                {/* HITL HUMAN-IN-THE-LOOP CONTROLS (RIGHT PANEL) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-black text-slate-800 font-sans">✍️ Human-in-the-Loop (HITL) Validation</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 font-sans">
                      Enforce strict clinician sign-offs on AI suggestions
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block">Require Signature Verification</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Locks AI output until doctor stamps approval</span>
                      </div>
                      <button
                        onClick={toggleHitlSetting}
                        className={`text-xs font-black px-4 py-2 rounded-xl transition-all border-0 cursor-pointer ${
                          hitlEnabled 
                            ? "bg-sky-500 text-white hover:bg-sky-600 shadow-md" 
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {hitlEnabled ? "✅ HITL MANDATORY" : "⚠️ HITL BYPASSED"}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      If active, EMR suggestions generated by Gemini are locked in a read-only buffer. They are not added to the patient's record until you review, customize, and stamp them with your secure digital signature credentials.
                    </p>
                  </div>

                  {/* Signature Configurator */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">Digital Prescription Stamp</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Official registration stamp applied to prescriptions</span>
                    </div>

                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={doctorSignatureInput}
                        onChange={(e) => setDoctorSignatureInput(e.target.value)}
                        placeholder="e.g. Dr. Sharma, MD - Reg #55443"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-750 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          setDoctorSignature(doctorSignatureInput);
                          setSuccessMsg("Digital validation stamp updated successfully!");
                        }}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer"
                      >
                        Update Stamp Credentials
                      </button>
                    </div>

                    <div className="border border-dashed border-slate-200 bg-white p-3 rounded-xl space-y-1 mt-2">
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider block">EMR Stamp Preview</span>
                      <p className="text-xs font-mono font-bold text-indigo-600 italic">
                        ✍️ Approved and digital-signed by:
                      </p>
                      <p className="text-xs font-black text-slate-700 font-sans">
                        {doctorSignature}
                      </p>
                    </div>
                  </div>

                  {/* AI Engine Router Configurations */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-4">
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">🤖 Intelligent AI Engine Router</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 font-sans">Dynamically switches between DeepSeek & Gemini based on clinical complexity</span>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-400 uppercase mb-1.5 font-sans">Default Routing Path</label>
                        <div className="grid grid-cols-3 gap-1 bg-white border border-slate-200 p-0.5 rounded-xl">
                          {(["auto", "gemini", "deepseek"] as const).map((pref) => (
                            <button
                              key={pref}
                              type="button"
                              onClick={() => saveAiRouterSettings(pref, aiFallbackEnabled, aiConfidenceThreshold)}
                              className={`text-[9px] font-black py-1.5 rounded-lg transition-all capitalize cursor-pointer ${
                                aiPreference === pref
                                  ? "bg-slate-900 text-white shadow-sm"
                                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {pref === "auto" ? "🤖 Auto" : pref === "gemini" ? "✦ Gemini" : "🐳 DeepSeek"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                        <div>
                          <span className="text-xs font-extrabold text-slate-800 block font-sans">Active Self-Aware Fallback</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 font-sans">Auto-retry secondary model on fail or low-confidence</span>
                        </div>
                        <button
                          onClick={() => saveAiRouterSettings(aiPreference, !aiFallbackEnabled, aiConfidenceThreshold)}
                          className={`text-[10px] font-black px-3 py-1.5 rounded-xl transition-all border-0 cursor-pointer ${
                            aiFallbackEnabled
                              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          }`}
                        >
                          {aiFallbackEnabled ? "ACTIVE" : "DISABLED"}
                        </button>
                      </div>

                      <div className="border-t border-slate-200/60 pt-3 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-800 block font-sans">Self-Aware Confidence Threshold</span>
                          <span className="text-[10px] font-mono font-black text-indigo-600 font-sans">{(aiConfidenceThreshold * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="0.95"
                          step="0.05"
                          value={aiConfidenceThreshold}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setAiConfidenceThreshold(val);
                          }}
                          onMouseUp={() => saveAiRouterSettings(aiPreference, aiFallbackEnabled, aiConfidenceThreshold)}
                          onTouchEnd={() => saveAiRouterSettings(aiPreference, aiFallbackEnabled, aiConfidenceThreshold)}
                          className="w-full accent-slate-900 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                        />
                        <p className="text-[9px] text-slate-400 font-semibold leading-relaxed font-sans">
                          If the primary engine returns a response with diagnostic confidence below this threshold, CURA will dynamically fallback and cross-reference with the alternate provider in real-time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {enterpriseSubTab === "tasks" && (
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* CELERY WORKER QUEUE (LEFT COLUMN) */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 font-sans">
                        <span className="animate-pulse inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                        Celery + Redis Background Scheduler
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 font-sans">
                        Asynchronous broker buffer for WhatsApp queues and heavy clinical workloads
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={triggerBackgroundTick}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-lg transition-all border-0 shadow cursor-pointer flex items-center gap-1"
                        title="Simulate background worker step processing"
                      >
                        ⚙️ Step Worker
                      </button>
                      <button
                        onClick={fetchEnterpriseStates}
                        className="p-1.5 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg transition-all"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Add simulated job */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                    <span className="text-xs font-black text-slate-800 block">Queue Custom Asynchronous Workload</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addBackgroundTask("whatsapp_prescription", "Send Patient Prescription regimen to +91 99887 76655")}
                        className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-750 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        💬 Queue WhatsApp Task
                      </button>
                      <button
                        onClick={() => addBackgroundTask("abdm_push", "Export local clinical record Timeline #44 to ABDM sandbox Gateway")}
                        className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-750 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        🏛️ Queue ABDM Push
                      </button>
                    </div>
                  </div>

                  {/* Task list queue */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">Redis Message Broker Queue ({backgroundTasks.length})</span>
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {backgroundTasks.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 italic text-xs font-bold">
                          Broker queue empty. All background tasks dispatched.
                        </div>
                      ) : (
                        backgroundTasks.map((task) => (
                          <div key={task.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between text-xs font-medium">
                            <div className="space-y-1 max-w-[70%]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-mono text-slate-400 font-bold bg-white border px-1.5 py-0.2 rounded">
                                  {task.id}
                                </span>
                                <span className="font-extrabold text-slate-800 truncate">{task.taskName}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-semibold font-sans">{task.payload}</p>
                              <div className="flex items-center gap-2 text-[9px] text-slate-400">
                                <span>Buffer: Redis 15</span>
                                <span>•</span>
                                <span>Progress: {task.progress}%</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase block border tracking-wider text-center ${
                                task.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                task.status === "executing" ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse" :
                                task.status === "celery_claimed" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                                task.status === "redis_queued" ? "bg-purple-50 text-purple-700 border-purple-100" :
                                "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>
                                {task.status.replace("_", " ")}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono block mt-1">
                                {new Date(task.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold leading-normal text-center">
                    💡 Click <strong className="text-slate-500">&quot;Step Worker&quot;</strong> to simulate active Celery task runners fetching, claiming, and writing outputs dynamically!
                  </p>
                </div>

                {/* ABDM SANDBOX GATEWAY (RIGHT COLUMN) */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 font-sans">
                      🏛️ ABDM / NDHM National Sandbox Gateway
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 font-sans">
                      Verify ABHA health IDs and link secure remote electronic records
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase font-sans">Search ABDM Sandbox Registry</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={abdmSearchAbha}
                        onChange={(e) => setAbdmSearchAbha(e.target.value)}
                        placeholder="Enter ABHA ID (e.g. 91-0023-4567-8901)"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={searchAbdmRecords}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer border-0 shrink-0"
                      >
                        Verify & Query
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold leading-normal">
                      💡 Try querying <strong className="text-slate-500">91-0023-4567-8901</strong> or <strong className="text-slate-500">91-8877-6655-4433</strong> to fetch compliant sandbox EHR notes from central government servers!
                    </p>
                  </div>

                  {abdmError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-3.5 rounded-2xl font-semibold">
                      ❌ {abdmError}
                    </div>
                  )}

                  {abdmSuccess && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3.5 rounded-2xl font-semibold">
                      ✅ {abdmSuccess}
                    </div>
                  )}

                  {abdmRecordResult && (
                    <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-4 font-medium">
                      <div className="flex justify-between items-start pb-3 border-b border-slate-150">
                        <div>
                          <p className="text-xs font-black text-slate-800">ABDM Registry Node Verified</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">ABHA: {abdmRecordResult.abhaId}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                          MATCHED
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed text-slate-500 font-semibold font-sans">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Full Name</span>
                          <span className="text-slate-800 font-bold">{abdmRecordResult.name}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Gender / Age</span>
                          <span className="text-slate-800">{abdmRecordResult.gender} • {abdmRecordResult.age} yrs</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Government-Authenticated Allergies</span>
                          <span className="text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded inline-block text-[10px] font-bold mt-1">
                            ⚠️ {abdmRecordResult.allergies}
                          </span>
                        </div>
                      </div>

                      <div className="border border-slate-150 bg-white p-3 rounded-xl space-y-2">
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Remote Clinical Diagnosis Timeline</span>
                          <span className="text-[9px] text-indigo-600 font-black">NDHM APPROVED</span>
                        </div>
                        <p className="text-xs font-black text-slate-800">{abdmRecordResult.remoteDiagnosis}</p>
                        <p className="text-xs font-semibold text-slate-500 italic mt-0.5">&ldquo;{abdmRecordResult.remoteNotes}&rdquo;</p>
                        <p className="text-[10px] font-mono text-slate-400 font-bold pt-1">Treating Clinician: {abdmRecordResult.remoteDoctor}</p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase font-sans">Local Onboarding Destination</label>
                        <select
                          id="abdmLocalPatientSelect"
                          className="w-full bg-white border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none"
                        >
                          <option value="">-- Select Active Local Patient --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.fullName} ({p.id})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const select = document.getElementById("abdmLocalPatientSelect") as HTMLSelectElement;
                            const pid = select?.value;
                            if (!pid) {
                              setAbdmError("Please select a local patient file from the destination list first.");
                              return;
                            }
                            linkAbdmRecord(abdmRecordResult.abhaId, pid);
                          }}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer border-0 flex items-center justify-center gap-1.5 font-sans"
                        >
                          🔗 Import Remote Record to Timeline
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD PATIENT MODAL */}
      <AnimatePresence>
        {showAddPatient && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAddPatient(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-black text-slate-900 mb-2">Register New Patient</h3>
              <p className="text-slate-500 text-xs font-semibold mb-6 uppercase tracking-wider">CURA Clinic Network EMR File Creator</p>

              <form onSubmit={handleAddPatientSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Patient Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Age in years *</label>
                    <input 
                      type="number" 
                      required 
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(e.target.value)}
                      placeholder="e.g. 38"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gender *</label>
                    <select 
                      value={newPatientGender}
                      onChange={(e: any) => setNewPatientGender(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Blood Group</label>
                    <input 
                      type="text" 
                      value={newPatientBlood}
                      onChange={(e) => setNewPatientBlood(e.target.value)}
                      placeholder="e.g. AB+"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number (WhatsApp) *</label>
                    <input 
                      type="tel" 
                      required 
                      value={newPatientPhone}
                      onChange={(e) => setNewPatientPhone(e.target.value)}
                      placeholder="+91 99887 76655"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={newPatientEmail}
                      onChange={(e) => setNewPatientEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Known Drug Allergies (comma separated)</label>
                  <input 
                    type="text" 
                    value={newPatientAllergies}
                    onChange={(e) => setNewPatientAllergies(e.target.value)}
                    placeholder="e.g. Sulfa, Penicillin"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Chronic Medications (comma separated)</label>
                  <input 
                    type="text" 
                    value={newPatientMeds}
                    onChange={(e) => setNewPatientMeds(e.target.value)}
                    placeholder="e.g. Insulin 10 units, Atorvastatin 10mg"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 gradient-btn-cura hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-md transition-all pt-4"
                >
                  Create Patient EHR Node
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: INTERACTIVE WHATSAPP MOCK RECEIPT MODAL */}
      <AnimatePresence>
        {showWhatsAppModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-[#efeae2] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative border border-emerald-900/10"
            >
              {/* WhatsApp Mock Header */}
              <div className="bg-[#075e54] text-white px-4 py-3.5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm">
                    {selectedPatient?.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">{selectedPatient?.fullName}</h4>
                    <p className="text-[10px] text-emerald-100 font-semibold">online</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWhatsAppModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-white transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Chat history space */}
              <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto font-medium">
                <p className="text-[10px] font-bold text-center bg-sky-100/90 text-sky-800 py-1.5 px-3 rounded-xl max-w-[200px] mx-auto">
                  🔒 Messages and calls are end-to-end encrypted.
                </p>

                {/* Sent message */}
                <div className="bg-[#dcf8c6] rounded-2xl p-3.5 max-w-[85%] ml-auto text-xs text-slate-800 space-y-1 relative shadow-sm border border-emerald-100">
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed font-semibold text-slate-700">{whatsappSentMessage}</pre>
                  <div className="text-[9px] text-slate-400 font-bold text-right flex items-center justify-end gap-1 mt-1">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[#34b7f1] text-base font-black">✓✓</span>
                  </div>
                </div>

                {/* Patient response mock */}
                <div className="bg-white rounded-2xl p-3 max-w-[80%] text-xs text-slate-700 shadow-sm border border-slate-100 space-y-1">
                  <p className="font-semibold text-slate-800 italic">&ldquo;Thank you, Dr. Sharma! I have received the prescription. I will avoid taking Penicillin.&rdquo;</p>
                  <div className="text-[9px] text-slate-400 font-bold text-right mt-1">
                    <span>Just now</span>
                  </div>
                </div>
              </div>

              {/* Mock Chat Input Footer */}
              <div className="bg-slate-100 px-4 py-3 flex items-center gap-3 border-t border-slate-200">
                <input 
                  type="text" 
                  disabled
                  placeholder="Type a message..." 
                  className="flex-1 px-4 py-2 bg-white rounded-full border border-slate-200 text-xs font-semibold focus:outline-none"
                />
                <button 
                  disabled
                  className="bg-[#075e54] text-white p-2.5 rounded-full shadow"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Status info */}
              <div className="bg-emerald-50 px-4 py-2.5 text-center text-[11px] font-bold text-emerald-800 border-t border-emerald-100">
                🏆 CURA WhatsApp Node successfully completed visit!
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: SECURE CHECKOUT & BILLING SYSTEM MODAL */}
      <AnimatePresence>
        {showCheckoutModal && checkoutTier && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative border border-slate-100 p-6 md:p-8 space-y-6 text-slate-800"
            >
              <button 
                onClick={() => {
                  setShowCheckoutModal(false);
                  setPaymentSuccess(false);
                }}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              {!paymentSuccess ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <span className="bg-sky-50 text-sky-700 uppercase text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full border border-sky-100">
                      🔐 Secure SSL Checkout Integration
                    </span>
                    <h3 className="text-xl font-black text-slate-900">
                      Simulate Razorpay & Stripe Payment
                    </h3>
                    <p className="text-xs font-semibold text-slate-400">
                      Multi-tenant SaaS subscription billing handshake
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Plan Selected:</span>
                      <span className="text-slate-800 uppercase font-extrabold tracking-wider">{checkoutTier.replace("-", " ")}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Price Model:</span>
                      <span className="text-cura-primary font-black">
                        {checkoutTier === "trial" ? "Free" : checkoutTier === "solo-clinic" ? "₹1,499 / mo" : checkoutTier === "nursing-home" ? "₹4,999 / mo" : "₹49,999 / mo (Enterprise)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold border-t border-slate-200 pt-2 mt-2">
                      <span className="text-slate-800">Total Charged Today:</span>
                      <span className="text-slate-900 text-sm font-black">
                        {checkoutTier === "trial" ? "₹0.00" : checkoutTier === "solo-clinic" ? "₹1,499.00" : checkoutTier === "nursing-home" ? "₹4,999.00" : "₹49,999.00"}
                      </span>
                    </div>
                  </div>

                  {/* Payment form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Cardholder Name</label>
                      <input 
                        type="text" 
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cura-primary/10 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Credit Card Number</label>
                      <input 
                        type="text" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4111 2222 3333 4444"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cura-primary/10 text-slate-800 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Expiration Date</label>
                        <input 
                          type="text" 
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cura-primary/10 text-slate-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">CVV Security Code</label>
                        <input 
                          type="password" 
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cura-primary/10 text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <span className="text-emerald-500">✔</span> Card payments are simulated securely via Stripe and Razorpay webhook integrations. No real money is spent.
                  </div>

                  <button
                    onClick={handleUpgradeTier}
                    disabled={isProcessingPayment}
                    className="w-full py-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-1"></span>
                        Authorizing Webhook Charge...
                      </>
                    ) : (
                      <>
                        🔒 Pay {checkoutTier === "trial" ? "₹0.00" : checkoutTier === "solo-clinic" ? "₹1,499.00" : checkoutTier === "nursing-home" ? "₹4,999.00" : "₹49,999.00"} Securely
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <Check className="h-8 w-8 text-emerald-600 stroke-[3px]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">Subscription Upgraded!</h3>
                    <p className="text-xs font-semibold text-slate-400">
                      Razorpay Webhook Callback Handshake Success
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold leading-relaxed text-slate-600 space-y-2">
                    <p>
                      Your clinic's multi-tenant EMR plan has been upgraded to the <span className="text-cura-primary uppercase">{checkoutTier}</span> plan.
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Transaction Ref: <span className="font-mono text-[9px]">tx_razor_{Math.random().toString(36).substr(2, 9)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setPaymentSuccess(false);
                      setActiveTab("saas");
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all"
                  >
                    Return to SaaS Control Center
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PRINTABLE CLINICAL IDENTITY CARD */}
      <AnimatePresence>
        {showPrintCardPatient && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-id-card, #printable-id-card * {
                  visibility: visible !important;
                }
                #printable-id-card {
                  position: fixed !important;
                  left: 50% !important;
                  top: 40% !important;
                  transform: translate(-50%, -50%) scale(1.4) !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: white !important;
                  width: 480px !important;
                  height: auto !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                    🖨️ National Health Identity Card
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">NDHM ABHA Compliance & EHR Indexing Card</p>
                </div>
                <button
                  onClick={() => setShowPrintCardPatient(null)}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* HIGH FIDELITY ID CARD LAYOUT */}
              <div 
                id="printable-id-card" 
                className="border-2 border-slate-900 bg-white p-5 rounded-2xl flex flex-col gap-4 text-slate-800 shadow-md relative overflow-hidden select-none"
                style={{ width: "100%", maxWidth: "440px", alignSelf: "center" }}
              >
                {/* Background decorative security mesh */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* ID Card Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                      ✙
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-tight text-slate-900 uppercase">
                        {tenantConfig?.clinicName || "Cura EMR Networks"}
                      </h4>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        Integrated Clinical Identity System
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[7px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                      EHR Verified
                    </span>
                  </div>
                </div>

                {/* ID Card Center Info */}
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Photo Column */}
                  <div className="col-span-4 flex flex-col items-center gap-1.5">
                    <div className="h-24 w-20 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
                      <User className="h-8 w-8 stroke-[1.5]" />
                      <span className="text-[7px] font-extrabold uppercase mt-1">Photo ID</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      ID: {showPrintCardPatient.patientCode || showPrintCardPatient.id.substring(0, 10).toUpperCase()}
                    </span>
                  </div>

                  {/* Details Column */}
                  <div className="col-span-8 space-y-1.5 text-xs font-bold text-slate-800">
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                      <p className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                        {showPrintCardPatient.fullName}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Sex / Age</p>
                        <p className="text-slate-800 uppercase">
                          {showPrintCardPatient.gender} / {showPrintCardPatient.age || 28} Yrs
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</p>
                        <p className="text-rose-600 font-extrabold uppercase">
                          {showPrintCardPatient.bloodGroup || "O+"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">ABHA ID (IND-NDHM)</p>
                      <p className="text-slate-900 font-mono text-[11px] font-bold bg-slate-100 px-1.5 py-0.5 rounded inline-block border border-slate-200">
                        {showPrintCardPatient.abhaId || "NOT REGISTERED"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID Card Footer Barcodes */}
                <div className="border-t border-slate-900 pt-3 flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Universal Clinical File QR</p>
                    {/* Simulated High-Fidelity Barcode */}
                    <div className="h-6 w-full opacity-90">
                      <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <rect x="0" width="100" height="20" fill="white" />
                        <rect x="3" width="2" height="20" fill="black" />
                        <rect x="7" width="1" height="20" fill="black" />
                        <rect x="10" width="3" height="20" fill="black" />
                        <rect x="15" width="1" height="20" fill="black" />
                        <rect x="18" width="2" height="20" fill="black" />
                        <rect x="22" width="4" height="20" fill="black" />
                        <rect x="28" width="1" height="20" fill="black" />
                        <rect x="31" width="3" height="20" fill="black" />
                        <rect x="36" width="2" height="20" fill="black" />
                        <rect x="40" width="1" height="20" fill="black" />
                        <rect x="43" width="4" height="20" fill="black" />
                        <rect x="49" width="1" height="20" fill="black" />
                        <rect x="52" width="2" height="20" fill="black" />
                        <rect x="56" width="3" height="20" fill="black" />
                        <rect x="61" width="1" height="20" fill="black" />
                        <rect x="64" width="4" height="20" fill="black" />
                        <rect x="70" width="2" height="20" fill="black" />
                        <rect x="74" width="1" height="20" fill="black" />
                        <rect x="77" width="3" height="20" fill="black" />
                        <rect x="82" width="1" height="20" fill="black" />
                        <rect x="85" width="2" height="20" fill="black" />
                        <rect x="89" width="4" height="20" fill="black" />
                        <rect x="95" width="2" height="20" fill="black" />
                      </svg>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {/* Simulated Native SVG QR Code */}
                    <svg className="h-11 w-11 text-slate-900 border border-slate-300 p-0.5 rounded bg-white" viewBox="0 0 100 100">
                      <rect x="0" y="0" width="100" height="100" fill="white" />
                      <rect x="5" y="5" width="30" height="30" fill="black" />
                      <rect x="11" y="11" width="18" height="18" fill="white" />
                      <rect x="15" y="15" width="10" height="10" fill="black" />

                      <rect x="65" y="5" width="30" height="30" fill="black" />
                      <rect x="71" y="11" width="18" height="18" fill="white" />
                      <rect x="75" y="15" width="10" height="10" fill="black" />

                      <rect x="5" y="65" width="30" height="30" fill="black" />
                      <rect x="11" y="71" width="18" height="18" fill="white" />
                      <rect x="15" y="75" width="10" height="10" fill="black" />

                      <rect x="45" y="10" width="10" height="10" fill="black" />
                      <rect x="40" y="25" width="15" height="5" fill="black" />
                      <rect x="10" y="45" width="10" height="15" fill="black" />
                      <rect x="25" y="40" width="20" height="10" fill="black" />
                      <rect x="50" y="45" width="10" height="10" fill="black" />
                      <rect x="40" y="60" width="15" height="15" fill="black" />
                      <rect x="65" y="45" width="15" height="10" fill="black" />
                      <rect x="80" y="55" width="15" height="15" fill="black" />
                      <rect x="60" y="75" width="25" height="5" fill="black" />
                      <rect x="75" y="85" width="15" height="10" fill="black" />
                    </svg>
                  </div>
                </div>

                {/* ID Card Back Info Bar */}
                <div className="text-[7px] font-bold text-slate-400 mt-1 flex justify-between border-t border-slate-100 pt-1">
                  <span>Emergency: {showPrintCardPatient.emergencyContact || showPrintCardPatient.phone}</span>
                  <span>Allergies: {showPrintCardPatient.allergies && showPrintCardPatient.allergies.length > 0 ? showPrintCardPatient.allergies.join(", ") : "None"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end no-print pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowPrintCardPatient(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Patient ID Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOSAGE ADJUSTMENT & INTERACTION MODAL */}
      <AnimatePresence>
        {dosageAdjustmentModal.isOpen && dosageAdjustmentModal.med && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl relative border-2 border-rose-300 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setDosageAdjustmentModal(prev => ({ ...prev, isOpen: false }))}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Clinical Safety & Dosage Adjustment</h3>
                  <p className="text-xs font-bold text-rose-700">AI Consultation Copilot Interaction Engine</p>
                </div>
              </div>

              {/* Alert Details */}
              {dosageAdjustmentModal.alerts.map((alert, aIdx) => (
                <div key={aIdx} className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4 space-y-2">
                  <div className="flex items-center gap-2 font-black text-rose-900 text-sm">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                    <strong>Trigger Source:</strong> {alert.triggerSource}
                  </p>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white/80 p-2.5 rounded-xl border border-rose-100">
                    {alert.description}
                  </p>
                </div>
              ))}

              {/* Prescribed Drug Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Medication Entry</span>
                <p className="text-sm font-black text-slate-900">
                  💊 {dosageAdjustmentModal.med.drugName} <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-800 ml-1">{dosageAdjustmentModal.med.dosage}</span>
                </p>
                <p className="text-xs text-slate-600 font-semibold">
                  Frequency: {dosageAdjustmentModal.med.frequency} • Duration: {dosageAdjustmentModal.med.duration}
                </p>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-3 mb-6">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider block">Recommended Adjustments & Safe Swaps</span>

                {dosageAdjustmentModal.alerts[0]?.suggestedAlternativeDose && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-amber-600" /> Safe Dose Adjustment:
                      </p>
                      <p className="text-xs font-bold text-amber-950">
                        {dosageAdjustmentModal.alerts[0].suggestedAlternativeDose.dosage} ({dosageAdjustmentModal.alerts[0].suggestedAlternativeDose.frequency})
                      </p>
                      <p className="text-[11px] text-amber-800 font-medium">
                        {dosageAdjustmentModal.alerts[0].suggestedAlternativeDose.reason}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const altDose = dosageAdjustmentModal.alerts[0].suggestedAlternativeDose;
                        if (dosageAdjustmentModal.isCustomInput) {
                          setCustomMedDosage(altDose.dosage);
                          setCustomMedFreq(altDose.frequency);
                          setCustomMedDuration(altDose.duration);
                        } else if (dosageAdjustmentModal.activeIndex !== undefined) {
                          handleApplyAlternativeDoseInActive(dosageAdjustmentModal.activeIndex, altDose);
                        }
                        setDosageAdjustmentModal(prev => ({ ...prev, isOpen: false }));
                      }}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="h-4 w-4" /> Apply Safe Dose
                    </button>
                  </div>
                )}

                {dosageAdjustmentModal.alerts[0]?.suggestedAlternativeDrug && (
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-emerald-600" /> Safe Alternative Drug Swap:
                      </p>
                      <p className="text-xs font-bold text-emerald-950">
                        💊 {dosageAdjustmentModal.alerts[0].suggestedAlternativeDrug.drugName} • {dosageAdjustmentModal.alerts[0].suggestedAlternativeDrug.dosage} ({dosageAdjustmentModal.alerts[0].suggestedAlternativeDrug.frequency})
                      </p>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        {dosageAdjustmentModal.alerts[0].suggestedAlternativeDrug.reason}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const altDrug = dosageAdjustmentModal.alerts[0].suggestedAlternativeDrug;
                        if (dosageAdjustmentModal.isCustomInput) {
                          setCustomMedName(altDrug.drugName);
                          setCustomMedDosage(altDrug.dosage);
                          setCustomMedFreq(altDrug.frequency);
                          setCustomMedDuration(altDrug.duration);
                          setCustomMedReason(altDrug.reason);
                        } else if (dosageAdjustmentModal.activeIndex !== undefined) {
                          handleApplyAlternativeDrugInActive(dosageAdjustmentModal.activeIndex, altDrug);
                        }
                        setDosageAdjustmentModal(prev => ({ ...prev, isOpen: false }));
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="h-4 w-4" /> Swap to Safe Drug
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setDosageAdjustmentModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CURA PRODUCT TOUR SELF-DEMO VIDEO COMPONENT */}
      <ProductTour 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
        onNavigateToFeature={(targetId) => {
          if (targetId === "command-center" || targetId === "voice-prescription" || targetId === "drug-guard") {
            setActiveTab("clinical");
          } else if (targetId === "ai-memory" || targetId === "patients") {
            setActiveTab("clinical");
          } else if (targetId === "telemedicine") {
            setActiveTab("telemedicine");
          } else if (targetId === "whatsapp") {
            setActiveTab("frontoffice");
          }
        }}
      />

      {/* PM-JAY API SETU INSPECTOR / SANDBOX MODAL */}
      {isPmjayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="w-full max-w-6xl max-h-[92vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700">
            <PmjaySuite onClose={() => setIsPmjayModalOpen(false)} />
          </div>
        </div>
      )}

    </div>
  );
}
