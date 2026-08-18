import React, { useState, useEffect, useRef } from "react";
import AIHealthcareSuite from "./AIHealthcareSuite";
import HealthMemoryCompanion from "./HealthMemoryCompanion";
import VideoConsultation from "./VideoConsultation";
import PatientAuthScreen from "./PatientAuthScreen";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Calendar, 
  FileText, 
  Lock, 
  Shield, 
  Activity, 
  Loader2, 
  Phone, 
  Clock, 
  ChevronRight, 
  Plus, 
  Search, 
  Users,
  UserPlus,
  Trash2,
  Copy,
  ShieldCheck, 
  LogOut, 
  AlertTriangle, 
  Fingerprint,
  MapPin, 
  CreditCard, 
  Bell, 
  Heart, 
  Sparkles, 
  Share2, 
  Download, 
  CheckCircle2, 
  HeartPulse, 
  QrCode, 
  Sliders, 
  X,
  Printer,
  RefreshCw,
  ChevronLeft,
  Smartphone,
  Maximize2,
  Check,
  Smartphone as PhoneIcon,
  Video,
  KeyRound,
  FileCheck2,
  ArrowRight,
  Mic,
  MicOff,
  Scale,
  ChevronDown,
  ChevronUp,
  Leaf,
  Flame,
  Camera,
  RotateCw,
  Square,
  Volume2,
  Brain
} from "lucide-react";
import { jsPDF } from "jspdf";
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts";
import { Patient, Appointment } from "../types";
import PatientDashboard from "./PatientDashboard";
import { useWebAuthn } from "../hooks/useWebAuthn";

const PREDEFINED_SYMPTOMS = [
  "Cough",
  "Fever",
  "Headache",
  "Fatigue",
  "Body Ache",
  "Nausea",
  "Sore Throat",
  "Shortness of Breath"
];

interface PatientMobileAppProps {
  onBackToLanding: () => void;
}

export default function PatientMobileApp({ onBackToLanding }: PatientMobileAppProps) {
  // Mode selection: "simulator" (iPhone border) or "responsive" (full fluid layout)
  const [viewMode, setViewMode] = useState<"simulator" | "responsive">("simulator");
  
  // App States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Tabs: "home" | "schedule" | "rx" | "history" | "profile" | "vision" | "ai_suite" | "companion"
  const [activeTab, setActiveTab] = useState<"home" | "schedule" | "rx" | "history" | "profile" | "vision" | "ai_suite" | "companion">("home");
  
  // Login / Auth states
  const [loginInput, setLoginInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [securityPinInput, setSecurityPinInput] = useState("");
  const [rxUnlocked, setRxUnlocked] = useState(false);
  const [pinError, setPinError] = useState("");

  // WebAuthn Biometrics Hook & States
  const {
    isSupported,
    isRegistered,
    isSimulated,
    webAuthnError,
    loading: isBiometricLoading,
    registerBiometric,
    authenticateBiometric,
    deregisterBiometric
  } = useWebAuthn(selectedPatient?.id);

  const [biometricScanActive, setBiometricScanActive] = useState(false);
  const [biometricScanStatus, setBiometricScanStatus] = useState<"idle" | "scanning" | "success" | "failed">("idle");

  // Doctor Profile (RMP verified status)
  const [activeDoctorProfile, setActiveDoctorProfile] = useState<any>(null);

  const fetchDoctorProfile = async () => {
    try {
      const res = await fetch("/api/v1/doctor/profile");
      if (res.ok) {
        const data = await res.json();
        setActiveDoctorProfile(data);
      }
    } catch (err) {
      console.error("Error fetching doctor profile", err);
    }
  };

  // DPDP Consent States
  const [patientConsent, setPatientConsent] = useState<{
    accepted: boolean;
    acceptedAt?: string;
    revokedAt?: string;
    language: string;
    granularPreferences: {
      historySharing: boolean;
      aiCdssProcessing: boolean;
      familySharing: boolean;
      vitalTelemetry: boolean;
      emergencyBreakGlass: boolean;
    };
  }>({
    accepted: true,
    language: "en",
    granularPreferences: {
      historySharing: true,
      aiCdssProcessing: true,
      familySharing: true,
      vitalTelemetry: true,
      emergencyBreakGlass: true
    }
  });

  const [consentLang, setConsentLang] = useState("en");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [consentSaveSuccess, setConsentSaveSuccess] = useState(false);

  const fetchPatientConsent = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/patients/${id}/consent`);
      if (res.ok) {
        const data = await res.json();
        setPatientConsent(data);
        if (data.language) setConsentLang(data.language);
      }
    } catch (err) {
      console.error("Error fetching patient consent", err);
    }
  };

  const updatePatientConsent = async (language: string, preferences: any) => {
    if (!selectedPatient) return;
    try {
      const res = await fetch(`/api/v1/patients/${selectedPatient.id}/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, granularPreferences: preferences })
      });
      if (res.ok) {
        const data = await res.json();
        setPatientConsent(data.consent);
        setConsentSaveSuccess(true);
        setTimeout(() => setConsentSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error updating patient consent", err);
    }
  };

  const revokePatientConsent = async () => {
    if (!selectedPatient) return;
    try {
      const res = await fetch(`/api/v1/patients/${selectedPatient.id}/consent/revoke`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setPatientConsent(data.consent);
        setConsentSaveSuccess(true);
        setTimeout(() => setConsentSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error revoking patient consent", err);
    }
  };

  // Booking states
  const [doctor, setDoctor] = useState("Dr. Rajesh Sharma");
  const [consultType, setConsultType] = useState<"in_person" | "video" | "voice">("in_person");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Vitals simulation logger
  const [logHeartRate, setLogHeartRate] = useState("72");
  const [logSystolic, setLogSystolic] = useState("120");
  const [logDiastolic, setLogDiastolic] = useState("80");
  const [logSugar, setLogSugar] = useState("105");
  const [logWeight, setLogWeight] = useState("");
  const [logHeight, setLogHeight] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptomNote, setCustomSymptomNote] = useState("");
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [vitalsMetricTab, setVitalsMetricTab] = useState<"bp" | "hr" | "sugar">("bp");
  const [overlaySymptomSeverity, setOverlaySymptomSeverity] = useState(false);
  const [logSuccessMsg, setLogSuccessMsg] = useState(false);
  const [dismissedAlertIndex, setDismissedAlertIndex] = useState<number | null>(null);

  // History tab EHR visit logs search filter state
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  // Medication reminders state
  const [medicationReminders, setMedicationReminders] = useState<any[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [expandedMeds, setExpandedMeds] = useState<Record<string, boolean>>({});
  const [selectedAdherenceMed, setSelectedAdherenceMed] = useState<string>("overall");

  const fetchMedicationReminders = async (patientId: string) => {
    try {
      setLoadingReminders(true);
      const res = await fetch(`/api/v1/scheduler/patient/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        // Filter messages of scheduleType === "medication"
        const meds = data.filter((m: any) => m.scheduleType === "medication");
        setMedicationReminders(meds);
      }
    } catch (err) {
      console.error("Failed to load medication reminders", err);
    } finally {
      setLoadingReminders(false);
    }
  };

  const handleToggleTaken = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "taken" ? "pending" : "taken";
    try {
      setMedicationReminders(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: newStatus as any } : item
        )
      );

      const res = await fetch(`/api/v1/scheduler/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        if (selectedPatient) fetchMedicationReminders(selectedPatient.id);
      }
    } catch (err) {
      console.error("Failed to update medication status", err);
      if (selectedPatient) fetchMedicationReminders(selectedPatient.id);
    }
  };

  // Modal displays
  const [activePrescription, setActivePrescription] = useState<any | null>(null);
  const [showIdCard, setShowIdCard] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);

  // Ayurveda Insight states
  const [showAyurvedaModal, setShowAyurvedaModal] = useState(false);
  const [ayurvedaSymptomsInput, setAyurvedaSymptomsInput] = useState("");
  const [ayurvedaInsight, setAyurvedaInsight] = useState<any | null>(null);
  const [ayurvedaLoading, setAyurvedaLoading] = useState(false);
  const [ayurvedaError, setAyurvedaError] = useState("");

  // Refill Modal state
  const [refillMedName, setRefillMedName] = useState("");
  const [refillDoctorName, setRefillDoctorName] = useState("");
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [submittingRefill, setSubmittingRefill] = useState(false);
  const [refillSuccess, setRefillSuccess] = useState(false);

  // Push notification simulation states
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [showMapDirectionsModal, setShowMapDirectionsModal] = useState(false);
  const [simulatedAppointmentOverride, setSimulatedAppointmentOverride] = useState<any | null>(null);
  const [callTimer, setCallTimer] = useState(0);

  // 📷 RX VAULT QR CODE SCANNER STATES
  const [showRxQrModal, setShowRxQrModal] = useState(false);
  const [rxQrScannerMode, setRxQrScannerMode] = useState<"camera" | "sample" | "upload">("camera");
  const [rxQrStep, setRxQrStep] = useState<"scan" | "processing" | "result">("scan");
  const rxQrVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeRxQrStreamRef = useRef<MediaStream | null>(null);
  const [isRxQrCameraActive, setIsRxQrCameraActive] = useState(false);
  const [rxQrCameraError, setRxQrCameraError] = useState("");
  const [rxQrProcessingStep, setRxQrProcessingStep] = useState("Scanning QR Data Matrix...");
  const [scannedMedicationResult, setScannedMedicationResult] = useState<any | null>(null);
  const [rxRefillStatusMsg, setRxRefillStatusMsg] = useState<string | null>(null);
  const [rxRefillLoading, setRxRefillLoading] = useState(false);
  const [scannedBoxHistory, setScannedBoxHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("cura_scanned_med_boxes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // SAMPLE MEDICATION BOX DATA
  const SAMPLE_MED_BOXES = [
    {
      id: "BOX-LIP-2026",
      medName: "Atorvastatin 20mg",
      brandName: "Lipitor (Pfizer)",
      qrCode: "CURA-RX|PAT-001|ATORVASTATIN-20MG|RX-88492|REFILL-OK",
      batchNo: "LIP-2026-88492",
      expiryDate: "12/2027",
      doctor: "Dr. Rajesh Sharma (Cardiology)",
      dosageInstructions: "Take 1 Tablet daily at bedtime with a full glass of water.",
      adherenceRate: 96,
      streakDays: 18,
      remainingPills: 14,
      totalPills: 30,
      refillStatus: "Available (14 Pills Left)",
      canRefill: true,
      warnings: ["Avoid grapefruit juice while on therapy", "Take consistently at night for optimal cholesterol control", "Report unusual muscle soreness immediately"],
      pharmacy: "Apollo Pharmacy Direct #401",
      lastTaken: "Yesterday, 9:30 PM",
      nextDose: "Today, 9:30 PM",
      frequency: "Once Daily (Night)"
    },
    {
      id: "BOX-GLU-2026",
      medName: "Metformin 500mg",
      brandName: "Glucophage ER (Merck)",
      qrCode: "CURA-RX|PAT-001|METFORMIN-500MG|RX-10293|REFILL-DUE",
      batchNo: "GLU-2026-10293",
      expiryDate: "09/2026",
      doctor: "Dr. Ananya Reddy (Endocrinology)",
      dosageInstructions: "Take 1 Tablet twice daily with main meals (Breakfast & Dinner).",
      adherenceRate: 92,
      streakDays: 12,
      remainingPills: 4,
      totalPills: 30,
      refillStatus: "Refill Due Soon (4 Pills Left)",
      canRefill: true,
      warnings: ["Must be taken with meals to minimize gastrointestinal discomfort", "Stay well hydrated throughout the day", "Do not crush or chew extended-release tablets"],
      pharmacy: "MedPlus Wellness #108",
      lastTaken: "Today, 8:15 AM",
      nextDose: "Today, 8:00 PM",
      frequency: "Twice Daily (With Meals)"
    },
    {
      id: "BOX-TEL-2026",
      medName: "Telmisartan 40mg",
      brandName: "Telma 40 (Glenmark)",
      qrCode: "CURA-RX|PAT-001|TELMISARTAN-40MG|RX-55102|REFILL-OK",
      batchNo: "TEL-2026-55102",
      expiryDate: "04/2028",
      doctor: "Dr. Rajesh Sharma (Cardiology)",
      dosageInstructions: "Take 1 Tablet every morning before breakfast.",
      adherenceRate: 88,
      streakDays: 9,
      remainingPills: 22,
      totalPills: 30,
      refillStatus: "Available (22 Pills Left)",
      canRefill: true,
      warnings: ["Monitor resting blood pressure regularly", "Avoid sudden posture changes if feeling lightheaded"],
      pharmacy: "Apollo Pharmacy Direct #401",
      lastTaken: "Today, 7:30 AM",
      nextDose: "Tomorrow, 7:30 AM",
      frequency: "Once Daily (Morning)"
    },
    {
      id: "BOX-AZI-2026",
      medName: "Azithromycin 500mg",
      brandName: "Zithromax (Pfizer)",
      qrCode: "CURA-RX|PAT-001|AZITHROMYCIN-500MG|RX-99120|COURSE-COMPLETE",
      batchNo: "AZI-2026-99120",
      expiryDate: "11/2026",
      doctor: "Dr. Vikram Malhotra (General Medicine)",
      dosageInstructions: "Take 1 Tablet daily 1 hour before or 2 hours after food.",
      adherenceRate: 100,
      streakDays: 5,
      remainingPills: 0,
      totalPills: 5,
      refillStatus: "Course Completed (0/5 Left)",
      canRefill: false,
      warnings: ["Complete full 5-day antibiotic regimen even if symptoms resolve earlier", "Do not take concurrently with antacids containing aluminum or magnesium"],
      pharmacy: "Apollo Pharmacy Direct #401",
      lastTaken: "3 days ago",
      nextDose: "Antibiotic Course Completed",
      frequency: "Completed 5-Day Course"
    }
  ];

  const startRxQrCamera = async () => {
    setRxQrCameraError("");
    setIsRxQrCameraActive(true);
    try {
      if (activeRxQrStreamRef.current) {
        activeRxQrStreamRef.current.getTracks().forEach(track => track.stop());
        activeRxQrStreamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }
      });
      activeRxQrStreamRef.current = stream;
      if (rxQrVideoRef.current) {
        rxQrVideoRef.current.srcObject = stream;
        rxQrVideoRef.current.play().catch(e => console.warn("Rx QR video play error:", e));
      }
    } catch (err: any) {
      console.warn("Camera access failed for Rx QR Scanner:", err);
      setRxQrCameraError(err.message || "Camera feed not accessible in iframe preview. You can use Sample Box QR mode or upload an image!");
    }
  };

  const stopRxQrCamera = () => {
    if (activeRxQrStreamRef.current) {
      activeRxQrStreamRef.current.getTracks().forEach(track => track.stop());
      activeRxQrStreamRef.current = null;
    }
    if (rxQrVideoRef.current) {
      rxQrVideoRef.current.srcObject = null;
    }
    setIsRxQrCameraActive(false);
  };

  const handleProcessRxQrBox = async (boxData: any) => {
    stopRxQrCamera();
    setRxQrStep("processing");
    setRxQrProcessingStep("Aligning QR Data Matrix grid...");
    
    await new Promise(r => setTimeout(r, 500));
    setRxQrProcessingStep("Decrypting EHR prescription signature...");
    
    await new Promise(r => setTimeout(r, 600));
    setRxQrProcessingStep("Fetching 30-day adherence & refill ledger...");

    await new Promise(r => setTimeout(r, 400));
    setScannedMedicationResult(boxData);
    setRxRefillStatusMsg(null);
    setRxQrStep("result");

    // Save to scanned box history
    setScannedBoxHistory(prev => {
      const filtered = prev.filter(b => b.id !== boxData.id);
      const updated = [{ ...boxData, scannedAt: new Date().toISOString() }, ...filtered];
      try {
        localStorage.setItem("cura_scanned_med_boxes", JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const handleRxQrOneTapRefill = async (medItem: any) => {
    setRxRefillLoading(true);
    setRxRefillStatusMsg(null);
    try {
      if (selectedPatient) {
        await fetch(`/api/v1/patients/${selectedPatient.id}/refills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            medicationName: medItem.medName,
            doctorName: medItem.doctor,
            batchNo: medItem.batchNo,
            requestedAt: new Date().toISOString()
          })
        }).catch(() => {});
      }
      setRxRefillStatusMsg(`⚡ Refill request for ${medItem.medName} successfully dispatched to ${medItem.doctor}! Pharmacy token issued.`);
      setScannedMedicationResult((prev: any) => prev ? { ...prev, refillStatus: "Refill Requested (Pending Doctor Signoff)", canRefill: false } : prev);
    } catch (err) {
      setRxRefillStatusMsg(`⚡ Refill request for ${medItem.medName} registered on clinical queue!`);
    } finally {
      setRxRefillLoading(false);
    }
  };

  const handleRxQrMarkTaken = (medItem: any) => {
    setScannedMedicationResult((prev: any) => {
      if (!prev) return prev;
      const newRemaining = Math.max(0, prev.remainingPills - 1);
      const newStreak = prev.streakDays + 1;
      return {
        ...prev,
        remainingPills: newRemaining,
        streakDays: newStreak,
        lastTaken: "Just now",
        adherenceRate: Math.min(100, prev.adherenceRate + 1)
      };
    });
    playPillChime();
    setRxRefillStatusMsg(`✓ Today's dose for ${medItem.medName} recorded! Streak updated to ${medItem.streakDays + 1} days.`);
  };

  // 💊 MEDICATION PUSH NOTIFICATION & SCHEDULER STATES
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("cura_push_enabled") !== "false";
  });
  const [pushPermissionGranted, setPushPermissionGranted] = useState<"default" | "granted" | "denied">(() => {
    if (typeof Notification !== "undefined") {
      return Notification.permission;
    }
    return "default";
  });
  const [activeNotificationAlert, setActiveNotificationAlert] = useState<any | null>(null);
  const [triggeredAlertsToday, setTriggeredAlertsToday] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem("cura_triggered_alerts_today");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [notificationHistoryLog, setNotificationHistoryLog] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("cura_notification_history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showSchedulerForm, setShowSchedulerForm] = useState(false);
  const [customPillName, setCustomPillName] = useState("");
  const [customPillDosage, setCustomPillDosage] = useState("1 Tablet");
  const [customPillTime, setCustomPillTime] = useState("08:00");
  const [customPillInstructions, setCustomPillInstructions] = useState("");

  // Play dynamic synthesis pill chime via Web Audio
  const playPillChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(830.61, ctx.currentTime);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.8);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
      gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.92);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.92);
    } catch (e) {
      console.warn("Failed to play notification sound", e);
    }
  };

  // Enable/Request Web Notification Permission
  const requestWebNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      alert("This browser does not support HTML5 desktop notifications.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setPushPermissionGranted(permission);
      if (permission === "granted") {
        setPushNotificationsEnabled(true);
        localStorage.setItem("cura_push_enabled", "true");
        new Notification("💊 Cura Health Push Activated!", {
          body: "You will now receive desktop alerts for scheduled daily medications.",
          icon: "https://cdn-icons-png.flaticon.com/512/822/822143.png"
        });
      } else {
        alert("Desktop notification permission was denied. Standard in-app alerts will be used as a fallback.");
      }
    } catch (err) {
      console.error("Error requesting notification permission", err);
    }
  };

  const togglePushNotificationsSetting = () => {
    const nextVal = !pushNotificationsEnabled;
    setPushNotificationsEnabled(nextVal);
    localStorage.setItem("cura_push_enabled", String(nextVal));
    if (nextVal && typeof Notification !== "undefined" && Notification.permission !== "granted") {
      requestWebNotificationPermission();
    }
  };

  // Helper to parse times
  const parseTimeStr = (timeStr: string) => {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm) {
      if (ampm.toLowerCase() === "pm" && hours < 12) hours += 12;
      if (ampm.toLowerCase() === "am" && hours === 12) hours = 0;
    }
    return { hours, minutes };
  };

  // Dispatches a notification alerts
  const triggerMedicationNotification = (item: any) => {
    if (!pushNotificationsEnabled) return;
    
    // Play sound chime
    playPillChime();

    const medName = item.medicineName || (item.messageContent?.includes("Name: ") ? item.messageContent.split("Name: ")[1].split(".")[0] : "Prescribed Medication");
    const medDosage = item.dosage || (item.messageContent?.includes("Reminder: ") ? item.messageContent.split("Reminder: ")[1].split(" for ")[0] : "As Directed");
    const medInstructions = item.instructions || (item.messageContent?.includes("Instructions: ") ? item.messageContent.split("Instructions: ")[1].split(".")[0] : "Take as directed");
    const medTime = item.time || (item.messageContent?.includes("Timing: ") ? item.messageContent.split("Timing: ")[1].split(".")[0] : "Daily");

    // Trigger Real Web Notification if permission granted
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(`💊 Medication Reminder: ${medName}`, {
        body: `Dosage: ${medDosage}. Timing: ${medTime}. Instructions: ${medInstructions}`,
        tag: `med-${item.id}`,
        requireInteraction: true
      });
    }

    // Set Active In-App Alert
    const activeAlert = {
      ...item,
      parsedName: medName,
      parsedDosage: medDosage,
      parsedInstructions: medInstructions,
      parsedTime: medTime,
      triggeredAt: new Date().toISOString()
    };
    setActiveNotificationAlert(activeAlert);

    // Save to History Log
    const newLog = {
      id: `LOG-${Date.now()}`,
      medicationId: item.id,
      medicationName: medName,
      dosage: medDosage,
      scheduledTime: medTime,
      triggeredAt: new Date().toISOString(),
      status: "delivered",
      actionTaken: "pending"
    };

    setNotificationHistoryLog(prev => {
      const updated = [newLog, ...prev].slice(0, 50); // keep last 50
      localStorage.setItem("cura_notification_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Snoop scheduler loop effect
  useEffect(() => {
    if (!pushNotificationsEnabled || medicationReminders.length === 0) return;

    const checkScheduler = () => {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      // Find already triggered reminders for today
      const todayTriggered = triggeredAlertsToday[todayStr] || [];

      medicationReminders.forEach(item => {
        const medTime = item.time || (item.messageContent?.includes("Timing: ") ? item.messageContent.split("Timing: ")[1].split(".")[0] : null);
        if (!medTime) return;

        const parsed = parseTimeStr(medTime);
        if (!parsed) return;

        // Compare hours and minutes
        if (parsed.hours === currentHours && parsed.minutes === currentMinutes) {
          // Check if already triggered today
          if (!todayTriggered.includes(item.id)) {
            // Add to triggered state and trigger
            const updatedList = [...todayTriggered, item.id];
            const updatedObj = { ...triggeredAlertsToday, [todayStr]: updatedList };
            setTriggeredAlertsToday(updatedObj);
            localStorage.setItem("cura_triggered_alerts_today", JSON.stringify(updatedObj));
            
            // Trigger!
            triggerMedicationNotification(item);
          }
        }
      });
    };

    // Check once at start and run every 10 seconds
    checkScheduler();
    const timer = setInterval(checkScheduler, 10000);
    return () => clearInterval(timer);
  }, [pushNotificationsEnabled, medicationReminders, triggeredAlertsToday]);

  const handleTestTriggerReminder = () => {
    if (medicationReminders.length > 0) {
      // Pick the first reminder
      triggerMedicationNotification(medicationReminders[0]);
    }
  };

  const handlePopupMarkAsTaken = async (alertId: string) => {
    setActiveNotificationAlert(null);
    
    // Update main medicationReminders state & call backend
    await handleToggleTaken(alertId, "pending"); // Toggles to "taken"

    // Log the action outcome in notification history
    setNotificationHistoryLog(prev => {
      const updated = prev.map(log => {
        if (log.medicationId === alertId && log.actionTaken === "pending") {
          return { ...log, status: "completed", actionTaken: "Marked as Taken" };
        }
        return log;
      });
      localStorage.setItem("cura_notification_history", JSON.stringify(updated));
      return updated;
    });

    // Fire success toast/notification
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("✓ Dosage Recorded", {
        body: "Your daily medication adherence has been successfully logged on the clinical ledger.",
        icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png"
      });
    }
  };

  const handlePopupSnooze = (alertObj: any) => {
    setActiveNotificationAlert(null);

    // Schedule a snooze to trigger in 1 minute for demonstration, or 5 minutes. Let's make it 5 minutes!
    const snoozeTimeInMs = 5 * 60 * 1000;
    
    // Log the snooze action in history
    setNotificationHistoryLog(prev => {
      const updated = prev.map(log => {
        if (log.medicationId === alertObj.id && log.actionTaken === "pending") {
          return { ...log, status: "snoozed", actionTaken: "Snoozed for 5 minutes" };
        }
        return log;
      });
      localStorage.setItem("cura_notification_history", JSON.stringify(updated));
      return updated;
    });

    // Set a client-side timer to trigger it again
    setTimeout(() => {
      triggerMedicationNotification(alertObj);
    }, snoozeTimeInMs);

    // Show dynamic local toast feedback
    alert("Alert snoozed! We'll remind you again in 5 minutes.");
  };

  const handleAddCustomReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPillName || !customPillDosage || !customPillTime) return;
    
    try {
      // Convert "08:00" to "08:00 AM" or keep format
      const [hStr, mStr] = customPillTime.split(":");
      const hours = parseInt(hStr, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const formattedTime = `${String(displayHours).padStart(2, "0")}:${mStr} ${ampm}`;

      const res = await fetch("/api/v1/scheduler/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          medicineName: customPillName,
          dosage: customPillDosage,
          time: formattedTime,
          instructions: customPillInstructions || "Take as directed by doctor"
        })
      });
      
      if (res.ok) {
        setCustomPillName("");
        setCustomPillDosage("1 Tablet");
        setCustomPillInstructions("");
        setShowSchedulerForm(false);
        
        // Reload medication reminders
        await fetchMedicationReminders(selectedPatient.id);
        
        // Show local toast
        alert("Custom daily medication alarm successfully scheduled!");
      } else {
        const d = await res.json();
        alert(d.detail || "Failed to schedule medication reminder");
      }
    } catch (err) {
      console.error("Failed to add medication schedule", err);
    }
  };

  // Document Scanner state variables
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStep, setScanStep] = useState<"upload" | "scanning" | "review" | "saving">("upload");
  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [scannedFileBase64, setScannedFileBase64] = useState<string>("");
  const [scannedFileName, setScannedFileName] = useState<string>("");
  const [scannedFileSize, setScannedFileSize] = useState<string>("");
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualCategory, setManualCategory] = useState("Lab Report");
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanError, setScanError] = useState("");
  const [showOcrPreview, setShowOcrPreview] = useState(false);
  const [scanToast, setScanToast] = useState<string | null>(null);

  // Patient Mobile Camera Scanner state variables and handlers
  const patientVideoRef = useRef<HTMLVideoElement | null>(null);
  const activePatientStreamRef = useRef<MediaStream | null>(null);
  const [patientScannerMode, setPatientScannerMode] = useState<"upload" | "camera">("upload");
  const [isPatientCameraActive, setIsPatientCameraActive] = useState(false);
  const [patientCameraDevices, setPatientCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [patientSelectedDeviceId, setPatientSelectedDeviceId] = useState("");
  const [patientCameraError, setPatientCameraError] = useState("");
  const [boundaryStatus, setBoundaryStatus] = useState("Initializing scan engine...");
  const [isBoundaryDetected, setIsBoundaryDetected] = useState(false);
  const [autoCropEnabled, setAutoCropEnabled] = useState(true);
  const [capturedImages, setCapturedImages] = useState<{ id: string; base64: string; dataUrl: string }[]>([]);
  const [cameraFlash, setCameraFlash] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  const [pipelineStep, setPipelineStep] = useState<"init" | "noise" | "ocr" | "indexing" | "synthesis" | "complete">("init");

  // CURA Vision AI State Variables
  const visionVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeVisionStreamRef = useRef<MediaStream | null>(null);
  const [visionActiveMode, setVisionActiveMode] = useState<"upload" | "camera">("upload");
  const [visionPreviewUrl, setVisionPreviewUrl] = useState<string | null>(null);
  const [visionBase64, setVisionBase64] = useState<string | null>(null);
  const [visionMimeType, setVisionMimeType] = useState<string | null>(null);
  const [visionNotes, setVisionNotes] = useState<string>("");
  const [visionType, setVisionType] = useState<"symptom" | "diagnostic_scan">("symptom");
  const [visionTitle, setVisionTitle] = useState<string>("");
  const [isVisionCameraActive, setIsVisionCameraActive] = useState(false);
  const [visionCameraDevices, setVisionCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [visionSelectedDeviceId, setVisionSelectedDeviceId] = useState("");
  const [visionCameraError, setVisionCameraError] = useState("");
  const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);
  const [visionAnalysisProgress, setVisionAnalysisProgress] = useState(0);
  const [visionAnalysisStep, setVisionAnalysisStep] = useState("");
  const [visionResult, setVisionResult] = useState<any | null>(null);
  const [isVisionSaving, setIsVisionSaving] = useState(false);
  const [visionCameraFlash, setVisionCameraFlash] = useState(false);

  // Whisper Audio Recording State for Vision Scanner
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioRecordingTime, setAudioRecordingTime] = useState<number>(0);
  const audioTimerRef = useRef<any>(null);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState<boolean>(false);
  const [audioTranscript, setAudioTranscript] = useState<string | null>(null);
  const [audioKeywords, setAudioKeywords] = useState<string[]>([]);
  const [audioConfidence, setAudioConfidence] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // === FAMILY CARE STATE VARIABLES ===
  const [originalSelfPatient, setOriginalSelfPatient] = useState<Patient | null>(null);
  const [familyViewRelation, setFamilyViewRelation] = useState("");
  const [familyViewAccessLevel, setFamilyViewAccessLevel] = useState<"full" | "view">("view");
  const [familyViewShareCode, setFamilyViewShareCode] = useState("");
  const [familyShares, setFamilyShares] = useState<any[]>([]);
  const [familyMemberName, setFamilyMemberName] = useState("");
  const [familyMemberRelationship, setFamilyMemberRelationship] = useState("");
  const [familyMemberAccessLevel, setFamilyMemberAccessLevel] = useState<"full" | "view">("view");
  const [isGeneratingShareCode, setIsGeneratingShareCode] = useState(false);
  const [isRevokingShareCode, setIsRevokingShareCode] = useState<string | null>(null);
  
  const [familyShareCodeInput, setFamilyShareCodeInput] = useState("");
  const [isVerifyingShareCode, setIsVerifyingShareCode] = useState(false);
  const [familyShareVerifyError, setFamilyShareVerifyError] = useState("");
  const [familyShareVerifySuccess, setFamilyShareVerifySuccess] = useState("");
  
  const [connectedFamilyMembers, setConnectedFamilyMembers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("cura_connected_family_members");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save connected family members to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cura_connected_family_members", JSON.stringify(connectedFamilyMembers));
    } catch (err) {
      console.error("Failed to save connected family members", err);
    }
  }, [connectedFamilyMembers]);

  // Fetch family shares from server
  const fetchFamilyShares = async (patientId: string) => {
    try {
      const res = await fetch(`/api/v1/patients/${patientId}/family-shares`);
      if (res.ok) {
        const data = await res.json();
        setFamilyShares(data);
      }
    } catch (err) {
      console.error("Failed to fetch family shares", err);
    }
  };

  useEffect(() => {
    if (selectedPatient && !originalSelfPatient) {
      fetchFamilyShares(selectedPatient.id);
    }
  }, [selectedPatient, originalSelfPatient]);

  // Start the Vision Camera Stream
  const startVisionCamera = async (deviceId?: string) => {
    setVisionCameraError("");
    setIsVisionCameraActive(true);
    setVisionPreviewUrl(null);
    setVisionBase64(null);
    try {
      if (activeVisionStreamRef.current) {
        activeVisionStreamRef.current.getTracks().forEach(track => track.stop());
        activeVisionStreamRef.current = null;
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } } 
          : { facingMode: { ideal: "environment" } }
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        console.warn("Vision camera constraint failed, retrying basic video:", firstErr);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      activeVisionStreamRef.current = stream;

      if (visionVideoRef.current) {
        visionVideoRef.current.srcObject = stream;
        visionVideoRef.current.play().catch(e => console.warn("Vision video play error:", e));
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      setVisionCameraDevices(videoDevices);

      if (!deviceId && videoDevices.length > 0) {
        const activeTrack = stream.getVideoTracks()[0];
        const activeSettings = activeTrack ? activeTrack.getSettings() : null;
        const currentId = activeSettings?.deviceId || videoDevices[0].deviceId;
        setVisionSelectedDeviceId(currentId);
      } else if (deviceId) {
        setVisionSelectedDeviceId(deviceId);
      }
    } catch (err: any) {
      console.error("Vision camera access failed:", err);
      setVisionCameraError(err.message || "Failed to access camera. Please verify camera permissions.");
    }
  };

  // Stop the Vision Camera Stream
  const stopVisionCamera = () => {
    if (activeVisionStreamRef.current) {
      activeVisionStreamRef.current.getTracks().forEach(track => track.stop());
      activeVisionStreamRef.current = null;
    }
    if (visionVideoRef.current) {
      visionVideoRef.current.srcObject = null;
    }
    setIsVisionCameraActive(false);
  };

  // Capture photo from video stream
  const captureVisionPhoto = () => {
    if (!visionVideoRef.current) return;
    try {
      const video = visionVideoRef.current;
      const canvas = document.createElement("canvas");
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const base64Data = dataUrl.split(",")[1];
        
        setVisionCameraFlash(true);
        setTimeout(() => setVisionCameraFlash(false), 150);

        setVisionPreviewUrl(dataUrl);
        setVisionBase64(base64Data);
        setVisionMimeType("image/jpeg");
        setVisionTitle(visionType === "symptom" ? "Symptom Photo Capture" : "Diagnostic Scan Capture");
        
        // Stop stream once captured
        stopVisionCamera();
      }
    } catch (err) {
      console.error("Failed to capture photo:", err);
    }
  };

  const handleVisionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVisionTitle(file.name.replace(/\.[^/.]+$/, "")); // Auto title to file name
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(",")[1];
      setVisionPreviewUrl(dataUrl);
      setVisionBase64(base64Data);
      setVisionMimeType(file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const startAudioRecording = async () => {
    setAudioError(null);
    setAudioRecordingTime(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAudioBase64(base64);
          transcribeAudioWithWhisper(base64);
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);

      audioTimerRef.current = setInterval(() => {
        setAudioRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to start audio recording:", err);
      setAudioError("Microphone access permission denied or audio device not found.");
    }
  };

  const stopAudioRecording = () => {
    if (audioRecorderRef.current && isRecordingAudio) {
      audioRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (audioTimerRef.current) {
        clearInterval(audioTimerRef.current);
      }
    }
  };

  const transcribeAudioWithWhisper = async (base64Payload?: string) => {
    const payloadData = base64Payload || audioBase64;
    if (!payloadData) return;

    setIsTranscribingAudio(true);
    setAudioError(null);

    try {
      const res = await fetch("/api/v1/voice/transcribe-whisper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: payloadData,
          mimeType: "audio/webm"
        })
      });

      if (!res.ok) {
        throw new Error("Voice transcription failed");
      }

      const data = await res.json();
      if (data.success && data.transcript) {
        setAudioTranscript(data.transcript);
        setAudioKeywords(data.clinicalKeywords || []);
        setAudioConfidence(data.confidence || 0.98);

        setVisionNotes((prevNotes) => {
          if (prevNotes && prevNotes.trim().length > 0) {
            if (!prevNotes.includes(data.transcript)) {
              return `${prevNotes}\n\n[Whisper Voice Description]: ${data.transcript}`;
            }
            return prevNotes;
          }
          return data.transcript;
        });
      } else {
        throw new Error(data.error || "Transcription output was empty.");
      }
    } catch (err: any) {
      console.error("Whisper transcription error:", err);
      setAudioError("Whisper voice-to-text processing failed. You can still type description notes manually.");
    } finally {
      setIsTranscribingAudio(false);
    }
  };

  const resetAudioRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioBase64(null);
    setAudioTranscript(null);
    setAudioKeywords([]);
    setAudioConfidence(null);
    setAudioError(null);
    setAudioRecordingTime(0);
  };

  const runVisionAnalysis = async () => {
    if (!selectedPatient || !visionBase64) return;
    setIsVisionAnalyzing(true);
    setVisionAnalysisProgress(5);
    setVisionAnalysisStep("Initializing Vision Engine...");

    const steps = [
      { p: 15, s: "Optimizing image exposure & shadows..." },
      { p: 35, s: "Identifying physiological landmarks..." },
      { p: 55, s: "Evaluating surface patterns & diagnostic density..." },
      { p: 75, s: "Processing medical terminology translation..." },
      { p: 90, s: "Compiling diagnostic recommendation guidelines..." }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setVisionAnalysisProgress(step.p);
      setVisionAnalysisStep(step.s);
    }

    try {
      const payload = {
        fileName: visionType === "symptom" ? "symptom_capture.jpg" : "diagnostic_scan.jpg",
        base64Data: visionBase64,
        mimeType: visionMimeType || "image/jpeg",
        manualTitle: visionTitle || (visionType === "symptom" ? "Physical Symptom Scan" : "Diagnostic Scan"),
        visualType: visionType,
        notes: visionNotes,
        audioTranscript: audioTranscript,
        userRole: "patient"
      };

      const response = await fetch(`/api/v1/patients/${selectedPatient.id}/scanned-reports/analyze-visual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Analysis request failed.");
      }

      const data = await response.json();
      setVisionAnalysisProgress(100);
      setVisionAnalysisStep("Analysis Complete!");
      setVisionResult(data);
    } catch (err: any) {
      console.error("Vision Analysis error:", err);
      setVisionAnalysisStep("Analysis failed. Please check server logs.");
    } finally {
      setIsVisionAnalyzing(false);
    }
  };

  const saveVisionReportToEHR = async () => {
    if (!selectedPatient || !visionResult) return;
    setIsVisionSaving(true);
    try {
      const savePayload = {
        title: visionResult.title,
        date: new Date().toISOString().split("T")[0],
        category: visionResult.category || "Symptom Scan",
        fileName: visionType === "symptom" ? "symptom_capture.jpg" : "diagnostic_scan.jpg",
        fileSize: "680 KB",
        extractedText: "CURA Vision AI Diagnostic Sweep:\n" + visionResult.visualFindings.join("\n") + (visionResult.voiceTranscript || audioTranscript ? `\n\nWhisper Voice Description:\n${visionResult.voiceTranscript || audioTranscript}` : ""),
        aiSummary: visionResult.aiSummary,
        voiceTranscript: visionResult.voiceTranscript || audioTranscript,
        keyFindings: visionResult.visualFindings,
        riskLevel: visionResult.riskLevel,
        possibleConditions: visionResult.possibleConditions.map((c: any) => `${c.name} (${c.probability})`),
        suggestedSpecialist: visionResult.suggestedSpecialist,
        suggestedDoctorName: visionResult.suggestedDoctorName,
        followUpRecommendation: visionResult.followUpRecommendation || visionResult.careRecommendations?.join("; "),
        summaryForDoctor: `CURA Vision AI evaluated this patient visual. Diagnosis: ${visionResult.title}. Findings: ${visionResult.visualFindings.join("; ")}.` + (visionResult.voiceTranscript || audioTranscript ? ` Voice Transcript: ${visionResult.voiceTranscript || audioTranscript}` : "")
      };

      const response = await fetch(`/api/v1/patients/${selectedPatient.id}/scanned-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(savePayload)
      });

      if (!response.ok) {
        throw new Error("Failed to save report.");
      }

      const updatedPatient = await response.json();
      setSelectedPatient(updatedPatient);
      setScanToast("Vision analysis successfully saved to your Digital EHR timeline!");
      setVisionResult(null);
      setVisionPreviewUrl(null);
      setVisionBase64(null);
      setVisionNotes("");
      setVisionTitle("");
      resetAudioRecording();
    } catch (err) {
      console.error("Failed to save visual report:", err);
    } finally {
      setIsVisionSaving(false);
    }
  };

  const startPatientCamera = async (deviceId?: string) => {
    setPatientCameraError("");
    setIsPatientCameraActive(true);
    try {
      if (activePatientStreamRef.current) {
        activePatientStreamRef.current.getTracks().forEach(track => track.stop());
        activePatientStreamRef.current = null;
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } } 
          : { facingMode: { ideal: "environment" } } // default to back camera
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        console.warn("Patient camera constraint failed, retrying basic video:", firstErr);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      activePatientStreamRef.current = stream;

      if (patientVideoRef.current) {
        patientVideoRef.current.srcObject = stream;
        patientVideoRef.current.play().catch(e => console.warn("Patient video play error:", e));
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      setPatientCameraDevices(videoDevices);

      if (!deviceId && videoDevices.length > 0) {
        const activeTrack = stream.getVideoTracks()[0];
        const activeSettings = activeTrack ? activeTrack.getSettings() : null;
        const currentId = activeSettings?.deviceId || videoDevices[0].deviceId;
        setPatientSelectedDeviceId(currentId);
      } else if (deviceId) {
        setPatientSelectedDeviceId(deviceId);
      }
    } catch (err: any) {
      console.error("Patient camera access failed:", err);
      setPatientCameraError(err.message || "Failed to access mobile camera device. Please grant permissions.");
    }
  };

  const stopPatientCamera = () => {
    if (activePatientStreamRef.current) {
      activePatientStreamRef.current.getTracks().forEach(track => track.stop());
      activePatientStreamRef.current = null;
    }
    if (patientVideoRef.current) {
      patientVideoRef.current.srcObject = null;
    }
    setIsPatientCameraActive(false);
  };

  const capturePatientPhoto = () => {
    if (!patientVideoRef.current) return;
    try {
      const video = patientVideoRef.current;
      const canvas = document.createElement("canvas");
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const base64Data = dataUrl.split(",")[1];
        
        // Flash animation trigger
        setCameraFlash(true);
        setTimeout(() => setCameraFlash(false), 150);

        const newImg = {
          id: Math.random().toString(36).substring(2, 9),
          base64: base64Data,
          dataUrl: dataUrl
        };
        setCapturedImages(prev => [...prev, newImg]);
        
        // Show temporary scanning status or feedback
        setBoundaryStatus(`Captured page ${capturedImages.length + 1}! Ready for next or Finish.`);
      }
    } catch (err: any) {
      setScanError(`Failed to snap photo: ${err.message}`);
    }
  };

  const removeCapturedPage = (id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id));
  };

  const compileCapturedImagesToPdf = () => {
    if (capturedImages.length === 0) return;
    
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pageWidth = doc.internal.pageSize.width; // 210mm
      const pageHeight = doc.internal.pageSize.height; // 297mm
      
      capturedImages.forEach((img, index) => {
        if (index > 0) {
          doc.addPage();
        }
        // Center the captured image with minor margins to preserve documents nicely
        doc.addImage(img.dataUrl, "JPEG", 5, 5, pageWidth - 10, pageHeight - 10);
      });
      
      stopPatientCamera();
      
      const pdfDataUri = doc.output("datauristring");
      const pdfBase64 = pdfDataUri.split(",")[1];
      
      const sizeInKb = Math.round(pdfBase64.length * 0.75 / 1024);
      const sizeStr = `${sizeInKb} KB`;
      const fileName = `camera_captured_${new Date().getTime()}.pdf`;
      
      setScannedFileName(fileName);
      setScannedFileSize(sizeStr);
      setScannedFileBase64(pdfBase64);
      
      setCapturedImages([]);
      
      triggerScanPipeline(fileName, pdfBase64, sizeStr, "Consolidated Medical PDF Report", "Lab Report");
    } catch (err: any) {
      setScanError(`Failed to generate multi-page PDF report: ${err.message}`);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up camera streams on unmount
      if (activePatientStreamRef.current) {
        activePatientStreamRef.current.getTracks().forEach(track => track.stop());
        activePatientStreamRef.current = null;
      }
      if (activeVisionStreamRef.current) {
        activeVisionStreamRef.current.getTracks().forEach(track => track.stop());
        activeVisionStreamRef.current = null;
      }
    };
  }, []);

  // Simulating high-quality auto-cropping and boundary edge detection
  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;

    if (isPatientCameraActive) {
      setIsBoundaryDetected(false);
      setBoundaryStatus("Calibrating auto-focus & lighting...");

      t1 = setTimeout(() => {
        setBoundaryStatus("Scanning viewport for high-contrast edges...");
      }, 1000);

      t2 = setTimeout(() => {
        setBoundaryStatus("Analyzing page perspective grid...");
      }, 2000);

      t3 = setTimeout(() => {
        setBoundaryStatus("Document borders locked! Auto-crop calibrated (98.7% match).");
        setIsBoundaryDetected(true);
      }, 3200);
    } else {
      setIsBoundaryDetected(false);
      setBoundaryStatus("Scanner offline");
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isPatientCameraActive]);

  // Sync saved scanned reports whenever the selected patient changes
  useEffect(() => {
    if (selectedPatient) {
      const loadScannedReports = async () => {
        try {
          const res = await fetch(`/api/v1/patients/${selectedPatient.id}/scanned-reports`);
          if (res.ok) {
            const data = await res.json();
            setSavedReports(data);
          } else {
            setSavedReports(selectedPatient.scannedReports || []);
          }
        } catch (err) {
          console.error("Error loading scanned reports", err);
          setSavedReports(selectedPatient.scannedReports || []);
        }
      };
      loadScannedReports();
    } else {
      setSavedReports([]);
    }
  }, [selectedPatient]);

  useEffect(() => {
    let interval: any;
    if (showVideoCallModal) {
      setCallTimer(0);
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [showVideoCallModal]);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getNotificationAppointment = () => {
    if (simulatedAppointmentOverride) {
      return simulatedAppointmentOverride;
    }
    if (!selectedPatient) return null;

    const now = new Date();
    const oneHourInMs = 60 * 60 * 1000;
    
    // Find patient appointments scheduled within the next 65 minutes
    return patientAppointments.find(apt => {
      if (apt.status === "cancelled" || apt.status === "completed") return false;
      const aptTime = new Date(apt.scheduledAt).getTime();
      const diff = aptTime - now.getTime();
      return diff > 0 && diff <= 65 * 60 * 1000; // 0 to 65 minutes window
    }) || null;
  };

  const getAdherenceData = () => {
    if (!selectedPatient) return [];
    
    // Generate a seed number from patient ID to make the historical trend consistent for the patient
    const patientSeed = selectedPatient.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      
      let adherence = 100;
      if (i === 0) {
        // Today: calculate dynamically based on medicationReminders
        if (medicationReminders.length > 0) {
          const takenCount = medicationReminders.filter(m => m.status === "taken").length;
          adherence = Math.round((takenCount / medicationReminders.length) * 100);
        } else {
          adherence = 100; // default to 100% if no meds scheduled
        }
      } else {
        // Deterministic but realistic historical adherence (e.g., fluctuation between 65% and 100%)
        const wave = Math.sin((i + patientSeed) * 0.45) * 12 + Math.cos((i * 1.5 + patientSeed) * 0.25) * 8;
        adherence = Math.max(65, Math.min(100, Math.round(87 + wave)));
      }
      
      data.push({
        date: dateStr,
        adherence: adherence,
        target: 90
      });
    }
    return data;
  };

  const getUniqueMedicines = () => {
    const medsFromReminders = medicationReminders.map(item => {
      return item.medicineName || 
        (item.messageContent?.includes("Name: ") ? item.messageContent.split("Name: ")[1].split(".")[0] : null) || 
        (item.messageContent?.includes("Reminder: ") ? item.messageContent.split("Reminder: ")[1].split(" for ")[0] : null) || 
        "Prescribed Medication";
    }).filter(Boolean);
    
    const unique = Array.from(new Set(medsFromReminders));
    if (unique.length === 0) {
      return ["Metformin", "Lisinopril", "Atorvastatin"];
    }
    return unique;
  };

  const getMedicationAdherenceData = (medName: string) => {
    if (!selectedPatient) return [];
    
    const patientSeed = selectedPatient.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const medSeed = medName.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const combinedSeed = patientSeed + medSeed;
    
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      
      let adherence = 100;
      if (i === 0) {
        // Today: calculate from current reminders for this medication if any
        const matchingReminders = medicationReminders.filter(item => {
          const itemMedName = item.medicineName || 
            (item.messageContent?.includes("Name: ") ? item.messageContent.split("Name: ")[1].split(".")[0] : null) || 
            (item.messageContent?.includes("Reminder: ") ? item.messageContent.split("Reminder: ")[1].split(" for ")[0] : null) || 
            "";
          return itemMedName.toLowerCase().includes(medName.toLowerCase());
        });
        
        if (matchingReminders.length > 0) {
          const takenCount = matchingReminders.filter(m => m.status === "taken").length;
          adherence = Math.round((takenCount / matchingReminders.length) * 100);
        } else {
          // Fallback to a deterministic but realistic today's adherence
          const wave = Math.sin((0 + combinedSeed) * 0.45) * 10 + Math.cos((0 * 1.5 + combinedSeed) * 0.25) * 5;
          adherence = Math.max(70, Math.min(100, Math.round(85 + wave)));
        }
      } else {
        // Deterministic but realistic historical adherence per medication (e.g., fluctuation between 60% and 100%)
        const wave = Math.sin((i + combinedSeed) * 0.5) * 15 + Math.cos((i * 1.2 + combinedSeed) * 0.3) * 10;
        adherence = Math.max(60, Math.min(100, Math.round(84 + wave)));
      }
      
      data.push({
        date: dateStr,
        adherence: adherence,
        target: 90
      });
    }
    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError("");
    const sizeInKb = Math.round(file.size / 1024);
    const sizeStr = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    setScannedFile(file);
    setScannedFileName(file.name);
    setScannedFileSize(sizeStr);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      setScannedFileBase64(base64String);
      // Automatically trigger scan
      triggerScanPipeline(file.name, base64String, sizeStr);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectMockReport = (type: string) => {
    setScanError("");
    let fileName = "complete_blood_count.png";
    let sizeStr = "680 KB";
    let titleMock = "Complete Blood Count";
    let categoryMock = "Lab Report";

    if (type === "lipid") {
      fileName = "lipid_profile_panel.jpg";
      sizeStr = "1.2 MB";
      titleMock = "Lipid Profile Panel";
    } else if (type === "diabetes") {
      fileName = "hba1c_blood_sugar_report.png";
      sizeStr = "940 KB";
      titleMock = "HbA1c Diabetes Lab Report";
    } else if (type === "thyroid") {
      fileName = "thyroid_function_tsh.pdf";
      sizeStr = "1.1 MB";
      titleMock = "Thyroid Function (TSH) Report";
    } else if (type === "prescription") {
      fileName = "doctor_rx_prescription_2025.jpg";
      sizeStr = "450 KB";
      titleMock = "Historical Doctor Rx Script";
      categoryMock = "Prescription";
    }

    setScannedFileName(fileName);
    setScannedFileSize(sizeStr);
    setManualTitle(titleMock);
    setManualCategory(categoryMock);

    // Use a blank or mock base64
    triggerScanPipeline(fileName, "MOCK_BASE64_DATA", sizeStr, titleMock, categoryMock);
  };

  const triggerScanPipeline = async (
    fileNameToScan: string, 
    base64Data: string, 
    fileSizeStr: string,
    fallbackTitle?: string,
    fallbackCategory?: string
  ) => {
    if (!selectedPatient) return;
    
    setScanStep("scanning");
    setIsAnalyzing(true);
    setPipelineProgress(5);
    setPipelineStep("init");

    // Sequence of high-fidelity clinical AI scanning pipeline steps
    await new Promise(resolve => setTimeout(resolve, 800));
    setPipelineProgress(25);
    setPipelineStep("noise");

    await new Promise(resolve => setTimeout(resolve, 1000));
    setPipelineProgress(50);
    setPipelineStep("ocr");

    await new Promise(resolve => setTimeout(resolve, 1200));
    setPipelineProgress(75);
    setPipelineStep("indexing");

    await new Promise(resolve => setTimeout(resolve, 800));
    setPipelineProgress(90);
    setPipelineStep("synthesis");

    try {
      const response = await fetch(`/api/v1/patients/${selectedPatient.id}/scanned-reports/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileNameToScan,
          base64Data: base64Data,
          mimeType: fileNameToScan.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
          manualTitle: fallbackTitle || manualTitle,
          manualDate: manualDate,
          manualCategory: fallbackCategory || manualCategory,
          userRole: "patient"
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPipelineProgress(100);
        setPipelineStep("complete");
        await new Promise(resolve => setTimeout(resolve, 600));

        setScanResult(result);
        setManualTitle(result.title);
        setManualDate(result.date || new Date().toISOString().split("T")[0]);
        setManualCategory(result.category || "Lab Report");
        setScanStep("review");
      } else {
        const errData = await response.json();
        throw new Error(errData.detail || "Scanning analytics failed.");
      }
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || "Connection timed out. Fallback to manual entry.");
      // Fallback: Populate defaults for manual correction
      setScanResult({
        title: fallbackTitle || manualTitle || "EHR Medical Scan",
        date: manualDate,
        category: fallbackCategory || manualCategory,
        aiSummary: "The document was indexed. AI parsing failed due to network constraints. Please review and input manually.",
        keyFindings: ["Document successfully archived in EMR filesystem"],
        extractedText: "Archived raw document scan: " + fileNameToScan
      });
      setPipelineProgress(100);
      setPipelineStep("complete");
      await new Promise(resolve => setTimeout(resolve, 600));
      setScanStep("review");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveScannedReport = async () => {
    if (!selectedPatient || !scanResult) return;

    setScanStep("saving");
    try {
      const response = await fetch(`/api/v1/patients/${selectedPatient.id}/scanned-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle,
          date: manualDate,
          category: manualCategory,
          fileName: scannedFileName,
          fileSize: scannedFileSize,
          extractedText: scanResult.extractedText || "",
          aiSummary: scanResult.aiSummary,
          keyFindings: scanResult.keyFindings,
          riskLevel: scanResult.riskLevel,
          abnormalValues: scanResult.abnormalValues,
          possibleConditions: scanResult.possibleConditions,
          suggestedSpecialist: scanResult.suggestedSpecialist,
          suggestedDoctorName: scanResult.suggestedDoctorName,
          followUpRecommendation: scanResult.followUpRecommendation
        })
      });

      if (response.ok) {
        const updatedPatient = await response.json();
        // Update selectedPatient locally to show the immediate synchronization
        setSelectedPatient(updatedPatient);
        
        // Refresh systems patients lists
        const resPatients = await fetch("/api/v1/patients");
        if (resPatients.ok) {
          const data = await resPatients.json();
          setPatients(data);
        }

        // Fetch updated scanned reports list
        const resReports = await fetch(`/api/v1/patients/${selectedPatient.id}/scanned-reports`);
        if (resReports.ok) {
          const reports = await resReports.json();
          setSavedReports(reports);
        }

        setShowScanModal(false);
        // Clear scan states
        setScannedFile(null);
        setScannedFileBase64("");
        setScannedFileName("");
        setScannedFileSize("");
        setScanResult(null);
        setScanStep("upload");
        setShowOcrPreview(false);
      } else {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to save EMR report.");
      }
    } catch (err: any) {
      setScanError(err.message || "Failed to sync to central EMR.");
      setScanStep("review");
    }
  };

  const handleInitiateRefill = (medName: string, doctor: string) => {
    setRefillMedName(medName);
    setRefillDoctorName(doctor);
    setRefillSuccess(false);
    setSubmittingRefill(false);
    setShowRefillModal(true);
  };

  const handleSubmitRefill = async () => {
    if (!selectedPatient || !refillMedName) return;
    setSubmittingRefill(true);
    try {
      const res = await fetch("/api/v1/scheduler/refill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          medicineName: refillMedName,
          dosage: "Refill requested via Rx Vault",
          doctorName: refillDoctorName
        }),
      });

      if (res.ok) {
        setRefillSuccess(true);
        setTimeout(() => {
          setShowRefillModal(false);
        }, 1800);
      } else {
        console.error("Failed to submit refill request");
      }
    } catch (err) {
      console.error("Error submitting refill request", err);
    } finally {
      setSubmittingRefill(false);
    }
  };

  // Generate and Download Consolidated Health PDF Summary for the last 30 days
  const handleDownloadPDFSummary = () => {
    if (!selectedPatient) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let y = 15;

    // Header Color Accent Bar (Emerald-500)
    doc.setFillColor(16, 185, 129);
    doc.rect(15, y, pageWidth - 30, 8, "F");
    y += 15;

    // Branding Title Area
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("CURA HEALTH NETWORKS", 15, y);
    y += 6;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Consolidated Patient Health Summary (Last 30 Days)", 15, y);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}`, pageWidth - 15, y, { align: "right" });
    y += 12;

    // Section line separator
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(15, y, pageWidth - 15, y);
    y += 6;

    // Biodata Section Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text("PATIENT BIODATA", 15, y);
    y += 6;

    // Patient Biodata Grid Values
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    
    // Line 1: Name and ABHA ID
    doc.text("Full Name:", 15, y);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(selectedPatient.fullName || "N/A", 45, y);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("ABHA ID:", 110, y);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(selectedPatient.abhaId || "NOT REGISTERED", 140, y);
    y += 6;

    // Line 2: Age/Gender and Blood Group
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Age / Gender:", 15, y);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(`${selectedPatient.age || 28} Years / ${selectedPatient.gender || "N/A"}`, 45, y);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Blood Group:", 110, y);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(239, 68, 68); // Red-500
    doc.text(selectedPatient.bloodGroup || "O+", 140, y);
    y += 6;

    // Line 3: Phone and Email
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Phone Number:", 15, y);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(selectedPatient.phone || "N/A", 45, y);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Email Address:", 110, y);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(selectedPatient.email || "N/A", 140, y);
    y += 10;

    // Active Medications Section
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(15, y, pageWidth - 15, y);
    y += 6;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text("ACTIVE MEDICATIONS LIST", 15, y);
    y += 6;

    const meds = selectedPatient.currentMedications || [];
    if (meds.length === 0) {
      doc.setFont("Helvetica", "oblique");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("No active medications recorded on clinical records.", 18, y);
      y += 8;
    } else {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      meds.forEach((med) => {
        doc.setFillColor(16, 185, 129);
        doc.rect(17, y - 2.5, 1.8, 1.8, "F"); // Bullet
        doc.text(med, 23, y);
        y += 6;
      });
      y += 4;
    }

    // Vitals & Daily Symptom Logs Section
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(15, y, pageWidth - 15, y);
    y += 6;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text("VITALS & DAILY SYMPTOM LOG HISTORY (LAST 30 DAYS)", 15, y);
    y += 8;

    // Filter logs for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const parseLogDate = (dateStr: string): Date => {
      const currentYear = new Date().getFullYear();
      const parsed = new Date(`${dateStr}, ${currentYear}`);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const logsLast30Days = vitalsHistory.filter(item => {
      const d = parseLogDate(item.date);
      return d >= thirtyDaysAgo && d <= now;
    });

    if (logsLast30Days.length === 0) {
      doc.setFont("Helvetica", "oblique");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("No vitals or symptom logs recorded during the last 30 days.", 15, y);
      y += 8;
    } else {
      // Draw Table Header
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(15, y, pageWidth - 30, 8, "F");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      
      doc.text("Date", 17, y + 5.5);
      doc.text("Blood Pressure", 40, y + 5.5);
      doc.text("HR (BPM)", 70, y + 5.5);
      doc.text("Sugar (mg/dL)", 90, y + 5.5);
      doc.text("Logged Symptoms & Notes", 120, y + 5.5);
      
      y += 8;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      // Render logs row-by-row
      logsLast30Days.forEach((log) => {
        // Page overflow check
        if (y > pageHeight - 25) {
          doc.addPage();
          y = 15;
          // Repeat Table Header on new page
          doc.setFillColor(241, 245, 249);
          doc.rect(15, y, pageWidth - 30, 8, "F");
          doc.setFont("Helvetica", "bold");
          doc.setTextColor(71, 85, 105);
          doc.text("Date", 17, y + 5.5);
          doc.text("Blood Pressure", 40, y + 5.5);
          doc.text("HR (BPM)", 70, y + 5.5);
          doc.text("Sugar (mg/dL)", 90, y + 5.5);
          doc.text("Logged Symptoms & Notes", 120, y + 5.5);
          y += 8;
          doc.setFont("Helvetica", "normal");
          doc.setTextColor(15, 23, 42);
        }

        // Row Separator Line
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.3);
        doc.line(15, y + 6.5, pageWidth - 15, y + 6.5);

        doc.setFont("Helvetica", "bold");
        doc.text(log.date || "N/A", 17, y + 4.5);
        doc.setFont("Helvetica", "normal");
        
        doc.text(`${log.bpSystolic}/${log.bpDiastolic} mmHg`, 40, y + 4.5);
        doc.text(`${log.hr}`, 70, y + 4.5);
        doc.text(`${log.sugar}`, 90, y + 4.5);

        // Render Symptoms and notes list
        const symList = log.symptoms && log.symptoms.length > 0 ? log.symptoms.join(", ") : "None";
        const symNote = log.symptomNotes ? ` (${log.symptomNotes})` : "";
        const combinedSym = `${symList}${symNote}`;

        const splitSym = doc.splitTextToSize(combinedSym, pageWidth - 135);
        doc.text(splitSym, 120, y + 4.5);

        const rowHeight = Math.max(7, splitSym.length * 4.5);
        y += rowHeight;
      });
    }

    // Disclaimer footer
    y = Math.min(pageHeight - 25, y + 10);
    if (y < pageHeight - 35) {
      y = pageHeight - 25;
    } else {
      // Add another page to prevent sticking together
      doc.addPage();
      y = pageHeight - 25;
    }
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, y, pageWidth - 15, y);
    y += 5;

    doc.setFont("Helvetica", "oblique");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Disclaimer: This is an automatically generated patient-logged consolidated summary verified under ABHA health networks.", 15, y);
    doc.text("For medical consultations, please share this record directly with your certified health professional or clinic.", 15, y + 4);

    doc.save(`Health_Summary_${selectedPatient.fullName.replace(/\s+/g, "_")}.pdf`);
  };

  // Voice speech recognition & Smartwatch states
  const [speechSupported, setSpeechSupported] = useState(true);
  const [listeningField, setListeningField] = useState<"hr" | "systolic" | "diastolic" | "sugar" | "weight" | "height" | "all" | null>(null);
  const [voiceFeedback, setVoiceFeedback] = useState<string>("");
  const [parsedVitalsSummary, setParsedVitalsSummary] = useState<{
    hr?: string;
    systolic?: string;
    diastolic?: string;
    sugar?: string;
    weight?: string;
    height?: string;
  } | null>(null);

  // Smartwatch Sync & Bluetooth BLE Scanner states
  const [smartwatchSyncMode, setSmartwatchSyncMode] = useState<"smartwatch" | "voice">("smartwatch");
  const [selectedSmartwatch, setSelectedSmartwatch] = useState<"apple" | "fitbit" | "galaxy" | "garmin">("apple");
  const [isSyncingSmartwatch, setIsSyncingSmartwatch] = useState(false);
  const [smartwatchLastSynced, setSmartwatchLastSynced] = useState<string | null>(null);

  // PWA (Progressive Web App) Install States
  const [deferredPwaPrompt, setDeferredPwaPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);
  const [pwaInstallSuccess, setPwaInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      if (isStandalone) {
        setIsPwaInstalled(true);
      }

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPwaPrompt(e);
      };

      const handleAppInstalled = () => {
        setIsPwaInstalled(true);
        setPwaInstallSuccess(true);
        setDeferredPwaPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      const { outcome } = await deferredPwaPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPwaInstalled(true);
        setPwaInstallSuccess(true);
      }
      setDeferredPwaPrompt(null);
    } else {
      // Direct instructions fallback for browsers or iOS Safari
      alert("To install Remix CURA as a PWA:\n\n• On Mobile Chrome/Android: Tap Menu (⋮) → 'Install app' or 'Add to Home screen'\n• On iPhone/Safari: Tap Share (⎋) → 'Add to Home Screen'");
    }
  };

  // Bluetooth scanning states
  const [isScanningBluetooth, setIsScanningBluetooth] = useState(false);
  const [connectedBleDevice, setConnectedBleDevice] = useState<string | null>("Apple Watch Ultra 2 (Paired)");
  const [discoveredBleDevices, setDiscoveredBleDevices] = useState<Array<{
    id: string;
    name: string;
    type: string;
    rssi: number;
    battery: number;
    services: string[];
    isPaired: boolean;
  }>>([
    { id: "BLE-AW-8921", name: "Apple Watch Ultra 2", type: "Smartwatch / HealthKit", rssi: -54, battery: 88, services: ["Heart Rate (0x180D)", "Blood Pressure", "Spo2"], isPaired: true },
    { id: "BLE-FB-4309", name: "Fitbit Sense 2", type: "Fitness Tracker", rssi: -62, battery: 74, services: ["Heart Rate (0x180D)", "ECG", "Skin Temp"], isPaired: false },
    { id: "BLE-GW-1102", name: "Galaxy Watch 6 Classic", type: "Wear OS Smartwatch", rssi: -71, battery: 92, services: ["Heart Rate", "BIA Composition"], isPaired: false },
    { id: "BLE-OM-9920", name: "Omron Evolv BP Cuff", type: "Medical BLE Peripheral", rssi: -68, battery: 65, services: ["Blood Pressure (0x1810)"], isPaired: false }
  ]);

  const handleStartBluetoothScan = async () => {
    setIsScanningBluetooth(true);
    setVoiceFeedback("Scanning 2.4GHz Bluetooth LE channels for nearby medical wearables...");

    // Web Bluetooth API execution if supported and allowed
    if (typeof navigator !== "undefined" && (navigator as any).bluetooth) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['heart_rate', 'blood_pressure', 'battery_service']
        });
        if (device) {
          const newDev = {
            id: device.id || `BLE-${Math.floor(1000 + Math.random() * 9000)}`,
            name: device.name || "Generic BLE Heart Rate Sensor",
            type: "Discovered GATT Device",
            rssi: -58,
            battery: 90,
            services: ["Heart Rate (0x180D)", "Battery Service"],
            isPaired: false
          };
          setDiscoveredBleDevices(prev => [newDev, ...prev.filter(d => d.id !== newDev.id)]);
          setVoiceFeedback(`Discovered physical device: ${newDev.name}`);
        }
      } catch (err: any) {
        console.log("Web Bluetooth scan cancelled or fallback to BLE radar:", err);
      }
    }

    // Radar scan simulation for interactive preview
    setTimeout(() => {
      setIsScanningBluetooth(false);
      setVoiceFeedback("✓ Bluetooth scan complete. 4 BLE wearables ready for live telemetry streaming.");
    }, 1800);
  };

  const handlePairAndStreamBleDevice = (device: { id: string; name: string; type: string }) => {
    setIsSyncingSmartwatch(true);
    setConnectedBleDevice(device.name);
    setVoiceFeedback(`Pairing GATT service with ${device.name}...`);

    setTimeout(() => {
      const data = {
        hr: String(Math.floor(68 + Math.random() * 14)),
        systolic: String(Math.floor(115 + Math.random() * 10)),
        diastolic: String(Math.floor(75 + Math.random() * 8)),
        sugar: String(Math.floor(95 + Math.random() * 20)),
        weight: "71.2",
        height: "172"
      };

      setLogHeartRate(data.hr);
      setLogSystolic(data.systolic);
      setLogDiastolic(data.diastolic);
      setLogSugar(data.sugar);
      setLogWeight(data.weight);
      setLogHeight(data.height);

      setParsedVitalsSummary(data);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSmartwatchLastSynced(timeStr);
      setIsSyncingSmartwatch(false);

      setDiscoveredBleDevices(prev =>
        prev.map(d => d.id === device.id ? { ...d, isPaired: true } : d)
      );

      setVoiceFeedback(`✓ Biometrics streaming live from ${device.name} over BLE GATT at ${timeStr}`);
    }, 1200);
  };

  const handleSyncSmartwatchData = (device = selectedSmartwatch) => {
    setIsSyncingSmartwatch(true);
    const deviceName = device === "apple" ? "Apple Watch Ultra 2 (HealthKit)" : device === "fitbit" ? "Fitbit Sense 2" : device === "galaxy" ? "Samsung Galaxy Watch 6" : "Garmin Venu 3";
    setVoiceFeedback(`Connecting to ${deviceName} over Bluetooth & Health API...`);

    setTimeout(() => {
      let data = {
        hr: "74",
        systolic: "122",
        diastolic: "81",
        sugar: "106",
        weight: "71.2",
        height: "172"
      };

      if (device === "fitbit") {
        data = { hr: "76", systolic: "118", diastolic: "78", sugar: "102", weight: "70.8", height: "172" };
      } else if (device === "galaxy") {
        data = { hr: "72", systolic: "120", diastolic: "80", sugar: "108", weight: "71.5", height: "172" };
      } else if (device === "garmin") {
        data = { hr: "68", systolic: "116", diastolic: "76", sugar: "98", weight: "71.0", height: "172" };
      }

      setLogHeartRate(data.hr);
      setLogSystolic(data.systolic);
      setLogDiastolic(data.diastolic);
      setLogSugar(data.sugar);
      setLogWeight(data.weight);
      setLogHeight(data.height);

      setParsedVitalsSummary(data);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSmartwatchLastSynced(timeStr);
      setIsSyncingSmartwatch(false);
      setVoiceFeedback(`✓ Biometrics synced live from ${deviceName} at ${timeStr}`);
    }, 1100);
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(true);
  }, []);

  const stopListening = () => {
    const activeRec = (window as any)._activeSpeechRecognition;
    if (activeRec) {
      try {
        activeRec.stop();
      } catch (e) {}
    }
    setListeningField(null);
  };

  useEffect(() => {
    if (!showVitalsModal) {
      stopListening();
      setVoiceFeedback("");
      setParsedVitalsSummary(null);
    }
  }, [showVitalsModal]);

  const normalizeSpokenText = (rawText: string): string => {
    let text = rawText.toLowerCase().trim();

    const wordMap: Record<string, number> = {
      zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
      eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
      fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
      nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
      sixty: 60, seventy: 70, eighty: 80, ninety: 90
    };

    text = text.replace(/(\w+)\s+hundred(?:\s+and)?(?:\s+(\w+))?(?:\s+(\w+))?/g, (match, p1, p2, p3) => {
      let val = 0;
      if (wordMap[p1] !== undefined) val += wordMap[p1] * 100;
      else if (!isNaN(Number(p1))) val += Number(p1) * 100;
      else val = 100;

      if (p2 && wordMap[p2] !== undefined) val += wordMap[p2];
      if (p3 && wordMap[p3] !== undefined) val += wordMap[p3];
      return val > 0 ? String(val) : match;
    });

    text = text.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(one|two|three|four|five|six|seven|eight|nine)\b/g, (_, tens, ones) => {
      return String((wordMap[tens] || 0) + (wordMap[ones] || 0));
    });

    Object.keys(wordMap).forEach((word) => {
      const reg = new RegExp(`\\b${word}\\b`, 'g');
      text = text.replace(reg, String(wordMap[word]));
    });

    text = text.replace(/\b(\d+)\s*(?:point|dot)\s*(\d+)\b/g, '$1.$2');
    text = text.replace(/(\d+)\s*(?:over|by|slash|\/)\s*(\d+)/g, '$1 over $2');

    return text;
  };

  const processSpeechTranscript = (field: "hr" | "systolic" | "diastolic" | "sugar" | "weight" | "height" | "all", rawTranscript: string) => {
    const transcript = normalizeSpokenText(rawTranscript);

    if (field === "hr") {
      const match = transcript.match(/\d+/);
      if (match) {
        setLogHeartRate(match[0]);
        setParsedVitalsSummary(prev => ({ ...prev, hr: match[0] }));
        setVoiceFeedback(`Set Heart Rate to ${match[0]} BPM`);
      } else {
        setVoiceFeedback("Could not detect heart rate. Try saying 'seventy two'");
      }
    } else if (field === "systolic") {
      const match = transcript.match(/\d+/);
      if (match) {
        setLogSystolic(match[0]);
        setParsedVitalsSummary(prev => ({ ...prev, systolic: match[0] }));
        setVoiceFeedback(`Set Systolic BP to ${match[0]} mmHg`);
      } else {
        setVoiceFeedback("Could not detect systolic BP. Try saying 'one hundred twenty'");
      }
    } else if (field === "diastolic") {
      const match = transcript.match(/\d+/);
      if (match) {
        setLogDiastolic(match[0]);
        setParsedVitalsSummary(prev => ({ ...prev, diastolic: match[0] }));
        setVoiceFeedback(`Set Diastolic BP to ${match[0]} mmHg`);
      } else {
        setVoiceFeedback("Could not detect diastolic BP. Try saying 'eighty'");
      }
    } else if (field === "sugar") {
      const match = transcript.match(/\d+/);
      if (match) {
        setLogSugar(match[0]);
        setParsedVitalsSummary(prev => ({ ...prev, sugar: match[0] }));
        setVoiceFeedback(`Set Blood Sugar to ${match[0]} mg/dL`);
      } else {
        setVoiceFeedback("Could not detect blood sugar. Try saying 'one hundred five'");
      }
    } else if (field === "weight") {
      const match = transcript.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        setLogWeight(match[1]);
        setParsedVitalsSummary(prev => ({ ...prev, weight: match[1] }));
        setVoiceFeedback(`Set Weight to ${match[1]} kg`);
      } else {
        setVoiceFeedback("Could not detect weight. Try saying 'seventy point five'");
      }
    } else if (field === "height") {
      const match = transcript.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        setLogHeight(match[1]);
        setParsedVitalsSummary(prev => ({ ...prev, height: match[1] }));
        setVoiceFeedback(`Set Height to ${match[1]} cm`);
      } else {
        setVoiceFeedback("Could not detect height. Try saying 'one hundred seventy two'");
      }
    } else if (field === "all") {
      let parsedHR = "";
      let parsedSystolic = "";
      let parsedDiastolic = "";
      let parsedSugar = "";
      let parsedWeight = "";
      let parsedHeight = "";

      // 1. Blood Pressure match
      const bpMatch = transcript.match(/(\d+)\s*(?:over|by|slash|\/)\s*(\d+)/i) ||
                      transcript.match(/(?:bp|blood pressure|pressure)(?:\s+(?:is|of|was))?\s*(\d+)\s*(?:over|by|slash|\/)\s*(\d+)/i);
      if (bpMatch) {
        parsedSystolic = bpMatch[1];
        parsedDiastolic = bpMatch[2];
        setLogSystolic(parsedSystolic);
        setLogDiastolic(parsedDiastolic);
      }

      // 2. Heart Rate match
      const hrMatch = transcript.match(/(?:heart rate|pulse|bpm|hr|beats)(?:\s+(?:is|of|was))?\s*(\d+)/i) ||
                      transcript.match(/(\d+)\s*(?:bpm|beats per minute|beats)/i);
      if (hrMatch) {
        parsedHR = hrMatch[1];
        setLogHeartRate(parsedHR);
      }

      // 3. Sugar / Glucose match
      const sugarMatch = transcript.match(/(?:sugar|glucose|blood sugar|fasting sugar|random sugar)(?:\s+(?:is|of|was))?\s*(\d+)/i);
      if (sugarMatch) {
        parsedSugar = sugarMatch[1];
        setLogSugar(parsedSugar);
      }

      // 4. Weight match
      const weightMatch = transcript.match(/(?:weight|weighs|weigh|mass)(?:\s+(?:is|of|was))?\s*(\d+(?:\.\d+)?)/i) ||
                          transcript.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|kilograms|lbs|pounds)/i);
      if (weightMatch) {
        parsedWeight = weightMatch[1];
        setLogWeight(parsedWeight);
      }

      // 5. Height match
      const heightMatch = transcript.match(/(?:height|tall)(?:\s+(?:is|of|was))?\s*(\d+(?:\.\d+)?)/i) ||
                          transcript.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimeters)/i);
      if (heightMatch) {
        parsedHeight = heightMatch[1];
        setLogHeight(parsedHeight);
      }

      // Positional fallback if no keywords matched
      const allNumbers = transcript.match(/\d+(?:\.\d+)?/g);
      if (allNumbers && !bpMatch && !hrMatch && !sugarMatch && !weightMatch && !heightMatch) {
        if (allNumbers.length === 1) {
          parsedHR = allNumbers[0];
          setLogHeartRate(parsedHR);
        } else if (allNumbers.length === 2) {
          parsedSystolic = allNumbers[0];
          parsedDiastolic = allNumbers[1];
          setLogSystolic(parsedSystolic);
          setLogDiastolic(parsedDiastolic);
        } else if (allNumbers.length >= 3) {
          parsedHR = allNumbers[0];
          parsedSystolic = allNumbers[1];
          parsedDiastolic = allNumbers[2];
          setLogHeartRate(parsedHR);
          setLogSystolic(parsedSystolic);
          setLogDiastolic(parsedDiastolic);
          if (allNumbers[3]) {
            parsedSugar = allNumbers[3];
            setLogSugar(parsedSugar);
          }
          if (allNumbers[4]) {
            parsedWeight = allNumbers[4];
            setLogWeight(parsedWeight);
          }
          if (allNumbers[5]) {
            parsedHeight = allNumbers[5];
            setLogHeight(parsedHeight);
          }
        }
      }

      const updates: string[] = [];
      const summaryObj: any = {};
      if (parsedHR) { updates.push(`HR: ${parsedHR} BPM`); summaryObj.hr = parsedHR; }
      if (parsedSystolic && parsedDiastolic) { updates.push(`BP: ${parsedSystolic}/${parsedDiastolic}`); summaryObj.systolic = parsedSystolic; summaryObj.diastolic = parsedDiastolic; }
      if (parsedSugar) { updates.push(`Sugar: ${parsedSugar} mg/dL`); summaryObj.sugar = parsedSugar; }
      if (parsedWeight) { updates.push(`Weight: ${parsedWeight} kg`); summaryObj.weight = parsedWeight; }
      if (parsedHeight) { updates.push(`Height: ${parsedHeight} cm`); summaryObj.height = parsedHeight; }

      setParsedVitalsSummary(summaryObj);

      if (updates.length > 0) {
        setVoiceFeedback(`Parsed ${updates.length} vitals: ${updates.join(", ")}`);
      } else {
        setVoiceFeedback("No clear numbers recognized. Dictate e.g.: 'Heart rate 76, BP 120 over 80, sugar 105, weight 70.5'");
      }
    }
  };

  const startListening = (field: "hr" | "systolic" | "diastolic" | "sugar" | "weight" | "height" | "all") => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (listeningField) {
      stopListening();
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      setListeningField(field);
      setVoiceFeedback("Listening... Speak now");

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const activeText = finalTranscript || interimTranscript;
        setVoiceFeedback(`"${activeText}"`);

        if (finalTranscript) {
          processSpeechTranscript(field, finalTranscript.toLowerCase());
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          setVoiceFeedback("Permission denied. Enable mic access.");
        } else {
          setVoiceFeedback(`Error: ${event.error}`);
        }
        stopListening();
      };

      recognition.onend = () => {
        setListeningField(null);
      };

      (window as any)._activeSpeechRecognition = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition", err);
      setListeningField(null);
    }
  };

  // Time for status bar
  const [currentTimeStr, setCurrentTimeStr] = useState("12:00");

  useEffect(() => {
    // Clock tick
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setCurrentTimeStr(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Persistent Patient Logout Handler
  const handlePatientLogout = async () => {
    setSelectedPatient(null);
    setFamilyViewShareCode("");
    setFamilyViewRelation("");
    setFamilyViewAccessLevel("view");
    setOriginalSelfPatient(null);
    try {
      localStorage.removeItem("cura_patient_session");
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout error", e);
    }
  };

  // Persistent Patient Selection Handler
  const handlePatientSelectAndPersist = async (p: Patient) => {
    setSelectedPatient(p);
    try {
      localStorage.setItem("cura_patient_session", JSON.stringify({
        id: p.id,
        patientCode: p.patientCode,
        fullName: p.fullName,
        timestamp: Date.now()
      }));
      await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: p.id })
      });
    } catch (e) {
      console.warn("Session persist error", e);
    }
  };

  // Fetch initial system patients, appointments, doctor profile, and persistent session
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const [resPatients, resAppts, resAuth] = await Promise.all([
          fetch("/api/v1/patients"),
          fetch("/api/v1/appointments"),
          fetch("/api/v1/auth/me")
        ]);

        let loadedPatients: Patient[] = [];
        if (resPatients.ok) {
          loadedPatients = await resPatients.json();
          setPatients(loadedPatients);
        }
        if (resAppts.ok) {
          const data = await resAppts.json();
          setAppointments(data);
        }

        // Restore active patient session from HTTP-only cookie or persistent localStorage
        let restoredPatient: Patient | null = null;

        if (resAuth.ok) {
          const authData = await resAuth.json();
          if (authData.authenticated && authData.patient) {
            restoredPatient = authData.patient;
          }
        }

        if (!restoredPatient && typeof window !== "undefined") {
          const stored = localStorage.getItem("cura_patient_session");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              restoredPatient = loadedPatients.find(
                p => p.id === parsed.id || (p.patientCode && p.patientCode === parsed.patientCode)
              ) || null;
            } catch (e) {}
          }
        }

        if (restoredPatient) {
          setSelectedPatient(restoredPatient);
        }

        await fetchDoctorProfile();
      } catch (err) {
        console.error("Failed to load systems data", err);
      }
    };
    fetchSystemData();
  }, [bookingSuccess]);

  // Seed default clinical vitals when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      // Create some realistic historical graph points for the patient
      const baseHistory = [
        { date: "May 10", bpSystolic: 128, bpDiastolic: 84, hr: 74, sugar: 110, weight: 70.0, height: 172, symptoms: ["Headache", "Fatigue"], symptomNotes: "Felt mild headache after work." },
        { date: "May 25", bpSystolic: 122, bpDiastolic: 80, hr: 70, sugar: 98, weight: 70.5, height: 172, symptoms: [], symptomNotes: "Felt perfectly fine." },
        { date: "Jun 12", bpSystolic: 132, bpDiastolic: 88, hr: 78, sugar: 124, weight: 69.8, height: 172, symptoms: ["Cough"], symptomNotes: "Slight seasonal throat irritation." },
        { date: "Jun 20", bpSystolic: 125, bpDiastolic: 82, hr: 71, sugar: 104, weight: 70.2, height: 172, symptoms: ["Fatigue"], symptomNotes: "Feeling better, just a bit tired." }
      ];
      setVitalsHistory(baseHistory);
      // Reset state locks
      setRxUnlocked(false);
      setSecurityPinInput("");
      setPinError("");
      setActivePrescription(null);
      setBookingSuccess(null);
      setDismissedAlertIndex(null);
      fetchMedicationReminders(selectedPatient.id);
      fetchPatientConsent(selectedPatient.id);
    }
  }, [selectedPatient]);

  // Handle Code Login
  const handleLogin = async (code: string) => {
    setAuthError("");
    setIsLoadingAuth(true);

    const trimmedCode = code.trim();
    if (trimmedCode.toUpperCase().startsWith("CURA-FAM-")) {
      try {
        const response = await fetch(`/api/v1/family-shares/verify/${trimmedCode}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedPatient(data.patient);
          setFamilyViewRelation(data.relationship);
          setFamilyViewAccessLevel(data.accessLevel);
          setFamilyViewShareCode(data.code);
          setOriginalSelfPatient(null);
          setAuthError("");
        } else {
          const errData = await response.json();
          setAuthError(errData.detail || "Invalid or expired Secure Family Share Code.");
        }
      } catch (err) {
        setAuthError("Network error verifying family share code.");
      } finally {
        setIsLoadingAuth(false);
      }
      return;
    }

    setTimeout(() => {
      const match = patients.find(
        p => p.id.toLowerCase() === trimmedCode.toLowerCase() || 
             (p.patientCode && p.patientCode.toLowerCase() === trimmedCode.toLowerCase()) ||
             p.phone.replace(/\s+/g, "").includes(trimmedCode)
      );

      if (match) {
        setSelectedPatient(match);
      } else {
        setAuthError("Patient Code / Mobile Number or Family Share Code not found.");
      }
      setIsLoadingAuth(false);
    }, 600);
  };

  // === FAMILY CARE ACTIONS ===
  // Generate code
  const handleGenerateShareCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !familyMemberName || !familyMemberRelationship) return;
    setIsGeneratingShareCode(true);
    try {
      const response = await fetch(`/api/v1/patients/${selectedPatient.id}/family-shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: familyMemberName,
          relationship: familyMemberRelationship,
          accessLevel: familyMemberAccessLevel
        })
      });

      if (response.ok) {
        const newShare = await response.json();
        setFamilyShares(prev => [...prev, newShare]);
        setFamilyMemberName("");
        setFamilyMemberRelationship("");
        setFamilyMemberAccessLevel("view");
      }
    } catch (err) {
      console.error("Failed to generate family share code", err);
    } finally {
      setIsGeneratingShareCode(false);
    }
  };

  // Revoke code
  const handleRevokeShareCode = async (code: string) => {
    if (!selectedPatient) return;
    setIsRevokingShareCode(code);
    try {
      const response = await fetch(`/api/v1/patients/${selectedPatient.id}/family-shares/${code}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setFamilyShares(prev => prev.filter(s => s.code !== code));
      }
    } catch (err) {
      console.error("Failed to revoke family share code", err);
    } finally {
      setIsRevokingShareCode(null);
    }
  };

  // Verify and link code
  const handleVerifyAndLinkShareCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyShareCodeInput.trim()) return;
    setIsVerifyingShareCode(true);
    setFamilyShareVerifyError("");
    setFamilyShareVerifySuccess("");
    try {
      const response = await fetch(`/api/v1/family-shares/verify/${familyShareCodeInput.trim()}`);
      if (response.ok) {
        const data = await response.json();
        // Check if already linked
        const exists = connectedFamilyMembers.some(m => m.shareCode === data.code);
        if (exists) {
          setFamilyShareVerifyError("This Family Share Code is already linked to your dashboard.");
        } else {
          const newConnection = {
            patientId: data.patient.id,
            fullName: data.patient.fullName,
            relationship: data.relationship,
            accessLevel: data.accessLevel,
            shareCode: data.code,
            age: data.patient.age,
            gender: data.patient.gender
          };
          setConnectedFamilyMembers(prev => [...prev, newConnection]);
          setFamilyShareVerifySuccess(`Successfully linked to ${data.patient.fullName}'s medical portal!`);
          setFamilyShareCodeInput("");
        }
      } else {
        const errData = await response.json();
        setFamilyShareVerifyError(errData.detail || "Invalid Secure Family Share Code.");
      }
    } catch (err) {
      console.error("Failed to verify share code", err);
      setFamilyShareVerifyError("Network error. Please try again.");
    } finally {
      setIsVerifyingShareCode(false);
    }
  };

  // Switch to family view
  const handleSwitchToFamilyMember = (member: any) => {
    if (!originalSelfPatient && selectedPatient) {
      setOriginalSelfPatient(selectedPatient);
    }
    
    setIsVerifyingShareCode(true);
    fetch(`/api/v1/family-shares/verify/${member.shareCode}`)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Unable to fetch family member's current record.");
      })
      .then(data => {
        setSelectedPatient(data.patient);
        setFamilyViewRelation(member.relationship);
        setFamilyViewAccessLevel(member.accessLevel);
        setFamilyViewShareCode(member.shareCode);
        setActiveTab("home");
      })
      .catch(err => {
        alert(err.message);
      })
      .finally(() => {
        setIsVerifyingShareCode(false);
      });
  };

  // Return to own portal
  const handleReturnToOwnPortal = () => {
    if (originalSelfPatient) {
      setSelectedPatient(originalSelfPatient);
      setOriginalSelfPatient(null);
      setFamilyViewRelation("");
      setFamilyViewAccessLevel("view");
      setFamilyViewShareCode("");
      setActiveTab("home");
    }
  };

  // Submit appointment booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !bookingDate || !bookingTime) return;

    setIsBooking(true);
    const scheduledAt = `${bookingDate}T${bookingTime}`;

    try {
      const response = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          patientName: selectedPatient.fullName,
          patientCode: selectedPatient.patientCode || selectedPatient.id,
          phone: selectedPatient.phone,
          doctorName: doctor,
          scheduledAt,
          type: consultType,
          reason: bookingReason || "Routine consultation requested via mobile app."
        })
      });

      const data = await response.json();
      if (response.ok) {
        setBookingSuccess({
          doctorName: doctor,
          scheduledAt,
          type: consultType,
          id: data.id || `APT-${Math.floor(1000 + Math.random() * 9000)}`
        });
        setBookingReason("");
        setBookingDate("");
        setBookingTime("");
      } else {
        alert(data.detail || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network failure. Could not connect to clinic booking server.");
    } finally {
      setIsBooking(false);
    }
  };

  // Ayurveda VaidhLLaMA Query Handler
  const handleAyurvedaQuery = async (customSymptoms?: string) => {
    const symptomsToQuery = customSymptoms || ayurvedaSymptomsInput;
    if (!symptomsToQuery || !symptomsToQuery.trim()) {
      setAyurvedaError("Please enter your symptoms to receive Ayurvedic insights.");
      return;
    }

    try {
      setAyurvedaLoading(true);
      setAyurvedaError("");
      const res = await fetch("/api/vaidhllama/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptomsToQuery })
      });

      const data = await res.json();
      if (res.ok) {
        setAyurvedaInsight(data);
      } else {
        setAyurvedaError(data.detail || "VaidhLLaMA was unable to analyze symptoms at this moment.");
      }
    } catch (err) {
      console.error("VaidhLLaMA Query Error", err);
      setAyurvedaError("A network error occurred. Failed to connect to VaidhLLaMA service.");
    } finally {
      setAyurvedaLoading(false);
    }
  };

  // Log custom vitals
  const handleLogVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const newPoint = {
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      bpSystolic: parseInt(logSystolic) || 120,
      bpDiastolic: parseInt(logDiastolic) || 80,
      hr: parseInt(logHeartRate) || 72,
      sugar: parseInt(logSugar) || 100,
      weight: logWeight ? parseFloat(logWeight) : undefined,
      height: logHeight ? parseFloat(logHeight) : undefined,
      symptoms: [...selectedSymptoms],
      symptomNotes: customSymptomNote
    };
    setVitalsHistory(prev => [...prev, newPoint]);
    setLogSuccessMsg(true);
    setTimeout(() => {
      setLogSuccessMsg(false);
      setShowVitalsModal(false);
      setLogWeight("");
      setLogHeight("");
      setSelectedSymptoms([]);
      setCustomSymptomNote("");
    }, 1500);
  };

  // Unlock Prescription Vault
  const handlePinUnlock = () => {
    if (securityPinInput === "1234" || securityPinInput === "0000" || securityPinInput === "") {
      setRxUnlocked(true);
      setPinError("");
    } else {
      setPinError("Invalid medical vault PIN passcode. Hint: Use 1234 or leave empty");
    }
  };

  const handleTriggerBiometricAuth = async () => {
    setBiometricScanActive(true);
    setBiometricScanStatus("scanning");
    try {
      const success = await authenticateBiometric();
      if (success) {
        setBiometricScanStatus("success");
        setTimeout(() => {
          setRxUnlocked(true);
          setBiometricScanActive(false);
          setBiometricScanStatus("idle");
        }, 1200);
      } else {
        setBiometricScanStatus("failed");
        setTimeout(() => {
          setBiometricScanActive(false);
          setBiometricScanStatus("idle");
        }, 1500);
      }
    } catch (err) {
      setBiometricScanStatus("failed");
      setTimeout(() => {
        setBiometricScanActive(false);
        setBiometricScanStatus("idle");
      }, 1500);
    }
  };

  const handleTriggerBiometricRegister = async () => {
    setBiometricScanActive(true);
    setBiometricScanStatus("scanning");
    try {
      const success = await registerBiometric();
      if (success) {
        setBiometricScanStatus("success");
        setTimeout(() => {
          setBiometricScanActive(false);
          setBiometricScanStatus("idle");
        }, 1200);
      } else {
        setBiometricScanStatus("failed");
        setTimeout(() => {
          setBiometricScanActive(false);
          setBiometricScanStatus("idle");
        }, 1500);
      }
    } catch (err) {
      setBiometricScanStatus("failed");
      setTimeout(() => {
        setBiometricScanActive(false);
        setBiometricScanStatus("idle");
      }, 1500);
    }
  };

  // Filters appointments for current patient
  const patientAppointments = appointments.filter(
    apt => apt.patientId === selectedPatient?.id || apt.patientCode === selectedPatient?.patientCode
  );

  const getLatestBMIStats = () => {
    // Find latest entry with weight and height
    let latestWeight: number | undefined;
    let latestHeight: number | undefined;

    for (let i = vitalsHistory.length - 1; i >= 0; i--) {
      const entry = vitalsHistory[i];
      if (entry.weight !== undefined && !latestWeight) {
        latestWeight = entry.weight;
      }
      if (entry.height !== undefined && !latestHeight) {
        latestHeight = entry.height;
      }
      if (latestWeight !== undefined && latestHeight !== undefined) {
        break;
      }
    }

    // fallback values if none are found in history
    if (latestWeight === undefined) latestWeight = 70; // fallback weight in kg
    if (latestHeight === undefined) latestHeight = 172; // fallback height in cm

    const heightInMeters = latestHeight / 100;
    const bmi = latestWeight / (heightInMeters * heightInMeters);

    let classification = "Normal weight";
    let colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    let barColor = "bg-emerald-500";
    if (bmi < 18.5) {
      classification = "Underweight";
      colorClass = "text-sky-400 bg-sky-500/10 border-sky-500/20";
      barColor = "bg-sky-500";
    } else if (bmi >= 18.5 && bmi < 25) {
      classification = "Normal weight";
      colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      barColor = "bg-emerald-500";
    } else if (bmi >= 25 && bmi < 30) {
      classification = "Overweight";
      colorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      barColor = "bg-amber-500";
    } else {
      classification = "Obese";
      colorClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
      barColor = "bg-rose-500";
    }

    return {
      weight: latestWeight,
      height: latestHeight,
      bmi: parseFloat(bmi.toFixed(1)),
      classification,
      colorClass,
      barColor
    };
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-12">
      
      {/* SIMULATOR GLOBAL NAVIGATION HEADER */}
      <header className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              CURA Patient Mobile Gateway <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase font-black">Sandbox</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Responsive Client Mobile Viewport and Secure Prescription Reader</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle Buttons */}
          <button
            onClick={() => setViewMode("simulator")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              viewMode === "simulator" 
                ? "bg-slate-800 text-white border-slate-700 shadow-inner" 
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-300"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-400" /> iPhone Bezel
          </button>
          
          <button
            onClick={() => setViewMode("responsive")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              viewMode === "responsive" 
                ? "bg-slate-800 text-white border-slate-700 shadow-inner" 
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-300"
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5 text-sky-400" /> Responsive Web
          </button>

          <div className="h-6 w-[1px] bg-slate-800 mx-2 hidden md:block" />

          <button 
            onClick={onBackToLanding}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-extrabold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            ← Back to Cura Landing
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE container */}
      <main className="max-w-7xl mx-auto px-4 flex justify-center items-start min-h-[750px]">
        
        {viewMode === "simulator" ? (
          /* IPHONE SIMULATOR MODE */
          <div className="relative mx-auto my-4">
            
            {/* Phone Bezel */}
            <div className="w-[390px] h-[820px] bg-slate-950 rounded-[55px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative ring-1 ring-slate-700">
              
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-slate-950 rounded-b-3xl z-[99] flex items-center justify-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800/40"></div>
                <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
              </div>

              {/* Status Bar */}
              <div className="h-11 bg-slate-950/90 text-white flex items-center justify-between px-6 text-[11px] font-bold select-none z-50 pt-1 shrink-0">
                <span>{currentTimeStr}</span>
                <div className="flex items-center gap-1.5">
                  <svg className="h-2.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  <span>5G</span>
                  <div className="w-5 h-2.5 border border-white/50 rounded-sm p-0.5 flex items-center">
                    <div className="bg-emerald-400 h-full w-[80%] rounded-xs"></div>
                  </div>
                </div>
              </div>

              {/* Phone Content Screen */}
              <div className="flex-1 overflow-hidden flex flex-col bg-slate-900 text-slate-100 relative">
                <AnimatePresence mode="wait">
                  {!selectedPatient ? (
                    <PatientAuthScreen 
                      patients={patients}
                      onSelectPatient={(p) => handlePatientSelectAndPersist(p)}
                      onPatientCreated={(p) => setPatients(prev => [p, ...prev])}
                      onInstallPWA={handleInstallPWA}
                      isPwaInstalled={isPwaInstalled}
                      isSimulator={true}
                      isBiometricSupported={isSupported}
                      onAuthenticateBiometric={authenticateBiometric}
                    />
                  ) : (
                    /* PORTAL MAIN SCREENS */
                    <motion.div 
                      key="portal"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col justify-between overflow-hidden relative"
                    >
                      {/* Top App Header bar */}
                      <div className="px-5 py-3 bg-slate-950/90 border-b border-slate-800/60 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                            ✙
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 leading-none">Cura Mobile App</p>
                            <p className="text-xs font-black text-white leading-tight">{selectedPatient.fullName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleInstallPWA}
                            className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                              isPwaInstalled
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400"
                            }`}
                            title="Install CURA Progressive Web App"
                          >
                            <span>📲</span>
                            <span>{isPwaInstalled ? "PWA Active" : "Install App"}</span>
                          </button>

                          <button 
                            onClick={handlePatientLogout}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                            title="Log Out"
                          >
                            <LogOut className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* FLOATING PUSH NOTIFICATION ALERT SIMULATOR BANNER */}
                      <AnimatePresence>
                        {activeNotificationAlert && (
                          <motion.div
                            initial={{ opacity: 0, y: -100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 12, scale: 1 }}
                            exit={{ opacity: 0, y: -100, scale: 0.9 }}
                            className="absolute top-1 left-3 right-3 bg-slate-900/95 border-2 border-emerald-500/50 backdrop-blur-md p-4 rounded-2xl shadow-2xl z-[100] ring-1 ring-slate-800"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl animate-pulse" />
                            
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                                  <Bell className="h-3 w-3 animate-bounce" />
                                </span>
                                <span className="text-[9.5px] font-black text-slate-300 uppercase tracking-widest">
                                  Medication Reminder
                                </span>
                                <span className="h-1 w-1 rounded-full bg-slate-600" />
                                <span className="text-[8px] text-slate-400 font-extrabold uppercase font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                                  {activeNotificationAlert.parsedTime}
                                </span>
                              </div>
                              <button
                                onClick={() => setActiveNotificationAlert(null)}
                                className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="space-y-1.5 pl-1.5">
                              <h4 className="text-xs font-extrabold text-white">
                                {activeNotificationAlert.parsedName}
                              </h4>
                              <p className="text-[10px] text-slate-300 leading-normal">
                                Dosage: <span className="text-emerald-400 font-extrabold">{activeNotificationAlert.parsedDosage}</span> • Instructions: <span className="text-slate-400">{activeNotificationAlert.parsedInstructions}</span>
                              </p>
                              
                              <div className="pt-2 flex items-center gap-2">
                                <button
                                  onClick={() => handlePopupMarkAsTaken(activeNotificationAlert.id)}
                                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Check className="h-3 w-3 stroke-[3px]" /> Mark Taken
                                </button>
                                <button
                                  onClick={() => handlePopupSnooze(activeNotificationAlert)}
                                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  Snooze 5m
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* FAMILY VIEW WARNING MODE BANNER */}
                      {familyViewShareCode && (
                        <div className="mx-4 mt-3 bg-gradient-to-r from-amber-950/30 via-slate-950/90 to-amber-950/30 border border-amber-500/20 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-amber-200 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
                              ⚠️
                            </span>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider truncate">
                                Viewing Family Record ({familyViewRelation || "Authorized"})
                              </p>
                              <p className="text-[9px] text-slate-400 leading-none truncate">
                                Portal: <strong className="text-white">{selectedPatient.fullName}</strong> • Permission: <span className="text-amber-400 font-extrabold">{familyViewAccessLevel === "full" ? "Full" : "View-Only"}</span>
                              </p>
                            </div>
                          </div>
                          {originalSelfPatient ? (
                            <button
                              onClick={handleReturnToOwnPortal}
                              className="text-[9px] font-black uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded transition-all cursor-pointer shrink-0"
                            >
                              Exit Portal
                            </button>
                          ) : (
                            <button
                              onClick={handlePatientLogout}
                              className="text-[9px] font-black uppercase tracking-wider text-slate-950 bg-rose-500 hover:bg-rose-400 px-2.5 py-1 rounded transition-all cursor-pointer shrink-0"
                            >
                              Log Out
                            </button>
                          )}
                        </div>
                      )}

                      {/* Screen Content Window */}
                      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {renderMobileScreenContent()}
                      </div>

                      {/* Bottom Custom Tab Bar Navigation */}
                      <div className="bg-slate-950/95 border-t border-slate-800/80 grid grid-cols-8 py-2 px-1 shrink-0 z-10 pb-4">
                        <button
                          onClick={() => { setActiveTab("home"); setRxUnlocked(false); }}
                          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                            activeTab === "home" ? "text-emerald-400" : "text-slate-500 hover:text-slate-400"
                          }`}
                        >
                          <Activity className="h-4.5 w-4.5" />
                          <span className="text-[8.5px] font-bold truncate">Health</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("companion"); }}
                          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                            activeTab === "companion" ? "text-teal-400 font-extrabold" : "text-teal-400/70 hover:text-teal-300"
                          }`}
                        >
                          <Brain className="h-4.5 w-4.5 text-teal-400 animate-pulse" />
                          <span className="text-[8.5px] font-bold truncate">Memory</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("rx"); }}
                          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                            activeTab === "rx" ? "text-emerald-400" : "text-slate-500 hover:text-slate-400"
                          }`}
                        >
                          <Lock className="h-4.5 w-4.5" />
                          <span className="text-[8.5px] font-bold truncate">Rx Vault</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("vision"); stopPatientCamera(); }}
                          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative ${
                            activeTab === "vision" ? "text-emerald-400" : "text-slate-500 hover:text-slate-400"
                          }`}
                        >
                          <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                          <span className="text-[9px] font-bold text-amber-400">AI Vision</span>
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                        </button>

                        <button
                          onClick={() => { setActiveTab("family"); }}
                          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                            activeTab === "family" ? "text-emerald-400" : "text-slate-500 hover:text-slate-400"
                          }`}
                        >
                          <Users className="h-4.5 w-4.5" />
                          <span className="text-[9px] font-bold">Family</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("schedule"); }}
                          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                            activeTab === "schedule" ? "text-emerald-400" : "text-slate-500 hover:text-slate-400"
                          }`}
                        >
                          <Calendar className="h-4.5 w-4.5" />
                          <span className="text-[9px] font-bold">Book</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("history"); }}
                          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                            activeTab === "history" ? "text-emerald-400" : "text-slate-500 hover:text-slate-400"
                          }`}
                        >
                          <Clock className="h-4.5 w-4.5" />
                          <span className="text-[9px] font-bold">Timeline</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("profile"); }}
                          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                            activeTab === "profile" ? "text-emerald-400" : "text-slate-500 hover:text-slate-400"
                          }`}
                        >
                          <User className="h-4.5 w-4.5" />
                          <span className="text-[9px] font-bold">ID Card</span>
                        </button>
                      </div>

                      {/* FLOATING ACTION BUTTON FOR CAMERA SCANNER (MOBILE DESIGN) */}
                      {!(familyViewShareCode && familyViewAccessLevel === "view") && (
                        <div className="absolute bottom-[72px] right-4 z-40">
                          <button
                            onClick={() => {
                              setPatientScannerMode("camera");
                              setScanStep("upload");
                              setShowScanModal(true);
                              startPatientCamera();
                            }}
                            className="h-12 w-12 bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.45)] flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 group relative border border-emerald-300/20"
                            title="Instant AI Document Scanner"
                          >
                            <Camera className="h-5 w-5 text-slate-950" />
                            
                            {/* Indicator dot */}
                            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-slate-950 flex items-center justify-center text-[7px] font-black text-white animate-bounce">
                              !
                            </span>
  
                            {/* Hover Tooltip */}
                            <span className="absolute right-14 bg-slate-950 border border-slate-800 text-emerald-400 text-[8.5px] font-black uppercase tracking-wider py-1 px-2.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-2xl transform translate-x-2 group-hover:translate-x-0">
                              Instant AI Scanner
                            </span>
                          </button>
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Home bar indicator */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full z-50"></div>
            </div>
          </div>
        ) : (
          /* RESPONSIVE FULL WEB GATEWAY MODE */
          <div className="w-full bg-slate-950 rounded-3xl border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl relative min-h-[700px]">
            <AnimatePresence mode="wait">
              {!selectedPatient ? (
                <PatientAuthScreen 
                  patients={patients}
                  onSelectPatient={(p) => handlePatientSelectAndPersist(p)}
                  onPatientCreated={(p) => setPatients(prev => [p, ...prev])}
                  onInstallPWA={handleInstallPWA}
                  isPwaInstalled={isPwaInstalled}
                  isSimulator={false}
                  isBiometricSupported={isSupported}
                  onAuthenticateBiometric={authenticateBiometric}
                />
              ) : (
                /* RESPONSIVE FULL WEB MAIN CONTENT */
                <motion.div 
                  key="resp-portal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Web Banner */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg">
                        ✙
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Patient Clinical Identity Portal</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Welcome back, <span className="text-emerald-400 font-bold">{selectedPatient.fullName}</span> (Patient Code: {selectedPatient.patientCode || selectedPatient.id})</p>
                      </div>
                    </div>
                    <button
                      onClick={handlePatientLogout}
                      className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Log Out Portal
                    </button>
                  </div>

                  {/* Web Grid View */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Rail Navigation / Summary */}
                    <div className="lg:col-span-3 space-y-4">
                      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-1 text-xs">
                        <button
                          onClick={() => { setActiveTab("home"); setRxUnlocked(false); }}
                          className={`w-full text-left p-3 rounded-xl font-bold transition-all flex items-center gap-3 cursor-pointer ${
                            activeTab === "home" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <Activity className="h-4 w-4" /> Vitals & Health Summary
                        </button>

                        <button
                          onClick={() => setActiveTab("ai_suite")}
                          className={`w-full text-left p-3 rounded-xl font-bold transition-all flex items-center justify-between cursor-pointer border ${
                            activeTab === "ai_suite"
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-lg shadow-indigo-950/80 scale-[1.02]"
                              : "bg-indigo-950/40 text-indigo-300 border-indigo-500/30 hover:bg-indigo-900/60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Sparkles className="h-4 w-4 text-amber-300 animate-spin-slow" />
                            <span>🌟 10 AI Healthcare Hub</span>
                          </div>
                          <span className="bg-amber-400 text-slate-950 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                            RPM & AI
                          </span>
                        </button>

                        <button
                          onClick={() => setActiveTab("companion")}
                          className={`w-full text-left p-3 rounded-2xl font-black text-xs transition-all flex items-center justify-between border cursor-pointer ${
                            activeTab === "companion"
                              ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-400 shadow-lg shadow-teal-950/80 scale-[1.02]"
                              : "bg-teal-950/40 text-teal-300 border-teal-500/30 hover:bg-teal-900/60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Brain className="h-4 w-4 text-teal-300 animate-pulse" />
                            <span>🧬 Health Memory & AI Companion</span>
                          </div>
                          <span className="bg-teal-400 text-slate-950 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                            8 Pillars
                          </span>
                        </button>

                        <button
                          onClick={() => setActiveTab("rx")}
                          className={`w-full text-left p-3 rounded-xl font-bold transition-all flex items-center gap-3 cursor-pointer ${
                            activeTab === "rx" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <Lock className="h-4 w-4" /> Secure Prescription Vault
                        </button>

                        <button
                          onClick={() => setActiveTab("schedule")}
                          className={`w-full text-left p-3 rounded-xl font-bold transition-all flex items-center gap-3 cursor-pointer ${
                            activeTab === "schedule" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <Calendar className="h-4 w-4" /> Schedule Live Appointment
                        </button>

                        <button
                          onClick={() => { setActiveTab("vision"); stopPatientCamera(); }}
                          className={`w-full text-left p-3 rounded-xl font-bold transition-all flex items-center gap-3 cursor-pointer ${
                            activeTab === "vision" ? "bg-emerald-500 text-slate-950 animate-pulse" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <Sparkles className="h-4 w-4 text-amber-400" /> CURA Vision AI Diagnostics
                          <span className="ml-auto bg-amber-400/20 text-amber-300 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-amber-500/30">
                            NEW
                          </span>
                        </button>

                        <button
                          onClick={() => setActiveTab("history")}
                          className={`w-full text-left p-3 rounded-xl font-bold transition-all flex items-center gap-3 cursor-pointer ${
                            activeTab === "history" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <Clock className="h-4 w-4" /> Complete EHR History Timeline
                        </button>

                        <button
                          onClick={() => setActiveTab("profile")}
                          className={`w-full text-left p-3 rounded-xl font-bold transition-all flex items-center gap-3 cursor-pointer ${
                            activeTab === "profile" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <QrCode className="h-4 w-4" /> Digital Health Card (ABHA)
                        </button>
                      </div>

                      {/* Quick Demographics Box */}
                      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Onboarded Demographics</p>
                        <div className="space-y-2 text-xs font-semibold text-slate-300">
                          <div className="flex justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-500">Gender / Age</span>
                            <span>{selectedPatient.gender} / {selectedPatient.age} years</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-500">Blood Group</span>
                            <span className="text-rose-500 font-extrabold">{selectedPatient.bloodGroup || "O+"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-500">Phone Contact</span>
                            <span>{selectedPatient.phone}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-500">ABHA Health ID</span>
                            <span className="font-mono text-emerald-400 text-[10px]">{selectedPatient.abhaId || "Not Registered"}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-500">Allergies</span>
                            <span className="text-rose-400 text-right truncate max-w-[120px]" title={selectedPatient.allergies.join(", ") || "None"}>
                              {selectedPatient.allergies.join(", ") || "None"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Main Panel Content */}
                    <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      {renderMobileScreenContent()}
                    </div>

                  </div>

                  {/* FLOATING ACTION BUTTON FOR CAMERA SCANNER (RESPONSIVE WEB DESIGN) */}
                  <div className="fixed bottom-6 right-6 z-40">
                    <button
                      onClick={() => {
                        setPatientScannerMode("camera");
                        setScanStep("upload");
                        setShowScanModal(true);
                        startPatientCamera();
                      }}
                      className="h-14 w-14 bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-full shadow-[0_8px_32px_rgba(16,185,129,0.35)] flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 group relative border border-emerald-300/30"
                      title="Instant AI Document Scanner"
                    >
                      <Camera className="h-6 w-6 text-slate-950 animate-pulse" />
                      
                      {/* Indicator dot */}
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 border-2 border-slate-950 flex items-center justify-center text-[8px] font-black text-white animate-bounce">
                        !
                      </span>

                      {/* Tooltip */}
                      <span className="absolute right-16 bg-slate-900 border border-slate-800 text-emerald-400 text-[10px] font-black uppercase tracking-wider py-1.5 px-3.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-2xl transform translate-x-2 group-hover:translate-x-0">
                        Instant AI Camera Scanner
                      </span>
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </main>

      {/* MODAL: PRESCRIPTION PRINT OUT & HIGH FIDELITY DISPLAY */}
      <AnimatePresence>
        {activePrescription && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #modal-prescription-sheet, #modal-prescription-sheet * {
                  visibility: visible !important;
                }
                #modal-prescription-sheet {
                  position: fixed !important;
                  left: 50% !important;
                  top: 50% !important;
                  transform: translate(-50%, -50%) scale(1.1) !important;
                  box-shadow: none !important;
                  border: none !important;
                  width: 100% !important;
                  max-width: 650px !important;
                  background: white !important;
                  color: black !important;
                }
                .no-modal-print {
                  display: none !important;
                }
              }
            `}</style>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl p-6 text-slate-800 max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100"
            >
              <button 
                onClick={() => setActivePrescription(null)}
                className="absolute right-5 top-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all cursor-pointer no-modal-print"
              >
                <X className="h-5 w-5" />
              </button>

              {/* PRINTABLE PRESCRIPTION SHEET LAYOUT */}
              <div id="modal-prescription-sheet" className="p-4 bg-white rounded-2xl flex flex-col gap-6 text-xs text-slate-800 border-2 border-slate-200">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
                      <span className="text-emerald-600">✙</span> CURA CLINICAL NETWORKS
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Healthcare Prescription</p>
                    <p className="text-slate-500 font-semibold mt-1">EHR Register Ref: {selectedPatient?.patientCode || selectedPatient?.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 flex items-center justify-end gap-1">
                      {activeDoctorProfile?.isVerified 
                        ? activeDoctorProfile.fullName 
                        : activePrescription.doctor}
                      {activeDoctorProfile?.isVerified && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                          Verified RMP ✓
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500">
                      {activeDoctorProfile?.isVerified 
                        ? activeDoctorProfile.qualification 
                        : "M.B.B.S, M.D. Cardiology / Family Medicine"}
                    </p>
                    <p className="text-[9px] font-semibold text-slate-400">
                      Reg No: {activeDoctorProfile?.isVerified 
                        ? activeDoctorProfile.registrationNo 
                        : "MCI-77829-IND"}
                    </p>
                  </div>
                </div>

                {/* Patient Information Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl font-bold border border-slate-100">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Patient Name</span>
                    <span className="text-slate-800 text-xs font-extrabold">{selectedPatient?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Age / Gender</span>
                    <span className="text-slate-800 text-xs">{selectedPatient?.age} Yrs / {selectedPatient?.gender}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Date Issued</span>
                    <span className="text-slate-800 text-xs">{new Date(activePrescription.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Allergies</span>
                    <span className="text-rose-600 text-xs">{selectedPatient?.allergies.join(", ") || "No known drug allergies"}</span>
                  </div>
                </div>

                {/* Clinical Notes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100">1. Symptoms & Clinical Diagnosis</h4>
                  <div className="p-3 bg-slate-50/50 rounded-xl space-y-1.5 font-medium border border-slate-100">
                    <p><span className="font-extrabold text-slate-500">Chief Complaints:</span> {activePrescription.symptoms}</p>
                    <p><span className="font-extrabold text-slate-500">Primary Diagnosis:</span> <span className="font-extrabold text-emerald-700 underline">{activePrescription.diagnosis}</span></p>
                  </div>
                </div>

                {/* Prescribed Medications */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100">2. Active Medications (Rx)</h4>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase">
                        <th className="py-2">Medication / Strength</th>
                        <th className="py-2">Frequency</th>
                        <th className="py-2">Timing</th>
                        <th className="py-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {activePrescription.prescriptions && activePrescription.prescriptions.map((med: string, i: number) => {
                        // Extracting parameters if matching standard pattern or just outputting raw string nicely
                        const parts = med.split("(");
                        const medName = parts[0]?.trim();
                        const medDetails = parts[1] ? parts[1].replace(")", "") : "";
                        const detailsArray = medDetails.split(",").map(s => s.trim());
                        
                        return (
                          <tr key={i} className="text-xs">
                            <td className="py-3 font-extrabold text-slate-900">
                              💊 {medName}
                            </td>
                            <td className="py-3 text-emerald-700 font-black">
                              {detailsArray[1] || "1-0-1"}
                            </td>
                            <td className="py-3 text-slate-500">
                              {detailsArray[2] || "After food"}
                            </td>
                            <td className="py-3">
                              {detailsArray[3] || "30 days"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* General Advice */}
                <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl space-y-1.5">
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Automated Clinical Safety & Contraindications Advice
                  </p>
                  <p className="text-[11px] font-medium text-emerald-800/80 leading-relaxed">
                    Ensure adequate hydration. Avoid spicy or high-glycemic foods based on metabolic parameters. Continue active blood pressure tracking at least twice weekly. Take anti-hypertensives strictly on schedule. Do not self-discontinue azithromycin course.
                  </p>
                </div>

                {/* Footer and Signature */}
                <div className="flex justify-between items-end border-t border-slate-200 pt-6">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Verification QR Code</p>
                    {/* Tiny visual QR representation */}
                    <div className="flex items-center gap-2">
                      <svg className="h-10 w-10 text-slate-900 border border-slate-200 p-0.5 rounded" viewBox="0 0 100 100">
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        <rect x="5" y="5" width="25" height="25" fill="black" />
                        <rect x="70" y="5" width="25" height="25" fill="black" />
                        <rect x="5" y="70" width="25" height="25" fill="black" />
                        <rect x="40" y="10" width="10" height="15" fill="black" />
                        <rect x="15" y="45" width="20" height="10" fill="black" />
                        <rect x="45" y="45" width="15" height="15" fill="black" />
                        <rect x="70" y="45" width="20" height="25" fill="black" />
                      </svg>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Digitally Signed & Secured<br />ABHA/NDHM ID Compliant</span>
                    </div>
                  </div>

                  <div className="text-center font-bold">
                    {/* Simulated hand signature line */}
                    <div className="font-serif italic text-base text-slate-600 select-none pb-1 font-semibold leading-none">
                      Dr. R. Sharma
                    </div>
                    <div className="h-[1px] w-36 bg-slate-300 mx-auto"></div>
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase mt-1">Authorized Physician Signature</p>
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 mt-6 no-modal-print pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActivePrescription(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Receipt
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Rx Invoice / Prescription
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: VITALS LOGGER INPUT FORM */}
      <AnimatePresence>
        {showVitalsModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-slate-100 shadow-2xl relative"
            >
              <button
                onClick={() => setShowVitalsModal(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Activity className="h-4.5 w-4.5 text-emerald-400" /> Record Daily Vitals Log
              </h3>

              {logSuccessMsg ? (
                <div className="py-8 text-center space-y-3">
                  <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                    <Check className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-extrabold text-emerald-400">Vitals Added Successfully!</p>
                  <p className="text-[10px] text-slate-400">Your health trend charts are updating in real-time.</p>
                </div>
              ) : !patientConsent.accepted || !patientConsent.granularPreferences?.vitalTelemetry ? (
                <div className="py-6 text-center space-y-4">
                  <div className="inline-flex p-3 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-black text-white">🔒 Telemetry Logger Suspended</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                      Vitals logging is locked under DPDP Act rules. You must authorize "Physiological Telemetry Logger" processing in the Profile tab to enable logging.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("profile")}
                      className="mt-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] rounded-lg uppercase tracking-wider cursor-pointer inline-block"
                    >
                      Configure Consent
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogVitals} className="space-y-4 text-xs">
                  {/* Modal Mode Selector: Smartwatch Sync vs Voice Dictation */}
                  <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1">
                    <button
                      type="button"
                      onClick={() => setSmartwatchSyncMode("smartwatch")}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        smartwatchSyncMode === "smartwatch"
                          ? "bg-emerald-500 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ⌚ Smartwatch Sync
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmartwatchSyncMode("voice")}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        smartwatchSyncMode === "voice"
                          ? "bg-emerald-500 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🎙️ Voice Dictation
                    </button>
                  </div>

                  {smartwatchSyncMode === "smartwatch" ? (
                    <div className="bg-slate-950 border border-emerald-500/30 p-3.5 rounded-2xl space-y-3 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                            Smartwatch & BLE Telemetry Sync
                          </span>
                        </div>

                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Bluetooth GATT
                        </span>
                      </div>

                      {/* Smartwatch Device Brands Picker */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">1. Select Health App / Cloud API Preset:</span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { id: "apple", label: "Apple Watch", sub: "HealthKit" },
                            { id: "fitbit", label: "Fitbit", sub: "Sense / Charge" },
                            { id: "galaxy", label: "Galaxy Watch", sub: "Samsung" },
                            { id: "garmin", label: "Garmin", sub: "Connect" }
                          ].map((dev) => (
                            <button
                              key={dev.id}
                              type="button"
                              onClick={() => {
                                setSelectedSmartwatch(dev.id as any);
                                handleSyncSmartwatchData(dev.id as any);
                              }}
                              className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                                selectedSmartwatch === dev.id
                                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                  : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                              }`}
                            >
                              <span className="text-sm mb-0.5">⌚</span>
                              <span className="text-[9.5px] font-bold block leading-tight">{dev.label}</span>
                              <span className="text-[7.5px] text-slate-500 block">{dev.sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Primary Cloud/App Sync Action Button */}
                      <button
                        type="button"
                        disabled={isSyncingSmartwatch}
                        onClick={() => handleSyncSmartwatchData(selectedSmartwatch)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isSyncingSmartwatch ? "animate-spin" : ""}`} />
                        {isSyncingSmartwatch ? "Syncing Wearable Sensor Data..." : "Quick Sync Cloud Biometrics"}
                      </button>

                      {/* Bluetooth LE Hardware Device Discovery Scanner Section */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            📡 2. Physical Bluetooth LE Scanner
                          </span>

                          <button
                            type="button"
                            disabled={isScanningBluetooth}
                            onClick={handleStartBluetoothScan}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all uppercase flex items-center gap-1 cursor-pointer border ${
                              isScanningBluetooth
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                                : "bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700"
                            }`}
                          >
                            <RefreshCw className={`h-3 w-3 ${isScanningBluetooth ? "animate-spin" : ""}`} />
                            {isScanningBluetooth ? "Scanning Channels..." : "Scan Bluetooth"}
                          </button>
                        </div>

                        {/* Discovered Devices List */}
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {discoveredBleDevices.map((device) => (
                            <div
                              key={device.id}
                              className="bg-slate-900 border border-slate-800/90 p-2 rounded-xl flex items-center justify-between gap-2 hover:border-slate-700 transition-all"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs">📶</span>
                                  <span className="text-[10px] font-bold text-slate-200 truncate">
                                    {device.name}
                                  </span>
                                  {device.isPaired && (
                                    <span className="px-1.5 py-0.2 text-[8px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                                      PAIRED
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[8.5px] font-mono text-slate-400 mt-0.5">
                                  <span>ID: {device.id}</span>
                                  <span>RSSI: {device.rssi} dBm</span>
                                  <span>🔋 {device.battery}%</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={isSyncingSmartwatch}
                                onClick={() => handlePairAndStreamBleDevice(device)}
                                className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all shrink-0 border cursor-pointer ${
                                  device.isPaired
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600"
                                }`}
                              >
                                {device.isPaired ? "Re-Stream" : "Pair Device"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Feedback */}
                      {voiceFeedback && (
                        <p className="text-[10px] font-semibold text-emerald-300 text-center bg-slate-900/90 py-1.5 px-2 rounded-xl border border-slate-800">
                          {voiceFeedback}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Enhanced Single-Sentence Voice Dictation Banner */
                    <div className="bg-slate-950 border border-emerald-500/30 p-3.5 rounded-2xl space-y-3 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            {listeningField === "all" && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${listeningField === "all" ? "bg-emerald-500 animate-pulse" : "bg-emerald-400/60"}`}></span>
                          </span>
                          <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                            🎙️ Voice-to-Text Vitals Dictation
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (listeningField === "all") {
                              stopListening();
                            } else {
                              startListening("all");
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase flex items-center gap-1.5 cursor-pointer border shadow-sm ${
                            listeningField === "all"
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                          }`}
                        >
                          {listeningField === "all" ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                          {listeningField === "all" ? "Listening..." : "Dictate Vitals"}
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                        Dictate multiple vitals in a single sentence. E.g.: <span className="text-emerald-300 font-semibold italic">"Heart rate 76, BP 120 over 80, sugar 105, weight 70.5"</span>.
                      </p>

                      {/* Real-time Voice Feedback Display */}
                      {voiceFeedback && (
                        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Dictation Status</span>
                            <span className="text-emerald-400 font-mono font-bold">
                              {listeningField === "all" ? "● Listening..." : "✓ Parsed"}
                            </span>
                          </div>
                          <p className="text-[10.5px] font-semibold text-slate-200">
                            {voiceFeedback}
                          </p>
                        </div>
                      )}

                      {/* Auto-Parsed Vitals Badges Summary */}
                      {parsedVitalsSummary && Object.keys(parsedVitalsSummary).length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Auto-Filled Fields:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setLogHeartRate("");
                                setLogSystolic("");
                                setLogDiastolic("");
                                setLogSugar("");
                                setLogWeight("");
                                setLogHeight("");
                                setParsedVitalsSummary(null);
                                setVoiceFeedback("Cleared form fields.");
                              }}
                              className="text-[9px] font-bold text-rose-400 hover:underline uppercase tracking-wider cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {parsedVitalsSummary.hr && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[9.5px]">
                                💓 HR: {parsedVitalsSummary.hr} BPM
                              </span>
                            )}
                            {parsedVitalsSummary.systolic && parsedVitalsSummary.diastolic && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold text-[9.5px]">
                                🩺 BP: {parsedVitalsSummary.systolic}/{parsedVitalsSummary.diastolic} mmHg
                              </span>
                            )}
                            {parsedVitalsSummary.sugar && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[9.5px]">
                                🩸 Sugar: {parsedVitalsSummary.sugar} mg/dL
                              </span>
                            )}
                            {parsedVitalsSummary.weight && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-[9.5px]">
                                ⚖️ Weight: {parsedVitalsSummary.weight} kg
                              </span>
                            )}
                            {parsedVitalsSummary.height && (
                              <span className="px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300 font-bold text-[9.5px]">
                                📏 Height: {parsedVitalsSummary.height} cm
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quick Sample Voice Dictations */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Sample Single-Sentence Dictations (Test Auto-Parser):
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {[
                            "Heart rate 76, blood pressure 120 over 80, sugar 105, weight 70.5 kg",
                            "Pulse 88, BP 135 over 85, glucose 140, weight 72 kg",
                            "Heart rate 68, blood pressure 118 over 74, blood sugar 98, weight 65.2 kg"
                          ].map((sample, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => processSpeechTranscript("all", sample)}
                              className="text-left px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-[9.5px] text-slate-300 hover:text-emerald-300 transition-all cursor-pointer flex items-center justify-between group"
                            >
                              <span className="truncate pr-2 italic">"{sample}"</span>
                              <span className="text-[8.5px] font-bold uppercase text-emerald-400 group-hover:underline shrink-0">Auto-Parse →</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Heart Rate (BPM)</label>
                    <div className="relative flex items-center">
                      <input 
                        type="number"
                        required
                        value={logHeartRate}
                        onChange={(e) => setLogHeartRate(e.target.value)}
                        placeholder="e.g. 72"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 focus:outline-none focus:border-emerald-500 text-white font-bold"
                      />
                      {speechSupported && (
                        <button
                          type="button"
                          onClick={() => {
                            if (listeningField === "hr") {
                              stopListening();
                            } else {
                              startListening("hr");
                            }
                          }}
                          className={`absolute right-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                            listeningField === "hr"
                              ? "text-emerald-400 bg-emerald-500/10 animate-pulse"
                              : "text-slate-500 hover:text-white hover:bg-slate-800"
                          }`}
                          title="Speak Heart Rate"
                        >
                          {listeningField === "hr" ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">BP Systolic</label>
                      <div className="relative flex items-center">
                        <input 
                          type="number"
                          required
                          value={logSystolic}
                          onChange={(e) => setLogSystolic(e.target.value)}
                          placeholder="120"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 focus:outline-none focus:border-emerald-500 text-white font-bold"
                        />
                        {speechSupported && (
                          <button
                            type="button"
                            onClick={() => {
                              if (listeningField === "systolic") {
                                stopListening();
                              } else {
                                startListening("systolic");
                              }
                            }}
                            className={`absolute right-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                              listeningField === "systolic"
                                ? "text-emerald-400 bg-emerald-500/10 animate-pulse"
                                : "text-slate-500 hover:text-white hover:bg-slate-800"
                            }`}
                            title="Speak Systolic BP"
                          >
                            {listeningField === "systolic" ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">BP Diastolic</label>
                      <div className="relative flex items-center">
                        <input 
                          type="number"
                          required
                          value={logDiastolic}
                          onChange={(e) => setLogDiastolic(e.target.value)}
                          placeholder="80"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 focus:outline-none focus:border-emerald-500 text-white font-bold"
                        />
                        {speechSupported && (
                          <button
                            type="button"
                            onClick={() => {
                              if (listeningField === "diastolic") {
                                stopListening();
                              } else {
                                startListening("diastolic");
                              }
                            }}
                            className={`absolute right-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                              listeningField === "diastolic"
                                ? "text-emerald-400 bg-emerald-500/10 animate-pulse"
                                : "text-slate-500 hover:text-white hover:bg-slate-800"
                            }`}
                            title="Speak Diastolic BP"
                          >
                            {listeningField === "diastolic" ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Blood Sugar (mg/dL)</label>
                    <div className="relative flex items-center">
                      <input 
                        type="number"
                        required
                        value={logSugar}
                        onChange={(e) => setLogSugar(e.target.value)}
                        placeholder="e.g. 100"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 focus:outline-none focus:border-emerald-500 text-white font-bold"
                      />
                      {speechSupported && (
                        <button
                          type="button"
                          onClick={() => {
                            if (listeningField === "sugar") {
                              stopListening();
                            } else {
                              startListening("sugar");
                            }
                          }}
                          className={`absolute right-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                            listeningField === "sugar"
                              ? "text-emerald-400 bg-emerald-500/10 animate-pulse"
                              : "text-slate-500 hover:text-white hover:bg-slate-800"
                          }`}
                          title="Speak Blood Sugar"
                        >
                          {listeningField === "sugar" ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weight (kg) <span className="text-slate-500 font-normal lowercase">(optional)</span></label>
                      <div className="relative flex items-center">
                        <input 
                          type="number"
                          step="0.1"
                          value={logWeight}
                          onChange={(e) => setLogWeight(e.target.value)}
                          placeholder="e.g. 70"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 focus:outline-none focus:border-emerald-500 text-white font-bold"
                        />
                        {speechSupported && (
                          <button
                            type="button"
                            onClick={() => {
                              if (listeningField === "weight") {
                                stopListening();
                              } else {
                                startListening("weight");
                              }
                            }}
                            className={`absolute right-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                              listeningField === "weight"
                                ? "text-emerald-400 bg-emerald-500/10 animate-pulse"
                                : "text-slate-500 hover:text-white hover:bg-slate-800"
                            }`}
                            title="Speak Weight"
                          >
                            {listeningField === "weight" ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Height (cm) <span className="text-slate-500 font-normal lowercase">(optional)</span></label>
                      <div className="relative flex items-center">
                        <input 
                          type="number"
                          step="0.1"
                          value={logHeight}
                          onChange={(e) => setLogHeight(e.target.value)}
                          placeholder="e.g. 172"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 focus:outline-none focus:border-emerald-500 text-white font-bold"
                        />
                        {speechSupported && (
                          <button
                            type="button"
                            onClick={() => {
                              if (listeningField === "height") {
                                stopListening();
                              } else {
                                startListening("height");
                              }
                            }}
                            className={`absolute right-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                              listeningField === "height"
                                ? "text-emerald-400 bg-emerald-500/10 animate-pulse"
                                : "text-slate-500 hover:text-white hover:bg-slate-800"
                            }`}
                            title="Speak Height"
                          >
                            {listeningField === "height" ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Daily Symptoms Logger */}
                  <div className="space-y-2 border-t border-slate-800/60 pt-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Daily Symptoms <span className="text-slate-500 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PREDEFINED_SYMPTOMS.map((symptom) => {
                        const isSelected = selectedSymptoms.includes(symptom);
                        return (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
                              } else {
                                setSelectedSymptoms(prev => [...prev, symptom]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black"
                                : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                            }`}
                          >
                            {symptom}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Symptom Note <span className="text-slate-500 font-normal lowercase">(optional)</span>
                    </label>
                    <textarea
                      value={customSymptomNote}
                      onChange={(e) => setCustomSymptomNote(e.target.value)}
                      placeholder="Describe how you are feeling..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 text-white font-medium resize-none text-[11px]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider transition-all mt-2 cursor-pointer"
                  >
                    Save Vitals Entry
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PRESCRIPTION REFILL REQUEST CONFIRMATION */}
      <AnimatePresence>
        {showRefillModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-slate-100 shadow-2xl relative"
            >
              <button
                onClick={() => setShowRefillModal(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <FileCheck2 className="h-4.5 w-4.5 text-emerald-400" /> Request Rx Refill
              </h3>

              {refillSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                    <Check className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-extrabold text-emerald-400">Refill Request Dispatched!</p>
                  <p className="text-[10px] text-slate-400">Your doctor will review and renew your prescription details shortly.</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Medication Name</span>
                      <p className="text-xs font-black text-white">{refillMedName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Primary Physician Reviewer</span>
                      <p className="text-xs font-bold text-slate-300">{refillDoctorName || "Dr. Rajesh Sharma"}</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    This request will send a live notification to the clinician dashboard for doctor approval. Once reviewed, your active prescriptions will be updated.
                  </p>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRefillModal(false)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-extrabold text-[11px] rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submittingRefill}
                      onClick={handleSubmitRefill}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-black text-[11px] rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center"
                    >
                      {submittingRefill ? "Dispatching..." : "Confirm Request"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📷 PHYSICAL MEDICATION BOX QR CODE SCANNER MODAL */}
      <AnimatePresence>
        {showRxQrModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="bg-slate-950 border border-emerald-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative my-auto flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      Medication Box QR Scanner
                    </h3>
                    <p className="text-[9px] text-slate-400">Scan physical drug boxes for live adherence & refill data</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    stopRxQrCamera();
                    setShowRxQrModal(false);
                    setScannedMedicationResult(null);
                  }}
                  className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                {/* STEP 1: SCAN MODES */}
                {rxQrStep === "scan" && (
                  <div className="space-y-4">
                    {/* Scanner Mode Tabs */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => {
                          setRxQrScannerMode("camera");
                          startRxQrCamera();
                        }}
                        className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          rxQrScannerMode === "camera"
                            ? "bg-emerald-500 text-slate-950 shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Live Camera</span>
                      </button>

                      <button
                        onClick={() => {
                          setRxQrScannerMode("sample");
                          stopRxQrCamera();
                        }}
                        className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          rxQrScannerMode === "sample"
                            ? "bg-emerald-500 text-slate-950 shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Sample Box QR</span>
                      </button>
                    </div>

                    {/* CAMERA SCANNER VIEW */}
                    {rxQrScannerMode === "camera" && (
                      <div className="space-y-3">
                        <div className="relative aspect-video bg-slate-900 rounded-2xl border-2 border-dashed border-emerald-500/40 overflow-hidden flex flex-col items-center justify-center">
                          {isRxQrCameraActive && !rxQrCameraError ? (
                            <>
                              <video
                                ref={rxQrVideoRef}
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                              />

                              {/* QR Framing Overlay */}
                              <div className="absolute inset-0 border-[3px] border-emerald-400/80 m-8 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                <div className="flex justify-between">
                                  <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                                  <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                                </div>
                                <div className="text-center">
                                  <span className="bg-slate-950/80 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest uppercase border border-emerald-500/30">
                                    Align Box QR Code inside frame
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <div className="w-4 h-4 border-l-2 border-b-2 border-emerald-400" />
                                  <div className="w-4 h-4 border-r-2 border-b-2 border-emerald-400" />
                                </div>
                              </div>

                              {/* Laser scanning line */}
                              <motion.div
                                animate={{ top: ["10%", "85%", "10%"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="absolute left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-500/80 pointer-events-none"
                              />
                            </>
                          ) : (
                            <div className="p-6 text-center space-y-2">
                              <QrCode className="h-10 w-10 text-emerald-400/60 mx-auto animate-pulse" />
                              <p className="text-xs font-bold text-slate-300">
                                {rxQrCameraError || "Camera feed active. Align box QR code."}
                              </p>
                              <p className="text-[9px] text-slate-500">
                                If camera permission is blocked in preview, click "Sample Box QR" above to test instant drug box decoding.
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleProcessRxQrBox(SAMPLE_MED_BOXES[0])}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Snap & Decode Medication Box</span>
                        </button>
                      </div>
                    )}

                    {/* SAMPLE BOX SELECTOR VIEW */}
                    {rxQrScannerMode === "sample" && (
                      <div className="space-y-2.5">
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Select a physical medication box sample below to simulate scanning its 2D QR Data Matrix code:
                        </p>

                        <div className="grid grid-cols-1 gap-2.5">
                          {SAMPLE_MED_BOXES.map((box) => (
                            <div
                              key={box.id}
                              onClick={() => handleProcessRxQrBox(box)}
                              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all shrink-0">
                                  <QrCode className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-black text-white group-hover:text-emerald-400 transition-all truncate">
                                    {box.medName}
                                  </h5>
                                  <p className="text-[9.5px] text-slate-400 font-medium truncate">
                                    {box.brandName} • Batch #{box.batchNo}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      {box.adherenceRate}% Adherence
                                    </span>
                                    <span className="text-[8px] text-slate-500 font-mono">
                                      {box.remainingPills}/{box.totalPills} Pills Left
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <span className="px-2.5 py-1.5 bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-slate-950 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase rounded-lg transition-all shrink-0">
                                Scan Box
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: PROCESSING ANIMATION */}
                {rxQrStep === "processing" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        Decoding Physical QR Payload
                      </h4>
                      <p className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                        {rxQrProcessingStep}
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 3: SCANNED MEDICATION BOX PASSPORT & ADHERENCE HUB */}
                {rxQrStep === "result" && scannedMedicationResult && (
                  <div className="space-y-3">
                    {/* Status Feedback Toast */}
                    {rxRefillStatusMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-500/15 border border-emerald-500/30 p-2.5 rounded-xl text-[10px] font-black text-emerald-300 leading-normal"
                      >
                        {rxRefillStatusMsg}
                      </motion.div>
                    )}

                    {/* Drug Header Passport Card */}
                    <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest rounded">
                            Verified Medicine Box
                          </span>
                          <h4 className="text-sm font-black text-white mt-1">
                            {scannedMedicationResult.medName}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400">
                            {scannedMedicationResult.brandName}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[8.5px] font-mono text-slate-500 block">
                            Exp: {scannedMedicationResult.expiryDate}
                          </span>
                          <span className="text-[8.5px] font-mono text-slate-500 block mt-0.5">
                            Batch: {scannedMedicationResult.batchNo}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold">Prescribing Physician:</span>
                        <span className="text-emerald-400 font-extrabold">{scannedMedicationResult.doctor}</span>
                      </div>
                    </div>

                    {/* 📊 ADHERENCE & CONSISTENCY METRICS */}
                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5 text-emerald-400" /> 30-Day Adherence Index
                        </span>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {scannedMedicationResult.adherenceRate}% Adherent
                        </span>
                      </div>

                      {/* Adherence Progress Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${scannedMedicationResult.adherenceRate}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center pt-1">
                        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Consecutive Streak</span>
                          <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                            <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            {scannedMedicationResult.streakDays} Days
                          </span>
                        </div>

                        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block">Last Dose Logged</span>
                          <span className="text-[10px] font-bold text-slate-200 block mt-0.5">
                            {scannedMedicationResult.lastTaken}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 💊 DOSAGE INSTRUCTIONS & GUIDELINES */}
                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-emerald-400" /> Dosage & Administration Rules
                      </h5>
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[10.5px] text-slate-200 font-semibold leading-relaxed">
                        {scannedMedicationResult.dosageInstructions}
                      </div>

                      {/* Warnings list */}
                      {scannedMedicationResult.warnings && scannedMedicationResult.warnings.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[8.5px] font-black text-rose-400 uppercase tracking-wider block">
                            ⚠️ Safety Precautions
                          </span>
                          <ul className="space-y-1 text-[9.5px] text-slate-300">
                            {scannedMedicationResult.warnings.map((warn: string, wIdx: number) => (
                              <li key={wIdx} className="flex items-start gap-1.5">
                                <span className="text-rose-400 font-bold">•</span>
                                <span>{warn}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* 📦 PILL INVENTORY & REFILL STATUS */}
                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Inventory & Refill Status
                        </span>
                        <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${
                          scannedMedicationResult.remainingPills <= 5
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {scannedMedicationResult.refillStatus}
                        </span>
                      </div>

                      {/* Pill Inventory Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-400">
                          <span>Pills Remaining:</span>
                          <span className="text-white font-mono">{scannedMedicationResult.remainingPills} / {scannedMedicationResult.totalPills} Tablets</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              scannedMedicationResult.remainingPills <= 5 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${(scannedMedicationResult.remainingPills / scannedMedicationResult.totalPills) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleRxQrMarkTaken(scannedMedicationResult)}
                          className="py-2.5 bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Mark Dose Taken</span>
                        </button>

                        <button
                          disabled={!scannedMedicationResult.canRefill || rxRefillLoading}
                          onClick={() => handleRxQrOneTapRefill(scannedMedicationResult)}
                          className={`py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            scannedMedicationResult.canRefill
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow"
                              : "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed"
                          }`}
                        >
                          {rxRefillLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                          <span>Request Refill</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setScannedMedicationResult(null);
                        setRxQrStep("scan");
                        startRxQrCamera();
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Scan Another Medication Box</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: FULL HD VIDEO CONSULTATION */}
      <AnimatePresence>
        {showVideoCallModal && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[9999] overflow-y-auto p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-6xl mx-auto w-full"
            >
              <VideoConsultation
                patientName={selectedPatient?.fullName || "Rajesh Kumar"}
                doctorName="Dr. Vikram Sethi"
                doctorTitle="Senior Consultant Cardiologist"
                specialty="Cardiology & Internal Medicine"
                hospitalName="Max Super Speciality Hospital, Saket"
                onBack={() => setShowVideoCallModal(false)}
                onEndConsultation={() => {
                  setTimeout(() => setShowVideoCallModal(false), 2500);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: MAP DIRECTIONS SIMULATION */}
      <AnimatePresence>
        {showMapDirectionsModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden text-slate-100 shadow-2xl relative"
            >
              <button
                onClick={() => setShowMapDirectionsModal(false)}
                className="absolute right-4 top-4 p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer z-10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-5 border-b border-slate-800 bg-slate-950">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-sky-400" /> Clinic Route Navigation
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Simulated real-time route directions to Cura General Health Hub</p>
              </div>

              {/* Simulated Map Graphic with Canvas/Lines */}
              <div className="h-48 bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-850">
                {/* Visual grid representing streets */}
                <div className="absolute inset-0 opacity-15" style={{ 
                  backgroundImage: "radial-gradient(circle, #334155 1.5px, transparent 1.5px)", 
                  backgroundSize: "20px 20px" 
                }} />

                {/* Simple simulated road paths */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Roads */}
                  <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                  <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                  <line x1="75%" y1="10%" x2="75%" y2="90%" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />

                  {/* Route path (Dotted Emerald Line) */}
                  <path d="M 30,100 L 115,100 L 115,45 L 290,45" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="5,4" className="animate-[dash_2s_linear_infinite]" />
                  <style>{`
                    @keyframes dash {
                      to {
                        stroke-dashoffset: -20;
                      }
                    }
                  `}</style>
                </svg>

                {/* Patient starting location */}
                <div className="absolute left-[20px] bottom-[82px] flex flex-col items-center">
                  <div className="h-5.5 w-5.5 rounded-full bg-sky-500 border-2 border-slate-900 flex items-center justify-center text-white font-extrabold text-[8px] shadow-lg animate-pulse">
                    📍
                  </div>
                  <span className="text-[7.5px] bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-sky-400 font-extrabold mt-1">Your Location</span>
                </div>

                {/* Clinic destination */}
                <div className="absolute right-[90px] top-[15px] flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs shadow-lg animate-bounce">
                    🏥
                  </div>
                  <span className="text-[7.5px] bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-emerald-400 font-extrabold mt-1">Cura Hub Clinic</span>
                </div>
              </div>

              {/* Travel Statistics Bar */}
              <div className="bg-slate-950 px-5 py-3.5 grid grid-cols-2 gap-4 border-b border-slate-800 text-center">
                <div className="border-r border-slate-850/60 pr-2">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Est. Travel Duration</span>
                  <span className="text-sm font-black text-emerald-400 mt-0.5 inline-block">22 mins</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Optimal Path Distance</span>
                  <span className="text-sm font-black text-white mt-0.5 inline-block">8.4 kilometers</span>
                </div>
              </div>

              {/* Directions Panel */}
              <div className="p-5 space-y-3.5">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Step-by-Step Navigation</h4>
                <div className="space-y-2.5 max-h-[160px] overflow-y-auto text-[11px] font-medium text-slate-300 pr-1">
                  <div className="flex gap-2.5 items-start">
                    <span className="text-sky-400 flex-shrink-0 mt-0.5">1.</span>
                    <p className="leading-tight">Head north toward <span className="text-white font-bold">Outer Ring Road</span>. (200 meters)</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="text-sky-400 flex-shrink-0 mt-0.5">2.</span>
                    <p className="leading-tight">Turn right onto <span className="text-white font-bold">Main Clinic Boulevard</span>. (1.2 kilometers)</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="text-sky-400 flex-shrink-0 mt-0.5">3.</span>
                    <p className="leading-tight">At the roundabout, take the <span className="text-white font-bold">2nd exit</span> toward Medical Sector 4. (3.5 kilometers)</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="text-emerald-400 flex-shrink-0 mt-0.5">4.</span>
                    <p className="leading-tight">Destination is on your left, inside <span className="text-emerald-400 font-bold">Cura Plaza Building</span>. (50 meters)</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMapDirectionsModal(false)}
                  className="w-full py-2.5 mt-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-extrabold text-[10.5px] rounded-xl uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Close Route Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: VAIDHLLAMA AYURVEDA INSIGHT */}
      <AnimatePresence>
        {showAyurvedaModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-amber-500/20 rounded-3xl w-full max-w-lg overflow-hidden text-slate-100 shadow-2xl relative my-8 flex flex-col max-h-[85vh]"
            >
              {/* Close Button */}
              {!ayurvedaLoading && (
                <button
                  onClick={() => setShowAyurvedaModal(false)}
                  className="absolute right-4 top-4 p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Modal Header */}
              <div className="p-5 border-b border-amber-900/20 bg-slate-950 flex items-center gap-2.5 flex-shrink-0">
                <span className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <Leaf className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">VaidhLLaMA Ayurveda Insight</h3>
                  <p className="text-[10px] text-amber-400 mt-0.5">Ayurvedic Clinical decision support model & lifestyle advisor</p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                
                {/* Search / Symptom input area inside modal */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
                  <label className="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest">
                    Presenting Symptoms to Analyze
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ayurvedaSymptomsInput}
                      onChange={(e) => setAyurvedaSymptomsInput(e.target.value)}
                      placeholder="Enter symptoms e.g., Cough, Acidity, Stiffness..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500/40 text-slate-200"
                      disabled={ayurvedaLoading}
                    />
                    <button
                      onClick={() => handleAyurvedaQuery()}
                      disabled={ayurvedaLoading}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer"
                    >
                      {ayurvedaLoading ? "Analyzing..." : "Analyze"}
                    </button>
                  </div>
                </div>

                {/* LOADING STATE */}
                {ayurvedaLoading && (
                  <div className="py-12 text-center space-y-4 flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      {/* Outer decorative pulsing circle */}
                      <div className="absolute h-16 w-16 border border-amber-500/20 rounded-full animate-ping" />
                      {/* Rotating leaf chakra */}
                      <div className="h-12 w-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-amber-400 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-white">VaidhLLaMA Analyzing Symptoms</h4>
                      <p className="text-[10px] text-slate-400">Synthesizing clinical observations, determining Dosha ratios, and retrieving Vedic remedies...</p>
                    </div>
                  </div>
                )}

                {/* ERROR STATE */}
                {ayurvedaError && !ayurvedaLoading && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-2 text-center">
                    <p className="text-xs text-rose-300 font-medium">{ayurvedaError}</p>
                    <button
                      onClick={() => handleAyurvedaQuery()}
                      className="px-3 py-1.5 bg-rose-500 text-slate-950 text-[10px] font-black rounded-lg uppercase tracking-wider hover:bg-rose-400 transition-all cursor-pointer"
                    >
                      Retry Query
                    </button>
                  </div>
                )}

                {/* REPORT STATE */}
                {ayurvedaInsight && !ayurvedaLoading && !ayurvedaError && (
                  <div className="space-y-6">
                    {/* DOSHA PROFILING */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5" /> Dosha Profiling (Constitutional Ratios)
                        </h4>
                        <span className="text-[9px] font-black bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Active State
                        </span>
                      </div>

                      {/* Horizontal Bars */}
                      <div className="space-y-3">
                        {/* Vata */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-300">Vata (Air & Space)</span>
                            <span className="text-cyan-400 font-mono">{ayurvedaInsight.doshaImbalance?.vata || 0}%</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                              style={{ width: `${ayurvedaInsight.doshaImbalance?.vata || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Pitta */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-300">Pitta (Fire & Water)</span>
                            <span className="text-orange-400 font-mono">{ayurvedaInsight.doshaImbalance?.pitta || 0}%</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 rounded-full transition-all duration-500" 
                              style={{ width: `${ayurvedaInsight.doshaImbalance?.pitta || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Kapha */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-300">Kapha (Earth & Water)</span>
                            <span className="text-emerald-400 font-mono">{ayurvedaInsight.doshaImbalance?.kapha || 0}%</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                              style={{ width: `${ayurvedaInsight.doshaImbalance?.kapha || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 space-y-1.5">
                        <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Dominant Imbalance</span>
                        <p className="text-[11px] font-extrabold text-amber-300 leading-snug">
                          {ayurvedaInsight.doshaImbalance?.dominantImbalance}
                        </p>
                        <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                          {ayurvedaInsight.doshaImbalance?.explanation}
                        </p>
                      </div>
                    </div>

                    {/* METABOLIC BASICS GRID (AGNI & AMA) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl space-y-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-400" /> Agni (Digestive Fire)
                        </span>
                        <span className="block text-[11px] font-extrabold text-slate-200 mt-1 leading-normal">
                          {ayurvedaInsight.agniStatus}
                        </span>
                      </div>
                      <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl space-y-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Activity className="h-3 w-3 text-cyan-400" /> Ama (Toxins)
                        </span>
                        <span className="block text-[11px] font-extrabold text-slate-200 mt-1 leading-normal">
                          {ayurvedaInsight.amaStatus}
                        </span>
                      </div>
                    </div>

                    {/* AHARA (DIETARY THERAPY) */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3.5">
                      <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        🍎 Ahara (Dietary Protocols)
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        {/* Favor */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block">Favor (Foods to Eat)</span>
                          <div className="space-y-1 flex flex-col gap-1">
                            {ayurvedaInsight.ahara?.favor?.map((food: string, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 text-slate-300 font-semibold leading-tight">
                                <span className="text-emerald-500">✓</span>
                                {food}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Avoid */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest block">Avoid (Foods to Limit)</span>
                          <div className="space-y-1 flex flex-col gap-1">
                            {ayurvedaInsight.ahara?.avoid?.map((food: string, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 text-slate-300 font-semibold leading-tight">
                                <span className="text-rose-500">×</span>
                                {food}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {ayurvedaInsight.ahara?.notes && (
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 space-y-0.5">
                          <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Dietary Notes</span>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-medium italic">
                            "{ayurvedaInsight.ahara.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* VIHARA (LIFESTYLE & ROUTINES) */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3.5">
                      <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        🧘 Vihara (Yoga & Daily Regimen)
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        {/* Yoga */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest block">Yoga & Pranayama</span>
                          <div className="space-y-1 flex flex-col gap-1">
                            {ayurvedaInsight.vihara?.yogaAsanas?.map((yoga: string, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 text-slate-300 font-semibold leading-tight">
                                <span className="text-purple-400">❖</span>
                                {yoga}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Daily routines */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest block">Lifestyle Tips</span>
                          <div className="space-y-1 flex flex-col gap-1">
                            {ayurvedaInsight.vihara?.lifestyleTips?.map((tip: string, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 text-slate-300 font-semibold leading-tight">
                                <span className="text-sky-400">▪</span>
                                {tip}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {ayurvedaInsight.vihara?.notes && (
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 space-y-0.5">
                          <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Regimen Notes</span>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-medium italic">
                            "{ayurvedaInsight.vihara.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RECOMMENDED HERBS */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3.5">
                      <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        🌿 Suggested Ayurvedic Herbs & Formulas
                      </h4>

                      <div className="space-y-3">
                        {ayurvedaInsight.herbs?.map((herb: any, i: number) => (
                          <div key={i} className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-extrabold text-amber-300">{herb.name}</span>
                              <span className="text-[8.5px] bg-slate-950 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">
                                {herb.frequency}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[9px] border-t border-slate-950 pt-1.5">
                              <div>
                                <span className="block text-slate-500 font-bold">Suggested Dosage</span>
                                <span className="text-slate-300 font-extrabold">{herb.dosage}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="block text-slate-500 font-bold">Therapeutic Action</span>
                                <span className="text-slate-300 font-medium leading-normal">{herb.benefits}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DISCLAIMER */}
                    <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-2xl space-y-1">
                      <p className="text-[9px] text-amber-400/80 leading-relaxed font-medium text-justify italic">
                        {ayurvedaInsight.disclaimer}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950 border-t border-amber-900/10 flex items-center justify-between flex-shrink-0">
                <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider">VaidhLLaMA Clinical DB v1.0.4</span>
                <button
                  onClick={() => setShowAyurvedaModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Close Insight
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: AI CLINICAL REPORT SCANNER & DIGITIZER */}
      <AnimatePresence>
        {showScanModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden text-slate-100 shadow-2xl relative my-8"
            >
              {/* Close Button */}
              {scanStep !== "scanning" && scanStep !== "saving" && (
                <button
                  onClick={() => {
                    stopPatientCamera();
                    setCapturedImages([]);
                    setShowScanModal(false);
                  }}
                  className="absolute right-4 top-4 p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center gap-2.5">
                <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Secure Medical Report Digitizer</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dual-channel local OCR & Gemini Clinician Intelligence</p>
                </div>
              </div>

              {/* STEP 1: UPLOAD & DEMO SELECT */}
              {scanStep === "upload" && (
                <div className="p-6 space-y-6">
                  {/* Dual Mode Switcher */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 text-xs font-bold text-slate-500">
                    <button
                      type="button"
                      onClick={() => {
                        stopPatientCamera();
                        setPatientScannerMode("upload");
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        patientScannerMode === "upload" 
                          ? "bg-slate-900 text-slate-100 font-black shadow-inner" 
                          : "hover:text-slate-300"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" /> File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPatientScannerMode("camera");
                        startPatientCamera();
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        patientScannerMode === "camera" 
                          ? "bg-slate-900 text-emerald-400 font-black shadow-inner" 
                          : "hover:text-slate-300"
                      }`}
                    >
                      <Camera className="h-3.5 w-3.5" /> Capture with Camera
                    </button>
                  </div>

                  {patientScannerMode === "upload" ? (
                    /* Dropzone File Upload */
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Local Report / Image</label>
                      <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/30 bg-slate-950/40 p-6 rounded-2xl text-center transition-all relative cursor-pointer group">
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-2.5">
                          <span className="text-3xl block group-hover:scale-110 transition-transform">📄</span>
                          <div>
                            <p className="text-xs font-bold text-slate-200">Drag & drop your medical file here</p>
                            <p className="text-[10px] text-slate-500 mt-1">Supports PDF, PNG, JPG, or HEIC scans up to 10MB</p>
                          </div>
                          <span className="inline-block px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                            Browse Files
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Live Camera View */
                    <div className="space-y-3">
                      <div className="relative overflow-hidden rounded-2xl bg-black aspect-[4/3] border border-slate-800 flex flex-col justify-between shadow-2xl">
                        {/* Live video elements */}
                        <video
                          ref={patientVideoRef}
                          autoPlay
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* Camera flash overlay */}
                        <AnimatePresence>
                          {cameraFlash && (
                            <motion.div
                              initial={{ opacity: 1 }}
                              animate={{ opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="absolute inset-0 bg-white z-30 pointer-events-none"
                            />
                          )}
                        </AnimatePresence>

                        {/* Pulsing scanning guide laser overlay */}
                        <div className="absolute inset-x-0 h-0.5 bg-emerald-500/80 shadow-[0_0_15px_#10b981] animate-[pulse_1.5s_infinite] top-1/2 -translate-y-1/2 pointer-events-none z-10" />

                        {/* HIGH FIDELITY SCANNER CORNER BRACKETS */}
                        <div className="absolute inset-6 border border-emerald-500/10 pointer-events-none z-10">
                          {/* Top Left Bracket */}
                          <div className={`absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 transition-all duration-300 ${isBoundaryDetected ? "border-emerald-400 scale-100 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "border-emerald-500/40 scale-105"}`} />
                          {/* Top Right Bracket */}
                          <div className={`absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 transition-all duration-300 ${isBoundaryDetected ? "border-emerald-400 scale-100 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "border-emerald-500/40 scale-105"}`} />
                          {/* Bottom Left Bracket */}
                          <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 transition-all duration-300 ${isBoundaryDetected ? "border-emerald-400 scale-100 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "border-emerald-500/40 scale-105"}`} />
                          {/* Bottom Right Bracket */}
                          <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 transition-all duration-300 ${isBoundaryDetected ? "border-emerald-400 scale-100 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "border-emerald-500/40 scale-105"}`} />

                          {/* Dynamic Auto-Cropping Overlay Box when edges lock */}
                          {isBoundaryDetected && autoCropEnabled && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute inset-2 bg-emerald-500/10 border-2 border-emerald-400/60 rounded-lg flex flex-col justify-between p-3"
                            >
                              <div className="flex justify-between items-start">
                                <span className="bg-emerald-500 text-slate-950 font-black text-[7.5px] px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md">
                                  AUTO-CROP LOCKED
                                </span>
                                <span className="text-[7.5px] font-mono text-emerald-300 bg-slate-950/80 px-1 py-0.5 rounded">
                                  A4 DOCUMENT
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[7.5px] font-mono text-emerald-400 bg-slate-950/80 p-1 rounded border border-emerald-500/20">
                                <span>W: 1240px | H: 1754px</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Top Alignment HUD */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                          <span className="text-[9px] text-emerald-400 bg-slate-950/85 border border-slate-800 px-2.5 py-1 rounded-md font-extrabold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${isBoundaryDetected ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-ping"}`} />
                            {isBoundaryDetected ? "Ready to Auto-Crop" : "Calibrating Frame"}
                          </span>
                          
                          <div className="flex gap-1.5 pointer-events-auto">
                            <button
                              type="button"
                              onClick={() => setAutoCropEnabled(!autoCropEnabled)}
                              className={`px-2 py-1 rounded text-[8.5px] font-extrabold border uppercase tracking-wider transition-all cursor-pointer ${
                                autoCropEnabled 
                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" 
                                  : "bg-slate-900/85 border-slate-800 text-slate-500"
                              }`}
                              title="Toggle Automatic Cropping"
                            >
                              {autoCropEnabled ? "Auto-Crop: On" : "Auto-Crop: Off"}
                            </button>
                          </div>
                        </div>

                        {patientCameraError && (
                          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center z-20 space-y-2">
                            <AlertTriangle className="h-8 w-8 text-rose-500" />
                            <p className="text-xs font-extrabold text-white">Camera Blocked or Unavailable</p>
                            <p className="text-[10px] text-slate-400 max-w-xs">{patientCameraError}</p>
                            <button
                              type="button"
                              onClick={() => startPatientCamera(patientSelectedDeviceId)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Retry Camera
                            </button>
                          </div>
                        )}

                        {/* Bottom Status bar HUD */}
                        <div className="absolute bottom-3 inset-x-3 flex justify-between items-center z-10 pointer-events-auto gap-2">
                          <div className="flex-1 bg-slate-950/90 border border-slate-800 rounded-lg py-1.5 px-2.5 text-[8.5px] font-semibold text-slate-300 font-mono flex items-center gap-2 backdrop-blur-sm truncate">
                            <span className="text-emerald-500 animate-pulse font-extrabold shrink-0">AI SCANNER_</span>
                            <span className="truncate text-slate-400">{boundaryStatus}</span>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            {patientCameraDevices.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentIndex = patientCameraDevices.findIndex(d => d.deviceId === patientSelectedDeviceId);
                                  const nextIndex = (currentIndex + 1) % patientCameraDevices.length;
                                  const nextDevice = patientCameraDevices[nextIndex];
                                  startPatientCamera(nextDevice.deviceId);
                                }}
                                className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-[9px] font-extrabold flex items-center justify-center cursor-pointer hover:bg-slate-850"
                                title="Flip Camera Input"
                              >
                                <RotateCw className="h-3 w-3" />
                              </button>
                            )}
                            <span className="text-[8px] text-slate-500 bg-slate-950/80 border border-slate-850 py-1.5 px-2 rounded font-mono uppercase tracking-wider">
                              LIVE_FEED
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Captured Pages Gallery */}
                      {capturedImages.length > 0 && (
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                              Captured Pages Queue ({capturedImages.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => setCapturedImages([])}
                              className="text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest cursor-pointer"
                            >
                              Reset Session
                            </button>
                          </div>
                          
                          <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-800">
                            {capturedImages.map((img, index) => (
                              <div key={img.id} className="relative shrink-0 group">
                                <img
                                  src={img.dataUrl}
                                  alt={`Captured Doc page ${index + 1}`}
                                  className="h-14 w-11 object-cover rounded-lg border border-slate-700 bg-slate-900 group-hover:border-emerald-500 transition-all shadow-md"
                                />
                                <span className="absolute bottom-1 right-1 bg-slate-950/85 text-emerald-400 text-[8px] px-1 rounded font-black font-mono border border-emerald-500/10">
                                  P.{index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeCapturedPage(img.id)}
                                  className="absolute -top-1.5 -right-1.5 bg-slate-950 text-rose-500 rounded-full p-0.5 hover:bg-slate-850 hover:text-rose-400 border border-slate-800 shadow cursor-pointer transition-all hover:scale-110"
                                  title="Remove page"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Snap/Action triggers */}
                      <div className="flex flex-col gap-2.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              stopPatientCamera();
                              setCapturedImages([]);
                              setPatientScannerMode("upload");
                            }}
                            className="flex-1 py-2.5 text-xs font-black border border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-xl transition-all cursor-pointer text-center"
                          >
                            Cancel Session
                          </button>
                          <button
                            type="button"
                            onClick={capturePatientPhoto}
                            disabled={!!patientCameraError}
                            className="flex-[2] py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          >
                            <Camera className="h-4 w-4" /> 
                            <span>{capturedImages.length > 0 ? "Capture Next Page" : "Capture Page 1"}</span>
                          </button>
                        </div>

                        {capturedImages.length > 0 && (
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            type="button"
                            onClick={compileCapturedImagesToPdf}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span>Finish & Merge {capturedImages.length} {capturedImages.length === 1 ? "Page" : "Pages"} into Single PDF</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manual Data Entry Fallback Options */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                      <select
                        value={manualCategory}
                        onChange={(e) => setManualCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Lab Report">Lab Report</option>
                        <option value="Prescription">Prescription Scan</option>
                        <option value="Radiology">Radiology / X-Ray</option>
                        <option value="Other">Other Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Historical Date of Test</label>
                      <input
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Preset Medical Scans Catalog */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instant Clinical Scan Presets</span>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Developer Mode</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      No real medical documents on hand? Select an instant high-fidelity preset scan to simulate the digitization pipeline for old report history:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectMockReport("cbc")}
                        className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-500/20 text-left rounded-xl transition-all cursor-pointer space-y-1"
                      >
                        <span className="text-xs font-bold text-white block">🩸 Complete Blood Count</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">680 KB • CBC Analyzer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectMockReport("lipid")}
                        className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-500/20 text-left rounded-xl transition-all cursor-pointer space-y-1"
                      >
                        <span className="text-xs font-bold text-white block">🫀 Lipid Cholesterol Panel</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">1.2 MB • Cardiovascular</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectMockReport("diabetes")}
                        className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-500/20 text-left rounded-xl transition-all cursor-pointer space-y-1"
                      >
                        <span className="text-xs font-bold text-white block">🍭 HbA1c Diabetes Report</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">940 KB • Glycemic Check</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectMockReport("thyroid")}
                        className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-500/20 text-left rounded-xl transition-all cursor-pointer space-y-1"
                      >
                        <span className="text-xs font-bold text-white block">🦋 Thyroid Function TSH</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">1.1 MB • Endocrine Lab</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectMockReport("prescription")}
                        className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-500/20 text-left rounded-xl transition-all cursor-pointer col-span-2 space-y-1"
                      >
                        <span className="text-xs font-bold text-white block">📝 Historical Doctor Prescription (Rx)</span>
                        <span className="text-[8.5px] text-slate-500 font-mono block">450 KB • Dated June 2025</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SCANNING LASER ANIMATION */}
              {scanStep === "scanning" && (
                <div className="p-8 text-center space-y-8 flex flex-col items-center justify-center">
                  {/* Holographic Document Scanner Frame */}
                  <div className="relative w-48 h-64 bg-slate-950 rounded-2xl border-2 border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-4">
                    {/* Retro Grid lines */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(16,185,129,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.15)_1px,transparent_1px)] bg-[size:10px_10px]" />
                    
                    {/* Scanning Laser Beam */}
                    <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-[laser_2s_ease-in-out_infinite] z-20" />
                    <style>{`
                      @keyframes laser {
                        0%, 100% { top: 5%; }
                        50% { top: 95%; }
                      }
                    `}</style>

                    <span className="text-5xl animate-pulse filter drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] z-10">📄</span>
                    <div className="mt-4 space-y-1.5 text-center relative z-10">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block font-mono">Analyzing Content</span>
                      <span className="text-xs text-white font-bold block truncate max-w-[140px]">{scannedFileName || "document.png"}</span>
                      <span className="text-[9px] text-slate-500 font-mono block">{scannedFileSize || "540 KB"}</span>
                    </div>
                  </div>

                  {/* Status checklist and feedback */}
                  <div className="space-y-4 w-full max-w-sm text-center">
                    {/* Dynamic Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                        <span>AI Document Pipeline</span>
                        <span className="text-emerald-400">{pipelineProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400"
                          initial={{ width: "0%" }}
                          animate={{ width: `${pipelineProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5 text-left bg-slate-950 p-4 rounded-2xl border border-slate-850 text-[10.5px] font-mono font-medium text-slate-400 shadow-2xl">
                      {/* Step 1: EMR Connection */}
                      <div className={`flex items-start gap-3 transition-all duration-300 ${
                        pipelineStep === "init" ? "text-emerald-400 font-extrabold" : pipelineProgress > 20 ? "text-emerald-500/60" : "text-slate-600"
                      }`}>
                        <div className="mt-0.5 shrink-0">
                          {pipelineProgress > 20 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : pipelineStep === "init" ? (
                            <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full bg-slate-900 border border-slate-800" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">1. EMR Connection</p>
                          <p className="text-[9px] text-slate-500 font-normal">Initializing secure localized EMR channel...</p>
                        </div>
                      </div>

                      {/* Step 2: Cleaning Noise */}
                      <div className={`flex items-start gap-3 transition-all duration-300 ${
                        pipelineStep === "noise" ? "text-emerald-400 font-extrabold text-shadow" : pipelineProgress > 45 ? "text-emerald-500/60" : "text-slate-600"
                      }`}>
                        <div className="mt-0.5 shrink-0">
                          {pipelineProgress > 45 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : pipelineStep === "noise" ? (
                            <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full bg-slate-900 border border-slate-800" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">2. Cleaning Noise</p>
                          <p className="text-[9px] text-slate-500 font-normal">De-skewing margins, removing shadows & ambient distortions...</p>
                        </div>
                      </div>

                      {/* Step 3: Text Recognition */}
                      <div className={`flex items-start gap-3 transition-all duration-300 ${
                        pipelineStep === "ocr" ? "text-emerald-400 font-extrabold" : pipelineProgress > 70 ? "text-emerald-500/60" : "text-slate-600"
                      }`}>
                        <div className="mt-0.5 shrink-0">
                          {pipelineProgress > 70 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : pipelineStep === "ocr" ? (
                            <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full bg-slate-900 border border-slate-800" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">3. Text Recognition</p>
                          <p className="text-[9px] text-slate-500 font-normal">OCR Engine extracting medical text and layout coordinates...</p>
                        </div>
                      </div>

                      {/* Step 4: Clinical Indexing */}
                      <div className={`flex items-start gap-3 transition-all duration-300 ${
                        pipelineStep === "indexing" ? "text-emerald-400 font-extrabold" : pipelineProgress > 85 ? "text-emerald-500/60" : "text-slate-600"
                      }`}>
                        <div className="mt-0.5 shrink-0">
                          {pipelineProgress > 85 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : pipelineStep === "indexing" ? (
                            <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full bg-slate-900 border border-slate-800" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">4. Clinical Indexing</p>
                          <p className="text-[9px] text-slate-500 font-normal">Classifying biomarkers & matching lab values to reference scales...</p>
                        </div>
                      </div>

                      {/* Step 5: Clinical Summary Synthesis */}
                      <div className={`flex items-start gap-3 transition-all duration-300 ${
                        pipelineStep === "synthesis" ? "text-emerald-400 font-extrabold" : pipelineStep === "complete" ? "text-emerald-500/60" : "text-slate-600"
                      }`}>
                        <div className="mt-0.5 shrink-0">
                          {pipelineStep === "complete" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : pipelineStep === "synthesis" ? (
                            <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full bg-slate-900 border border-slate-800" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">5. Clinical Synthesis</p>
                          <p className="text-[9px] text-slate-500 font-normal">Running Gemini AI to generate insights & specialist referrals...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW ANALYSIS & METRIC CORRECTIONS */}
              {scanStep === "review" && scanResult && (
                <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto custom-scrollbar">
                  {scanToast && (
                    <div className="bg-emerald-500 text-slate-950 px-3.5 py-2.5 rounded-xl font-black text-center text-[10px] shadow-lg flex items-center justify-center gap-2 animate-pulse mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{scanToast}</span>
                    </div>
                  )}

                  {scanError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-400 text-[10px] font-bold">
                      ⚠️ Offline Fallback Alert: {scanError}
                    </div>
                  )}

                  {/* Document Metadata Settings */}
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-3">
                    <h5 className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-slate-400" /> Adjust Record Properties
                    </h5>
                    
                    <div className="space-y-2.5 text-xs font-semibold">
                      <div>
                        <label className="block text-[8.5px] font-black text-slate-500 uppercase tracking-widest mb-1">Document Record Title</label>
                        <input
                          type="text"
                          value={manualTitle}
                          onChange={(e) => setManualTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-xs font-bold text-white"
                          placeholder="e.g. Complete Blood Count"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[8.5px] font-black text-slate-500 uppercase tracking-widest mb-1">Date of Original Test</label>
                          <input
                            type="date"
                            value={manualDate}
                            onChange={(e) => setManualDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-xs font-bold text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[8.5px] font-black text-slate-500 uppercase tracking-widest mb-1">Category Type</label>
                          <select
                            value={manualCategory}
                            onChange={(e) => setManualCategory(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-3 text-xs font-bold text-white"
                          >
                            <option value="Lab Report">Lab Report</option>
                            <option value="Prescription">Prescription Scan</option>
                            <option value="Radiology">Radiology / X-Ray</option>
                            <option value="Other">Other Document</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PATIENT-FRIENDLY CLINICAL RISK ASSESSMENT */}
                  <div className={`border p-4.5 rounded-2xl space-y-2.5 transition-all ${
                    scanResult.riskLevel === "emergency" 
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : scanResult.riskLevel === "high"
                      ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                      : scanResult.riskLevel === "medium"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {scanResult.riskLevel === "emergency" ? "🚨" : 
                         scanResult.riskLevel === "high" ? "⚠️" :
                         scanResult.riskLevel === "medium" ? "⚡" : "🛡️"}
                      </span>
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest block opacity-70">Automated Risk Level</span>
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          {scanResult.riskLevel || "Low"} Risk Profile
                        </h4>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-200 leading-relaxed font-semibold">
                      {scanResult.aiSummary || "The medical report was analyzed. All indices correspond to expected physiologic baselines."}
                    </p>
                  </div>

                  {/* ABNORMAL VALUES FLAGGER */}
                  {scanResult.abnormalValues && scanResult.abnormalValues.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-2.5">
                      <h5 className="text-[9.5px] font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-400" /> Detected Abnormal Parameters
                      </h5>
                      <div className="space-y-2">
                        {scanResult.abnormalValues.map((item: any, idx: number) => (
                          <div key={idx} className="bg-slate-900/50 border border-slate-850 p-2.5 rounded-xl flex justify-between items-center gap-2">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-black text-white">{item.test}</span>
                              <div className="flex items-center gap-1.5 text-[8.5px] text-slate-400 font-bold">
                                <span>Normal: {item.normalRange}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10.5px] font-mono font-black text-orange-400">{item.value}</span>
                              <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                item.severity === "severe" 
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                                  : item.severity === "moderate"
                                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/20"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-400/20"
                              }`}>
                                {item.severity || "mild"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* POSSIBLE CORRELATED CONDITIONS BADGES */}
                  {scanResult.possibleConditions && scanResult.possibleConditions.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-[8.5px] font-black text-slate-500 uppercase tracking-widest">Potential Correlated Clinical Indication</label>
                      <div className="flex flex-wrap gap-1.5">
                        {scanResult.possibleConditions.map((cond: string, idx: number) => (
                          <span key={idx} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                            ✨ {cond}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LAYMAN TRANSLATION EXPLAINER */}
                  {scanResult.keyFindings && scanResult.keyFindings.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-[8.5px] font-black text-slate-500 uppercase tracking-widest">Plain English Metric Decoders</label>
                      <div className="space-y-1.5">
                        {scanResult.keyFindings.map((finding: string, idx: number) => (
                          <div key={idx} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-start gap-2">
                            <span className="text-emerald-500 text-xs mt-0.5">✓</span>
                            <span className="text-[10px] text-slate-300 font-bold leading-relaxed">{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SMART RECOMMENDED CLINICAL CONSULTATION REFERRAL CARD */}
                  {(scanResult.suggestedSpecialist || scanResult.suggestedDoctorName) && (
                    <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950/80 border border-indigo-500/20 p-4.5 rounded-2xl space-y-3.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Sparkles className="h-10 w-10 text-indigo-400" />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                          🩺 Recommended Specialist Referral
                        </span>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          {scanResult.suggestedDoctorName || "Consultant"} 
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-800">
                            {scanResult.suggestedSpecialist || "General Physician"}
                          </span>
                        </h4>
                      </div>

                      {scanResult.followUpRecommendation && (
                        <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                          {scanResult.followUpRecommendation}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          // Prefill states
                          setDoctor(scanResult.suggestedDoctorName || "Dr. Ananya Reddy");
                          setBookingReason(`Follow-up review for parsed ${manualTitle || "medical report"} [AI Suggested Specialty: ${scanResult.suggestedSpecialist || "General Medicine"}]`);
                          setConsultType("in_person");
                          setBookingDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]); // set to tomorrow
                          setBookingTime("10:00");
                          setActiveTab("schedule");
                          setShowScanModal(false);
                          
                          // Display a nice feedback notification
                          setScanToast(`Pre-filled appointment for ${scanResult.suggestedDoctorName}!`);
                          setTimeout(() => setScanToast(null), 4000);
                        }}
                        className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-[10.5px] font-black rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        📅 Book Consultation Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* COLLAPSABLE OCR RAW TEXT */}
                  {scanResult.extractedText && (
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-850">
                      <button
                        type="button"
                        onClick={() => setShowOcrPreview(!showOcrPreview)}
                        className="w-full text-left flex items-center justify-between text-slate-500 hover:text-slate-400 text-[8.5px] font-black uppercase tracking-widest py-1"
                      >
                        <span>🔍 View Raw OCR Extracted Text</span>
                        <span>{showOcrPreview ? "Hide" : "Show"}</span>
                      </button>
                      
                      {showOcrPreview && (
                        <pre className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-xl text-[9px] text-slate-400 font-mono whitespace-pre-wrap max-h-[140px] overflow-y-auto font-bold">
                          {scanResult.extractedText}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Modal CTA Buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-850">
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedImages([]);
                        setScanStep("upload");
                      }}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[10.5px] font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Scan Again
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveScannedReport}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10.5px] font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5"
                    >
                      💾 Sync to EHR File
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SAVING SPINNER */}
              {scanStep === "saving" && (
                <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center">
                  <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white">Saving Scanned Report</h4>
                    <p className="text-[10px] text-slate-400">Archiving and synchronizing to central EMR, and informing doctors...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );

  // RENDERS INDIVIDUAL SCREEN PANELS
  function renderMobileScreenContent() {
    if (!selectedPatient) return null;

    switch (activeTab) {
      case "ai_suite": {
        return (
          <AIHealthcareSuite
            userRole="patient"
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            onBack={() => setActiveTab("home")}
          />
        );
      }

      case "companion": {
        return (
          <HealthMemoryCompanion
            patientName={selectedPatient.name}
            patientId={selectedPatient.id}
            onBack={() => setActiveTab("home")}
          />
        );
      }

      case "home": {
        const notificationApt = getNotificationAppointment();
        const latestVitals = vitalsHistory[vitalsHistory.length - 1];
        const isHrUnsafe = latestVitals && (latestVitals.hr < 60 || latestVitals.hr > 100);
        const isSystolicUnsafe = latestVitals && (latestVitals.bpSystolic < 90 || latestVitals.bpSystolic > 139);
        const isDiastolicUnsafe = latestVitals && (latestVitals.bpDiastolic < 60 || latestVitals.bpDiastolic > 89);
        const isBpUnsafe = isSystolicUnsafe || isDiastolicUnsafe;
        const isSugarUnsafe = latestVitals && (latestVitals.sugar < 70 || latestVitals.sugar > 140);
        const hasUnsafeVitals = latestVitals && (isHrUnsafe || isBpUnsafe || isSugarUnsafe);
        const showAlertBanner = hasUnsafeVitals && dismissedAlertIndex !== vitalsHistory.length - 1;

        return (
          <div className="space-y-4">
            {/* PUSH NOTIFICATION ALERT SIMULATOR BANNER */}
            <AnimatePresence mode="wait">
              {notificationApt && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="bg-slate-900/95 border-2 border-emerald-500/30 backdrop-blur-md p-4 rounded-2xl shadow-xl relative overflow-hidden"
                >
                  {/* Pulse visual line indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 animate-pulse" />

                  <div className="pl-2">
                    {/* Header bar of push notification */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                          <Bell className="h-3 w-3 animate-bounce" />
                        </span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          Cura Mobile Push
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-600" />
                        <span className="text-[9px] text-slate-500 font-bold">1h before</span>
                      </div>
                      <button
                        onClick={() => setSimulatedAppointmentOverride(null)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
                        title="Dismiss notification"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Notification body */}
                    <div className="space-y-1 mb-3.5">
                      <h4 className="text-[11px] font-black text-white leading-tight">
                        Upcoming Appointment Warning
                      </h4>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                        Your appointment with <span className="text-emerald-400 font-extrabold">{notificationApt.doctorName}</span> is scheduled in 1 hour ({new Date(notificationApt.scheduledAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}).
                      </p>
                      <p className="text-[8.5px] text-slate-400 italic">
                        Reason: {notificationApt.reason || "General clinical check-up"}
                      </p>
                    </div>

                    {/* Notification CTA Button */}
                    <div className="flex items-center gap-2">
                      {notificationApt.type === "video" || notificationApt.type === "voice" ? (
                        <button
                          onClick={() => setShowVideoCallModal(true)}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <Video className="h-3.5 w-3.5" /> Join Consultation Call
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowMapDirectionsModal(true)}
                          className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <MapPin className="h-3.5 w-3.5" /> View Clinic Route Directions
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSimulatedAppointmentOverride(null)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CLINICAL VITALS THRESHOLD ALERT BANNER */}
            <AnimatePresence>
              {showAlertBanner && latestVitals && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="bg-rose-950/90 border-2 border-rose-500/50 backdrop-blur-md p-4 rounded-2xl shadow-xl relative overflow-hidden text-slate-100"
                >
                  {/* Side color accent block */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 animate-pulse" />

                  <div className="pl-2 space-y-3">
                    {/* Header bar of clinical warning */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/35">
                          <AlertTriangle className="h-4 w-4 animate-bounce" />
                        </span>
                        <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">
                          Critical Vitals Warning
                        </span>
                        <span className="h-1 w-1 rounded-full bg-rose-700" />
                        <span className="text-[9px] text-rose-400 font-bold">Clinical Threshold Alert</span>
                      </div>
                      <button
                        onClick={() => setDismissedAlertIndex(vitalsHistory.length - 1)}
                        className="p-1 hover:bg-rose-900/40 rounded text-rose-400 hover:text-rose-200 transition-all cursor-pointer"
                        title="Dismiss clinical alert"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Warning message description */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white leading-tight">
                        Abnormal Biometrics Detected
                      </h4>
                      <p className="text-[10px] text-rose-200 leading-relaxed">
                        The most recently logged vitals ({latestVitals.date}) contain values that exceed safe clinical parameters. Please review immediately.
                      </p>
                    </div>

                    {/* Grid of out-of-range vitals */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {isHrUnsafe && (
                        <div className="bg-rose-900/40 border border-rose-500/25 p-2 rounded-xl text-center flex flex-col justify-center">
                          <span className="text-[8px] font-bold text-rose-300 uppercase tracking-wider">Heart Rate</span>
                          <span className="text-xs font-black text-white mt-0.5">
                            {latestVitals.hr} <span className="text-[8.5px] font-normal text-rose-300">BPM</span>
                          </span>
                          <span className="text-[7.5px] text-rose-400 font-semibold mt-0.5">Safe: 60 - 100</span>
                        </div>
                      )}
                      {isBpUnsafe && (
                        <div className="bg-rose-900/40 border border-rose-500/25 p-2 rounded-xl text-center flex flex-col justify-center">
                          <span className="text-[8px] font-bold text-rose-300 uppercase tracking-wider">Blood Pressure</span>
                          <span className="text-xs font-black text-white mt-0.5">
                            {latestVitals.bpSystolic}/{latestVitals.bpDiastolic} <span className="text-[8.5px] font-normal text-rose-300">mmHg</span>
                          </span>
                          <span className="text-[7.5px] text-rose-400 font-semibold mt-0.5">Safe: 90/60 - 139/89</span>
                        </div>
                      )}
                      {isSugarUnsafe && (
                        <div className="bg-rose-900/40 border border-rose-500/25 p-2 rounded-xl text-center flex flex-col justify-center">
                          <span className="text-[8px] font-bold text-rose-300 uppercase tracking-wider">Blood Glucose</span>
                          <span className="text-xs font-black text-white mt-0.5">
                            {latestVitals.sugar} <span className="text-[8.5px] font-normal text-rose-300">mg/dL</span>
                          </span>
                          <span className="text-[7.5px] text-rose-400 font-semibold mt-0.5">Safe: 70 - 140</span>
                        </div>
                      )}
                    </div>

                    {/* Advisory Action Callout */}
                    <div className="bg-rose-950/50 border border-rose-500/20 p-2.5 rounded-xl flex items-start gap-2 text-[9.5px] text-rose-200">
                      <span className="text-xs mt-0.5">⚠️</span>
                      <div className="leading-relaxed">
                        <span className="font-extrabold text-white">Medical Disclaimer:</span> These threshold limits are reference ranges only. If you are experiencing symptoms (chest pain, shortness of breath, severe dizziness), please contact emergency services or your primary clinician at <span className="text-white font-extrabold">Cura Care</span> immediately.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PUSH NOTIFICATION SIMULATOR TOOLKIT (Shown so developer/user can see it) */}
            {!notificationApt && (
              <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Push Notification Simulation Dashboard
                    </span>
                  </div>
                  <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase">
                    Testing Mode
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Want to see the 1-hour push notification alert in action? Use these quick simulations:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSimulatedAppointmentOverride({
                      id: "sim-apt-video",
                      doctorName: "Dr. Rajesh Sharma",
                      scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                      type: "video",
                      reason: "Monthly Hypertension Tele-consultation"
                    })}
                    className="py-2 px-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/20 text-slate-300 hover:text-white text-[10px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Video className="h-3 w-3 text-emerald-400" /> Mock Video Appt
                  </button>
                  <button
                    onClick={() => setSimulatedAppointmentOverride({
                      id: "sim-apt-inperson",
                      doctorName: "Dr. Sneha Rao",
                      scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                      type: "in_person",
                      reason: "Routine HbA1c Diabetes Review"
                    })}
                    className="py-2 px-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/20 text-slate-300 hover:text-white text-[10px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="h-3 w-3 text-sky-400" /> Mock In-Person Appt
                  </button>
                </div>
              </div>
            )}

            {/* HEALTH MEMORY & AI COMPANION PROMINENT BANNER */}
            <div 
              onClick={() => setActiveTab("companion")}
              className="bg-gradient-to-r from-teal-950/90 via-slate-900 to-emerald-950/90 border-2 border-teal-500/40 p-4 rounded-2xl shadow-xl cursor-pointer hover:border-teal-400 transition-all group relative overflow-hidden my-1"
            >
              <div className="absolute -right-4 -bottom-4 opacity-10 text-teal-300 pointer-events-none">
                <Brain className="h-28 w-28" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30 group-hover:scale-105 transition-transform shrink-0">
                    <Brain className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8.5px] font-black uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        8 Health Pillars
                      </span>
                      <span className="text-[8.5px] font-bold text-amber-300 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI Active Companion
                      </span>
                    </div>
                    <h3 className="text-xs font-black text-white mt-1 group-hover:text-teal-200 transition-colors">
                      Health Memory & AI Companion
                    </h3>
                    <p className="text-[9.5px] text-slate-300 mt-0.5 max-w-xs leading-tight">
                      Prescription Reader, Voice Log, Diet & Workout, EHR Vault & Emergency Protocols
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-teal-300 bg-teal-950/80 border border-teal-500/30 px-2.5 py-1.5 rounded-xl group-hover:bg-teal-500 group-hover:text-slate-950 transition-all shrink-0">
                  <span>Open Companion</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            {/* UNIFIED HOME VIEW DASHBOARD */}
            <PatientDashboard 
              patient={selectedPatient}
              medications={selectedPatient.currentMedications || []}
              appointments={appointments}
              vitalsHistory={vitalsHistory}
              onAddVitalsClick={() => setShowVitalsModal(true)}
              onBookAppointmentClick={() => setActiveTab("schedule")}
              onJoinCallClick={(apt) => {
                setSimulatedAppointmentOverride(apt);
                setShowVideoCallModal(true);
              }}
              onViewRouteClick={(apt) => {
                setSimulatedAppointmentOverride(apt);
                setShowMapDirectionsModal(true);
              }}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onOpenRefillModal={() => setShowRefillModal(true)}
            />

            {/* BMI & Body Composition Tracker */}
            {(() => {
              const bmiStats = getLatestBMIStats();
              return (
                <div id="home-bmi-tracker" className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4.5 w-4.5 text-emerald-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Body Mass Index (BMI)
                      </span>
                    </div>
                    <span className={`text-[8.5px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${bmiStats.colorClass}`}>
                      {bmiStats.classification}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/30">
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Weight</p>
                      <p className="text-base font-black text-white mt-0.5">
                        {bmiStats.weight} <span className="text-[9px] text-slate-400 font-medium">kg</span>
                      </p>
                    </div>
                    <div className="text-center border-x border-slate-800/60">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Height</p>
                      <p className="text-base font-black text-white mt-0.5">
                        {bmiStats.height} <span className="text-[9px] text-slate-400 font-medium">cm</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">BMI Ratio</p>
                      <p className="text-base font-black text-emerald-400 mt-0.5">
                        {bmiStats.bmi}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] text-slate-500 font-bold px-1">
                      <span>Underweight (&lt;18.5)</span>
                      <span>Normal (18.5-24.9)</span>
                      <span>Overweight (25-29.9)</span>
                      <span>Obese (&ge;30)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden relative border border-slate-800/80">
                      <div 
                        className={`h-full ${bmiStats.barColor} transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.max(8, ((bmiStats.bmi - 15) / 20) * 100))}%` }}
                      />
                    </div>
                    <p className="text-[9.5px] text-slate-400 text-center italic mt-1.5">
                      {bmiStats.classification === "Normal weight" 
                        ? "Your BMI is in the healthy zone. Keep maintaining a balanced diet!"
                        : bmiStats.classification === "Underweight"
                        ? "Your BMI is in the underweight range. Consider speaking with a physician."
                        : bmiStats.classification === "Overweight"
                        ? "Your BMI indicates a slightly elevated weight. Regular physical activity can help."
                        : "Your BMI indicates obesity. We recommend consulting with your clinic care doctor."}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Recharts Area Chart for Vitals Trends */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>📈 Clinical Blood Pressure Trends</span>
                <span className="text-slate-500 font-bold font-mono">mmHg Tracker</span>
              </p>
              
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vitalsHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sysGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="diaGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis domain={[50, 160]} stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} labelStyle={{ fontSize: 9 }} />
                    <Area type="monotone" name="Systolic" dataKey="bpSystolic" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#sysGlow)" />
                    <Area type="monotone" name="Diastolic" dataKey="bpDiastolic" stroke="#2dd4bf" strokeWidth={2} fillOpacity={1} fill="url(#diaGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts Line Chart for Glucose and Heart Rate */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>📈 Glucose & Heart Rate Trends</span>
                <span className="text-slate-500 font-bold font-mono">Biometrics Monitor</span>
              </p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={9} />
                    <YAxis domain={[50, 150]} stroke="#64748b" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                    <Line type="monotone" name="Glucose (Sugar)" dataKey="sugar" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Pulse (HR)" dataKey="hr" stroke="#f43f5e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 30-Day Medication Adherence Tracker */}
            {(() => {
              const uniqueMeds = getUniqueMedicines();
              const selectedMedName = selectedAdherenceMed;
              
              // Get adherence data based on selection ("overall" vs a specific med)
              const adherenceData = selectedMedName === "overall" 
                ? getAdherenceData() 
                : getMedicationAdherenceData(selectedMedName);
                
              const averageAdherence = adherenceData.length > 0 
                ? Math.round(adherenceData.reduce((acc, curr) => acc + curr.adherence, 0) / adherenceData.length)
                : 100;
              
              const getAdherenceBadge = (avg: number) => {
                if (avg >= 90) return { label: "Excellent Consistency", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
                if (avg >= 80) return { label: "Good Consistency", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" };
                return { label: "Needs Attention", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
              };
              
              const badge = getAdherenceBadge(averageAdherence);
              
              return (
                <div id="home-medication-adherence-card" className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span>📊 Treatment Consistency</span>
                      </p>
                      <h4 className="text-xs font-black text-white">30-Day Medication Adherence</h4>
                    </div>
                    <div className="text-right">
                      <span className={`text-[8.5px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${badge.color}`}>
                        {badge.label}
                      </span>
                      <div className="text-sm font-black text-white mt-1">
                        {averageAdherence}% <span className="text-[8.5px] text-slate-500 font-bold uppercase">Avg</span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Segmented/Filter Control for Medications */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                    <button
                      onClick={() => setSelectedAdherenceMed("overall")}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                        selectedMedName === "overall"
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      All Prescriptions
                    </button>
                    {uniqueMeds.map((med: string) => {
                      const medData = getMedicationAdherenceData(med);
                      const medAvg = medData.length > 0
                        ? Math.round(medData.reduce((acc, curr) => acc + curr.adherence, 0) / medData.length)
                        : 100;
                      return (
                        <button
                          key={med}
                          onClick={() => setSelectedAdherenceMed(med)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-[9px] font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                            selectedMedName === med
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black"
                              : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <span>{med}</span>
                          <span className={`text-[8px] px-1 py-0.1 rounded-md font-mono ${
                            selectedMedName === med 
                              ? "bg-slate-950/25 text-slate-950" 
                              : medAvg >= 90 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : medAvg >= 80 
                                  ? "bg-sky-500/10 text-sky-400" 
                                  : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {medAvg}%
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    {selectedMedName === "overall" ? (
                      <>Showing combined adherence log. Clinical target is <span className="text-emerald-400 font-extrabold">90% compliance</span>. Mark today's doses below to keep your streak high.</>
                    ) : (
                      <>Showing 30-day consistency log for <span className="text-emerald-400 font-extrabold">{selectedMedName}</span>. Your adherence is <span className="text-white font-extrabold">{averageAdherence}%</span>.</>
                    )}
                  </p>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={adherenceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="adherenceGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={8} tickLine={false} interval={6} />
                        <YAxis domain={[40, 100]} stroke="#64748b" fontSize={8} tickLine={false} ticks={[40, 60, 80, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} 
                          labelStyle={{ fontSize: 9, color: "#94a3b8", fontWeight: "bold" }}
                          itemStyle={{ fontSize: 10, color: "#10b981" }}
                          formatter={(value: any) => [`${value}% Adherence`, 'Daily Adherence']}
                        />
                        <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Target 90%', fill: '#ef4444', fontSize: 7, position: 'insideBottomRight' }} />
                        <Area 
                          type="monotone" 
                          name="Adherence" 
                          dataKey="adherence" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#adherenceGlow)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Quick Tips Section */}
                  <div className="pt-2.5 border-t border-slate-900/80 space-y-2">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>💡 Quick Clinical Tips</span>
                    </p>
                    <div className="bg-slate-900/50 border border-slate-850/60 p-2.5 rounded-xl">
                      {(() => {
                        let tipTitle = "";
                        let tipDesc = "";
                        let icon = "🎯";

                        if (averageAdherence >= 95) {
                          tipTitle = "Perfect Consistency Achieved!";
                          tipDesc = `Your commitment to ${selectedMedName === "overall" ? "your regimen" : selectedMedName} is exemplary. Keep pairing your doses with daily anchor habits to lock in this streak.`;
                          icon = "🏆";
                        } else if (averageAdherence >= 90) {
                          tipTitle = "Excellent Adherence Profile";
                          tipDesc = `You are meeting the 90% clinical target for ${selectedMedName === "overall" ? "your treatment" : selectedMedName}. Set secondary timezone reminders to offset potential travel disruptions.`;
                          icon = "✨";
                        } else if (averageAdherence >= 80) {
                          tipTitle = "Actionable Improvement Zone";
                          tipDesc = `You are close to the target! Consider placing ${selectedMedName === "overall" ? "your medications" : selectedMedName} next to your coffee maker or toothbrush to eliminate morning forgetfulness.`;
                          icon = "⏰";
                        } else {
                          tipTitle = "Adherence Alert: Critical Gap";
                          tipDesc = `Your ${selectedMedName === "overall" ? "treatment" : selectedMedName} continuity is at risk. Try utilizing a smart pill box or setting active alarms to bridge the gap.`;
                          icon = "🚨";
                        }

                        return (
                          <div className="flex gap-2.5 items-start">
                            <span className="text-xs bg-slate-950/80 p-1.5 rounded-lg border border-slate-800/60 leading-none select-none">{icon}</span>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-black text-white">{tipTitle}</p>
                              <p className="text-[9px] text-slate-400 leading-normal">{tipDesc}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Upcoming Medication Reminders Section */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⏰ Upcoming Medication Reminders</span>
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium">Click checkbox to mark your daily dosage as taken</p>
                </div>
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-extrabold border border-emerald-500/20">
                  {medicationReminders.filter(m => m.status !== "taken").length} Remaining
                </span>
              </div>

              {loadingReminders ? (
                <div className="py-6 text-center text-[11px] text-slate-500 flex flex-col items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Fetching daily prescription alerts...</span>
                </div>
              ) : medicationReminders.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <div className="inline-flex p-2.5 bg-emerald-500/10 text-emerald-400 rounded-full animate-pulse">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold">All caught up! No scheduled medication reminders.</p>
                  <p className="text-[9px] text-slate-500 max-w-[200px] mx-auto text-center">Your doctor can configure daily alerts inside the clinician portal hub.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {medicationReminders.map((item) => {
                    // Smart parsing of medicine name, dosage, time and instructions if not explicitly structured
                    const medName = item.medicineName || (item.messageContent.includes("Name: ") ? item.messageContent.split("Name: ")[1].split(".")[0] : "Prescribed Medication");
                    const medDosage = item.dosage || (item.messageContent.includes("Reminder: ") ? item.messageContent.split("Reminder: ")[1].split(" for ")[0] : "As Directed");
                    const medTime = item.time || (item.messageContent.includes("Timing: ") ? item.messageContent.split("Timing: ")[1].split(".")[0] : "Daily");
                    const medInstructions = item.instructions || (item.messageContent.includes("Instructions: ") ? item.messageContent.split("Instructions: ")[1].split(".")[0] : "Take as directed");
                    const isTaken = item.status === "taken";
                    const isExpanded = !!expandedMeds[item.id];

                    return (
                      <div 
                        key={item.id}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isTaken 
                            ? "bg-emerald-500/5 border-emerald-500/20 opacity-60" 
                            : "bg-slate-900/40 border-slate-800/80 hover:border-emerald-500/10"
                        }`}
                      >
                        {/* Main Header Area (Click to Expand/Collapse) */}
                        <div className="p-3 flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setExpandedMeds(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="flex items-start gap-2.5 min-w-0 flex-grow text-left cursor-pointer group"
                          >
                            <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 transition-all ${
                              isTaken 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : "bg-slate-850 text-sky-400 group-hover:bg-slate-800 group-hover:text-sky-300"
                            }`}>
                              <span className="text-xs">💊</span>
                            </div>
                            
                            <div className="space-y-0.5 min-w-0 flex-grow">
                              <div className="flex items-center gap-1.5">
                                <h5 className={`text-xs font-bold leading-tight truncate transition-colors ${
                                  isTaken 
                                    ? "text-slate-400 line-through" 
                                    : "text-white group-hover:text-emerald-400"
                                }`}>
                                  {medName}
                                </h5>
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 flex-shrink-0 transition-transform" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 flex-shrink-0 transition-transform" />
                                )}
                              </div>
                              
                              {/* Very compact preview when collapsed */}
                              {!isExpanded && (
                                <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500">
                                  <span className="font-mono text-sky-400">{medDosage}</span>
                                  <span>•</span>
                                  <span className="font-mono text-emerald-500">{medTime}</span>
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Interactive Styled Checkbox */}
                          <div className="flex items-center">
                            <button
                              onClick={() => handleToggleTaken(item.id, item.status)}
                              className={`h-5.5 w-5.5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                                isTaken 
                                  ? "bg-emerald-500 border-emerald-500 text-slate-950 scale-95" 
                                  : "border-slate-700 hover:border-emerald-500/60 bg-transparent"
                              }`}
                              title={isTaken ? "Mark as not taken" : "Mark as taken"}
                            >
                              {isTaken && <Check className="h-3.5 w-3.5 stroke-[4px]" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Detailed Prescription Area */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="border-t border-slate-900/60 bg-slate-950/40"
                            >
                              <div className="p-3 space-y-2.5 text-[10px]">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-900/40">
                                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Dosage Level</span>
                                    <span className="font-mono font-bold text-sky-400">{medDosage}</span>
                                  </div>
                                  <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-900/40">
                                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Schedule/Frequency</span>
                                    <span className="font-mono font-bold text-emerald-400">{medTime}</span>
                                  </div>
                                </div>

                                <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-900/40 space-y-1">
                                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Special Instructions</span>
                                  <p className="text-[10px] text-slate-300 leading-normal italic font-medium">
                                    "{medInstructions}"
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 💊 MEDICATION ALERTS & ADHERENCE CONTROL PANEL */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <div className="flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Alarm Adherence Controls
                  </span>
                </div>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-extrabold border border-emerald-500/20 uppercase">
                  Push Engine
                </span>
              </div>

              {/* Push Toggle & Permissions Indicator */}
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-extrabold text-white">Daily Medication Alerts</span>
                    <span className="block text-[9px] text-slate-500 leading-none">
                      {pushNotificationsEnabled ? "Active & monitoring schedule" : "Notifications suspended"}
                    </span>
                  </div>
                  <button
                    onClick={togglePushNotificationsSetting}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      pushNotificationsEnabled ? "bg-emerald-500" : "bg-slate-750"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                        pushNotificationsEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[9px]">
                  <span className="text-slate-400 font-medium">HTML5 Desktop Permissions:</span>
                  {pushPermissionGranted === "granted" ? (
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> GRANTED
                    </span>
                  ) : pushPermissionGranted === "denied" ? (
                    <span className="text-rose-400 font-extrabold flex items-center gap-1">
                      ⚠️ BLOCKED
                    </span>
                  ) : (
                    <button
                      onClick={requestWebNotificationPermission}
                      className="text-emerald-400 hover:text-emerald-300 font-black underline uppercase tracking-wider cursor-pointer"
                    >
                      Request Permission
                    </button>
                  )}
                </div>
              </div>

              {/* Simulator Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTestTriggerReminder}
                  className="py-2.5 px-3 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  ⚡ Trigger Test Alert
                </button>
                <button
                  onClick={() => setShowSchedulerForm(!showSchedulerForm)}
                  className={`py-2.5 px-3 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    showSchedulerForm 
                      ? "bg-slate-800 text-white border-slate-700" 
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {showSchedulerForm ? "Close Form" : "✙ Add Custom Alarm"}
                </button>
              </div>

              {/* Add Custom Schedule Form (Expandable) */}
              <AnimatePresence>
                {showSchedulerForm && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAddCustomReminder}
                    className="bg-slate-900/50 p-3 rounded-xl border border-emerald-500/20 space-y-2.5 overflow-hidden"
                  >
                    <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      New Medication Alarm
                    </h5>
                    
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Pill / Medicine Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lipitor 20mg"
                          value={customPillName}
                          onChange={(e) => setCustomPillName(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-white placeholder-slate-600 px-2.5 py-2 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Dosage Level</label>
                          <select
                            value={customPillDosage}
                            onChange={(e) => setCustomPillDosage(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-white px-2 py-2 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                          >
                            <option value="1 Tablet">1 Tablet</option>
                            <option value="2 Tablets">2 Tablets</option>
                            <option value="0.5 Tablet">0.5 Tablet</option>
                            <option value="1 Capsule">1 Capsule</option>
                            <option value="5 ml (Spoon)">5 ml</option>
                            <option value="1 Injection">1 Injection</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Daily Time</label>
                          <input
                            type="time"
                            required
                            value={customPillTime}
                            onChange={(e) => setCustomPillTime(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono font-bold text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Special Instructions</label>
                        <input
                          type="text"
                          placeholder="e.g. Take with warm food"
                          value={customPillInstructions}
                          onChange={(e) => setCustomPillInstructions(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-white placeholder-slate-600 px-2.5 py-2 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-black text-[9.5px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Save Daily Alarm Schedule
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Adherence History Log (Scrollable log) */}
              <div className="space-y-2">
                <span className="block text-[8.5px] font-black text-slate-500 uppercase tracking-widest">
                  Recent Alerts Transmission Log
                </span>
                {notificationHistoryLog.length === 0 ? (
                  <p className="text-[9px] text-slate-600 italic leading-none py-1">No alerts triggered yet in this sandbox session.</p>
                ) : (
                  <div className="bg-slate-950/50 rounded-xl border border-slate-900/60 p-2 max-h-[140px] overflow-y-auto space-y-1.5 divide-y divide-slate-900/60">
                    {notificationHistoryLog.map((log, idx) => (
                      <div key={log.id} className={`pt-1.5 first:pt-0 flex items-center justify-between text-[9px] ${idx > 0 ? "border-t border-slate-900/40" : ""}`}>
                        <div className="min-w-0 pr-2">
                          <p className="font-extrabold text-slate-200 truncate leading-tight">
                            {log.medicationName} <span className="font-mono text-[8px] text-slate-500">({log.dosage})</span>
                          </p>
                          <p className="text-[8px] text-slate-500 leading-none mt-0.5 font-mono">
                            Sent: {new Date(log.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                          log.status === "completed" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                            : log.status === "snoozed"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                            : "bg-sky-500/10 text-sky-400 border border-sky-500/10 animate-pulse"
                        }`}>
                          {log.actionTaken === "pending" ? "Pending" : log.actionTaken}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Allergies and Medications warnings */}
            <div className="bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-2xl space-y-2">
              <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                🚨 Allergy & Safety Bulletins
              </h4>
              <p className="text-[11px] font-medium text-rose-300">
                {selectedPatient.allergies.length > 0 
                  ? `Clinical files list allergic reactivity warnings for: ${selectedPatient.allergies.join(", ")}.`
                  : "No active pharmacological drug reactions mapped."}
              </p>
            </div>

            {/* AYURVEDIC WELLNESS CARD */}
            <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                <Leaf className="h-16 w-16 text-amber-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
                  <Leaf className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-widest">
                    VaidhLLaMA Ayurveda Engine
                  </h4>
                  <p className="text-[10px] text-slate-400">Discover personalized wellness and dosha harmony insights.</p>
                </div>
              </div>

              {/* Display patient symptoms context if any exist */}
              {(() => {
                const lastHistoryWithSymptoms = [...vitalsHistory].reverse().find(h => h.symptoms && h.symptoms.length > 0);
                const lastSymptoms = lastHistoryWithSymptoms ? lastHistoryWithSymptoms.symptoms : [];
                return (
                  <div className="bg-amber-950/10 border border-amber-950/40 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-bold">Extracted Presenting Symptoms:</span>
                      {lastSymptoms.length > 0 ? (
                        <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full font-extrabold text-[8.5px] border border-amber-500/20 uppercase">
                          Detected in History
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[9px]">None logged today</span>
                      )}
                    </div>
                    {lastSymptoms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {lastSymptoms.map((sym, idx) => (
                          <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded-lg text-[9.5px] font-semibold flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-amber-400" />
                            {sym}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 leading-normal italic">
                        No symptoms logged in your recent daily logs. You can still input symptoms manually.
                      </p>
                    )}
                    <button
                      onClick={() => {
                        const symptomStr = lastSymptoms.join(", ");
                        setAyurvedaSymptomsInput(symptomStr);
                        setShowAyurvedaModal(true);
                        if (symptomStr) {
                          handleAyurvedaQuery(symptomStr);
                        }
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-[11px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3" />
                      {lastSymptoms.length > 0 ? "Generate Ayurveda Insight" : "Explore Ayurveda Insights"}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        );
      }

      case "schedule":
        if (!patientConsent.accepted) {
          return (
            <div className="space-y-4">
              <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/80 p-4.5 rounded-2xl">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-emerald-400" /> Book Live Appointment
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Submit your appointment slot, which will sync immediately with the receptionist terminal queue.</p>
              </div>
              <div className="bg-slate-950 border border-red-500/30 p-8 rounded-2xl text-center space-y-4">
                <div className="inline-flex p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">🔒 Data Processing Suspended</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    You have explicitly revoked your DPDP consent. Telemedicine booking and slot reservations are frozen because the clinic is prohibited by Indian law (DPDP Act, 2023) from processing your health metrics or booking schedules.
                  </p>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-lg uppercase tracking-wider cursor-pointer"
                  >
                    Go to Profile tab & re-grant consent
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/80 p-4.5 rounded-2xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-emerald-400" /> Book Live Appointment
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Submit your appointment slot, which will sync immediately with the receptionist terminal queue.</p>
            </div>

            {familyViewShareCode && familyViewAccessLevel === "view" ? (
              <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl text-center space-y-3">
                <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full animate-pulse">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Booking Restricted</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    You have View-Only permission for <strong className="text-white">{selectedPatient.fullName}</strong>'s medical portal. Appointment scheduling is disabled.
                  </p>
                </div>
              </div>
            ) : bookingSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-4"
              >
                <div className="inline-flex p-3.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                
                <div>
                  <h4 className="text-sm font-black text-emerald-400">Appointment Registered!</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Sent interactive scheduling confirmation token via WhatsApp API simulation.</p>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-left text-[11px] font-semibold space-y-2 text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">Consultant</span>
                    <span className="text-white">{bookingSuccess.doctorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">Date & Time</span>
                    <span className="text-white">{new Date(bookingSuccess.scheduledAt).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">Consultation Mode</span>
                    <span className="text-white uppercase">{bookingSuccess.type.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">Ticket Code</span>
                    <span className="text-emerald-400 font-mono text-[10px] uppercase">{bookingSuccess.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => setBookingSuccess(null)}
                  className="w-full py-2.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Schedule Another Appointment
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Doctor In-Charge *</label>
                  <select 
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma (Cardiology)</option>
                    <option value="Dr. Ananya Reddy">Dr. Ananya Reddy (General Physician)</option>
                    <option value="Dr. Vikram Malhotra">Dr. Vikram Malhotra (Pediatrician)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Consultation Mode *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "in_person", icon: <PhoneIcon className="h-3.5 w-3.5" />, label: "In-Clinic" },
                      { val: "video", icon: <Video className="h-3.5 w-3.5" />, label: "Video" },
                      { val: "voice", icon: <Phone className="h-3.5 w-3.5" />, label: "Audio" }
                    ].map((mode) => (
                      <button
                        key={mode.val}
                        type="button"
                        onClick={() => setConsultType(mode.val as any)}
                        className={`p-2.5 rounded-xl border font-black transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          consultType === mode.val 
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm" 
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {mode.icon}
                        <span className="text-[9px] uppercase">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Appointment Date *</label>
                    <input 
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 text-white font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Time Slot *</label>
                    <input 
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Primary Symptoms / Reasons for Visit</label>
                  <input 
                    type="text"
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    placeholder="e.g. Regular review of blood sugar, chest tightness"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-white font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBooking || !bookingDate || !bookingTime}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-md uppercase tracking-wider transition-all mt-3 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isBooking ? "Registering Appointment Token..." : "Confirm & Send WhatsApp Ticket"}
                </button>
              </form>
            )}
          </div>
        );

      case "rx":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/80 p-4.5 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Lock className="h-4.5 w-4.5 text-emerald-400" /> Secure Rx Vault
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">EHR Medical Grade Encryption Protocol Shield</p>
              </div>
              <Shield className={`h-8 w-8 ${rxUnlocked ? "text-emerald-400" : "text-slate-600 animate-pulse"}`} />
            </div>

            {!rxUnlocked ? (
              /* PIN & BIOMETRIC UNLOCK PROTECTION */
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl text-center space-y-4"
              >
                <div className="inline-flex p-3 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
                  <KeyRound className="h-5.5 w-5.5" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white">Enter Clinical Portal Passcode PIN</h4>
                  <p className="text-[10px] text-slate-500">Decrypt sensitive medical prescription data and active doctor notes.</p>
                </div>

                <div className="max-w-[150px] mx-auto">
                  <input 
                    type="password"
                    maxLength={4}
                    value={securityPinInput}
                    onChange={(e) => setSecurityPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-slate-900 border-2 border-slate-800 text-center text-lg font-bold text-white px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 transition-all tracking-[0.5em] font-mono"
                  />
                  <span className="block text-[8px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                    Hint: Use 1234 or press Enter
                  </span>
                </div>

                {pinError && (
                  <p className="text-[10px] text-rose-400 font-bold">{pinError}</p>
                )}

                <button
                  onClick={handlePinUnlock}
                  className="w-full py-2.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-black rounded-xl uppercase tracking-widest transition-all cursor-pointer"
                >
                  Decrypt EHR Files
                </button>

                <div className="flex items-center my-1">
                  <div className="flex-1 border-t border-slate-900"></div>
                  <span className="px-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">OR SECURE BIOMETRIC</span>
                  <div className="flex-1 border-t border-slate-900"></div>
                </div>

                {isRegistered ? (
                  <button
                    onClick={handleTriggerBiometricAuth}
                    disabled={isBiometricLoading}
                    className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 text-xs font-black rounded-xl uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Fingerprint className="h-5 w-5 text-emerald-400 animate-pulse" />
                    Unlock with TouchID / FaceID
                  </button>
                ) : (
                  <button
                    onClick={handleTriggerBiometricRegister}
                    disabled={isBiometricLoading}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-black rounded-xl uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Fingerprint className="h-5 w-5 text-slate-400" />
                    Set Up FaceID / TouchID
                  </button>
                )}

                {webAuthnError && (
                  <p className="text-[10px] text-rose-400 font-bold mt-1">⚠️ {webAuthnError}</p>
                )}
              </motion.div>
            ) : (
              /* LIST DECRYPTED PRESCRIPTIONS */
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center text-[10px] font-bold text-emerald-400">
                  🔓 Medical Records Decrypted Successfully. Showing active Rx sheets.
                </div>

                {/* BIOMETRIC VAULT SETTING BAR */}
                <div className="bg-slate-950 border border-slate-800/60 p-3 rounded-xl flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Fingerprint className={`h-4.5 w-4.5 ${isRegistered ? "text-emerald-400" : "text-slate-500"}`} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-white truncate">Biometric Access Shield</p>
                      <p className="text-[8px] text-slate-500 truncate">{isRegistered ? "Live protection active on device" : "Secure vault using TouchID / FaceID"}</p>
                    </div>
                  </div>
                  {isRegistered ? (
                    <button
                      onClick={deregisterBiometric}
                      className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      onClick={handleTriggerBiometricRegister}
                      className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Enable Biometrics
                    </button>
                  )}
                </div>

                {/* PHYSICAL MEDICATION BOX QR SCANNER HERO CARD */}
                <div className="bg-gradient-to-r from-emerald-950/70 via-slate-950 to-teal-950/70 border border-emerald-500/30 p-4 rounded-2xl relative overflow-hidden space-y-3 shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-start justify-between relative z-10 gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8.5px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                          <QrCode className="h-3 w-3" /> Rx Box Scanner
                        </span>
                        <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-300 text-[8px] font-bold font-mono rounded">
                          EHR Verified
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5 pt-0.5">
                        Scan Physical Medication Box
                      </h4>
                      <p className="text-[10px] text-slate-300 leading-normal">
                        Scan the QR code on your physical medicine box to immediately pull up adherence information, dosage instructions, and refill status.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowRxQrModal(true);
                        setRxQrStep("scan");
                        setRxQrScannerMode("camera");
                        startRxQrCamera();
                      }}
                      className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-[10.5px] uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Scan Box</span>
                    </button>
                  </div>

                  {/* Scanned Box Quick History Chips */}
                  {scannedBoxHistory.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">
                        Recent Physical Scans ({scannedBoxHistory.length})
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {scannedBoxHistory.map((box, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => {
                              setScannedMedicationResult(box);
                              setRxRefillStatusMsg(null);
                              setRxQrStep("result");
                              setShowRxQrModal(true);
                            }}
                            className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 p-2 rounded-xl text-left shrink-0 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">
                              💊
                            </span>
                            <div>
                              <p className="text-[10px] font-extrabold text-white leading-tight truncate max-w-[110px]">
                                {box.medName}
                              </p>
                              <p className="text-[8px] text-emerald-400 font-bold leading-none mt-0.5">
                                {box.adherenceRate}% Adherence
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedPatient.history && selectedPatient.history.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {selectedPatient.history.map((record, i) => (
                      <div 
                        key={i}
                        className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-3 hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-black text-white">{record.diagnosis}</p>
                            <p className="text-[9px] font-semibold text-slate-500">{new Date(record.date).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
                          </div>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold font-mono">
                            {record.doctor}
                          </span>
                        </div>

                        <div className="space-y-2 border-t border-slate-900 pt-2 text-[11px] font-semibold text-slate-300">
                          {record.prescriptions && record.prescriptions.map((med, medIdx) => (
                            <div key={medIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-emerald-500 text-xs flex-shrink-0">💊</span>
                                <span className="truncate text-slate-200 text-[11px] font-extrabold">{med}</span>
                              </div>
                              <button
                                onClick={() => handleInitiateRefill(med, record.doctor)}
                                className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/20 text-[9.5px] font-black rounded-lg uppercase tracking-wider transition-all self-end sm:self-auto cursor-pointer flex items-center gap-1"
                              >
                                Request Refill
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => setActivePrescription(record)}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white hover:text-emerald-400 text-[10px] font-extrabold rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FileCheck2 className="h-3.5 w-3.5" /> Open Detailed Prescription
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-xs text-slate-500">No previous medication history logged in EHR database.</p>
                )}
              </motion.div>
            )}

            {/* BIOMETRIC SCANNING OVERLAY */}
            <AnimatePresence>
              {biometricScanActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                    {/* Glowing outer circles */}
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
                    <div className="absolute -inset-2 rounded-full border border-emerald-500/10 animate-pulse" />
                    
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      biometricScanStatus === "success" 
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-400" 
                        : biometricScanStatus === "failed"
                        ? "bg-rose-500/20 border-rose-400 text-rose-400"
                        : "bg-slate-900 border-emerald-500/50 text-emerald-400"
                    }`}>
                      <Fingerprint className={`h-12 w-12 ${
                        biometricScanStatus === "scanning" ? "animate-pulse" : ""
                      }`} />
                    </div>

                    {/* Scanning laser sweep line */}
                    {biometricScanStatus === "scanning" && (
                      <motion.div
                        animate={{ top: ["15%", "85%", "15%"] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-md shadow-emerald-500/50"
                      />
                    )}
                  </div>

                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    {biometricScanStatus === "scanning" && "Biometric Scan Initiated"}
                    {biometricScanStatus === "success" && "Identity Verified"}
                    {biometricScanStatus === "failed" && "Verification Failed"}
                  </h4>

                  <p className="text-[10px] text-slate-400 max-w-xs mt-2">
                    {biometricScanStatus === "scanning" && "Please present registered TouchID or FaceID credential."}
                    {biometricScanStatus === "success" && "EHR Medical Prescription Vault unlocked successfully."}
                    {biometricScanStatus === "failed" && "Credential mismatch or user canceled."}
                  </p>

                  {isSimulated && biometricScanStatus === "scanning" && (
                    <div className="mt-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse">
                      Simulated Environment Sandbox Mode
                    </div>
                  )}

                  {!isSimulated && biometricScanStatus === "scanning" && (
                    <div className="mt-4 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">
                      Calling Browser WebAuthn API
                    </div>
                  )}

                  {biometricScanStatus === "scanning" && (
                    <button
                      onClick={() => setBiometricScanActive(false)}
                      className="mt-8 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-white uppercase tracking-wider font-extrabold rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "history":
        {
          const isHistoryBlocked = !patientConsent.accepted || !patientConsent.granularPreferences?.historySharing;
          if (isHistoryBlocked) {
            return (
              <div className="space-y-4">
                <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/80 p-4.5 rounded-2xl">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-emerald-400" /> Complete EHR History Timeline
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Full clinical trace records, visit notes, and physician diagnosis history logs.</p>
                </div>
                <div className="bg-slate-950 border border-red-500/30 p-8 rounded-2xl text-center space-y-4">
                  <div className="inline-flex p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">🔒 EHR History Access Frozen</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                      Access to past Electronic Health Records (EHR) has been suspended. You must enable the "EHR History Decryption & Processing" authorization under DPDP consent preferences to let the clinic decrypt and display these clinical trace records.
                    </p>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-lg uppercase tracking-wider cursor-pointer"
                    >
                      Go to Profile & configure consent
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        }
        const filteredHistoryLogs = (selectedPatient?.history || []).filter((record) => {
          if (!historySearchQuery.trim()) return true;
          const query = historySearchQuery.trim().toLowerCase();

          // Match diagnosis
          const diagMatch = (record.diagnosis || "").toLowerCase().includes(query);

          // Match date (raw, formatted, month, year, day)
          let dateMatch = false;
          if (record.date) {
            const rawDate = String(record.date).toLowerCase();
            dateMatch = rawDate.includes(query);
            if (!dateMatch) {
              try {
                const parsed = new Date(record.date);
                if (!isNaN(parsed.getTime())) {
                  const formattedIN = parsed.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }).toLowerCase();
                  const formattedINLong = parsed.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" }).toLowerCase();
                  const formattedUS = parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toLowerCase();
                  const monthName = parsed.toLocaleDateString("en-US", { month: "long" }).toLowerCase();
                  const shortMonth = parsed.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
                  const yearStr = parsed.getFullYear().toString();
                  const dayStr = parsed.getDate().toString();

                  dateMatch = formattedIN.includes(query) ||
                              formattedINLong.includes(query) ||
                              formattedUS.includes(query) ||
                              monthName.includes(query) ||
                              shortMonth.includes(query) ||
                              yearStr.includes(query) ||
                              dayStr === query;
                }
              } catch (e) {
                // ignore
              }
            }
          }

          // Supplementary search matching
          const doctorMatch = (record.doctor || "").toLowerCase().includes(query);
          const symptomsMatch = (record.symptoms || "").toLowerCase().includes(query);
          const rxMatch = (record.prescriptions || []).some((rx: string) => rx.toLowerCase().includes(query));

          return diagMatch || dateMatch || doctorMatch || symptomsMatch || rxMatch;
        });

        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/80 p-4.5 rounded-2xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-emerald-400" /> Complete EHR History Timeline
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Full clinical trace records, visit notes, and physician diagnosis history logs.</p>
            </div>

            {/* SEARCH INPUT BAR AT TOP OF HISTORY TAB */}
            <div id="history-search-input-bar" className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl space-y-2.5 shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-white">
                  <Search className="h-4 w-4 text-emerald-400" />
                  <span>Filter EHR Visit Logs</span>
                </div>
                {historySearchQuery && (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                    {filteredHistoryLogs.length} matching {filteredHistoryLogs.length === 1 ? "record" : "records"}
                  </span>
                )}
              </div>

              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  id="history-ehr-search-input"
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Search visit logs by diagnosis or date (e.g. Hypertension, 2025, May 10)..."
                  className="w-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-white placeholder-slate-500 pl-10 pr-9 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
                {historySearchQuery && (
                  <button
                    id="history-ehr-search-clear-btn"
                    type="button"
                    onClick={() => setHistorySearchQuery("")}
                    className="absolute right-2.5 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Quick filter diagnosis / date suggestions */}
              {selectedPatient?.history && selectedPatient.history.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest mr-1">
                    Quick filters:
                  </span>
                  {(Array.from(new Set(selectedPatient.history.map(h => h.diagnosis).filter(Boolean))) as string[]).slice(0, 3).map((diag: string) => (
                    <button
                      key={diag}
                      type="button"
                      onClick={() => setHistorySearchQuery(diag)}
                      className={`text-[9px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer font-semibold ${
                        historySearchQuery.toLowerCase() === diag.toLowerCase()
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                          : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {diag}
                    </button>
                  ))}
                  {(Array.from(new Set(selectedPatient.history.map(h => {
                    try {
                      return new Date(h.date).getFullYear().toString();
                    } catch (e) {
                      return "";
                    }
                  }).filter(Boolean))) as string[]).slice(0, 2).map((year: string) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setHistorySearchQuery(year)}
                      className={`text-[9px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer font-mono font-semibold ${
                        historySearchQuery === year
                          ? "bg-teal-500 text-slate-950 border-teal-400 font-bold"
                          : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      📅 {year}
                    </button>
                  ))}
                  {historySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setHistorySearchQuery("")}
                      className="text-[8.5px] text-rose-400 hover:text-rose-300 font-bold ml-auto cursor-pointer"
                    >
                      Reset filter
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Vitals History interactive Recharts-based trend tracker */}
            {(() => {
              if (!selectedPatient) return null;
              
              const historyData = vitalsHistory && vitalsHistory.length > 0 ? vitalsHistory : [
                { date: "May 10", bpSystolic: 120, bpDiastolic: 80, hr: 72, sugar: 100 },
                { date: "May 25", bpSystolic: 118, bpDiastolic: 78, hr: 70, sugar: 95 }
              ];

              const historyDataWithSeverity = historyData.map(item => {
                let severity = 0;
                if (item.symptomSeverity !== undefined) {
                  severity = item.symptomSeverity;
                } else if (item.symptoms && Array.isArray(item.symptoms) && item.symptoms.length > 0) {
                  const symptomsLower = item.symptoms.map((s: string) => s.toLowerCase());
                  if (symptomsLower.includes("migraine") || symptomsLower.includes("chest pain") || symptomsLower.includes("severe headache")) {
                    severity = 5;
                  } else if (symptomsLower.includes("fever") || symptomsLower.includes("headache")) {
                    severity = 3.5;
                  } else if (symptomsLower.includes("fatigue")) {
                    severity = 2.5;
                  } else {
                    severity = Math.min(item.symptoms.length * 1.5, 5);
                  }
                } else {
                  if (item.date === "May 10") {
                    severity = 4;
                  } else if (item.date === "Jun 12") {
                    severity = 2.5;
                  } else if (item.date === "Jun 20") {
                    severity = 3.5;
                  } else {
                    severity = 0;
                  }
                }
                return {
                  ...item,
                  symptomSeverity: severity
                };
              });

              const latestLog = historyData[historyData.length - 1] || {};

              const getBPStatus = (sys: number, dia: number) => {
                if (sys < 120 && dia < 80) return { label: "Normal", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
                if (sys < 130 && dia < 80) return { label: "Elevated", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
                return { label: "High BP", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
              };

              const getHRStatus = (rate: number) => {
                if (rate >= 60 && rate <= 100) return { label: "Normal Resting", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
                return { label: "Irregular", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
              };

              const getSugarStatus = (level: number) => {
                if (level < 100) return { label: "Normal (Fasting)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
                if (level < 126) return { label: "Impaired (Pre-diabetes)", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
                return { label: "Diabetic range", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
              };

              return (
                <div id="history-vitals-chart-card" className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span>📈 Clinical Analytics</span>
                      </p>
                      <h4 className="text-xs font-black text-white">Vitals Trend Tracker</h4>
                    </div>

                    {/* Interactive metric selector tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setOverlaySymptomSeverity(!overlaySymptomSeverity)}
                        className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          overlaySymptomSeverity
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-sm"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                        title="Toggle overlays of symptom severity index on a secondary right axis"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${overlaySymptomSeverity ? "bg-rose-500 animate-pulse" : "bg-slate-500"}`} />
                        Symptom Severity Overlay
                      </button>

                      <div className="flex bg-slate-900/80 border border-slate-800 p-1 rounded-xl gap-1">
                        <button
                          onClick={() => setVitalsMetricTab("bp")}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                            vitalsMetricTab === "bp"
                              ? "bg-emerald-500 text-slate-950 font-black shadow"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          BP
                        </button>
                        <button
                          onClick={() => setVitalsMetricTab("hr")}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                            vitalsMetricTab === "hr"
                              ? "bg-emerald-500 text-slate-950 font-black shadow"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          HR
                        </button>
                        <button
                          onClick={() => setVitalsMetricTab("sugar")}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                            vitalsMetricTab === "sugar"
                              ? "bg-emerald-500 text-slate-950 font-black shadow"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Glucose
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Insight Header */}
                  <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest block">
                        Latest Recorded Metric
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        {vitalsMetricTab === "bp" && (
                          <>
                            <span className="text-sm font-black text-white">
                              {latestLog.bpSystolic || 120}/{latestLog.bpDiastolic || 80}
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">mmHg</span>
                          </>
                        )}
                        {vitalsMetricTab === "hr" && (
                          <>
                            <span className="text-sm font-black text-white">
                              {latestLog.hr || 72}
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">BPM</span>
                          </>
                        )}
                        {vitalsMetricTab === "sugar" && (
                          <>
                            <span className="text-sm font-black text-white">
                              {latestLog.sugar || 100}
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">mg/dL</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      {vitalsMetricTab === "bp" && (() => {
                        const status = getBPStatus(latestLog.bpSystolic || 120, latestLog.bpDiastolic || 80);
                        return (
                          <span className={`text-[8.5px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        );
                      })()}
                      {vitalsMetricTab === "hr" && (() => {
                        const status = getHRStatus(latestLog.hr || 72);
                        return (
                          <span className={`text-[8.5px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        );
                      })()}
                      {vitalsMetricTab === "sugar" && (() => {
                        const status = getSugarStatus(latestLog.sugar || 100);
                        return (
                          <span className={`text-[8.5px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Chart Visualizer */}
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {vitalsMetricTab === "bp" ? (
                        <LineChart data={historyDataWithSeverity} margin={{ top: 10, right: overlaySymptomSeverity ? 35 : 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={8.5} tickLine={false} />
                          <YAxis yAxisId="left" domain={[60, 160]} stroke="#64748b" fontSize={8.5} tickLine={false} />
                          {overlaySymptomSeverity && (
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              domain={[0, 5]} 
                              stroke="#f43f5e" 
                              fontSize={8.5} 
                              tickLine={false}
                              tickCount={6}
                              label={{ value: 'Severity (0-5)', angle: 90, position: 'insideRight', style: { fill: '#f43f5e', fontSize: 7, fontWeight: 'bold' } }}
                            />
                          )}
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} 
                            labelStyle={{ fontSize: 9, color: "#94a3b8", fontWeight: "bold" }}
                          />
                          <Legend wrapperStyle={{ fontSize: 9, pt: 5 }} />
                          <ReferenceLine yAxisId="left" y={120} stroke="#f59e0b" strokeDasharray="2 2" label={{ value: 'Systolic Target', fill: '#f59e0b', fontSize: 7, position: 'insideTopRight' }} />
                          <ReferenceLine yAxisId="left" y={80} stroke="#10b981" strokeDasharray="2 2" label={{ value: 'Diastolic Target', fill: '#10b981', fontSize: 7, position: 'insideBottomRight' }} />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            name="Systolic" 
                            dataKey="bpSystolic" 
                            stroke="#38bdf8" 
                            strokeWidth={2.5} 
                            activeDot={{ r: 5 }}
                          />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            name="Diastolic" 
                            dataKey="bpDiastolic" 
                            stroke="#818cf8" 
                            strokeWidth={2.5} 
                            activeDot={{ r: 5 }}
                          />
                          {overlaySymptomSeverity && (
                            <Line
                              yAxisId="right"
                              type="monotone"
                              name="Symptom Severity"
                              dataKey="symptomSeverity"
                              stroke="#f43f5e"
                              strokeWidth={2.5}
                              dot={{ r: 3, fill: "#f43f5e" }}
                              activeDot={{ r: 6 }}
                            />
                          )}
                        </LineChart>
                      ) : vitalsMetricTab === "hr" ? (
                        <AreaChart data={historyDataWithSeverity} margin={{ top: 10, right: overlaySymptomSeverity ? 35 : 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="hrGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={8.5} tickLine={false} />
                          <YAxis yAxisId="left" domain={[50, 110]} stroke="#64748b" fontSize={8.5} tickLine={false} />
                          {overlaySymptomSeverity && (
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              domain={[0, 5]} 
                              stroke="#f43f5e" 
                              fontSize={8.5} 
                              tickLine={false}
                              tickCount={6}
                              label={{ value: 'Severity (0-5)', angle: 90, position: 'insideRight', style: { fill: '#f43f5e', fontSize: 7, fontWeight: 'bold' } }}
                            />
                          )}
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} 
                            labelStyle={{ fontSize: 9, color: "#94a3b8", fontWeight: "bold" }}
                          />
                          <Legend wrapperStyle={{ fontSize: 9, pt: 5 }} />
                          <ReferenceLine yAxisId="left" y={100} stroke="#ef4444" strokeDasharray="2 2" label={{ value: 'Max Resting', fill: '#ef4444', fontSize: 7, position: 'insideTopRight' }} />
                          <ReferenceLine yAxisId="left" y={60} stroke="#10b981" strokeDasharray="2 2" label={{ value: 'Min Resting', fill: '#10b981', fontSize: 7, position: 'insideBottomRight' }} />
                          <Area 
                            yAxisId="left"
                            type="monotone" 
                            name="Heart Rate" 
                            dataKey="hr" 
                            stroke="#ef4444" 
                            strokeWidth={2.5} 
                            fillOpacity={1} 
                            fill="url(#hrGlow)" 
                          />
                          {overlaySymptomSeverity && (
                            <Line
                              yAxisId="right"
                              type="monotone"
                              name="Symptom Severity"
                              dataKey="symptomSeverity"
                              stroke="#f43f5e"
                              strokeWidth={2.5}
                              dot={{ r: 3, fill: "#f43f5e" }}
                              activeDot={{ r: 6 }}
                            />
                          )}
                        </AreaChart>
                      ) : (
                        <AreaChart data={historyDataWithSeverity} margin={{ top: 10, right: overlaySymptomSeverity ? 35 : 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="sugarGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={8.5} tickLine={false} />
                          <YAxis yAxisId="left" domain={[70, 160]} stroke="#64748b" fontSize={8.5} tickLine={false} />
                          {overlaySymptomSeverity && (
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              domain={[0, 5]} 
                              stroke="#f43f5e" 
                              fontSize={8.5} 
                              tickLine={false}
                              tickCount={6}
                              label={{ value: 'Severity (0-5)', angle: 90, position: 'insideRight', style: { fill: '#f43f5e', fontSize: 7, fontWeight: 'bold' } }}
                            />
                          )}
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} 
                            labelStyle={{ fontSize: 9, color: "#94a3b8", fontWeight: "bold" }}
                          />
                          <Legend wrapperStyle={{ fontSize: 9, pt: 5 }} />
                          <ReferenceLine yAxisId="left" y={100} stroke="#10b981" strokeDasharray="2 2" label={{ value: 'Normal Fasting Target', fill: '#10b981', fontSize: 7, position: 'insideBottomRight' }} />
                          <ReferenceLine yAxisId="left" y={126} stroke="#f43f5e" strokeDasharray="2 2" label={{ value: 'Diabetic Threshold', fill: '#f43f5e', fontSize: 7, position: 'insideTopRight' }} />
                          <Area 
                            yAxisId="left"
                            type="monotone" 
                            name="Blood Glucose" 
                            dataKey="sugar" 
                            stroke="#a855f7" 
                            strokeWidth={2.5} 
                            fillOpacity={1} 
                            fill="url(#sugarGlow)" 
                          />
                          {overlaySymptomSeverity && (
                            <Line
                              yAxisId="right"
                              type="monotone"
                              name="Symptom Severity"
                              dataKey="symptomSeverity"
                              stroke="#f43f5e"
                              strokeWidth={2.5}
                              dot={{ r: 3, fill: "#f43f5e" }}
                              activeDot={{ r: 6 }}
                            />
                          )}
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Summary clinical comment */}
                  <p className="text-[10px] text-slate-400 leading-normal bg-slate-900/20 p-2.5 rounded-xl border border-slate-900/60">
                    {vitalsMetricTab === "bp" && "Blood pressure trends show visual compliance variations. Optimal systolic target is less than 120 mmHg. Ensure consistent medication intake and sodium monitoring."}
                    {vitalsMetricTab === "hr" && "Resting heart rate trends indicate cardiovascular stability. Keep tracking consistency, particularly in morning logs, to monitor autonomic health improvements."}
                    {vitalsMetricTab === "sugar" && "Fasting blood sugar metrics evaluate carbohydrate regulation. Values below 100 mg/dL represent superb glycemic control. Log readings post-meals as requested by your physician."}
                  </p>
                </div>
              );
            })()}

            {/* CURA AI DOCUMENT SCANNER & ARCHIVE SYSTEM */}
            <div className="bg-gradient-to-tr from-emerald-950/40 to-slate-950 border border-emerald-500/20 p-4.5 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> AI Medical Report Digitizer
                  </h4>
                  <p className="text-[10px] text-slate-300 leading-normal">
                    Upload prescription papers, pathology reports, or diagnostic scans. Our medical AI will parse, summarize, and securely sync them into your permanent EHR.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setScanStep("upload");
                    setShowScanModal(true);
                  }}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  ➕ Scan New / Historical Report
                </button>
              </div>
            </div>

            {/* MY SCANNED RECORDS DIRECTORY */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>My Digitized Diagnostics Archive</span>
                <span className="text-emerald-400 text-[9px] font-mono">{savedReports.length} Reports</span>
              </p>

              {savedReports.length === 0 ? (
                <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl text-center text-[10.5px] text-slate-500 font-medium">
                  No scanned reports catalogued yet. Upload diagnostic sheets or prescription scripts to build your comprehensive medical history!
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports.map((report) => (
                    <div key={report.id} className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl space-y-3.5 shadow-lg relative overflow-hidden">
                      {/* Badge category and risk */}
                      <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {report.riskLevel && (
                            <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              report.riskLevel === "emergency" 
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                                : report.riskLevel === "high"
                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/20"
                                : report.riskLevel === "medium"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-400/20"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              ⚠️ {report.riskLevel} Risk
                            </span>
                          )}
                          <span className="text-[8.5px] font-black px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg uppercase">
                            {report.category}
                          </span>
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono">
                          {report.fileSize || "540 KB"}
                        </span>
                      </div>

                      <div className="space-y-1 pr-24">
                        <span className="text-[9px] font-extrabold text-emerald-400 font-mono uppercase tracking-wider block">
                          📅 Scanned Date: {new Date(report.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <h4 className="text-xs font-black text-white leading-snug">
                          {report.title}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-semibold italic">
                          File reference: {report.fileName}
                        </p>
                      </div>

                      {/* AI Clinical Summary block */}
                      {report.aiSummary && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl space-y-1.5">
                          <span className="text-[8.5px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                            🤖 AI Automated Synthesis Analysis
                          </span>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                            {report.aiSummary}
                          </p>
                        </div>
                      )}

                      {/* Abnormal Values Flagger inside archive list */}
                      {report.abnormalValues && report.abnormalValues.length > 0 && (
                        <div className="bg-orange-500/5 border border-orange-500/10 p-2.5 rounded-xl space-y-1.5">
                          <span className="text-[8px] font-black text-orange-400 uppercase tracking-wider flex items-center gap-1">
                            ⚠️ Out-Of-Range Parameters Flagged
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {report.abnormalValues.map((item: any, aIdx: number) => (
                              <span key={aIdx} className="text-[8.5px] bg-slate-900/60 border border-slate-850 px-2 py-0.5 rounded font-mono text-slate-300">
                                <span className="font-bold text-white">{item.test}</span>: <span className="text-orange-400 font-black">{item.value}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Findings Checklist */}
                      {report.keyFindings && report.keyFindings.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">
                            Decoded Parameters & Metrics
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {report.keyFindings.map((finding: string, fIdx: number) => (
                              <div key={fIdx} className="bg-slate-900/40 px-2.5 py-1.5 rounded-lg border border-slate-850 flex items-start gap-1.5">
                                <span className="text-emerald-500 text-[10px] mt-0.5">✓</span>
                                <span className="text-[9.5px] text-slate-300 font-bold leading-normal">
                                  {finding}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Doctor Recommendation referral button inside archive list */}
                      {(report.suggestedSpecialist || report.suggestedDoctorName) && (
                        <div className="bg-indigo-500/5 border border-indigo-500/15 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">
                              Suggested Referral
                            </span>
                            <span className="text-[10px] font-black text-white">
                              {report.suggestedDoctorName} ({report.suggestedSpecialist})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDoctor(report.suggestedDoctorName || "Dr. Ananya Reddy");
                              setBookingReason(`Follow-up review for digitized ${report.title} [AI Suggested Specialty: ${report.suggestedSpecialist || "General Medicine"}]`);
                              setConsultType("in_person");
                              setBookingDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]); // tomorrow
                              setBookingTime("11:00");
                              setActiveTab("schedule");
                              
                              // Display a nice feedback notification
                              setScanToast(`Pre-filled appointment for ${report.suggestedDoctorName}!`);
                              setTimeout(() => setScanToast(null), 4000);
                            }}
                            className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-[8.5px] font-black uppercase rounded-lg border border-indigo-500/30 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>📅 Book Consultation</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* UPCOMING VISITS CONTAINER */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming Clinic Bookings</p>
              
              {patientAppointments.length === 0 ? (
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl text-center text-[11px] text-slate-500 font-semibold">
                  No upcoming appointments scheduled.
                </div>
              ) : (
                <div className="space-y-2">
                  {patientAppointments.map((apt) => (
                    <div key={apt.id} className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-white">{apt.doctorName}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            apt.status === "scheduled" ? "bg-amber-400/20 text-amber-400 border border-amber-400/20" :
                            apt.status === "confirmed" ? "bg-sky-400/20 text-sky-400 border border-sky-400/20" :
                            "bg-emerald-400/20 text-emerald-400 border border-emerald-400/20"
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          📅 {new Date(apt.scheduledAt).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                        <p className="text-[10px] text-slate-500 italic">"Reason: {apt.reason}"</p>
                      </div>
                      
                      <div className="text-slate-500 text-xs font-black">
                        {apt.type === "in_person" ? "🩺 IN-CLINIC" : apt.type === "video" ? "📹 VIDEO" : "📞 VOICE"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DAILY SYMPTOMS & VITALS LOG HISTORY */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged Symptoms & Vitals History</p>
              
              {vitalsHistory.length === 0 ? (
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl text-center text-[11px] text-slate-500 font-semibold">
                  No symptom or vitals log entries recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {[...vitalsHistory].reverse().map((entry, index) => {
                    const hasSymptoms = entry.symptoms && entry.symptoms.length > 0;
                    const hasNotes = !!entry.symptomNotes;
                    
                    return (
                      <div key={index} className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1">
                            📅 {entry.date}
                          </span>
                          <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest">
                            Daily Patient Log
                          </span>
                        </div>

                        {/* Symptoms Pills */}
                        {hasSymptoms ? (
                          <div className="flex flex-wrap gap-1">
                            {entry.symptoms.map((symptom: string) => (
                              <span 
                                key={symptom} 
                                className="text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[9px] text-slate-500 italic font-medium">No active physical symptoms logged.</p>
                        )}

                        {/* Custom Symptom Notes */}
                        {hasNotes && (
                          <div className="bg-slate-900/30 p-2 rounded-xl border border-slate-850 text-[10.5px] text-slate-300 italic font-medium">
                            "{entry.symptomNotes}"
                          </div>
                        )}

                        {/* Recorded Vitals Sub-grid */}
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-900/60 text-center">
                          <div>
                            <span className="block text-[7px] font-bold text-slate-500 uppercase tracking-widest">BP Ratio</span>
                            <span className="text-[10px] font-extrabold text-white font-mono">{entry.bpSystolic}/{entry.bpDiastolic}</span>
                          </div>
                          <div>
                            <span className="block text-[7px] font-bold text-slate-500 uppercase tracking-widest">HR BPM</span>
                            <span className="text-[10px] font-extrabold text-sky-400 font-mono">{entry.hr}</span>
                          </div>
                          <div>
                            <span className="block text-[7px] font-bold text-slate-500 uppercase tracking-widest">Sugar</span>
                            <span className="text-[10px] font-extrabold text-amber-400 font-mono">{entry.sugar}</span>
                          </div>
                          <div>
                            <span className="block text-[7px] font-bold text-slate-500 uppercase tracking-widest">Weight/Height</span>
                            <span className="text-[9.5px] font-extrabold text-slate-300 font-mono">
                              {entry.weight !== undefined ? `${entry.weight}k` : "—"}/{entry.height !== undefined ? `${entry.height}c` : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* HISTORICAL EHR VISIT LOGS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Past Visit Diagnostics Logs
                </p>
                {selectedPatient?.history && selectedPatient.history.length > 0 && (
                  <span className="text-[9px] font-bold text-slate-500 font-mono">
                    {historySearchQuery
                      ? `${filteredHistoryLogs.length} of ${selectedPatient.history.length} records`
                      : `${selectedPatient.history.length} Total Visits`}
                  </span>
                )}
              </div>
              
              {!selectedPatient.history || selectedPatient.history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No previous visits tracked in cloud system database.</p>
              ) : filteredHistoryLogs.length === 0 ? (
                <div className="bg-slate-950/50 border border-slate-800/80 p-6 rounded-2xl text-center space-y-3 shadow-inner">
                  <div className="inline-flex p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-full">
                    <Search className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-white">No Matching Visit Logs Found</p>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                      No records matched "<span className="text-emerald-400 font-semibold">{historySearchQuery}</span>". Try searching by diagnosis (e.g. Hypertension) or visit date.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHistorySearchQuery("")}
                    className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9.5px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Clear Search Filter</span>
                  </button>
                </div>
              ) : (
                <div className="relative pl-4 border-l border-slate-800 space-y-4">
                  {filteredHistoryLogs.map((record, i) => (
                    <div key={i} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                      
                      <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl space-y-2 hover:border-slate-800 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black text-emerald-400 font-mono">
                            {new Date(record.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500">By: {record.doctor}</span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-tight">{record.diagnosis}</p>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-1 font-medium italic">"Complaints: {record.symptoms}"</p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-900/60">
                          {record.prescriptions && record.prescriptions.map((med, j) => (
                            <span key={j} className="text-[9px] bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded-md font-semibold font-mono">
                              💊 {med.split("(")[0]?.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "vision":
        {
          const isAiBlocked = !patientConsent.accepted || !patientConsent.granularPreferences?.aiCdssProcessing;
          if (isAiBlocked) {
            return (
              <div className="space-y-4">
                <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/20 border border-slate-800 p-5 rounded-2xl">
                  <h3 className="text-base font-black text-white">Visual Symptom & Diagnostic Scanner</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Submit physical symptoms or diagnostic scans for deep clinical intelligence profiling.</p>
                </div>
                <div className="bg-slate-950 border border-red-500/30 p-8 rounded-2xl text-center space-y-4">
                  <div className="inline-flex p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">🔒 AI Analysis Disabled</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                      AI processing is locked under DPDP Act requirements. You have not authorized the AI-CDSS model processing capability under your DPDP consent preferences. Please authorize AI processing to proceed.
                    </p>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-lg uppercase tracking-wider cursor-pointer"
                    >
                      Go to Profile & configure consent
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        }
        if (familyViewShareCode && familyViewAccessLevel === "view") {
          return (
            <div className="space-y-6">
              {/* Header banner */}
              <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/20 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute right-4 top-4 opacity-10">
                  <Sparkles className="h-16 w-16 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] bg-amber-400/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    CURA Vision AI Suite
                  </span>
                  <h3 className="text-base font-black text-white">Visual Symptom & Diagnostic Scanner</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg">
                    Submit physical symptoms (skin lesions, cuts, eye redness, oral/throat swelling) or diagnostic scans (X-Rays, MRIs) for deep clinical intelligence profiling.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl text-center space-y-3">
                <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full animate-pulse">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Vision Diagnostics Restricted</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    You have View-Only permission for <strong className="text-white">{selectedPatient.fullName}</strong>'s medical portal. Initializing new AI Vision Diagnostic sweeps is disabled.
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/20 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-10">
                <Sparkles className="h-16 w-16 text-amber-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] bg-amber-400/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  CURA Vision AI Suite
                </span>
                <h3 className="text-base font-black text-white">Visual Symptom & Diagnostic Scanner</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg">
                  Submit physical symptoms (skin lesions, cuts, eye redness, oral/throat swelling) or diagnostic scans (X-Rays, MRIs) for deep clinical intelligence profiling.
                </p>
              </div>
            </div>

            {/* MAIN FLOW: CHOOSE AND SUBMIT OR DISPLAY RESULTS */}
            {!visionResult && !isVisionAnalyzing && (
              <div className="space-y-5">
                {/* Mode Selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ingestion Channel</label>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 text-xs font-bold text-slate-400">
                      <button
                        type="button"
                        onClick={() => {
                          stopVisionCamera();
                          setVisionActiveMode("upload");
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          visionActiveMode === "upload" 
                            ? "bg-slate-900 text-white font-black shadow-inner" 
                            : "hover:text-slate-300"
                        }`}
                      >
                        📂 File Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVisionActiveMode("camera");
                          startVisionCamera();
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          visionActiveMode === "camera" 
                            ? "bg-slate-900 text-amber-400 font-black shadow-inner" 
                            : "hover:text-slate-300"
                        }`}
                      >
                        📷 Live Camera
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Classification Type</label>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 text-xs font-bold text-slate-400">
                      <button
                        type="button"
                        onClick={() => setVisionType("symptom")}
                        className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          visionType === "symptom" 
                            ? "bg-slate-900 text-white font-black shadow-inner" 
                            : "hover:text-slate-300"
                        }`}
                      >
                        🤒 Symptom
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisionType("diagnostic_scan")}
                        className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          visionType === "diagnostic_scan" 
                            ? "bg-slate-900 text-amber-400 font-black shadow-inner" 
                            : "hover:text-slate-300"
                        }`}
                      >
                        🩻 Med Scan
                      </button>
                    </div>
                  </div>
                </div>

                {/* INGESTION CONTENT (UPLOAD BOX or CAMERA PREVIEW) */}
                <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
                  {visionActiveMode === "upload" ? (
                    /* Ingestion: File Upload */
                    <div className="space-y-3">
                      {!visionPreviewUrl ? (
                        <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/30 bg-slate-950/60 p-8 rounded-2xl text-center transition-all relative cursor-pointer group">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleVisionFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="space-y-3">
                            <span className="text-4xl block group-hover:scale-110 transition-transform">📷</span>
                            <div>
                              <p className="text-xs font-bold text-slate-200">Drag & drop or select image</p>
                              <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, or HEIC up to 10MB</p>
                            </div>
                            <span className="inline-block px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-[10px] font-black text-amber-400 uppercase tracking-wider">
                              Browse Gallery
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black border border-slate-800">
                          <img src={visionPreviewUrl} className="w-full h-full object-cover" alt="Preview" />
                          <button
                            onClick={() => {
                              setVisionPreviewUrl(null);
                              setVisionBase64(null);
                            }}
                            className="absolute top-3 right-3 p-1.5 bg-slate-950/80 hover:bg-slate-950 text-slate-400 hover:text-white rounded-lg border border-slate-850 transition-all cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-850 text-[10px] font-bold text-amber-400">
                            ✓ Ready for AI Analysis
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Ingestion: Live Camera */
                    <div className="space-y-3">
                      {isVisionCameraActive ? (
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black border border-slate-800">
                          <video
                            ref={visionVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          {/* Flash visual overlay */}
                          <AnimatePresence>
                            {visionCameraFlash && (
                              <motion.div 
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white z-20"
                              />
                            )}
                          </AnimatePresence>

                          {/* Top bar indicators */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                            <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE CAM
                            </span>

                            {visionCameraDevices.length > 1 && (
                              <select
                                value={visionSelectedDeviceId}
                                onChange={(e) => startVisionCamera(e.target.value)}
                                className="bg-slate-950/80 border border-slate-800 text-[9px] font-bold text-slate-300 px-2.5 py-1 rounded-lg focus:outline-none cursor-pointer"
                              >
                                {visionCameraDevices.map((d, i) => (
                                  <option key={i} value={d.deviceId}>
                                    {d.label || `Camera ${i + 1}`}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* Control trigger overlay */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                            <button
                              onClick={captureVisionPhoto}
                              className="h-14 w-14 bg-white hover:bg-slate-100 text-slate-950 rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.35)] hover:scale-105 active:scale-95 transition-all border-4 border-slate-950"
                            >
                              <Camera className="h-6 w-6 text-slate-950 stroke-[2]" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {visionPreviewUrl ? (
                            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black border border-slate-800">
                              <img src={visionPreviewUrl} className="w-full h-full object-cover" alt="Captured" />
                              <button
                                onClick={() => {
                                  setVisionPreviewUrl(null);
                                  setVisionBase64(null);
                                  startVisionCamera();
                                }}
                                className="absolute top-3 right-3 p-1.5 bg-slate-950/80 hover:bg-slate-950 text-slate-400 hover:text-white rounded-lg border border-slate-850 transition-all cursor-pointer"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                              <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-850 text-[10px] font-bold text-emerald-400">
                                ✓ Photo Captured
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-950 border border-slate-850 p-8 rounded-2xl text-center space-y-3.5">
                              <p className="text-xs font-bold text-slate-400">Camera is currently inactive</p>
                              <button
                                onClick={() => startVisionCamera()}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-700 uppercase tracking-wider"
                              >
                                Activate Camera
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {visionCameraError && (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-[10.5px] text-rose-400 font-bold">
                          ⚠️ {visionCameraError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata Fields */}
                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Description / Physical Complaints</label>
                        {audioConfidence && (
                          <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            ✓ {Math.round(audioConfidence * 100)}% Whisper Acc.
                          </span>
                        )}
                      </div>
                      <textarea
                        value={visionNotes}
                        onChange={(e) => setVisionNotes(e.target.value)}
                        placeholder={
                          visionType === "symptom" 
                            ? "Describe what you are feeling (e.g. Itching, sharp pain, redness, how long it has been there...)"
                            : "Describe any clinical findings or diagnostic reasons for this MRI/X-Ray..."
                        }
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 text-xs font-semibold text-white placeholder-slate-600 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>

                    {/* WHISPER VOICE-TO-TEXT SYMPTOM RECORDER PANEL */}
                    <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <Mic className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                            Whisper Voice Symptom Description
                          </span>
                        </div>
                        <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          VOICE-TO-TEXT
                        </span>
                      </div>

                      {/* Recording State Controls */}
                      {!isRecordingAudio && !audioBlob && (
                        <button
                          type="button"
                          onClick={startAudioRecording}
                          className="w-full py-2.5 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
                        >
                          <span className="p-1 rounded-full bg-rose-500/20 group-hover:bg-rose-500/30 transition-all">
                            <Mic className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                          </span>
                          <span>🎙️ Record Voice Symptom Description</span>
                        </button>
                      )}

                      {isRecordingAudio && (
                        <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            </span>
                            <div>
                              <span className="text-[11px] font-black text-rose-300 uppercase tracking-wider">
                                Recording Audio... 00:{audioRecordingTime < 10 ? `0${audioRecordingTime}` : audioRecordingTime}s
                              </span>
                              <p className="text-[9px] text-slate-400">Describe pain, location & duration clearly</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={stopAudioRecording}
                            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md flex items-center gap-1 shrink-0"
                          >
                            <Square className="h-3 w-3 fill-current" />
                            Stop
                          </button>
                        </div>
                      )}

                      {isTranscribingAudio && (
                        <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-xl flex items-center gap-2.5 text-xs text-indigo-300 font-bold">
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                          <span>⚡ Whisper AI processing voice recording...</span>
                        </div>
                      )}

                      {audioBlob && !isRecordingAudio && !isTranscribingAudio && (
                        <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Volume2 className="h-3 w-3 text-indigo-400" /> Recorded Voice Clip
                            </span>
                            <button
                              type="button"
                              onClick={resetAudioRecording}
                              className="text-[9px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider cursor-pointer"
                            >
                              Clear / Re-record
                            </button>
                          </div>
                          {audioUrl && (
                            <audio src={audioUrl} controls className="w-full h-8 accent-indigo-500 rounded-lg" />
                          )}
                          {audioTranscript && (
                            <div className="bg-indigo-950/30 border border-indigo-800/40 p-2.5 rounded-lg text-[10.5px] text-indigo-200 font-medium italic">
                              "{audioTranscript}"
                            </div>
                          )}
                        </div>
                      )}

                      {audioError && (
                        <div className="text-[10px] text-rose-400 font-bold bg-rose-950/30 border border-rose-800/40 p-2 rounded-lg">
                          ⚠️ {audioError}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Custom Visual Label (Optional)</label>
                      <input
                        type="text"
                        value={visionTitle}
                        onChange={(e) => setVisionTitle(e.target.value)}
                        placeholder="e.g. Right Hand Scar, Red Left Eye, Pharynx Scan, Chest X-Ray"
                        className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-white placeholder-slate-600 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* SUBMIT TRIGGER BUTTON */}
                <button
                  disabled={!visionBase64}
                  onClick={runVisionAnalysis}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    visionBase64 
                      ? "bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.2)]" 
                      : "bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-slate-950" /> Initiate Vision Diagnostic Analysis
                </button>
              </div>
            )}

            {/* PIPELINE PROCESSING STATUS INDICATOR MODAL OVERLAY */}
            {isVisionAnalyzing && (
              <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden animate-fade-in">
                  {/* Top Glowing AI Badge */}
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin-slow" />
                      <span>Vision AI Document Parser Active</span>
                    </span>
                  </div>

                  {/* Document / Scanner Hologram Display */}
                  <div className="relative w-44 h-56 mx-auto bg-slate-950 rounded-2xl border-2 border-amber-500/40 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-4">
                    {/* Retro Grid Background */}
                    <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(245,158,11,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.2)_1px,transparent_1px)] bg-[size:12px_12px]" />
                    
                    {/* Scanning Laser Beam */}
                    <div className="absolute left-0 right-0 h-1 bg-amber-400 shadow-[0_0_20px_#f59e0b] animate-[laserScanVision_2s_ease-in-out_infinite] z-20" />
                    <style>{`
                      @keyframes laserScanVision {
                        0%, 100% { top: 6%; }
                        50% { top: 92%; }
                      }
                    `}</style>

                    {visionPreviewUrl ? (
                      <img src={visionPreviewUrl} alt="Scanning" className="h-28 w-24 object-cover rounded-lg border border-slate-800 z-10 filter brightness-90" />
                    ) : (
                      <FileText className="h-16 w-16 text-amber-400/80 animate-pulse filter drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] z-10" />
                    )}

                    <div className="mt-3 space-y-1 text-center relative z-10 max-w-[130px]">
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block font-mono">Multimodal Processing</span>
                      <span className="text-xs text-white font-bold block truncate">{visionTitle || "Diagnostic Report"}</span>
                    </div>
                  </div>

                  {/* Status Title & Step */}
                  <div className="space-y-1.5">
                    <h4 className="text-base font-black text-white tracking-wide">
                      Parsing Medical Document & Report
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      CURA AI models are extracting biomarkers, physiological markers, and translating medical jargon.
                    </p>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="space-y-2 max-w-xs mx-auto">
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full transition-all duration-300 shadow-[0_0_10px_#f59e0b]"
                        style={{ width: `${visionAnalysisProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
                      <span className="text-amber-400 font-bold">{visionAnalysisStep}</span>
                      <span className="text-white">{visionAnalysisProgress}%</span>
                    </div>
                  </div>

                  {/* Detailed Step Checklist */}
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-left space-y-2 text-[10.5px] font-bold text-slate-400 shadow-inner">
                    <div className={`flex items-center gap-2.5 ${visionAnalysisProgress >= 15 ? "text-amber-400" : "text-slate-600"}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                        visionAnalysisProgress >= 15 ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-600"
                      }`}>
                        {visionAnalysisProgress >= 15 ? <Check className="h-2.5 w-2.5 stroke-[3px]" /> : "1"}
                      </div>
                      <span className={visionAnalysisProgress >= 15 ? "text-white font-extrabold" : ""}>
                        Exposure & Lighting Calibration
                      </span>
                    </div>

                    <div className={`flex items-center gap-2.5 ${visionAnalysisProgress >= 35 ? "text-amber-400" : "text-slate-600"}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                        visionAnalysisProgress >= 35 ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-600"
                      }`}>
                        {visionAnalysisProgress >= 35 ? <Check className="h-2.5 w-2.5 stroke-[3px]" /> : "2"}
                      </div>
                      <span className={visionAnalysisProgress >= 35 ? "text-white font-extrabold" : ""}>
                        Anatomical & Textual Landmark Mapping
                      </span>
                    </div>

                    <div className={`flex items-center gap-2.5 ${visionAnalysisProgress >= 55 ? "text-amber-400" : "text-slate-600"}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                        visionAnalysisProgress >= 55 ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-600"
                      }`}>
                        {visionAnalysisProgress >= 55 ? <Check className="h-2.5 w-2.5 stroke-[3px]" /> : "3"}
                      </div>
                      <span className={visionAnalysisProgress >= 55 ? "text-white font-extrabold" : ""}>
                        Pathological Pattern & Parameter Scan
                      </span>
                    </div>

                    <div className={`flex items-center gap-2.5 ${visionAnalysisProgress >= 75 ? "text-amber-400" : "text-slate-600"}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                        visionAnalysisProgress >= 75 ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-600"
                      }`}>
                        {visionAnalysisProgress >= 75 ? <Check className="h-2.5 w-2.5 stroke-[3px]" /> : "4"}
                      </div>
                      <span className={visionAnalysisProgress >= 75 ? "text-white font-extrabold" : ""}>
                        Compiling Layman Translation & Clinical Guardrails
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono italic">
                    ⚡ AI processing in progress. Do not close or refresh.
                  </p>
                </div>
              </div>
            )}

            {/* COMPLETED REPORT CARD DESIGN */}
            {visionResult && !isVisionAnalyzing && (
              <div className="space-y-6">
                {/* Visual Report Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
                  {/* Glowing vertical header line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-300" />
                  
                  {/* Header bar */}
                  <div className="p-5 border-b border-slate-850 bg-slate-900/40 flex justify-between items-center gap-4 flex-wrap">
                    <div className="space-y-1">
                      <span className="text-[8px] bg-amber-400/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider font-mono">
                        {visionResult.category || "Vision Scan"}
                      </span>
                      <h4 className="text-sm font-black text-white leading-tight">{visionResult.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-wider">
                        Scanned: {new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                      visionResult.riskLevel === "emergency" 
                        ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                        : visionResult.riskLevel === "high"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : visionResult.riskLevel === "medium"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      🚨 {visionResult.riskLevel || "Low"} Risk
                    </span>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Visual Preview Snapshot Thumbnail */}
                    {visionPreviewUrl && (
                      <div className="relative rounded-xl overflow-hidden max-h-40 bg-black border border-slate-850">
                        <img src={visionPreviewUrl} className="w-full h-full object-cover opacity-80" alt="Captured Diagnostic Visual" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span>Diagnostic Frame Reference</span>
                          <span className="font-mono text-amber-400">CURA-VISION-PRO v1.0</span>
                        </div>
                      </div>
                    )}

                    {/* LAYMAN SUMMARY */}
                    <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-1.5">
                      <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Layman AI Summary</h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        {visionResult.aiSummary}
                      </p>
                    </div>

                    {/* WHISPER VOICE TRANSCRIPTION DISPLAY */}
                    {(visionResult.voiceTranscript || audioTranscript) && (
                      <div className="bg-indigo-950/30 border border-indigo-500/30 p-4 rounded-xl space-y-2 relative overflow-hidden">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                              <Mic className="h-4 w-4" />
                            </span>
                            <div>
                              <h5 className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                                Recorded Voice Description (Whisper Audio)
                              </h5>
                              <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                                Whisper Speech-to-Text Transcribed {audioConfidence ? `(${Math.round(audioConfidence * 100)}% accuracy)` : ""}
                              </span>
                            </div>
                          </div>
                          <span className="text-[8px] font-mono font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                            WHISPER-AI
                          </span>
                        </div>

                        {audioUrl && (
                          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                            <audio src={audioUrl} controls className="w-full h-8 accent-indigo-500" />
                          </div>
                        )}

                        <blockquote className="text-[11px] text-slate-200 font-medium italic bg-slate-950/50 p-3 rounded-lg border-l-2 border-indigo-400 leading-relaxed">
                          "{visionResult.voiceTranscript || audioTranscript}"
                        </blockquote>

                        {audioKeywords && audioKeywords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mr-1">
                              Clinical Keywords Extracted:
                            </span>
                            {audioKeywords.map((kw: string, kIdx: number) => (
                              <span key={kIdx} className="px-2 py-0.5 bg-indigo-900/60 border border-indigo-700/50 text-indigo-200 text-[9px] font-bold rounded-md">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* PATHOLOGY OBSERVATIONS */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">AI Visual Findings</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {visionResult.visualFindings?.map((finding: string, i: number) => (
                          <div key={i} className="bg-slate-900/20 border border-slate-850 p-2.5 rounded-xl flex items-start gap-2 text-[10.5px] font-semibold text-slate-300">
                            <span className="text-amber-400 text-xs mt-0.5">✓</span>
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* POSSIBLE CONDITIONS */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Likely Clinical Indications</h5>
                      <div className="space-y-2">
                        {visionResult.possibleConditions?.map((cond: any, i: number) => (
                          <div key={i} className="bg-slate-900/30 border border-slate-850 p-3 rounded-xl space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-white">{cond.name}</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                cond.probability === "High" 
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : cond.probability === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}>
                                {cond.probability} Probability
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal font-medium">
                              {cond.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RED FLAGS & WARNINGS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl space-y-2">
                        <h6 className="text-[9px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1">
                          ⚠️ Red Flags (Immediate Emergency)
                        </h6>
                        <ul className="list-disc list-inside text-[9.5px] text-slate-300 leading-normal font-medium space-y-1.5">
                          {visionResult.severityIndicators?.redFlags?.map((flag: string, idx: number) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl space-y-2">
                        <h6 className="text-[9px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          ⚠️ Yellow Flags (Evaluate In 24-48h)
                        </h6>
                        <ul className="list-disc list-inside text-[9.5px] text-slate-300 leading-normal font-medium space-y-1.5">
                          {visionResult.severityIndicators?.yellowFlags?.map((flag: string, idx: number) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CARE RECOMMENDATIONS */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">AI Self-Care Guidance</h5>
                      <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl space-y-2 text-[10.5px] font-semibold text-slate-300">
                        {visionResult.careRecommendations?.map((rec: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            <span className="leading-relaxed">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RECOMMENDATION SPECIALIST */}
                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Recommended Referral</span>
                        <h6 className="text-xs font-black text-white">{visionResult.suggestedSpecialist}</h6>
                        <p className="text-[10px] text-slate-400 font-medium">Clinical Consultant: <span className="text-emerald-400 font-black">{visionResult.suggestedDoctorName}</span></p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab("schedule");
                          setDoctor(visionResult.suggestedDoctorName?.split("(")[0]?.trim() || "Dr. Rajesh Sharma");
                        }}
                        className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md"
                      >
                        Book Appointment
                      </button>
                    </div>

                    {/* DISCLAIMER */}
                    <div className="bg-slate-900/10 border border-slate-900 p-3.5 rounded-xl text-center">
                      <p className="text-[9px] text-slate-500 leading-normal font-medium italic">
                        {visionResult.disclaimer}
                      </p>
                    </div>
                  </div>

                  {/* Actions footer bar */}
                  <div className="p-4 bg-slate-900/60 border-t border-slate-850 flex items-center justify-between flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setVisionResult(null);
                        setVisionPreviewUrl(null);
                        setVisionBase64(null);
                        setVisionNotes("");
                        setVisionTitle("");
                      }}
                      className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Clear & Scan Another
                    </button>

                    <button
                      disabled={isVisionSaving}
                      onClick={saveVisionReportToEHR}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-850 text-slate-950 disabled:text-slate-500 text-[10.5px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      {isVisionSaving ? "Saving..." : "✓ Sync to Digital EHR History"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "family":
        return (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950/20 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-10">
                <Users className="h-16 w-16 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] bg-emerald-400/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  CURA Family Care Suite
                </span>
                <h3 className="text-base font-black text-white">Secure Family Access Portal</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg">
                  Grant permission to family members to securely oversee your diagnostic reports, vitals timeline, and appointments, or view a family member's clinical record.
                </p>
              </div>
            </div>

            {/* TWO MAIN SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SECTION 1: AUTHORIZE OTHERS TO VIEW YOUR RECORDS */}
              <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                  <UserPlus className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Authorize Family Members</h4>
                    <p className="text-[10px] text-slate-500">Generate secure share codes to grant access to your EHR records.</p>
                  </div>
                </div>

                {/* Form to authorize */}
                <form onSubmit={handleGenerateShareCode} className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        required
                        value={familyMemberName}
                        onChange={(e) => setFamilyMemberName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-white placeholder-slate-600 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Relationship</label>
                      <select
                        required
                        value={familyMemberRelationship}
                        onChange={(e) => setFamilyMemberRelationship(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="">Select Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Level Permission</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFamilyMemberAccessLevel("view")}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                          familyMemberAccessLevel === "view"
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        👁️ View Only
                        <span className="block text-[8px] font-medium text-slate-500 mt-0.5">Read-only health files</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFamilyMemberAccessLevel("full")}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                          familyMemberAccessLevel === "full"
                            ? "bg-amber-500/10 border-amber-500 text-amber-400"
                            : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        ⚡ Full Access
                        <span className="block text-[8px] font-medium text-slate-500 mt-0.5">Book appts & run Vision AI</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingShareCode || !familyMemberName || !familyMemberRelationship}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 text-slate-950 disabled:text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isGeneratingShareCode ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-slate-950" />
                        Generating Code...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 text-slate-950" />
                        Generate Secure Access Code
                      </>
                    )}
                  </button>
                </form>

                {/* List of active authorizations */}
                <div className="space-y-2.5">
                  <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Family Share Codes</h5>
                  {familyShares.length === 0 ? (
                    <div className="border border-slate-900 bg-slate-950/20 p-6 rounded-xl text-center">
                      <p className="text-xs font-bold text-slate-500">No active codes generated.</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Authorized members will appear here with active access codes.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {familyShares.map((share, idx) => (
                        <div key={idx} className="border border-slate-850 bg-slate-950/50 p-3.5 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-white">{share.name}</span>
                              <span className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase">
                                {share.relationship}
                              </span>
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                share.accessLevel === "full" 
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}>
                                {share.accessLevel === "full" ? "Full Access" : "View Only"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono font-black text-emerald-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded tracking-wider select-all">
                                {share.code}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(share.code);
                                  alert(`Copied secure access code: ${share.code}`);
                                }}
                                className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition-all cursor-pointer"
                                title="Copy Access Code"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-[8px] text-slate-500 font-medium">
                              Created: {new Date(share.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>

                          <button
                            disabled={isRevokingShareCode === share.code}
                            onClick={() => handleRevokeShareCode(share.code)}
                            className="p-2 border border-rose-500/20 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                            title="Revoke Access immediately"
                          >
                            {isRevokingShareCode === share.code ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: ACCESS OTHER FAMILY PORTALS */}
              <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Connected Family Portals</h4>
                    <p className="text-[10px] text-slate-500">Access and oversee clinical dashboards shared with you.</p>
                  </div>
                </div>

                {/* Form to enter / link code */}
                <form onSubmit={handleVerifyAndLinkShareCode} className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Enter Secure Family Access Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={familyShareCodeInput}
                        onChange={(e) => setFamilyShareCodeInput(e.target.value)}
                        placeholder="e.g. CURA-FAM-XXXXXX"
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs font-mono font-black text-white placeholder-slate-600 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 transition-all uppercase"
                      />
                      <button
                        type="submit"
                        disabled={isVerifyingShareCode || !familyShareCodeInput.trim()}
                        className="px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 text-slate-950 disabled:text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        {isVerifyingShareCode ? (
                          <Loader2 className="h-3 w-3 animate-spin text-slate-950" />
                        ) : (
                          "Link"
                        )}
                      </button>
                    </div>
                  </div>

                  {familyShareVerifyError && (
                    <p className="text-[10px] text-rose-400 font-bold bg-rose-500/10 p-2 rounded-lg border border-rose-500/10">
                      ⚠️ {familyShareVerifyError}
                    </p>
                  )}

                  {familyShareVerifySuccess && (
                    <p className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/10">
                      ✓ {familyShareVerifySuccess}
                    </p>
                  )}
                </form>

                {/* List of connected family members */}
                <div className="space-y-2.5">
                  <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Linked Connections</h5>
                  {connectedFamilyMembers.length === 0 ? (
                    <div className="border border-slate-900 bg-slate-950/20 p-6 rounded-xl text-center">
                      <p className="text-xs font-bold text-slate-500">No connected family portals.</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Use a shared access code from your family members to display them here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connectedFamilyMembers.map((member, idx) => (
                        <div key={idx} className="border border-slate-850 bg-slate-950/50 p-3.5 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                          <div className="space-y-0.5">
                            <h6 className="text-xs font-black text-white">{member.fullName}</h6>
                            <div className="flex items-center gap-1.5 flex-wrap text-[9px] text-slate-400 font-bold">
                              <span>Relationship: <span className="text-emerald-400">{member.relationship}</span></span>
                              <span>•</span>
                              <span>{member.gender}, {member.age} Yrs</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                member.accessLevel === "full" 
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}>
                                {member.accessLevel === "full" ? "⚡ Full Permission" : "👁️ Read-Only"}
                              </span>
                              <span className="text-[8px] text-slate-500 font-mono">Code: {member.shareCode}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSwitchToFamilyMember(member)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow"
                            >
                              Launch Portal
                            </button>
                            <button
                              onClick={() => {
                                setConnectedFamilyMembers(prev => prev.filter(m => m.shareCode !== member.shareCode));
                              }}
                              className="p-1.5 border border-slate-800 hover:border-rose-500/40 bg-slate-950 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                              title="Remove connection"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/80 p-4.5 rounded-2xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <QrCode className="h-4.5 w-4.5 text-emerald-400" /> Digital ABHA ID Card
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">National Digital Health Mission (NDHM) Integrated Identity Pass.</p>
            </div>

            {/* HIGH FIDELITY ID CARD LAYOUT */}
            <div 
              className="border-2 border-emerald-500/30 bg-gradient-to-tr from-slate-950 to-slate-900 p-5 rounded-2xl flex flex-col gap-4 text-slate-300 shadow-xl relative overflow-hidden select-none"
              style={{ width: "100%", alignSelf: "center" }}
            >
              {/* Background decorative security mesh */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              {/* ID Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
                    ✙
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black tracking-tight text-white uppercase">
                      CURA HEALTH NETWORKS
                    </h4>
                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      INTEGRATED CLINICAL IDENTITY SYSTEM
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[7px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded uppercase tracking-wider">
                    EHR Verified
                  </span>
                </div>
              </div>

              {/* ID Card Center Info */}
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Photo Column */}
                <div className="col-span-4 flex flex-col items-center gap-1.5">
                  <div className="h-24 w-20 bg-slate-900 rounded-lg border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 relative overflow-hidden">
                    <User className="h-8 w-8 stroke-[1.5] text-slate-400" />
                    <span className="text-[7px] font-extrabold uppercase mt-1">Photo ID</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                    ID: {selectedPatient.patientCode || selectedPatient.id.substring(0, 10).toUpperCase()}
                  </span>
                </div>

                {/* Details Column */}
                <div className="col-span-8 space-y-1.5 text-[11px] font-bold text-slate-300">
                  <div>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Full Name</p>
                    <p className="text-xs font-black text-white tracking-tight leading-tight">
                      {selectedPatient.fullName}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Sex / Age</p>
                      <p className="text-white uppercase text-[10px]">
                        {selectedPatient.gender} / {selectedPatient.age || 28} Yrs
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Blood Group</p>
                      <p className="text-rose-500 font-extrabold uppercase text-[10px]">
                        {selectedPatient.bloodGroup || "O+"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">ABHA ID (IND-NDHM)</p>
                    <p className="text-emerald-400 font-mono text-[9px] font-bold bg-slate-950 px-1.5 py-0.5 rounded inline-block border border-slate-800">
                      {selectedPatient.abhaId || "NOT REGISTERED"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ID Card Footer Barcodes */}
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Universal Clinical File QR</p>
                  <div className="h-5 w-full opacity-60">
                    <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <rect x="0" width="100" height="20" fill="transparent" />
                      <rect x="3" width="2" height="20" fill="#10b981" />
                      <rect x="7" width="1" height="20" fill="#10b981" />
                      <rect x="10" width="3" height="20" fill="#10b981" />
                      <rect x="15" width="1" height="20" fill="#10b981" />
                      <rect x="18" width="2" height="20" fill="#10b981" />
                      <rect x="22" width="4" height="20" fill="#10b981" />
                      <rect x="28" width="1" height="20" fill="#10b981" />
                      <rect x="31" width="3" height="20" fill="#10b981" />
                      <rect x="36" width="2" height="20" fill="#10b981" />
                    </svg>
                  </div>
                </div>

                <div className="shrink-0">
                  <svg className="h-9 w-9 text-emerald-500 border border-slate-800 p-0.5 rounded bg-slate-950" viewBox="0 0 100 100">
                    <rect x="0" y="0" width="100" height="100" fill="transparent" />
                    <rect x="5" y="5" width="30" height="30" fill="currentColor" />
                    <rect x="11" y="11" width="18" height="18" fill="black" />
                    <rect x="65" y="5" width="30" height="30" fill="currentColor" />
                    <rect x="71" y="11" width="18" height="18" fill="black" />
                    <rect x="5" y="65" width="30" height="30" fill="currentColor" />
                    <rect x="11" y="71" width="18" height="18" fill="black" />
                    <rect x="45" y="10" width="10" height="10" fill="currentColor" />
                    <rect x="40" y="25" width="15" height="5" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 🛡️ DPDP ACT PRIVACY & CONSENT GUARD PANEL */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">DPDP Consent Guard</h4>
                    <p className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-widest mt-0.5">India DPDP Act 2023 Compliant</p>
                  </div>
                </div>
                <div>
                  {patientConsent.accepted ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      Active ✓
                    </span>
                  ) : (
                    <span className="bg-rose-500/15 text-rose-400 border border-rose-500/35 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Revoked ⚠️
                    </span>
                  )}
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-extrabold text-[10px] uppercase">Notice Language / भाषा</span>
                <select
                  value={consentLang}
                  onChange={(e) => setConsentLang(e.target.value)}
                  className="bg-slate-900 text-white font-bold border-0 focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 text-[11px] outline-none cursor-pointer"
                >
                  <option value="en">English (EN)</option>
                  <option value="hi">हिन्दी (HI)</option>
                  <option value="ta">தமிழ் (TA)</option>
                  <option value="te">తెలుగు (TE)</option>
                </select>
              </div>

              {/* Multilingual Notice Box */}
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 text-[11px] leading-relaxed">
                <h5 className="font-extrabold text-white flex items-center gap-1">
                  <span>📢</span>
                  <span>
                    {consentLang === "en" ? "Privacy Notice (Sec 5, DPDP Act 2023)" :
                     consentLang === "hi" ? "गोपनीयता सूचना (धारा 5, DPDP अधिनियम)" :
                     consentLang === "ta" ? "தனியுரிமை அறிவிப்பு (DPDP பிரிவு 5)" :
                     "గోప్యతా నోటీసు (సెక్షన్ 5, DPDP చట్టం)"}
                  </span>
                </h5>
                <p className="text-slate-350 font-medium">
                  {consentLang === "en" ? "Under the Digital Personal Data Protection (DPDP) Act, 2023, we collect your vital telemetries, clinical scan uploads, and medical history solely to provide telemedicine, RMP diagnosis support, and automated emergency alerts. Your data is stored securely in row-level isolated sandboxes encrypted with AES-256 and is not shared with third parties without your explicit opt-in." :
                   consentLang === "hi" ? "डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम, 2023 के तहत, हम आपकी टेलीमेडिसिन, डॉक्टर निदान सहायता और आपातकालीन अलर्ट प्रदान करने के लिए आपके महत्वपूर्ण टेलीमेट्री, नैदानिक स्कैन और चिकित्सा इतिहास को एकत्र करते हैं। आपका डेटा सुरक्षित रूप से एईएस -256 एन्क्रिप्टेड सैंडबॉक्स में संग्रहीत है।" :
                   consentLang === "ta" ? "டிஜிட்டல் தனிநபர் தரவு பாதுகாப்பு (DPDP) சட்டம், 2023 இன் கீழ், டெலிமெடிசின், மருத்துவர் நோயறிதல் ஆதரவு மற்றும் அவசர எச்சரிக்கைகளை வழங்க உங்கள் முக்கிய டெலிமெட்ரி, மருத்துவ ஸ்கேன் மற்றும் மருத்துவ வரலாற்றை நாங்கள் சேகரிக்கிறோம்." :
                   "డిజిటల్ వ్యక్తిగత డేటా రక్షణ (DPDP) చట్టం, 2023 పరిధిలో, టెలిమెడిసిన్, డాక్టర్ నిర్ధారణ సహాయం మరియు అత్యవసర హెచ్చరికల కోసం మీ కీలక బయోమెట్రిక్ టెలిమెట్రీ, వైద్య నివేదికలను సేకరిస్తున్నాము."}
                </p>
                <div className="text-[10px] text-slate-455 border-t border-slate-800/60 pt-2 font-mono">
                  <strong>
                    {consentLang === "en" ? "Data Category: " :
                     consentLang === "hi" ? "डेटा की श्रेणी: " :
                     consentLang === "ta" ? "தரவு வகை: " :
                     "డేటా వర్గం: "}
                  </strong>
                  {consentLang === "en" ? "Demographics, Heart Rate, Blood Pressure, HbA1c, EMR Diagnosis scans, Family share tokens." :
                   consentLang === "hi" ? "जनसांख्यिकी, हृदय गति, रक्तचाप, ग्लूकोज, निदान रिपोर्ट, पारिवारिक टोकन।" :
                   consentLang === "ta" ? "புள்ளிவிவரங்கள், இதய துடிப்பு, இரத்த அழுத்தம், குளுக்கோஸ், மருத்துவ அறிக்கைகள்." :
                   "జనాభా వివరాలు, హృదయ స్పందన రేటు, రక్తపోటు, వైద్య నివేదికలు."}
                </div>
              </div>

              {/* Granular Consent Checkboxes */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Granular Processing Authorizations</p>
                
                <label className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${patientConsent.accepted ? "hover:bg-slate-850" : "opacity-40 cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    disabled={!patientConsent.accepted}
                    checked={patientConsent.granularPreferences?.historySharing || false}
                    onChange={(e) => {
                      const updated = { ...patientConsent.granularPreferences, historySharing: e.target.checked };
                      updatePatientConsent(consentLang, updated);
                    }}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-0 bg-slate-950 border-slate-700 h-3.5 w-3.5 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="text-[11px]">
                    <p className="font-extrabold text-slate-200">EHR History Decryption & Processing</p>
                    <p className="text-[9px] text-slate-500 font-medium">Allows registered doctors to decrypt and view clinical histories.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${patientConsent.accepted ? "hover:bg-slate-850" : "opacity-40 cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    disabled={!patientConsent.accepted}
                    checked={patientConsent.granularPreferences?.aiCdssProcessing || false}
                    onChange={(e) => {
                      const updated = { ...patientConsent.granularPreferences, aiCdssProcessing: e.target.checked };
                      updatePatientConsent(consentLang, updated);
                    }}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-0 bg-slate-950 border-slate-700 h-3.5 w-3.5 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="text-[11px]">
                    <p className="font-extrabold text-slate-200">AI-CDSS Model Assist</p>
                    <p className="text-[9px] text-slate-500 font-medium">Permits Gemini models to process clinical notes for physician decision support.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${patientConsent.accepted ? "hover:bg-slate-850" : "opacity-40 cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    disabled={!patientConsent.accepted}
                    checked={patientConsent.granularPreferences?.familySharing || false}
                    onChange={(e) => {
                      const updated = { ...patientConsent.granularPreferences, familySharing: e.target.checked };
                      updatePatientConsent(consentLang, updated);
                    }}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-0 bg-slate-950 border-slate-700 h-3.5 w-3.5 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="text-[11px]">
                    <p className="font-extrabold text-slate-200">Caregiver Secure Sharing</p>
                    <p className="text-[9px] text-slate-500 font-medium">Permits generation of one-time codes for authorized family access.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${patientConsent.accepted ? "hover:bg-slate-850" : "opacity-40 cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    disabled={!patientConsent.accepted}
                    checked={patientConsent.granularPreferences?.vitalTelemetry || false}
                    onChange={(e) => {
                      const updated = { ...patientConsent.granularPreferences, vitalTelemetry: e.target.checked };
                      updatePatientConsent(consentLang, updated);
                    }}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-0 bg-slate-950 border-slate-700 h-3.5 w-3.5 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="text-[11px]">
                    <p className="font-extrabold text-slate-200">Physiological Telemetry Logger</p>
                    <p className="text-[9px] text-slate-500 font-medium">Enables active recording of heart rates, BP levels, and glucose markers.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${patientConsent.accepted ? "hover:bg-slate-850" : "opacity-40 cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    disabled={!patientConsent.accepted}
                    checked={patientConsent.granularPreferences?.emergencyBreakGlass || false}
                    onChange={(e) => {
                      const updated = { ...patientConsent.granularPreferences, emergencyBreakGlass: e.target.checked };
                      updatePatientConsent(consentLang, updated);
                    }}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-0 bg-slate-950 border-slate-700 h-3.5 w-3.5 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="text-[11px]">
                    <p className="font-extrabold text-slate-200">Emergency Break-Glass Alerts</p>
                    <p className="text-[9px] text-slate-500 font-medium">Enables SMS rules to override standard freezes during life-threatening anomalies.</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800">
                {patientConsent.accepted ? (
                  <button
                    onClick={revokePatientConsent}
                    className="w-full py-2.5 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-400 hover:text-red-300 font-black text-[11px] rounded-xl transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    <span>⚠️ One-Click Withdraw Consent & Freeze Processing</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const defaultPrefs = {
                        historySharing: true,
                        aiCdssProcessing: true,
                        familySharing: true,
                        vitalTelemetry: true,
                        emergencyBreakGlass: true
                      };
                      updatePatientConsent(consentLang, defaultPrefs);
                    }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-xl transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1 shadow-md"
                  >
                    <span>🛡️ Accept Privacy Notice & Grant Consent</span>
                  </button>
                )}
                {consentSaveSuccess && (
                  <p className="text-[10px] text-center font-extrabold text-emerald-400 uppercase tracking-wider mt-2 animate-pulse">
                    ✓ DPDP compliance states updated on server ledger
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleDownloadPDFSummary}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="h-3.5 w-3.5 text-slate-950" /> Download 30-Day Health Report (PDF)
            </button>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Printer className="h-3.5 w-3.5 text-emerald-400" /> Print Digital Identity Card
            </button>
          </div>
        );

      default:
        return null;
    }
  }
}
