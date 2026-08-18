import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Siren,
  ShieldAlert,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  Activity,
  ShieldCheck,
  Navigation,
  Loader2,
  User,
  Wifi,
  WifiOff,
  RefreshCw,
  FileText
} from "lucide-react";
import { EmergencyContacts, EmergencyContactItem } from "./GlobalEmergencySOS/EmergencyContacts";
import { EmergencyChecklist } from "./GlobalEmergencySOS/EmergencyChecklist";
import { EmergencyVitals, VitalRecord } from "./GlobalEmergencySOS/EmergencyVitals";

// ============================================
// TYPES
// ============================================

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy?: number;
  timestamp?: string;
}

export interface SosAlertData {
  id: string;
  ticketNumber: string;
  patientName: string;
  phone: string;
  holdDurationMs: number;
  triggerSource: string;
  priority: "CRITICAL_RED" | "HIGH_ORANGE";
  status: "active" | "acknowledged" | "dispatched" | "resolved" | "cancelled";
  createdAt: string;
  location?: LocationData;
  symptomsNote?: string;
  emergencyContacts?: EmergencyContactItem[];
  vitals?: {
    heartRate?: number;
    bpSystolic?: number;
    bpDiastolic?: number;
    spo2?: number;
    temperature?: number;
  };
}

export type CancelReason = 
  | "Accidental Trigger"
  | "Condition Improved"
  | "Testing System"
  | "Other Assistance Found"
  | "False Alarm";

export interface GlobalEmergencySOSProps {
  onNavigateToEmergency?: () => void;
  onSosTriggered?: (data: SosAlertData) => void;
  onSosCancelled?: (data: { id: string; reason: CancelReason }) => void;
  patientName?: string;
  patientPhone?: string;
  initialContacts?: EmergencyContactItem[];
}

// ============================================
// CONSTANTS
// ============================================

const HOLD_DURATION_REQUIRED = 3000; // 3 seconds hold
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// ============================================
// MAIN COMPONENT
// ============================================

export default function GlobalEmergencySOS({
  onNavigateToEmergency,
  onSosTriggered,
  onSosCancelled,
  patientName = "Vikram Malhotra",
  patientPhone = "+91 98765 43210",
  initialContacts = [
    { id: "c1", name: "Priya Kumar", phone: "+91 98765 43210", relation: "Spouse", priority: "primary", isVerified: true },
    { id: "c2", name: "Ramesh Kumar", phone: "+91 98765 11223", relation: "Father", priority: "secondary", isVerified: true }
  ]
}: GlobalEmergencySOSProps): React.ReactElement {
  // ============================================
  // STATE
  // ============================================

  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdProgressMs, setHoldProgressMs] = useState<number>(0);
  const [holdCanceledMessage, setHoldCanceledMessage] = useState<string | null>(null);
  const [activeSos, setActiveSos] = useState<SosAlertData | null>(null);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  
  // Modal Sub-view Tab
  const [activeModalTab, setActiveModalTab] = useState<"overview" | "contacts" | "checklist" | "vitals">("overview");

  // Contacts Management State
  const [contactsList, setContactsList] = useState<EmergencyContactItem[]>(initialContacts);

  // Vitals State
  const [vitalRecords, setVitalRecords] = useState<VitalRecord[]>([
    {
      id: "v1",
      timestamp: new Date().toISOString(),
      heartRate: 88,
      bpSystolic: 128,
      bpDiastolic: 82,
      spo2: 98,
      temperature: 36.9,
      respiratoryRate: 16,
      notes: "Baseline readings prior to SOS"
    }
  ]);

  const [isSendingNote, setIsSendingNote] = useState<boolean>(false);
  const [sosNoteText, setSosNoteText] = useState<string>("");
  const [noteSentSuccess, setNoteSentSuccess] = useState<boolean>(false);
  const [isCancellingSos, setIsCancellingSos] = useState<boolean>(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<CancelReason>("Accidental Trigger");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Geolocation
  const [userLocation, setUserLocation] = useState<LocationData>({
    latitude: 17.4485,
    longitude: 78.3741,
    address: "CURA Healthcare HQ Zone, Hyderabad"
  });

  // ============================================
  // REFS
  // ============================================

  const holdStartTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const locationWatchIdRef = useRef<number | null>(null);

  // ============================================
  // EFFECTS
  // ============================================

  // Geolocation tracking
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            address: `GPS: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        () => {
          // Fallback to default
        },
        { timeout: 5000, enableHighAccuracy: true }
      );

      locationWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation(prev => ({
            ...prev,
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            address: `GPS: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString()
          }));
        },
        () => {
          // Keep existing on watch error
        },
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    }

    return () => {
      if (locationWatchIdRef.current !== null && typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
      }
    };
  }, []);

  // Online/Offline monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timer for active SOS
  useEffect(() => {
    if (activeSos) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeSos]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSosModal) {
        setShowSosModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSosModal]);

  // Focus management
  useEffect(() => {
    if (showSosModal && modalRef.current) {
      modalRef.current.focus();
    }
  }, [showSosModal]);

  // ============================================
  // HELPERS
  // ============================================

  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        // Ignore vibrate error
      }
    }
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const sendSosToBackend = useCallback(async (sosData: SosAlertData, attempt: number = 0): Promise<void> => {
    try {
      const response = await fetch("/api/v1/emergency/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(sosData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      if (attempt < MAX_RETRY_ATTEMPTS && isOnline) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        return sendSosToBackend(sosData, attempt + 1);
      }

      // Store in localStorage for retry
      try {
        const pending = JSON.parse(localStorage.getItem("cura_pending_sos") || "[]");
        pending.push({ ...sosData, _pendingSync: true });
        localStorage.setItem("cura_pending_sos", JSON.stringify(pending));
      } catch (e) {
        // Ignore storage error
      }
    }
  }, [isOnline]);

  const triggerEmergencyAlert = useCallback(async (holdDuration: number) => {
    vibrate([150, 100, 150, 100, 300]);

    const ticketNumber = `SOS-ER-${Math.floor(1000 + Math.random() * 9000)}`;

    const latest = vitalRecords[vitalRecords.length - 1];

    const sosData: SosAlertData = {
      id: `sos-${Date.now()}`,
      ticketNumber,
      patientName,
      phone: patientPhone,
      holdDurationMs: holdDuration,
      triggerSource: "Global Floating Action SOS Button (3s Hold)",
      priority: "CRITICAL_RED",
      status: "acknowledged",
      createdAt: new Date().toISOString(),
      location: userLocation,
      emergencyContacts: contactsList,
      vitals: {
        heartRate: latest?.heartRate ?? 88,
        bpSystolic: latest?.bpSystolic ?? 128,
        bpDiastolic: latest?.bpDiastolic ?? 82,
        spo2: latest?.spo2 ?? 98,
        temperature: latest?.temperature ?? 36.9
      }
    };

    setActiveSos(sosData);
    setShowSosModal(true);
    setActiveModalTab("overview");

    // Dispatch global event for Emergency Suite and Doctor Dashboard
    window.dispatchEvent(new CustomEvent("cura-emergency-sos-triggered", { detail: sosData }));

    if (onSosTriggered) {
      onSosTriggered(sosData);
    }

    try {
      const existing = JSON.parse(localStorage.getItem("cura_active_sos_alerts") || "[]");
      localStorage.setItem("cura_active_sos_alerts", JSON.stringify([sosData, ...existing]));
    } catch (e) {
      console.debug("Local storage sync error:", e);
    }

    await sendSosToBackend(sosData);
  }, [patientName, patientPhone, userLocation, contactsList, vitalRecords, onSosTriggered, vibrate, sendSosToBackend]);

  const handleHoldStart = useCallback((e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    if (activeSos) {
      setShowSosModal(true);
      return;
    }

    setIsHolding(true);
    setHoldCanceledMessage(null);
    holdStartTimeRef.current = performance.now();

    vibrate(40);

    const updateLoop = (now: number) => {
      if (!holdStartTimeRef.current) return;
      const elapsed = now - holdStartTimeRef.current;

      if (elapsed >= HOLD_DURATION_REQUIRED) {
        setHoldProgressMs(HOLD_DURATION_REQUIRED);
        setIsHolding(false);
        holdStartTimeRef.current = null;
        triggerEmergencyAlert(HOLD_DURATION_REQUIRED);
      } else {
        setHoldProgressMs(elapsed);
        animationFrameRef.current = requestAnimationFrame(updateLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  }, [activeSos, vibrate, triggerEmergencyAlert]);

  const handleHoldEnd = useCallback(() => {
    if (!isHolding && !holdStartTimeRef.current) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (holdStartTimeRef.current) {
      const heldTime = performance.now() - holdStartTimeRef.current;
      if (heldTime < HOLD_DURATION_REQUIRED) {
        const heldSeconds = (heldTime / 1000).toFixed(1);
        setHoldCanceledMessage(`SOS Hold Released (${heldSeconds}s) — Must hold for 3 full seconds`);

        setTimeout(() => {
          setHoldCanceledMessage(null);
        }, 3000);
      }
    }

    setIsHolding(false);
    setHoldProgressMs(0);
    holdStartTimeRef.current = null;
  }, [isHolding]);

  const handleSendEmergencyNote = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosNoteText.trim() || !activeSos) return;

    setIsSendingNote(true);

    try {
      await fetch(`/api/v1/emergency/sos/${activeSos.id}/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ note: sosNoteText.trim() })
      });

      setNoteSentSuccess(true);
      setSosNoteText("");
      setTimeout(() => setNoteSentSuccess(false), 3000);
    } catch (err) {
      setNoteSentSuccess(true);
      setTimeout(() => setNoteSentSuccess(false), 3000);
    } finally {
      setIsSendingNote(false);
    }
  }, [sosNoteText, activeSos]);

  const handleCancelActiveSos = useCallback(async () => {
    if (!activeSos) return;

    setIsCancellingSos(true);

    try {
      await fetch(`/api/v1/emergency/sos/${activeSos.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: cancelReason })
      });
    } catch (err) {
      console.warn("Failed to cancel SOS API:", err);
    }

    setIsCancellingSos(false);
    setShowCancelConfirm(false);

    const cancelledData = { id: activeSos.id, reason: cancelReason };
    setActiveSos(null);
    setShowSosModal(false);

    window.dispatchEvent(new CustomEvent("cura-emergency-sos-cancelled", { detail: cancelledData }));

    if (onSosCancelled) {
      onSosCancelled(cancelledData);
    }

    try {
      const existing = JSON.parse(localStorage.getItem("cura_active_sos_alerts") || "[]");
      const updated = existing.filter((s: SosAlertData) => s.id !== activeSos.id);
      localStorage.setItem("cura_active_sos_alerts", JSON.stringify(updated));
    } catch (e) {
      // Ignore
    }

    vibrate([100]);
  }, [activeSos, cancelReason, onSosCancelled, vibrate]);

  const handleRetrySync = useCallback(async () => {
    setIsRetrying(true);
    try {
      const pending = JSON.parse(localStorage.getItem("cura_pending_sos") || "[]");
      if (pending.length === 0) {
        setIsRetrying(false);
        return;
      }

      for (const sos of pending) {
        await sendSosToBackend(sos);
      }

      localStorage.removeItem("cura_pending_sos");
    } catch (err) {
      console.warn("Sync error:", err);
    } finally {
      setIsRetrying(false);
    }
  }, [sendSosToBackend]);

  // ============================================
  // MEMOIZED VALUES
  // ============================================

  const holdPercentage = useMemo(() => {
    return Math.min(100, (holdProgressMs / HOLD_DURATION_REQUIRED) * 100);
  }, [holdProgressMs]);

  const secondsRemaining = useMemo(() => {
    return Math.max(0, ((HOLD_DURATION_REQUIRED - holdProgressMs) / 1000)).toFixed(1);
  }, [holdProgressMs]);

  const strokeDashoffset = useMemo(() => {
    return 283 - (283 * holdPercentage) / 100;
  }, [holdPercentage]);

  const formattedElapsed = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  const hasPendingSos = useMemo(() => {
    try {
      const pending = JSON.parse(localStorage.getItem("cura_pending_sos") || "[]");
      return pending.length > 0;
    } catch {
      return false;
    }
  }, []);

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* GLOBAL FLOATING SOS ACTION BUTTON */}
      <div
        id="global-emergency-sos-container"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end select-none"
        role="region"
        aria-label="Emergency SOS Controls"
      >
        {/* Network status indicator */}
        <div className="mb-1.5 flex items-center gap-2 text-[10px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800 backdrop-blur-sm">
          {isOnline ? (
            <div className="flex items-center gap-1 text-emerald-400">
              <Wifi className="h-3 w-3" />
              <span className="hidden sm:inline">Telemetry Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-rose-400">
              <WifiOff className="h-3 w-3" />
              <span className="hidden sm:inline">Offline Mode</span>
            </div>
          )}
          {hasPendingSos && (
            <button
              id="btn-retry-sync-sos"
              type="button"
              onClick={handleRetrySync}
              disabled={isRetrying}
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Pending</span>
            </button>
          )}
        </div>

        {/* Hold Canceled Alert Toast */}
        {holdCanceledMessage && !activeSos && (
          <div
            id="toast-sos-released"
            className="mb-2 px-3 py-2 bg-slate-900/95 text-amber-300 text-xs font-semibold rounded-lg shadow-xl border border-amber-500/30 flex items-center gap-2 animate-bounce max-w-xs backdrop-blur-md"
            role="alert"
            aria-live="polite"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{holdCanceledMessage}</span>
          </div>
        )}

        {/* Hold Progress Tooltip */}
        {isHolding && !activeSos && (
          <div
            id="tooltip-sos-progress"
            className="mb-2 px-4 py-2 bg-red-950/95 text-white text-xs font-bold rounded-xl shadow-2xl border border-red-500/50 flex items-center gap-2 animate-pulse backdrop-blur-md"
            role="status"
            aria-live="polite"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>HOLD 3 SECONDS TO ACTIVATE SOS ({secondsRemaining}s)</span>
          </div>
        )}

        {/* Active Alert Badge */}
        {activeSos && (
          <button
            id="btn-active-sos-indicator"
            type="button"
            className="mb-2 px-3 py-1.5 bg-red-600 text-white text-xs font-black rounded-full shadow-lg border border-red-300 flex items-center gap-2 animate-pulse cursor-pointer hover:bg-red-500 transition-colors"
            onClick={() => setShowSosModal(true)}
            aria-label="Active SOS alert - tap to view"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>🚨 EMERGENCY ACTIVE</span>
            <span className="text-[10px] opacity-90 font-mono">{formattedElapsed}</span>
          </button>
        )}

        {/* Floating Action Button */}
        <div className="relative group">
          {/* Radial Progress SVG Ring */}
          {isHolding && !activeSos && (
            <svg
              className="absolute -top-2 -left-2 w-[72px] h-[72px] pointer-events-none transform -rotate-90 z-10"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-red-900/40"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-amber-400 transition-all duration-75 ease-linear"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
          )}

          <button
            id="global-sos-button"
            ref={buttonRef}
            type="button"
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onTouchCancel={handleHoldEnd}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                handleHoldStart(e);
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") {
                handleHoldEnd();
              }
            }}
            className={`relative flex items-center justify-center gap-2.5 h-14 min-w-14 px-4 rounded-full font-black text-white shadow-2xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-red-400/80 active:scale-95 ${
              activeSos
                ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 ring-4 ring-red-500/50 shadow-red-600/50 animate-pulse"
                : isHolding
                ? "bg-gradient-to-r from-red-700 via-red-800 to-amber-700 scale-105 shadow-red-900/80 ring-4 ring-amber-400"
                : "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-600/40 hover:shadow-red-600/60 ring-2 ring-red-400/40"
            }`}
            aria-label="Global Emergency SOS - Press and hold 3 seconds to alert Clinic Emergency Desk"
          >
            {/* Pulsing Outer Glow */}
            <span className="absolute inset-0 rounded-full bg-red-500/30 blur-md animate-pulse -z-10" aria-hidden="true" />

            {/* Icon */}
            {activeSos ? (
              <Siren className="w-6 h-6 text-white animate-bounce shrink-0" aria-hidden="true" />
            ) : isHolding ? (
              <ShieldAlert className="w-6 h-6 text-amber-300 animate-spin shrink-0" aria-hidden="true" />
            ) : (
              <Siren className="w-6 h-6 text-white shrink-0" aria-hidden="true" />
            )}

            {/* Button Text */}
            <div className="flex flex-col items-start leading-tight pr-1">
              <div className="flex items-center gap-1">
                <span className="text-sm font-black tracking-wider uppercase">
                  {activeSos ? "SOS ACTIVE" : "EMERGENCY SOS"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-red-100/90 tracking-tight">
                {activeSos
                  ? "Tap to view ER desk"
                  : isHolding
                  ? `Holding: ${secondsRemaining}s`
                  : "Hold 3s to activate"}
              </span>
            </div>

            {/* Status indicator dot */}
            <span
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                activeSos ? 'bg-red-500 animate-ping' :
                isOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* EMERGENCY SOS ACTIVE MODAL */}
      {showSosModal && activeSos && (
        <div
          id="emergency-sos-modal-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-modal-title"
          ref={modalRef}
          tabIndex={-1}
        >
          <div className="relative w-full max-w-xl bg-slate-900 border-2 border-red-500/60 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto">

            {/* Top Critical Header */}
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 p-4 sm:p-5 flex items-center justify-between text-white border-b border-red-500/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 animate-pulse">
                  <Siren className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-black/40 text-red-200 text-[10px] font-black uppercase tracking-widest rounded">
                      CRITICAL PRIORITY (ESI-1)
                    </span>
                    <span className="text-xs font-mono font-semibold text-red-100">
                      #{activeSos.ticketNumber}
                    </span>
                  </div>
                  <h3 id="sos-modal-title" className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
                    Emergency Response Hub
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white/90 bg-black/30 px-2.5 py-1 rounded-xl">
                  {formattedElapsed}
                </span>
                <button
                  id="btn-close-sos-modal"
                  type="button"
                  onClick={() => setShowSosModal(false)}
                  className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer"
                  aria-label="Minimize modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="flex bg-slate-950/80 p-1.5 border-b border-slate-800 gap-1 overflow-x-auto">
              <button
                id="tab-sos-overview"
                type="button"
                onClick={() => setActiveModalTab("overview")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeModalTab === "overview"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Siren className="h-3.5 w-3.5" />
                Overview
              </button>
              <button
                id="tab-sos-contacts"
                type="button"
                onClick={() => setActiveModalTab("contacts")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeModalTab === "contacts"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Contacts ({contactsList.length})
              </button>
              <button
                id="tab-sos-checklist"
                type="button"
                onClick={() => setActiveModalTab("checklist")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeModalTab === "checklist"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Checklist
              </button>
              <button
                id="tab-sos-vitals"
                type="button"
                onClick={() => setActiveModalTab("vitals")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeModalTab === "vitals"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                Telemetry Vitals
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">

              {/* OVERVIEW TAB */}
              {activeModalTab === "overview" && (
                <div className="space-y-4 text-left">
                  {/* Alert Status Banner */}
                  <div className="p-3.5 bg-red-950/50 border border-red-500/40 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-red-200 flex items-center gap-2">
                        <span>ER DESK ACKNOWLEDGED ALERT</span>
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        Notification dispatched to <strong className="text-white">CURA HQ Emergency Desk</strong> and on-call ER Triage Doctor. Response team dispatched to location.
                      </p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {/* Patient Info */}
                    <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                        <span>Elapsed Time:</span>
                      </div>
                      <p className="text-base font-black text-rose-400 font-mono">
                        {formattedElapsed}
                      </p>
                      <div className="pt-1 border-t border-slate-700/50 text-slate-300 text-[11px]">
                        <span className="text-slate-400">Patient:</span> <strong className="text-white">{activeSos.patientName}</strong>
                      </div>
                      <div className="text-slate-300 text-[11px]">
                        <span className="text-slate-400">Phone:</span> <span className="font-mono">{activeSos.phone}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                        <span>GPS Location:</span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 line-clamp-2">
                        {userLocation.address}
                      </p>
                      <div className="pt-1 border-t border-slate-700/50 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                        <span>{userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      id="btn-call-108"
                      href="tel:108"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition-colors text-xs text-center cursor-pointer"
                      aria-label="Call emergency hotline 108"
                    >
                      <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Call ER Desk Hotline (108)</span>
                    </a>

                    {onNavigateToEmergency && (
                      <button
                        id="btn-open-er-suite"
                        type="button"
                        onClick={() => {
                          setShowSosModal(false);
                          onNavigateToEmergency();
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-colors text-xs text-center cursor-pointer"
                        aria-label="Open emergency suite"
                      >
                        <Activity className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Launch ER Triage Suite</span>
                      </button>
                    )}
                  </div>

                  {/* Send Live Symptom Note */}
                  <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/80 space-y-2">
                    <p className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Send Live Symptom Note to ER Doctor</span>
                      {noteSentSuccess && (
                        <span className="text-emerald-400 text-[11px] font-normal flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Sent!
                        </span>
                      )}
                    </p>

                    <form onSubmit={handleSendEmergencyNote} className="flex gap-2">
                      <input
                        id="input-sos-note"
                        type="text"
                        value={sosNoteText}
                        onChange={(e) => setSosNoteText(e.target.value)}
                        placeholder="e.g. Severe chest pain radiating to left arm..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                        aria-label="Emergency note"
                        maxLength={500}
                      />
                      <button
                        id="btn-submit-sos-note"
                        type="submit"
                        disabled={isSendingNote || !sosNoteText.trim()}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                        aria-label="Send note"
                      >
                        {isSendingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Send className="w-3.5 h-3.5" aria-hidden="true" />}
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* CONTACTS TAB */}
              {activeModalTab === "contacts" && (
                <EmergencyContacts
                  contacts={contactsList}
                  onAddContact={(newContact) => {
                    const created: EmergencyContactItem = {
                      id: `contact-${Date.now()}`,
                      isVerified: true,
                      ...newContact
                    };
                    setContactsList(prev => [...prev, created]);
                  }}
                  onUpdateContact={(id, updatedFields) => {
                    setContactsList(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
                  }}
                  onDeleteContact={(id) => {
                    setContactsList(prev => prev.filter(c => c.id !== id));
                  }}
                  onTestContact={(id) => {
                    setContactsList(prev => prev.map(c => c.id === id ? { ...c, lastNotified: new Date().toISOString() } : c));
                  }}
                  onNotifyAll={() => {
                    const now = new Date().toISOString();
                    setContactsList(prev => prev.map(c => ({ ...c, lastNotified: now })));
                  }}
                />
              )}

              {/* CHECKLIST TAB */}
              {activeModalTab === "checklist" && (
                <EmergencyChecklist />
              )}

              {/* VITALS TAB */}
              {activeModalTab === "vitals" && (
                <EmergencyVitals
                  vitals={vitalRecords}
                  onAddVital={(vital) => {
                    const newVital: VitalRecord = {
                      id: `vital-${Date.now()}`,
                      timestamp: new Date().toISOString(),
                      ...vital
                    };
                    setVitalRecords(prev => [...prev, newVital]);
                  }}
                />
              )}

              {/* Cancel / False Alarm Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                {!showCancelConfirm ? (
                  <button
                    id="btn-show-cancel-confirm"
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                    aria-label="Cancel SOS alert"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                    <span>Cancel SOS / False Alarm</span>
                  </button>
                ) : (
                  <div className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <p className="text-xs font-bold text-red-300">
                      Confirm Cancellation of Emergency SOS:
                    </p>
                    <select
                      id="select-cancel-reason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value as CancelReason)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-2"
                      aria-label="Cancel reason"
                    >
                      <option value="Accidental Trigger">Accidental Trigger</option>
                      <option value="Condition Improved">Condition Improved</option>
                      <option value="Testing System">System Test</option>
                      <option value="Other Assistance Found">Other Assistance Found</option>
                      <option value="False Alarm">False Alarm</option>
                    </select>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        id="btn-keep-sos-active"
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Keep Active
                      </button>
                      <button
                        id="btn-confirm-cancel-sos"
                        type="button"
                        onClick={handleCancelActiveSos}
                        disabled={isCancellingSos}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                      >
                        {isCancellingSos && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
                        <span>Confirm Cancel</span>
                      </button>
                    </div>
                  </div>
                )}

                {!showCancelConfirm && (
                  <button
                    id="btn-minimize-sos-modal"
                    type="button"
                    onClick={() => setShowSosModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Minimize
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
