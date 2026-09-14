import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  User,
  Activity,
  Heart,
  Shield,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  Search
} from "lucide-react";
import { AyushSystem } from "./AyushTypes";

interface AyushClinicalEHRProps {
  onCheckInteractions?: (ayushMeds: string[], allopathicMeds: string[]) => void;
  onNavigateToTimeline?: () => void;
  onNavigateToAllopathic?: () => void;
}

export function AyushClinicalEHR({ onCheckInteractions, onNavigateToTimeline, onNavigateToAllopathic }: AyushClinicalEHRProps) {
  // Selected clinical system
  const [selectedSystem, setSelectedSystem] = useState<AyushSystem>("Ayurveda");

  // Patient Profile state
  const [patientName, setPatientName] = useState("Rajesh Kumar");
  const [patientAge, setPatientAge] = useState("48");
  const [patientGender, setPatientGender] = useState("Male");
  const [abhaId, setAbhaId] = useState("14-8841-3320-1102");
  const [chiefComplaints, setChiefComplaints] = useState("Chronic postprandial dyspepsia, morning joint stiffness, insomnia, and mild acid reflux.");
  const [symptomDuration, setSymptomDuration] = useState("4 months");
  const [allopathicMeds, setAllopathicMeds] = useState("Atorvastatin 20mg OD, Telmisartan 40mg OD");
  const [knownAllergies, setKnownAllergies] = useState("Sulfa antibiotics");

  // System-specific diagnostic state
  // Ayurveda
  const [prakritiPrimary, setPrakritiPrimary] = useState("Pitta-Kapha");
  const [vikritiDosha, setVikritiDosha] = useState("Sama-Vata with Kaphaja Srotorodha");
  const [agniState, setAgniState] = useState("Manda (Sluggish digestive fire)");
  const [koshthaState, setKoshthaState] = useState("Madhyama (Balanced elimination)");

  // Unani
  const [mizajPrimary, setMizajPrimary] = useState("Damwi wa Balghami (Sanguine-Phlegmatic)");
  const [morbidHumor, setMorbidHumor] = useState("Balgham-e-Ghaleez (Viscous Phlegmatic stasis)");
  const [quwaState, setQuwaState] = useState("Zof-e-Quwwat-e-Hazima (Weak digestive faculty)");

  // Siddha
  const [mukkuttram, setMukkuttram] = useState("Azhal-Kabha Thondam (Pitha-Kabha Derangement)");
  const [naadiDiagnosis, setNaadiDiagnosis] = useState("Vali-Azhal Naadi (Rapid bounding pulse)");
  const [envagaiThervu, setEnvagaiThervu] = useState("Naa: White-coated; Niram: Pale yellow; Moothiram: High specific gravity");

  // Homeopathy
  const [dominantMiasm, setDominantMiasm] = useState("Psora with secondary Sycotic diathesis");
  const [repertoryRubrics, setRepertoryRubrics] = useState("Stomach; dyspepsia from rich food; worse after midnight; restless anxiety");
  const [modalities, setModalities] = useState("< Cold drinks, < Mental exertion, > Warm applications");

  // Yoga & Naturopathy
  const [panchaKosha, setPanchaKosha] = useState("Annamaya (Digestive stagnation) & Pranamaya (Shallow thoracic rhythm)");
  const [vitalityScore, setVitalityScore] = useState("72 / 100 (Moderate Vital Force)");

  // Clinical Diagnosis & Coding
  const [diagnosisTitle, setDiagnosisTitle] = useState("Medoroga with Agnimandya (Dyslipidemic Dyspepsia)");
  const [namasteCode, setNamasteCode] = useState("AYU-DIS-0344");
  const [icd11Code, setIcd11Code] = useState("5B81.0 (Metabolic dysregulation) / DD90.0");

  // Prescribed Traditional Medicines
  const [prescriptions, setPrescriptions] = useState<Array<{
    id: string;
    medicineName: string;
    formulation: string;
    dosage: string;
    anupana: string;
    kala: string;
    duration: string;
    instructions: string;
  }>>([
    {
      id: "rx-1",
      medicineName: "Arogyavardhini Vati",
      formulation: "Vati (Tablet 250mg)",
      dosage: "1 tablet BD (twice daily)",
      anupana: "Ushnodaka (Lukewarm water)",
      kala: "Adhobhakta (Post meals)",
      duration: "30 days",
      instructions: "Stagger by 2 hours from Atorvastatin. Regular hepatic enzymes review."
    },
    {
      id: "rx-2",
      medicineName: "Arjuna Ksheerapaka",
      formulation: "Medicated Milk Decoction",
      dosage: "50 ml once daily in the morning",
      anupana: "Godugdha (Cow's milk)",
      kala: "Pragbhakta (Before breakfast)",
      duration: "45 days",
      instructions: "Cardio-protective supportive formulation. Monitor BP daily."
    }
  ]);

  // Treatment / Therapy Protocol
  const [therapyPlan, setTherapyPlan] = useState("Deepana & Pachana (5 days) followed by 7 sessions of dry Triphala Udwartana massage.");
  const [dietaryPathya, setDietaryPathya] = useState("Pathya: Mudga soup, boiled seasonal vegetables, cumin tea. Apathya: Cold curd, deep fried items, late dinners.");
  const [yogaProtocol, setYogaProtocol] = useState("15 min Nadi Shodhana, 10 min Vajrasana post meals, Pawanmuktasana series.");

  // Human In The Loop Doctor Approval
  const [doctorName, setDoctorName] = useState("Dr. Rajeshwar Shastri, BAMS, MD (Ayur)");
  const [registrationNo, setRegistrationNo] = useState("NCISM-AY-2023-8841");
  const [isSigned, setIsSigned] = useState(false);
  const [signedTimestamp, setSignedTimestamp] = useState<string | null>(null);

  // New Rx form state
  const [newMedName, setNewMedName] = useState("");
  const [newDosage, setNewDosage] = useState("1 tablet BD");
  const [newAnupana, setNewAnupana] = useState("Warm water");
  const [newKala, setNewKala] = useState("Post meals");
  const [newDuration, setNewDuration] = useState("30 days");

  const handleAddMedicine = () => {
    if (!newMedName.trim()) return;
    setPrescriptions([
      ...prescriptions,
      {
        id: `rx-${Date.now()}`,
        medicineName: newMedName.trim(),
        formulation: "Standard Classical Preparation",
        dosage: newDosage,
        anupana: newAnupana,
        kala: newKala,
        duration: newDuration,
        instructions: "Take as directed under clinical supervision."
      }
    ]);
    setNewMedName("");
  };

  const handleRemoveMedicine = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const handleSignEncounter = () => {
    setIsSigned(true);
    setSignedTimestamp(new Date().toLocaleString());
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> NABH-AYUSH Chapter 1 & 2 Compliant
            </span>
            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-black px-3 py-1 rounded-full border border-cyan-500/30">
              NAMASTE & ICD-11 Dual Coded
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-black tracking-tight">
            Integrated AYUSH Clinical EHR
          </h2>
          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-normal">
            Comprehensive traditional medicine encounter management covering clinical history, constitutional Prakriti/Mizaj/Mukkuttram diagnostics, classical formulation e-Prescriptions with Anupana & Kala timing, and cross-system allopathic drug reconciliations.
          </p>
        </div>
      </div>

      {/* SYSTEM SELECTOR TABS */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        {(["Ayurveda", "Unani", "Siddha", "Homeopathy", "Yoga & Naturopathy"] as AyushSystem[]).map(sys => (
          <button
            key={sys}
            onClick={() => setSelectedSystem(sys)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              selectedSystem === sys
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>
              {sys === "Ayurveda" ? "🌿" : sys === "Unani" ? "⚜️" : sys === "Siddha" ? "🪔" : sys === "Homeopathy" ? "💧" : "🧘"}
            </span>
            {sys}
          </button>
        ))}
      </div>

      {/* STEP 1: PATIENT PROFILE & ALLOPATHIC INTEGRATION */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                1. Patient Identity & Allopathic Cross-History
              </h3>
              <p className="text-xs text-slate-500">ABDM Linked Health Record with live prescription synchronization</p>
            </div>
          </div>
          {onNavigateToTimeline && (
            <button
              onClick={onNavigateToTimeline}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Longitudinal Allopathic Timeline &rarr;
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Patient Full Name</label>
            <input
              type="text"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Age & Gender</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={patientAge}
                onChange={e => setPatientAge(e.target.value)}
                className="w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              />
              <select
                value={patientGender}
                onChange={e => setPatientGender(e.target.value)}
                className="w-1/2 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">ABHA Health ID</label>
            <input
              type="text"
              value={abhaId}
              onChange={e => setAbhaId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Symptom Duration</label>
            <input
              type="text"
              value={symptomDuration}
              onChange={e => setSymptomDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Chief Complaints & Clinical Presentation</label>
            <textarea
              rows={2}
              value={chiefComplaints}
              onChange={e => setChiefComplaints(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-black text-amber-700 uppercase mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" /> Concurrent Allopathic Medications (Critical for Interaction Check)
              </label>
              <input
                type="text"
                value={allopathicMeds}
                onChange={e => setAllopathicMeds(e.target.value)}
                placeholder="e.g. Atorvastatin 20mg, Metformin 500mg, Warfarin"
                className="w-full px-3.5 py-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Documented Drug / Herbal Allergies</label>
              <input
                type="text"
                value={knownAllergies}
                onChange={e => setKnownAllergies(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: SYSTEM-SPECIFIC CONSTITUTIONAL DIAGNOSTICS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              2. {selectedSystem} Constitutional Assessment (Examination & Diathesis)
            </h3>
            <p className="text-xs text-slate-500">Standardized traditional clinical metrics according to classical authoritative texts</p>
          </div>
        </div>

        {selectedSystem === "Ayurveda" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-[10px] font-black text-emerald-800 uppercase">Prakriti (Basic Constitution)</span>
              <select
                value={prakritiPrimary}
                onChange={e => setPrakritiPrimary(e.target.value)}
                className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option>Vata-Pitta</option>
                <option>Pitta-Kapha</option>
                <option>Kapha-Vata</option>
                <option>Sama-Doshaja (Tridosha Balanced)</option>
              </select>
              <p className="text-[10px] text-slate-500">Inherent genetic & phenotypic bio-energetic balance</p>
            </div>

            <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-[10px] font-black text-emerald-800 uppercase">Vikriti (Current Morbid Imbalance)</span>
              <input
                type="text"
                value={vikritiDosha}
                onChange={e => setVikritiDosha(e.target.value)}
                className="w-full p-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800"
              />
              <p className="text-[10px] text-slate-500">Active derangement responsible for presenting illness</p>
            </div>

            <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-[10px] font-black text-emerald-800 uppercase">Agni Pariksha (Digestive Fire)</span>
              <select
                value={agniState}
                onChange={e => setAgniState(e.target.value)}
                className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option>Manda (Sluggish - Kapha)</option>
                <option>Tikshna (Intense/Acidic - Pitta)</option>
                <option>Vishama (Irregular - Vata)</option>
                <option>Sama (Equilibrated)</option>
              </select>
              <p className="text-[10px] text-slate-500">Metabolic processing capacity</p>
            </div>

            <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-[10px] font-black text-emerald-800 uppercase">Koshtha (Bowel Habit)</span>
              <select
                value={koshthaState}
                onChange={e => setKoshthaState(e.target.value)}
                className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option>Krura (Costive / Dry - Vata)</option>
                <option>Madhyama (Balanced elimination)</option>
                <option>Mrudu (Soft / Purgative lax - Pitta)</option>
              </select>
              <p className="text-[10px] text-slate-500">Determines dosage of purifying purgatives</p>
            </div>
          </div>
        )}

        {selectedSystem === "Unani" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-2">
              <span className="text-[10px] font-black text-indigo-800 uppercase">Mizaj (Inherent Temperament)</span>
              <select
                value={mizajPrimary}
                onChange={e => setMizajPrimary(e.target.value)}
                className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option>Damwi (Sanguine - Hot & Moist)</option>
                <option>Balghami (Phlegmatic - Cold & Moist)</option>
                <option>Safrawi (Choleric - Hot & Dry)</option>
                <option>Saudawi (Melancholic - Cold & Dry)</option>
              </select>
            </div>
            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-2">
              <span className="text-[10px] font-black text-indigo-800 uppercase">Ghalba-e-Akhlat (Morbid Humoral Excess)</span>
              <input
                type="text"
                value={morbidHumor}
                onChange={e => setMorbidHumor(e.target.value)}
                className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-2">
              <span className="text-[10px] font-black text-indigo-800 uppercase">Quwa & Tabiyat (Vital Faculties)</span>
              <input
                type="text"
                value={quwaState}
                onChange={e => setQuwaState(e.target.value)}
                className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        )}

        {selectedSystem === "Siddha" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100 space-y-2">
              <span className="text-[10px] font-black text-amber-800 uppercase">Mukkuttram (Three Humors)</span>
              <select
                value={mukkuttram}
                onChange={e => setMukkuttram(e.target.value)}
                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option>Vali (Air dominance)</option>
                <option>Azhal (Fire dominance)</option>
                <option>Iyyam (Water dominance)</option>
                <option>Azhal-Kabha Thondam (Dual derangement)</option>
              </select>
            </div>
            <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100 space-y-2">
              <span className="text-[10px] font-black text-amber-800 uppercase">Naadi (Pulse Assessment)</span>
              <input
                type="text"
                value={naadiDiagnosis}
                onChange={e => setNaadiDiagnosis(e.target.value)}
                className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
            <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100 space-y-2">
              <span className="text-[10px] font-black text-amber-800 uppercase">Envagai Thervu (8 Classical Signs)</span>
              <input
                type="text"
                value={envagaiThervu}
                onChange={e => setEnvagaiThervu(e.target.value)}
                className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        )}

        {selectedSystem === "Homeopathy" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-cyan-50/40 rounded-2xl border border-cyan-100 space-y-2">
              <span className="text-[10px] font-black text-cyan-800 uppercase">Miasmatic Diathesis</span>
              <select
                value={dominantMiasm}
                onChange={e => setDominantMiasm(e.target.value)}
                className="w-full p-2.5 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option>Psora (Functional hypersensitivity)</option>
                <option>Sycosis (Hyperplastic / Retention)</option>
                <option>Syphilis (Destructive / Degenerative)</option>
                <option>Tubercular Diathesis</option>
              </select>
            </div>
            <div className="p-4 bg-cyan-50/40 rounded-2xl border border-cyan-100 space-y-2">
              <span className="text-[10px] font-black text-cyan-800 uppercase">Dominant Rubrics</span>
              <input
                type="text"
                value={repertoryRubrics}
                onChange={e => setRepertoryRubrics(e.target.value)}
                className="w-full p-2 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
            <div className="p-4 bg-cyan-50/40 rounded-2xl border border-cyan-100 space-y-2">
              <span className="text-[10px] font-black text-cyan-800 uppercase">Modalities & Generals</span>
              <input
                type="text"
                value={modalities}
                onChange={e => setModalities(e.target.value)}
                className="w-full p-2 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        )}

        {selectedSystem === "Yoga & Naturopathy" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-2">
              <span className="text-[10px] font-black text-rose-800 uppercase">Pancha Kosha Imbalance</span>
              <input
                type="text"
                value={panchaKosha}
                onChange={e => setPanchaKosha(e.target.value)}
                className="w-full p-2 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
            <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-2">
              <span className="text-[10px] font-black text-rose-800 uppercase">Vitality & Autonomic Tone</span>
              <input
                type="text"
                value={vitalityScore}
                onChange={e => setVitalityScore(e.target.value)}
                className="w-full p-2 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        )}

        {/* DUAL NAMASTE / ICD-11 CODING */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Clinical Diagnosis (Clinical Term)</label>
            <input
              type="text"
              value={diagnosisTitle}
              onChange={e => setDiagnosisTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-emerald-700 uppercase mb-1">NAMASTE National Standard Code</label>
            <input
              type="text"
              value={namasteCode}
              onChange={e => setNamasteCode(e.target.value)}
              className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-blue-700 uppercase mb-1">WHO ICD-11 Dual Mapping Code</label>
            <input
              type="text"
              value={icd11Code}
              onChange={e => setIcd11Code(e.target.value)}
              className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-mono font-bold text-blue-900"
            />
          </div>
        </div>
      </div>

      {/* STEP 3: MEDICINE PRESCRIPTION WITH ANUPANA & KALA */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                3. Classical Formulation e-Prescription (Pharmacopoeia Standard)
              </h3>
              <p className="text-xs text-slate-500">Specified with Anupana (carrier vehicle), Kala (timing), and dosage</p>
            </div>
          </div>
          {onCheckInteractions && (
            <button
              onClick={() => onCheckInteractions(prescriptions.map(p => p.medicineName), allopathicMeds.split(","))}
              className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Run Herb-Allopathic Check
            </button>
          )}
        </div>

        {/* PRESCRIPTION TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] font-black">
                <th className="py-3 px-4">Formulation Name</th>
                <th className="py-3 px-3">Form / Type</th>
                <th className="py-3 px-3">Dosage</th>
                <th className="py-3 px-3">Anupana (Vehicle)</th>
                <th className="py-3 px-3">Kala (Timing)</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescriptions.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-black text-slate-800">{item.medicineName}</td>
                  <td className="py-3.5 px-3 text-slate-600 font-semibold">{item.formulation}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-800">{item.dosage}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700 bg-amber-50/40 rounded-lg">{item.anupana}</td>
                  <td className="py-3.5 px-3 text-slate-600 font-semibold">{item.kala}</td>
                  <td className="py-3.5 px-3 text-slate-600 font-bold">{item.duration}</td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => handleRemoveMedicine(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADD MEDICINE INPUT STRIP */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-[10px] font-black text-slate-500 uppercase block">Add Formulation to Prescription</span>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Formulation Name (e.g. Ashwagandharishta)"
                value={newMedName}
                onChange={e => setNewMedName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Dosage (e.g. 1 tab BD)"
                value={newDosage}
                onChange={e => setNewDosage(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Anupana (e.g. Warm water)"
                value={newAnupana}
                onChange={e => setNewAnupana(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Kala (e.g. Post-meal)"
                value={newKala}
                onChange={e => setNewKala(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: TREATMENT, DIET (AHARA) & YOGA (VIHARA) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              4. Treatment Protocol, Pathya Ahara & Vihara Lifestyle
            </h3>
            <p className="text-xs text-slate-500">Panchakarma / Ilaj-bit-Tadbeer / Thokkanam / Yoga prescriptions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase">Therapy / Panchakarma Plan</label>
            <textarea
              rows={3}
              value={therapyPlan}
              onChange={e => setTherapyPlan(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase">Pathya & Apathya (Dietary Regimen)</label>
            <textarea
              rows={3}
              value={dietaryPathya}
              onChange={e => setDietaryPathya(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase">Yoga Therapy & Daily Dinacharya</label>
            <textarea
              rows={3}
              value={yogaProtocol}
              onChange={e => setYogaProtocol(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* STEP 5: LICENSED DOCTOR APPROVAL & DIGITAL SIGNATURE (HITL GATE) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
              Human-In-The-Loop (HITL) Clinical Gate
            </span>
            <h4 className="text-base font-black text-white">
              Licensed AYUSH Clinician Encounter Sign-Off
            </h4>
          </div>
          {isSigned && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Digitally Signed & Locked into EHR
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Attending Clinician</label>
            <input
              type="text"
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
              disabled={isSigned}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">NCISM / NCH Board Registration</label>
            <input
              type="text"
              value={registrationNo}
              onChange={e => setRegistrationNo(e.target.value)}
              disabled={isSigned}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Status</label>
            <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300">
              {isSigned ? `Signed at ${signedTimestamp}` : "Pending Physician Signature"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {!isSigned ? (
            <button
              onClick={handleSignEncounter}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <CheckCircle className="w-4 h-4" /> Sign & Commit Encounter to Health Record
            </button>
          ) : (
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print NABH-Standard AYUSH e-Prescription
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
