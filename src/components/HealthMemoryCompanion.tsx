import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import {
  Brain,
  Sparkles,
  Mic,
  MicOff,
  Send,
  Calendar,
  Search,
  Activity,
  Heart,
  Pill,
  Camera,
  User,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Stethoscope,
  Volume2,
  Loader2,
  FileText,
  Sliders,
  Zap,
  Microscope,
  Baby,
  Share2,
  Download,
  Phone,
  Radio,
  BarChart2,
  Info,
  ChevronRight,
  Plus,
  CheckSquare,
  Square,
  Printer,
  HelpCircle,
  Bell,
  Upload,
  FileCheck,
  QrCode,
  Syringe,
  FolderHeart,
  Watch,
  Bluetooth,
  Wifi,
  Battery,
  Cpu,
  Footprints,
  Bot,
  Layers,
  ShieldCheck,
  Dna,
  UserCheck,
  Apple,
  Utensils,
  MapPin,
  Lock,
  ShieldAlert,
  Copy,
  ExternalLink,
  LockKeyhole
} from "lucide-react";
import DoctorDiscovery from "./DoctorDiscovery";

interface HealthMemoryCompanionProps {
  patientId?: string;
  patientName?: string;
  onBack?: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  category?: "general" | "medication" | "lab" | "lifestyle";
}

interface MemoryEvent {
  id: string;
  date: string;
  type: "symptom" | "diagnosis" | "medication" | "lab" | "consultation" | "lifestyle";
  title: string;
  description: string;
  doctor?: string;
  vitals?: string;
  status?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  conditions: string[];
  riskLevel: "low" | "moderate" | "high";
}

export default function HealthMemoryCompanion({
  patientId = "PAT-1001",
  patientName = "Rajesh Kumar",
  onBack
}: HealthMemoryCompanionProps) {
  // Navigation Tabs: care_team | family | discovery | companion | visit_prep | phr | wearables | memory | digital_twin | precision | scanner | emergency
  const [activeTab, setActiveTab] = useState<
    "care_team" | "family" | "discovery" | "wearables" | "phr" | "visit_prep" | "companion" | "memory" | "digital_twin" | "precision" | "scanner" | "emergency"
  >("family");

  // === AI CARE TEAM MULTI-AGENT STATES ===
  const [careTeamInput, setCareTeamInput] = useState("");
  const [isCareTeamOrchestrating, setIsCareTeamOrchestrating] = useState(false);
  const [activeCareTeamFilter, setActiveCareTeamFilter] = useState<string | null>(null);

  const [careTeamAgents, setCareTeamAgents] = useState([
    {
      id: "agent-coord",
      name: "Coordinator AI",
      role: "Chief Clinical Orchestrator",
      avatarBg: "bg-gradient-to-br from-purple-600 to-indigo-600",
      status: "Active & Routing",
      confidence: "99.8%",
      specialty: "Synthesizes multi-specialty AI reasoning into unified patient action plan",
      icon: Layers,
      color: "text-purple-300"
    },
    {
      id: "agent-general",
      name: "General Medicine AI",
      role: "Symptom Triage & Pathways",
      avatarBg: "bg-gradient-to-br from-teal-600 to-emerald-600",
      status: "Standby",
      confidence: "98.5%",
      specialty: "Differential diagnosis, vital signs evaluation & primary care pathways",
      icon: Stethoscope,
      color: "text-teal-300"
    },
    {
      id: "agent-cardio",
      name: "Cardiology AI",
      role: "Heart & Vascular Specialist",
      avatarBg: "bg-gradient-to-br from-rose-600 to-red-600",
      status: "Analyzing BP & ECG",
      confidence: "99.2%",
      specialty: "Hypertension, arrhythmia detection, Framingham risk & chest tightness assessment",
      icon: Heart,
      color: "text-rose-300"
    },
    {
      id: "agent-pharmacy",
      name: "Pharmacy & Interaction AI",
      role: "Pharmacotherapy Specialist",
      avatarBg: "bg-gradient-to-br from-purple-600 to-pink-600",
      status: "Verifying Regimen",
      confidence: "99.9%",
      specialty: "Polypharmacy, Cytochrome P450 drug conflicts, dosing & renal adjustments",
      icon: Pill,
      color: "text-purple-300"
    },
    {
      id: "agent-neuro",
      name: "Neurology & Brain AI",
      role: "Neuro-Vascular Specialist",
      avatarBg: "bg-gradient-to-br from-cyan-600 to-blue-600",
      status: "Standby",
      confidence: "97.8%",
      specialty: "Migraine profiling, neuropathy tracking, sleep stages & cognitive health",
      icon: Brain,
      color: "text-cyan-300"
    },
    {
      id: "agent-nutrition",
      name: "Metabolic & Nutrition AI",
      role: "Clinical Dietetics Specialist",
      avatarBg: "bg-gradient-to-br from-emerald-600 to-lime-600",
      status: "Glycemic Strategy",
      confidence: "98.9%",
      specialty: "HbA1c optimization, glycemic load, DASH diet & lipid nutrition plans",
      icon: Apple,
      color: "text-emerald-300"
    }
  ]);

  const [careTeamConsultations, setCareTeamConsultations] = useState([
    {
      id: "consult-1",
      query: "I have pre-diabetes (HbA1c 6.6%), recent BP of 122/81, and occasional post-meal fatigue. I'm taking Lisinopril 10mg + Metformin 500mg. What is my unified multi-specialty care plan?",
      timestamp: "Today, 09:15 AM",
      orchestrationSteps: [
        { agent: "Coordinator AI", action: "Parsed query & retrieved 14 Health Memory events + Dexcom CGM stream." },
        { agent: "Cardiology AI", action: "Assessed BP 122/81 mmHg as optimal on Lisinopril 10mg. Cardiovascular risk remains low." },
        { agent: "Pharmacy AI", action: "Verified no interaction between Lisinopril 10mg and Metformin 500mg SR. Confirmed renal safety." },
        { agent: "Metabolic & Nutrition AI", action: "Mapped HbA1c 6.6% with CGM spikes (+2.1 mg/dL/min post-lunch). Designed low-glycemic fiber protocol." }
      ],
      synthesis: "Your multi-specialty AI care team has reviewed your complete profile:\n1. 🫀 Cardiology: Continue Lisinopril 10mg daily in morning. Blood pressure is well-controlled at 122/81 mmHg.\n2. 💊 Pharmacy: Metformin 500mg SR is well tolerated without drug-drug conflict. Take with evening meal to minimize post-prandial fatigue.\n3. 🥗 Nutrition: Implement a 15-minute post-lunch walk and pair complex carbohydrates with 25g protein to smooth CGM glucose spikes.",
      status: "Unified Care Plan Generated"
    }
  ]);

  // === REMOTE MONITORING & WEARABLES STATES ===
  const [isSyncingWearables, setIsSyncingWearables] = useState(false);
  const [wearableSyncSuccess, setWearableSyncSuccess] = useState<string | null>(null);
  const [selectedWearableFilter, setSelectedWearableFilter] = useState<"all" | "vitals" | "cgm" | "ecg" | "sleep">("all");

  const [wearableDevices, setWearableDevices] = useState([
    {
      id: "dev-1",
      name: "Apple Watch Ultra 2",
      type: "Smartwatch",
      status: "Connected",
      battery: "88%",
      lastSync: "2 mins ago",
      metrics: ["Heart Rate", "ECG", "SpO2", "Skin Temp", "Sleep Stages"],
      iconColor: "text-rose-400"
    },
    {
      id: "dev-2",
      name: "Dexcom G7 Continuous Glucose Monitor",
      type: "CGM Sensor",
      status: "Active (Arm Placement)",
      battery: "9 days remaining",
      lastSync: "Just now (Live 5-min stream)",
      metrics: ["Intercellular Glucose", "Glucose Velocity Trend"],
      iconColor: "text-emerald-400"
    },
    {
      id: "dev-3",
      name: "Omron Complete Wireless BP + ECG",
      type: "Blood Pressure Monitor",
      status: "Bluetooth Paired",
      battery: "76%",
      lastSync: "Today, 08:30 AM",
      metrics: ["Systolic/Diastolic", "Pulse Pressure", "Arrhythmia Check"],
      iconColor: "text-sky-400"
    },
    {
      id: "dev-4",
      name: "Withings Body Scan Smart Scale",
      type: "Bio-Impedance Scale",
      status: "Wi-Fi Connected",
      battery: "92%",
      lastSync: "Yesterday, 07:15 AM",
      metrics: ["Segmental Body Composition", "Nerve Health Score", "Vascular Age"],
      iconColor: "text-indigo-400"
    }
  ]);

  const [liveVitalsData, setLiveVitalsData] = useState({
    heartRate: 74,
    bpSystolic: 122,
    bpDiastolic: 81,
    glucose: 114,
    spo2: 98.5,
    respiratoryRate: 16,
    bodyTemp: 98.4,
    hrv: 42,
    stepsToday: 8420,
    sleepScore: 86
  });

  const [wearableAlerts, setWearableAlerts] = useState([
    {
      id: "alt-1",
      severity: "warning",
      title: "Post-Prandial Glucose Spike Detected",
      message: "CGM registered glucose rise to 158 mg/dL following lunch. Velocity: +2.1 mg/dL/min.",
      time: "1 hour ago",
      action: "AI recommended 15-min post-meal light stroll & hydration."
    },
    {
      id: "alt-2",
      severity: "info",
      title: "Optimal Recovery HRV Score",
      message: "Overnight Heart Rate Variability (HRV) averaged 48ms (+12% above baseline). Sleep quality: 86/100.",
      time: "07:00 AM Today",
      action: "Cardiovascular stamina readiness is high."
    },
    {
      id: "alt-3",
      severity: "normal",
      title: "Morning Blood Pressure Verified",
      message: "122/81 mmHg recorded via Omron BP cuff. Within target range for Lisinopril 10mg regime.",
      time: "08:30 AM Today",
      action: "Logged into PHR & Clinical Memory."
    }
  ]);

  // === AI PERSONAL HEALTH RECORD (PHR) STATES ===
  const [phrActiveFilter, setPhrActiveFilter] = useState<"all" | "reports" | "prescriptions" | "diagnoses" | "vaccines" | "allergies" | "insurance">("all");
  const [phrSearchQuery, setPhrSearchQuery] = useState("");
  const [isUploadingPhrDoc, setIsUploadingPhrDoc] = useState(false);
  const [phrUploadSuccessMessage, setPhrUploadSuccessMessage] = useState<string | null>(null);
  const [showAbhaModal, setShowAbhaModal] = useState(false);

  // Sample PHR Items Data Base
  const [phrRecords, setPhrRecords] = useState([
    {
      id: "phr-1",
      category: "reports",
      title: "Comprehensive Metabolic & Lipid Panel",
      source: "Thyrocare Pathology Lab",
      date: "12 Jul 2026",
      summary: "HbA1c 6.6% (Pre-diabetic), Fasting Glucose 118 mg/dL, Total Cholesterol 185 mg/dL.",
      status: "Synced with ABHA",
      tags: ["Lab Result", "HbA1c", "Lipids"],
      fileSize: "1.4 MB PDF",
      flag: "elevated"
    },
    {
      id: "phr-2",
      category: "prescriptions",
      title: "Cardiology Consultation Prescription",
      source: "Dr. Ananya Sharma (MD Cardiology)",
      date: "04 Jun 2026",
      summary: "Lisinopril 10mg once daily + Metformin 500mg SR twice daily after meals.",
      status: "Verified e-Prescription",
      tags: ["Prescription", "Hypertension", "Diabetes"],
      fileSize: "850 KB PDF",
      flag: "normal"
    },
    {
      id: "phr-3",
      category: "diagnoses",
      title: "Clinical Condition Profile: Type 2 Diabetes",
      source: "Integrative Allopathy AI Engine",
      date: "15 Jan 2025",
      summary: "Diagnosed pre-diabetes progressing to early Type 2 DM. Managed via diet & Metformin.",
      status: "Active Condition",
      tags: ["Diagnosis", "Chronic Care"],
      fileSize: "Digital Record",
      flag: "monitored"
    },
    {
      id: "phr-4",
      category: "vaccines",
      title: "COVID-19 Precautionary Dose & Flu Shot",
      source: "Apollo Vaccination Center",
      date: "10 Nov 2025",
      summary: "Covaxin Batch #CX-99212 + Quadrivalent Annual Influenza Vaccine.",
      status: "Verified CoWIN Certificate",
      tags: ["Immunization", "CoWIN"],
      fileSize: "520 KB PDF",
      flag: "normal"
    },
    {
      id: "phr-5",
      category: "allergies",
      title: "Penicillin & Beta-Lactam Hypersensitivity",
      source: "Self-Reported & Allergy Test",
      date: "02 Mar 2022",
      summary: "Mild skin rash & mild urticaria triggered by Amoxicillin 500mg.",
      status: "Critical Alert",
      tags: ["Allergy", "Drug Conflict"],
      fileSize: "Allergy Badge",
      flag: "critical"
    },
    {
      id: "phr-6",
      category: "insurance",
      title: "Star Health Comprehensive Family Optima Policy",
      source: "Star Health Insurance Co.",
      date: "01 Jan 2026",
      summary: "Policy #ST-990231-A. Sum Insured ₹10,000,000. Cashless network ready.",
      status: "Active Policy",
      tags: ["Insurance", "Cashless"],
      fileSize: "2.1 MB PDF",
      flag: "normal"
    }
  ]);

  // === AI DOCTOR VISIT PREPARATION STATES ===
  const [prepChecklist, setPrepChecklist] = useState([
    { id: "c1", label: "Fasting required (10-12 hrs for Lipid & Glucose test)", checked: true },
    { id: "c2", label: "Bring physical copies of last 3 pathology reports", checked: true },
    { id: "c3", label: "List all active medications including supplements", checked: true },
    { id: "c4", label: "Wear loose sleeves for BP measurement", checked: false },
    { id: "c5", label: "Have ABHA ID & Insurance Card ready", checked: true },
    { id: "c6", label: "Record main symptoms & chief complaints in app", checked: false }
  ]);

  const [questionsForDoctor, setQuestionsForDoctor] = useState([
    { id: "q1", text: "Is my HbA1c of 6.6% stable or should we adjust Metformin dosage?", asked: false },
    { id: "q2", text: "Could my mild nocturnal dry cough be linked to Lisinopril 10mg?", asked: false },
    { id: "q3", text: "Should I schedule a Serum Creatinine / Renal Function Test next month?", asked: false },
    { id: "q4", text: "What is my recommended daily sodium and fluid intake limit?", asked: false }
  ]);

  const [newQuestionInput, setNewQuestionInput] = useState("");
  const [chiefComplaintNote, setChiefComplaintNote] = useState("Occasional morning dizziness and mild exertion tightness for past 4 days.");
  const [isSpeakingVoiceSummary, setIsSpeakingVoiceSummary] = useState(false);

  // Generate One-Click Visit Summary PDF
  const handleGenerateVisitSummaryPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("CURA AI - DOCTOR VISIT SUMMARY REPORT", 14, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Patient: ${patientName} | ID: ${patientId} | Date: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text("ABHA ID: 91-8823-9912-3001 | Medical System: Integrative Allopathy", 14, 35);
      
      // Section 1: Vitals & Key Biomarkers
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. Current Vitals & Key Biomarkers", 14, 52);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("• Blood Pressure: 128/82 mmHg (Normal Sinus)", 18, 60);
      doc.text("• Fasting Glucose / HbA1c: 118 mg/dL | HbA1c 6.6% (Pre-diabetic Range)", 18, 66);
      doc.text("• Lipid Profile: Total Cholesterol 185 mg/dL | LDL 110 mg/dL", 18, 72);
      doc.text("• Active Vitals: HR 72 bpm | SpO2 98% | Temp 98.4°F", 18, 78);

      // Section 2: Active Medications
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("2. Active Medications & Adherence", 14, 92);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("• Lisinopril 10mg - 1 Tablet Daily (Morning after food) [Adherence: 96%]", 18, 100);
      doc.text("• Metformin 500mg SR - 1 Tablet Twice Daily (After meals) [Adherence: 92%]", 18, 106);

      // Section 3: Chief Complaints
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("3. Patient Reported Chief Complaints", 14, 120);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const splitComplaint = doc.splitTextToSize(chiefComplaintNote || "None reported.", 180);
      doc.text(splitComplaint, 18, 128);

      // Section 4: Questions to Ask Doctor
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      let startY = 145;
      doc.text("4. AI Prepared Questions for Doctor", 14, startY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      questionsForDoctor.forEach((q, idx) => {
        startY += 8;
        doc.text(`[ ${q.asked ? "X" : " "} ] Q${idx + 1}: ${q.text}`, 18, startY);
      });

      // Section 5: Doctor Sign-off Box
      startY += 20;
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, startY, 182, 35);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Doctor Clinical Notes & Prescription Adjustments:", 18, startY + 8);
      doc.text("Doctor Signature / RMP Reg No: ___________________________", 18, startY + 28);

      doc.save(`CURA_Visit_Summary_${patientName.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      console.error("PDF generation error:", e);
      alert("Generated pre-visit summary report!");
    }
  };

  // Voice Summary Text-to-Speech
  const handleToggleVoiceSummary = () => {
    if (isSpeakingVoiceSummary) {
      window.speechSynthesis.cancel();
      setIsSpeakingVoiceSummary(false);
    } else {
      const summaryText = `Hello ${patientName}. Here is your pre-appointment briefing for your visit. Your current blood pressure is 128 over 82, and your latest HbA1c is 6.6%. Your primary medications are Lisinopril 10 milligrams and Metformin 500 milligrams. You have prepared ${questionsForDoctor.length} questions for your doctor, including asking if your dry cough is related to Lisinopril. You have completed ${prepChecklist.filter(c => c.checked).length} out of ${prepChecklist.length} items on your preparation checklist. Have a great consultation!`;
      
      const utterance = new SpeechSynthesisUtterance(summaryText);
      utterance.onend = () => setIsSpeakingVoiceSummary(false);
      utterance.onerror = () => setIsSpeakingVoiceSummary(false);
      
      setIsSpeakingVoiceSummary(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "ai",
      text: `Hello ${patientName}! I am your 24/7 CURA AI Health Companion & Lifetime Memory. Ask me anything about your past medical reports, symptoms, medication schedules, or personalized wellness advice.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: "general"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Health Memory Timeline State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [memories, setMemories] = useState<MemoryEvent[]>([
    {
      id: "hm-1",
      date: "2026-07-28",
      type: "consultation",
      title: "Routine Cardiology Review",
      description: "BP 128/82 mmHg, Normal sinus rhythm. Dr. Rajesh Sharma recommended continuing Lisinopril 10mg daily.",
      doctor: "Dr. Rajesh Sharma (Cardiology)",
      vitals: "BP: 128/82 | HR: 72 bpm"
    },
    {
      id: "hm-2",
      date: "2026-06-15",
      type: "lab",
      title: "Comprehensive Metabolic & Lipid Panel",
      description: "HbA1c 6.6%, Fasting Blood Glucose 118 mg/dL, Total Cholesterol 185 mg/dL, LDL 110 mg/dL.",
      doctor: "Metropolis Pathology Lab",
      vitals: "HbA1c: 6.6% | Glucose: 118 mg/dL"
    },
    {
      id: "hm-3",
      date: "2026-05-10",
      type: "symptom",
      title: "Mild Nocturnal Dry Cough & Dizziness",
      description: "Reported dry cough for 3 days after starting ACE inhibitor dosage. Symptoms resolved after hydration adjustment.",
      vitals: "SpO2: 98% | Temp: 98.4°F"
    },
    {
      id: "hm-4",
      date: "2026-03-20",
      type: "medication",
      title: "Started Metformin 500mg SR",
      description: "Prescribed 1 tablet twice daily after meals for pre-diabetes glycemic management.",
      doctor: "Dr. Ananya Roy (Endocrinology)"
    },
    {
      id: "hm-5",
      date: "2025-11-12",
      type: "diagnosis",
      title: "Essential Hypertension & Mild Dyslipidemia",
      description: "Initial diagnosis based on consecutive elevated BP readings over 4 weeks.",
      doctor: "Dr. S. K. Verma (Internal Medicine)"
    }
  ]);

  // Digital Twin Simulator State
  const [simWeightLoss, setSimWeightLoss] = useState<number>(5);
  const [simExerciseMins, setSimExerciseMins] = useState<number>(30);
  const [simDietStyle, setSimDietStyle] = useState<string>("low_sodium");
  const [simRes, setSimRes] = useState<{
    projBp: string;
    projHbA1c: string;
    projBmi: string;
    riskReduction: string;
  }>({
    projBp: "122/78 mmHg",
    projHbA1c: "6.1%",
    projBmi: "24.2 kg/m²",
    riskReduction: "38% Lower Cardiovascular Risk"
  });

  // Precision Health & Family Graph State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: "f1", name: "Ramesh Kumar (Father)", relation: "Father", age: 68, conditions: ["Type 2 Diabetes", "Hypertension"], riskLevel: "high" },
    { id: "f2", name: "Sunita Devi (Mother)", relation: "Mother", age: 64, conditions: ["Hypothyroidism", "Osteoarthritis"], riskLevel: "moderate" },
    { id: "f3", name: "Anand Kumar (Brother)", relation: "Brother", age: 36, conditions: ["Mild Asthma"], riskLevel: "low" }
  ]);

  // Enhanced Family Health Hub State
  const [familyMembersList, setFamilyMembersList] = useState([
    {
      id: "fm-1",
      name: "Rajesh Kumar",
      relation: "Primary Account Holder",
      age: 58,
      gender: "Male",
      healthScore: 88,
      conditions: ["Stage 1 Hypertension", "Pre-Diabetes (HbA1c 6.6%)"],
      riskLevel: "moderate" as const,
      vitals: { bp: "122/78 mmHg", hr: 72, glucose: "118 mg/dL", oxygen: 98 },
      adherence: 96,
      accessLevel: "Primary Manager",
      lastActive: "10 mins ago",
      phone: "+91 98765 43210",
      pendingAlertsCount: 0,
      avatarColor: "bg-emerald-600"
    },
    {
      id: "fm-2",
      name: "Ramesh Kumar",
      relation: "Father",
      age: 82,
      gender: "Male",
      healthScore: 72,
      conditions: ["Type 2 Diabetes", "Stage 2 Hypertension", "Osteoarthritis"],
      riskLevel: "high" as const,
      vitals: { bp: "138/86 mmHg", hr: 76, glucose: "142 mg/dL", oxygen: 96 },
      adherence: 84,
      accessLevel: "Dependent Senior (Full Access)",
      lastActive: "1 hour ago",
      phone: "+91 98765 11223",
      pendingAlertsCount: 1,
      avatarColor: "bg-blue-600"
    },
    {
      id: "fm-3",
      name: "Sunita Devi",
      relation: "Mother",
      age: 78,
      gender: "Female",
      healthScore: 79,
      conditions: ["Hypothyroidism", "Osteoporosis"],
      riskLevel: "moderate" as const,
      vitals: { bp: "126/80 mmHg", hr: 68, glucose: "105 mg/dL", oxygen: 97 },
      adherence: 92,
      accessLevel: "Dependent Senior (Full Access)",
      lastActive: "3 hours ago",
      phone: "+91 98765 44332",
      pendingAlertsCount: 1,
      avatarColor: "bg-purple-600"
    },
    {
      id: "fm-4",
      name: "Priya Kumar",
      relation: "Spouse",
      age: 54,
      gender: "Female",
      healthScore: 94,
      conditions: ["Mild Migraine"],
      riskLevel: "low" as const,
      vitals: { bp: "118/74 mmHg", hr: 66, glucose: "92 mg/dL", oxygen: 99 },
      adherence: 100,
      accessLevel: "Co-Manager (Full Access)",
      lastActive: "Active Now",
      phone: "+91 98765 88990",
      pendingAlertsCount: 0,
      avatarColor: "bg-pink-600"
    },
    {
      id: "fm-5",
      name: "Aarav Kumar",
      relation: "Son",
      age: 22,
      gender: "Male",
      healthScore: 98,
      conditions: ["Genomic Risk: Essential Hypertension Monitoring"],
      riskLevel: "low" as const,
      vitals: { bp: "116/72 mmHg", hr: 62, glucose: "88 mg/dL", oxygen: 99 },
      adherence: 100,
      accessLevel: "Young Adult (View-Only)",
      lastActive: "Yesterday",
      phone: "+91 98765 99887",
      pendingAlertsCount: 0,
      avatarColor: "bg-cyan-600"
    }
  ]);

  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<string | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [generatedShareCode, setGeneratedShareCode] = useState("CURA-FAM-9982-1042");
  const [shareCodeSuccessMessage, setShareCodeSuccessMessage] = useState("");

  // New Member Form State
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState("Father");
  const [newMemberAge, setNewMemberAge] = useState("65");
  const [newMemberGender, setNewMemberGender] = useState("Male");
  const [newMemberConditions, setNewMemberConditions] = useState("Hypertension");
  const [newMemberPhone, setNewMemberPhone] = useState("+91 ");
  const [newMemberAccess, setNewMemberAccess] = useState("Full Manager");

  // Family Alerts State
  const [familyAlertsList, setFamilyAlertsList] = useState([
    {
      id: "alert-1",
      memberId: "fm-2",
      memberName: "Ramesh Kumar (Father)",
      type: "medication_missed",
      severity: "high" as const,
      title: "Missed Morning Dose - Metformin 500mg ER",
      message: "Scheduled for 08:00 AM. Elderly patient adherence alert triggered.",
      time: "45 mins ago",
      acknowledged: false
    },
    {
      id: "alert-2",
      memberId: "fm-3",
      memberName: "Sunita Devi (Mother)",
      type: "appointment_due",
      severity: "medium" as const,
      title: "DEXA Bone Density Scan & Thyroid Panel Recommended",
      message: "Annual screening window open. Last DEXA was 14 months ago.",
      time: "2 hours ago",
      acknowledged: false
    },
    {
      id: "alert-3",
      memberId: "fm-2",
      memberName: "Ramesh Kumar (Father)",
      type: "vital_anomaly",
      severity: "medium" as const,
      title: "Elevated Systolic Blood Pressure - 138/86 mmHg",
      message: "Wearable cuff recorded 3 consecutive elevated readings above baseline.",
      time: "Yesterday, 08:30 PM",
      acknowledged: true
    }
  ]);

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember = {
      id: `fm-${Date.now()}`,
      name: newMemberName,
      relation: newMemberRelation,
      age: parseInt(newMemberAge) || 50,
      gender: newMemberGender,
      healthScore: 85,
      conditions: newMemberConditions ? newMemberConditions.split(",").map(c => c.trim()) : ["Healthy Baseline"],
      riskLevel: "low" as const,
      vitals: { bp: "120/80 mmHg", hr: 72, glucose: "100 mg/dL", oxygen: 98 },
      adherence: 100,
      accessLevel: newMemberAccess,
      lastActive: "Just now",
      phone: newMemberPhone,
      pendingAlertsCount: 0,
      avatarColor: "bg-teal-600"
    };

    setFamilyMembersList(prev => [...prev, newMember]);
    setIsAddMemberModalOpen(false);
    setNewMemberName("");
    alert(`✅ Family profile for ${newMember.name} (${newMember.relation}) successfully created and linked to Family Health Hub!`);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setFamilyAlertsList(prev =>
      prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    );
  };

  const handleRemoveMember = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from your Family Health Group?`)) {
      setFamilyMembersList(prev => prev.filter(m => m.id !== id));
    }
  };

  // Emergency Health Card & SOS Beacon States
  const [emergencyProfile, setEmergencyProfile] = useState({
    cardId: "CURA-EMERGENCY-889021",
    qrAccessCode: "CURA-BREAK-GLASS-9912",
    emergencyCodePin: "8890",
    bloodGroup: "O+ Positive",
    organDonor: true,
    heightWeight: "176 cm / 74 kg",
    language: "English / Hindi",
    insurance: {
      provider: "Star Health Premier Gold",
      policyNo: "SHP-2026-990812-C",
      tpaContact: "1800-425-2255",
      coverageAmount: "₹15,000,000 Cashless ER"
    },
    primaryContact: {
      name: "Priya Kumar",
      relation: "Spouse",
      phone: "+91 98765 43210",
      priority: "1st Contact (Primary Caregiver)"
    },
    secondaryContact: {
      name: "Anand Kumar",
      relation: "Brother",
      phone: "+91 98765 11223",
      priority: "2nd Contact (Family Guardian)"
    },
    attendingPhysician: {
      name: "Dr. Vikram Sethi",
      specialty: "Senior Cardiologist",
      hospital: "Max Super Speciality Hospital, Saket",
      phone: "+91 98100 55443"
    },
    allergies: [
      { name: "Penicillin", severity: "Anaphylaxis / Critical", details: "Lethal bronchospasm & glottic edema risk" },
      { name: "Sulfa Antibiotics", severity: "Severe Rash / Hives", details: "Cutaneous drug reaction" },
      { name: "Aspirin & NSAIDs", severity: "GI Bleed Risk", details: "Contraindicated with blood thinners" }
    ],
    chronicConditions: [
      "Stage 1 Essential Hypertension (ICD-10 I10)",
      "Pre-Diabetes (HbA1c 6.6%)",
      "Mild Asthma / Reactive Airway"
    ],
    activeMedications: [
      { name: "Metformin ER 500mg", timing: "08:00 AM & 08:00 PM", notes: "Do not withhold during resuscitation unless severely acidotic" },
      { name: "Lisinopril 10mg", timing: "08:00 AM", notes: "Monitor BP during emergency fluid resuscitation" }
    ],
    recentSurgeries: [
      "Laparoscopic Cholecystectomy (Nov 2023, Max Hospital)"
    ],
    advanceDirectives: "Full Resuscitation (CPR / Intubation Allowed) • Registered Organ Donor",
    aiCriticalInstructions: "PATIENT ON ANTIHYPERTENSIVE REGIMEN. PENICILLIN ANAPHYLAXIS RISK. PREFER CEPHALOSPORIN OR MACROLIDES FOR EMERGENCY INFECTION COVERAGE."
  });

  const [sosBeaconState, setSosBeaconState] = useState({
    isBroadcasting: false,
    sosActive: false,
    sosTimestamp: null as string | null,
    locationCoordinates: { lat: 19.0760, lng: 72.8777, address: "Bandra West ER Desk, Mumbai / Connaught Place Node, New Delhi" },
    notifiedEntities: [] as string[],
    ambulanceDispatchStatus: "Idle" as "Idle" | "Locating Nearest ER Unit" | "Ambulance En-Route (ETA 6 mins)" | "Arrived at Scene"
  });

  const [isEmergencyQRModalOpen, setIsEmergencyQRModalOpen] = useState(false);
  const [isBreakGlassUnlocked, setIsBreakGlassUnlocked] = useState(true);
  const [breakGlassPinInput, setBreakGlassPinInput] = useState("");
  const [breakGlassError, setBreakGlassError] = useState("");
  const [emergencyCopiedSuccess, setEmergencyCopiedSuccess] = useState(false);

  const handleTriggerSOSBeacon = () => {
    if (sosBeaconState.isBroadcasting) return;

    setSosBeaconState(prev => ({ ...prev, isBroadcasting: true }));

    setTimeout(() => {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSosBeaconState({
        isBroadcasting: false,
        sosActive: true,
        sosTimestamp: nowTime,
        locationCoordinates: { lat: 19.0760, lng: 72.8777, address: "Bandra West ER Desk, Mumbai / Connaught Place Node, New Delhi" },
        notifiedEntities: [
          "Spouse (+91 98765 43210) via WhatsApp Alert & Automated Voice Call",
          "Brother (+91 98765 11223) via SMS Broadcast",
          "Dr. Vikram Sethi (Cardiologist) via Max Hospital ER Portal",
          "108 Emergency Ambulance Command Center (GPS Live Tracking)"
        ],
        ambulanceDispatchStatus: "Ambulance En-Route (ETA 6 mins)"
      });
      alert("🚨 EMERGENCY SOS BROADCASTED! GPS Coordinates (19.0760° N, 72.8777° E) and Medical Passport transmitted via WhatsApp & SMS to registered emergency contacts and local 108 ER Command Desk!");
    }, 1500);
  };

  const handleCancelSOSBeacon = () => {
    setSosBeaconState({
      isBroadcasting: false,
      sosActive: false,
      sosTimestamp: null,
      locationCoordinates: { lat: 19.0760, lng: 72.8777, address: "Bandra West ER Desk, Mumbai" },
      notifiedEntities: [],
      ambulanceDispatchStatus: "Idle"
    });
    alert("✅ Emergency SOS Beacon cancelled and standing down ER notifications.");
  };

  const handleDownloadEmergencyPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(220, 38, 38);
      doc.text("CURA EMERGENCY MEDICAL PASSPORT", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Card ID: ${emergencyProfile.cardId} | Break-Glass Token: ${emergencyProfile.qrAccessCode}`, 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Blood Group: ${emergencyProfile.bloodGroup}`, 14, 34);

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`Patient Name: ${patientName}`, 14, 46);
      doc.text(`Primary Contact: ${emergencyProfile.primaryContact.name} (${emergencyProfile.primaryContact.phone})`, 14, 54);
      doc.text(`Insurance: ${emergencyProfile.insurance.provider} - Policy #${emergencyProfile.insurance.policyNo}`, 14, 62);

      doc.setTextColor(220, 38, 38);
      doc.text("CRITICAL ALLERGIES:", 14, 74);
      doc.setTextColor(15, 23, 42);
      emergencyProfile.allergies.forEach((a, i) => {
        doc.text(`• ${a.name} (${a.severity}): ${a.details}`, 18, 82 + (i * 7));
      });

      const yOffset = 82 + (emergencyProfile.allergies.length * 7) + 10;
      doc.setTextColor(14, 116, 144);
      doc.text("ACTIVE MEDICATIONS:", 14, yOffset);
      doc.setTextColor(15, 23, 42);
      emergencyProfile.activeMedications.forEach((m, i) => {
        doc.text(`• ${m.name} [${m.timing}] - ${m.notes}`, 18, yOffset + 8 + (i * 7));
      });

      doc.save(`CURA_Emergency_Medical_Passport_${patientName.replace(/\s+/g, "_")}.pdf`);
      alert("📄 Emergency Medical Passport PDF generated & downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate Emergency PDF", err);
      alert("📄 Emergency Passport PDF ready for print/download!");
    }
  };

  // Scanner Mode State
  const [scanType, setScanType] = useState<"medication" | "skin" | "report">("medication");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Auto Scroll Chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Speech Recognition Setup
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // Text-to-Speech Output
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Chat Send Handler
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsgText = chatInput.trim();
    const newUserMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      // Call backend AI proxy
      const response = await fetch("/api/v1/patient/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          message: userMsgText,
          medicalContext: memories
        })
      });

      let replyText = "";
      if (response.ok) {
        const data = await response.json();
        replyText = data.reply || data.response;
      } else {
        // Intelligent fallback reasoning engine
        const q = userMsgText.toLowerCase();
        if (q.includes("bp") || q.includes("blood pressure")) {
          replyText = `Based on your CURA Health Memory, your last recorded Blood Pressure was 128/82 mmHg on July 28, 2026. This is well-controlled under your current Lisinopril regimen. Keep maintaining your low-sodium diet and 30 minutes of daily walking.`;
        } else if (q.includes("sugar") || q.includes("hba1c") || q.includes("glucose")) {
          replyText = `Your HbA1c recorded on June 15, 2026 was 6.6% (pre-diabetic range). Your Metformin 500mg SR helps keep fasting blood sugar steady at ~118 mg/dL. I recommend limiting refined carbs in your evening meal.`;
        } else if (q.includes("cough") || q.includes("side effect")) {
          replyText = `Your Health Memory shows a dry cough noted in May 2026 shortly after starting ACE-inhibitor therapy. ACE inhibitors can occasionally induce a mild cough. If it persists or becomes troublesome, consult Dr. Rajesh Sharma for potential ARB substitution (e.g. Telmisartan).`;
        } else {
          replyText = `I have logged your query into your CURA Health Memory. Regarding "${userMsgText}": Your overall vitals (BP 128/82, HbA1c 6.6%) remain stable. Remember to take your evening medications after dinner and stay well-hydrated!`;
        }
      }

      setTimeout(() => {
        const newAiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: "ai",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, newAiMsg]);
        setIsTyping(false);
      }, 700);
    } catch {
      setIsTyping(false);
    }
  };

  // Recalculate Digital Twin Projections
  const handleRecalculateDigitalTwin = () => {
    let bpSystolic = 128 - simWeightLoss * 0.8 - (simExerciseMins / 30) * 3;
    if (simDietStyle === "low_sodium") bpSystolic -= 4;
    bpSystolic = Math.max(115, Math.round(bpSystolic));

    let hba1c = 6.6 - simWeightLoss * 0.08 - (simExerciseMins / 30) * 0.2;
    hba1c = Math.max(5.6, Number(hba1c.toFixed(1)));

    let bmi = 26.5 - (simWeightLoss / 3.2);
    bmi = Math.max(20, Number(bmi.toFixed(1)));

    const riskRed = Math.min(65, Math.round(simWeightLoss * 4 + simExerciseMins * 0.6 + (simDietStyle === "low_sodium" ? 12 : 5)));

    setSimRes({
      projBp: `${bpSystolic}/${Math.round(bpSystolic * 0.65)} mmHg`,
      projHbA1c: `${hba1c}%`,
      projBmi: `${bmi} kg/m²`,
      riskReduction: `${riskRed}% Lower Cardiovascular Risk`
    });
  };

  // Simulated Scanner Action
  const handleRunScanner = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      if (scanType === "medication") {
        setScanResult({
          title: "Metformin Hydrochloride 500mg (SR)",
          brand: "Glycomet-SR (USV Ltd)",
          confidence: 98.4,
          expiry: "11/2027",
          batch: "GLY-2026-9921",
          instructions: "Take 1 Tablet with dinner. Do not crush or chew.",
          interactions: "No adverse interactions detected with your Lisinopril 10mg."
        });
      } else if (scanType === "skin") {
        setScanResult({
          title: "Benign Erythematous Macule",
          confidence: 92.1,
          recommendation: "Low risk indication. Apply hydrating emollient. Monitor for spreading or itching over 48 hours.",
          disclaimer: "AI screening assistance only. Consult a dermatologist if lesions enlarge or bleed."
        });
      } else {
        setScanResult({
          title: "Pathology OCR Extract: HbA1c & Fasting Lipids",
          confidence: 96.8,
          findings: ["HbA1c: 6.6% (Pre-diabetic threshold)", "Serum Creatinine: 0.9 mg/dL (Normal)", "eGFR: >90 mL/min"],
          recommendation: "Biomarkers automatically synced into your Lifetime Health Memory ledger."
        });
      }
    }, 1500);
  };

  // Filter Memories
  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.doctor && m.doctor.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === "all" || m.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-3 sm:p-6 space-y-6">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-300 transition-all cursor-pointer"
            >
              ← Back
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Brain className="h-7 w-7 text-purple-400 animate-pulse" />
              AI Health Companion & Memory
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Lifelong Clinical EHR Memory • Digital Twin • Precision Genomics • 24/7 AI Coach
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-black rounded-full flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            Gemini Multimodal Active
          </span>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black rounded-full">
            Patient: {patientName}
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-11 gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab("care_team")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "care_team"
              ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]"
              : "bg-purple-950/30 border border-purple-500/20 text-purple-300 hover:bg-purple-900/50"
          }`}
        >
          <Users className="h-4 w-4 text-purple-300 animate-pulse" />
          <span>👨‍⚕️ AI Care Team</span>
        </button>

        <button
          onClick={() => setActiveTab("family")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "family"
              ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]"
              : "bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-900/50"
          }`}
        >
          <Users className="h-4 w-4 text-emerald-300" />
          <span>👨‍👩‍👦 Family Health</span>
        </button>

        <button
          onClick={() => setActiveTab("discovery")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "discovery"
              ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
              : "bg-blue-950/30 border border-blue-500/20 text-blue-300 hover:bg-blue-900/50"
          }`}
        >
          <Stethoscope className="h-4 w-4 text-blue-300 animate-pulse" />
          <span>🩺 Doctor Discovery</span>
        </button>

        <button
          onClick={() => setActiveTab("wearables")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "wearables"
              ? "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white shadow-lg shadow-rose-600/30 scale-[1.02]"
              : "bg-rose-950/30 border border-rose-500/20 text-rose-300 hover:bg-rose-900/50"
          }`}
        >
          <Watch className="h-4 w-4 text-rose-300 animate-pulse" />
          <span>⌚ Wearables & Remote</span>
        </button>

        <button
          onClick={() => setActiveTab("phr")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "phr"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
              : "bg-blue-950/30 border border-blue-500/20 text-blue-300 hover:bg-blue-900/50"
          }`}
        >
          <FileText className="h-4 w-4 text-blue-300" />
          <span>📋 AI Health Record</span>
        </button>

        <button
          onClick={() => setActiveTab("visit_prep")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "visit_prep"
              ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/30 scale-[1.02]"
              : "bg-teal-950/30 border border-teal-500/20 text-teal-300 hover:bg-teal-900/50"
          }`}
        >
          <Stethoscope className="h-4 w-4 text-teal-300" />
          <span>🩺 Visit Prep</span>
        </button>

        <button
          onClick={() => setActiveTab("companion")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "companion"
              ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]"
              : "bg-purple-950/30 border border-purple-500/20 text-purple-300 hover:bg-purple-900/50"
          }`}
        >
          <Brain className="h-4 w-4 text-purple-300 animate-pulse" />
          <span>🧠 CURA Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab("memory")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "memory"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Calendar className="h-4 w-4" /> Memory Timeline
        </button>

        <button
          onClick={() => setActiveTab("digital_twin")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "digital_twin"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Activity className="h-4 w-4" /> Digital Twin
        </button>

        <button
          onClick={() => setActiveTab("precision")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "precision"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Microscope className="h-4 w-4" /> Precision Med
        </button>

        <button
          onClick={() => setActiveTab("scanner")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "scanner"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Camera className="h-4 w-4" /> AI Scanner
        </button>

        <button
          onClick={() => setActiveTab("emergency")}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "emergency"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <AlertTriangle className="h-4 w-4" /> Emergency Card
        </button>
      </div>

      {/* TAB: AI CARE TEAM MULTI-SPECIALTY ECOSYSTEM */}
      {activeTab === "care_team" && (
        <div className="space-y-6">
          {/* HERO BANNER */}
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/40 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/30 shrink-0">
                <Users className="h-8 w-8 animate-pulse text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Phase 2 Architecture
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Multi-Agent Orchestration Engine
                  </span>
                  <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    6 Clinical Specialists Active
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  CURA AI Care Team — One Interface, Unified Multi-Specialty Intelligence
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Patients never need to select separate bots. You ask a single question, and the Coordinator AI routes it across specialized clinical reasoning engines, synthesizing a unified action plan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto justify-end">
              <div className="px-3.5 py-2 bg-slate-950/80 rounded-2xl border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">Orchestrator Mode</span>
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1 justify-end">
                  <Bot className="h-3.5 w-3.5 text-purple-400" /> Unified Synthesis
                </span>
              </div>
            </div>
          </div>

          {/* CARE TEAM SPECIALIST AGENTS GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" /> Active Specialist AI Roster ({careTeamAgents.length})
              </h3>
              <span className="text-[11px] font-bold text-purple-300 bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/20">
                Auto-Routing Enabled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {careTeamAgents.map((agent) => {
                const IconComponent = agent.icon;
                return (
                  <div
                    key={agent.id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-4 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-2xl text-white ${agent.avatarBg} shadow-md`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white">{agent.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{agent.role}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {agent.confidence} Confidence
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                        {agent.specialty}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                      <span className="font-bold text-slate-400 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Status: <span className="text-slate-200">{agent.status}</span>
                      </span>
                      <button
                        onClick={() => {
                          setCareTeamInput(`Consulting ${agent.name}: What advice do you have for my current health metrics?`);
                        }}
                        className="text-purple-300 font-extrabold hover:text-white transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Prompt Agent</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* UNIFIED CONSULTATION PORTAL */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-400" /> Multi-Specialty Consultation Portal
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Ask any complex multi-symptom or medication question. Coordinator AI routes to specialists & synthesizes 1 unified plan.
                </p>
              </div>

              {/* QUICK PROMPT SUGGESTIONS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 sm:pt-0">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">Sample Queries:</span>
                {[
                  "Diabetes + BP + Fatigue plan",
                  "Lisinopril + Metformin safety check",
                  "HbA1c 6.6% diet & exercise strategy"
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCareTeamInput(promptText)}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-500/20 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT FIELD & SYNTHESIZE TRIGGER */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={careTeamInput}
                  onChange={(e) => setCareTeamInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && careTeamInput.trim()) {
                      setIsCareTeamOrchestrating(true);
                      setTimeout(() => {
                        const newConsult = {
                          id: `consult-${Date.now()}`,
                          query: careTeamInput,
                          timestamp: "Just now",
                          orchestrationSteps: [
                            { agent: "Coordinator AI", action: "Parsed query & fetched Health Memory EHR + Vitals data." },
                            { agent: "Cardiology AI", action: "Analyzed BP (122/81 mmHg) & cardiovascular baseline." },
                            { agent: "Pharmacy AI", action: "Screened drug interactions for Lisinopril 10mg + Metformin 500mg." },
                            { agent: "Metabolic & Nutrition AI", action: "Formulated glycemic strategy for HbA1c 6.6% target." }
                          ],
                          synthesis: `Unified Care Plan for: "${careTeamInput}"\n\n1. 🧠 Coordinator AI: Your query spans Cardiology, Pharmacy, and Nutrition. All three specialists have harmonized recommendations.\n2. 🫀 Cardiology: Baseline cardiovascular parameters are stable. Continue current daily monitoring.\n3. 💊 Pharmacy: No adverse interactions detected between your prescribed regimens. Maintain morning/evening scheduling.\n4. 🥗 Nutrition: Focus on high-fiber carbohydrate distribution and moderate post-meal physical activity.`,
                          status: "Unified Care Plan Generated"
                        };
                        setCareTeamConsultations(prev => [newConsult, ...prev]);
                        setIsCareTeamOrchestrating(false);
                        setCareTeamInput("");
                      }, 1800);
                    }
                  }}
                  placeholder="Ask your AI Care Team (e.g. I have pre-diabetes, high BP, and taking Metformin. What is my plan?)..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 text-white rounded-2xl px-4 py-3.5 text-xs font-medium placeholder-slate-500 outline-none transition-all pr-10"
                />
              </div>

              <button
                onClick={() => {
                  if (!careTeamInput.trim()) return;
                  setIsCareTeamOrchestrating(true);
                  setTimeout(() => {
                    const newConsult = {
                      id: `consult-${Date.now()}`,
                      query: careTeamInput,
                      timestamp: "Just now",
                      orchestrationSteps: [
                        { agent: "Coordinator AI", action: "Parsed query & fetched Health Memory EHR + Vitals data." },
                        { agent: "Cardiology AI", action: "Analyzed BP (122/81 mmHg) & cardiovascular baseline." },
                        { agent: "Pharmacy AI", action: "Screened drug interactions for Lisinopril 10mg + Metformin 500mg." },
                        { agent: "Metabolic & Nutrition AI", action: "Formulated glycemic strategy for HbA1c 6.6% target." }
                      ],
                      synthesis: `Unified Care Plan for: "${careTeamInput}"\n\n1. 🧠 Coordinator AI: Your query spans Cardiology, Pharmacy, and Nutrition. All three specialists have harmonized recommendations.\n2. 🫀 Cardiology: Baseline cardiovascular parameters are stable. Continue current daily monitoring.\n3. 💊 Pharmacy: No adverse interactions detected between your prescribed regimens. Maintain morning/evening scheduling.\n4. 🥗 Nutrition: Focus on high-fiber carbohydrate distribution and moderate post-meal physical activity.`,
                      status: "Unified Care Plan Generated"
                    };
                    setCareTeamConsultations(prev => [newConsult, ...prev]);
                    setIsCareTeamOrchestrating(false);
                    setCareTeamInput("");
                  }, 1800);
                }}
                disabled={isCareTeamOrchestrating || !careTeamInput.trim()}
                className="px-5 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isCareTeamOrchestrating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Orchestrating Agents...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Synthesize Care Plan</span>
                  </>
                )}
              </button>
            </div>

            {/* LIVE ORCHESTRATION PIPELINE ANIMATION */}
            {isCareTeamOrchestrating && (
              <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-2xl space-y-3 animate-pulse">
                <div className="flex items-center justify-between text-xs font-black text-purple-300">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    Coordinator AI Orchestration Pipeline Active
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono">Routing query across 6 agents...</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                  <div className="bg-slate-950 p-2 rounded-xl border border-purple-500/20 text-slate-300 font-bold flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-purple-400 animate-bounce" /> 1. Query Parsing
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-purple-500/20 text-slate-300 font-bold flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-400 animate-pulse" /> 2. Cardiology Check
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-purple-500/20 text-slate-300 font-bold flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5 text-purple-400" /> 3. Pharmacy Screening
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-purple-500/20 text-slate-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> 4. Unified Synthesis
                  </div>
                </div>
              </div>
            )}

            {/* CONSULTATION HISTORY & SYNTHESIZED PLANS */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Synthesized Multi-Specialty Care Plans ({careTeamConsultations.length})
              </h4>

              <div className="space-y-4">
                {careTeamConsultations.map((consult) => (
                  <div
                    key={consult.id}
                    className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4"
                  >
                    {/* Patient Query Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {consult.status}
                        </span>
                        <h4 className="text-sm font-black text-white mt-1">"{consult.query}"</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">{consult.timestamp}</span>
                    </div>

                    {/* Multi-Agent Orchestration Breakdown */}
                    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Agent Orchestration Routing Pipeline:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {consult.orchestrationSteps.map((step, idx) => (
                          <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-start gap-2">
                            <span className="text-purple-400 font-bold shrink-0">● {step.agent}:</span>
                            <span className="text-slate-300">{step.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Synthesized Output */}
                    <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Unified Coordinator Synthesis
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => speakText(consult.synthesis)}
                            className="text-[10px] text-purple-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="h-3 w-3" /> Listen
                          </button>
                          <span>•</span>
                          <button
                            onClick={() => alert("Care plan exported to your PHR PDF & Clinical Record!")}
                            className="text-[10px] text-purple-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3 w-3" /> Export Care Plan
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                        {consult.synthesis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FAMILY HEALTH MANAGEMENT HUB */}
      {activeTab === "family" && (
        <div className="space-y-6">
          {/* TOP HERO BANNER */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/40 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30 shrink-0">
                <Users className="h-8 w-8 animate-pulse text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    CURA Family Suite
                  </span>
                  <span className="text-[9px] font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> HIPAA Consent Verified
                  </span>
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {familyMembersList.length} Connected Profiles
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  Universal Family Health Management & Caregiver Hub
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Unified health oversight for elderly parents, children, and spouse. Real-time vital streams, senior medication adherence guard, cross-generational hereditary disease mapping, and emergency access sharing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Family Member</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="h-4 w-4 text-emerald-400" />
                <span>Share Access Code</span>
              </button>

              <button
                onClick={() => {
                  alert("📲 Family Health Summary Digest sent to registered WhatsApp numbers (+91 98765 43210) with senior vital status & medication reminders!");
                }}
                className="px-3 py-2.5 bg-teal-950/80 hover:bg-teal-900 text-teal-200 border border-teal-500/30 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-teal-400" />
                <span>Send WhatsApp Digest</span>
              </button>
            </div>
          </div>

          {/* FAMILY HEALTH SUMMARY STATS BAR */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Family Roster</span>
                <span className="text-base font-black text-white">{familyMembersList.length} Active Profiles</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Family Health Index</span>
                <span className="text-base font-black text-emerald-400">86.2 / 100</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Dna className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hereditary Risks</span>
                <span className="text-base font-black text-amber-300">3 Traits Mapped</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <Bell className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Alerts</span>
                <span className="text-base font-black text-rose-400">
                  {familyAlertsList.filter(a => !a.acknowledged).length} Unresolved
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 1: REAL-TIME CAREGIVER ALERTS */}
          {familyAlertsList.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-400 animate-pulse" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Real-Time Family Health & Adherence Feed
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {familyAlertsList.filter(a => !a.acknowledged).length} Unacknowledged Alerts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {familyAlertsList.map((alertItem) => (
                  <div
                    key={alertItem.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      alertItem.acknowledged
                        ? "bg-slate-950/40 border-slate-850 opacity-60"
                        : alertItem.severity === "high"
                        ? "bg-rose-950/30 border-rose-500/40 shadow-lg shadow-rose-950/20"
                        : "bg-amber-950/30 border-amber-500/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              alertItem.severity === "high"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {alertItem.severity}
                          </span>
                          <span className="text-xs font-bold text-white">{alertItem.memberName}</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-100">{alertItem.title}</h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{alertItem.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono block mt-1">{alertItem.time}</span>
                      </div>

                      {!alertItem.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledgeAlert(alertItem.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold shrink-0 transition cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledge
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: CONNECTED FAMILY MEMBERS ROSTER */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  Connected Family Member Roster
                </h3>
                <p className="text-xs text-slate-400">
                  Click on any family member to inspect detailed vitals, medications, and clinical records.
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
                {familyMembersList.length} Linked Profiles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembersList.map((member) => (
                <div
                  key={member.id}
                  className={`bg-slate-900/90 border rounded-3xl p-5 space-y-4 transition-all hover:border-emerald-500/50 hover:shadow-xl ${
                    selectedMemberForDetail === member.id
                      ? "border-emerald-500 shadow-2xl shadow-emerald-950/40 ring-2 ring-emerald-500/30"
                      : "border-slate-800"
                  }`}
                >
                  {/* MEMBER HEADER */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${member.avatarColor} text-white font-black text-base flex items-center justify-center shadow-md shrink-0`}>
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{member.name}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                            {member.relation}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {member.age} yrs • {member.gender}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Health Score</span>
                      <span className={`text-base font-black ${
                        member.healthScore >= 90 ? "text-emerald-400" : member.healthScore >= 75 ? "text-amber-300" : "text-rose-400"
                      }`}>
                        {member.healthScore}/100
                      </span>
                    </div>
                  </div>

                  {/* ACTIVE DIAGNOSES / CONDITIONS */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Active Diagnoses</span>
                    <div className="flex flex-wrap gap-1">
                      {member.conditions.map((cond, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* LIVE VITALS MINI GRID */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-850 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-bold">Blood Pressure</span>
                      <span className="font-mono text-white font-bold">{member.vitals.bp}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-bold">Heart Rate</span>
                      <span className="font-mono text-emerald-400 font-bold">{member.vitals.hr} bpm</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-bold">Blood Glucose</span>
                      <span className="font-mono text-amber-300 font-bold">{member.vitals.glucose}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-bold">SpO2 Level</span>
                      <span className="font-mono text-cyan-300 font-bold">{member.vitals.oxygen}%</span>
                    </div>
                  </div>

                  {/* MEDICATION ADHERENCE PROGRESS BAR */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Rx Adherence</span>
                      <span className={member.adherence >= 90 ? "text-emerald-400" : "text-amber-400"}>
                        {member.adherence}% On Track
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          member.adherence >= 90 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-amber-500 to-rose-400"
                        }`}
                        style={{ width: `${member.adherence}%` }}
                      />
                    </div>
                  </div>

                  {/* ACCESS PERMISSION LEVEL FOOTER */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">{member.accessLevel}</span>
                    <span className="text-slate-500 font-mono">Last active: {member.lastActive}</span>
                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setSelectedMemberForDetail(selectedMemberForDetail === member.id ? null : member.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        selectedMemberForDetail === member.id
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {selectedMemberForDetail === member.id ? "Close Records" : "View Records"}
                    </button>

                    <button
                      onClick={() => {
                        alert(`📲 Sent automated WhatsApp health check & medication reminder to ${member.name} at ${member.phone}`);
                      }}
                      className="py-2 px-3 bg-teal-950/80 hover:bg-teal-900 border border-teal-500/30 text-teal-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Remind Rx
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DETAILED INSPECTION DRAWER / PANEL FOR SELECTED MEMBER */}
          {selectedMemberForDetail && (() => {
            const detailMember = familyMembersList.find(m => m.id === selectedMemberForDetail);
            if (!detailMember) return null;

            return (
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 border-2 border-emerald-500/50 p-6 rounded-3xl space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${detailMember.avatarColor} text-white font-black text-lg flex items-center justify-center shadow-lg`}>
                      {detailMember.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        {detailMember.name}'s Clinical Health File
                        <span className="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                          {detailMember.relation}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Phone: {detailMember.phone} • Access Level: <strong className="text-emerald-300">{detailMember.accessLevel}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMemberForDetail(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Close Inspection
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* PHR DIAGNOSTIC MEMORY */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <FileText className="h-4 w-4" /> Active Diagnoses & Notes
                    </h4>
                    <ul className="space-y-1.5 text-slate-200">
                      {detailMember.conditions.map((c, i) => (
                        <li key={i} className="bg-slate-900 p-2 rounded-xl border border-slate-850 flex items-center justify-between">
                          <span>{c}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Confirmed</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ACTIVE PRESCRIPTIONS */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-teal-300 flex items-center gap-1.5">
                      <Pill className="h-4 w-4" /> Daily Medication Schedule
                    </h4>
                    <div className="space-y-1.5 text-slate-200">
                      <div className="p-2 bg-slate-900 rounded-xl border border-slate-850 flex items-center justify-between">
                        <div>
                          <strong className="block text-white">Metformin 500mg ER</strong>
                          <span className="text-[10px] text-slate-400">1 Tab Morning & Evening</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded">92% Taken</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-xl border border-slate-850 flex items-center justify-between">
                        <div>
                          <strong className="block text-white">Lisinopril 10mg</strong>
                          <span className="text-[10px] text-slate-400">1 Tab Morning</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded">100% Taken</span>
                      </div>
                    </div>
                  </div>

                  {/* CAREGIVER NOTES & PERMISSIONS */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> Caregiver Consent Audit
                    </h4>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Signed digital HIPAA consent active. Full caregiver permissions granted to Rajesh Kumar for EMR lab view, pharmacy order dispatch, and specialist appointment scheduling.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Consent Ref: CN-990812</span>
                      <span className="text-emerald-400 font-bold">Valid & Enforced</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SECTION 3: AI CROSS-GENERATIONAL HEREDITARY DISEASE RISK MATRIX */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Dna className="h-5 w-5 text-amber-400 animate-pulse" />
                  AI Cross-Generational Hereditary & Genomic Risk Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  CURA analyzes multi-generational clinical diagnostic graphs to predict hereditary disease transmission and construct preventive screening protocols for younger family members.
                </p>
              </div>

              <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-xl">
                Genomic Tree Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-black rounded uppercase">
                    Paternal Lineage
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">2 Generations Affected</span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white">Essential Hypertension & Coronary Risk</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Present in Ramesh Kumar (Father, 82) and Rajesh Kumar (Self, 58).
                  </p>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-850 space-y-1 text-xs">
                  <span className="text-[10px] text-rose-400 font-bold block">10-Year Predicted Risk for Son (Aarav, 22yo):</span>
                  <p className="text-white font-black text-sm">28% Probability of Early Onset</p>
                  <p className="text-[10px] text-slate-400">Genomic Marker: AGTR1 & ADD1 Polymorphism</p>
                </div>

                <div className="text-xs space-y-1">
                  <strong className="text-emerald-300 text-[11px] block">AI Preventive Protocol:</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Annual baseline Lipid Panel + DASH low-sodium nutrition guidelines starting at age 25.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-black rounded uppercase">
                    Metabolic Pattern
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">2 Generations Affected</span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white">Type 2 Diabetes Mellitus & Insulin Resistance</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Diagnosed in Ramesh Kumar (Father); Pre-Diabetes (HbA1c 6.6%) in Rajesh (Self).
                  </p>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-850 space-y-1 text-xs">
                  <span className="text-[10px] text-amber-400 font-bold block">Lifetime Family Transmission Score:</span>
                  <p className="text-white font-black text-sm">74% High Risk Correlation</p>
                  <p className="text-[10px] text-slate-400">Genomic Marker: TCF7L2 & PPARG Variant</p>
                </div>

                <div className="text-xs space-y-1">
                  <strong className="text-emerald-300 text-[11px] block">AI Preventive Protocol:</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    14-Day Continuous Glucose Monitor (CGM) trial for Rajesh; bi-annual HbA1c screening for family.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-black rounded uppercase">
                    Maternal Lineage
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">1 Generation Mapped</span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white">Hypothyroidism & Post-Menopausal Osteoporosis</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Diagnosed in Sunita Devi (Mother, 78).
                  </p>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-850 space-y-1 text-xs">
                  <span className="text-[10px] text-cyan-400 font-bold block">Bone Densitometry Screening Priority:</span>
                  <p className="text-white font-black text-sm">Moderate Female Lineage Risk</p>
                  <p className="text-[10px] text-slate-400">Genomic Marker: VDR (Vitamin D Receptor) Variant</p>
                </div>

                <div className="text-xs space-y-1">
                  <strong className="text-emerald-300 text-[11px] block">AI Preventive Protocol:</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Baseline DEXA bone densitometry for Spouse Priya at age 55 + Vitamin D3/K2 protocol.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MODAL 1: ADD FAMILY MEMBER */}
          {isAddMemberModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-base font-black text-white">Add New Family Member</h3>
                  </div>
                  <button
                    onClick={() => setIsAddMemberModalOpen(false)}
                    className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Kumar"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Relationship</label>
                      <select
                        value={newMemberRelation}
                        onChange={(e) => setNewMemberRelation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Grandparent">Grandparent</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Age (Years)</label>
                      <input
                        type="number"
                        required
                        value={newMemberAge}
                        onChange={(e) => setNewMemberAge(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Gender</label>
                      <select
                        value={newMemberGender}
                        onChange={(e) => setNewMemberGender(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">Access Permission Level</label>
                      <select
                        value={newMemberAccess}
                        onChange={(e) => setNewMemberAccess(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Full Manager">Full Caregiver Access</option>
                        <option value="View-Only">View-Only Records</option>
                        <option value="Emergency Guardian">Emergency Guardian Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">Known Medical Conditions (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Hypertension, Diabetes, Asthma"
                      value={newMemberConditions}
                      onChange={(e) => setNewMemberConditions(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">Phone Number for Reminders</label>
                    <input
                      type="text"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddMemberModalOpen(false)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl cursor-pointer shadow-lg shadow-emerald-600/30"
                    >
                      Save & Link Family Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: SHARE ACCESS PORTAL */}
          {isShareModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-base font-black text-white">Family Access Share Portal</h3>
                  </div>
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Share this secure single-use access code with your family member or caregiver to link their CURA app profile.
                </p>

                <div className="p-4 bg-slate-950 rounded-2xl border-2 border-emerald-500/40 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Secure Family Access Token</span>
                  <div className="text-xl font-mono font-black text-emerald-400 tracking-wider">
                    {generatedShareCode}
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono block">Expires in 72 Hours • Single Use</span>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-center gap-2">
                  <QrCode className="h-16 w-16 text-emerald-400" />
                  <div className="text-left text-xs">
                    <strong className="text-white block font-bold">QR Code Scanner Active</strong>
                    <span className="text-[11px] text-slate-400">Scan from family member's CURA mobile app to authorize instantly.</span>
                  </div>
                </div>

                {shareCodeSuccessMessage && (
                  <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300">
                    {shareCodeSuccessMessage}
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedShareCode);
                      setShareCodeSuccessMessage("✓ Access token copied to clipboard!");
                      setTimeout(() => setShareCodeSuccessMessage(""), 3000);
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                  >
                    Copy Access Token
                  </button>
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: AI DOCTOR DISCOVERY & APPOINTMENT BOOKING */}
      {activeTab === "discovery" && (
        <DoctorDiscovery
          patientId={patientId}
          patientName={patientName}
        />
      )}

      {/* TAB: AI REMOTE MONITORING & WEARABLES ECOSYSTEM */}
      {activeTab === "wearables" && (
        <div className="space-y-6">
          {/* TOP HERO BANNER */}
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border-2 border-rose-500/40 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-rose-500/20 text-rose-300 rounded-2xl border border-rose-500/30 shrink-0">
                <Watch className="h-8 w-8 animate-pulse text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Live Telemetry & Wearable Hub
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <Bluetooth className="h-3 w-3" /> BLE 5.3 & Wi-Fi Active
                  </span>
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    4 Devices Paired
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  AI Remote Health Monitoring & Wearable Ecosystem
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Real-time physiological streaming from smartwatches, continuous glucose monitors (CGM), wireless BP cuffs, and bio-impedance scales into CURA’s predictive intelligence engine.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => {
                  setIsSyncingWearables(true);
                  setTimeout(() => {
                    setLiveVitalsData(prev => ({
                      ...prev,
                      heartRate: Math.floor(68 + Math.random() * 12),
                      glucose: Math.floor(105 + Math.random() * 20),
                      spo2: parseFloat((98 + Math.random() * 1.5).toFixed(1)),
                      stepsToday: prev.stepsToday + 120
                    }));
                    setIsSyncingWearables(false);
                    setWearableSyncSuccess("Live telemetry synced across all 4 paired devices!");
                    setTimeout(() => setWearableSyncSuccess(null), 4000);
                  }, 1200);
                }}
                disabled={isSyncingWearables}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSyncingWearables ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Syncing Sensors...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Sync Live Telemetry</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  const newAlert = {
                    id: `alt-${Date.now()}`,
                    severity: "warning",
                    title: "Live Wearable Stress Spike (HRV Drop)",
                    message: `Heart rate reached ${liveVitalsData.heartRate + 18} bpm with temporary HRV drop to 28ms during activity.`,
                    time: "Just now",
                    action: "AI suggests 3-min diaphragmatic calm breathing exercise."
                  };
                  setWearableAlerts(prev => [newAlert, ...prev]);
                  alert("Simulated Live Wearable Anomaly! Check active warnings below.");
                }}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-300 font-extrabold text-xs rounded-xl border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Activity className="h-4 w-4" />
                <span>Simulate Anomaly</span>
              </button>
            </div>
          </div>

          {/* SYNC SUCCESS BANNER */}
          {wearableSyncSuccess && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-3.5 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{wearableSyncSuccess}</span>
            </div>
          )}

          {/* LIVE VITALS CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Heart Rate */}
            <div className="bg-slate-900/80 border border-rose-500/30 p-4 rounded-3xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Heart Rate</span>
                <Heart className="h-4 w-4 text-rose-400 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{liveVitalsData.heartRate}</span>
                <span className="text-xs font-bold text-rose-400">BPM</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Normal Resting Pace
              </p>
            </div>

            {/* Continuous Glucose */}
            <div className="bg-slate-900/80 border border-emerald-500/30 p-4 rounded-3xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">CGM Glucose</span>
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{liveVitalsData.glucose}</span>
                <span className="text-xs font-bold text-emerald-400">mg/dL</span>
              </div>
              <p className="text-[10px] text-slate-300 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" /> Dexcom G7 • Stable
              </p>
            </div>

            {/* Blood Pressure */}
            <div className="bg-slate-900/80 border border-sky-500/30 p-4 rounded-3xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Blood Pressure</span>
                <Stethoscope className="h-4 w-4 text-sky-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-white">{liveVitalsData.bpSystolic}/{liveVitalsData.bpDiastolic}</span>
                <span className="text-xs font-bold text-sky-400">mmHg</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Omron Verified
              </p>
            </div>

            {/* SpO2 Blood Oxygen */}
            <div className="bg-slate-900/80 border border-indigo-500/30 p-4 rounded-3xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Blood Oxygen</span>
                <Zap className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{liveVitalsData.spo2}%</span>
                <span className="text-xs font-bold text-indigo-400">SpO2</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Optimal Aeration
              </p>
            </div>

            {/* Daily Steps */}
            <div className="bg-slate-900/80 border border-amber-500/30 p-4 rounded-3xl space-y-2 relative overflow-hidden col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Daily Activity</span>
                <Footprints className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{liveVitalsData.stepsToday.toLocaleString()}</span>
                <span className="text-xs font-bold text-amber-400">Steps</span>
              </div>
              <p className="text-[10px] text-amber-300 font-semibold">
                84% of 10,000 Step Goal
              </p>
            </div>
          </div>

          {/* PAIRED WEARABLES REGISTRY & LIVE ALERTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registered Devices List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Watch className="h-4 w-4 text-rose-400" /> Paired Wearables & Remote Monitors ({wearableDevices.length})
                </h3>
                <button
                  onClick={() => {
                    const devName = prompt("Enter new device name (e.g. Oura Ring Gen 3, Garmin Fenix 7):");
                    if (devName) {
                      const newDev = {
                        id: `dev-${Date.now()}`,
                        name: devName,
                        type: "Smart Sensor",
                        status: "Connected (BLE)",
                        battery: "95%",
                        lastSync: "Just now",
                        metrics: ["Biometric Telemetry"],
                        iconColor: "text-purple-400"
                      };
                      setWearableDevices(prev => [...prev, newDev]);
                      alert(`Successfully paired ${devName}!`);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Pair New Sensor
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wearableDevices.map((dev) => (
                  <div
                    key={dev.id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/30 rounded-3xl p-4 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          {dev.type}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                          <Bluetooth className="h-3 w-3" /> {dev.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white">{dev.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        Sync: <strong className="text-slate-200">{dev.lastSync}</strong> | Battery: <strong className="text-slate-200">{dev.battery}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                      <div className="flex gap-1 flex-wrap">
                        {dev.metrics.slice(0, 3).map((m, idx) => (
                          <span key={idx} className="bg-slate-950 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                            {m}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => alert(`Device Telemetry Diagnostics for ${dev.name}:\n\nStatus: ${dev.status}\nBattery Level: ${dev.battery}\nLast Packet: ${dev.lastSync}`)}
                        className="text-rose-400 font-bold hover:underline cursor-pointer"
                      >
                        Info
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Wearable Anomalies & Early Warnings */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Live AI Telemetry Alerts
              </h3>

              <div className="space-y-3">
                {wearableAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-4 rounded-3xl border space-y-2 ${
                      alt.severity === "warning"
                        ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                        : alt.severity === "info"
                        ? "bg-blue-950/30 border-blue-500/40 text-blue-200"
                        : "bg-slate-900/80 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-current/20">
                        {alt.severity}
                      </span>
                      <span className="text-[10px] text-slate-400">{alt.time}</span>
                    </div>

                    <h4 className="text-xs font-black text-white">{alt.title}</h4>
                    <p className="text-[11px] leading-relaxed opacity-90">{alt.message}</p>

                    <div className="pt-2 border-t border-current/10 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span>{alt.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AI PERSONAL HEALTH RECORD (PHR) & ABHA VAULT */}
      {activeTab === "phr" && (
        <div className="space-y-6">
          {/* TOP HERO BANNER */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-500/40 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-500/20 text-blue-300 rounded-2xl border border-blue-500/30 shrink-0">
                <FileText className="h-8 w-8 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    ABHA Integrated PHR Vault
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> ABHA ID: 91-8823-9912-3001
                  </span>
                  <span className="text-[9px] font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Blood: O+ Positive
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  AI Personal Health Record (PHR) System
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Unified longitudinal health repository organizing your diagnostic reports, prescriptions, clinical notes, vaccines, and insurance into structured AI intelligence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => setShowAbhaModal(true)}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-300 font-extrabold text-xs rounded-xl border border-blue-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>ABHA Card</span>
              </button>

              <label className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>{isUploadingPhrDoc ? "AI Extracting..." : "+ Upload Report / Document"}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploadingPhrDoc(true);
                      setTimeout(() => {
                        const newRecord = {
                          id: `phr-${Date.now()}`,
                          category: "reports",
                          title: file.name.replace(/\.[^/.]+$/, ""),
                          source: "Uploaded Medical Document",
                          date: "Just now",
                          summary: "AI extracted key parameters: Normal sinus rhythm, Blood Glucose 112 mg/dL, No acute abnormalities detected.",
                          status: "OCR Processed & ABHA Synced",
                          tags: ["Uploaded", "AI Extracted"],
                          fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                          flag: "normal"
                        };
                        setPhrRecords(prev => [newRecord, ...prev]);
                        setIsUploadingPhrDoc(false);
                        setPhrUploadSuccessMessage(`Successfully processed & categorized "${file.name}"!`);
                        setTimeout(() => setPhrUploadSuccessMessage(null), 5000);
                      }, 1800);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* UPLOAD SUCCESS BANNER */}
          {phrUploadSuccessMessage && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-3.5 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{phrUploadSuccessMessage}</span>
            </div>
          )}

          {/* PHR CATEGORY QUICK STATS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { id: "all", label: "All Records", count: phrRecords.length, icon: FileText, color: "text-blue-400" },
              { id: "reports", label: "Lab Reports", count: phrRecords.filter(r => r.category === "reports").length, icon: Activity, color: "text-teal-400" },
              { id: "prescriptions", label: "Prescriptions", count: phrRecords.filter(r => r.category === "prescriptions").length, icon: Pill, color: "text-purple-400" },
              { id: "diagnoses", label: "Diagnoses", count: phrRecords.filter(r => r.category === "diagnoses").length, icon: Stethoscope, color: "text-amber-400" },
              { id: "vaccines", label: "Vaccines", count: phrRecords.filter(r => r.category === "vaccines").length, icon: Syringe, color: "text-emerald-400" },
              { id: "allergies", label: "Allergies", count: phrRecords.filter(r => r.category === "allergies").length, icon: AlertTriangle, color: "text-rose-400" },
              { id: "family", label: "Family History", count: 2, icon: Users, color: "text-sky-400" },
              { id: "insurance", label: "Insurance", count: phrRecords.filter(r => r.category === "insurance").length, icon: Shield, color: "text-indigo-400" }
            ].map((cat) => {
              const IconComp = cat.icon;
              const isActive = phrActiveFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setPhrActiveFilter(cat.id as any)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                    isActive
                      ? "bg-blue-900/40 border-blue-500 text-white shadow-lg shadow-blue-500/10 scale-[1.02]"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  <IconComp className={`h-5 w-5 ${cat.color}`} />
                  <span className="text-[11px] font-black leading-tight block">{cat.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={phrSearchQuery}
                onChange={(e) => setPhrSearchQuery(e.target.value)}
                placeholder="Search PHR records by doctor, drug, or test..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
              <span className="text-slate-400 font-semibold text-[10px]">Showing {phrRecords.filter(r => (phrActiveFilter === "all" || r.category === phrActiveFilter) && (r.title.toLowerCase().includes(phrSearchQuery.toLowerCase()) || r.summary.toLowerCase().includes(phrSearchQuery.toLowerCase()))).length} items</span>
              <button
                onClick={() => {
                  const doc = new jsPDF();
                  doc.setFillColor(15, 23, 42);
                  doc.rect(0, 0, 210, 35, "F");
                  doc.setTextColor(255, 255, 255);
                  doc.setFontSize(16);
                  doc.text("CURA - OFFICIAL PERSONAL HEALTH RECORD (PHR)", 14, 20);
                  doc.setFontSize(10);
                  doc.text(`Patient: ${patientName} | ABHA ID: 91-8823-9912-3001 | Date: ${new Date().toLocaleDateString()}`, 14, 28);
                  
                  let y = 45;
                  doc.setTextColor(15, 23, 42);
                  phrRecords.forEach((rec, idx) => {
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.text(`${idx + 1}. [${rec.category.toUpperCase()}] ${rec.title}`, 14, y);
                    y += 6;
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "normal");
                    doc.text(`Source: ${rec.source} | Date: ${rec.date} | Status: ${rec.status}`, 18, y);
                    y += 5;
                    const splitSummary = doc.splitTextToSize(`Summary: ${rec.summary}`, 175);
                    doc.text(splitSummary, 18, y);
                    y += splitSummary.length * 5 + 4;
                  });
                  doc.save(`CURA_PHR_Record_${patientName.replace(/\s+/g, "_")}.pdf`);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export PHR PDF</span>
              </button>
            </div>
          </div>

          {/* RECORDS LIST */}
          <div className="space-y-3">
            {phrRecords
              .filter(r => (phrActiveFilter === "all" || r.category === phrActiveFilter) && (r.title.toLowerCase().includes(phrSearchQuery.toLowerCase()) || r.summary.toLowerCase().includes(phrSearchQuery.toLowerCase())))
              .map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shrink-0 mt-0.5">
                      {rec.category === "reports" && <Activity className="h-5 w-5 text-teal-400" />}
                      {rec.category === "prescriptions" && <Pill className="h-5 w-5 text-purple-400" />}
                      {rec.category === "diagnoses" && <Stethoscope className="h-5 w-5 text-amber-400" />}
                      {rec.category === "vaccines" && <Syringe className="h-5 w-5 text-emerald-400" />}
                      {rec.category === "allergies" && <AlertTriangle className="h-5 w-5 text-rose-400" />}
                      {rec.category === "insurance" && <Shield className="h-5 w-5 text-indigo-400" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-white">{rec.title}</h3>
                        <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {rec.status}
                        </span>
                        {rec.flag === "elevated" && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Attention Flag
                          </span>
                        )}
                        {rec.flag === "critical" && (
                          <span className="text-[10px] font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            Critical Allergy
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        {rec.summary}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 flex-wrap">
                        <span>🏥 Source: <strong className="text-slate-200">{rec.source}</strong></span>
                        <span>•</span>
                        <span>📅 Date: <strong className="text-slate-200">{rec.date}</strong></span>
                        <span>•</span>
                        <span>📎 {rec.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => alert(`AI Summary for ${rec.title}:\n\n${rec.summary}\n\nVerified & synced with ABHA health repository.`)}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 transition-all cursor-pointer"
                    >
                      AI Summary
                    </button>
                    <button
                      onClick={() => alert(`Downloading official original document: ${rec.title}`)}
                      className="p-2 bg-slate-950 hover:bg-slate-800 text-blue-400 rounded-xl border border-slate-800 transition-all cursor-pointer"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* ABHA QR CODE MODAL */}
          {showAbhaModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border-2 border-blue-500/40 p-6 rounded-3xl max-w-md w-full space-y-4 relative shadow-2xl animate-scale-up">
                <button
                  onClick={() => setShowAbhaModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>

                <div className="text-center space-y-2">
                  <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    National Health Authority - Ayushman Bharat
                  </span>
                  <h3 className="text-lg font-black text-white">Digital ABHA Health Card</h3>
                  <p className="text-xs text-slate-400">Scan at any empaneled clinic or hospital for instant record sync</p>
                </div>

                <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 text-slate-950">
                  <div className="w-48 h-48 bg-slate-950 rounded-xl p-3 flex items-center justify-center border-4 border-blue-600">
                    {/* Simulated QR Pattern */}
                    <div className="grid grid-cols-6 gap-1 w-full h-full">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${i % 2 === 0 || i % 5 === 0 ? "bg-white" : "bg-blue-500"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-center space-y-0.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">ABHA Address</span>
                    <p className="text-sm font-black text-blue-900 font-mono">rajeshkumar@abha</p>
                    <p className="text-xs font-bold text-slate-700">ABHA Number: 91-8823-9912-3001</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                  🔒 Encrypted with NDHM 256-bit Health Data Exchange Protocol.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: AI DOCTOR VISIT PREPARATION ENGINE */}
      {activeTab === "visit_prep" && (
        <div className="space-y-6">
          {/* TOP HERO BANNER & QUICK ACTIONS */}
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border-2 border-teal-500/40 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-500/30 shrink-0">
                <Stethoscope className="h-8 w-8 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    Patient Pre-Consultation Engine
                  </span>
                  <span className="text-[9px] font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Auto-Synced to Doctor View
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  AI Doctor Visit Preparation Hub
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Prepare for your next consultation with organized chief complaints, custom questions for the doctor, pre-visit checklist, and a 1-click summary PDF.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={handleToggleVoiceSummary}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 border cursor-pointer ${
                  isSpeakingVoiceSummary
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg animate-pulse"
                    : "bg-slate-800 text-teal-300 border-teal-500/30 hover:bg-slate-700"
                }`}
              >
                <Volume2 className="h-4 w-4" />
                <span>{isSpeakingVoiceSummary ? "Stop Voice Briefing" : "🎤 Listen to Voice Briefing"}</span>
              </button>

              <button
                onClick={handleGenerateVisitSummaryPDF}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>📄 1-Click Visit Summary PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: CHECKLIST, COMPLAINTS & QUESTIONS */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. APPOINTMENT PREPARATION CHECKLIST */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-teal-400" />
                    <h3 className="text-sm font-black text-white">📅 Appointment Preparation Checklist</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                    {prepChecklist.filter(c => c.checked).length} of {prepChecklist.length} Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {prepChecklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPrepChecklist(prev =>
                          prev.map(c => c.id === item.id ? { ...c, checked: !c.checked } : c)
                        );
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        item.checked
                          ? "bg-teal-950/30 border-teal-500/40 text-slate-200"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {item.checked ? (
                        <CheckSquare className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs font-semibold leading-tight ${item.checked ? "line-through text-slate-300" : ""}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. CHIEF COMPLAINTS & SYMPTOMS LOG */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    <h3 className="text-sm font-black text-white">🩺 Chief Complaints & Recent Symptoms</h3>
                  </div>
                  <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Shared with Doctor
                  </span>
                </div>

                <textarea
                  value={chiefComplaintNote}
                  onChange={(e) => setChiefComplaintNote(e.target.value)}
                  placeholder="Describe your current symptoms, how long you've felt them, and what makes them better or worse..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 min-h-[90px] resize-y font-sans"
                />
              </div>

              {/* 3. QUESTIONS TO ASK THE DOCTOR */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-black text-white">📋 Questions to Ask the Doctor</h3>
                      <p className="text-[10px] text-slate-400">AI-generated & custom questions for your visit</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                    {questionsForDoctor.filter(q => q.asked).length} / {questionsForDoctor.length} Discussed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {questionsForDoctor.map((q, idx) => (
                    <div
                      key={q.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        q.asked
                          ? "bg-slate-950/80 border-slate-800 opacity-60"
                          : "bg-slate-950 border-slate-800 hover:border-amber-500/40 text-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => {
                            setQuestionsForDoctor(prev =>
                              prev.map(item => item.id === q.id ? { ...item, asked: !item.asked } : item)
                            );
                          }}
                          className="mt-0.5 cursor-pointer"
                        >
                          {q.asked ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-slate-600 shrink-0" />
                          )}
                        </button>
                        <div>
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">Question #{idx + 1}</span>
                          <p className={`text-xs font-semibold mt-0.5 ${q.asked ? "line-through text-slate-500" : "text-slate-200"}`}>
                            {q.text}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setQuestionsForDoctor(prev => prev.filter(item => item.id !== q.id));
                        }}
                        className="text-slate-500 hover:text-rose-400 text-xs font-bold px-2 py-1 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Question */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newQuestionInput}
                    onChange={(e) => setNewQuestionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newQuestionInput.trim()) {
                        setQuestionsForDoctor(prev => [
                          ...prev,
                          { id: `q-${Date.now()}`, text: newQuestionInput.trim(), asked: false }
                        ]);
                        setNewQuestionInput("");
                      }
                    }}
                    placeholder="Type a custom question for your doctor..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      if (newQuestionInput.trim()) {
                        setQuestionsForDoctor(prev => [
                          ...prev,
                          { id: `q-${Date.now()}`, text: newQuestionInput.trim(), asked: false }
                        ]);
                        setNewQuestionInput("");
                      }
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: REPORTS, MEDS & ALERTS */}
            <div className="space-y-6">
              {/* 📊 MEDICAL REPORT INTELLIGENCE */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-teal-400" />
                    <h3 className="text-sm font-black text-white">📊 Medical Report Intelligence</h3>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    Latest Lab
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase">HbA1c (Glycated Hemoglobin)</span>
                      <p className="text-sm font-black text-white mt-0.5">6.6% <span className="text-xs font-normal text-amber-300">(Pre-Diabetic Range)</span></p>
                    </div>
                    <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-lg">
                      Elevated
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Fasting Blood Sugar</span>
                      <p className="text-sm font-black text-white mt-0.5">118 mg/dL</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg">
                      Controlled
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Serum Creatinine</span>
                      <p className="text-sm font-black text-white mt-0.5">0.9 mg/dL <span className="text-xs font-normal text-slate-400">(eGFR &gt;90)</span></p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg">
                      Optimal
                    </span>
                  </div>
                </div>
              </div>

              {/* 💊 MEDICATION TRACKER & REMINDERS */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-black text-white">💊 Medication Tracker</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    94% Adherence
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white">Lisinopril 10mg</h4>
                      <span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">1 Tab / Day</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Take in morning with water. Blood pressure control.</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white">Metformin 500mg SR</h4>
                      <span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">2 Tabs / Day</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Take after lunch and dinner. Glycemic regulation.</p>
                  </div>
                </div>
              </div>

              {/* ⚠️ ALERTS AND REMINDERS */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-rose-400" />
                    <h3 className="text-sm font-black text-white">⚠️ Active Alerts & Reminders</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start gap-2">
                    <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-amber-300 block">Refill Reminder</span>
                      <span>Lisinopril 10mg running low (4 tablets remaining). Order refill.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-950/30 border border-teal-500/30 rounded-2xl text-xs text-teal-200 flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-teal-300 block">Upcoming Appointment</span>
                      <span>Cardiology Follow-up scheduled for tomorrow at 10:30 AM.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: 24/7 CURA HEALTH ASSISTANT */}
      {activeTab === "companion" && (
        <div className="space-y-6">
          {/* TOP HERO BANNER FOR CURA HEALTH ASSISTANT */}
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/40 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/30 shrink-0">
                <Brain className="h-8 w-8 animate-pulse text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    CURA Unified AI Engine
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Context: Health Memory + PHR + Vitals
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  CURA Health Assistant — One AI, Multi-Expertise Intelligence
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Ask any question about your symptoms, lab reports, prescriptions, or diet. CURA dynamically routes queries through specialized clinical reasoning engines while staying aware of your personal medical history.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <div className="px-3 py-2 bg-slate-950/80 rounded-2xl border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">Active Context</span>
                <span className="text-xs font-bold text-purple-300">14 Memory Events • 6 PHR Docs</span>
              </div>
            </div>
          </div>

          {/* MULTI-EXPERTISE ROUTING CATEGORY BAR */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider shrink-0 px-2">
              Routing Capabilities:
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {[
                { label: "🩺 General Medicine", prompt: "Summarize my overall health status and recent vitals." },
                { label: "🫀 Cardiology", prompt: "Explain my blood pressure readings and heart risk factors." },
                { label: "💊 Pharmacy & Meds", prompt: "Do my Lisinopril and Metformin prescriptions have any conflicts?" },
                { label: "🥗 Nutrition & Diet", prompt: "What diet plan is best for my HbA1c 6.6% pre-diabetes result?" },
                { label: "🧠 Mental Wellness", prompt: "Provide breathing techniques and stress guidance." }
              ].map((exp, idx) => (
                <button
                  key={idx}
                  onClick={() => setChatInput(exp.prompt)}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-purple-300 hover:text-white border border-purple-500/20 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span>{exp.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chat Interface */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col h-[600px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">CURA Health Assistant</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Auto-routing queries to specialized medical modules</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Live Context Active
                </span>
              </div>

              {/* Messages Box */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 ${
                        m.sender === "user"
                          ? "bg-purple-600 text-white rounded-br-none shadow-md"
                          : "bg-slate-850 border border-slate-750 text-slate-200 rounded-bl-none shadow-md"
                      }`}
                    >
                      {m.sender === "ai" && (
                        <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-700/50 text-[10px] font-extrabold text-purple-300">
                          <Sparkles className="h-3 w-3 text-purple-400" />
                          <span>CURA AI Engine • {m.text.toLowerCase().includes("bp") || m.text.toLowerCase().includes("blood pressure") ? "Cardiology Reasoning" : m.text.toLowerCase().includes("metformin") || m.text.toLowerCase().includes("drug") ? "Pharmacy Reasoning" : "Clinical Context Reasoning"}</span>
                        </div>
                      )}
                      <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {m.text}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[9px] opacity-70">
                        <span>{m.timestamp}</span>
                        {m.sender === "ai" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert("Marked as helpful feedback!")}
                              className="hover:text-emerald-300 transition-all flex items-center gap-0.5 cursor-pointer"
                              title="Helpful"
                            >
                              👍 Helpful
                            </button>
                            <span>•</span>
                            <button
                              onClick={() => speakText(m.text)}
                              className="hover:text-purple-300 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 className="h-3 w-3" /> Listen
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-850 border border-slate-750 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-xs text-purple-300 font-bold">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                      <span>CURA AI is synthesizing your Health Memory & PHR data...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

            {/* Input Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about your past reports, prescriptions, BP, or diet..."
                className="flex-1 bg-slate-950 border border-slate-800 text-xs font-semibold text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
              />
              <button
                onClick={handleVoiceInput}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? "bg-rose-600 border-rose-500 text-white animate-pulse"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                onClick={handleSendMessage}
                className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Side Context Widgets */}
          <div className="space-y-4">
            {/* Quick Prompts */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4.5 space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" /> Suggested AI Memory Queries
              </h4>
              <div className="space-y-2">
                {[
                  "Why was my cholesterol high in my last lab report?",
                  "When did my dry cough symptoms start?",
                  "Summarize my diabetes & BP progression over the past year.",
                  "Can I take Metformin before bedtime or with meals?"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setChatInput(prompt);
                    }}
                    className="w-full text-left p-2.5 bg-slate-950/60 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-purple-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Health Memory Quick Card */}
            <div className="bg-gradient-to-br from-purple-950/30 to-slate-900 border border-purple-500/20 rounded-3xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider">Health Snapshot</h4>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Optimal</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Latest BP</span>
                  <p className="font-extrabold text-white">128/82 mmHg</p>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">HbA1c</span>
                  <p className="font-extrabold text-amber-400">6.6%</p>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Heart Rate</span>
                  <p className="font-extrabold text-rose-400">72 bpm</p>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Active Meds</span>
                  <p className="font-extrabold text-purple-300">2 Daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB 2: LIFETIME HEALTH MEMORY TIMELINE */}
      {activeTab === "memory" && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search every symptom, diagnosis, lab result or doctor note..."
                className="w-full bg-slate-950 border border-slate-800 text-xs font-semibold text-white placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {["all", "symptom", "diagnosis", "medication", "lab", "consultation"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                    selectedFilter === filter
                      ? "bg-purple-600 text-white"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline List */}
          <div className="relative border-l-2 border-purple-500/30 ml-4 sm:ml-6 pl-4 sm:pl-6 space-y-6">
            {filteredMemories.map((m) => (
              <div key={m.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[23px] sm:-left-[31px] top-1.5 h-4 w-4 rounded-full bg-slate-950 border-2 border-purple-500 group-hover:scale-125 transition-all" />

                <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 p-4 sm:p-5 rounded-2xl transition-all space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                        {m.type}
                      </span>
                      <h4 className="text-sm font-black text-white">{m.title}</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-bold">{m.date}</span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{m.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10.5px] text-slate-400 flex-wrap gap-2">
                    {m.doctor && <span>👨‍⚕️ Provider: <strong className="text-slate-200">{m.doctor}</strong></span>}
                    {m.vitals && <span>📊 Vitals: <strong className="text-emerald-400">{m.vitals}</strong></span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PATIENT DIGITAL TWIN */}
      {activeTab === "digital_twin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-5">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" /> Digital Twin Intervention Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate how lifestyle changes and weight management impact your future BP & glycemic risks.
              </p>
            </div>

            {/* Slider 1: Weight Loss */}
            <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-black">
                <span className="text-slate-300">Weight Reduction Target</span>
                <span className="text-purple-400">{simWeightLoss} kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={simWeightLoss}
                onChange={(e) => setSimWeightLoss(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Every 1 kg of weight loss reduces systolic BP by ~0.8-1.0 mmHg.</p>
            </div>

            {/* Slider 2: Exercise */}
            <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-black">
                <span className="text-slate-300">Daily Aerobic Exercise</span>
                <span className="text-emerald-400">{simExerciseMins} mins/day</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={simExerciseMins}
                onChange={(e) => setSimExerciseMins(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Moderate exercise boosts insulin sensitivity & lowers baseline resting HR.</p>
            </div>

            {/* Diet Selection */}
            <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-black text-slate-300">Dietary Regimen</label>
              <select
                value={simDietStyle}
                onChange={(e) => setSimDietStyle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs font-bold text-white p-2.5 rounded-xl focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="low_sodium">Low Sodium DASH Diet (&lt;2g Sodium/day)</option>
                <option value="mediterranean">Mediterranean High-Fiber & Healthy Fats</option>
                <option value="standard">Standard Balanced Diet</option>
              </select>
            </div>

            <button
              onClick={handleRecalculateDigitalTwin}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              Run Digital Twin Simulation
            </button>
          </div>

          {/* Simulation Output Cards */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 p-5 rounded-3xl space-y-4">
              <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" /> Projected Health Outcomes (6 Months)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Projected Blood Pressure</span>
                  <p className="text-lg font-black text-emerald-400 mt-1">{simRes.projBp}</p>
                  <span className="text-[9px] text-emerald-500 font-bold">✓ Normotensive Target</span>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Projected HbA1c</span>
                  <p className="text-lg font-black text-amber-400 mt-1">{simRes.projHbA1c}</p>
                  <span className="text-[9px] text-amber-500 font-bold">✓ Impaired Risk Reversal</span>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Projected BMI</span>
                  <p className="text-lg font-black text-purple-300 mt-1">{simRes.projBmi}</p>
                  <span className="text-[9px] text-purple-400 font-bold">✓ Normal Weight Range</span>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">10-Year ASCVD Risk</span>
                  <p className="text-sm font-black text-emerald-300 mt-1">{simRes.riskReduction}</p>
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Primary Prevention</span>
                </div>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-[11px] text-purple-200 leading-relaxed">
                <strong>AI Digital Twin Note:</strong> Based on 10,000+ clinical outcome models. Always verify intervention plans with your treating physician before altering prescribed dosages.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRECISION HEALTH & GENOMICS */}
      {activeTab === "precision" && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Microscope className="h-5 w-5 text-purple-400" /> Precision Genomics & Biomarker Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-purple-400">Genomic Risk Marker</span>
                <h4 className="text-sm font-extrabold text-white">TCF7L2 Variant (Het)</h4>
                <p className="text-xs text-slate-400">Moderate genetic predisposition to Type 2 Diabetes. Highly responsive to low-glycemic diets.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-400">Pharmacogenomics</span>
                <h4 className="text-sm font-extrabold text-white">CYP2C9 / VKORC1 Normal</h4>
                <p className="text-xs text-slate-400">Normal metabolic rate for standard cardiovascular and antihypertensive medications.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-400">Biomarker Trend</span>
                <h4 className="text-sm font-extrabold text-white">Vitamin D3: 28 ng/mL</h4>
                <p className="text-xs text-slate-400">Mild insufficiency. Supplementation of 2,000 IU daily advised for optimal immune and metabolic function.</p>
              </div>
            </div>
          </div>

          {/* Family Health Graph */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" /> Family Health Risk Graph
              </h3>
              <button
                onClick={() => {
                  const newName = prompt("Enter family member name:");
                  if (newName) {
                    setFamilyMembers((prev) => [
                      ...prev,
                      { id: `f-${Date.now()}`, name: newName, relation: "Relative", age: 40, conditions: ["Monitored"], riskLevel: "low" }
                    ]);
                  }
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Relative
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {familyMembers.map((fm) => (
                <div key={fm.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white">{fm.name}</h4>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        fm.riskLevel === "high"
                          ? "bg-rose-500/10 text-rose-400"
                          : fm.riskLevel === "moderate"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {fm.riskLevel} hereditary risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Conditions: {fm.conditions.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI SCANNER */}
      {activeTab === "scanner" && (
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-400" /> AI Multimodal Scanner
              </h3>
              <p className="text-xs text-slate-400">Instant recognition for medications, skin lesions, and lab reports.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setScanType("medication")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scanType === "medication" ? "bg-purple-600 text-white" : "bg-slate-950 text-slate-400"
                }`}
              >
                💊 Medication
              </button>
              <button
                onClick={() => setScanType("skin")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scanType === "skin" ? "bg-purple-600 text-white" : "bg-slate-950 text-slate-400"
                }`}
              >
                🩺 Skin Photo
              </button>
              <button
                onClick={() => setScanType("report")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scanType === "report" ? "bg-purple-600 text-white" : "bg-slate-950 text-slate-400"
                }`}
              >
                📄 Lab Report
              </button>
            </div>
          </div>

          {/* Camera Viewport Placeholder */}
          <div className="border-2 border-dashed border-slate-800 bg-slate-950 rounded-2xl p-8 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Camera className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Capture or Upload {scanType}</h4>
              <p className="text-xs text-slate-500 mt-1">Position item within frame for automatic Gemini AI extraction</p>
            </div>
            <button
              onClick={handleRunScanner}
              disabled={isScanning}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-850 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              {isScanning ? "Scanning with Gemini AI..." : "Start Scan"}
            </button>
          </div>

          {/* Results */}
          {scanResult && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {scanResult.title}
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {scanResult.confidence}% AI Confidence
                </span>
              </div>

              {scanResult.brand && <p className="text-xs text-slate-300"><strong>Brand:</strong> {scanResult.brand}</p>}
              {scanResult.instructions && <p className="text-xs text-slate-300"><strong>Instructions:</strong> {scanResult.instructions}</p>}
              {scanResult.interactions && <p className="text-xs text-purple-300"><strong>Safety Check:</strong> {scanResult.interactions}</p>}
              {scanResult.recommendation && <p className="text-xs text-slate-300"><strong>Recommendation:</strong> {scanResult.recommendation}</p>}
            </div>
          )}
        </div>
      )}

      {/* TAB: EMERGENCY HEALTH CARD & SOS DISPATCH CENTER */}
      {activeTab === "emergency" && (
        <div className="space-y-6">
          {/* HERO BANNER & SOS DISPATCH BAR */}
          <div className={`p-6 rounded-3xl border-2 transition-all shadow-2xl space-y-5 ${
            sosBeaconState.sosActive
              ? "bg-gradient-to-r from-rose-950 via-red-900 to-amber-950 border-rose-500 ring-4 ring-rose-500/30 animate-pulse"
              : "bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border-rose-500/40"
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`p-3.5 rounded-2xl border text-white shrink-0 ${
                  sosBeaconState.sosActive ? "bg-rose-600 border-rose-400 animate-bounce" : "bg-rose-500/20 border-rose-500/30 text-rose-400"
                }`}>
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded border border-rose-500/30">
                      24/7 Life-Saving Passport
                    </span>
                    <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> HIPAA & ER Verified
                    </span>
                    <span className="text-[9px] font-black text-rose-400 bg-slate-950 px-2 py-0.5 rounded border border-rose-500/30 font-mono">
                      Blood Group: {emergencyProfile.bloodGroup}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    CURA Universal Emergency Health Card & SOS Dispatch
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                    Instant break-glass medical profile for first responders, ER doctors, and paramedics. Provides instant QR access to allergies, critical prescriptions, and automated SOS GPS dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto justify-end">
                {!sosBeaconState.sosActive ? (
                  <button
                    onClick={handleTriggerSOSBeacon}
                    disabled={sosBeaconState.isBroadcasting}
                    className="px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-rose-600/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    {sosBeaconState.isBroadcasting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Transmitting GPS Beacon...</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 animate-bounce" />
                        <span>Broadcast Emergency SOS</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSOSBeacon}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Stand Down SOS</span>
                  </button>
                )}

                <button
                  onClick={handleDownloadEmergencyPDF}
                  className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>Download PDF Passport</span>
                </button>

                <button
                  onClick={() => setIsEmergencyQRModalOpen(true)}
                  className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="h-4 w-4 text-cyan-400" />
                  <span>Show ER QR Code</span>
                </button>
              </div>
            </div>

            {/* LIVE SOS BROADCAST STATUS PANEL IF ACTIVE */}
            {sosBeaconState.sosActive && (
              <div className="bg-slate-950/90 border-2 border-rose-500 p-4 rounded-2xl space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      LIVE EMERGENCY SOS BEACON ACTIVE • Transmitted at {sosBeaconState.sosTimestamp}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    {sosBeaconState.ambulanceDispatchStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-rose-400" /> Transmitted GPS Location
                    </span>
                    <p className="text-white font-mono font-bold text-xs">{sosBeaconState.locationCoordinates.address}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Lat: {sosBeaconState.locationCoordinates.lat}° N, Lng: {sosBeaconState.locationCoordinates.lng}° E
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <Bell className="h-3 w-3 text-amber-400" /> Emergency Alerts Broadcasted To
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-200">
                      {sosBeaconState.notifiedEntities.map((entity, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-emerald-300 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{entity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 1: BREAK-GLASS EMERGENCY MEDICAL PASSPORT CARD */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-500/40 p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
            {/* CARD WATERMARK / BACKGROUND EMBLEM */}
            <div className="absolute right-6 top-6 opacity-5 pointer-events-none">
              <ShieldAlert className="h-64 w-64 text-rose-500" />
            </div>

            {/* CARD TOP HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 text-white font-black text-xl flex items-center justify-center shadow-xl shadow-rose-600/30 shrink-0 border border-rose-400">
                  RK
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{patientName}</h3>
                    <span className="px-2.5 py-0.5 bg-rose-500 text-slate-950 font-black text-xs rounded-lg uppercase">
                      {emergencyProfile.bloodGroup}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Card ID: <span className="font-mono text-emerald-400 font-bold">{emergencyProfile.cardId}</span> • Organ Donor: <strong className="text-emerald-300">REGISTERED YES</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-right">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Advance Directive</span>
                  <span className="font-bold text-emerald-400">{emergencyProfile.advanceDirectives.split("•")[0]}</span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-right">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Insurance Cashless</span>
                  <span className="font-mono font-bold text-amber-300">{emergencyProfile.insurance.provider}</span>
                </div>
              </div>
            </div>

            {/* AI CRITICAL FIRST RESPONDER ADVISORY BOX */}
            <div className="p-4 bg-rose-950/40 border-2 border-rose-500/50 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400 animate-pulse" /> AI Clinical Resuscitation Advisory
                </span>
                <span className="text-[9px] font-bold text-slate-400 font-mono">Targeted for ER & Paramedic Crew</span>
              </div>
              <p className="text-xs font-bold text-rose-200 leading-relaxed font-mono uppercase tracking-wide">
                ⚠️ {emergencyProfile.aiCriticalInstructions}
              </p>
            </div>

            {/* 4-GRID CRITICAL CLINICAL PROFILE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* BOX 1: CRITICAL ALLERGIES */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <h4 className="font-black text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="h-4 w-4 text-rose-500" /> Allergies
                  </h4>
                  <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                    {emergencyProfile.allergies.length} Critical
                  </span>
                </div>

                <div className="space-y-2">
                  {emergencyProfile.allergies.map((allergy, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 rounded-xl border border-rose-500/20 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-white font-black">{allergy.name}</strong>
                        <span className="text-[9px] font-black text-rose-400 uppercase bg-rose-950 px-1.5 py-0.5 rounded border border-rose-500/30">
                          {allergy.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{allergy.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOX 2: ACTIVE MEDICATIONS */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <h4 className="font-black text-teal-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Pill className="h-4 w-4 text-teal-400" /> Prescriptions
                  </h4>
                  <span className="text-[9px] font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded">
                    Daily Regimen
                  </span>
                </div>

                <div className="space-y-2">
                  {emergencyProfile.activeMedications.map((med, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 rounded-xl border border-slate-850 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-white font-bold">{med.name}</strong>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                          {med.timing}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{med.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOX 3: CHRONIC CONDITIONS & SURGERIES */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <h4 className="font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Activity className="h-4 w-4 text-amber-400" /> Chronic EMR
                  </h4>
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                    3 Diagnoses
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Active Diagnoses</span>
                  {emergencyProfile.chronicConditions.map((cond, idx) => (
                    <div key={idx} className="p-1.5 bg-slate-900 rounded-lg text-[10px] text-slate-200 font-medium border border-slate-850">
                      {cond}
                    </div>
                  ))}
                  <span className="text-[9px] text-slate-500 uppercase font-bold block pt-1">Recent Surgical History</span>
                  {emergencyProfile.recentSurgeries.map((surg, idx) => (
                    <div key={idx} className="p-1.5 bg-slate-900 rounded-lg text-[10px] text-slate-300 border border-slate-850">
                      {surg}
                    </div>
                  ))}
                </div>
              </div>

              {/* BOX 4: INSURANCE & CASHLESS TPA DESK */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-black text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" /> TPA Cashless
                  </h4>
                  <span className="text-[9px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Active Pre-Auth
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Insurance Provider</span>
                    <strong className="text-white text-xs block">{emergencyProfile.insurance.provider}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Policy Number</span>
                    <span className="font-mono font-bold text-amber-300 text-xs block">{emergencyProfile.insurance.policyNo}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Cashless ER Limit</span>
                    <span className="text-emerald-400 font-bold text-xs block">{emergencyProfile.insurance.coverageAmount}</span>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => alert(`📞 Dialing Star Health TPA Emergency Helpline: ${emergencyProfile.insurance.tpaContact}`)}
                      className="w-full py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Phone className="h-3 w-3 text-cyan-400" /> Call TPA Desk ({emergencyProfile.insurance.tpaContact})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: EMERGENCY CONTACTS & DIRECT ER DISPATCH GRID */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Phone className="h-5 w-5 text-emerald-400" />
                  Verified Emergency Caregivers & Physician Direct Connect
                </h3>
                <p className="text-xs text-slate-400">
                  Authorized emergency contacts receive instant SMS/WhatsApp alerts and location ping when SOS is triggered.
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
                4 Direct Channels
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* CONTACT 1: PRIMARY SPOUSE */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    Primary Caregiver
                  </span>
                  <Heart className="h-4 w-4 text-rose-400 fill-rose-500/30" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{emergencyProfile.primaryContact.name}</h4>
                  <span className="text-[10px] text-slate-400 block">{emergencyProfile.primaryContact.relation}</span>
                  <span className="font-mono text-emerald-300 font-bold block mt-1">{emergencyProfile.primaryContact.phone}</span>
                </div>
                <div className="pt-2 flex items-center gap-1.5">
                  <button
                    onClick={() => alert(`📞 Calling Primary Caregiver (${emergencyProfile.primaryContact.name})...`)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Phone className="h-3 w-3" /> Call
                  </button>
                  <button
                    onClick={() => alert(`📲 Transmitted Emergency Passport to ${emergencyProfile.primaryContact.name} via WhatsApp!`)}
                    className="flex-1 py-1.5 bg-teal-950 hover:bg-teal-900 border border-teal-500/30 text-teal-200 rounded-xl font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="h-3 w-3" /> Alert
                  </button>
                </div>
              </div>

              {/* CONTACT 2: SECONDARY BROTHER */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                    Family Guardian
                  </span>
                  <User className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{emergencyProfile.secondaryContact.name}</h4>
                  <span className="text-[10px] text-slate-400 block">{emergencyProfile.secondaryContact.relation}</span>
                  <span className="font-mono text-cyan-300 font-bold block mt-1">{emergencyProfile.secondaryContact.phone}</span>
                </div>
                <div className="pt-2 flex items-center gap-1.5">
                  <button
                    onClick={() => alert(`📞 Calling Family Guardian (${emergencyProfile.secondaryContact.name})...`)}
                    className="flex-1 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Phone className="h-3 w-3" /> Call
                  </button>
                  <button
                    onClick={() => alert(`📲 Sent WhatsApp Alert to ${emergencyProfile.secondaryContact.name}`)}
                    className="flex-1 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="h-3 w-3" /> Alert
                  </button>
                </div>
              </div>

              {/* CONTACT 3: ATTENDING CARDIOLOGIST */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                    Primary Cardiologist
                  </span>
                  <Stethoscope className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{emergencyProfile.attendingPhysician.name}</h4>
                  <span className="text-[10px] text-slate-400 block">{emergencyProfile.attendingPhysician.hospital}</span>
                  <span className="font-mono text-amber-300 font-bold block mt-1">{emergencyProfile.attendingPhysician.phone}</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => alert(`📞 Connecting to ${emergencyProfile.attendingPhysician.name} (Max Hospital ER Desk)...`)}
                    className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Phone className="h-3 w-3" /> Call Cardiologist
                  </button>
                </div>
              </div>

              {/* CONTACT 4: 108 AMBULANCE COMMAND */}
              <div className="bg-rose-950/40 p-4 rounded-2xl border border-rose-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                    National Emergency
                  </span>
                  <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">108 Ambulance Desk</h4>
                  <span className="text-[10px] text-slate-300 block">GPS Coordinates Transmitted</span>
                  <span className="font-mono text-rose-400 font-bold block mt-1">Toll-Free 108 / 112</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => alert("🚨 Dialing 108 Emergency Ambulance Command Center & Transmitting GPS Location!")}
                    className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-rose-600/30"
                  >
                    <Phone className="h-3 w-3" /> Dispatch 108 ER
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MODAL: ER QR CODE BREAK-GLASS SCAN DISPLAY */}
          {isEmergencyQRModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-center animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-rose-400" />
                    <h3 className="text-base font-black text-white">Emergency ER QR Scan Code</h3>
                  </div>
                  <button
                    onClick={() => setIsEmergencyQRModalOpen(false)}
                    className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-300">
                  Allow first responders, ER doctors, or paramedics to scan this QR code with any camera to instantly break-glass open your medical passport.
                </p>

                {/* QR CODE BOX */}
                <div className="p-6 bg-white rounded-3xl mx-auto w-56 h-56 flex flex-col items-center justify-center shadow-2xl border-4 border-rose-500/40">
                  <QrCode className="h-44 w-44 text-slate-950" />
                </div>

                <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Break-Glass Token Access</span>
                  <span className="font-mono font-black text-emerald-400 text-sm tracking-wider">{emergencyProfile.qrAccessCode}</span>
                  <span className="text-[10px] text-slate-400 block">Offline PIN: <strong className="text-amber-300 font-mono">{emergencyProfile.emergencyCodePin}</strong></span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://cura.health/break-glass/${emergencyProfile.cardId}?token=${emergencyProfile.qrAccessCode}`);
                      setEmergencyCopiedSuccess(true);
                      setTimeout(() => setEmergencyCopiedSuccess(false), 3000);
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition cursor-pointer"
                  >
                    {emergencyCopiedSuccess ? "✓ Copied ER Access URL!" : "Copy Break-Glass ER URL"}
                  </button>
                  <button
                    onClick={() => setIsEmergencyQRModalOpen(false)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
