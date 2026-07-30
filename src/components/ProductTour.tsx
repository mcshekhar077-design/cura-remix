import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Zap,
  Activity,
  UserCheck,
  Brain,
  Mic,
  Pill,
  Send,
  Leaf,
  Video,
  Calendar,
  Award,
  Grid,
  ShieldCheck,
  Eye,
  ExternalLink
} from "lucide-react";

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  narration: string;
  icon: React.ReactNode;
  duration: number; // in seconds
  targetId?: string;
  featureTag: string;
  previewType: "dashboard" | "patient" | "memory" | "voice" | "interaction" | "whatsapp" | "ayush" | "telemedicine" | "followup" | "welcome" | "complete";
  metrics?: { label: string; value: string }[];
}

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFeature?: (featureId: string) => void;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    stepNumber: 1,
    title: "👋 Welcome to CURA AI",
    subtitle: "Your Next-Gen Autonomous Clinical Copilot",
    description: "CURA is built to reduce doctor burnout, eliminate clinical errors, and digitize your practice seamlessly. Let's take a 2-minute tour of what CURA can do for you.",
    narration: "Welcome to CURA! I am your autonomous AI clinical assistant. In this guided tour, I will show you how CURA transforms your daily practice with real-time ambient dictation, patient digital twins, and drug interaction audits.",
    icon: <Sparkles className="h-6 w-6 text-purple-600" />,
    duration: 6,
    featureTag: "Guided Overview",
    previewType: "welcome",
    metrics: [
      { label: "Consultation Speedup", value: "3.5x Faster" },
      { label: "Documentation Saved", value: "2.5 Hrs/Day" }
    ]
  },
  {
    id: "command_center",
    stepNumber: 2,
    title: "📊 Clinical Command Center",
    subtitle: "Real-Time OPD, Triage & Revenue Intelligence",
    description: "Monitor critical patient alerts, active OPD queues, revenue streams, NABH compliance metrics, and AI clinical summaries — all in one centralized view.",
    narration: "This is your Command Center. Here you can see urgent clinical flags, today's appointment queue, revenue insights, and AI-prioritized patient care alerts at a single glance.",
    icon: <Activity className="h-6 w-6 text-indigo-600" />,
    duration: 8,
    targetId: "command-center",
    featureTag: "Dashboard & Analytics",
    previewType: "dashboard",
    metrics: [
      { label: "Active OPD Queue", value: "28 Patients" },
      { label: "Critical Flags", value: "2 Urgent" }
    ]
  },
  {
    id: "patient_twin",
    stepNumber: 3,
    title: "👤 Longitudinal Patient Digital Twin",
    subtitle: "360-Degree Health Timeline in 2 Seconds",
    description: "Access structured longitudinal health records — past visits, lab report trends, surgeries, chronic risk profiles, and family medical history in seconds.",
    narration: "Every patient gets a comprehensive Digital Twin. In under 2 seconds, you can review past diagnoses, lab trajectory graphs, active medications, and AI-calculated risk scores.",
    icon: <UserCheck className="h-6 w-6 text-blue-600" />,
    duration: 10,
    targetId: "patients",
    featureTag: "EMR & Health Records",
    previewType: "patient",
    metrics: [
      { label: "Timeline Speed", value: "< 2 Secs" },
      { label: "Risk Score Precision", value: "98.4%" }
    ]
  },
  {
    id: "ai_memory",
    stepNumber: 4,
    title: "🧠 Clinician Preference Memory Engine",
    subtitle: "Learns & Adapts to Your Prescribing Style",
    description: "CURA learns your preferred generic molecule brands, dosage regimens, and diagnostic workflows so recommendations mirror your personal clinical judgement.",
    narration: "CURA's Clinician Memory Engine learns how you practice medicine. It adapts to your preferred brand names, dosage preferences, and specialty guidelines over time.",
    icon: <Brain className="h-6 w-6 text-fuchsia-600" />,
    duration: 8,
    targetId: "ai-memory",
    featureTag: "AI Memory & Learning",
    previewType: "memory",
    metrics: [
      { label: "Prescribing Alignment", value: "96% Match" },
      { label: "Custom Regimens", value: "Auto-Saved" }
    ]
  },
  {
    id: "voice_scribe",
    stepNumber: 5,
    title: "🎤 Ambient Voice Scribe & SOAP Notes",
    subtitle: "Hands-Free Voice Dictation in 12 Languages",
    description: "Speak naturally in Hindi, English, Marathi, Gujarati, Tamil, etc. CURA listens, translates, and structures SOAP clinical notes and prescriptions in real time.",
    narration: "Forget typing. Just converse naturally with your patient. CURA ambiently captures the consultation, translates across 12 Indian languages, and generates complete SOAP notes.",
    icon: <Mic className="h-6 w-6 text-rose-600" />,
    duration: 8,
    targetId: "voice-prescription",
    featureTag: "Voice & Speech Engine",
    previewType: "voice",
    metrics: [
      { label: "Language Support", value: "12 Languages" },
      { label: "Transcribe Accuracy", value: "99.1%" }
    ]
  },
  {
    id: "drug_guard",
    stepNumber: 6,
    title: "⚡ Real-Time Drug Interaction Guard",
    subtitle: "Continuous Cross-Audit Against Patient EMR Baseline",
    description: "Drafted medicines are live-checked against patient home medications, allergies, and organ function. Detects severe bleeding, QT prolongations, or kidney risks instantly with 1-click safe replacements.",
    narration: "Safety is paramount. As you draft a prescription, CURA continuously audits for dangerous drug-drug interactions against the patient's existing chronic medications and recommends 1-click safe substitutions.",
    icon: <Pill className="h-6 w-6 text-amber-600" />,
    duration: 10,
    targetId: "drug-guard",
    featureTag: "Patient Safety & CDSS",
    previewType: "interaction",
    metrics: [
      { label: "Interaction Library", value: "50,000+ Pairs" },
      { label: "Audit Latency", value: "< 10ms" }
    ]
  },
  {
    id: "whatsapp",
    stepNumber: 7,
    title: "💬 One-Click WhatsApp Rx Dispatch",
    subtitle: "Instant Digital Delivery & Patient Engagement",
    description: "Send signed digital prescriptions, lab orders, diet charts, and appointment follow-up reminders directly to the patient's WhatsApp with end-to-end security.",
    narration: "Deliver prescriptions instantly. With a single click, send digital Rx PDF documents, diet guidelines, and follow-up reminders directly to the patient's WhatsApp.",
    icon: <Send className="h-6 w-6 text-emerald-600" />,
    duration: 7,
    targetId: "whatsapp",
    featureTag: "WhatsApp & Comms",
    previewType: "whatsapp",
    metrics: [
      { label: "Delivery Rate", value: "99.8%" },
      { label: "Patient Satisfaction", value: "4.9 / 5.0" }
    ]
  },
  {
    id: "ayush",
    stepNumber: 8,
    title: "🌿 AYUSH & Integrative Medical Engine",
    subtitle: "Ayurveda, Homeopathy, Unani, Siddha & Yoga",
    description: "First healthcare platform supporting all traditional Indian systems of medicine alongside Allopathy. Includes VaidhLLaMA dosha analysis and herb safety checks.",
    narration: "CURA is the world's first platform supporting both Allopathy and AYUSH. Analyze Prakriti doshas, suggest traditional herbs, and practice holistic integrative medicine.",
    icon: <Leaf className="h-6 w-6 text-teal-600" />,
    duration: 8,
    targetId: "ayush",
    featureTag: "Integrative Health",
    previewType: "ayush",
    metrics: [
      { label: "Medical Systems", value: "6 Systems" },
      { label: "Herb Database", value: "12,000+ Herbs" }
    ]
  },
  {
    id: "telemedicine",
    stepNumber: 9,
    title: "📹 Virtual Clinic & Telemedicine",
    subtitle: "HD Video Consultations & Remote Monitoring",
    description: "See remote patients via HD video calls with built-in digital vitals streaming, screen sharing, and instant prescription generation.",
    narration: "Expand your practice beyond clinic walls. Conduct remote video consultations, view live patient vitals, and issue digital prescriptions seamlessly.",
    icon: <Video className="h-6 w-6 text-cyan-600" />,
    duration: 7,
    targetId: "telemedicine",
    featureTag: "Telehealth & Remote",
    previewType: "telemedicine",
    metrics: [
      { label: "Video Quality", value: "1080p HD" },
      { label: "Vitals Sync", value: "Real-time" }
    ]
  },
  {
    id: "followup",
    stepNumber: 10,
    title: "📅 Automated AI Follow-Up Engine",
    subtitle: "Zero Patient Drop-Off & Chronic Care Recall",
    description: "Automatically tracks patient revisit dates, sends reminder messages, flags missed follow-ups, and schedules preventive lab tests.",
    narration: "Ensure no patient is ever forgotten. The AI follow-up engine automatically alerts patients when follow-ups are due, reducing drop-offs and improving outcomes.",
    icon: <Calendar className="h-6 w-6 text-violet-600" />,
    duration: 7,
    targetId: "followup",
    featureTag: "Care Continuity",
    previewType: "followup",
    metrics: [
      { label: "Revisit Compliance", value: "+42%" },
      { label: "Recall Automation", value: "100%" }
    ]
  },
  {
    id: "complete",
    stepNumber: 11,
    title: "🎉 You're Ready to Consult!",
    subtitle: "Start Experiencing CURA Today",
    description: "You have completed the guided CURA tour. You are now equipped to run your OPD with unprecedented AI speed, safety, and precision.",
    narration: "Congratulations! You have seen how CURA can revolutionize your clinic. Click 'Start Consultations' now to experience the future of healthcare.",
    icon: <Award className="h-6 w-6 text-amber-500" />,
    duration: 5,
    featureTag: "Tour Completed",
    previewType: "complete",
    metrics: [
      { label: "Tour Status", value: "100% Completed" },
      { label: "Free Trial", value: "14 Days Active" }
    ]
  }
];

export function ProductTour({ isOpen, onClose, onNavigateToFeature }: ProductTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [stepTimer, setStepTimer] = useState(0);
  const [showOverviewDrawer, setShowOverviewDrawer] = useState(false);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Handle Speech Synthesis
  const speakNarration = (text: string) => {
    if (isSpeechMuted || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel(); // Stop any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.lang = "en-US";

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Trigger narration when step changes
  useEffect(() => {
    if (isOpen) {
      setStepTimer(0);
      if (!isSpeechMuted) {
        speakNarration(currentStep.narration);
      }
      
      // Auto-highlight target element on page if present
      if (currentStep.targetId) {
        const el = document.getElementById(currentStep.targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-4", "ring-purple-500", "ring-offset-2", "transition-all", "duration-500");
          setTimeout(() => {
            el.classList.remove("ring-4", "ring-purple-500", "ring-offset-2");
          }, 3000);
        }
      }
    } else {
      stopSpeech();
    }

    return () => {
      stopSpeech();
    };
  }, [currentStepIndex, isOpen, isSpeechMuted]);

  // Auto-advance timer when playing
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setStepTimer((prev) => {
        if (prev >= currentStep.duration) {
          if (currentStepIndex < TOUR_STEPS.length - 1) {
            setCurrentStepIndex((idx) => idx + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return currentStep.duration;
          }
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, currentStepIndex, currentStep.duration]);

  const handleNext = () => {
    stopSpeech();
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    stopSpeech();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    stopSpeech();
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopSpeech();
    } else {
      setIsPlaying(true);
      speakNarration(currentStep.narration);
    }
  };

  const handleToggleMute = () => {
    if (isSpeechMuted) {
      setIsSpeechMuted(false);
      speakNarration(currentStep.narration);
    } else {
      setIsSpeechMuted(true);
      stopSpeech();
    }
  };

  if (!isOpen) return null;

  const totalSteps = TOUR_STEPS.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <AnimatePresence>
      {/* BACKGROUND SPOTLIGHT BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white overflow-hidden my-auto flex flex-col max-h-[90vh]">
          
          {/* HEADER BAR */}
          <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    CURA Interactive Self-Demo Video
                  </h3>
                  <span className="text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                    AI Voice Guided
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Step {currentStepIndex + 1} of {totalSteps} — {currentStep.featureTag}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOverviewDrawer(!showOverviewDrawer)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Grid className="h-3.5 w-3.5" />
                <span>All Steps</span>
              </button>

              <button
                onClick={handleToggleMute}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isSpeechMuted
                    ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                }`}
                title={isSpeechMuted ? "Unmute Voice Narration" : "Mute Voice Narration"}
              >
                {isSpeechMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full bg-slate-800 h-1.5 relative overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full"
              initial={{ width: `${((currentStepIndex) / totalSteps) * 100}%` }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* OVERVIEW STEP DRAWER (TOGGLE) */}
          {showOverviewDrawer && (
            <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-fadeIn max-h-48 overflow-y-auto">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setShowOverviewDrawer(false);
                  }}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer text-xs flex items-center gap-2 ${
                    idx === currentStepIndex
                      ? "bg-purple-600/30 border-purple-500 text-purple-200 font-black"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className="p-1 rounded-lg bg-slate-800 text-[10px] font-bold">{s.stepNumber}</span>
                  <span className="truncate">{s.title.replace(/[^a-zA-Z0-9 ]/g, "")}</span>
                </button>
              ))}
            </div>
          )}

          {/* MAIN DEMO FRAME WORKSPACE */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="grid md:grid-cols-12 gap-6 items-center">
              
              {/* LEFT COLUMN: TEXT, NARRATION & METRICS */}
              <div className="md:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                  {currentStep.icon}
                  <span>{currentStep.featureTag}</span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                    {currentStep.title}
                  </h2>
                  <h4 className="text-sm font-semibold text-purple-300 mt-1">
                    {currentStep.subtitle}
                  </h4>
                </div>

                <p className="text-xs text-slate-300 font-normal leading-relaxed">
                  {currentStep.description}
                </p>

                {/* AI VOICE SPOKEN NARRATION SCRIPT BUBBLE */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mic className={`h-3.5 w-3.5 ${isSpeaking ? "text-emerald-400 animate-pulse" : "text-purple-400"}`} />
                      CURA Voice Narration
                    </span>
                    {isSpeaking && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold animate-pulse">
                        Speaking...
                      </span>
                    )}
                  </div>
                  <p className="text-xs italic text-slate-200 font-medium leading-relaxed">
                    "{currentStep.narration}"
                  </p>
                </div>

                {/* FEATURE HIGHLIGHT METRICS */}
                {currentStep.metrics && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {currentStep.metrics.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">{m.label}</span>
                        <span className="text-sm font-black text-emerald-400 mt-0.5 block">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: SIMULATED INTERACTIVE FEATURE PREVIEW CANVAS */}
              <div className="md:col-span-6">
                <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-inner space-y-4 relative overflow-hidden group">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-mono text-slate-500 ml-2">cura.ai/demo/{currentStep.id}</span>
                    </div>
                    <span className="text-[9px] bg-slate-800 text-indigo-300 font-bold px-2 py-0.5 rounded-md border border-slate-700">
                      Live Preview
                    </span>
                  </div>

                  {/* DYNAMIC MOCKUP VISUALIZER BASED ON STEP */}
                  <div className="min-h-[220px] flex flex-col justify-center items-center relative">
                    {currentStep.previewType === "welcome" && (
                      <div className="text-center space-y-3 animate-fadeIn">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/30">
                          <Sparkles className="h-8 w-8 animate-spin" style={{ animationDuration: "8s" }} />
                        </div>
                        <h4 className="text-sm font-black text-white">Autonomous Clinical Operating System</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                          Empowering 10,000+ Doctors across India with AI-powered consultations.
                        </p>
                      </div>
                    )}

                    {currentStep.previewType === "dashboard" && (
                      <div className="w-full space-y-2 animate-fadeIn text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                          <span className="text-slate-300 font-bold">Today's OPD Patients</span>
                          <span className="text-emerald-400 font-black">28 Scheduled</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex justify-between items-center">
                          <span className="font-bold">🔴 High Risk Alert: Ramesh K.</span>
                          <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded">BP 168/104</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex justify-between items-center">
                          <span className="font-bold">⚡ AI CDSS Suggestion</span>
                          <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded">Amlodipine 5mg</span>
                        </div>
                      </div>
                    )}

                    {currentStep.previewType === "patient" && (
                      <div className="w-full space-y-2 animate-fadeIn text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <div className="flex justify-between font-black text-slate-200">
                            <span>PAT-9082 • Ananya Sharma (34F)</span>
                            <span className="text-emerald-400">Risk Score: Low</span>
                          </div>
                          <p className="text-[10px] text-slate-400">History: Allergic Rhinitis, Type 2 DM (Controlled)</p>
                          <div className="text-[10px] font-mono text-purple-300 bg-purple-950/50 p-1.5 rounded border border-purple-800/40 mt-1">
                            Last HbA1c: 6.4% (Down from 7.1% 3 months ago)
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.previewType === "memory" && (
                      <div className="w-full space-y-2 animate-fadeIn text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                          <div className="flex justify-between text-slate-300 font-black">
                            <span>Learned Prescribing Rules</span>
                            <span className="text-fuchsia-400 font-mono">96% Accuracy</span>
                          </div>
                          <div className="space-y-1 text-[10px]">
                            <div className="p-1.5 rounded bg-slate-950 text-slate-300 border border-slate-800 flex justify-between">
                              <span>Hypertension 1st line:</span>
                              <span className="text-emerald-400 font-bold">Telmisartan 40mg (Telma 40)</span>
                            </div>
                            <div className="p-1.5 rounded bg-slate-950 text-slate-300 border border-slate-800 flex justify-between">
                              <span>Acidity co-rx:</span>
                              <span className="text-amber-400 font-bold">Pantoprazole 40mg (Pan-40)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.previewType === "voice" && (
                      <div className="w-full space-y-3 animate-fadeIn text-xs text-center">
                        <div className="flex justify-center items-center gap-1 my-2">
                          {[40, 70, 30, 90, 60, 100, 50, 80, 40].map((h, i) => (
                            <motion.span
                              key={i}
                              animate={{ height: [10, h, 10] }}
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                              className="w-1.5 bg-rose-500 rounded-full"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-300 italic bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          "Patient complains of 3-day dry cough and fever. Give Azithromycin 500mg once daily for 5 days."
                        </p>
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                          ✓ Auto-structured into SOAP Note & Prescription PDF
                        </div>
                      </div>
                    )}

                    {currentStep.previewType === "interaction" && (
                      <div className="w-full space-y-2 animate-fadeIn text-xs">
                        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 space-y-1">
                          <div className="flex items-center justify-between font-black">
                            <span className="flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5 text-rose-400" />
                              CRITICAL INTERACTION DETECTED
                            </span>
                            <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[9px]">
                              STOP
                            </span>
                          </div>
                          <p className="text-[10px]">
                            Warfarin (Patient Chronic) + Aspirin 75mg (Drafted) → Severe Upper GI Bleeding Hazard
                          </p>
                          <div className="p-2 bg-slate-950 rounded-lg text-emerald-300 text-[10px] font-bold border border-slate-800 flex justify-between items-center mt-2">
                            <span>Sub Paracetamol 650mg for Analgesia</span>
                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded cursor-pointer">
                              1-Click Replace
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.previewType === "whatsapp" && (
                      <div className="w-full space-y-2 animate-fadeIn text-xs">
                        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 space-y-1.5">
                          <div className="flex items-center justify-between font-black">
                            <span className="flex items-center gap-1">
                              <Send className="h-3.5 w-3.5 text-emerald-400" />
                              WhatsApp Dispatch Ready
                            </span>
                            <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded">
                              +91 9876543210
                            </span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-lg text-slate-300 text-[10px] space-y-1 border border-slate-800">
                            <p>🏥 Dr. Rajesh Sharma sent your digital prescription & diet guidelines.</p>
                            <span className="text-[9px] text-emerald-400 font-mono block">📄 Rx_AnanyaSharma_2026.pdf (Signed)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.previewType === "ayush" && (
                      <div className="w-full space-y-2 animate-fadeIn text-xs text-center">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                          <div className="flex justify-around text-slate-300 font-bold text-[10px]">
                            <span className="text-amber-400">Vata: 25%</span>
                            <span className="text-rose-400">Pitta: 65% (High)</span>
                            <span className="text-cyan-400">Kapha: 10%</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-lg text-teal-300 text-[10px] font-semibold border border-slate-800">
                            Suggested Herb: Avipattikar Churna 1 tsp before meals for Pitta pacification.
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.previewType === "telemedicine" && (
                      <div className="w-full space-y-2 animate-fadeIn text-xs">
                        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-200 space-y-2">
                          <div className="flex justify-between items-center font-black">
                            <span>📹 HD Tele-Consultation Active</span>
                            <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                              Live Stream
                            </span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-lg text-slate-300 text-[10px] flex justify-between border border-slate-800">
                            <span>Patient Video Room #782</span>
                            <span className="text-cyan-400 font-mono">HR: 76 bpm | SpO2: 98%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep.previewType === "followup" && (
                      <div className="w-full space-y-2 animate-fadeIn text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                          <div className="flex justify-between text-violet-300 font-black">
                            <span>Automated Care Recall</span>
                            <span className="text-emerald-400 font-bold">14 Reminders Sent</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            "Hi Ramesh, your follow-up BP check with Dr. Sharma is scheduled for tomorrow at 10:00 AM."
                          </p>
                        </div>
                      </div>
                    )}

                    {currentStep.previewType === "complete" && (
                      <div className="text-center space-y-3 animate-fadeIn">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                          <Award className="h-8 w-8" />
                        </div>
                        <h4 className="text-sm font-black text-white">Tour Complete!</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                          Click below to navigate directly into your live Doctor Command Center.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* FOOTER CONTROLS BAR */}
          <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            {/* PLAYBACK / SPEED CONTROLS */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlay}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isPlaying
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                    : "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 shadow"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause Tour</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span>Resume Auto-Play</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRestart}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Restart Product Tour"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {currentStep.targetId && onNavigateToFeature && (
                <button
                  onClick={() => {
                    if (currentStep.targetId) {
                      onNavigateToFeature(currentStep.targetId);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Try Feature Now</span>
                </button>
              )}
            </div>

            {/* PREV / NEXT NAVIGATION BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {currentStepIndex < totalSteps - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-500/20 transition-all cursor-pointer border-0 flex items-center gap-1.5"
                >
                  <span>Next Step ({currentStepIndex + 2}/{totalSteps})</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 transition-all cursor-pointer border-0 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Start Live Consultations</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProductTour;
