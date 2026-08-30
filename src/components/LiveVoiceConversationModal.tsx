import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Square,
  Send,
  Radio,
  User,
  Bot,
  Activity,
  HeartPulse,
  Pill,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ChevronDown
} from "lucide-react";
import { useLiveVoiceConversation } from "../hooks/useLiveVoiceConversation";

interface LiveVoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientContext?: {
    allergies?: string[];
    medications?: string[];
    bloodPressure?: string;
    bloodSugar?: string;
  };
}

const AVAILABLE_VOICES = [
  { id: "Zephyr", name: "Zephyr", desc: "Warm, empathetic, and clinical (Recommended)", gender: "Female Tone" },
  { id: "Puck", name: "Puck", desc: "Energetic, clear, and reassuring", gender: "Youthful Tone" },
  { id: "Charon", name: "Charon", desc: "Deep, calm, and authoritative", gender: "Deep Male Tone" },
  { id: "Kore", name: "Kore", desc: "Soft, gentle, and mindful", gender: "Soothing Tone" },
  { id: "Fenrir", name: "Fenrir", desc: "Crisp, concise, and focused", gender: "Clear Tone" },
] as const;

const QUICK_STARTERS = [
  { text: "Can you explain my recent blood pressure readings?", icon: HeartPulse },
  { text: "Are there any side effects with Metformin?", icon: Pill },
  { text: "What are good breakfast choices for pre-diabetes?", icon: Activity },
  { text: "Guide me through a 1-minute calming breath exercise.", icon: Sparkles },
];

export default function LiveVoiceConversationModal({
  isOpen,
  onClose,
  patientName = "Patient",
  patientContext
}: LiveVoiceConversationModalProps): React.ReactElement | null {
  const [selectedVoice, setSelectedVoice] = useState<"Zephyr" | "Puck" | "Charon" | "Kore" | "Fenrir">("Zephyr");
  const [textInput, setTextInput] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [speakerMuted, setSpeakerMuted] = useState<boolean>(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const {
    state,
    isMicMuted,
    errorMessage,
    transcripts,
    userAudioLevel,
    geminiAudioLevel,
    waveformBars,
    connect,
    disconnect,
    toggleMicMute,
    sendTextMessage,
    stopAllPlayingAudio,
    clearTranscripts,
  } = useLiveVoiceConversation({
    voice: selectedVoice,
    patientName,
  });

  // Auto connect when opened
  useEffect(() => {
    if (isOpen) {
      connect();
    } else {
      disconnect();
    }
  }, [isOpen, connect, disconnect]);

  // Auto-scroll transcripts
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendTextMessage(textInput);
    setTextInput("");
  };

  const handleQuickStarter = (prompt: string) => {
    sendTextMessage(prompt);
  };

  if (!isOpen) return null;

  const isConnected = state === "ready" || state === "listening" || state === "speaking" || state === "thinking";

  return (
    <AnimatePresence>
      <div
        id="live-voice-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Real-time Voice Conversation"
      >
        <motion.div
          id="live-voice-modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="bg-slate-900 border border-slate-800/90 rounded-2xl w-full max-w-3xl h-[88vh] max-h-[740px] flex flex-col overflow-hidden shadow-2xl relative"
        >
          {/* Top Header */}
          <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <Radio className={`h-5 w-5 ${isConnected ? "animate-pulse" : ""}`} />
                </div>
                {isConnected && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                    CURA Live Voice Assistant
                  </h2>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full tracking-wider">
                    gemini-3.1-flash-live-preview
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span>Natural Spoken Medical Consultation</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Voice: {selectedVoice}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-toggle-voice-settings"
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showSettings
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
                }`}
                title="Voice Settings"
                aria-label="Voice settings"
              >
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">Voices</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              <button
                id="btn-close-live-voice"
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                aria-label="Close conversation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Voice selector dropdown banner */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-950/95 border-b border-slate-800 px-5 py-3.5 shrink-0 z-20"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Gemini Live Voice Personality
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Switching reconnects session with new timbre
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {AVAILABLE_VOICES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVoice(v.id);
                        disconnect();
                        setTimeout(() => connect(), 200);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedVoice === v.id
                          ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-md shadow-emerald-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{v.name}</span>
                        {selectedVoice === v.id && (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[9.5px] text-slate-400 mt-1 line-clamp-1">{v.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Visualizer & Activity Stage */}
          <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 border-b border-slate-800 flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                state === "speaking"
                  ? "bg-emerald-500/10"
                  : state === "thinking"
                  ? "bg-teal-500/10"
                  : isConnected
                  ? "bg-emerald-500/5"
                  : "bg-transparent"
              }`}
            />

            {/* Status Pill */}
            <div className="relative z-10 mb-4">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  state === "speaking"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                    : state === "thinking"
                    ? "bg-teal-500/20 text-teal-300 border-teal-500/40 animate-pulse"
                    : state === "listening"
                    ? isMicMuted
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : state === "connecting"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    state === "speaking"
                      ? "bg-emerald-400 animate-ping"
                      : state === "thinking"
                      ? "bg-teal-400 animate-bounce"
                      : state === "listening"
                      ? isMicMuted
                        ? "bg-amber-400"
                        : "bg-emerald-400 animate-pulse"
                      : state === "connecting"
                      ? "bg-cyan-400 animate-spin"
                      : "bg-slate-500"
                  }`}
                />
                {state === "speaking"
                  ? `CURA Speaking (${selectedVoice})...`
                  : state === "thinking"
                  ? "Gemini 3.1 Flash Reasoning..."
                  : state === "listening"
                  ? isMicMuted
                    ? "Microphone Muted"
                    : "Live Listening — Speak Naturally"
                  : state === "connecting"
                  ? "Connecting Live Session..."
                  : state === "error"
                  ? "Connection Error"
                  : "Session Disconnected"}
              </span>
            </div>

            {/* Dynamic Waveform Visualizer */}
            <div className="relative z-10 w-full max-w-md h-14 flex items-center justify-center gap-1.5 px-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm shadow-inner">
              {waveformBars.map((height, idx) => {
                const isSpeaking = state === "speaking";
                const isUserActive = !isMicMuted && userAudioLevel > 15;
                return (
                  <motion.div
                    key={idx}
                    animate={{ height: `${height}%` }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`w-1.5 rounded-full transition-colors ${
                      isSpeaking
                        ? "bg-gradient-to-t from-emerald-500 to-teal-300"
                        : isUserActive
                        ? "bg-gradient-to-t from-cyan-500 to-emerald-400"
                        : "bg-slate-700/80"
                    }`}
                    style={{ minHeight: "6px" }}
                  />
                );
              })}
            </div>

            {/* Live Audio Meters */}
            <div className="flex items-center gap-6 mt-3 text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span>Mic Level:</span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-75"
                    style={{ width: `${isMicMuted ? 0 : userAudioLevel}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span>AI Output:</span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 transition-all duration-75"
                    style={{ width: `${geminiAudioLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Live Transcript & Chat Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
            {errorMessage && (
              <div className="bg-rose-950/60 border border-rose-500/40 p-3 rounded-xl flex items-start gap-2.5 text-rose-200">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 block">
                    Session Notice
                  </span>
                  <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={connect}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {transcripts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-emerald-400 shadow-lg">
                  <Sparkles className="h-8 w-8 animate-pulse" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-sm font-bold text-white">Start speaking or tap a quick question</h3>
                  <p className="text-xs text-slate-400">
                    Ask questions about your health, lab results, medications, or diet recommendations.
                  </p>
                </div>

                {/* Quick starter chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-2">
                  {QUICK_STARTERS.map((starter, idx) => {
                    const Icon = starter.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickStarter(starter.text)}
                        className="flex items-center gap-2 p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left text-xs text-slate-300 hover:text-emerald-300 transition-all cursor-pointer group"
                      >
                        <Icon className="h-4 w-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="truncate">{starter.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              transcripts.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${item.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {item.sender === "gemini" && (
                    <div className="h-7 w-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      item.sender === "user"
                        ? "bg-emerald-600 text-slate-950 font-medium rounded-tr-sm"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75">
                      <span className="font-bold uppercase tracking-wider">
                        {item.sender === "user" ? patientName : `CURA Live (${selectedVoice})`}
                      </span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{item.text}</p>
                  </div>

                  {item.sender === "user" && (
                    <div className="h-7 w-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Bottom Controls Bar */}
          <div className="bg-slate-950 p-4 border-t border-slate-800 space-y-3 shrink-0">
            {/* Fallback Text Input & Action Row */}
            <div className="flex items-center gap-2">
              <form onSubmit={handleSendText} className="flex-1 flex gap-2">
                <input
                  id="input-live-voice-text"
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type a clinical question or speak into microphone..."
                  className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  id="btn-send-live-voice-text"
                  type="submit"
                  disabled={!textInput.trim()}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Ask</span>
                </button>
              </form>

              {/* Interrupt AI Button */}
              {state === "speaking" && (
                <button
                  id="btn-interrupt-live-voice"
                  type="button"
                  onClick={stopAllPlayingAudio}
                  className="px-3.5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 animate-pulse"
                  title="Interrupt AI Speaking"
                >
                  <Square className="h-3.5 w-3.5 fill-rose-400" />
                  <span>Interrupt</span>
                </button>
              )}

              {/* Mic Toggle Button */}
              <button
                id="btn-toggle-mic-live"
                type="button"
                onClick={toggleMicMute}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isMicMuted
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                }`}
                title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMicMuted ? <MicOff className="h-4 w-4 text-rose-400" /> : <Mic className="h-4 w-4 text-emerald-400" />}
              </button>

              {/* Disconnect/Reconnect Button */}
              <button
                id="btn-reconnect-live"
                type="button"
                onClick={isConnected ? disconnect : connect}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isConnected
                    ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black"
                }`}
                title={isConnected ? "Disconnect Call" : "Connect Call"}
              >
                <RefreshCw className={`h-4 w-4 ${state === "connecting" ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Bottom Footer Info */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Bidirectional 16kHz/24kHz PCM Audio Stream</span>
              </div>
              <div className="flex items-center gap-3">
                {transcripts.length > 0 && (
                  <button
                    type="button"
                    onClick={clearTranscripts}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Clear History
                  </button>
                )}
                <span>Echo Cancellation Active</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
