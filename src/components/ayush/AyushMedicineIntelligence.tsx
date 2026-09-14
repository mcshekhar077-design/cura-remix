import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  BookOpen,
  AlertTriangle,
  Shield,
  CheckCircle2,
  AlertCircle,
  Pill,
  Sparkles,
  Info,
  ChevronRight,
  Filter,
  Copy,
  Printer,
  ExternalLink,
  Plus
} from "lucide-react";
import { AyushMedicineItem, HerbDrugInteractionAlert, DuplicateIngredientWarning, AyushSystem } from "./AyushTypes";

export function AyushMedicineIntelligence() {
  const [medicines, setMedicines] = useState<AyushMedicineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<string>("All");
  const [selectedMedicine, setSelectedMedicine] = useState<AyushMedicineItem | null>(null);

  // Cross-System Herb-Drug Checker States
  const [selectedAyushMeds, setSelectedAyushMeds] = useState<string[]>([
    "Arogyavardhini Vati",
    "Arjuna Ksheerapaka"
  ]);
  const [allopathicInput, setAllopathicInput] = useState<string>("Atorvastatin, Telmisartan, Metformin");
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [interactionAlerts, setInteractionAlerts] = useState<HerbDrugInteractionAlert[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<DuplicateIngredientWarning[]>([]);
  const [safetyScore, setSafetyScore] = useState<number | null>(null);

  // Fetch medicines from backend API
  useEffect(() => {
    async function loadMedicines() {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/ayush/medicines");
        const data = await res.json();
        if (data.success && data.medicines) {
          setMedicines(data.medicines);
        }
      } catch (err) {
        console.error("Error loading medicines:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMedicines();
  }, []);

  // Run interaction check via real backend
  const handleCheckInteractions = async () => {
    setCheckingInteractions(true);
    try {
      const allopathics = allopathicInput.split(",").map(s => s.trim()).filter(Boolean);
      const res = await fetch("/api/v1/ayush/interaction-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ayushMedicines: selectedAyushMeds,
          allopathicMedicines: allopathics
        })
      });
      const data = await res.json();
      if (data.success) {
        setInteractionAlerts(data.alerts || []);
        setDuplicateWarnings(data.duplicateWarnings || []);
        setSafetyScore(data.crossSystemSafetyScore ?? 90);
      }
    } catch (err) {
      console.error("Error checking interactions:", err);
    } finally {
      setCheckingInteractions(false);
    }
  };

  const filteredMedicines = medicines.filter(m => {
    const matchesSystem = selectedSystem === "All" || m.system === selectedSystem;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.keyIngredients.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.indications.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSystem && matchesSearch;
  });

  const toggleAyushMedSelection = (name: string) => {
    if (selectedAyushMeds.includes(name)) {
      setSelectedAyushMeds(selectedAyushMeds.filter(n => n !== name));
    } else {
      setSelectedAyushMeds([...selectedAyushMeds, name]);
    }
  };

  return (
    <div className="space-y-8">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 text-xs font-black px-3 py-1 rounded-full border border-teal-500/30 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" /> Ayurvedic & AYUSH Pharmacopoeia
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Herb-Allopathic Safety Engine
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-black tracking-tight">
            AYUSH Medicine Intelligence & Cross-Interaction Suite
          </h2>
          <p className="text-xs md:text-sm text-teal-100/90 leading-relaxed font-normal">
            Bridging classical AYUSH pharmacopoeia with modern allopathic pharmacovigilance. 
            Search standardized classical formulations, explore active botanical constituents and classical references, and screen prescriptions against concurrent allopathic medications to avert adverse herb-drug reactions.
          </p>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE HERB-DRUG INTERACTION CHECKER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Cross-System Herb-Drug Pharmacovigilance Engine
            </h3>
            <p className="text-xs text-slate-500">Live screening between AYUSH herbal formulations and conventional allopathic pharmaceuticals</p>
          </div>
          {safetyScore !== null && (
            <div className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 ${
              safetyScore >= 80 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
              safetyScore >= 50 ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}>
              <span>Cross-System Safety Score:</span>
              <span className="text-sm font-mono">{safetyScore}%</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selected AYUSH medicines */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-emerald-800 uppercase">
              Prescribed AYUSH Formulations
            </label>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-[90px] flex flex-wrap gap-2 items-center">
              {selectedAyushMeds.map((med, i) => (
                <span
                  key={i}
                  className="bg-emerald-100/80 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5"
                >
                  🌿 {med}
                  <button
                    onClick={() => toggleAyushMedSelection(med)}
                    className="hover:text-rose-700 text-slate-400 font-bold ml-1 cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {selectedAyushMeds.length === 0 && (
                <span className="text-xs text-slate-400 font-medium italic">
                  Select formulations from the database below or click quick-add buttons.
                </span>
              )}
            </div>

            {/* Quick swatches */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Ashwagandharishta", "Arogyavardhini Vati", "Arjuna Ksheerapaka", "Nilavembu Kudineer", "Shilajit Vati"].map(quick => (
                <button
                  key={quick}
                  onClick={() => toggleAyushMedSelection(quick)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    selectedAyushMeds.includes(quick)
                      ? "bg-emerald-700 text-white border-emerald-700"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  + {quick}
                </button>
              ))}
            </div>
          </div>

          {/* Concurrent allopathic medicines */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-amber-800 uppercase">
              Concurrent Conventional (Allopathic) Medications
            </label>
            <input
              type="text"
              value={allopathicInput}
              onChange={e => setAllopathicInput(e.target.value)}
              placeholder="e.g. Atorvastatin, Warfarin, Metformin, Levothyroxine, Metoprolol"
              className="w-full px-3.5 py-3 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
            />

            {/* Quick allopathic swatches */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Atorvastatin", "Warfarin", "Metformin", "Levothyroxine", "Metoprolol", "Clonazepam", "Furosemide"].map(allo => (
                <button
                  key={allo}
                  onClick={() => {
                    const current = allopathicInput.split(",").map(s => s.trim()).filter(Boolean);
                    if (!current.includes(allo)) {
                      setAllopathicInput([...current, allo].join(", "));
                    }
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-white text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer"
                >
                  + {allo}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleCheckInteractions}
          disabled={checkingInteractions}
          className="w-full py-3.5 bg-teal-900 hover:bg-teal-950 disabled:bg-slate-300 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer shadow-lg shadow-teal-900/10"
        >
          {checkingInteractions ? (
            <span>Analyzing Pharmacological Pathways & Metabolism...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-teal-300" /> Run Cross-System Herb-Drug Safety Verification
            </>
          )}
        </button>

        {/* ALERTS & FINDINGS */}
        {interactionAlerts.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Detected Herb-Allopathic Interactions ({interactionAlerts.length})
            </h4>

            <div className="space-y-3">
              {interactionAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    alert.severity === "CONTRAINDICATED"
                      ? "bg-rose-50 border-rose-200 text-rose-950"
                      : alert.severity === "MAJOR"
                      ? "bg-amber-50 border-amber-200 text-amber-950"
                      : "bg-blue-50 border-blue-200 text-blue-950"
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        alert.severity === "CONTRAINDICATED"
                          ? "bg-rose-600 text-white"
                          : alert.severity === "MAJOR"
                          ? "bg-amber-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}>
                        {alert.severity} Risk
                      </span>
                      <strong className="text-sm font-black">{alert.title}</strong>
                    </div>
                    <span className="font-mono text-[11px] font-bold">
                      {alert.herbOrAyush} &harr; {alert.allopathicDrug}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed font-semibold">
                    <strong>Mechanism:</strong> {alert.mechanism}
                  </p>

                  <div className="p-2.5 bg-white/80 rounded-xl border border-black/5 text-[11px] font-medium space-y-1">
                    <div>
                      <strong className="text-slate-800">Actionable Clinical Recommendation:</strong> {alert.clinicalRecommendation}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      <strong>Literature Citation:</strong> {alert.literatureEvidence}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DUPLICATE INGREDIENT WARNINGS */}
        {duplicateWarnings.length > 0 && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2 text-xs">
            <span className="text-[10px] font-black text-purple-800 uppercase tracking-wider block">
              Duplicate Phytochemical Warning Across Formulations
            </span>
            {duplicateWarnings.map((dup, idx) => (
              <p key={idx} className="text-purple-950 font-semibold leading-relaxed">
                &bull; {dup.warning}
              </p>
            ))}
          </div>
        )}

        {interactionAlerts.length === 0 && safetyScore === 98 && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>No known adverse pharmacological interactions identified between the selected AYUSH compounds and concurrent allopathic medications.</span>
          </div>
        )}
      </div>

      {/* SECTION 2: SEARCHABLE AYUSH FORMULARY & PHARMACOPOEIA DATABASE */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              AYUSH Standard Formulary & Authoritative Classical Database
            </h3>
            <p className="text-xs text-slate-500">Formulation types, classical references, Anupana vehicles, and clinical indications</p>
          </div>

          {/* SYSTEM FILTER */}
          <div className="flex flex-wrap gap-1.5">
            {["All", "Ayurveda", "Unani", "Siddha", "Homeopathy"].map(sys => (
              <button
                key={sys}
                onClick={() => setSelectedSystem(sys)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedSystem === sys
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by formulation name, herb (e.g. Ashwagandha, Guggulu), classical text, or indication..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* MEDICINE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map(med => (
            <div
              key={med.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-500 transition shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-teal-700 uppercase tracking-wider block">
                      {med.system} &bull; {med.formulationType}
                    </span>
                    <h4 className="text-sm font-black text-slate-900">{med.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                    {med.namasteCode}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div><strong>Reference:</strong> <span className="italic">{med.classicalReference}</span></div>
                  <div><strong>Standard Dosage:</strong> {med.standardDosage}</div>
                  <div className="p-1.5 bg-amber-50/60 rounded-lg text-amber-900">
                    <strong>Anupana (Vehicle):</strong> {med.anupana}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {med.keyIngredients.slice(0, 3).map((ing, i) => (
                    <span key={i} className="text-[9.5px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                      {ing}
                    </span>
                  ))}
                  {med.keyIngredients.length > 3 && (
                    <span className="text-[9.5px] text-slate-400 font-bold self-center">
                      +{med.keyIngredients.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => toggleAyushMedSelection(med.name)}
                  className={`text-[11px] font-black px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                    selectedAyushMeds.includes(med.name)
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {selectedAyushMeds.includes(med.name) ? "✓ Prescribed" : "+ Select for Check"}
                </button>

                <button
                  onClick={() => setSelectedMedicine(med)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                >
                  Formulary Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MEDICINE DETAIL MODAL */}
      <AnimatePresence>
        {selectedMedicine && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-6 text-xs"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest block">
                    {selectedMedicine.system} Pharmacopoeial Monograph
                  </span>
                  <h3 className="text-lg font-black text-slate-800">{selectedMedicine.name}</h3>
                  <span className="text-slate-500 font-mono text-[11px] font-bold">NAMASTE: {selectedMedicine.namasteCode}</span>
                </div>
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="p-1 hover:bg-slate-100 rounded-full transition font-extrabold text-slate-500 cursor-pointer text-base"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Classical Authoritative Citation</span>
                  <p className="font-bold text-slate-800">{selectedMedicine.classicalReference}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Formulation Type</span>
                  <p className="font-bold text-slate-800">{selectedMedicine.formulationType}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Standard Adult Dosage</span>
                  <p className="font-bold text-slate-800">{selectedMedicine.standardDosage}</p>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-2xl space-y-1 border border-amber-100">
                  <span className="text-[10px] font-black text-amber-800 uppercase">Anupana (Carrier) & Kala (Timing)</span>
                  <p className="font-bold text-amber-900">{selectedMedicine.anupana} &bull; {selectedMedicine.kala}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase block">Active Botanical Constituents & Ingredients</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMedicine.keyIngredients.map((ing, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase block">Therapeutic Indications</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMedicine.indications.map((ind, i) => (
                    <span key={i} className="px-3 py-1 bg-teal-50 text-teal-800 font-bold rounded-lg text-xs border border-teal-100">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950 space-y-1">
                <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider block">
                  Pregnancy, Lactation & Contraindications
                </span>
                <p className="font-semibold">{selectedMedicine.pregnancyLactationWarning}</p>
                <div className="text-[11px] text-rose-900">
                  <strong>Strict Contraindications:</strong> {selectedMedicine.contraindications.join("; ")}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    toggleAyushMedSelection(selectedMedicine.name);
                    setSelectedMedicine(null);
                  }}
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-black rounded-xl transition cursor-pointer"
                >
                  {selectedAyushMeds.includes(selectedMedicine.name) ? "Remove from Check" : "Add to Interaction Check"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
