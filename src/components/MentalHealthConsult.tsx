import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clipboard,
  Stethoscope,
  Pill,
  MessageCircle,
  TrendingUp,
  Activity,
  Users,
  Calendar,
  Clock,
  FileText,
  PenTool,
  BookOpen,
  Sparkles,
  Lock,
  ShieldAlert,
  Mic,
  MicOff,
  Plus,
  X,
  ChevronRight,
  RefreshCw,
  Save,
  Download,
  Share2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  AlertCircle
} from "lucide-react";

export interface MentalHealthConsultProps {
  onBackToLanding?: () => void;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

type ProviderType = "psychiatrist" | "psychologist" | "therapist" | "counselor";
type NoteType = "soap" | "dap" | "birp" | "mse";
type RiskLevel = "low" | "moderate" | "high" | "critical";

export function MentalHealthConsult({
  onBackToLanding,
  patientName = "Ananya Sharma",
  patientAge = 29,
  patientGender = "Female"
}: MentalHealthConsultProps) {
  // Provider Role Toggle
  const [providerType, setProviderType] = useState<ProviderType>("psychiatrist");
  const [activeTab, setActiveTab] = useState<"notes" | "mse" | "scales" | "treatment" | "crisis" | "scribe">("scribe");

  // Confidentiality Masking State (42 CFR Part 2)
  const [isNotesLocked, setIsNotesLocked] = useState(false);

  // Patient Risk Level State
  const [suicideRisk, setSuicideRisk] = useState<RiskLevel>("moderate");
  const [showSafetyPlanModal, setShowSafetyPlanModal] = useState(false);

  // AI Scribe State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<any>(null);
  const [transcriptInput, setTranscriptInput] = useState(
    "Patient reports persistent sadness, low energy for 3 weeks, and sudden panic episodes at work. Having trouble sleeping (waking up at 3 AM). Reports feeling overwhelmed by family expectations. Expresses passive thoughts of 'wishing I wouldn't wake up' but denies active suicidal intent or plans. Rapid speech, anxious affect, good insight."
  );
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Structured SOAP / DAP Note State
  const [noteFormat, setNoteFormat] = useState<NoteType>("soap");
  const [soapData, setSoapData] = useState({
    subjective: "Patient expresses 3-week history of low mood, insomnia, and work-related panic spikes. Denies suicidal intent.",
    objective: "Anxious, fidgeting, constricted affect, rapid speech, alert & oriented x4. PHQ-9 = 16, GAD-7 = 14.",
    assessment: "Major Depressive Disorder (Single Episode, Moderate) [F32.1], Generalized Anxiety Disorder [F41.1]. Elevated suicide risk monitor required.",
    plan: "1. Initiate Escitalopram 10mg OD (Psychiatry Rx).\n2. CBT therapy twice weekly focusing on cognitive restructuring.\n3. Safety plan established with sister listed as emergency contact."
  });

  // Mental Status Exam (MSE) State
  const [mseData, setMseData] = useState({
    appearance: "Casually dressed, neat, well-groomed",
    behavior: "Restless, fidgeting with hands, tense posture",
    speech: "Rapid rate, normal volume, coherent",
    mood: "'Exhausted and constantly anxious'",
    affect: "Anxious, constricted, mood-congruent",
    thoughtProcess: "Linear, goal-directed, no flight of ideas",
    thoughtContent: "Worries regarding performance, passive death wish, no delusions",
    perception: "No auditory or visual hallucinations reported",
    cognition: "Alert, oriented to time, place, and person. Concentration mildly impaired",
    insight: "Good (4/5) - Recognizes emotional distress needs professional care",
    judgment: "Fair (3/5) - Intact social judgment and decision-making capacity"
  });

  // Rating Scales State
  const [phq9Answers, setPhq9Answers] = useState<number[]>([2, 2, 2, 2, 1, 1, 2, 1, 1]); // Sum = 14 (Moderate)
  const [gad7Answers, setGad7Answers] = useState<number[]>([2, 3, 2, 2, 1, 2, 2]); // Sum = 14 (Moderate)
  const [showPhqModal, setShowPhqModal] = useState(false);
  const [showGadModal, setShowGadModal] = useState(false);

  // Treatment Plan Goals
  const [goals, setGoals] = useState([
    { id: 1, text: "Reduce GAD-7 anxiety score from 14 to < 7 within 8 weeks", progress: 40, status: "In Progress" },
    { id: 2, text: "Establish consistent sleep hygiene (7+ hours uninterrupted)", progress: 25, status: "In Progress" },
    { id: 3, text: "Master diaphragmatic breathing during acute panic triggers", progress: 70, status: "Near Completion" }
  ]);
  const [newGoalText, setNewGoalText] = useState("");

  // Psychiatric Prescription (Psychiatrist only)
  const [medications, setMedications] = useState([
    { name: "Escitalopram", dose: "10 mg", freq: "Once daily (Morning)", duration: "30 days", class: "SSRI" },
    { name: "Clonazepam", dose: "0.25 mg", freq: "SOS (Max twice daily)", duration: "10 days", class: "Benzodiazepine" }
  ]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDose, setNewMedDose] = useState("");

  // Calculate Scale Totals
  const phq9Total = phq9Answers.reduce((a, b) => a + b, 0);
  const gad7Total = gad7Answers.reduce((a, b) => a + b, 0);

  const getPhq9Severity = (score: number) => {
    if (score <= 4) return { label: "Minimal / Normal", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    if (score <= 9) return { label: "Mild Depression", color: "bg-blue-100 text-blue-800 border-blue-200" };
    if (score <= 14) return { label: "Moderate Depression", color: "bg-amber-100 text-amber-800 border-amber-200" };
    if (score <= 19) return { label: "Moderately Severe Depression", color: "bg-orange-100 text-orange-800 border-orange-200" };
    return { label: "Severe Depression", color: "bg-rose-100 text-rose-800 border-rose-200" };
  };

  const getGad7Severity = (score: number) => {
    if (score <= 4) return { label: "Minimal Anxiety", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    if (score <= 9) return { label: "Mild Anxiety", color: "bg-blue-100 text-blue-800 border-blue-200" };
    if (score <= 14) return { label: "Moderate Anxiety", color: "bg-amber-100 text-amber-800 border-amber-200" };
    return { label: "Severe Anxiety", color: "bg-rose-100 text-rose-800 border-rose-200" };
  };

  // AI Scribe Processing Logic
  const handleRunAIScribe = () => {
    if (!transcriptInput.trim()) return;
    setIsProcessingAI(true);
    setTimeout(() => {
      // Auto-extract structured psychiatric clinical note
      const text = transcriptInput.toLowerCase();
      let extractedRisk: RiskLevel = "low";
      if (text.includes("suicid") || text.includes("kill") || text.includes("wishing i wouldn't wake up")) {
        extractedRisk = "moderate";
      }
      if (text.includes("active plan") || text.includes("method")) {
        extractedRisk = "high";
      }

      setSuicideRisk(extractedRisk);

      setSoapData({
        subjective: `Patient reported: "${transcriptInput.slice(0, 180)}..." Expresses emotional distress and somatic fatigue.`,
        objective: `Observed speech rate & tone. Mental Status Exam updated. PHQ-9 estimated: ${phq9Total}, GAD-7 estimated: ${gad7Total}. Risk level assessed as ${extractedRisk.toUpperCase()}.`,
        assessment: `Diagnostic Impression: Primary Affective / Anxiety Spectrum Disorder. Risk Status: ${extractedRisk.toUpperCase()}.`,
        plan: `1. Follow up session scheduled in 7 days.\n2. Review rating scales weekly.\n3. Re-evaluate clinical pharmacotherapy response.`
      });

      setIsProcessingAI(false);
      setActiveTab("notes");
    }, 1200);
  };

  // Recording toggle simulation
  const toggleRecording = () => {
    if (isRecording) {
      clearInterval(recordingInterval);
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      const interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    }
  };

  const addGoal = () => {
    if (!newGoalText.trim()) return;
    setGoals([
      ...goals,
      { id: Date.now(), text: newGoalText.trim(), progress: 0, status: "Initiated" }
    ]);
    setNewGoalText("");
  };

  const addMedication = () => {
    if (!newMedName.trim()) return;
    setMedications([
      ...medications,
      {
        name: newMedName.trim(),
        dose: newMedDose.trim() || "5 mg",
        freq: "Once daily",
        duration: "30 days",
        class: "Psychotropic"
      }
    ]);
    setNewMedName("");
    setNewMedDose("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-3 sm:p-6 pb-24">
      {/* Top Header & Role Switcher */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/90 backdrop-blur border border-slate-700/80 p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition"
              >
                ← Back
              </button>
            )}
            <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-xl">
              <Brain className="h-7 w-7 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CURA Psychiatry & Psychology Suite
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  42 CFR Part 2 Secured
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Specialized Clinical EHR, MSE Builder, AI Scribe & Psychometric Analytics
              </p>
            </div>
          </div>

          {/* Provider Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Role:</span>
            {(["psychiatrist", "psychologist", "therapist", "counselor"] as ProviderType[]).map((type) => (
              <button
                key={type}
                onClick={() => setProviderType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  providerType === type
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Summary Banner */}
        <div className="bg-gradient-to-r from-purple-950/60 via-slate-800 to-slate-900 border border-purple-900/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center font-bold text-purple-300 text-lg">
              {patientName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{patientName}</h2>
                <span className="text-xs text-slate-400">
                  ({patientAge}y, {patientGender})
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                  ID: PSY-2026-8942
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Primary DX: <strong className="text-purple-300">F32.1 Major Depressive Disorder, Moderate</strong></span>
                <span className="text-slate-500">•</span>
                <span>Session #6 of 12</span>
              </p>
            </div>
          </div>

          {/* Risk Badge & Confidentiality Lock Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSafetyPlanModal(true)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                suicideRisk === "critical" || suicideRisk === "high"
                  ? "bg-rose-900/80 text-rose-200 border-rose-500 animate-pulse"
                  : suicideRisk === "moderate"
                  ? "bg-amber-900/60 text-amber-200 border-amber-600/80"
                  : "bg-emerald-900/40 text-emerald-200 border-emerald-600/50"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Risk: {suicideRisk.toUpperCase()}</span>
              <span className="underline text-[10px] ml-1">Safety Plan</span>
            </button>

            <button
              onClick={() => setIsNotesLocked(!isNotesLocked)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition ${
                isNotesLocked
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
              title="Toggle Part 2 Sensitive Psychotherapy Notes Lock"
            >
              {isNotesLocked ? <Lock className="h-3.5 w-3.5 text-amber-400" /> : <Shield className="h-3.5 w-3.5 text-emerald-400" />}
              <span>{isNotesLocked ? "Notes Masked" : "Confidential"}</span>
            </button>
          </div>
        </div>

        {/* Critical Risk Warning Alert Bar */}
        {(suicideRisk === "high" || suicideRisk === "critical" || suicideRisk === "moderate") && (
          <div className="bg-amber-950/80 border border-amber-500/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-amber-100 font-bold">Psychiatric Safety Monitor:</strong> Patient expresses passive suicidal ideation (C-SSRS Item 2 Positive).
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSafetyPlanModal(true)}
                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-400 transition"
              >
                Open Columbia C-SSRS Safety Plan
              </button>
            </div>
          </div>
        )}

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "scribe", label: "🤖 AI Mental Health Scribe", icon: Sparkles },
            { id: "notes", label: "📝 Psychotherapy Notes", icon: FileText },
            { id: "mse", label: "🧠 Mental Status Exam (MSE)", icon: Brain },
            { id: "scales", label: "📊 Psychometric Scales (PHQ-9 / GAD-7)", icon: Activity },
            { id: "treatment", label: "📋 Treatment Plan & Rx", icon: Pill },
            { id: "crisis", label: "🚨 Crisis & Safety Protocol", icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}

        {/* TAB 1: AI MENTAL HEALTH SCRIBE */}
        {activeTab === "scribe" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4 bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    AI Clinical Session Audio Scribe & Ambient Recorder
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transcribes live therapy dialogue & automatically distills SOAP notes, MSE & risk indicators.
                  </p>
                </div>

                <button
                  onClick={toggleRecording}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isRecording
                      ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/50"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  }`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isRecording ? `Recording... (${recordingSeconds}s)` : "Start Ambient Live Scribe"}
                </button>
              </div>

              {isRecording && (
                <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    <span className="text-xs text-purple-200 font-mono">
                      Streaming encryption active • Sampling 16kHz audio...
                    </span>
                  </div>
                  <span className="text-xs font-mono text-purple-400 font-bold">
                    00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Session Dialogue / Dictation Transcript Input:
                </label>
                <textarea
                  value={transcriptInput}
                  onChange={(e) => setTranscriptInput(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                  placeholder="Paste or record session notes, verbal cues, patient quotes..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 italic">
                  💡 AI trained on DSM-5-TR, ICD-10, CBT/DBT clinical frameworks.
                </span>
                <button
                  onClick={handleRunAIScribe}
                  disabled={isProcessingAI || !transcriptInput.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-purple-950 disabled:opacity-50 transition"
                >
                  {isProcessingAI ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Parsing Psychiatric Dynamics...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Synthesize SOAP Note & MSE
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scribe Capabilities Panel */}
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl space-y-3">
                <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-400" />
                  Psychiatry AI Guardrails
                </h4>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>42 CFR Part 2 Encryption:</strong> Psychotherapy notes are segmented from general medical records.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Suicide Risk Detection:</strong> Instant keyword flagging for Columbia-SSRS items.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>DSM-5 Diagnostic Coding:</strong> Automated suggestion of relevant ICD-10 / DSM codes.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-950/30 border border-purple-900/50 p-4 rounded-2xl text-xs text-purple-200">
                <div className="flex items-center gap-2 font-bold mb-1 text-purple-300">
                  <BookOpen className="h-4 w-4" />
                  Provider Scope ({providerType.toUpperCase()})
                </div>
                {providerType === "psychiatrist" ? (
                  <p>Full prescription authority (EPCS enabled), diagnostic code assignment, and medical evaluation rights.</p>
                ) : (
                  <p>Psychotherapeutic session note logging, CBT/DBT progress tracking, psychometric rating scales without drug prescription controls.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PSYCHOTHERAPY NOTES (SOAP / DAP / BIRP) */}
        {activeTab === "notes" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Clinical Progress Documentation
                </h3>
                <p className="text-xs text-slate-400">
                  Structured documentation formatted for behavioral health insurance compliance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Format:</span>
                {(["soap", "dap", "birp", "mse"] as NoteType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setNoteFormat(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                      noteFormat === f
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {isNotesLocked ? (
              <div className="p-8 bg-slate-900 border border-amber-500/30 rounded-2xl text-center space-y-3">
                <Lock className="h-10 w-10 text-amber-400 mx-auto" />
                <h4 className="text-base font-bold text-amber-200">Psychotherapy Notes Are Masked</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Per 42 CFR Part 2 and HIPAA privacy standards, sensitive process notes are protected from unauthorized view.
                </p>
                <button
                  onClick={() => setIsNotesLocked(false)}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
                >
                  Unlock Session Notes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    S - Subjective (Patient Verbal Statements & Mood)
                  </label>
                  <textarea
                    value={soapData.subjective}
                    onChange={(e) => setSoapData({ ...soapData, subjective: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    O - Objective (Behavioral Cues, MSE Summary & Scores)
                  </label>
                  <textarea
                    value={soapData.objective}
                    onChange={(e) => setSoapData({ ...soapData, objective: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    A - Assessment (Diagnostic Impression & Risk Matrix)
                  </label>
                  <textarea
                    value={soapData.assessment}
                    onChange={(e) => setSoapData({ ...soapData, assessment: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    P - Plan (Interventions, Homework & Rx)
                  </label>
                  <textarea
                    value={soapData.plan}
                    onChange={(e) => setSoapData({ ...soapData, plan: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MENTAL STATUS EXAM (MSE) */}
        {activeTab === "mse" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Structured Mental Status Exam (MSE)
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive 11-point psychiatric observation & cognitive evaluation.
                </p>
              </div>
              <button
                onClick={() =>
                  setMseData({
                    ...mseData,
                    mood: "Anxious & overwhelmed",
                    affect: "Constricted & mood-congruent"
                  })
                }
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 rounded-lg transition"
              >
                Reset to Default
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: "appearance", label: "1. Appearance & Hygiene" },
                { key: "behavior", label: "2. Behavior & Psychomotor Activity" },
                { key: "speech", label: "3. Speech (Rate, Rhythm, Tone)" },
                { key: "mood", label: "4. Mood (Subjective state)" },
                { key: "affect", label: "5. Affect (Observed expression)" },
                { key: "thoughtProcess", label: "6. Thought Process" },
                { key: "thoughtContent", label: "7. Thought Content (Ideation)" },
                { key: "perception", label: "8. Perception (Hallucinations)" },
                { key: "cognition", label: "9. Cognition & Sensorium" },
                { key: "insight", label: "10. Insight (Degree of awareness)" },
                { key: "judgment", label: "11. Judgment & Decision Capacity" }
              ].map((item) => (
                <div key={item.key} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <label className="block text-xs font-bold text-purple-300">{item.label}</label>
                  <input
                    type="text"
                    value={(mseData as any)[item.key]}
                    onChange={(e) => setMseData({ ...mseData, [item.key]: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PSYCHOMETRIC RATING SCALES (PHQ-9 & GAD-7) */}
        {activeTab === "scales" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PHQ-9 Card */}
              <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-400" />
                      PHQ-9 (Depression Scale)
                    </h3>
                    <p className="text-xs text-slate-400">Patient Health Questionnaire (0-27)</p>
                  </div>
                  <button
                    onClick={() => setShowPhqModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
                  >
                    Take Assessment
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-3xl font-black text-blue-400">{phq9Total}</div>
                  <div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getPhq9Severity(phq9Total).color}`}>
                      {getPhq9Severity(phq9Total).label}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">Score ≥ 10 warrants clinical intervention</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>Severity Progress</span>
                    <span>{phq9Total} / 27</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-blue-500 h-full transition-all duration-500"
                      style={{ width: `${(phq9Total / 27) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* GAD-7 Card */}
              <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                      GAD-7 (Anxiety Scale)
                    </h3>
                    <p className="text-xs text-slate-400">Generalized Anxiety Disorder (0-21)</p>
                  </div>
                  <button
                    onClick={() => setShowGadModal(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition"
                  >
                    Take Assessment
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-3xl font-black text-purple-400">{gad7Total}</div>
                  <div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getGad7Severity(gad7Total).color}`}>
                      {getGad7Severity(gad7Total).label}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">Score ≥ 10 indicates moderate anxiety</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span>Severity Progress</span>
                    <span>{gad7Total} / 21</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-purple-500 h-full transition-all duration-500"
                      style={{ width: `${(gad7Total / 21) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TREATMENT PLAN & RX */}
        {activeTab === "treatment" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goals & Interventions */}
            <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-purple-400" />
                Psychotherapy Goals & Interventions
              </h3>

              <div className="space-y-3">
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{goal.text}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded">
                        {goal.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-950 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 font-mono font-bold">{goal.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="Add therapeutic goal..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={addGoal}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </div>

            {/* Psychotropic Medication Prescription (Psychiatrists) */}
            <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Pill className="h-5 w-5 text-emerald-400" />
                  Psychiatric Medication Management
                </h3>
                {providerType !== "psychiatrist" && (
                  <span className="text-[10px] bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded font-mono">
                    Rx Read-Only ({providerType.toUpperCase()})
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {medications.map((med, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-300">{med.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({med.dose})</span>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{med.class}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {med.freq} • Duration: {med.duration}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>

              {providerType === "psychiatrist" && (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <span className="text-xs font-bold text-slate-300">Issue New Psychotropic Prescription</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      placeholder="Medication name (e.g. Sertraline)"
                      className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newMedDose}
                      onChange={(e) => setNewMedDose(e.target.value)}
                      placeholder="Dosage (e.g. 50mg OD)"
                      className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={addMedication}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 mt-1"
                  >
                    <Plus className="h-4 w-4" /> Sign & Issue EPCS Prescription
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: CRISIS & SAFETY PROTOCOL */}
        {activeTab === "crisis" && (
          <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-400" />
                  Crisis Management & Emergency Escalation
                </h3>
                <p className="text-xs text-slate-400">
                  Columbia-Suicide Severity Scale (C-SSRS) & Emergency Response Matrix.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Set Risk Tier:</span>
                {(["low", "moderate", "high", "critical"] as RiskLevel[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSuicideRisk(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                      suicideRisk === r
                        ? "bg-rose-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Emergency Hotlines & Designated Contacts
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 bg-slate-950 rounded-lg flex items-center justify-between">
                    <div>
                      <strong className="text-white block">Tele-MANAS National Helpline</strong>
                      <span className="text-[11px] text-slate-400">24/7 Free Mental Health Support</span>
                    </div>
                    <a href="tel:14416" className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded">
                      14416 / 1800-891-4416
                    </a>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg flex items-center justify-between">
                    <div>
                      <strong className="text-white block">Primary Family Contact</strong>
                      <span className="text-[11px] text-slate-400">Priya Sharma (Sister)</span>
                    </div>
                    <a href="tel:+919876543210" className="px-2.5 py-1 bg-slate-800 text-purple-300 font-bold rounded border border-slate-700">
                      +91 98765 43210
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Structured Safety Plan Checklist
                </h4>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>Recognize warning signs (sleep loss, racing thoughts)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>Internal coping strategies (box breathing, grounding)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>Lethal means restriction protocol verified with family</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PHQ-9 QUESTIONNAIRE */}
        <AnimatePresence>
          {showPhqModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    PHQ-9 Depression Assessment Scale
                  </h3>
                  <button onClick={() => setShowPhqModal(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Over the last 2 weeks, how often have you been bothered by any of the following problems?
                </p>

                <div className="space-y-4">
                  {[
                    "1. Little interest or pleasure in doing things",
                    "2. Feeling down, depressed, or hopeless",
                    "3. Trouble falling/staying asleep, or sleeping too much",
                    "4. Feeling tired or having little energy",
                    "5. Poor appetite or overeating",
                    "6. Feeling bad about yourself or that you are a failure",
                    "7. Trouble concentrating on things (reading/watching TV)",
                    "8. Moving or speaking slowly or being fidgety/restless",
                    "9. Thoughts that you would be better off dead, or hurting yourself"
                  ].map((q, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-slate-200">{q}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {["Not at all (0)", "Several days (1)", "More than half (2)", "Nearly every day (3)"].map(
                          (val, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                const newAns = [...phq9Answers];
                                newAns[idx] = optIdx;
                                setPhq9Answers(newAns);
                              }}
                              className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition ${
                                phq9Answers[idx] === optIdx
                                  ? "bg-blue-600 text-white border-blue-400"
                                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                              }`}
                            >
                              {val}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="text-sm font-bold text-blue-400">Total Score: {phq9Total} / 27</span>
                  <button
                    onClick={() => setShowPhqModal(false)}
                    className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500"
                  >
                    Save Score to Patient Chart
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: GAD-7 QUESTIONNAIRE */}
        <AnimatePresence>
          {showGadModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    GAD-7 Anxiety Assessment Scale
                  </h3>
                  <button onClick={() => setShowGadModal(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Over the last 2 weeks, how often have you been bothered by the following problems?
                </p>

                <div className="space-y-4">
                  {[
                    "1. Feeling nervous, anxious or on edge",
                    "2. Not being able to stop or control worrying",
                    "3. Worrying too much about different things",
                    "4. Trouble relaxing",
                    "5. Being so restless that it is hard to sit still",
                    "6. Becoming easily annoyed or irritable",
                    "7. Feeling afraid as if something awful might happen"
                  ].map((q, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-slate-200">{q}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {["Not at all (0)", "Several days (1)", "More than half (2)", "Nearly every day (3)"].map(
                          (val, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                const newAns = [...gad7Answers];
                                newAns[idx] = optIdx;
                                setGad7Answers(newAns);
                              }}
                              className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition ${
                                gad7Answers[idx] === optIdx
                                  ? "bg-purple-600 text-white border-purple-400"
                                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                              }`}
                            >
                              {val}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="text-sm font-bold text-purple-400">Total Score: {gad7Total} / 21</span>
                  <button
                    onClick={() => setShowGadModal(false)}
                    className="px-5 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-500"
                  >
                    Save Score to Patient Chart
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: SAFETY PLAN */}
        <AnimatePresence>
          {showSafetyPlanModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-rose-400" />
                    Columbia Suicide Severity Safety Plan
                  </h3>
                  <button onClick={() => setShowSafetyPlanModal(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1">
                    <strong className="text-rose-200">Step 1: Warning Signs</strong>
                    <p className="text-slate-400">Insomnia, feeling trapped, sudden withdrawal from family.</p>
                  </div>

                  <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1">
                    <strong className="text-purple-200">Step 2: Internal Coping Strategies</strong>
                    <p className="text-slate-400">10-minute progressive muscle relaxation, listened to calm playlist.</p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <strong className="text-slate-200">Step 3: Emergency Professional Contacts</strong>
                    <p className="text-slate-400">Dr. Rajesh Varma (Psychiatrist): +91-9876543210 • Tele-MANAS: 14416</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowSafetyPlanModal(false)}
                    className="px-5 py-2 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-700"
                  >
                    Close Safety Plan
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MentalHealthConsult;
