import React, { useState, useMemo } from "react";
import {
  Baby,
  Calculator,
  Scale,
  Pill,
  AlertTriangle,
  CheckCircle,
  Copy,
  Printer,
  Send,
  Sparkles,
  Info,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  ShoppingCart,
  FileText
} from "lucide-react";

export interface PediatricConcentration {
  label: string;
  mg: number;
  ml: number;
  isDrops?: boolean;
  dropsPerMl?: number;
}

export interface PediatricDrug {
  id: string;
  name: string;
  genericName: string;
  category: "antipyretic" | "antibiotic" | "analgesic" | "antiemetic" | "respiratory" | "allergy" | "gastrointestinal" | "custom";
  indication: string;
  dosingBasis: "per_dose" | "per_day";
  recommendedMinMgPerKg: number;
  recommendedMaxMgPerKg: number;
  defaultMgPerKg: number;
  frequency: string;
  dosesPerDay: number;
  maxSingleDoseMg: number;
  maxDailyDoseMg: number;
  adultReferenceDoseMg: number;
  concentrations: PediatricConcentration[];
  minAgeMonths?: number;
  maxAgeYears?: number;
  warnings?: string[];
  clinicalNotes: string;
}

export const PEDIATRIC_FORMULARY: PediatricDrug[] = [
  {
    id: "paracetamol",
    name: "Paracetamol / Acetaminophen Oral Suspension",
    genericName: "Paracetamol",
    category: "antipyretic",
    indication: "Fever reduction and mild-to-moderate pediatric pain relief",
    dosingBasis: "per_dose",
    recommendedMinMgPerKg: 10,
    recommendedMaxMgPerKg: 15,
    defaultMgPerKg: 15,
    frequency: "Every 4 to 6 hours as needed (PRN)",
    dosesPerDay: 4,
    maxSingleDoseMg: 1000,
    maxDailyDoseMg: 4000,
    adultReferenceDoseMg: 650,
    concentrations: [
      { label: "120 mg / 5 mL (Standard Infant/Child Syrup)", mg: 120, ml: 5 },
      { label: "250 mg / 5 mL (Forte Suspension for older children)", mg: 250, ml: 5 },
      { label: "100 mg / 1 mL (Infant Concentrated Oral Drops)", mg: 100, ml: 1, isDrops: true, dropsPerMl: 20 }
    ],
    minAgeMonths: 1,
    warnings: [
      "Do not exceed 4 doses or 60 mg/kg in any 24-hour period.",
      "Check packaging carefully: Infant drops (100mg/mL) are over 4x more concentrated than standard 120mg/5mL syrup.",
      "Never use household kitchen spoons. Always dispense with an oral calibrated syringe."
    ],
    clinicalNotes: "First-line antipyretic for pediatric viral fevers and post-vaccination discomfort."
  },
  {
    id: "ibuprofen",
    name: "Ibuprofen Pediatric Oral Suspension",
    genericName: "Ibuprofen",
    category: "analgesic",
    indication: "Inflammatory fever, otitis pain, juvenile musculoskeletal aches",
    dosingBasis: "per_dose",
    recommendedMinMgPerKg: 5,
    recommendedMaxMgPerKg: 10,
    defaultMgPerKg: 10,
    frequency: "Every 6 to 8 hours with food/milk (PRN)",
    dosesPerDay: 3,
    maxSingleDoseMg: 400,
    maxDailyDoseMg: 1200,
    adultReferenceDoseMg: 400,
    concentrations: [
      { label: "100 mg / 5 mL (Standard Pediatric Suspension)", mg: 100, ml: 5 },
      { label: "40 mg / 1 mL (Infant Drops)", mg: 40, ml: 1, isDrops: true, dropsPerMl: 20 }
    ],
    minAgeMonths: 6,
    warnings: [
      "CONTRAINDICATED in infants under 6 months of age.",
      "Avoid in dehydrated children or suspected Dengue fever (increased bleeding risk).",
      "Administer with milk or food to protect gastric mucosa."
    ],
    clinicalNotes: "Superior to paracetamol for inflammatory conditions such as acute otitis media or soft-tissue swelling."
  },
  {
    id: "amoxicillin",
    name: "Amoxicillin Pediatric Dry Syrup",
    genericName: "Amoxicillin",
    category: "antibiotic",
    indication: "Acute otitis media (AOM), community-acquired pneumonia, strep throat",
    dosingBasis: "per_day",
    recommendedMinMgPerKg: 25,
    recommendedMaxMgPerKg: 90,
    defaultMgPerKg: 45,
    frequency: "Divided into 2 or 3 doses per day (every 8 to 12 hours)",
    dosesPerDay: 2,
    maxSingleDoseMg: 1000,
    maxDailyDoseMg: 3000,
    adultReferenceDoseMg: 500,
    concentrations: [
      { label: "125 mg / 5 mL (Dry Syrup Reconstituted)", mg: 125, ml: 5 },
      { label: "250 mg / 5 mL (Forte Dry Syrup Reconstituted)", mg: 250, ml: 5 }
    ],
    minAgeMonths: 1,
    warnings: [
      "Use high dose (80-90 mg/kg/day) for Acute Otitis Media with suspected penicillin-resistant S. pneumoniae.",
      "Reconstituted suspension must be stored in refrigerator and discarded after 7-14 days.",
      "Check for penicillin / beta-lactam anaphylaxis history prior to dispensing."
    ],
    clinicalNotes: "First-line oral antibiotic for uncomplicated pediatric bacterial respiratory infections."
  },
  {
    id: "amoxicillin-clavulanate",
    name: "Amoxicillin + Potassium Clavulanate (Augmentin / Clavam)",
    genericName: "Amoxicillin + Clavulanic Acid",
    category: "antibiotic",
    indication: "Recurrent otitis media, acute bacterial sinusitis, animal bites, skin infections",
    dosingBasis: "per_day",
    recommendedMinMgPerKg: 25,
    recommendedMaxMgPerKg: 45,
    defaultMgPerKg: 40,
    frequency: "Divided every 12 hours (BID) with meals",
    dosesPerDay: 2,
    maxSingleDoseMg: 1000,
    maxDailyDoseMg: 2000,
    adultReferenceDoseMg: 625,
    concentrations: [
      { label: "228.5 mg / 5 mL (200 mg Amox + 28.5 mg Clav - 7:1 Duo)", mg: 228.5, ml: 5 },
      { label: "457 mg / 5 mL (400 mg Amox + 57 mg Clav - 7:1 Forte)", mg: 457, ml: 5 },
      { label: "156.25 mg / 5 mL (125 mg Amox + 31.25 mg Clav - 4:1 Ratio)", mg: 156.25, ml: 5 }
    ],
    minAgeMonths: 2,
    warnings: [
      "Dosing is calculated on the AMOXICILLIN component to avoid excess clavulanate diarrhea.",
      "7:1 ratio formulations (200/28.5 or 400/57) produce substantially less diarrhea than 4:1 formulations.",
      "Must take with the start of a meal to enhance absorption and minimize GI intolerance."
    ],
    clinicalNotes: "Gold standard oral agent for beta-lactamase producing pediatric organisms."
  },
  {
    id: "azithromycin",
    name: "Azithromycin Oral Suspension",
    genericName: "Azithromycin",
    category: "antibiotic",
    indication: "Atypical mycoplasma pneumonia, acute bacterial sinusitis, pertussis",
    dosingBasis: "per_day",
    recommendedMinMgPerKg: 5,
    recommendedMaxMgPerKg: 10,
    defaultMgPerKg: 10,
    frequency: "Once daily (Day 1: 10mg/kg, Days 2-5: 5mg/kg)",
    dosesPerDay: 1,
    maxSingleDoseMg: 500,
    maxDailyDoseMg: 500,
    adultReferenceDoseMg: 500,
    concentrations: [
      { label: "100 mg / 5 mL (Pediatric Oral Suspension)", mg: 100, ml: 5 },
      { label: "200 mg / 5 mL (Forte Oral Suspension)", mg: 200, ml: 5 }
    ],
    minAgeMonths: 6,
    warnings: [
      "Give at least 1 hour before or 2 hours after meals for optimal bioavailability.",
      "Day 1 is a loading dose (10 mg/kg), followed by 5 mg/kg once daily for days 2 through 5.",
      "Caution in patients with cardiac conduction disorders (prolonged QTc risk)."
    ],
    clinicalNotes: "Macrolide of choice for pediatric penicillin-allergic patients and atypical respiratory pathogens."
  },
  {
    id: "cefixime",
    name: "Cefixime Oral Suspension",
    genericName: "Cefixime",
    category: "antibiotic",
    indication: "Pediatric urinary tract infection (UTI), typhoid fever, acute bronchitis",
    dosingBasis: "per_day",
    recommendedMinMgPerKg: 8,
    recommendedMaxMgPerKg: 10,
    defaultMgPerKg: 8,
    frequency: "Once daily or divided every 12 hours (BID)",
    dosesPerDay: 2,
    maxSingleDoseMg: 400,
    maxDailyDoseMg: 400,
    adultReferenceDoseMg: 400,
    concentrations: [
      { label: "50 mg / 5 mL (Pediatric Dry Syrup)", mg: 50, ml: 5 },
      { label: "100 mg / 5 mL (Forte Dry Syrup)", mg: 100, ml: 5 }
    ],
    minAgeMonths: 6,
    warnings: [
      "Shake well before administration.",
      "For enteric fever (typhoid), duration is typically 10 to 14 days under clinician supervision.",
      "May cause mild transient loose stools."
    ],
    clinicalNotes: "Third-generation cephalosporin with excellent coverage for Gram-negative pediatric pathogens."
  },
  {
    id: "ondansetron",
    name: "Ondansetron Oral Solution / Syrup",
    genericName: "Ondansetron",
    category: "antiemetic",
    indication: "Nausea and persistent vomiting associated with acute gastroenteritis or fever",
    dosingBasis: "per_dose",
    recommendedMinMgPerKg: 0.1,
    recommendedMaxMgPerKg: 0.15,
    defaultMgPerKg: 0.15,
    frequency: "Every 8 hours as needed (PRN)",
    dosesPerDay: 3,
    maxSingleDoseMg: 8,
    maxDailyDoseMg: 24,
    adultReferenceDoseMg: 8,
    concentrations: [
      { label: "2 mg / 5 mL (Pediatric Oral Solution)", mg: 2, ml: 5 },
      { label: "2 mg / 1 mL (Oral Drops)", mg: 2, ml: 1, isDrops: true, dropsPerMl: 20 }
    ],
    minAgeMonths: 6,
    warnings: [
      "Not recommended for infants < 6 months or < 8 kg unless advised by a neonatologist.",
      "Administer 15 minutes before attempting oral rehydration solution (ORS) challenge.",
      "Do not give if child has prolonged QTc interval or severe hypokalemia."
    ],
    clinicalNotes: "Single oral dose facilitates successful oral rehydration in pediatric emergency rooms."
  },
  {
    id: "cetirizine",
    name: "Cetirizine Hydrochloride Syrup",
    genericName: "Cetirizine",
    category: "allergy",
    indication: "Allergic rhinitis, urticaria, acute allergic pruritus",
    dosingBasis: "per_day",
    recommendedMinMgPerKg: 0.25,
    recommendedMaxMgPerKg: 0.5,
    defaultMgPerKg: 0.25,
    frequency: "Once daily in the evening (or divided BID)",
    dosesPerDay: 1,
    maxSingleDoseMg: 10,
    maxDailyDoseMg: 10,
    adultReferenceDoseMg: 10,
    concentrations: [
      { label: "5 mg / 5 mL (Pediatric Syrup)", mg: 5, ml: 5 },
      { label: "10 mg / 1 mL (Concentrated Drops)", mg: 10, ml: 1, isDrops: true, dropsPerMl: 20 }
    ],
    minAgeMonths: 6,
    warnings: [
      "Standard age tiers: 6-23 months: 2.5 mg once daily; 2-5 years: 2.5 mg BID or 5 mg QD; >=6 years: 10 mg QD.",
      "Non-sedating in most children, but mild drowsiness can occur.",
      "Ensure dosage is measured with milliliter oral syringe."
    ],
    clinicalNotes: "Second-generation H1 antihistamine with rapid onset and minimal central sedation."
  },
  {
    id: "salbutamol",
    name: "Salbutamol / Albuterol Oral Syrup",
    genericName: "Salbutamol",
    category: "respiratory",
    indication: "Reversible airway bronchospasm, pediatric reactive airway wheezing",
    dosingBasis: "per_dose",
    recommendedMinMgPerKg: 0.1,
    recommendedMaxMgPerKg: 0.15,
    defaultMgPerKg: 0.1,
    frequency: "Every 6 to 8 hours as needed",
    dosesPerDay: 3,
    maxSingleDoseMg: 4,
    maxDailyDoseMg: 12,
    adultReferenceDoseMg: 4,
    concentrations: [
      { label: "2 mg / 5 mL (Pediatric Bronchodilator Syrup)", mg: 2, ml: 5 }
    ],
    minAgeMonths: 24,
    warnings: [
      "Inhaled salbutamol (via MDI + spacer) is clinically preferred over oral syrup whenever available.",
      "May cause mild fine muscle tremor or tachycardia.",
      "Seek emergency medical attention if wheezing or respiratory distress worsens."
    ],
    clinicalNotes: "Oral beta-2 adrenergic agonist for outpatient bronchospasm when inhalation spacers are unavailable."
  },
  {
    id: "zinc-sulfate",
    name: "Zinc Sulfate Dispersible / Syrup (WHO Diarrhea Protocol)",
    genericName: "Elemental Zinc",
    category: "gastrointestinal",
    indication: "Adjunctive management of acute pediatric diarrhea (WHO / UNICEF guidelines)",
    dosingBasis: "per_day",
    recommendedMinMgPerKg: 1,
    recommendedMaxMgPerKg: 2,
    defaultMgPerKg: 1.5,
    frequency: "Once daily for 14 continuous days",
    dosesPerDay: 1,
    maxSingleDoseMg: 20,
    maxDailyDoseMg: 20,
    adultReferenceDoseMg: 20,
    concentrations: [
      { label: "20 mg / 5 mL (Standard Pediatric Zinc Solution)", mg: 20, ml: 5 },
      { label: "10 mg / 5 mL (Infant Zinc Solution)", mg: 10, ml: 5 }
    ],
    minAgeMonths: 2,
    warnings: [
      "WHO Guideline: <6 months old = 10 mg daily; >=6 months old = 20 mg daily.",
      "Must be continued for full 14 days even after diarrhea resolves to replenish mucosal zinc stores.",
      "Give with or after food to prevent vomiting."
    ],
    clinicalNotes: "Significantly reduces duration, severity, and recurrence of pediatric diarrheal episodes."
  }
];

export interface PediatricDosageCalculatorProps {
  inventoryMedicines?: any[];
  onTransferToDispense?: (params: {
    medicineName: string;
    genericName: string;
    patientName: string;
    patientPhone?: string;
    calculatedDose: string;
    instructions: string;
    estimatedQtyBottles: number;
  }) => void;
  onSendWhatsapp?: (phone: string, text: string) => void;
}

export function PediatricDosageCalculator({
  inventoryMedicines = [],
  onTransferToDispense,
  onSendWhatsapp
}: PediatricDosageCalculatorProps) {
  // Patient parameters
  const [patientName, setPatientName] = useState("Master Aarav Sharma");
  const [guardianPhone, setGuardianPhone] = useState("+91 98450 11223");
  const [ageYears, setAgeYears] = useState<number>(3);
  const [ageMonths, setAgeMonths] = useState<number>(6);
  const [weight, setWeight] = useState<number>(14.5);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightCm, setHeightCm] = useState<number>(96);
  const [gender, setGender] = useState<"male" | "female">("male");

  // Medication Selection
  const [selectedDrugId, setSelectedDrugId] = useState<string>("paracetamol");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConcentrationIdx, setSelectedConcentrationIdx] = useState<number>(0);
  
  // Custom Overrides / Adjustments
  const [customMgPerKg, setCustomMgPerKg] = useState<number | null>(null);
  const [customFrequencyDoses, setCustomFrequencyDoses] = useState<number | null>(null);
  const [courseDurationDays, setCourseDurationDays] = useState<number>(5);

  // Copied toast state
  const [copiedLabel, setCopiedLabel] = useState(false);
  const [whatsappSentNotice, setWhatsappSentNotice] = useState(false);

  // Derived normalized patient values
  const weightKg = useMemo(() => {
    if (weightUnit === "lbs") {
      return Number((weight * 0.453592).toFixed(2));
    }
    return Number(weight);
  }, [weight, weightUnit]);

  const totalAgeMonths = useMemo(() => {
    return (ageYears * 12) + ageMonths;
  }, [ageYears, ageMonths]);

  // Body Surface Area (Mosteller Formula: sqrt((H * W) / 3600))
  const bsaM2 = useMemo(() => {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return 0;
    return Number(Math.sqrt((heightCm * weightKg) / 3600).toFixed(2));
  }, [heightCm, weightKg]);

  // Age Category classification
  const ageCategory = useMemo(() => {
    if (totalAgeMonths < 1) return { label: "Neonate (<28 days)", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
    if (totalAgeMonths < 12) return { label: "Infant (1-11 months)", color: "text-sky-400 bg-sky-500/10 border-sky-500/30" };
    if (totalAgeMonths < 36) return { label: "Toddler (1-3 years)", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    if (totalAgeMonths < 72) return { label: "Preschooler (3-5 years)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (totalAgeMonths < 144) return { label: "School-age (6-11 years)", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" };
    return { label: "Adolescent (12+ years)", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" };
  }, [totalAgeMonths]);

  // Expected 50th percentile weight benchmark (WHO growth standards approximate formula)
  const expectedWeightKg = useMemo(() => {
    if (totalAgeMonths <= 12) {
      return Number(((totalAgeMonths + 9) / 2).toFixed(1));
    }
    if (ageYears <= 5) {
      return Number(((ageYears * 2) + 8).toFixed(1));
    }
    return Number(((ageYears * 3) + 7).toFixed(1));
  }, [totalAgeMonths, ageYears]);

  // Filtered drug list
  const filteredDrugs = useMemo(() => {
    return PEDIATRIC_FORMULARY.filter(drug => {
      const matchesCat = selectedCategory === "all" || drug.category === selectedCategory;
      const matchesQuery = drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.indication.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Active drug
  const activeDrug = useMemo(() => {
    return PEDIATRIC_FORMULARY.find(d => d.id === selectedDrugId) || PEDIATRIC_FORMULARY[0];
  }, [selectedDrugId]);

  // Active concentration
  const activeConcentration = useMemo(() => {
    if (!activeDrug.concentrations || activeDrug.concentrations.length === 0) {
      return { label: "Standard", mg: 100, ml: 5 };
    }
    const safeIdx = Math.min(selectedConcentrationIdx, activeDrug.concentrations.length - 1);
    return activeDrug.concentrations[safeIdx] || activeDrug.concentrations[0];
  }, [activeDrug, selectedConcentrationIdx]);

  // Reset custom overrides when drug changes
  const handleSelectDrug = (drugId: string) => {
    setSelectedDrugId(drugId);
    setSelectedConcentrationIdx(0);
    setCustomMgPerKg(null);
    setCustomFrequencyDoses(null);
  };

  // Active dosing parameters
  const currentMgPerKg = customMgPerKg !== null ? customMgPerKg : activeDrug.defaultMgPerKg;
  const currentDosesPerDay = customFrequencyDoses !== null ? customFrequencyDoses : activeDrug.dosesPerDay;

  // DOSAGE CALCULATIONS
  const calculations = useMemo(() => {
    if (weightKg <= 0) {
      return {
        singleDoseMg: 0,
        dailyDoseMg: 0,
        volumePerDoseMl: 0,
        volumePerDayMl: 0,
        dropsPerDose: 0,
        isCapped: false,
        cappedReason: "",
        clarksRuleMg: 0,
        youngsRuleMg: 0,
        ageWarning: null as string | null,
        totalBottlesNeeded: 1
      };
    }

    let calculatedSingleDoseMg = 0;
    let calculatedDailyDoseMg = 0;

    if (activeDrug.dosingBasis === "per_dose") {
      calculatedSingleDoseMg = weightKg * currentMgPerKg;
      calculatedDailyDoseMg = calculatedSingleDoseMg * currentDosesPerDay;
    } else {
      // per_day basis
      calculatedDailyDoseMg = weightKg * currentMgPerKg;
      calculatedSingleDoseMg = currentDosesPerDay > 0 ? (calculatedDailyDoseMg / currentDosesPerDay) : calculatedDailyDoseMg;
    }

    // Safety Capping Checks against Adult Ceiling
    let isCapped = false;
    let cappedReason = "";

    if (calculatedSingleDoseMg > activeDrug.maxSingleDoseMg) {
      calculatedSingleDoseMg = activeDrug.maxSingleDoseMg;
      calculatedDailyDoseMg = calculatedSingleDoseMg * currentDosesPerDay;
      isCapped = true;
      cappedReason = `Single dose capped at adult threshold of ${activeDrug.maxSingleDoseMg} mg to prevent toxicity.`;
    }

    if (calculatedDailyDoseMg > activeDrug.maxDailyDoseMg) {
      calculatedDailyDoseMg = activeDrug.maxDailyDoseMg;
      calculatedSingleDoseMg = currentDosesPerDay > 0 ? (calculatedDailyDoseMg / currentDosesPerDay) : calculatedDailyDoseMg;
      isCapped = true;
      cappedReason = `Daily cumulative dose capped at adult threshold of ${activeDrug.maxDailyDoseMg} mg/day.`;
    }

    // Volume in mL: (dose in mg / concentration mg) * concentration ml
    const concentrationRatio = activeConcentration.mg / activeConcentration.ml;
    const volumePerDoseMl = concentrationRatio > 0 ? calculatedSingleDoseMg / concentrationRatio : 0;
    const volumePerDayMl = volumePerDoseMl * currentDosesPerDay;

    // Drops calculation if oral drops formulation
    const dropsPerMl = activeConcentration.dropsPerMl || 20;
    const dropsPerDose = activeConcentration.isDrops ? Math.round(volumePerDoseMl * dropsPerMl) : 0;

    // Classical Empirical Rules (for pharmacological comparison)
    const weightInLbs = weightKg * 2.20462;
    const clarksRuleMg = Math.round((weightInLbs / 150) * activeDrug.adultReferenceDoseMg);
    const youngsRuleMg = ageYears > 0 ? Math.round((ageYears / (ageYears + 12)) * activeDrug.adultReferenceDoseMg) : 0;

    // Age validation warning
    let ageWarning: string | null = null;
    if (activeDrug.minAgeMonths && totalAgeMonths < activeDrug.minAgeMonths) {
      ageWarning = `Contraindicated / unapproved for age < ${activeDrug.minAgeMonths} months. Current age is ${totalAgeMonths} months.`;
    }

    // Estimated bottles needed for prescribed course (standard 60ml or 100ml suspension bottle)
    const totalMlNeededForCourse = volumePerDayMl * courseDurationDays;
    const standardBottleSizeMl = 60;
    const totalBottlesNeeded = Math.max(1, Math.ceil(totalMlNeededForCourse / standardBottleSizeMl));

    return {
      singleDoseMg: Number(calculatedSingleDoseMg.toFixed(1)),
      dailyDoseMg: Number(calculatedDailyDoseMg.toFixed(1)),
      volumePerDoseMl: Number(volumePerDoseMl.toFixed(1)),
      volumePerDayMl: Number(volumePerDayMl.toFixed(1)),
      dropsPerDose,
      isCapped,
      cappedReason,
      clarksRuleMg,
      youngsRuleMg,
      ageWarning,
      totalBottlesNeeded
    };
  }, [weightKg, currentMgPerKg, currentDosesPerDay, activeDrug, activeConcentration, ageYears, totalAgeMonths, courseDurationDays]);

  // Find matching inventory SKU in pharmacy stock
  const matchingStock = useMemo(() => {
    return inventoryMedicines.find(m => {
      const nameMatch = m.name?.toLowerCase().includes(activeDrug.genericName.toLowerCase()) ||
        m.genericName?.toLowerCase().includes(activeDrug.genericName.toLowerCase());
      const isSyrupOrDrops = m.category === "syrup" || m.category === "drops";
      return nameMatch && isSyrupOrDrops && m.isActive;
    });
  }, [inventoryMedicines, activeDrug]);

  // Formatted Dispense Instruction String
  const dispenseInstructionsText = useMemo(() => {
    const volStr = activeConcentration.isDrops && calculations.dropsPerDose > 0
      ? `${calculations.volumePerDoseMl} mL (${calculations.dropsPerDose} drops)`
      : `${calculations.volumePerDoseMl} mL`;

    return `Rx: ${activeDrug.name} [${activeConcentration.label}]
Patient: ${patientName} (Age: ${ageYears}y ${ageMonths}m, Weight: ${weightKg} kg)
Dose: Give ${volStr} (${calculations.singleDoseMg} mg) by mouth ${activeDrug.frequency}.
Course: Continue for ${courseDurationDays} days.
Daily Total: ${calculations.dailyDoseMg} mg/day.
Administration Note: ${activeDrug.clinicalNotes}`;
  }, [activeDrug, activeConcentration, patientName, ageYears, ageMonths, weightKg, calculations, courseDurationDays]);

  // Copy to clipboard
  const handleCopyInstructions = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(dispenseInstructionsText);
      setCopiedLabel(true);
      setTimeout(() => setCopiedLabel(false), 2500);
    }
  };

  // WhatsApp Dispatch
  const handleTriggerWhatsapp = () => {
    if (onSendWhatsapp && guardianPhone) {
      onSendWhatsapp(guardianPhone, dispenseInstructionsText);
      setWhatsappSentNotice(true);
      setTimeout(() => setWhatsappSentNotice(false), 3000);
    }
  };

  // Transfer to POS Dispensing Tab
  const handleTransferToPOS = () => {
    if (onTransferToDispense) {
      onTransferToDispense({
        medicineName: matchingStock ? matchingStock.name : activeDrug.name,
        genericName: activeDrug.genericName,
        patientName,
        patientPhone: guardianPhone,
        calculatedDose: `${calculations.volumePerDoseMl} mL (${calculations.singleDoseMg} mg)`,
        instructions: dispenseInstructionsText,
        estimatedQtyBottles: calculations.totalBottlesNeeded
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                <Baby className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                Pediatric Medication & Dosage Calculator
                <span className="text-[9px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                  Clinical CDSS
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Evidence-based weight-and-age dosing engine adhering to Indian Academy of Pediatrics (IAP) & WHO pediatric formularies with automatic adult ceiling capping.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyInstructions}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              {copiedLabel ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedLabel ? "Copied to Clipboard!" : "Copy Dose Label"}
            </button>
            <button
              onClick={handleTransferToPOS}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Transfer to POS Cart
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: PATIENT ANTHROPOMETRY & FORMULARY SELECTOR */}
        <div className="lg:col-span-5 space-y-6">

          {/* PATIENT PROFILE CARD */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-400" />
                Patient Anthropometry
              </h3>
              <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-black border ${ageCategory.color}`}>
                {ageCategory.label}
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Child / Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Guardian Phone (WhatsApp)</label>
                  <input
                    type="text"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* AGE & GENDER INPUTS */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Age (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="18"
                    value={ageYears}
                    onChange={(e) => setAgeYears(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Age (Months)</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(Math.min(11, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Biological Sex</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="male">Male (Boy)</option>
                    <option value="female">Female (Girl)</option>
                  </select>
                </div>
              </div>

              {/* WEIGHT WITH UNIT TOGGLE */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1">
                      Body Weight *
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setWeightUnit("kg")}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-black cursor-pointer transition-all ${
                          weightUnit === "kg" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        KG
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightUnit("lbs")}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-black cursor-pointer transition-all ${
                          weightUnit === "lbs" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        LBS
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="150"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border-2 border-emerald-500/40 rounded-xl px-3 py-2 text-sm text-emerald-300 font-black focus:outline-none focus:border-emerald-400"
                  />
                  {weightUnit === "lbs" && (
                    <span className="text-[9.5px] text-slate-400 font-mono block">
                      ≈ {weightKg} kg
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Height / Length (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="20"
                    max="220"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span>BSA (Mosteller):</span>
                    <span className="text-white font-bold">{bsaM2} m²</span>
                  </div>
                </div>
              </div>

              {/* WHO BENCHMARK COMPARISON BAR */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold">WHO 50th Percentile Benchmark:</span>
                  <span className="text-slate-200 font-black font-mono">~{expectedWeightKg} kg for age</span>
                </div>
                {Math.abs(weightKg - expectedWeightKg) > (expectedWeightKg * 0.4) && weightKg > 0 && (
                  <p className="text-[9.5px] text-amber-400 flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Entered weight deviates significantly from typical WHO percentiles. Please double-check scale calibration.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* FORMULARY MEDICATION LIST */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Pill className="h-4 w-4 text-emerald-400" />
                Select Pediatric Molecule
              </h3>
              <span className="text-[9px] text-slate-400 font-mono">
                {filteredDrugs.length} Formulas Available
              </span>
            </div>

            {/* SEARCH & CATEGORY FILTER */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search drug, antibiotic, fever, drops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[9px] font-bold">
                {["all", "antipyretic", "antibiotic", "analgesic", "antiemetic", "allergy", "respiratory", "gastrointestinal"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg uppercase whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-emerald-500 text-slate-950 font-black"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* DRUG LIST ACCORDION / SELECTOR */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredDrugs.map((drug) => {
                const isSelected = drug.id === selectedDrugId;
                return (
                  <div
                    key={drug.id}
                    onClick={() => handleSelectDrug(drug.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/60 shadow-md shadow-emerald-500/5"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`text-xs font-black ${isSelected ? "text-emerald-300" : "text-white"}`}>
                          {drug.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">{drug.indication}</p>
                      </div>
                      <span className="text-[8.5px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        {drug.defaultMgPerKg} {drug.dosingBasis === "per_dose" ? "mg/kg/dose" : "mg/kg/day"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CALCULATION RESULTS & PHARMACIST DISPENSING ACTIONS */}
        <div className="lg:col-span-7 space-y-6">

          {/* ACTIVE DRUG DOSING & CONCENTRATION CONFIG */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block">
                  Active Formulary Molecule
                </span>
                <h3 className="text-base font-black text-white">{activeDrug.name}</h3>
                <p className="text-xs text-slate-400">Generic: {activeDrug.genericName}</p>
              </div>

              {/* INVENTORY STATUS BADGE */}
              {matchingStock ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="text-[9px] font-black text-emerald-400 uppercase block">In Pharmacy Stock</span>
                    <span className="text-xs font-bold text-white">{matchingStock.currentStock} bottles available</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Formulary SKU</span>
                    <span className="text-xs font-bold text-slate-300">Dispense standard brand</span>
                  </div>
                </div>
              )}
            </div>

            {/* CONCENTRATION & DOSING OVERRIDES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bottle Concentration Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase block">
                  Stock Suspension Concentration *
                </label>
                <select
                  value={selectedConcentrationIdx}
                  onChange={(e) => setSelectedConcentrationIdx(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {activeDrug.concentrations.map((conc, idx) => (
                    <option key={idx} value={idx}>
                      {conc.label}
                    </option>
                  ))}
                </select>
                <span className="text-[9px] text-slate-400 block">
                  Concentration ratio: {(activeConcentration.mg / activeConcentration.ml).toFixed(1)} mg per mL
                </span>
              </div>

              {/* Target Dose Slider / Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Target Dosage ({activeDrug.dosingBasis === "per_dose" ? "mg/kg/dose" : "mg/kg/day"})
                  </label>
                  <span className="text-xs font-mono font-black text-emerald-400">
                    {currentMgPerKg} mg/kg
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={activeDrug.recommendedMinMgPerKg}
                    max={activeDrug.recommendedMaxMgPerKg}
                    step={activeDrug.recommendedMaxMgPerKg > 20 ? 5 : 0.5}
                    value={currentMgPerKg}
                    onChange={(e) => setCustomMgPerKg(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomMgPerKg(null)}
                    title="Reset to default"
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>Min: {activeDrug.recommendedMinMgPerKg}</span>
                  <span>Rec: {activeDrug.defaultMgPerKg}</span>
                  <span>Max: {activeDrug.recommendedMaxMgPerKg}</span>
                </div>
              </div>
            </div>

            {/* FREQUENCY & COURSE DURATION */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Dosing Interval</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200">
                  {activeDrug.frequency}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Doses / Day</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={currentDosesPerDay}
                  onChange={(e) => setCustomFrequencyDoses(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Course Duration</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={courseDurationDays}
                    onChange={(e) => setCourseDurationDays(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] font-bold text-slate-400">days</span>
                </div>
              </div>
            </div>

            {/* WARNINGS & AGE CONTRAINDICATIONS */}
            {calculations.ageWarning && (
              <div className="bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-black text-rose-300 uppercase">Age Caution Alert</h5>
                  <p className="text-xs text-rose-200 font-medium">{calculations.ageWarning}</p>
                </div>
              </div>
            )}

            {calculations.isCapped && (
              <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-black text-amber-300 uppercase">Maximum Dose Ceiling Reached</h5>
                  <p className="text-xs text-amber-200 font-medium">{calculations.cappedReason}</p>
                </div>
              </div>
            )}

            {/* PRIMARY RESULT DISPLAY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* LIQUID VOLUME RESULT */}
              <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
                <div className="absolute right-3 top-3 p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Calculator className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                  Exact Volume to Dispense
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {calculations.volumePerDoseMl}
                  </span>
                  <span className="text-xl font-bold text-emerald-400">mL per dose</span>
                </div>

                {activeConcentration.isDrops && calculations.dropsPerDose > 0 && (
                  <div className="mt-2 inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold">
                    💧 {calculations.dropsPerDose} oral drops per dose
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-emerald-500/20 text-[10.5px] text-slate-300 space-y-1">
                  <p className="flex items-center justify-between">
                    <span>Administer:</span>
                    <strong className="text-white">{activeDrug.frequency}</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Household estimate:</span>
                    <span className="text-emerald-300 font-medium">
                      {calculations.volumePerDoseMl <= 2.5
                        ? "½ metric tsp (use oral syringe!)"
                        : calculations.volumePerDoseMl <= 5
                        ? "1 metric tsp (5 mL)"
                        : `${(calculations.volumePerDoseMl / 5).toFixed(1)} metric tsp`}
                    </span>
                  </p>
                </div>
              </div>

              {/* MILLIGRAM DOSE BREAKDOWN */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Active Drug Substance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {calculations.singleDoseMg}
                  </span>
                  <span className="text-sm font-bold text-slate-400">mg / dose</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Daily Cumulative:</span>
                    <span className="font-bold text-white">{calculations.dailyDoseMg} mg / day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estimated Bottles Needed:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {calculations.totalBottlesNeeded} bottle(s) ({courseDurationDays}d course)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Adult Reference:</span>
                    <span>{activeDrug.adultReferenceDoseMg} mg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CLASSICAL COMPARISON / FORMULAS ACCORDION */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Pharmacological Rule Comparison
                </span>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-black">
                  Modern mg/kg is Gold Standard
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">Modern mg/kg</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">{calculations.singleDoseMg} mg</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">Clark&apos;s Rule (Wt)</span>
                  <span className="text-xs font-black text-slate-300 font-mono">{calculations.clarksRuleMg} mg</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">Young&apos;s Rule (Age)</span>
                  <span className="text-xs font-black text-slate-300 font-mono">{calculations.youngsRuleMg} mg</span>
                </div>
              </div>
            </div>

            {/* DISPENSING LABEL PREVIEW & ACTIONS */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  Official Pharmacy Dispense Slip Preview
                </h4>
                <span className="text-[9px] text-slate-500 font-mono">Ready for Printing / WhatsApp</span>
              </div>

              <pre className="bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] p-3.5 rounded-2xl whitespace-pre-wrap font-mono leading-relaxed">
                {dispenseInstructionsText}
              </pre>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyInstructions}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedLabel ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedLabel ? "Copied" : "Copy Label"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print Label
                  </button>
                  <button
                    onClick={handleTriggerWhatsapp}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {whatsappSentNotice ? "Dispatched!" : "Send via WhatsApp"}
                  </button>
                </div>

                <button
                  onClick={handleTransferToPOS}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-emerald-500/20 cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Transfer to Dispensing Cart
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* CLINICAL DISCLAIMER */}
            <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800/60 pt-3 flex items-start gap-2">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
              <span>
                <strong>Clinical Pharmacist Notice:</strong> Pediatric calculations are advisory decision-support benchmarks based on standard reference guides (IAP, BNF for Children, Harriet Lane Handbook). The dispensing pharmacist must independently verify organ function, renal clearance, hydration status, and concurrent medications prior to patient release.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default PediatricDosageCalculator;
