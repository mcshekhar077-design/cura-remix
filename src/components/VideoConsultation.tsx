import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Pill,
  Sparkles,
  ShieldCheck,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  X,
  Volume2,
  VolumeX,
  Zap,
  Edit3,
  FileVideo,
  ScreenShare
} from "lucide-react";
import { WebRTCProvider, useWebRTC } from "./VideoConsultation/WebRTCProvider";
import { Whiteboard } from "./VideoConsultation/Whiteboard";
import { Recorder } from "./VideoConsultation/Recorder";
import { MedicalChat, MedicalChatMessage } from "./VideoConsultation/MedicalChat";

// ============================================
// TYPES
// ============================================

export interface VitalsData {
  bp?: string;
  pulse?: number;
  spo2?: number;
  glucose?: number;
  temperature?: number;
  respiratory?: number;
}

export interface PrescriptionItem {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity?: number;
  refills?: number;
  substitute?: boolean;
}

export interface ConsultationSummary {
  consultationId: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  duration: string;
  diagnosis: string;
  prescriptionCount: number;
  prescriptionItems: PrescriptionItem[];
  transcriptSnippet: string;
  completedAt: string;
  vitals: VitalsData;
  followUpDate?: string;
  nextActions?: string[];
}

export interface VideoConsultationProps {
  consultationId?: string;
  patientName?: string;
  patientId?: string;
  doctorName?: string;
  doctorTitle?: string;
  specialty?: string;
  hospitalName?: string;
  scheduledTime?: string;
  patientVitals?: VitalsData;
  patientAllergies?: string[];
  patientConditions?: string[];
  onEndConsultation?: (summary: ConsultationSummary) => void;
  onBack?: () => void;
  isDoctorView?: boolean;
  onSendPrescription?: (items: PrescriptionItem[]) => void;
  onGenerateSummary?: () => void;
  enableRecording?: boolean;
  enableWhiteboard?: boolean;
  enableWebRTC?: boolean;
}

// ============================================
// SUB-COMPONENTS
// ============================================

const CallTimer = memo(({ duration }: { duration: number }) => {
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return (
    <span className="font-mono text-sm font-black text-emerald-400 flex items-center gap-1">
      <Clock className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
      {formatTime(duration)}
    </span>
  );
});

CallTimer.displayName = 'CallTimer';

const VideoFeed = memo(({ 
  name, 
  title, 
  isVideoOn, 
  isDoctor, 
  isPip = false,
  onSwap,
  className = ""
}: {
  name: string;
  title: string;
  isVideoOn: boolean;
  isDoctor: boolean;
  isPip?: boolean;
  onSwap?: () => void;
  className?: string;
}) => {
  return (
    <div 
      className={`relative flex flex-col items-center justify-center text-center space-y-4 ${
        isPip ? 'p-2' : 'flex-1'
      } ${className}`}
    >
      {isVideoOn ? (
        <div className="relative">
          {!isPip && (
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
          )}
          <div className={`
            rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-600 
            border-4 border-blue-400/50 flex items-center justify-center text-white shadow-2xl relative z-10
            ${isPip ? 'w-16 h-16 text-2xl' : 'w-28 h-28 md:w-36 md:h-36 text-5xl md:text-6xl'}
          `}>
            {isDoctor ? "👨‍⚕️" : "👤"}
          </div>
        </div>
      ) : (
        <div className={`
          rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-slate-600
          ${isPip ? 'w-16 h-16 text-2xl' : 'w-28 h-28 md:w-36 md:h-36 text-5xl'}
        `}>
          <VideoOff className={isPip ? 'h-8 w-8' : 'h-12 w-12'} />
        </div>
      )}

      <div className={`space-y-1 ${isPip ? 'text-xs' : ''}`}>
        <h3 className={`font-black text-white ${isPip ? 'text-xs' : 'text-lg md:text-xl'}`}>
          {name}
        </h3>
        {!isPip && (
          <>
            <p className="text-xs text-slate-400 font-medium">{title}</p>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block">
              ● Audio Stream Connected (Opus 48kHz)
            </span>
          </>
        )}
      </div>

      {onSwap && !isPip && (
        <button
          id="btn-swap-feeds"
          type="button"
          onClick={onSwap}
          className="absolute top-4 right-4 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-700 cursor-pointer backdrop-blur-md"
        >
          🔄 Swap Feeds
        </button>
      )}
    </div>
  );
});

VideoFeed.displayName = 'VideoFeed';

const ControlButton = memo(({
  icon: Icon,
  onClick,
  active,
  label,
  variant = 'default',
  id
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  active: boolean;
  label: string;
  variant?: 'default' | 'danger' | 'warning';
  id?: string;
}) => {
  const getStyles = useCallback(() => {
    if (variant === 'danger') {
      return active 
        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
        : 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800';
    }
    if (variant === 'warning') {
      return active
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800';
    }
    return active
      ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
      : 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800';
  }, [active, variant]);

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`p-3 rounded-2xl border transition-all cursor-pointer ${getStyles()}`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
});

ControlButton.displayName = 'ControlButton';

type SidePanelTabType = 'chat' | 'emr' | 'prescription' | 'ai_scribe' | 'whiteboard' | 'recorder';

const SidePanelTabs = memo(({
  activeTab,
  onTabChange,
  onClose
}: {
  activeTab: SidePanelTabType | null;
  onTabChange: (tab: SidePanelTabType) => void;
  onClose: () => void;
}) => {
  const tabs = useMemo(() => [
    { id: 'chat' as const, label: 'Live Chat', icon: MessageSquare, color: 'blue' },
    { id: 'emr' as const, label: 'Patient EMR', icon: Activity, color: 'indigo' },
    { id: 'prescription' as const, label: 'E-Prescription', icon: Pill, color: 'teal' },
    { id: 'ai_scribe' as const, label: 'AI Scribe', icon: Sparkles, color: 'purple' },
    { id: 'whiteboard' as const, label: 'Whiteboard', icon: Edit3, color: 'cyan' },
    { id: 'recorder' as const, label: 'Session REC', icon: FileVideo, color: 'rose' }
  ], []);

  return (
    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Interactive Tools:</span>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const colorMap: Record<string, string> = {
            blue: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30',
            indigo: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30',
            teal: 'bg-teal-600 text-white shadow-lg shadow-teal-600/30',
            purple: 'bg-purple-600 text-white shadow-lg shadow-purple-600/30',
            cyan: 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30',
            rose: 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
          };
          
          return (
            <button
              id={`tab-btn-${tab.id}`}
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isActive 
                  ? colorMap[tab.color]
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
              aria-label={`Open ${tab.label}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab && (
        <button
          id="btn-close-side-panel"
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close side panel"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

SidePanelTabs.displayName = 'SidePanelTabs';

// ============================================
// INNER VIDEO CONSULTATION CONTENT
// ============================================

function VideoConsultationInner({
  consultationId = "VC-2026-88910",
  patientName = "Rajesh Kumar",
  patientId = "PAT-1001",
  doctorName = "Dr. Vikram Sethi",
  doctorTitle = "Senior Consultant Cardiologist",
  specialty = "Cardiology & Hypertension",
  hospitalName = "Max Super Speciality Hospital, Saket",
  patientVitals = { bp: "134/86 mmHg", pulse: 74, spo2: 98, glucose: 112 },
  patientAllergies = ["Penicillin (Severe Anaphylaxis)", "Sulfa Antibiotics"],
  patientConditions = ["Stage 1 Essential Hypertension", "Pre-Diabetes (HbA1c 6.6%)"],
  onEndConsultation,
  onBack,
  isDoctorView = false,
  onSendPrescription,
  onGenerateSummary
}: VideoConsultationProps): React.ReactElement {
  
  const webRTC = useWebRTC();

  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [callActive, setCallActive] = useState<boolean>(true);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(285);
  const [activeSidePanel, setActiveSidePanel] = useState<SidePanelTabType | null>("chat");
  const [swappedPip, setSwappedPip] = useState<boolean>(false);
  const [isRecordingDictation, setIsRecordingDictation] = useState<boolean>(false);
  const [consultationEndedModal, setConsultationEndedModal] = useState<boolean>(false);
  const [finalConsultationSummary, setFinalConsultationSummary] = useState<ConsultationSummary | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<MedicalChatMessage[]>([
    {
      id: "msg-1",
      sender: doctorName,
      text: "Hello Rajesh ji, good afternoon! I have opened your latest blood pressure logs and ECG reports.",
      time: "04:30 PM",
      isDoctor: true,
      isRead: true
    },
    {
      id: "msg-2",
      sender: patientName,
      text: "Good afternoon Doctor. Yes, my morning BP was 134/86 mmHg. I felt mild morning headache yesterday.",
      time: "04:31 PM",
      isDoctor: false,
      isRead: true
    }
  ]);

  // Transcript State
  const [transcriptText, setTranscriptText] = useState<string>(
    "PATIENT: Good afternoon Doctor. Morning BP was 134/86 mmHg with slight tightness in back of neck.\nDOCTOR: Understood. Your pulse is steady at 74 bpm. Let's review your Lisinopril 10mg dosage and check compliance."
  );

  // Prescription State
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    {
      id: "rx-1",
      drugName: "Lisinopril 10mg",
      dosage: "1 Tablet",
      frequency: "Once Daily (Morning)",
      duration: "30 Days",
      instructions: "Take with water after breakfast. Monitor BP weekly.",
      quantity: 30,
      refills: 1,
      substitute: false
    },
    {
      id: "rx-2",
      drugName: "Metformin ER 500mg",
      dosage: "1 Tablet",
      frequency: "Twice Daily (Morning & Night)",
      duration: "30 Days",
      instructions: "Take immediately after meals to avoid GI discomfort.",
      quantity: 60,
      refills: 2,
      substitute: true
    }
  ]);
  const [newDrugName, setNewDrugName] = useState<string>("");
  const [newDrugDosage, setNewDrugDosage] = useState<string>("");
  const [newDrugFreq, setNewDrugFreq] = useState<string>("Once Daily");
  const [newDrugDuration, setNewDrugDuration] = useState<string>("30 Days");
  const [clinicalDiagnosisInput, setClinicalDiagnosisInput] = useState<string>(
    "Essential Hypertension (ICD-10 I10) - Controlled under monotherapy"
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callActive]);

  const handleSendMedicalChatMessage = useCallback((text: string, files?: File[]): void => {
    const newMsg: MedicalChatMessage = {
      id: `msg-${Date.now()}`,
      sender: isDoctorView ? doctorName : patientName,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isDoctor: isDoctorView,
      isRead: true,
      attachments: files?.map(f => ({ name: f.name, type: f.type, size: f.size }))
    };

    setChatMessages((prev) => [...prev, newMsg]);
  }, [isDoctorView, doctorName, patientName]);

  const formatSeconds = useCallback((sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleInjectDictationPreset = useCallback((presetText: string): void => {
    setIsRecordingDictation(true);
    setTimeout(() => {
      setTranscriptText((prev) => 
        prev + `\n${isDoctorView ? "DOCTOR" : "PATIENT"}: ${presetText}`
      );
      setIsRecordingDictation(false);
    }, 800);
  }, [isDoctorView]);

  const handleAddPrescriptionItem = useCallback((): void => {
    if (!newDrugName.trim()) return;
    
    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      drugName: newDrugName.trim(),
      dosage: newDrugDosage || "1 Tablet",
      frequency: newDrugFreq,
      duration: newDrugDuration,
      instructions: "Take as directed by doctor.",
      quantity: 30,
      refills: 0,
      substitute: false
    };

    setPrescriptionItems((prev) => [...prev, newItem]);
    setNewDrugName("");
    setNewDrugDosage("");
  }, [newDrugName, newDrugDosage, newDrugFreq, newDrugDuration]);

  const handleRemovePrescriptionItem = useCallback((id: string): void => {
    setPrescriptionItems((prev) => prev.filter(item => item.id !== id));
  }, []);

  const handleEndCall = useCallback((): void => {
    setCallActive(false);
    webRTC.endCall();

    const summary: ConsultationSummary = {
      consultationId,
      patientName,
      doctorName,
      specialty,
      duration: formatSeconds(callDurationSeconds),
      diagnosis: clinicalDiagnosisInput,
      prescriptionCount: prescriptionItems.length,
      prescriptionItems,
      transcriptSnippet: transcriptText,
      completedAt: new Date().toLocaleString(),
      vitals: patientVitals,
      followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      nextActions: [
        "Monitor blood pressure daily and log readings",
        "Continue current medication regimen",
        "Schedule follow-up in 30 days"
      ]
    };

    setFinalConsultationSummary(summary);
    setConsultationEndedModal(true);

    if (onEndConsultation) {
      onEndConsultation(summary);
    }

    if (onSendPrescription && prescriptionItems.length > 0) {
      onSendPrescription(prescriptionItems);
    }
  }, [
    consultationId, patientName, doctorName, specialty, 
    callDurationSeconds, clinicalDiagnosisInput, prescriptionItems,
    transcriptText, patientVitals, formatSeconds,
    onEndConsultation, onSendPrescription, webRTC
  ]);

  const handleGenerateSummary = useCallback((): void => {
    if (onGenerateSummary) {
      onGenerateSummary();
    }
  }, [onGenerateSummary]);

  const handleDownloadPrescription = useCallback((): void => {
    if (prescriptionItems.length === 0) return;

    const prescriptionText = `
========================================
MEDICAL PRESCRIPTION
========================================

Patient: ${patientName} (ID: ${patientId})
Date: ${new Date().toLocaleDateString()}
Doctor: ${doctorName} (${doctorTitle})

Diagnosis: ${clinicalDiagnosisInput}

Prescribed Medications:
${prescriptionItems.map((item, idx) => `
${idx + 1}. ${item.drugName} - ${item.dosage}
   Frequency: ${item.frequency}
   Duration: ${item.duration}
   Instructions: ${item.instructions}
`).join('\n')}

----------------------------------------
Follow-up: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
----------------------------------------

Digital Signature: ${doctorName}
`;

    const blob = new Blob([prescriptionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [prescriptionItems, patientName, patientId, doctorName, doctorTitle, clinicalDiagnosisInput]);

  const activePanelContent = useMemo(() => {
    switch (activeSidePanel) {
      case 'chat':
        return (
          <MedicalChat
            messages={chatMessages}
            onSendMessage={handleSendMedicalChatMessage}
            isDoctor={isDoctorView}
            patientName={patientName}
            doctorName={doctorName}
          />
        );

      case 'emr':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" /> 
                Patient EMR & Live Vitals
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries({
                'Blood Pressure': patientVitals.bp || 'N/A',
                'Pulse Rate': patientVitals.pulse ? `${patientVitals.pulse} bpm` : 'N/A',
                'SpO2 Oxygen': patientVitals.spo2 ? `${patientVitals.spo2}%` : 'N/A',
                'Fasting Glucose': patientVitals.glucose ? `${patientVitals.glucose} mg/dL` : 'N/A'
              }).map(([label, value], idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">{label}</span>
                  <span className="text-sm font-black text-white">{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Known Critical Allergies</span>
              <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-1">
                {patientAllergies.length > 0 ? (
                  patientAllergies.map((all, i) => (
                    <div key={i} className="text-rose-300 font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" /> {all}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400">No known allergies</div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 font-bold uppercase block pt-1">Active Chronic Conditions</span>
              <div className="space-y-1">
                {patientConditions.map((cond, i) => (
                  <div key={i} className="p-2 bg-slate-950 rounded-xl text-slate-200 border border-slate-800 font-medium">
                    • {cond}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'prescription':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Pill className="h-4 w-4 text-amber-400" /> 
                Digital E-Prescription
              </h3>
              <button
                id="btn-download-rx-pdf"
                type="button"
                onClick={handleDownloadPrescription}
                className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                aria-label="Download prescription"
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <label htmlFor="input-clinical-diag" className="text-slate-400 font-bold block">Clinical Diagnosis</label>
              <input
                id="input-clinical-diag"
                type="text"
                value={clinicalDiagnosisInput}
                onChange={(e) => setClinicalDiagnosisInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-500"
                aria-label="Clinical diagnosis"
              />
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                Prescribed Medicines ({prescriptionItems.length})
              </span>
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {prescriptionItems.map((med) => (
                  <div key={med.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5 group">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{med.drugName} ({med.dosage})</span>
                      <span className="text-[9px] text-teal-300 font-mono bg-teal-950 px-1.5 py-0.5 rounded">
                        {med.frequency}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{med.instructions}</p>
                    <button
                      type="button"
                      onClick={() => handleRemovePrescriptionItem(med.id)}
                      className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                      aria-label={`Remove ${med.drugName}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 block text-[10px] uppercase">Add New Medicine</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="input-rx-drug-name"
                  type="text"
                  placeholder="Medication name..."
                  value={newDrugName}
                  onChange={(e) => setNewDrugName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white focus:outline-none focus:border-teal-500"
                  aria-label="Medication name"
                />
                <input
                  id="input-rx-drug-dosage"
                  type="text"
                  placeholder="Dosage (e.g. 500mg)..."
                  value={newDrugDosage}
                  onChange={(e) => setNewDrugDosage(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white focus:outline-none focus:border-teal-500"
                  aria-label="Dosage"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id="select-rx-drug-freq"
                  value={newDrugFreq}
                  onChange={(e) => setNewDrugFreq(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="Once Daily">Once Daily</option>
                  <option value="Twice Daily">Twice Daily</option>
                  <option value="Thrice Daily">Thrice Daily</option>
                  <option value="As Needed (SOS)">As Needed (SOS)</option>
                </select>
                <select
                  id="select-rx-drug-duration"
                  value={newDrugDuration}
                  onChange={(e) => setNewDrugDuration(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="7 Days">7 Days</option>
                  <option value="14 Days">14 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>
              <button
                id="btn-add-rx-item"
                type="button"
                onClick={handleAddPrescriptionItem}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                aria-label="Add to prescription"
              >
                + Add to Prescription
              </button>
            </div>
          </div>
        );

      case 'ai_scribe':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" /> 
                AI Speech Clinical Dictation
              </h3>
              <button
                id="btn-generate-ai-summary"
                type="button"
                onClick={handleGenerateSummary}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                aria-label="Generate summary"
              >
                <FileText className="h-3.5 w-3.5" /> Generate Summary
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Quick Clinical Presets</span>
              <div className="space-y-1.5">
                {[
                  "Patient reports morning blood pressure 134/86 mmHg with good adherence to Lisinopril.",
                  "Advised continuing Metformin ER 500mg twice daily with meal glucose tracking.",
                  "Recommended routine blood chemistry & HbA1c panel in 30 days."
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInjectDictationPreset(preset)}
                    className="w-full text-left p-2 bg-slate-950 hover:bg-purple-950/40 border border-slate-800 rounded-xl text-slate-200 text-[11px] transition cursor-pointer disabled:opacity-50"
                    disabled={isRecordingDictation}
                    aria-label={`Insert dictation preset: ${preset}`}
                  >
                    🎤 {preset}
                  </button>
                ))}
              </div>

              <span className="text-[10px] text-slate-500 font-bold uppercase block pt-2">Live Transcript Snippet</span>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-slate-300 min-h-[140px] max-h-[220px] overflow-y-auto whitespace-pre-wrap">
                {transcriptText}
              </div>
              
              {isRecordingDictation && (
                <div className="flex items-center gap-2 text-purple-400 text-xs animate-pulse">
                  <Zap className="h-3 w-3" />
                  <span>AI transcribing clinical dictation...</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'whiteboard':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-cyan-400" /> 
                Clinical Interactive Whiteboard
              </h3>
            </div>
            <Whiteboard isShared={true} />
          </div>
        );

      case 'recorder':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FileVideo className="h-4 w-4 text-rose-400" /> 
                HIPAA-Compliant Session Recording
              </h3>
            </div>
            <Recorder stream={webRTC.localStream} maxDuration={600} />
          </div>
        );

      default:
        return null;
    }
  }, [
    activeSidePanel, chatMessages, handleSendMedicalChatMessage, isDoctorView,
    patientName, doctorName, patientVitals, patientAllergies, patientConditions,
    clinicalDiagnosisInput, prescriptionItems, newDrugName, newDrugDosage,
    newDrugFreq, newDrugDuration, transcriptText, isRecordingDictation,
    handleDownloadPrescription, handleRemovePrescriptionItem, handleAddPrescriptionItem,
    handleGenerateSummary, handleInjectDictationPreset, webRTC.localStream
  ]);

  return (
    <div id="video-consultation-container" className="bg-slate-950 text-slate-100 min-h-screen p-3 md:p-6 space-y-4 flex flex-col justify-between font-sans">
      {/* TOP COMPLIANCE & CALL HEADER BAR */}
      <div id="video-consultation-header" className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
            <Video className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> Encrypted WebRTC Teleconsult
              </span>
              <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                {consultationId}
              </span>
              {webRTC.isConnected && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  ● WebRTC Live
                </span>
              )}
            </div>
            <h2 className="text-base font-black text-white mt-0.5">
              {isDoctorView ? `Consultation with Patient: ${patientName}` : `HD Teleconsultation: ${doctorName}`}
            </h2>
            <p className="text-xs text-slate-400">
              {specialty} • {hospitalName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <div className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-2xl text-center">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Call Duration</span>
            <CallTimer duration={callDurationSeconds} />
          </div>

          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-2xl text-center hidden md:block">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Quality</span>
            <span className="text-xs font-bold text-cyan-300 capitalize">{webRTC.connectionQuality}</span>
          </div>

          {onBack && (
            <button
              id="btn-exit-teleconsult"
              type="button"
              onClick={onBack}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              aria-label="Go back"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* MAIN VIDEO WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        <div className={`${activeSidePanel ? "lg:col-span-8" : "lg:col-span-12"} space-y-4 flex flex-col justify-between transition-all duration-300`}>
          {/* MAIN VIDEO SCREEN */}
          <div className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden aspect-video w-full min-h-[380px] md:min-h-[480px] shadow-2xl flex flex-col justify-between p-4 group">
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  LIVE TELE CONSULT
                </span>
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono font-bold text-slate-300">
                  {swappedPip ? (isDoctorView ? doctorName : patientName) : (isDoctorView ? patientName : doctorName)}
                </span>
              </div>
            </div>

            {/* Main Video Feed */}
            <VideoFeed
              name={swappedPip ? (isDoctorView ? doctorName : patientName) : (isDoctorView ? patientName : doctorName)}
              title={swappedPip ? (isDoctorView ? specialty : "Linked EMR Patient") : (isDoctorView ? "Linked EMR Patient" : specialty)}
              isVideoOn={isVideoOn && webRTC.isVideoEnabled}
              isDoctor={isDoctorView}
              onSwap={() => setSwappedPip(!swappedPip)}
            />

            {/* PIP Self View */}
            <button
              id="btn-pip-view"
              type="button"
              onClick={() => setSwappedPip(!swappedPip)}
              className="absolute bottom-16 right-4 w-28 h-36 md:w-32 md:h-40 bg-slate-900/90 border-2 border-blue-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-2 text-center text-white cursor-pointer hover:scale-105 transition-all z-20 backdrop-blur-md"
              aria-label="Swap video feeds"
            >
              <VideoFeed
                name={swappedPip ? (isDoctorView ? "Patient" : "Doctor") : "You"}
                title="Self Stream HD"
                isVideoOn={isVideoOn && webRTC.isVideoEnabled}
                isDoctor={!isDoctorView}
                isPip={true}
              />
            </button>

            {/* Control Dock */}
            <div className="flex items-center justify-center gap-3 z-20 py-2 bg-slate-950/80 border border-slate-800/80 rounded-2xl backdrop-blur-md max-w-xl mx-auto px-4 w-full">
              <ControlButton
                id="btn-ctrl-audio"
                icon={isAudioOn && webRTC.isAudioEnabled ? Mic : MicOff}
                onClick={() => {
                  setIsAudioOn(!isAudioOn);
                  webRTC.toggleAudio();
                }}
                active={isAudioOn && webRTC.isAudioEnabled}
                label={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
                variant={!isAudioOn || !webRTC.isAudioEnabled ? 'danger' : 'default'}
              />

              <ControlButton
                id="btn-ctrl-video"
                icon={isVideoOn && webRTC.isVideoEnabled ? Video : VideoOff}
                onClick={() => {
                  setIsVideoOn(!isVideoOn);
                  webRTC.toggleVideo();
                }}
                active={isVideoOn && webRTC.isVideoEnabled}
                label={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
                variant={!isVideoOn || !webRTC.isVideoEnabled ? 'danger' : 'default'}
              />

              <ControlButton
                id="btn-ctrl-screenshare"
                icon={ScreenShare}
                onClick={webRTC.toggleScreenShare}
                active={webRTC.isScreenSharing}
                label={webRTC.isScreenSharing ? "Stop Screen Share" : "Share Screen"}
                variant={webRTC.isScreenSharing ? 'warning' : 'default'}
              />

              <ControlButton
                id="btn-ctrl-speaker"
                icon={isSpeakerMuted ? VolumeX : Volume2}
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                active={!isSpeakerMuted}
                label={isSpeakerMuted ? "Unmute Audio Output" : "Mute Audio Output"}
                variant={isSpeakerMuted ? 'warning' : 'default'}
              />

              <button
                id="btn-end-call"
                type="button"
                onClick={handleEndCall}
                className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-rose-600/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                aria-label="End consultation call"
              >
                <PhoneOff className="h-5 w-5" />
                <span className="hidden sm:inline">End Call</span>
              </button>
            </div>
          </div>

          <SidePanelTabs
            activeTab={activeSidePanel}
            onTabChange={setActiveSidePanel}
            onClose={() => setActiveSidePanel(null)}
          />
        </div>

        {activeSidePanel && (
          <div id="side-panel-content" className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between shadow-2xl">
            {activePanelContent}
          </div>
        )}
      </div>

      {/* END CONSULTATION MODAL */}
      {consultationEndedModal && finalConsultationSummary && (
        <div id="modal-consultation-ended" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Consultation Completed Successfully!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your teleconsultation session has ended and all EMR notes have been saved.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-left space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation ID:</span>
                <span className="text-emerald-400 font-bold">{finalConsultationSummary.consultationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="text-white">{finalConsultationSummary.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Diagnosis:</span>
                <span className="text-amber-300">{finalConsultationSummary.diagnosis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prescription Items:</span>
                <span className="text-cyan-300">{finalConsultationSummary.prescriptionCount} Medicines Prescribed</span>
              </div>
              {finalConsultationSummary.followUpDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Follow-up:</span>
                  <span className="text-emerald-300">{finalConsultationSummary.followUpDate}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              📲 Summary, E-Prescription PDF & notifications dispatched.
            </p>

            <button
              id="btn-modal-back-hub"
              type="button"
              onClick={() => {
                setConsultationEndedModal(false);
                if (onBack) onBack();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              aria-label="Return to patient hub"
            >
              Back to Patient Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VideoConsultation(props: VideoConsultationProps): React.ReactElement {
  return (
    <WebRTCProvider>
      <VideoConsultationInner {...props} />
    </WebRTCProvider>
  );
}
