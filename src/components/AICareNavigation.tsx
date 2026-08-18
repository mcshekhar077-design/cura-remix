import React, { useState } from "react";
import VideoConsultation from "./VideoConsultation";
import {
  Stethoscope,
  Search,
  Sparkles,
  MapPin,
  Star,
  Clock,
  Calendar,
  Filter,
  CheckCircle2,
  User,
  Phone,
  ShieldCheck,
  ChevronRight,
  Video,
  Building2,
  X,
  Award,
  AlertCircle,
  ThumbsUp,
  FileText,
  Send,
  Heart,
  Briefcase,
  Languages,
  Check,
  ArrowRight,
  SlidersHorizontal,
  Info,
  AlertTriangle,
  Zap,
  Navigation,
  Compass,
  Activity,
  Flame,
  Siren,
  ShieldAlert,
  BadgeCheck,
  Building,
  RefreshCw
} from "lucide-react";

export interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  specialty: string;
  subSpecialty: string;
  qualification: string;
  experienceYears: number;
  hospital: string;
  location: string;
  distanceKm: number;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  matchScore: number;
  matchReason: string;
  languages: string[];
  avatarBg: string;
  consultationTypes: ("In-Person" | "Video Teleconsult" | "Emergency")[];
  availableToday: boolean;
  nextAvailableSlot: string;
  slots: { date: string; day: string; times: string[] }[];
  verifiedRmp: boolean;
  registrationNumber: string;
  about: string;
  keyExpertise: string[];
  insuranceAccepted: string[];
  scoreBreakdown: {
    conditionFit: number;
    clinicalExperience: number;
    proximity: number;
    availability: number;
    insuranceMatch: number;
    patientSatisfaction: number;
  };
}

export interface TriageResult {
  urgencyLevel: "Emergency" | "Urgent Specialist" | "Specialist Consultation" | "Teleconsult Suitable" | "Primary Care";
  urgencyColor: string;
  urgencyBg: string;
  urgencyIcon: any;
  symptomsDetected: string[];
  recommendedSpecialty: string;
  redFlags: string[];
  carePathway: string;
  followUpQuestions: string[];
  summary: string;
}

interface AICareNavigationProps {
  patientId?: string;
  patientName?: string;
  patientConditions?: string[];
  onBookSuccess?: (appointment: any) => void;
  onBack?: () => void;
}

const SAMPLE_DOCTORS: DoctorProfile[] = [
  {
    id: "doc-101",
    name: "Dr. Vikram Sethi",
    title: "Senior Consultant Cardiologist & Electrophysiologist",
    specialty: "Cardiology",
    subSpecialty: "Hypertension & Interventional Cardiology",
    qualification: "MBBS, MD (Internal Med), DM (Cardiology), FACC",
    experienceYears: 18,
    hospital: "Max Super Speciality Hospital, Saket",
    location: "South Delhi / Saket Node",
    distanceKm: 3.2,
    consultationFee: 1200,
    rating: 4.9,
    reviewCount: 342,
    matchScore: 98,
    matchReason: "Direct match for hypertension history, elevated blood pressure logs, and interventional lipidology.",
    languages: ["English", "Hindi", "Punjabi"],
    avatarBg: "bg-gradient-to-tr from-blue-600 to-indigo-600",
    consultationTypes: ["In-Person", "Video Teleconsult"],
    availableToday: true,
    nextAvailableSlot: "Today at 04:30 PM",
    slots: [
      { date: "2026-08-02", day: "Today", times: ["04:30 PM", "05:15 PM", "06:00 PM"] },
      { date: "2026-08-03", day: "Tomorrow", times: ["10:00 AM", "11:30 AM", "03:00 PM", "05:00 PM"] },
      { date: "2026-08-04", day: "Tue, Aug 4", times: ["09:30 AM", "11:00 AM", "02:30 PM", "04:00 PM"] }
    ],
    verifiedRmp: true,
    registrationNumber: "MCI-48902-DEL",
    about: "Dr. Vikram Sethi is a renowned interventional cardiologist specializing in complex hypertension management, preventive cardiology, and advanced arrhythmia electrophysiology.",
    keyExpertise: ["Essential Hypertension", "Coronary Angioplasty", "Arrhythmia Management", "Lipidology"],
    insuranceAccepted: ["CGHS", "Max Bupa / Niva Bupa", "Star Health", "Ayushman PMJAY"],
    scoreBreakdown: {
      conditionFit: 99,
      clinicalExperience: 98,
      proximity: 94,
      availability: 96,
      insuranceMatch: 100,
      patientSatisfaction: 98
    }
  },
  {
    id: "doc-102",
    name: "Dr. Ananya Roy",
    title: "Chief Endocrinologist & Diabetologist",
    specialty: "Endocrinology",
    subSpecialty: "Pre-Diabetes & Metabolic Syndrome",
    qualification: "MBBS, MD (Medicine), DM (Endocrinology - AIIMS Delhi)",
    experienceYears: 14,
    hospital: "Apollo Hospitals, Jasola",
    location: "South East Delhi",
    distanceKm: 5.8,
    consultationFee: 1000,
    rating: 4.8,
    reviewCount: 218,
    matchScore: 94,
    matchReason: "Specialist match for Pre-Diabetes HbA1c (6.6%), glycemic variation, and insulin resistance protocol.",
    languages: ["English", "Bengali", "Hindi"],
    avatarBg: "bg-gradient-to-tr from-teal-600 to-emerald-600",
    consultationTypes: ["In-Person", "Video Teleconsult"],
    availableToday: true,
    nextAvailableSlot: "Today at 05:00 PM",
    slots: [
      { date: "2026-08-02", day: "Today", times: ["05:00 PM", "06:30 PM"] },
      { date: "2026-08-03", day: "Tomorrow", times: ["11:00 AM", "01:00 PM", "04:00 PM"] }
    ],
    verifiedRmp: true,
    registrationNumber: "MCI-61204-WB",
    about: "Ex-AIIMS Endocrinology Fellow with extensive clinical research in early lifestyle intervention for diabetes reversal and thyroid disorders.",
    keyExpertise: ["Type 2 Diabetes", "HbA1c Management", "Thyroid Disorders", "PCOS & Metabolism"],
    insuranceAccepted: ["CGHS", "HDFC ERGO", "Star Health", "ICICI Lombard"],
    scoreBreakdown: {
      conditionFit: 96,
      clinicalExperience: 94,
      proximity: 88,
      availability: 95,
      insuranceMatch: 92,
      patientSatisfaction: 97
    }
  },
  {
    id: "doc-103",
    name: "Dr. Meera Vasudevan",
    title: "Lead Pulmonologist & Sleep Medicine Specialist",
    specialty: "Pulmonology",
    subSpecialty: "Bronchial Asthma & Allergic Airway Diseases",
    qualification: "MBBS, DTCD, DNB (Respiratory Diseases), FCCP (USA)",
    experienceYears: 16,
    hospital: "Fortis Escorts Heart Institute, Okhla",
    location: "Okhla Phase 3 / South Delhi",
    distanceKm: 4.5,
    consultationFee: 1100,
    rating: 4.9,
    reviewCount: 289,
    matchScore: 91,
    matchReason: "Ideal match for Mild Asthma exacerbation, spirometry tracking, and seasonal air allergy protocols.",
    languages: ["English", "Hindi", "Malayalam", "Tamil"],
    avatarBg: "bg-gradient-to-tr from-purple-600 to-indigo-600",
    consultationTypes: ["In-Person", "Video Teleconsult"],
    availableToday: false,
    nextAvailableSlot: "Tomorrow at 10:30 AM",
    slots: [
      { date: "2026-08-03", day: "Tomorrow", times: ["10:30 AM", "12:00 PM", "03:30 PM"] },
      { date: "2026-08-04", day: "Tue, Aug 4", times: ["10:00 AM", "02:00 PM", "05:00 PM"] }
    ],
    verifiedRmp: true,
    registrationNumber: "MCI-39105-KER",
    about: "Dr. Meera Vasudevan leads the asthma care clinic at Fortis. She specializes in non-invasive ventilation, bronchial thermoplasty, and allergy immunotherapy.",
    keyExpertise: ["Bronchial Asthma", "COPD Care", "Sleep Apnea & CPAP", "Post-Viral Lung Recovery"],
    insuranceAccepted: ["Star Health", "Care Health", "Max Bupa", "Ayushman PMJAY"],
    scoreBreakdown: {
      conditionFit: 92,
      clinicalExperience: 96,
      proximity: 90,
      availability: 82,
      insuranceMatch: 95,
      patientSatisfaction: 98
    }
  },
  {
    id: "doc-104",
    name: "Dr. Rajeshwar Sharma",
    title: "Senior Consultant Internal Medicine & Critical Care",
    specialty: "General Medicine",
    subSpecialty: "Acute Fevers, Dyspnea & Multi-System Illness",
    qualification: "MBBS, MD (General Medicine - Maulana Azad Medical College)",
    experienceYears: 22,
    hospital: "BLK-Max Super Speciality Hospital, Pusa Road",
    location: "Central Delhi",
    distanceKm: 8.1,
    consultationFee: 900,
    rating: 4.7,
    reviewCount: 412,
    matchScore: 88,
    matchReason: "Comprehensive general health evaluation, multi-condition care coordination, and routine checkups.",
    languages: ["English", "Hindi"],
    avatarBg: "bg-gradient-to-tr from-cyan-600 to-blue-600",
    consultationTypes: ["In-Person", "Video Teleconsult", "Emergency"],
    availableToday: true,
    nextAvailableSlot: "Today at 03:00 PM",
    slots: [
      { date: "2026-08-02", day: "Today", times: ["03:00 PM", "04:00 PM", "06:00 PM"] }
    ],
    verifiedRmp: true,
    registrationNumber: "MCI-22801-DEL",
    about: "Dr. Sharma has over two decades of clinical experience in managing complex infectious diseases, fever panels, and holistic adult medicine.",
    keyExpertise: ["Pyrexia of Unknown Origin", "Hypertension & Metabolic Care", "Infectious Diseases", "Geriatric Medicine"],
    insuranceAccepted: ["CGHS", "Ayushman PMJAY", "Star Health", "Religare / Care"],
    scoreBreakdown: {
      conditionFit: 88,
      clinicalExperience: 98,
      proximity: 80,
      availability: 98,
      insuranceMatch: 90,
      patientSatisfaction: 95
    }
  },
  {
    id: "doc-105",
    name: "Dr. Srikant Iyer",
    title: "Chief Orthopedic & Spine Surgeon",
    specialty: "Orthopedics",
    subSpecialty: "Joint Replacement & Osteoarthritis",
    qualification: "MBBS, MS (Orthopedics - KEM Mumbai), M.Ch (UK)",
    experienceYears: 20,
    hospital: "Medanta - The Medicity, Gurugram",
    location: "Gurugram / NCR Central",
    distanceKm: 12.4,
    consultationFee: 1500,
    rating: 4.9,
    reviewCount: 520,
    matchScore: 85,
    matchReason: "Expert match for knee joint pain, back posture issues, and musculoskeletal evaluation.",
    languages: ["English", "Hindi", "Marathi", "Tamil"],
    avatarBg: "bg-gradient-to-tr from-amber-600 to-orange-600",
    consultationTypes: ["In-Person", "Video Teleconsult"],
    availableToday: true,
    nextAvailableSlot: "Today at 06:15 PM",
    slots: [
      { date: "2026-08-02", day: "Today", times: ["06:15 PM"] },
      { date: "2026-08-03", day: "Tomorrow", times: ["10:00 AM", "02:00 PM"] }
    ],
    verifiedRmp: true,
    registrationNumber: "MCI-19402-MAH",
    about: "Dr. Srikant Iyer has performed over 4,000 successful joint replacements and robotic knee surgeries.",
    keyExpertise: ["Joint Pain & Arthroscopy", "Osteoarthritis", "Osteoporosis Care", "Spine Posture Fix"],
    insuranceAccepted: ["Star Health", "Max Bupa", "HDFC ERGO"],
    scoreBreakdown: {
      conditionFit: 84,
      clinicalExperience: 99,
      proximity: 72,
      availability: 90,
      insuranceMatch: 88,
      patientSatisfaction: 98
    }
  }
];

export default function AICareNavigation({
  patientId = "PAT-1001",
  patientName = "Rajesh Kumar",
  patientConditions = ["Stage 1 Hypertension", "Pre-Diabetes (HbA1c 6.6%)", "Mild Asthma"],
  onBookSuccess,
  onBack
}: AICareNavigationProps) {
  // Intent Search Input State
  const [symptomInput, setSymptomInput] = useState("");
  const [isAnalyzingIntent, setIsAnalyzingIntent] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [selectedConsultType, setSelectedConsultType] = useState<string>("All");
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"matchScore" | "rating" | "experience" | "fee">("matchScore");
  const [expandedMatchDocId, setExpandedMatchDocId] = useState<string | null>(null);

  // Booking Modal State
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<DoctorProfile | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [consultTypeChoice, setConsultTypeChoice] = useState<"In-Person" | "Video Teleconsult">("In-Person");
  const [bookingReason, setBookingReason] = useState("Routine Follow-Up & Medication Review");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<any | null>(null);
  const [activeVideoCallDoc, setActiveVideoCallDoc] = useState<DoctorProfile | null>(null);

  const specialtiesList = [
    "All",
    "Cardiology",
    "Endocrinology",
    "General Medicine",
    "Pulmonology",
    "Orthopedics"
  ];

  // Preset Intent Prompts
  const intentPresets = [
    { label: "🫀 Chest pressure & sweating", text: "I have mild chest heaviness with neck stiffness for 2 hours, morning BP was 134/86." },
    { label: "🩸 High blood sugar & fatigue", text: "Fasting glucose is 128 mg/dL, feeling tired after lunch, HbA1c was 6.6%." },
    { label: "🫁 Wheezing & shortness of breath", text: "Mild breathing tightness when walking fast, history of allergic asthma." },
    { label: "🦴 Knee joint pain when climbing stairs", text: "Sharp right knee pain for 2 weeks, worse in the morning." }
  ];

  // Run AI Intent Analysis
  const handleRunIntentAnalysis = (queryText?: string) => {
    const textToAnalyze = queryText || symptomInput;
    if (!textToAnalyze.trim()) return;

    setIsAnalyzingIntent(true);

    setTimeout(() => {
      const lower = textToAnalyze.toLowerCase();
      let result: TriageResult;

      if (lower.includes("chest") || lower.includes("heart") || lower.includes("bp") || lower.includes("arm") || lower.includes("sweat")) {
        result = {
          urgencyLevel: lower.includes("severe") || lower.includes("radiating") ? "Emergency" : "Urgent Specialist",
          urgencyColor: lower.includes("severe") ? "text-rose-400 border-rose-500/50 bg-rose-950/40" : "text-amber-300 border-amber-500/50 bg-amber-950/40",
          urgencyBg: "bg-amber-950/40",
          urgencyIcon: Siren,
          symptomsDetected: ["Chest Pressure", "Blood Pressure Fluctuation", "Cardiovascular Exertion"],
          recommendedSpecialty: "Cardiology",
          redFlags: [
            "Chest pain radiating to left arm or jaw",
            "Profuse cold sweating with dizziness",
            "Acute shortness of breath at rest"
          ],
          carePathway: "Consult Senior Cardiologist within 24 hours. Immediate ECG & Troponin-I test recommended.",
          followUpQuestions: [
            "Does the pain increase when walking or taking deep breaths?",
            "Have you taken your prescribed antihypertensive medication today?"
          ],
          summary: "Symptoms strongly indicate cardiovascular or vascular exertion. Priority matching activated for Interventional Cardiology."
        };
        setSelectedSpecialty("Cardiology");
      } else if (lower.includes("sugar") || lower.includes("glucose") || lower.includes("hba1c") || lower.includes("fatigue") || lower.includes("diabetes")) {
        result = {
          urgencyLevel: "Specialist Consultation",
          urgencyColor: "text-teal-300 border-teal-500/50 bg-teal-950/40",
          urgencyBg: "bg-teal-950/40",
          urgencyIcon: Activity,
          symptomsDetected: ["Elevated Fasting Glucose", "Post-Prandial Lethargy", "Metabolic Impairment"],
          recommendedSpecialty: "Endocrinology",
          redFlags: ["Extreme thirst with frequent urination (Polyuria)", "Sudden unexplained weight loss"],
          carePathway: "Schedule Endocrinology review within 3-5 days. Update Continuous Glucose Monitor (CGM) log.",
          followUpQuestions: ["When was your last fasting plasma glucose test?", "Are you experiencing blurred vision or slow wound healing?"],
          summary: "Glycemic variation aligns with Pre-Diabetes HbA1c 6.6% history. Matched with AIIMS-trained Diabetologists."
        };
        setSelectedSpecialty("Endocrinology");
      } else if (lower.includes("breath") || lower.includes("asthma") || lower.includes("cough") || lower.includes("lung") || lower.includes("wheez")) {
        result = {
          urgencyLevel: "Teleconsult Suitable",
          urgencyColor: "text-indigo-300 border-indigo-500/50 bg-indigo-950/40",
          urgencyBg: "bg-indigo-950/40",
          urgencyIcon: Video,
          symptomsDetected: ["Airway Tightness", "Mild Exertional Wheezing", "Allergic Airway Hyper-responsiveness"],
          recommendedSpecialty: "Pulmonology",
          redFlags: ["Inability to complete full sentences without pausing for breath", "SpO2 dropping below 92%"],
          carePathway: "Suitable for HD Video Teleconsultation. Review inhaler dosage & Peak Expiratory Flow Meter log.",
          followUpQuestions: ["Are you using a reliever inhaler (Salbutamol)?", "Have you been exposed to cold air or AQI smoke?"],
          summary: "Respiratory symptoms indicate mild asthmatic hyper-responsiveness. Instant Video Call recommended."
        };
        setSelectedSpecialty("Pulmonology");
      } else {
        result = {
          urgencyLevel: "Primary Care",
          urgencyColor: "text-blue-300 border-blue-500/50 bg-blue-950/40",
          urgencyBg: "bg-blue-950/40",
          urgencyIcon: Stethoscope,
          symptomsDetected: ["General Symptom Complex", "Routine Health Query"],
          recommendedSpecialty: "General Medicine",
          redFlags: ["High grade persistent fever above 102°F", "Uncontrolled vomiting or dehydration"],
          carePathway: "Primary Care Physician or Teleconsult review recommended.",
          followUpQuestions: ["How long have these symptoms been present?", "Any current medications you are taking?"],
          summary: "Routine clinical query matched with senior Internal Medicine specialists."
        };
        setSelectedSpecialty("General Medicine");
      }

      setTriageResult(result);
      setIsAnalyzingIntent(false);
    }, 900);
  };

  // Filtered Doctors List
  const filteredDoctors = SAMPLE_DOCTORS.filter((doc) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = doc.name.toLowerCase().includes(searchLower);
    const specialtyMatch = doc.specialty.toLowerCase().includes(searchLower);
    const hospitalMatch = doc.hospital.toLowerCase().includes(searchLower);
    const expertiseMatch = doc.keyExpertise.some((e) => e.toLowerCase().includes(searchLower));

    if (searchTerm && !(nameMatch || specialtyMatch || hospitalMatch || expertiseMatch)) {
      return false;
    }

    if (selectedSpecialty !== "All" && doc.specialty !== selectedSpecialty) {
      return false;
    }

    if (selectedConsultType !== "All" && !doc.consultationTypes.includes(selectedConsultType as any)) {
      return false;
    }

    if (availableTodayOnly && !doc.availableToday) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "matchScore") return b.matchScore - a.matchScore;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "experience") return b.experienceYears - a.experienceYears;
    if (sortBy === "fee") return a.consultationFee - b.consultationFee;
    return 0;
  });

  // Open Booking Modal
  const handleOpenBookingModal = (doc: DoctorProfile) => {
    setSelectedDoctorForModal(doc);
    setSelectedDayIdx(0);
    setSelectedTimeSlot(doc.slots[0]?.times[0] || "04:30 PM");
    setConsultTypeChoice(doc.consultationTypes.includes("In-Person") ? "In-Person" : "Video Teleconsult");
    setBookingConfirmed(null);
  };

  // Submit Booking
  const handleConfirmBooking = () => {
    if (!selectedDoctorForModal) return;
    setIsBookingSubmitting(true);

    setTimeout(() => {
      const conf = {
        appointmentId: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        doctorName: selectedDoctorForModal.name,
        specialty: selectedDoctorForModal.specialty,
        hospital: selectedDoctorForModal.hospital,
        date: selectedDoctorForModal.slots[selectedDayIdx]?.day || "Today",
        time: selectedTimeSlot,
        type: consultTypeChoice,
        fee: selectedDoctorForModal.consultationFee,
        patientName,
        reason: bookingReason,
        confirmedAt: new Date().toLocaleString()
      };

      setBookingConfirmed(conf);
      setIsBookingSubmitting(false);

      if (onBookSuccess) {
        onBookSuccess(conf);
      }
    }, 1200);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen p-3 md:p-6 space-y-6 font-sans">
      {/* TOP HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
            <Compass className="h-6 w-6 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" /> AI Intent Care Navigator
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Patient: {patientName}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mt-1">
              Smart Doctor Discovery & Clinical Triage
            </h1>
            <p className="text-xs text-slate-400">
              Describe your symptoms in natural language to analyze care urgency and match with top-rated verified doctors.
            </p>
          </div>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition"
          >
            ← Back
          </button>
        )}
      </div>

      {/* SECTION 1: NATURAL LANGUAGE INTENT SEARCH BAR */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-blue-500/30 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Describe Your Symptoms or Medical Needs
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Powered by Clinical Intent Parsing Engine
          </span>
        </div>

        {/* INPUT & SEARCH BUTTON */}
        <div className="flex items-center gap-2 flex-col sm:flex-row">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRunIntentAnalysis()}
              placeholder="e.g. 'I have chest pressure and sweating since morning' or 'Looking for diabetes doctor accepting CGHS'..."
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-blue-500 transition shadow-inner placeholder:text-slate-500"
            />
            <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
          </div>

          <button
            onClick={() => handleRunIntentAnalysis()}
            disabled={isAnalyzingIntent}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            {isAnalyzingIntent ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Analyzing Intent...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-amber-300 animate-bounce" />
                <span>Run AI Care Navigation</span>
              </>
            )}
          </button>
        </div>

        {/* PRESET PROMPT CHIPS */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Or try a sample clinical prompt:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {intentPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSymptomInput(preset.text);
                  handleRunIntentAnalysis(preset.text);
                }}
                className="px-3 py-1.5 bg-slate-950 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-500/40 rounded-xl text-xs text-slate-300 hover:text-white transition cursor-pointer text-left font-medium"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* TRIAGE RESULT BANNER */}
        {triageResult && (
          <div className={`p-5 rounded-2xl border-2 ${triageResult.urgencyColor} space-y-4 animate-in fade-in duration-300 shadow-xl`}>
            <div className="flex items-start justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10">
                  <triageResult.urgencyIcon className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 border border-amber-500/30">
                      Triage Level: {triageResult.urgencyLevel}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-cyan-300">
                      Recommended Specialty: {triageResult.recommendedSpecialty}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">{triageResult.summary}</p>
                </div>
              </div>

              {triageResult.urgencyLevel === "Emergency" && (
                <button
                  onClick={() => alert("SOS Emergency Alert Dispatched! Ambulance & Emergency Room notified.")}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/50 flex items-center gap-1.5 animate-pulse cursor-pointer"
                >
                  <Siren className="h-4 w-4" /> Trigger Emergency SOS
                </button>
              )}
            </div>

            {/* SYMPTOMS DETECTED & RED FLAGS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Extracted Symptom Markers</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {triageResult.symptomsDetected.map((sym, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-950/80 border border-blue-500/30 text-blue-200 rounded text-[11px] font-bold">
                      • {sym}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/30 space-y-1.5">
                <span className="text-[10px] font-bold text-rose-300 uppercase block flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> Critical Red Flags Watchlist
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                  {triageResult.redFlags.map((rf, i) => (
                    <li key={i}>{rf}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CARE PATHWAY */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 text-xs flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Recommended Care Pathway</span>
                <p className="font-bold text-emerald-300">{triageResult.carePathway}</p>
              </div>
              <span className="text-[11px] font-bold text-blue-300 bg-blue-950/80 px-3 py-1 rounded-xl border border-blue-500/30">
                Matched Doctors Filtered Below ↓
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: DOCTOR DISCOVERY & MATCHING MATRIX */}
      <div className="space-y-4">
        {/* CONTROLS & FILTER BAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* SPECIALTY FILTER TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {specialtiesList.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedSpecialty === spec
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* SORT & TODAY TOGGLE */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={availableTodayOnly}
                onChange={(e) => setAvailableTodayOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600"
              />
              <span className="font-bold text-slate-300">Available Today Only</span>
            </label>

            <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-bold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="matchScore" className="bg-slate-900">AI Match Score</option>
                <option value="rating" className="bg-slate-900">Highest Rating</option>
                <option value="experience" className="bg-slate-900">Most Experience</option>
                <option value="fee" className="bg-slate-900">Consultation Fee</option>
              </select>
            </div>
          </div>
        </div>

        {/* DOCTOR CARDS LIST */}
        <div className="space-y-4">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 md:p-6 transition-all duration-200 shadow-xl space-y-4 group"
            >
              {/* TOP HEADER ROW */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${doc.avatarBg} text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20`}
                  >
                    👨‍⚕️
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-black text-white group-hover:text-blue-300 transition">
                        {doc.name}
                      </h3>
                      {doc.verifiedRmp && (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3 text-emerald-400" /> Verified RMP ({doc.registrationNumber})
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{doc.title}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      {doc.hospital} • {doc.location} ({doc.distanceKm} km away)
                    </p>
                  </div>
                </div>

                {/* AI MATCH SCORE BADGE */}
                <div className="sm:self-start flex flex-col items-end shrink-0">
                  <div className="px-3.5 py-1.5 bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-500/40 rounded-2xl text-right">
                    <span className="text-[9px] text-blue-300 font-bold uppercase tracking-wider block">AI Match Score</span>
                    <span className="text-lg font-black text-cyan-300 font-mono">{doc.matchScore}%</span>
                  </div>
                  <button
                    onClick={() => setExpandedMatchDocId(expandedMatchDocId === doc.id ? null : doc.id)}
                    className="text-[10px] font-bold text-blue-400 hover:underline mt-1 cursor-pointer flex items-center gap-1"
                  >
                    {expandedMatchDocId === doc.id ? "Hide Score Breakdown ▲" : "View Score Breakdown ▼"}
                  </button>
                </div>
              </div>

              {/* TRANSPARENT MATCH REASONING */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-cyan-400" /> AI Recommendation Reasoning
                </span>
                <p className="text-slate-300 font-medium">{doc.matchReason}</p>
              </div>

              {/* EXPANDABLE SCORE BREAKDOWN MATRIX */}
              {expandedMatchDocId === doc.id && (
                <div className="p-4 bg-slate-950 border border-blue-500/30 rounded-2xl space-y-3 animate-in fade-in duration-200">
                  <span className="text-xs font-black text-white uppercase tracking-wider block border-b border-slate-800 pb-2">
                    📊 Dynamic Multi-Factor Match Breakdown
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Condition Fit</span>
                      <span className="text-sm font-black text-emerald-400">{doc.scoreBreakdown.conditionFit}%</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Clinical Experience</span>
                      <span className="text-sm font-black text-blue-400">{doc.scoreBreakdown.clinicalExperience}%</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Proximity / Distance</span>
                      <span className="text-sm font-black text-cyan-400">{doc.scoreBreakdown.proximity}%</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Availability Speed</span>
                      <span className="text-sm font-black text-indigo-400">{doc.scoreBreakdown.availability}%</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Insurance Match</span>
                      <span className="text-sm font-black text-amber-300">{doc.scoreBreakdown.insuranceMatch}%</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Patient Reviews</span>
                      <span className="text-sm font-black text-rose-400">{doc.scoreBreakdown.patientSatisfaction}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* KEY EXPERTISE & METRICS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Experience</span>
                  <span className="font-bold text-slate-200">{doc.experienceYears} Years Clinical</span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Consultation Fee</span>
                  <span className="font-bold text-emerald-400">₹{doc.consultationFee}</span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Rating & Reviews</span>
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> {doc.rating} ({doc.reviewCount})
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Next Availability</span>
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" /> {doc.nextAvailableSlot}
                  </span>
                </div>
              </div>

              {/* ACTIONS ROW */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                  <span className="font-bold text-slate-500">Languages:</span>
                  {doc.languages.map((lang, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px]">
                      {lang}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {doc.consultationTypes.includes("Video Teleconsult") && (
                    <button
                      onClick={() => setActiveVideoCallDoc(doc)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Video className="h-4 w-4 animate-pulse" />
                      <span>Start HD Video Consult</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenBookingModal(doc)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Book Clinic Appointment</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: APPOINTMENT BOOKING */}
      {selectedDoctorForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDoctorForModal(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white font-bold cursor-pointer"
            >
              ✕
            </button>

            {!bookingConfirmed ? (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Appointment Booking</span>
                  <h3 className="text-lg font-black text-white">{selectedDoctorForModal.name}</h3>
                  <p className="text-xs text-slate-400">{selectedDoctorForModal.title} • {selectedDoctorForModal.hospital}</p>
                </div>

                {/* CONSULTATION MODE CHOICE */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Select Consultation Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConsultTypeChoice("In-Person")}
                      className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        consultTypeChoice === "In-Person"
                          ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      <Building className="h-4 w-4" /> Clinic Visit (₹{selectedDoctorForModal.consultationFee})
                    </button>

                    <button
                      onClick={() => setConsultTypeChoice("Video Teleconsult")}
                      className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        consultTypeChoice === "Video Teleconsult"
                          ? "bg-teal-600 text-white border-teal-500 shadow-lg shadow-teal-600/30"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      <Video className="h-4 w-4" /> HD Video Call (₹{selectedDoctorForModal.consultationFee})
                    </button>
                  </div>
                </div>

                {/* DATE SELECTOR */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Select Date</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDoctorForModal.slots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedDayIdx(idx);
                          setSelectedTimeSlot(slot.times[0] || "");
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                          selectedDayIdx === idx
                            ? "bg-blue-950 border-blue-500 text-blue-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <div>{slot.day}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{slot.date}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TIME SLOTS */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Available Time Slots</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDoctorForModal.slots[selectedDayIdx]?.times.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTimeSlot(time)}
                        className={`p-2 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
                          selectedTimeSlot === time
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* REASON FOR VISIT */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-300 block">Reason for Visit</label>
                  <input
                    type="text"
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    placeholder="e.g. Hypertension follow-up, lab test review..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* CONFIRM BUTTON */}
                <button
                  onClick={handleConfirmBooking}
                  disabled={isBookingSubmitting || !selectedTimeSlot}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-xl shadow-blue-600/30 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  {isBookingSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Confirming Appointment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirm & Book (₹{selectedDoctorForModal.consultationFee})</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center space-y-4 py-3">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">Appointment Confirmed!</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your appointment has been booked and synchronized with hospital EMR.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-left space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Booking ID:</span>
                    <span className="text-emerald-400 font-bold">{bookingConfirmed.appointmentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="text-white">{bookingConfirmed.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date & Time:</span>
                    <span className="text-cyan-300">{bookingConfirmed.date} at {bookingConfirmed.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mode:</span>
                    <span className="text-amber-300">{bookingConfirmed.type}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  📲 SMS & WhatsApp confirmation dispatched to patient phone.
                </p>

                <button
                  onClick={() => setSelectedDoctorForModal(null)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: INSTANT VIDEO CONSULTATION OVERLAY */}
      {activeVideoCallDoc && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md overflow-y-auto p-2 sm:p-4">
          <div className="max-w-6xl mx-auto w-full">
            <VideoConsultation
              doctorName={activeVideoCallDoc.name}
              doctorTitle={activeVideoCallDoc.title}
              specialty={activeVideoCallDoc.specialty}
              hospitalName={activeVideoCallDoc.hospital}
              onBack={() => setActiveVideoCallDoc(null)}
              onEndConsultation={() => {
                setTimeout(() => setActiveVideoCallDoc(null), 2000);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
