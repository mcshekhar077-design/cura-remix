import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Pill, 
  Calendar, 
  Activity, 
  Clock, 
  User, 
  Bot, 
  Camera, 
  CheckCircle2, 
  Send, 
  PhoneCall,
  MapPin,
  AlertTriangle,
  Loader2
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface VoiceCommand {
  id: string;
  keywords: string[];
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: "navigation" | "action" | "information";
  priority: number;
}

interface VoiceCommandOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  onAddVitalsClick?: () => void;
  onBookAppointmentClick?: () => void;
  onOpenRefillModal?: () => void;
  onJoinCallClick?: () => void;
  onViewRouteClick?: () => void;
  onOpenScanner?: () => void;
  onOpenProfile?: () => void;
  onViewHistory?: () => void;
}

interface VoiceMatchResult {
  command: VoiceCommand;
  confidence: number;
  matchedKeyword: string;
}

// ============================================
// COMMAND DEFINITIONS
// ============================================

const VOICE_COMMANDS: VoiceCommand[] = [
  {
    id: "prescriptions",
    keywords: ["prescription", "medication", "medicine", "rx", "pills", "drugs", "pharmacy"],
    action: "prescriptions",
    icon: Pill,
    description: "Open Prescriptions & Medications",
    category: "navigation",
    priority: 10
  },
  {
    id: "vitals",
    keywords: ["record vitals", "log vitals", "add vitals", "vitals", "blood pressure", "heart rate", "sugar level", "glucose", "temperature"],
    action: "vitals",
    icon: Activity,
    description: "Record Vitals",
    category: "action",
    priority: 9
  },
  {
    id: "appointments",
    keywords: ["schedule", "appointment", "book", "consultation", "doctor visit", "meeting", "consult"],
    action: "appointments",
    icon: Calendar,
    description: "Open Appointments & Booking",
    category: "navigation",
    priority: 8
  },
  {
    id: "history",
    keywords: ["history", "timeline", "logs", "emr", "records", "medical history", "past visits"],
    action: "history",
    icon: Clock,
    description: "View Health History & Logs",
    category: "navigation",
    priority: 7
  },
  {
    id: "companion",
    keywords: ["companion", "health memory", "ask ai", "chat", "ai assistant", "assistant", "help"],
    action: "companion",
    icon: Bot,
    description: "Open AI Health Companion",
    category: "navigation",
    priority: 8
  },
  {
    id: "scanner",
    keywords: ["scan", "camera", "reader", "vision", "ocr", "prescription scan"],
    action: "scanner",
    icon: Camera,
    description: "Open Prescription Scanner",
    category: "navigation",
    priority: 6
  },
  {
    id: "profile",
    keywords: ["profile", "abha", "account", "my details", "personal info", "settings"],
    action: "profile",
    icon: User,
    description: "Open Patient Profile",
    category: "navigation",
    priority: 5
  },
  {
    id: "refill",
    keywords: ["refill", "order medicine", "reorder", "get refill", "prescription refill"],
    action: "refill",
    icon: Pill,
    description: "Open Prescription Refill",
    category: "action",
    priority: 7
  },
  {
    id: "call",
    keywords: ["call doctor", "video call", "join call", "telehealth", "telemedicine"],
    action: "call",
    icon: PhoneCall,
    description: "Start Telehealth Video Call",
    category: "action",
    priority: 6
  },
  {
    id: "directions",
    keywords: ["map", "route", "directions", "clinic location", "hospital", "find doctor"],
    action: "directions",
    icon: MapPin,
    description: "Open Map Directions",
    category: "information",
    priority: 4
  }
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function VoiceCommandOverlay({
  isOpen,
  onClose,
  onNavigateTab,
  onAddVitalsClick,
  onBookAppointmentClick,
  onOpenRefillModal,
  onJoinCallClick,
  onViewRouteClick,
  onOpenScanner,
  onOpenProfile,
  onViewHistory
}: VoiceCommandOverlayProps): React.ReactElement | null {
  // State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string>("Say a command like 'Open my prescriptions' or 'Record vitals'");
  const [matchedAction, setMatchedAction] = useState<VoiceCommand | null>(null);
  const [manualInput, setManualInput] = useState<string>("");
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  // Refs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // COMMAND PROCESSING
  // ============================================

  const processCommand = useCallback((rawText: string): VoiceMatchResult | null => {
    const text = rawText.toLowerCase().trim();
    if (!text) return null;

    let bestMatch: VoiceMatchResult | null = null;
    let highestConfidence = 0;

    for (const command of VOICE_COMMANDS) {
      for (const keyword of command.keywords) {
        const keywordLower = keyword.toLowerCase();
        if (text.includes(keywordLower)) {
          // Calculate confidence based on keyword length and position
          const confidence = (keywordLower.length / text.length) * 10 + 
                           (text.indexOf(keywordLower) === 0 ? 5 : 0) +
                           (text === keywordLower ? 10 : 0) +
                           command.priority;
          
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = {
              command,
              confidence: Math.min((confidence / 25) * 100, 100),
              matchedKeyword: keyword
            };
          }
        }
      }
    }

    return bestMatch;
  }, []);

  const stopListening = useCallback((): void => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop error
      }
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const executeAction = useCallback((command: VoiceCommand): void => {
    setMatchedAction(command);
    setVoiceFeedback(`✓ Command Recognized: ${command.description}`);
    setCommandHistory(prev => [...prev, command.description].slice(-5));
    stopListening();

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      
      switch (command.action) {
        case "prescriptions":
          onNavigateTab?.("rx");
          break;
        case "vitals":
          onAddVitalsClick?.();
          break;
        case "appointments":
          if (transcript.includes("book") || transcript.includes("new")) {
            onBookAppointmentClick?.();
          } else {
            onNavigateTab?.("schedule");
          }
          break;
        case "history":
          onViewHistory?.();
          break;
        case "companion":
          onNavigateTab?.("companion");
          break;
        case "scanner":
          onOpenScanner?.();
          break;
        case "profile":
          onOpenProfile?.();
          break;
        case "refill":
          onOpenRefillModal?.();
          break;
        case "call":
          onJoinCallClick?.();
          break;
        case "directions":
          onViewRouteClick?.();
          break;
        default:
          onNavigateTab?.("companion");
      }
      
      onClose();
    }, 900);
  }, [transcript, onNavigateTab, onAddVitalsClick, onBookAppointmentClick, onViewHistory, onOpenScanner, onOpenProfile, onOpenRefillModal, onJoinCallClick, onViewRouteClick, onClose, stopListening]);

  // ============================================
  // SPEECH RECOGNITION
  // ============================================

  const initSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") {
      setSpeechSupported(false);
      setVoiceFeedback("Speech recognition not available in this environment");
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setVoiceFeedback("Speech recognition not supported in this browser. Use the text input below.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 3;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      if (!isMountedRef.current) return;

      let currentTranscript = "";
      let finalTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          currentTranscript += result[0].transcript;
        }
      }

      const displayText = finalTranscript || currentTranscript;
      setTranscript(displayText);
      
      if (finalTranscript) {
        const match = processCommand(finalTranscript);
        if (match && match.confidence > 30) {
          executeAction(match.command);
        } else {
          setVoiceFeedback(`Unrecognized: "${finalTranscript}". Try one of the sample commands below.`);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (!isMountedRef.current) return;
      
      console.warn("Speech recognition error:", event.error);
      
      switch (event.error) {
        case "not-allowed":
          setRecognitionError("Microphone access denied. Please allow microphone access and try again.");
          setVoiceFeedback("Microphone access denied. Please allow microphone access.");
          setIsListening(false);
          break;
        case "network":
          setRecognitionError("Network error. Please check your connection.");
          setVoiceFeedback("Network error. Please check your connection.");
          break;
        case "no-speech":
          setVoiceFeedback("No speech detected. Please try speaking again.");
          break;
        case "audio-capture":
          setRecognitionError("No microphone found. Please check your audio device.");
          setVoiceFeedback("No microphone found. Please check your audio device.");
          setIsListening(false);
          break;
        default:
          setVoiceFeedback("Listening... Speak clearly or tap a sample command below.");
      }
    };

    recognition.onend = () => {
      if (!isMountedRef.current) return;
      
      // Auto-restart if still listening
      if (isListening && !recognitionError) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        restartTimeoutRef.current = setTimeout(() => {
          if (isListening && isMountedRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Already started or error
            }
          }
        }, 300);
      }
    };

    return recognition;
  }, [isListening, recognitionError, processCommand, executeAction]);

  // Start listening helper
  const startListening = useCallback((): void => {
    if (!speechSupported) {
      setVoiceFeedback("Speech recognition not supported. Please use text input.");
      return;
    }

    setIsListening(true);
    setRecognitionError(null);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  }, [speechSupported]);

  // Initialize speech recognition
  useEffect(() => {
    isMountedRef.current = true;
    
    const recognition = initSpeechRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
    }

    return () => {
      isMountedRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore stop errors
        }
      }
    };
  }, [initSpeechRecognition]);

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      setTranscript("");
      setMatchedAction(null);
      setRecognitionError(null);
      setVoiceFeedback("Say a command like 'Open my prescriptions' or 'Record vitals'");
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen, startListening, stopListening]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleManualSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    
    const trimmedInput = manualInput.trim();
    setTranscript(trimmedInput);
    
    const match = processCommand(trimmedInput);
    if (match && match.confidence > 30) {
      executeAction(match.command);
    } else {
      setVoiceFeedback(`Unrecognized: "${trimmedInput}". Try one of the sample commands.`);
      setTranscript("");
    }
    setManualInput("");
  }, [manualInput, processCommand, executeAction]);

  const handleSampleCommandClick = useCallback((command: VoiceCommand): void => {
    setTranscript(command.keywords[0]);
    executeAction(command);
  }, [executeAction]);

  // Memoized values
  const sampleCommands = useMemo(() => {
    return VOICE_COMMANDS.slice(0, 8);
  }, []);

  const isProcessingState = isProcessing || (matchedAction !== null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="voice-command-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label="Voice Command Navigator"
      >
        <motion.div
          id="voice-command-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                  Patient Voice Navigator
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-normal">
                    AI VOICE
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Hands-Free Clinical Commands</p>
              </div>
            </div>

            <button
              id="btn-close-voice-overlay"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close voice command overlay"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            {/* Listening Visualizer */}
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="relative flex items-center justify-center">
                {/* Animated rings */}
                {isListening && !isProcessingState && (
                  <>
                    <span className="absolute h-28 w-28 rounded-full border-2 border-emerald-500/10 animate-ping" />
                    <span className="absolute h-24 w-24 rounded-full border-2 border-emerald-500/20 animate-pulse" />
                    <span className="absolute h-20 w-20 rounded-full border-2 border-emerald-500/30 animate-pulse" />
                  </>
                )}
                
                {isProcessingState && (
                  <span className="absolute h-24 w-24 rounded-full border-2 border-amber-500/30 animate-pulse" />
                )}
                
                <button
                  id="btn-mic-toggle"
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  disabled={!speechSupported}
                  className={`relative z-10 h-16 w-16 rounded-2xl flex items-center justify-center transition-all shadow-xl cursor-pointer border ${
                    isProcessingState
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : isListening
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                  } ${!speechSupported ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label={isListening ? "Stop listening" : "Start listening"}
                >
                  {isProcessingState ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : isListening ? (
                    <Mic className="h-8 w-8 animate-bounce" />
                  ) : (
                    <MicOff className="h-8 w-8 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  isProcessingState
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                    : isListening
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}>
                  {isProcessingState ? "● Processing Command..." :
                   isListening ? "● Microphone Active — Speak Now" : 
                   !speechSupported ? "⚠️ Speech Not Supported" : "⏸ Paused — Tap Mic to Start"}
                </span>

                {transcript && !isProcessingState && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-semibold text-emerald-300 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80 max-w-sm mx-auto italic"
                  >
                    "{transcript}"
                  </motion.p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {recognitionError && (
              <div className="bg-rose-950/60 border border-rose-500/40 p-3 rounded-xl flex items-start gap-2.5 text-rose-200">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 block">Error</span>
                  <p className="text-xs text-rose-300">{recognitionError}</p>
                  <button
                    onClick={() => {
                      setRecognitionError(null);
                      startListening();
                    }}
                    className="mt-1 text-[10px] font-bold text-rose-400 underline hover:text-rose-300"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Matched Action Confirmation */}
            {matchedAction && !isProcessingState && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-950/80 border border-emerald-500/40 p-3.5 rounded-xl flex items-center gap-3 text-emerald-200"
              >
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">Command Executing</span>
                  <p className="text-xs font-bold text-white mt-0.5">{matchedAction.description}</p>
                </div>
              </motion.div>
            )}

            {/* Voice Feedback */}
            {!matchedAction && !recognitionError && (
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                <p className="text-[11px] font-medium text-slate-300 text-center min-h-[24px]">
                  {voiceFeedback}
                </p>
              </div>
            )}

            {/* Manual Input */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                id="input-voice-manual"
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Or type voice command (e.g. 'open my prescriptions')..."
                className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                aria-label="Type a voice command"
                disabled={isProcessingState}
              />
              <button
                id="btn-voice-manual-run"
                type="submit"
                disabled={!manualInput.trim() || isProcessingState}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1 shrink-0"
                aria-label="Submit command"
              >
                {isProcessingState ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Run
              </button>
            </form>

            {/* Command History */}
            {commandHistory.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="font-bold uppercase tracking-wider">Recent:</span>
                {commandHistory.map((cmd, i) => (
                  <span key={i} className="text-slate-400 font-mono">
                    {i > 0 && " • "}{cmd}
                  </span>
                ))}
              </div>
            )}

            {/* Sample Commands */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Sample Voice Commands (Click to Test):
              </span>

              <div className="grid grid-cols-2 gap-2">
                {sampleCommands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.id}
                      type="button"
                      onClick={() => handleSampleCommandClick(command)}
                      disabled={isProcessingState}
                      className="flex items-center gap-2 p-2 bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-[10.5px] font-semibold text-slate-300 hover:text-emerald-300 transition-all cursor-pointer text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Run command: ${command.description}`}
                    >
                      <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                      <span className="truncate text-[10px]">{command.keywords[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-950/80 p-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60"></span>
              <span>Powered by Web Speech API & Clinical NLU</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] uppercase tracking-wider text-slate-600">
                {speechSupported ? "Speech-to-Action Active" : "Text-Only Mode"}
              </span>
              <button
                onClick={() => {
                  setCommandHistory([]);
                  setTranscript("");
                }}
                className="text-slate-600 hover:text-slate-300 transition-colors"
                aria-label="Clear history"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
