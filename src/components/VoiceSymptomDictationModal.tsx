import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Activity, 
  HeartPulse, 
  Check, 
  CheckCircle2, 
  X, 
  Volume2, 
  RefreshCw, 
  Tag, 
  Clock, 
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown
} from "lucide-react";

export interface DictatedSymptomLog {
  date: string;
  bpSystolic: number;
  bpDiastolic: number;
  hr: number;
  sugar: number;
  weight?: number;
  height?: number;
  symptoms: string[];
  symptomNotes: string;
  loggedVia: string;
  timestamp: string;
  severity?: "Mild" | "Moderate" | "Severe";
}

interface VoiceSymptomDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: DictatedSymptomLog) => void;
  latestVitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    hr?: number;
    sugar?: number;
    weight?: number;
    height?: number;
  } | null;
}

const COMMON_SYMPTOMS_CATALOG = [
  "Headache",
  "Fever",
  "Cough",
  "Cold / Congestion",
  "Fatigue",
  "Dizziness",
  "Nausea",
  "Chest Tightness",
  "Shortness of Breath",
  "Sore Throat",
  "Stomach Ache",
  "Acidity / Heartburn",
  "Joint Pain",
  "Back Pain",
  "Anxiety / Palpitations",
  "Insomnia",
  "Loss of Appetite",
  "Skin Rash"
];

const PRESET_DICTATIONS = [
  {
    title: "Headache & Fatigue",
    text: "Feeling mild throbbing headache and general fatigue after working on screen, heart rate feels around 74.",
    symptoms: ["Headache", "Fatigue"],
    severity: "Mild" as const
  },
  {
    title: "Fever & Sore Throat",
    text: "Running a mild feverish feeling around 100 degrees with dry cough and itchy sore throat since yesterday.",
    symptoms: ["Fever", "Cough", "Sore Throat"],
    severity: "Moderate" as const
  },
  {
    title: "Dizziness & Acidity",
    text: "Had sudden dizziness upon standing with burning acidity after lunch. Blood pressure feels around 125 over 82.",
    symptoms: ["Dizziness", "Acidity / Heartburn"],
    severity: "Mild" as const
  },
  {
    title: "Chest Tightness & Breathlessness",
    text: "Feeling moderate tightness in chest with mild shortness of breath following stairs. Pulse is about 86 bpm.",
    symptoms: ["Chest Tightness", "Shortness of Breath", "Anxiety / Palpitations"],
    severity: "Moderate" as const
  },
  {
    title: "Normal Check-in",
    text: "Feeling energetic and healthy today, no major discomfort. Blood pressure 120 over 80 and sugar 98.",
    symptoms: [],
    severity: "Mild" as const
  }
];

export default function VoiceSymptomDictationModal({
  isOpen,
  onClose,
  onSave,
  latestVitals
}: VoiceSymptomDictationModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptomInput, setCustomSymptomInput] = useState("");
  const [severity, setSeverity] = useState<"Mild" | "Moderate" | "Severe">("Mild");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechLang, setSpeechLang] = useState<"en-US" | "en-IN" | "hi-IN">("en-IN");
  const [detectedVitals, setDetectedVitals] = useState<{
    hr?: number;
    bpSystolic?: number;
    bpDiastolic?: number;
    sugar?: number;
    weight?: number;
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [audioWaveLevels, setAudioWaveLevels] = useState<number[]>([15, 25, 40, 65, 30, 20, 50, 75, 45, 20, 35, 60]);

  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTranscript("");
      setInterimText("");
      setSelectedSymptoms([]);
      setCustomSymptomInput("");
      setSeverity("Mild");
      setDetectedVitals({});
      setIsSuccess(false);
      setIsListening(false);
    } else {
      stopListening();
    }
  }, [isOpen]);

  // Audio wave animation while listening
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setAudioWaveLevels(
          Array.from({ length: 14 }, () => Math.floor(Math.random() * 70) + 15)
        );
      }, 100);
    } else {
      setAudioWaveLevels([10, 15, 20, 25, 15, 10, 12, 18, 14, 10, 15, 20, 12, 10]);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  // Real-time NLP extractor for symptoms and biometric mentions
  const extractSymptomsAndVitals = (text: string) => {
    const lower = text.toLowerCase();
    const detected: string[] = [];

    // Symptom keyword matching map
    const symptomRules: { [key: string]: string[] } = {
      "Headache": ["headache", "head pain", "migraine", "head throbbing", "sir dard"],
      "Fever": ["fever", "feverish", "high temperature", "chills", "bukhar", "warm", "100 degrees", "101 degrees", "102 degrees"],
      "Cough": ["cough", "coughing", "khansi", "phlegm", "dry cough"],
      "Cold / Congestion": ["cold", "runny nose", "blocked nose", "congestion", "sneezing", "sinus", "nazla", "zukam"],
      "Fatigue": ["fatigue", "tired", "exhausted", "weakness", "lethargic", "thakan", "low energy", "drained"],
      "Dizziness": ["dizzy", "dizziness", "lightheaded", "vertigo", "chakkar", "spinning"],
      "Nausea": ["nausea", "nauseous", "vomiting", "vomit", "puking", "ultee", "queasy"],
      "Chest Tightness": ["chest pain", "chest tightness", "tight chest", "chest pressure", "heavy chest"],
      "Shortness of Breath": ["shortness of breath", "breathless", "difficulty breathing", "pant", "wheezing", "saans"],
      "Sore Throat": ["sore throat", "throat pain", "itchy throat", "gala kharab", "gale me dard", "tonsils"],
      "Stomach Ache": ["stomach ache", "stomach pain", "abdominal pain", "pet dard", "tummy ache", "cramp"],
      "Acidity / Heartburn": ["acidity", "heartburn", "acid reflux", "gerd", "burning in chest", "gas", "bloated", "bloating"],
      "Joint Pain": ["joint pain", "knee pain", "elbow pain", "arthritis", "stiffness", "swollen joints", "jodo me dard"],
      "Back Pain": ["back pain", "lower back pain", "spine pain", "kamar dard", "back ache"],
      "Anxiety / Palpitations": ["anxiety", "anxious", "palpitations", "rapid heartbeat", "heart racing", "nervous", "ghabrahat"],
      "Insomnia": ["insomnia", "sleepless", "cannot sleep", "poor sleep", "neend nahi"],
      "Loss of Appetite": ["loss of appetite", "not feeling like eating", "appetite loss", "bhookh nahi"],
      "Skin Rash": ["rash", "itching", "skin allergy", "red spots", "khujli", "hives"]
    };

    Object.entries(symptomRules).forEach(([symptomName, keywords]) => {
      if (keywords.some(kw => lower.includes(kw))) {
        if (!detected.includes(symptomName)) {
          detected.push(symptomName);
        }
      }
    });

    // Auto-detect severity
    if (lower.includes("severe") || lower.includes("intense") || lower.includes("unbearable") || lower.includes("terrible") || lower.includes("very high")) {
      setSeverity("Severe");
    } else if (lower.includes("moderate") || lower.includes("medium") || lower.includes("quite") || lower.includes("somewhat")) {
      setSeverity("Moderate");
    } else if (lower.includes("mild") || lower.includes("slight") || lower.includes("little") || lower.includes("bit")) {
      setSeverity("Mild");
    }

    // Extract numerical vitals if spoken
    const vitalsFound: any = {};
    
    // BP check (e.g. 120 over 80 or bp 120/80)
    const bpMatch = text.match(/(\d{2,3})\s*(?:over|\/|by)\s*(\d{2,3})/i) ||
                    text.match(/(?:bp|blood pressure)\s*(?:is|of|was)?\s*(\d{2,3})\s*(?:over|\/|by)?\s*(\d{2,3})/i);
    if (bpMatch) {
      vitalsFound.bpSystolic = parseInt(bpMatch[1], 10);
      vitalsFound.bpDiastolic = parseInt(bpMatch[2], 10);
    }

    // HR check
    const hrMatch = text.match(/(?:pulse|heart rate|hr|bpm|beats)\s*(?:is|of|was|around|about)?\s*(\d{2,3})/i) ||
                    text.match(/(\d{2,3})\s*(?:bpm|beats per minute)/i);
    if (hrMatch) {
      vitalsFound.hr = parseInt(hrMatch[1], 10);
    }

    // Sugar check
    const sugarMatch = text.match(/(?:sugar|glucose|blood sugar)\s*(?:is|of|was|around)?\s*(\d{2,3})/i);
    if (sugarMatch) {
      vitalsFound.sugar = parseInt(sugarMatch[1], 10);
    }

    // Weight check
    const weightMatch = text.match(/(?:weight|weigh|weighs)\s*(?:is|of|was|around)?\s*(\d{2,3}(?:\.\d+)?)/i) ||
                        text.match(/(\d{2,3}(?:\.\d+)?)\s*(?:kg|kilos|kilograms)/i);
    if (weightMatch) {
      vitalsFound.weight = parseFloat(weightMatch[1]);
    }

    setDetectedVitals(vitalsFound);
    setSelectedSymptoms(prev => Array.from(new Set([...prev, ...detected])));
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let currentFinal = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript + " ";
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentFinal) {
          const updated = (transcript + " " + currentFinal).trim();
          setTranscript(updated);
          extractSymptomsAndVitals(updated);
          setInterimText("");
        } else {
          setInterimText(currentInterim);
          if (currentInterim) {
            extractSymptomsAndVitals(transcript + " " + currentInterim);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech Recognition Error:", event.error);
        if (event.error === "not-allowed") {
          alert("Microphone access was denied. Please allow microphone permissions in your browser bar.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to initialize speech recognition", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_DICTATIONS[0]) => {
    stopListening();
    setTranscript(preset.text);
    setSelectedSymptoms(preset.symptoms);
    setSeverity(preset.severity);
    extractSymptomsAndVitals(preset.text);
  };

  const handleToggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAddCustomSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSymptomInput.trim()) return;
    const clean = customSymptomInput.trim();
    if (!selectedSymptoms.includes(clean)) {
      setSelectedSymptoms(prev => [...prev, clean]);
    }
    setCustomSymptomInput("");
  };

  const handleSaveToVitals = () => {
    if (!transcript.trim() && selectedSymptoms.length === 0) {
      alert("Please dictate or describe your symptoms before saving.");
      return;
    }

    const todayDateStr = new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    
    // Construct the comprehensive vitals and symptoms record
    const finalLog: DictatedSymptomLog = {
      date: todayDateStr,
      bpSystolic: detectedVitals.bpSystolic || latestVitals?.bpSystolic || 120,
      bpDiastolic: detectedVitals.bpDiastolic || latestVitals?.bpDiastolic || 80,
      hr: detectedVitals.hr || latestVitals?.hr || 72,
      sugar: detectedVitals.sugar || latestVitals?.sugar || 100,
      weight: detectedVitals.weight || latestVitals?.weight || 70,
      height: latestVitals?.height || 172,
      symptoms: [...selectedSymptoms],
      symptomNotes: transcript.trim() || `Reported symptoms: ${selectedSymptoms.join(", ")} (${severity} severity)`,
      loggedVia: "voice_to_text",
      timestamp: new Date().toISOString(),
      severity: severity
    };

    setIsSuccess(true);
    setTimeout(() => {
      onSave(finalLog);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl text-slate-950 shadow-md">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Voice-to-Text Symptom Logger</h3>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-extrabold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                  AI Transcribe
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Dictate today's physical feelings or symptoms — auto-analyzed & stored in Vitals History
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4.5 overflow-y-auto space-y-4 flex-1">
          
          {/* SUCCESS OVERLAY STATE */}
          {isSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 animate-bounce">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h4 className="text-base font-black text-white">Symptom Log Saved to Vitals History!</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your dictated symptoms and baseline vitals have been successfully recorded in your timeline.
              </p>
            </div>
          ) : (
            <>
              {/* 1. INTERACTIVE VOICE RECORDING HUB */}
              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl relative overflow-hidden space-y-3.5 shadow-inner">
                
                {/* Language Selector & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${isListening ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                      {isListening ? "Listening live..." : "Microphone Ready"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Language:</span>
                    <select
                      value={speechLang}
                      onChange={(e) => setSpeechLang(e.target.value as any)}
                      disabled={isListening}
                      className="bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="en-IN">🇮🇳 English (India)</option>
                      <option value="en-US">🇺🇸 English (US)</option>
                      <option value="hi-IN">🇮🇳 Hindi (हिन्दी)</option>
                    </select>
                  </div>
                </div>

                {/* Animated Audio Waveform Visualizer */}
                <div className="flex items-center justify-center gap-1.5 h-12 bg-slate-900/60 rounded-xl px-4 border border-slate-800/60">
                  {audioWaveLevels.map((height, idx) => (
                    <motion.div
                      key={idx}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        isListening 
                          ? "bg-gradient-to-t from-emerald-500 to-teal-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                          : "bg-slate-700"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                {/* Big Mic Dictation Button & Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleToggleListening}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      isListening
                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30 active:scale-95"
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-4 w-4" /> Stop Dictating
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" /> Tap to Start Speaking
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    {transcript && (
                      <button
                        type="button"
                        onClick={() => {
                          setTranscript("");
                          setSelectedSymptoms([]);
                          setDetectedVitals({});
                        }}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Clear transcript"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Clear
                      </button>
                    )}
                  </div>
                </div>

                {!speechSupported && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[10px] text-amber-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>Web Speech API is not natively active in this browser frame. You can type below or click sample dictations.</span>
                  </div>
                )}
              </div>

              {/* 2. ONE-CLICK SAMPLE DICTATION PRESETS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-400" /> Or Choose a Quick Dictation Sample:
                  </span>
                  <span className="text-slate-500">1-Tap Fill</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_DICTATIONS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-750 hover:border-emerald-500/40 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. DICTATED TRANSCRIPT TEXTAREA */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Dictated Symptom Notes & Narrative</span>
                  <span className="text-slate-500 text-[9px]">Editable</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={transcript + (interimText ? ` (${interimText}...)` : "")}
                    onChange={(e) => {
                      setTranscript(e.target.value);
                      extractSymptomsAndVitals(e.target.value);
                    }}
                    placeholder="E.g. 'Feeling tired with headache and slight feverish chills since morning, BP 120/80...'"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* 4. RECOGNIZED SYMPTOM TAGS */}
              <div className="space-y-2 bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                      Identified Symptoms ({selectedSymptoms.length})
                    </span>
                  </div>
                  
                  {/* Severity Selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase mr-1">Severity:</span>
                    {(["Mild", "Moderate", "Severe"] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all cursor-pointer ${
                          severity === sev
                            ? sev === "Severe"
                              ? "bg-rose-500 text-white"
                              : sev === "Moderate"
                              ? "bg-amber-500 text-slate-950"
                              : "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Tag Pills */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                  {selectedSymptoms.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic">
                      No symptoms tagged yet. Speak keywords like "headache", "cough", "fever", or tap common tags below.
                    </span>
                  ) : (
                    selectedSymptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      >
                        <span>{symptom}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSymptom(symptom)}
                          className="hover:text-rose-400 transition-colors cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Quick Add Common Symptoms Checklist */}
                <div className="pt-2 border-t border-slate-900 space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Quick Toggle Popular Symptoms:
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-0.5">
                    {COMMON_SYMPTOMS_CATALOG.map((sym) => {
                      const isSelected = selectedSymptoms.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => handleToggleSymptom(sym)}
                          className={`px-2 py-0.5 rounded-md text-[9.5px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                              : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}{sym}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom Symptom Field */}
                <form onSubmit={handleAddCustomSymptom} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customSymptomInput}
                    onChange={(e) => setCustomSymptomInput(e.target.value)}
                    placeholder="Type custom symptom (e.g. Left shoulder stiffness)..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* 5. VITALS BUNDLED WITH THIS LOG */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-sky-400" />
                    Associated Vitals Point (Saved in History)
                  </span>
                  <span className="text-emerald-400 font-mono text-[9px]">
                    {detectedVitals.bpSystolic ? "✓ Spoken Vitals Detected" : "Baseline Vitals Applied"}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[8px] text-slate-500 block uppercase">Blood Pressure</span>
                    <span className="font-black text-white">
                      {detectedVitals.bpSystolic || latestVitals?.bpSystolic || 120}/
                      {detectedVitals.bpDiastolic || latestVitals?.bpDiastolic || 80}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[8px] text-slate-500 block uppercase">Heart Rate</span>
                    <span className="font-black text-rose-400">
                      {detectedVitals.hr || latestVitals?.hr || 72} BPM
                    </span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[8px] text-slate-500 block uppercase">Blood Sugar</span>
                    <span className="font-black text-amber-400">
                      {detectedVitals.sugar || latestVitals?.sugar || 100} mg/dL
                    </span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 hidden sm:block">
                    <span className="text-[8px] text-slate-500 block uppercase">Weight</span>
                    <span className="font-black text-emerald-400">
                      {detectedVitals.weight || latestVitals?.weight || 70.5} kg
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* MODAL FOOTER */}
        {!isSuccess && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveToVitals}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" /> Save into Vitals History
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
