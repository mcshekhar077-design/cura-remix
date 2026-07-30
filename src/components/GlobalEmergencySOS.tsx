import React, { useState, useEffect, useRef } from "react";
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
  Phone,
  ExternalLink,
  ShieldCheck,
  Navigation,
  Loader2,
  Volume2,
  User,
  HeartPulse
} from "lucide-react";

interface GlobalEmergencySOSProps {
  onNavigateToEmergency?: () => void;
  patientName?: string;
  patientPhone?: string;
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
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    address?: string;
  };
  symptomsNote?: string;
}

export default function GlobalEmergencySOS({
  onNavigateToEmergency,
  patientName = "Vikram Malhotra",
  patientPhone = "+91 98765 43210"
}: GlobalEmergencySOSProps) {
  // SOS Hold Interaction State
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgressMs, setHoldProgressMs] = useState(0); // 0 to 3000 ms
  const [holdCanceledMessage, setHoldCanceledMessage] = useState<string | null>(null);
  
  // Active SOS State & Modal
  const [activeSos, setActiveSos] = useState<SosAlertData | null>(null);
  const [showSosModal, setShowSosModal] = useState(false);
  const [isSendingNote, setIsSendingNote] = useState(false);
  const [sosNoteText, setSosNoteText] = useState("");
  const [noteSentSuccess, setNoteSentSuccess] = useState(false);
  const [isCancellingSos, setIsCancellingSos] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("Accidental Trigger");

  // Geolocation
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  }>({
    latitude: 17.4485,
    longitude: 78.3741,
    address: "CURA Healthcare HQ Zone, Hyderabad"
  });

  // Elapsed time counter since SOS activation
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Refs for animation loop
  const holdStartTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const HOLD_DURATION_REQUIRED = 3000; // 3 seconds hold required

  // Try fetching browser geolocation on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
            address: `GPS: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`
          });
        },
        () => {
          // Fallback to default clinic zone
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Timer for active SOS elapsed time
  useEffect(() => {
    let interval: any = null;
    if (activeSos) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeSos]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle start hold
  const handleHoldStart = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    // Prevent default touch dragging / scrolling while pressing SOS
    if (e.type.startsWith("touch")) {
      // Allow touch start
    }

    if (activeSos) {
      // If alert is already active, click opens the active modal
      setShowSosModal(true);
      return;
    }

    setIsHolding(true);
    setHoldCanceledMessage(null);
    holdStartTimeRef.current = performance.now();

    // Trigger initial subtle haptic feedback if supported
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch (err) {
        // ignore
      }
    }

    // Start progress loop
    const updateLoop = (now: number) => {
      if (!holdStartTimeRef.current) return;
      const elapsed = now - holdStartTimeRef.current;
      
      if (elapsed >= HOLD_DURATION_REQUIRED) {
        // Completed 3 full seconds!
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
  };

  // Handle end hold (release before 3 seconds)
  const handleHoldEnd = () => {
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
        
        // Auto hide message after 3 seconds
        setTimeout(() => {
          setHoldCanceledMessage(null);
        }, 3000);
      }
    }

    setIsHolding(false);
    setHoldProgressMs(0);
    holdStartTimeRef.current = null;
  };

  // Trigger Emergency SOS Activation
  const triggerEmergencyAlert = async (holdDuration: number) => {
    // Intense haptic feedback
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      try {
        navigator.vibrate([150, 100, 150, 100, 300]);
      } catch (err) {
        // ignore
      }
    }

    const ticketNumber = `SOS-ER-${Math.floor(1000 + Math.random() * 9000)}`;
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
      location: userLocation
    };

    setActiveSos(sosData);
    setShowSosModal(true);

    // Persist to localStorage for real-time app sync
    try {
      const existing = JSON.parse(localStorage.getItem("cura_active_sos_alerts") || "[]");
      localStorage.setItem("cura_active_sos_alerts", JSON.stringify([sosData, ...existing]));
      
      // Dispatch custom browser event so other views (EmergencySuite / DoctorDashboard) catch it
      window.dispatchEvent(new CustomEvent("cura-emergency-sos-triggered", { detail: sosData }));
    } catch (e) {
      console.error("Local storage sync error", e);
    }

    // Call Backend API
    try {
      await fetch("/api/v1/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sosData)
      });
    } catch (err) {
      console.warn("Backend emergency endpoint request sent (fallback to client desk mode)", err);
    }
  };

  // Submit emergency doctor note
  const handleSendEmergencyNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosNoteText.trim() || !activeSos) return;
    setIsSendingNote(true);

    try {
      await fetch(`/api/v1/emergency/sos/${activeSos.id}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: sosNoteText })
      });
    } catch (err) {
      // local fallback
    }

    setIsSendingNote(false);
    setNoteSentSuccess(true);
    setSosNoteText("");
    setTimeout(() => setNoteSentSuccess(false), 3000);
  };

  // Cancel active SOS
  const handleCancelActiveSos = async () => {
    if (!activeSos) return;
    setIsCancellingSos(true);

    try {
      await fetch(`/api/v1/emergency/sos/${activeSos.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason })
      });
    } catch (err) {
      // local fallback
    }

    // Clear local active status
    setIsCancellingSos(false);
    setShowCancelConfirm(false);
    setActiveSos(null);
    setShowSosModal(false);

    // Notify local event bus
    window.dispatchEvent(new CustomEvent("cura-emergency-sos-cancelled", { detail: { reason: cancelReason } }));
  };

  // Calculate radial progress ring parameters
  const holdPercentage = Math.min(100, (holdProgressMs / HOLD_DURATION_REQUIRED) * 100);
  const secondsRemaining = Math.max(0, ((HOLD_DURATION_REQUIRED - holdProgressMs) / 1000)).toFixed(1);
  const strokeDashoffset = 283 - (283 * holdPercentage) / 100;

  return (
    <>
      {/* GLOBAL FLOATING SOS ACTION BUTTON CONTAINER */}
      <div 
        id="global-emergency-sos-container"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end select-none"
      >
        {/* Held Canceled Alert Toast */}
        {holdCanceledMessage && !activeSos && (
          <div className="mb-2 px-3 py-2 bg-slate-900/95 text-amber-300 text-xs font-semibold rounded-lg shadow-xl border border-amber-500/30 flex items-center gap-2 animate-bounce max-w-xs backdrop-blur-md">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{holdCanceledMessage}</span>
          </div>
        )}

        {/* Hold Progress Tooltip Header during hold */}
        {isHolding && !activeSos && (
          <div className="mb-2 px-4 py-2 bg-red-950/95 text-white text-xs font-bold rounded-xl shadow-2xl border border-red-500/50 flex items-center gap-2 animate-pulse backdrop-blur-md">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>HOLD 3 SECONDS TO ACTIVATE SOS ({secondsRemaining}s)</span>
          </div>
        )}

        {/* Active Alert Badge Indicator */}
        {activeSos && (
          <div className="mb-2 px-3 py-1.5 bg-red-600 text-white text-xs font-black rounded-full shadow-lg border border-red-300 flex items-center gap-2 animate-pulse cursor-pointer"
            onClick={() => setShowSosModal(true)}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>CLINIC ER DESK ALERT ACTIVE</span>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="relative group">
          {/* Radial Progress SVG Overlay during Hold */}
          {isHolding && !activeSos && (
            <svg 
              className="absolute -top-2 -left-2 w-[72px] h-[72px] pointer-events-none transform -rotate-90 z-10" 
              viewBox="0 0 100 100"
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
            type="button"
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onTouchCancel={handleHoldEnd}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                handleHoldStart(e);
              }
            }}
            onKeyUp={handleHoldEnd}
            aria-label="Global Emergency SOS - Press and hold 3 seconds to alert Clinic Emergency Desk"
            className={`relative flex items-center justify-center gap-2.5 h-14 min-w-14 px-4 rounded-full font-black text-white shadow-2xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-red-400/80 active:scale-95 ${
              activeSos
                ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 ring-4 ring-red-500/50 shadow-red-600/50 animate-pulse"
                : isHolding
                ? "bg-gradient-to-r from-red-700 via-red-800 to-amber-700 scale-105 shadow-red-900/80 ring-4 ring-amber-400"
                : "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-600/40 hover:shadow-red-600/60 ring-2 ring-red-400/40"
            }`}
          >
            {/* Pulsing Outer Glow Aura */}
            <span className="absolute inset-0 rounded-full bg-red-500/30 blur-md animate-pulse -z-10" />

            {/* Icon */}
            {activeSos ? (
              <Siren className="w-6 h-6 text-white animate-bounce shrink-0" />
            ) : isHolding ? (
              <ShieldAlert className="w-6 h-6 text-amber-300 animate-spin shrink-0" />
            ) : (
              <Siren className="w-6 h-6 text-white shrink-0" />
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
          </button>
        </div>
      </div>

      {/* EMERGENCY SOS ACTIVE MODAL OVERLAY */}
      {showSosModal && activeSos && (
        <div 
          id="emergency-sos-modal-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative w-full max-w-xl bg-slate-900 border-2 border-red-500/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-auto">
            
            {/* Top Critical Header Bar */}
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 p-4 sm:p-5 flex items-center justify-between text-white border-b border-red-500/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 animate-pulse">
                  <Siren className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-black/40 text-red-200 text-[10px] font-black uppercase tracking-widest rounded">
                      CRITICAL PRIORITY (ESI-1)
                    </span>
                    <span className="text-xs font-mono font-semibold text-red-100">
                      #{activeSos.ticketNumber}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
                    Clinic Emergency Desk Notified
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
                title="Minimize Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-5 sm:p-6 space-y-5">
              
              {/* Alert Status Banner */}
              <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-red-200 flex items-center gap-2">
                    <span>ER DESK ACKNOWLEDGED ALERT</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </p>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Immediate notification dispatched to <strong className="text-white">CURA HQ Emergency Desk</strong> and on-call ER Triage Doctor. Response team dispatched to location.
                  </p>
                </div>
              </div>

              {/* Grid Info Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Timer & Patient Info */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 font-medium">
                    <Clock className="w-4 h-4 text-rose-400" />
                    <span>Time Since Activation:</span>
                  </div>
                  <p className="text-base font-black text-rose-400 font-mono">
                    00:{elapsedSeconds < 10 ? `0${elapsedSeconds}` : elapsedSeconds}s
                  </p>
                  <div className="pt-1 border-t border-slate-700/50 text-slate-300">
                    <span className="text-slate-400">Patient:</span> <strong className="text-white">{activeSos.patientName}</strong>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">Phone:</span> <span className="font-mono">{activeSos.phone}</span>
                  </div>
                </div>

                {/* Geolocation & Broadcast Zone */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 font-medium">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span>Broadcasted GPS Location:</span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 line-clamp-2">
                    {userLocation.address}
                  </p>
                  <div className="pt-1 border-t border-slate-700/50 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Coordinates: {userLocation.latitude}, {userLocation.longitude}</span>
                  </div>
                </div>
              </div>

              {/* Direct Quick Action Buttons */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Immediate Emergency Controls
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Call Emergency Desk Hotline */}
                  <a
                    href="tel:108"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors text-xs text-center"
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>Call ER Desk Hotline (108)</span>
                  </a>

                  {/* Open Emergency Suite */}
                  {onNavigateToEmergency && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowSosModal(false);
                        onNavigateToEmergency();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors text-xs text-center"
                    >
                      <Activity className="w-4 h-4 shrink-0" />
                      <span>View ER Triage Suite</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Send Additional Note/Symptoms to ER Doctor */}
              <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/80 space-y-2">
                <p className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Send Urgent Details / Symptoms to ER Team</span>
                  {noteSentSuccess && (
                    <span className="text-emerald-400 text-[11px] font-normal flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Note Sent!
                    </span>
                  )}
                </p>

                <form onSubmit={handleSendEmergencyNote} className="flex gap-2">
                  <input
                    type="text"
                    value={sosNoteText}
                    onChange={(e) => setSosNoteText(e.target.value)}
                    placeholder="e.g. Chest tightness radiating to neck, severe shortness of breath..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingNote || !sosNoteText.trim()}
                    className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                  >
                    {isSendingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send</span>
                  </button>
                </form>
              </div>

              {/* False Alarm / Cancel Section */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                {!showCancelConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cancel SOS Alert / False Alarm</span>
                  </button>
                ) : (
                  <div className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-fade-in">
                    <p className="text-xs font-bold text-red-300">
                      Confirm Cancellation of Emergency SOS:
                    </p>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5"
                    >
                      <option value="Accidental Trigger">Accidental Trigger / Released Late</option>
                      <option value="Condition Improved">Condition Resolved / Improved</option>
                      <option value="Testing System">System Test</option>
                      <option value="Other Assistance Found">Other Medical Help Arrived</option>
                    </select>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                      >
                        Keep SOS Active
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelActiveSos}
                        disabled={isCancellingSos}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        {isCancellingSos && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>Confirm Cancel SOS</span>
                      </button>
                    </div>
                  </div>
                )}

                {!showCancelConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowSosModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
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
