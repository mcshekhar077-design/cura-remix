import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  Award,
  Clock,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Smile,
  Pill,
  Send,
  RefreshCw,
  FlaskConical,
  X,
  Plus,
  FileCheck,
  Trash2,
  Terminal
} from "lucide-react";
import { Appointment, Patient } from "../types";

interface TelemedicineCenterProps {
  appointments: Appointment[];
  patients: Patient[];
  onUpdateAppointmentStatus: (id: string, status: string) => Promise<void>;
  fetchAppointments: () => Promise<void>;
  fetchPatients: () => Promise<void>;
  tenantConfig: any;
  fetchTenantConfig: () => Promise<void>;
}

export default function TelemedicineCenter({
  appointments,
  patients,
  onUpdateAppointmentStatus,
  fetchAppointments,
  fetchPatients,
  tenantConfig,
  fetchTenantConfig
}: TelemedicineCenterProps) {
  // Tabs: "dashboard" | "compliance" | "webhooks"
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "compliance" | "webhooks">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Webhook Simulator State
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [webhookMessageText, setWebhookMessageText] = useState("Yes, confirm my appointment.");
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [isLoadingWebhookLogs, setIsLoadingWebhookLogs] = useState(false);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [lastSentPayload, setLastSentPayload] = useState<any>(null);
  const [lastReceivedResponse, setLastReceivedResponse] = useState<any>(null);

  const fetchWebhookLogs = async () => {
    setIsLoadingWebhookLogs(true);
    try {
      const r = await fetch("/api/v1/webhook/whatsapp/logs");
      if (r.ok) {
        const d = await r.json();
        setWebhookLogs(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingWebhookLogs(false);
    }
  };

  const handleClearWebhookLogs = async () => {
    try {
      await fetch("/api/v1/webhook/whatsapp/logs", { method: "DELETE" });
      setWebhookLogs([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatchWebhook = async () => {
    if (!selectedPatientId) return;
    const pat = patients.find(p => p.id === selectedPatientId);
    if (!pat) return;

    setIsSendingWebhook(true);
    
    const mockPayload = {
      object: "whatsapp_business_account",
      entry: [{
        id: "waba_cura_101",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15555555555",
              phone_number_id: "100200300400"
            },
            contacts: [{
              profile: { name: pat.fullName },
              wa_id: pat.phone.replace(/\D/g, "")
            }],
            messages: [{
              from: pat.phone.replace(/\D/g, ""),
              id: `wamid.HBgMOTE5OTg4Nzt${Math.floor(Math.random() * 900000)}`,
              timestamp: String(Math.floor(Date.now() / 1000)),
              text: { body: webhookMessageText },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }]
    };

    setLastSentPayload(mockPayload);

    try {
      const response = await fetch("/api/v1/webhook/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockPayload)
      });

      if (response.ok) {
        const data = await response.json();
        setLastReceivedResponse(data);
        await fetchWebhookLogs();
        await fetchAppointments();
        await fetchPatients();
        await fetchTenantConfig();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingWebhook(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "webhooks") {
      fetchWebhookLogs();
    }
  }, [activeSubTab]);

  // Set default patient if not selected
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients]);

  // Live Consult Room State
  const [activeConsultApt, setActiveConsultApt] = useState<Appointment | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [customMed, setCustomMed] = useState({ drugName: "", dosage: "", frequency: "", duration: "" });
  const [consultMedications, setConsultMedications] = useState<Array<{ drugName: string; dosage: string; frequency: string; duration: string }>>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(true);
  const [doctorSignatureStamp, setDoctorSignatureStamp] = useState(true);
  const [customDiagnosis, setCustomDiagnosis] = useState("");
  const [finalizeError, setFinalizeError] = useState("");

  // Detailed Consent Management States (Indian Telemedicine Guidelines 2020)
  const [consentType, setConsentType] = useState<"implied" | "explicit">("implied");
  const [consentObtainedFrom, setConsentObtainedFrom] = useState<"patient" | "caregiver">("patient");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverRelation, setCaregiverRelation] = useState("");
  const [consentChannel, setConsentChannel] = useState<"verbal" | "sms" | "otp" | "manual">("verbal");
  const [consentTimestamp, setConsentTimestamp] = useState<string>(() => new Date().toISOString());
  const [consentId, setConsentId] = useState<string>(() => `CNS-${Math.floor(100000 + Math.random() * 900000)}`);

  // Telemedicine metrics
  const teleAppointments = appointments.filter(a => a.type === "video" || a.type === "voice");
  const videoCount = teleAppointments.filter(a => a.type === "video").length;
  const voiceCount = teleAppointments.filter(a => a.type === "voice").length;
  const completedCount = teleAppointments.filter(a => a.status === "completed").length;

  const currentPatient = activeConsultApt
    ? patients.find(p => p.id === activeConsultApt.patientId || p.patientCode === activeConsultApt.patientCode)
    : null;

  // Real-time compliance inspector
  const checkCompliance = (apt: Appointment, meds: any[]) => {
    const issues: string[] = [];
    const isFirstTime = !currentPatient || !currentPatient.history || currentPatient.history.length === 0;

    // Rule 1: First-time consultations MUST use video
    if (isFirstTime && apt.type !== "video") {
      issues.push("Section 3.7.1 Mandate: First-time consultations must be conducted via Video Consultation to verify patient identity.");
    }

    // Drug List Categorization & Rules
    // List O: Safe OTC drugs (e.g., paracetamol, antacids, vitamins, ORS)
    // List A: Video mandatory for first-time consults (Antibiotics, Antihypertensives, Antidiabetics)
    const listADrugs = ["amoxicillin", "amlodipine", "metformin", "azithromycin", "omeprazole", "atorvastatin", "losartan", "ciprofloxacin", "budesonide"];
    
    // List B: Follow-up refills or Video mandatory (Sildenafil, Fluoxetine, Cetirizine, Montelukast)
    const listBDrugs = ["sildenafil", "fluoxetine", "cetirizine", "montelukast", "paroxetine", "sertraline"];
    
    // Prohibited List: Schedule X / Narcotics (Lorazepam, Diazepam, Alprazolam, Clonazepam, Tramadol, Morphine, Ketamine)
    const prohibitedDrugs = ["lorazepam", "diazepam", "alprazolam", "clonazepam", "tramadol", "morphine", "ketamine", "zolpidem"];

    meds.forEach(m => {
      const nameLower = m.drugName.toLowerCase();
      
      // Prohibited check (Always banned via telemedicine)
      const isProhibited = prohibitedDrugs.some(p => nameLower.includes(p));
      if (isProhibited) {
        issues.push(`CRITICAL BLOCKED DRUG: "${m.drugName}" is on the Schedule X/Narcotics PROHIBITED list. It is strictly prohibited to prescribe via Telemedicine.`);
      }

      // List A check (Video mandatory for first-time consults)
      const isListA = listADrugs.some(a => nameLower.includes(a));
      if (isListA && isFirstTime && apt.type !== "video") {
        issues.push(`VIDEO MANDATORY: "${m.drugName}" belongs to List A. Prescribing List A for the first time requires a Video Consultation.`);
      }

      // List B check (Only follow-up or video)
      const isListB = listBDrugs.some(b => nameLower.includes(b));
      if (isListB && isFirstTime && apt.type !== "video") {
        issues.push(`VIDEO/FOLLOW-UP REQUIRED: "${m.drugName}" belongs to List B. It cannot be prescribed to first-time patients over non-video consultations.`);
      }
    });

    // Rule 3: Digital signature & explicit patient consent
    if (!hasConsented) {
      issues.push("Consent Required: Patient/Caregiver consent must be verified and logged before generating the prescription.");
    }
    if (!doctorSignatureStamp) {
      issues.push("Signature Stamp Required: RMP's digital registration credentials must be locked to authorize Rx.");
    }

    return {
      isCompliant: issues.length === 0,
      issues
    };
  };

  const activeCompliance = activeConsultApt ? checkCompliance(activeConsultApt, consultMedications) : { isCompliant: true, issues: [] };

  // Preset Dialogues to simulate Doctor Voice recording
  const clinicalDialoguePresets = [
    {
      label: "Cough & Congestion",
      dialogue: "Patient is experiencing mild bronchial congestion, chest tightness, and a dry throat. Recommended steam inhalation, warm fluids, and safe symptomatic relief. Standard Amoxicillin 500mg as well as Levocetirizine for allergic rhinitis.",
      suggestions: {
        diagnoses: ["Acute Bronchitis", "Allergic Cough"],
        tests: ["Chest X-Ray PA View", "Complete Blood Count (CBC)"],
        meds: [
          { drugName: "Amoxicillin 500mg", dosage: "1 Tab", frequency: "Thrice daily (after meals)", duration: "5 days" },
          { drugName: "Levocetirizine 5mg", dosage: "1 Tab", frequency: "Once daily (before bed)", duration: "7 days" }
        ]
      }
    },
    {
      label: "Hypertension Review",
      dialogue: "Blood pressure is sitting elevated at 145 over 92 today. Compliance on previous dosage was adequate but needs minor adjustment. Safe titration required alongside low-sodium diet and daily cardio logging. Adding Amlodipine.",
      suggestions: {
        diagnoses: ["Essential Stage-1 Hypertension", "Borderline Hyperlipidemia"],
        tests: ["Kidney Function Test (KFT)", "Lipid Profile Fasting", "Serum Electrolytes"],
        meds: [
          { drugName: "Amlodipine 5mg", dosage: "1 Tab", frequency: "Once daily (morning)", duration: "30 days" },
          { drugName: "Atorvastatin 10mg", dosage: "1 Tab", frequency: "Once daily (at night)", duration: "30 days" }
        ]
      }
    },
    {
      label: "Severe Hyperacidity",
      dialogue: "Experiencing retrosternal heartburn and bloating, mostly triggered by heavy evening meals. Stool cycle is stable. Suggesting Proton-pump inhibitors and active gastrokinetic syrup.",
      suggestions: {
        diagnoses: ["Gastroesophageal Reflux Disease (GERD)", "Mild Dyspepsia"],
        tests: ["USG Abdomen & Pelvis", "H. Pylori Serology"],
        meds: [
          { drugName: "Pantoprazole 40mg", dosage: "1 Tab", frequency: "Once daily (empty stomach)", duration: "14 days" },
          { drugName: "Domperidone 10mg", dosage: "1 Tab", frequency: "Twice daily (before meals)", duration: "10 days" }
        ]
      }
    }
  ];

  const handleSimulateRecording = (preset: typeof clinicalDialoguePresets[0]) => {
    setIsRecording(true);
    setTranscript("");
    
    let chars = 0;
    const interval = setInterval(() => {
      chars += 8;
      setTranscript(preset.dialogue.substring(0, chars));
      if (chars >= preset.dialogue.length) {
        clearInterval(interval);
        setIsRecording(false);
        // Process AI suggestion
        setIsGeneratingAi(true);
        setTimeout(() => {
          setAiSuggestions(preset.suggestions);
          setConsultMedications(preset.suggestions.meds);
          if (preset.suggestions.diagnoses.length > 0) {
            setCustomDiagnosis(preset.suggestions.diagnoses[0]);
          }
          setIsGeneratingAi(false);
        }, 1200);
      }
    }, 40);
  };

  const handleAddMedication = () => {
    if (!customMed.drugName.trim()) return;
    setConsultMedications(prev => [...prev, { ...customMed }]);
    setCustomMed({ drugName: "", dosage: "", frequency: "", duration: "" });
  };

  const handleFinalizeTeleconsult = async () => {
    if (!activeConsultApt || !currentPatient) return;
    if (!activeCompliance.isCompliant) {
      setFinalizeError("Cannot finalize: Please address the outstanding compliance warnings before digital signing.");
      return;
    }

    setFinalizeError("");

    try {
      const finalDiagnosis = customDiagnosis || "Tele-Consultation Diagnosis";
      
      const consentMeta = {
        consentId,
        type: consentType,
        obtainedFrom: consentObtainedFrom,
        caregiverName: consentObtainedFrom === "caregiver" ? caregiverName : "",
        caregiverRelation: consentObtainedFrom === "caregiver" ? caregiverRelation : "",
        channel: consentChannel,
        timestamp: consentTimestamp
      };

      // Save EMR History
      const response = await fetch(`/api/v1/patients/${currentPatient.id}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: finalDiagnosis,
          symptoms: transcript || "Telehealth consultation notes.",
          prescriptions: consultMedications.map(m => `${m.drugName} (${m.dosage}, ${m.frequency}, ${m.duration})`),
          consent: consentMeta
        })
      });

      if (response.ok) {
        // Complete the appointment
        await onUpdateAppointmentStatus(activeConsultApt.id, "completed");

        // Format WhatsApp Prescription text
        const medsListText = consultMedications.map(
          (m, idx) => `\n${idx+1}. *${m.drugName}* - ${m.dosage} [${m.frequency}] for ${m.duration}`
        ).join("");

        const consentSummaryText = consentType === "implied" 
          ? `Consent Ref: ${consentId} (Implied - Patient Initiated at ${new Date(consentTimestamp).toLocaleTimeString()})`
          : `Consent Ref: ${consentId} (Explicit - Caregiver ${caregiverName} [${caregiverRelation}] at ${new Date(consentTimestamp).toLocaleTimeString()})`;

        const waText = `*Digital Telehealth Prescription - ${tenantConfig?.branding?.clinicName || "CURA healthcare"}*\n\n*Patient:* ${currentPatient.fullName}\n*Consultation:* ${activeConsultApt.type.toUpperCase()}\n*Diagnosis:* ${finalDiagnosis}\n*Rx Medications:*${medsListText}\n\n*Consent Record:*\n${consentSummaryText}\n\n*Digital Signature Verified:* Approved & stamped by RMP ${activeConsultApt.doctorName}\n\n📄 _Download Official PDF Receipt: https://rx.cura.in/d/9F2A90_`;

        // Send WhatsApp
        await fetch("/api/v1/tenant/whatsapp-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: currentPatient.phone,
            message: waText
          })
        });

        setWhatsappSent(waText);
        await fetchAppointments();
        await fetchPatients();
        await fetchTenantConfig();
      }
    } catch (e) {
      console.error(e);
      setFinalizeError("Failed to finalize teleconsultation. Server communication issue.");
    }
  };

  const handleCloseCall = () => {
    setActiveConsultApt(null);
    setTranscript("");
    setConsultMedications([]);
    setAiSuggestions(null);
    setWhatsappSent(null);
    setCustomDiagnosis("");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span>📹 Centralized Telemedicine & Compliance Terminal</span>
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            Indian Telemedicine practice guidelines (2020) Audit, WebRTC Room control, and AI Voice-to-Prescription Writer
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Consent Server Active</span>
          </div>
        </div>
      </div>

      {/* SUB-TAB NAVIGATOR */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`py-3 px-6 text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "dashboard"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Telehealth Practice Room</span>
        </button>
        <button
          onClick={() => setActiveSubTab("compliance")}
          className={`py-3 px-6 text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "compliance"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>India Compliance Inspector</span>
          <span className="bg-indigo-100 text-indigo-800 text-[9px] px-2 py-0.5 rounded-full font-bold">DPDP Act</span>
        </button>
        <button
          onClick={() => setActiveSubTab("webhooks")}
          className={`py-3 px-6 text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === "webhooks"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Send className="h-4 w-4" />
          <span>WhatsApp Webhook Router</span>
          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold">Live API</span>
        </button>
      </div>

      {activeSubTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: METRICS & QUEUE LIST */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ANALYTICS CARD */}
            <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">Telemedicine Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <span className="block text-2xl font-black">{videoCount + voiceCount}</span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wide">Total Consults</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <span className="block text-2xl font-black text-emerald-400">{completedCount}</span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wide">Completed</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <span className="block text-sm font-black text-indigo-200">14.2 Mins</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Avg Duration</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <span className="block text-sm font-black text-indigo-200">96.8%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Compliance Score</span>
                </div>
              </div>

              {/* Adoption SVG Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-300">
                  <span>Video Adoption</span>
                  <span>{Math.round((videoCount / (videoCount + voiceCount || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(videoCount / (videoCount + voiceCount || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* QUEUE LIST */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5 text-indigo-500" /> Virtual Waiting Room
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {teleAppointments.filter(a => a.status !== "completed").length} Waiting
                </span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {teleAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 font-semibold">No virtual appointments booked for today.</p>
                ) : (
                  teleAppointments.map((apt) => {
                    const isCompleted = apt.status === "completed";
                    return (
                      <div 
                        key={apt.id} 
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                          activeConsultApt?.id === apt.id
                            ? "bg-indigo-50/50 border-indigo-200"
                            : isCompleted 
                              ? "bg-slate-50/40 border-slate-100 opacity-70"
                              : "bg-white border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-black text-slate-800">{apt.patientName}</h4>
                            <div className="flex gap-2 items-center mt-1">
                              <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {apt.patientCode}
                              </span>
                              <span className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                apt.type === "video" 
                                  ? "bg-indigo-100 text-indigo-700" 
                                  : "bg-sky-100 text-sky-700"
                              }`}>
                                {apt.type === "video" ? "📹 Video Call" : "📞 Voice Call"}
                              </span>
                            </div>
                          </div>
                          
                          <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800 animate-pulse"
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        
                        <p className="text-[10.5px] font-medium text-slate-500 italic">"Reason: {apt.reason}"</p>

                        {!isCompleted && (
                          <button
                            onClick={() => {
                              setActiveConsultApt(apt);
                              setTranscript("");
                              setConsultMedications([]);
                              setAiSuggestions(null);
                              setWhatsappSent(null);
                              setCustomDiagnosis("");
                            }}
                            className="w-full mt-1.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10.5px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <Video className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Connect Telehealth Link</span>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* RIGHT: VIRTUAL CALL SCREEN & CLINICAL WORKSPACE */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeConsultApt ? (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                  
                  {/* VIDEO PANEL (Left of workspace) */}
                  <div className="md:col-span-7 space-y-6">
                    
                    {/* WebRTC Video Screen Simulation */}
                    <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video w-full border border-slate-850 shadow-2xl flex flex-col justify-between p-4 min-h-[320px]">
                      
                      {/* Top status bar */}
                      <div className="flex justify-between items-center z-10">
                        <span className="text-[9px] font-bold bg-black/60 text-white px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/5 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Secure Agora Tele-Channel • HD Active
                        </span>
                        
                        <span className="text-[10px] font-mono font-bold text-slate-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-md">
                          08:42
                        </span>
                      </div>

                      {/* Main Center Area: Patient Avatar Mock */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                        {isVideoOn ? (
                          <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping"></div>
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-900 border-2 border-indigo-400 flex items-center justify-center text-3xl shadow-2xl relative z-10">
                              👤
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-3xl">
                            <VideoOff className="h-8 w-8" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-black text-white">{activeConsultApt.patientName}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient (Linked via ABHA)</p>
                        </div>
                      </div>

                      {/* Self View (Doctor PIP) */}
                      <div className="absolute bottom-4 right-4 w-20 h-28 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-2 text-center text-white/90">
                        <span className="text-xl">👨‍⚕️</span>
                        <span className="text-[8px] font-black uppercase text-slate-400 mt-1">You</span>
                        <span className="text-[7px] text-emerald-400 mt-0.5 font-bold">On-air</span>
                      </div>

                      {/* Video Controls overlay */}
                      <div className="flex justify-center items-center gap-4 z-10 py-1">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isMuted 
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
                              : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                          }`}
                          title={isMuted ? "Unmute Mic" : "Mute Mic"}
                        >
                          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </button>
                        
                        <button
                          onClick={handleCloseCall}
                          className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center"
                          title="End Consultation Call"
                        >
                          <PhoneOff className="h-4.5 w-4.5" />
                        </button>

                        <button
                          onClick={() => setIsVideoOn(!isVideoOn)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            !isVideoOn 
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
                              : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                          }`}
                          title={isVideoOn ? "Turn Video Off" : "Turn Video On"}
                        >
                          {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </button>
                      </div>

                    </div>

                    {/* AI SPEECH DICTATION PRESETS */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                          <Mic className="h-4 w-4 text-rose-500 animate-pulse" /> Live Voice Dictation Presets
                        </h4>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black uppercase">
                          Simulate Voice EMR
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {clinicalDialoguePresets.map((preset, index) => (
                          <button
                            key={index}
                            onClick={() => handleSimulateRecording(preset)}
                            disabled={isRecording}
                            className="text-[11px] font-black bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 p-2.5 rounded-xl border border-slate-200 transition-all text-left text-slate-600 flex flex-col justify-between gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <span>🎤 {preset.label}</span>
                            <span className="text-[8px] text-slate-400 font-medium line-clamp-1">{preset.dialogue}</span>
                          </button>
                        ))}
                      </div>

                      {/* LIVE SUMMARY / TRANSCRIPT */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Speech-to-Text Clinical Transcription
                        </label>
                        <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl min-h-[100px] max-h-[140px] overflow-y-auto text-xs font-mono font-semibold relative border border-slate-800">
                          {transcript ? (
                            <p className="leading-relaxed whitespace-pre-wrap">{transcript}</p>
                          ) : (
                            <p className="text-slate-500 italic">Click a voice dictation preset above to simulate speaking with the patient in real time...</p>
                          )}
                          {isRecording && (
                            <span className="absolute bottom-2 right-2 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* COMPLIANCE CHECKLIST FOR ACTIVE CALL */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Shield className="h-4.5 w-4.5 text-emerald-500" /> Active Call Regulatory Compliance Check
                        </h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          activeCompliance.isCompliant ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {activeCompliance.isCompliant ? "Compliant" : "Action Required"}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2.5 text-xs">
                          {(!currentPatient || currentPatient.history?.length === 0) && activeConsultApt.type !== "video" ? (
                            <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                          ) : (
                            <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                          )}
                          <div>
                            <p className="font-extrabold text-slate-800">Consultation Mode Compliance</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              First-time consultations MUST use High-Definition Video as per Guideline 3.7.1.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-xs">
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                          <div>
                            <p className="font-extrabold text-slate-800">Drug List Regulatory Restriction Check</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Restricted substances & Schedule X (List B) drugs are locked in non-video cycles.
                            </p>
                          </div>
                        </div>

                        {/* INTERACTIVE CONSENT MANAGEMENT PANEL */}
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3.5">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider block">⚖️ Legal Telehealth Consent Node</span>
                              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Capturing verified consent context for statutory compliance</span>
                            </div>
                            <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded uppercase ${
                              hasConsented ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {hasConsented ? "Verified ✓" : "Required ⚠"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <label className="block text-[8px] font-extrabold text-slate-400 uppercase mb-1">Consent Mode</label>
                              <select
                                value={consentType}
                                onChange={(e) => {
                                  const val = e.target.value as "implied" | "explicit";
                                  setConsentType(val);
                                  if (val === "implied") {
                                    setConsentObtainedFrom("patient");
                                  } else {
                                    setConsentObtainedFrom("caregiver");
                                  }
                                  setConsentTimestamp(new Date().toISOString());
                                }}
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-750 focus:outline-none"
                              >
                                <option value="implied">Implied (Patient-Initiated)</option>
                                <option value="explicit">Explicit (Caregiver-Initiated)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[8px] font-extrabold text-slate-400 uppercase mb-1">Obtained From</label>
                              <select
                                value={consentObtainedFrom}
                                onChange={(e) => {
                                  setConsentObtainedFrom(e.target.value as "patient" | "caregiver");
                                  setConsentTimestamp(new Date().toISOString());
                                }}
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-750 focus:outline-none"
                              >
                                <option value="patient">Patient Directly</option>
                                <option value="caregiver">Caregiver/Guardian</option>
                              </select>
                            </div>
                          </div>

                          {consentObtainedFrom === "caregiver" && (
                            <div className="grid grid-cols-2 gap-2 text-[10px] bg-white p-2.5 rounded-xl border border-slate-150 animate-fadeIn">
                              <div>
                                <label className="block text-[8px] font-extrabold text-slate-400 uppercase mb-1">Caregiver Name</label>
                                <input
                                  type="text"
                                  value={caregiverName}
                                  onChange={(e) => setCaregiverName(e.target.value)}
                                  placeholder="e.g. Amit Patel"
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-bold text-slate-800 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-extrabold text-slate-400 uppercase mb-1">Relationship</label>
                                <input
                                  type="text"
                                  value={caregiverRelation}
                                  onChange={(e) => setCaregiverRelation(e.target.value)}
                                  placeholder="e.g. Son / Mother"
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-bold text-slate-800 focus:outline-none"
                                />
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <label className="block text-[8px] font-extrabold text-slate-400 uppercase mb-1">Consent Method</label>
                              <select
                                value={consentChannel}
                                onChange={(e) => setConsentChannel(e.target.value as any)}
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-750 focus:outline-none"
                              >
                                <option value="verbal">Verbal (Over Video/Voice)</option>
                                <option value="sms">SMS Opt-In Link</option>
                                <option value="otp">Aadhaar / ABHA OTP Match</option>
                                <option value="manual">Manual Document Signed</option>
                              </select>
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setHasConsented(!hasConsented);
                                }}
                                className={`w-full py-2 px-2 rounded-lg font-black text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  hasConsented 
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                                    : "bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100"
                                }`}
                              >
                                {hasConsented ? "✓ Consent Locked" : "⚠️ Consent Missing"}
                              </button>
                            </div>
                          </div>

                          <div className="bg-white px-3 py-2 rounded-xl border border-slate-150 font-mono text-[9px] text-slate-500 space-y-1">
                            <div className="flex justify-between items-center text-slate-400 font-sans font-bold uppercase text-[8px] tracking-wider">
                              <span>Digital Consent Ticket</span>
                              <span className="text-emerald-600">Locked ✓</span>
                            </div>
                            <p className="font-sans font-semibold text-slate-600 leading-normal">
                              {consentType === "implied" 
                                ? `The patient directly initiated this consultation via secure digital endpoint, implying clinical consent under Section 3.4.1 of the Indian Telemedicine Guidelines.` 
                                : `Caregiver "${caregiverName || "Name Required"}" (${caregiverRelation || "Relation Required"}) verified identity and explicit consent for this telehealth consult under Section 3.4.2.`}
                            </p>
                            <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1 font-mono text-[8px]">
                              <div>Ref ID: <span className="font-bold text-slate-700">{consentId}</span></div>
                              <div className="text-right">Time: <span className="font-bold text-indigo-600">{new Date(consentTimestamp).toLocaleTimeString()}</span></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-xs">
                          <button 
                            type="button"
                            onClick={() => setDoctorSignatureStamp(!doctorSignatureStamp)}
                            className="focus:outline-none"
                          >
                            {doctorSignatureStamp ? (
                              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="h-4.5 w-4.5 rounded-full border-2 border-slate-300 hover:border-indigo-500 shrink-0" />
                            )}
                          </button>
                          <div>
                            <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                              Secure Registration Stamp Applied
                              <span className="text-[8px] bg-slate-100 px-1 rounded text-slate-500 font-bold uppercase">Toggle Sign</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Doctor's Medical Registration Credentials digitally stamped onto the generated Rx file.
                            </p>
                          </div>
                        </div>

                        {/* COMPLIANCE WARNING ALERTS */}
                        {activeCompliance.issues.length > 0 && (
                          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2 mt-2">
                            <h5 className="text-xs font-black text-rose-800 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" /> ⚠️ Telemedicine Regulation Infractions Detected:
                            </h5>
                            <ul className="list-disc pl-4 space-y-1">
                              {activeCompliance.issues.map((issue, idx) => (
                                <li key={idx} className="text-[10px] text-rose-700 font-semibold leading-relaxed">{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                      </div>
                    </div>

                  </div>

                  {/* CLINICAL WORKSPACE & Rx MAKER (Right of video) */}
                  <div className="md:col-span-5 space-y-6">
                    
                    {/* PATIENT PROFILE HIGHLIGHT */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-white text-lg font-black shadow-md">
                          {activeConsultApt.patientName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm leading-none">{activeConsultApt.patientName}</h4>
                          <span className="text-[9.5px] font-mono text-slate-400 mt-1 block">CODE: {activeConsultApt.patientCode}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10.5px] border-t border-slate-50 pt-3 text-slate-500 font-semibold">
                        <div>Age / Gender: <span className="text-slate-800 font-bold">{currentPatient?.age || "35"} • {currentPatient?.gender || "Male"}</span></div>
                        <div>Blood Group: <span className="text-slate-800 font-bold">{currentPatient?.bloodGroup || "O+"}</span></div>
                        <div className="col-span-2">Allergies: <span className="text-rose-600 font-black">{currentPatient?.allergies?.join(", ") || "No recorded active allergies"}</span></div>
                      </div>
                    </div>

                    {/* AI DIAGNOSES SUGGESTIONS PANEL */}
                    {isGeneratingAi && (
                      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center py-10 space-y-2">
                        <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
                        <span className="text-xs font-black text-slate-700 animate-pulse">Gemini analyzing voice transcripts...</span>
                      </div>
                    )}

                    <AnimatePresence>
                      {aiSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-indigo-50/50 border-2 border-indigo-200 rounded-3xl p-5 space-y-4 shadow-lg"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Clinical Decision Support Tool (AI-CDSS)
                            </span>
                            <span className="text-[8px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded uppercase">Decision Support Only</span>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3 text-[10px] leading-relaxed font-semibold">
                            <span className="font-extrabold block text-amber-950 mb-0.5">⚠️ STATUTORY COMPLIANCE REMINDER</span>
                            As per Section 2.4 of the Telemedicine Guidelines, this AI module acts strictly as a **clinical decision-support tool for the RMP**. It must never counsel, prescribe, or offer treatment options to patients directly. The RMP bears sole clinical responsibility for reviewing, modifying, and finalizing all suggestions.
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Likely Diagnoses Suggestion</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {aiSuggestions.diagnoses.map((d: string) => (
                                  <span key={d} className="text-[10.5px] bg-slate-900 text-white font-extrabold px-2.5 py-1 rounded-full">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recommended Clinical Tests</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {aiSuggestions.tests.map((t: string) => (
                                  <span key={t} className="text-[10px] bg-indigo-100/80 text-indigo-800 border border-indigo-200 font-black px-2.5 py-1 rounded-lg">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* DIGITALLY WRITTEN Rx MEDICATIONS */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill className="h-4.5 w-4.5 text-indigo-500" /> Digital Prescription Writer
                        </h4>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black uppercase">
                          {consultMedications.length} items
                        </span>
                      </div>

                      {/* DIAGNOSIS FIELD */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Consultation Diagnosis</label>
                        <input
                          type="text"
                          value={customDiagnosis}
                          onChange={(e) => setCustomDiagnosis(e.target.value)}
                          placeholder="e.g. Acute Allergic Bronchitis"
                          className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                        />
                      </div>

                      {/* RENDER DRAFT LIST */}
                      <div className="space-y-2">
                        {consultMedications.map((med, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-150 relative flex justify-between items-center">
                            <div>
                              <p className="text-xs font-black text-slate-800 flex items-center gap-1">
                                💊 {med.drugName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                {med.dosage} • {med.frequency} for {med.duration}
                              </p>
                            </div>
                            <button
                              onClick={() => setConsultMedications(prev => prev.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded-full hover:bg-slate-200 transition-all cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* MANUAL Rx ADDITION */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Drug name (e.g. Paracetamol 500mg)"
                            value={customMed.drugName}
                            onChange={(e) => setCustomMed(prev => ({ ...prev, drugName: e.target.value }))}
                            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Dosage (e.g. 1 Tab)"
                            value={customMed.dosage}
                            onChange={(e) => setCustomMed(prev => ({ ...prev, dosage: e.target.value }))}
                            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Duration (e.g. 5 Days)"
                            value={customMed.duration}
                            onChange={(e) => setCustomMed(prev => ({ ...prev, duration: e.target.value }))}
                            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Frequency (e.g. Thrice Daily after meals)"
                            value={customMed.frequency}
                            onChange={(e) => setCustomMed(prev => ({ ...prev, frequency: e.target.value }))}
                            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={handleAddMedication}
                          className="col-span-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Drug Item
                        </button>
                      </div>

                      {/* COMPLIANCE WARNINGS OR FINALIZATION ERROR */}
                      {(!activeCompliance.isCompliant || finalizeError) && (
                        <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl text-[10.5px] leading-relaxed text-rose-700 font-bold space-y-1.5 animate-fadeIn">
                          <span className="block text-rose-800 uppercase tracking-wider font-extrabold text-[9px]">⚠️ COMPLIANCE BLOCKER DETECTED</span>
                          <ul className="list-disc pl-3 space-y-0.5 font-semibold text-rose-650">
                            {!activeCompliance.isCompliant && activeCompliance.issues.map((iss, i) => (
                              <li key={i}>{iss}</li>
                            ))}
                            {finalizeError && <li>{finalizeError}</li>}
                          </ul>
                          {/* Upgrade to Video Option if applicable */}
                          {activeCompliance.issues.some(iss => iss.includes("VIDEO") || iss.includes("Video") || iss.includes("List A") || iss.includes("List B")) && activeConsultApt.type !== "video" && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/v1/appointments/${activeConsultApt.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ type: "video" })
                                  });
                                  if (res.ok) {
                                    await fetchAppointments();
                                    // Also update local object reference
                                    activeConsultApt.type = "video";
                                    setFinalizeError("");
                                  }
                                } catch (err) {
                                  console.error("Failed to upgrade appointment to video", err);
                                }
                              }}
                              className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all shadow"
                            >
                              📹 Instantly Upgrade Consultation to Video Call
                            </button>
                          )}
                        </div>
                      )}

                      {/* FINALIZE VISIT Rx BUTTON */}
                      <button
                        onClick={handleFinalizeTeleconsult}
                        disabled={consultMedications.length === 0}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FileCheck className="h-4.5 w-4.5" />
                        <span>Sign & WhatsApp Prescribe Instantly</span>
                      </button>

                    </div>

                    {/* SUCCESS WHATSAPP MODAL EMULATION */}
                    <AnimatePresence>
                      {whatsappSent && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 space-y-3.5"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Rx Transmitted
                            </span>
                            <button onClick={() => setWhatsappSent(null)} className="text-slate-400 hover:text-slate-600">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <p className="text-[11px] font-mono font-medium text-slate-700 bg-white p-3.5 rounded-2xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                            {whatsappSent}
                          </p>

                          <div className="flex justify-end gap-2 text-[10.5px] font-bold">
                            <button
                              onClick={handleCloseCall}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
                            >
                              Done & End Session
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center py-20 max-w-2xl mx-auto space-y-4">
                  <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl shadow-sm">
                    📹
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Tele-Medicine Virtual Room Inactive</h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Choose a patient from the virtual waiting room list on the left to start consulting!</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-[11px] text-slate-500 font-medium max-w-md">
                    💡 <strong className="text-slate-700">How it works:</strong> Clicking &quot;Connect Telehealth Link&quot; spins up an encrypted video stream, unlocks the AI speech dictation assistant, and executes real-time Indian Telemedicine Guideline compliance checks!
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

      {activeSubTab === "compliance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT: COMPLIANCE HANDBOOK */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="h-5 w-5 text-indigo-500" /> Telemedicine Practice Guidelines Handbook (India)
            </h3>

            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <div className="space-y-1 border-l-2 border-indigo-400 pl-3.5">
                <h4 className="font-extrabold text-slate-800 text-[12px]">Section 3.7.1: Patient Identification & Registration Validation</h4>
                <p>The practitioner must verify the identity of the patient (via standard registration or ABHA digital ID credentials) before starting. Explicit patient consent is mandatory for telehealth.</p>
              </div>

              <div className="space-y-1 border-l-2 border-indigo-400 pl-3.5">
                <h4 className="font-extrabold text-slate-800 text-[12px]">Section 3.7.2: Drug Classification restrictions</h4>
                <p>Medications are categorized into Lists to prevent prescription drug abuse over tele-consults:</p>
                <ul className="list-disc pl-4 space-y-1 mt-1 font-semibold text-slate-500">
                  <li><strong className="text-slate-700">List O (Over the Counter):</strong> Can be prescribed on any mode (Audio, Video, Chat). e.g., Oral rehydration salts, Antiseptics.</li>
                  <li><strong className="text-slate-700">List A (First line / Chronic):</strong> Can be prescribed on Video or as follow-up refills. e.g., Metformin, Amlodipine, Amoxicillin.</li>
                  <li><strong className="text-slate-700">List B (Refills / Refined):</strong> Only follow-ups or on Video consultations. e.g., Sildenafil, Antihistamines.</li>
                  <li><strong className="text-slate-700">Restricted (Schedule X / Narcotics):</strong> strictly Prohibited via Telemedicine. e.g., Lorazepam, Diazepam, Ketamine, Codeine.</li>
                </ul>
              </div>

              <div className="space-y-1 border-l-2 border-indigo-400 pl-3.5">
                <h4 className="font-extrabold text-slate-800 text-[12px]">Section 4.1: HIPAA & Digital Personal Data Protection Act (DPDP)</h4>
                <p>All virtual medical consultations must secure patient EMR metadata, encrypt video feeds, and log strict HIPAA-compliant audit trails for data integrity.</p>
              </div>
            </div>
          </div>

          {/* RIGHT: REAL-TIME CLINIC COMPLIANCE METRICS */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Award className="h-5 w-5 text-emerald-500" /> Active Compliance Audit Metrics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 text-center space-y-1">
                <span className="block text-3xl font-black text-emerald-600">96.8%</span>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Overall compliance</span>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 text-center space-y-1">
                <span className="block text-3xl font-black text-indigo-600">100%</span>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Consent Logs Synced</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Compliance Checklist & Guardrail status</h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-700">Digital Signature Credentials Verified</span>
                  </div>
                  <span className="text-[9.5px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Locked</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-700">Agora WebRTC Media Encryption</span>
                  </div>
                  <span className="text-[9.5px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Active AES-256</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-700">Patient EMR Consent Logs</span>
                  </div>
                  <span className="text-[9.5px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Signed</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-700">Schedule X Blocked in chat/audio</span>
                  </div>
                  <span className="text-[9.5px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Enforced</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === "webhooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: SIMULATOR CONTROLS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CARD 1: EXPLAINER & VERIFICATION TEST */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Terminal className="h-5 w-5 text-indigo-500" />
                Webhook Architecture Sandbox
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                WhatsApp Business Platform uses secure Webhooks to push instant event notifications to CURA whenever patients reply to template reminders or send interactive inquiries.
              </p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                  🔄 Phase 1 Verification Protocol (GET Simulation)
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Meta's App Dashboard sends a GET challenge handshake with your registered verify token to ensure endpoint ownership.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1.5">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 font-mono text-[9.5px]">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">hub.mode</span>
                    subscribe
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 font-mono text-[9.5px] overflow-hidden truncate">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">hub.verify_token</span>
                    cura_verify_token_default_123
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 font-mono text-[9.5px]">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">hub.challenge</span>
                    challenge_9a2b8c
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button 
                    onClick={async () => {
                      try {
                        const url = "/api/v1/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=cura_verify_token_default_123&hub.challenge=challenge_9a2b8c";
                        const r = await fetch(url);
                        const text = await r.text();
                        alert(`Handshake Response: HTTP ${r.status} (${text})\nVerification Successful!`);
                      } catch (e: any) {
                        alert(`Handshake Failed: ${e.message}`);
                      }
                    }}
                    className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg transition-all cursor-pointer uppercase tracking-wider font-sans"
                  >
                    Test GET Verification Handshake
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: DISPATCH SIMULATOR FORM */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Send className="h-5 w-5 text-emerald-500" />
                Trigger Inbound Patient Message (POST Simulation)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    1. Select Simulated Patient (Inbound Sender)
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
                  >
                    {patients.map(p => {
                      // Find if they have an active appointment
                      const hasApt = appointments.find(a => 
                        (a.patientId === p.id || a.phone === p.phone) && 
                        (a.status === "scheduled" || a.status === "confirmed")
                      );
                      const statusSuffix = hasApt ? ` (Apt: ${hasApt.status} with ${hasApt.doctorName})` : " (No active apt)";
                      return (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.phone}){statusSuffix}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    2. Select Preset Keyword or Enter Custom Inquiry
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setWebhookMessageText("Yes")}
                      className={`p-2.5 border rounded-xl text-left text-[11px] font-bold transition-all cursor-pointer ${
                        webhookMessageText === "Yes"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block font-black text-slate-800">"Yes"</span>
                      <span className="text-[9px] font-normal text-slate-400">Confirms upcoming slot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebhookMessageText("Cancel appointment")}
                      className={`p-2.5 border rounded-xl text-left text-[11px] font-bold transition-all cursor-pointer ${
                        webhookMessageText === "Cancel appointment"
                          ? "bg-red-50 border-red-400 text-red-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block font-black text-slate-800">"Cancel"</span>
                      <span className="text-[9px] font-normal text-slate-400">Cancels slot in EMR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebhookMessageText("Reschedule please")}
                      className={`p-2.5 border rounded-xl text-left text-[11px] font-bold transition-all cursor-pointer ${
                        webhookMessageText === "Reschedule please"
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block font-black text-slate-800">"Reschedule"</span>
                      <span className="text-[9px] font-normal text-slate-400">Asks for portal links</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebhookMessageText("I need an RX refill for my diabetes meds")}
                      className={`p-2.5 border rounded-xl text-left text-[11px] font-bold transition-all cursor-pointer ${
                        webhookMessageText === "I need an RX refill for my diabetes meds"
                          ? "bg-purple-50 border-purple-400 text-purple-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block font-black text-slate-800">"Refill"</span>
                      <span className="text-[9px] font-normal text-slate-400">Logs refill request</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={webhookMessageText}
                    onChange={(e) => setWebhookMessageText(e.target.value)}
                    placeholder="Or type a custom message here..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-sans"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDispatchWebhook}
                    disabled={isSendingWebhook}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isSendingWebhook ? (
                      <>
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                        <span>Injecting Webhook Event...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4.5 w-4.5" />
                        <span>Dispatch Meta Webhook Payload (HTTP POST)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE INSPECTOR */}
            {lastSentPayload && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 text-slate-300 rounded-2xl p-4 border border-slate-800 shadow-lg">
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                    📤 SENT PAYLOAD (HTTP POST)
                  </span>
                  <pre className="text-[9px] font-mono whitespace-pre-wrap overflow-y-auto max-h-56 leading-relaxed text-emerald-400">
                    {JSON.stringify(lastSentPayload, null, 2)}
                  </pre>
                </div>
                <div className="bg-slate-900 text-slate-300 rounded-2xl p-4 border border-slate-800 shadow-lg">
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                    📥 RECEIVED RESPONSE (HTTP 200)
                  </span>
                  <pre className="text-[9px] font-mono whitespace-pre-wrap overflow-y-auto max-h-56 leading-relaxed text-indigo-300">
                    {JSON.stringify(lastReceivedResponse, null, 2)}
                  </pre>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: REAL-TIME WEBHOOK LOG AUDIT TERMINAL */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-950 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-6 min-h-[500px] flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                      <Terminal className="h-4.5 w-4.5 text-emerald-400" /> Webhook Live Audit Logs
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      Reactive automated pipelines status
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={fetchWebhookLogs}
                      disabled={isLoadingWebhookLogs}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-all cursor-pointer"
                      title="Refresh Webhook logs"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingWebhookLogs ? "animate-spin" : ""}`} />
                    </button>
                    <button 
                      onClick={handleClearWebhookLogs}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 rounded-lg transition-all cursor-pointer border border-red-900/30"
                      title="Clear logs"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                  {webhookLogs.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 font-medium text-xs space-y-2">
                      <Terminal className="h-8 w-8 mx-auto text-slate-600 animate-pulse" />
                      <p>Terminal listener idle. Trigger a patient message webhook event on the left to fire automations!</p>
                    </div>
                  ) : (
                    webhookLogs.map((log: any) => (
                      <div key={log.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2.5 font-sans">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Inbound Message
                            </span>
                            <span className="ml-1.5 text-[9.5px] font-mono text-slate-400">
                              {log.id}
                            </span>
                          </div>
                          <span className="text-[8.5px] font-mono text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-300 text-left">
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Sender Profile:</span>
                            <span className="font-extrabold text-slate-100">{log.patientName}</span>{" "}
                            <span className="text-slate-400 font-semibold font-mono text-[10.5px]">({log.patientCode})</span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Inbound Body:</span>
                            <span className="italic font-bold text-emerald-300">"{log.receivedText}"</span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Automated Dispatch Reply:</span>
                            <p className="text-[11px] font-semibold text-indigo-200 leading-relaxed bg-indigo-950/40 p-2 rounded-xl border border-indigo-900/20 mt-1 whitespace-pre-wrap">
                              {log.replySent}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block">Pipeline Action Stamped:</span>
                            <span className="text-[10px] font-extrabold text-slate-200 flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              {log.actionLogged}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 text-[9px] text-slate-400 leading-relaxed font-semibold">
                💡 <span className="text-slate-200">How to observe:</span> Select a patient with a "scheduled" status appointment on the left, then select the "Yes" preset and click dispatch. Watch the EMR state turn to <span className="text-emerald-400">Confirmed</span> in real-time, log the audit trail, and dispatch the correct follow-up reminder text back!
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
