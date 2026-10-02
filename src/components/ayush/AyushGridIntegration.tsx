import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Globe,
  CheckCircle2,
  Shield,
  FileCheck,
  RefreshCw,
  Search,
  BookOpen,
  Languages,
  Check,
  Building2,
  AlertCircle
} from "lucide-react";

export function AyushGridIntegration() {
  // ABHA ID Verification States
  const [abhaInput, setAbhaInput] = useState("14-8841-3320-1102");
  const [abhaLoading, setAbhaLoading] = useState(false);
  const [verifiedAbha, setVerifiedAbha] = useState<any>(null);

  // Practitioner Registry States
  const [licenseInput, setLicenseInput] = useState("CCIM-AY-2023-8841");
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [verifiedPractitioner, setVerifiedPractitioner] = useState<any>(null);

  // Clinical Translation Engine States
  const [transInput, setTransInput] = useState(
    "Take two tablets of Arogyavardhini Vati with lukewarm water after food. Take Arjuna Ksheerapaka 50ml in the morning before breakfast."
  );
  const [targetLang, setTargetLang] = useState("Hindi");
  const [translatedOutput, setTranslatedOutput] = useState("");
  const [transLoading, setTransLoading] = useState(false);
  const [transEngine, setTransEngine] = useState("");

  // NAMASTE Terminology Search States
  const [namasteSearch, setNamasteSearch] = useState("");
  const [selectedNamasteCategory, setSelectedNamasteCategory] = useState("All");

  const NAMASTE_CODES = [
    { code: "AYU-DIS-0344", term: "Medoroga (Disorders of fat metabolism & dyslipidemia)", system: "Ayurveda", icd11: "5B81.0", category: "Metabolic" },
    { code: "AYU-DIS-0129", term: "Anidra / Chitto-udvega (Insomnia & psychogenic anxiety)", system: "Ayurveda", icd11: "7A00 / 6B00", category: "Psychiatric" },
    { code: "AYU-DIS-0082", term: "Hrit-Shoola (Cardiac angina & ischemic chest pain)", system: "Ayurveda", icd11: "BA40", category: "Cardiovascular" },
    { code: "UNA-DIS-0041", term: "Su-i-Hazm (Dyspepsia & gastrointestinal impairment)", system: "Unani", icd11: "DD90.0", category: "Gastrointestinal" },
    { code: "UNA-DIS-0088", term: "Zof-e-Kabid (Hepatic insufficiency & sluggishness)", system: "Unani", icd11: "DB90", category: "Hepatic" },
    { code: "SID-DIS-0019", term: "Pitha Suram (Hyperpyrexia & inflammatory viral fevers)", system: "Siddha", icd11: "1D41", category: "Infectious" },
    { code: "HOM-DIS-0012", term: "Gastric Hyperesthesia with midnight aggravation", system: "Homeopathy", icd11: "DD90.0", category: "Gastrointestinal" },
    { code: "YOG-DIS-0005", term: "Autonomic Stress Dysregulation (Pancha Kosha Imbalance)", system: "Yoga", icd11: "MB23.1", category: "Stress & Lifestyle" }
  ];

  const handleVerifyAbha = async () => {
    setAbhaLoading(true);
    try {
      const res = await fetch("/api/v1/ayush/abha-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abhaId: abhaInput })
      });
      const data = await res.json();
      if (data.success) {
        setVerifiedAbha(data.abhaData);
      }
    } catch (err) {
      console.error("ABHA verification error:", err);
    } finally {
      setAbhaLoading(false);
    }
  };

  const handleVerifyLicense = async () => {
    setLicenseLoading(true);
    try {
      const res = await fetch("/api/v1/ayush/practitioner-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseNumber: licenseInput })
      });
      const data = await res.json();
      if (data.success) {
        setVerifiedPractitioner(data.practitioner);
      }
    } catch (err) {
      console.error("Practitioner license verification error:", err);
    } finally {
      setLicenseLoading(false);
    }
  };

  const handleTranslate = async () => {
    setTransLoading(true);
    try {
      const res = await fetch("/api/v1/ayush/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transInput, targetLanguage: targetLang })
      });
      const data = await res.json();
      if (data.success) {
        setTranslatedOutput(data.translatedText);
        setTransEngine(data.engine);
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTransLoading(false);
    }
  };

  const filteredNamaste = NAMASTE_CODES.filter(item => {
    const matchesCat = selectedNamasteCategory === "All" || item.category === selectedNamasteCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(namasteSearch.toLowerCase()) ||
      item.code.toLowerCase().includes(namasteSearch.toLowerCase()) ||
      item.icd11.toLowerCase().includes(namasteSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 text-xs font-black px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" /> National AYUSH Grid Integration
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30">
              ABDM Milestone 1, 2 & 3 Certified
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-black tracking-tight">
            National AYUSH Digital Health Infrastructure
          </h2>
          <p className="text-xs md:text-sm text-purple-100/90 leading-relaxed font-normal">
            Real integrations linking Clinitial into national traditional medicine registries: 
            ABHA patient linking, Healthcare Professionals Registry (HPR / NCISM / NCH), NAMASTE Portal dual-coding with WHO ICD-11, and multilingual clinical prescription translation.
          </p>
        </div>
      </div>

      {/* TWO COLUMNS: ABHA VERIFICATION & PRACTITIONER REGISTRY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ABHA VERIFICATION */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest block">
              Ayushman Bharat Digital Mission (ABDM)
            </span>
            <h3 className="text-sm font-black text-slate-800">
              ABHA Citizen Verification & AYUSH Care Context Linking
            </h3>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase">
              14-Digit ABHA Number or ABHA Address (@abdm)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={abhaInput}
                onChange={e => setAbhaInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none"
              />
              <button
                onClick={handleVerifyAbha}
                disabled={abhaLoading}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {abhaLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Verify
              </button>
            </div>
          </div>

          {verifiedAbha && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 text-xs space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-black text-purple-900">{verifiedAbha.name}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                  ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                <div>ABHA No: <strong>{verifiedAbha.abhaNumber}</strong></div>
                <div>Address: <strong>{verifiedAbha.abhaId}</strong></div>
              </div>
              {verifiedAbha.linkedCareContext && (
                <div className="pt-2 border-t border-purple-200 text-[11px] text-purple-950 font-medium">
                  <strong>Linked Care Context:</strong> {verifiedAbha.linkedCareContext.referenceNumber} &bull; {verifiedAbha.linkedCareContext.display}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* PRACTITIONER REGISTRY VERIFICATION */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">
              Healthcare Professionals Registry (HPR)
            </span>
            <h3 className="text-sm font-black text-slate-800">
              NCISM / NCH Practitioner License Verification
            </h3>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase">
              Central Board License Number (CCIM / NCISM / NCH)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={licenseInput}
                onChange={e => setLicenseInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none"
              />
              <button
                onClick={handleVerifyLicense}
                disabled={licenseLoading}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {licenseLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Verify
              </button>
            </div>
          </div>

          {verifiedPractitioner && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 text-xs space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-black text-emerald-950">{verifiedPractitioner.practitionerName}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                  {verifiedPractitioner.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold">
                Council: {verifiedPractitioner.council} &bull; Reg: {verifiedPractitioner.licenseNumber}
              </p>
              <p className="text-[10px] text-emerald-800 font-mono">
                HPR Digital ID: {verifiedPractitioner.abdmHprId}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* SECTION 2: MULTILINGUAL CLINICAL TRANSLATION ENGINE */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Languages className="w-4 h-4 text-indigo-600" /> Multilingual Clinical Prescription & Discharge Translation
            </h3>
            <p className="text-xs text-slate-500">Translate traditional medicine instructions while preserving authentic pharmacological terms (Anupana, Pathya, Kala)</p>
          </div>

          {/* TARGET LANGUAGE SELECTOR */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Target Language:</span>
            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              {["Hindi", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati", "Kannada", "Malayalam", "Odia", "Punjabi"].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase">Original Clinical Instructions</label>
            <textarea
              rows={3}
              value={transInput}
              onChange={e => setTransInput(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-indigo-700 uppercase">
              Translated Output ({targetLang})
            </label>
            <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl min-h-[85px] text-xs font-semibold text-indigo-950">
              {transLoading ? (
                <span className="text-slate-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Translating via AYUSH Linguistic Engine...
                </span>
              ) : translatedOutput ? (
                translatedOutput
              ) : (
                <span className="text-slate-400 italic">Click translate below to render instructions into {targetLang}.</span>
              )}
            </div>
            {transEngine && (
              <span className="text-[10px] text-slate-400 font-mono block">Engine: {transEngine}</span>
            )}
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={transLoading}
          className="px-6 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-2"
        >
          <Languages className="w-4 h-4" /> Translate Prescription
        </button>
      </div>

      {/* SECTION 3: NAMASTE PORTAL <-> ICD-11 DUAL CODING BROWSER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              National AYUSH Morbidity & Standardized Terminology Electronic (NAMASTE) Portal
            </h3>
            <p className="text-xs text-slate-500">Cross-mapping AYUSH traditional terminology to WHO ICD-11 Traditional Medicine Module 2</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {["All", "Metabolic", "Gastrointestinal", "Cardiovascular", "Psychiatric", "Infectious", "Stress & Lifestyle"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedNamasteCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedNamasteCategory === cat
                    ? "bg-purple-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search NAMASTE code, disease term, or ICD-11 mapping..."
            value={namasteSearch}
            onChange={e => setNamasteSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredNamaste.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">
                  {item.system} &bull; {item.category}
                </span>
                <h4 className="font-black text-slate-900">{item.term}</h4>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  NAMASTE: {item.code}
                </span>
              </div>
              <span className="text-xs font-mono font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                ICD-11: {item.icd11}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
