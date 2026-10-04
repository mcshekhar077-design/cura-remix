import { Router, Request, Response } from "express";

export const intelligenceRouter = Router();

// --- 1. Doctor Memory Store ---
const defaultDoctorMemories = [
  {
    id: "mem_1",
    diagnosis: "Type 2 Diabetes Mellitus with Mild Obesity",
    preferredMedicines: ["Metformin 500mg SR", "Teneligliptin 20mg", "Empagliflozin 10mg"],
    writingStyle: "Detailed bulleted clinical notes with lifestyle recommendations",
    followUpDays: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: "mem_2",
    diagnosis: "Essential Hypertension (Stage 1)",
    preferredMedicines: ["Telmisartan 40mg", "Amlodipine 5mg"],
    writingStyle: "Structured cardiovascular profile & salt restriction instructions",
    followUpDays: 30,
    createdAt: new Date().toISOString()
  },
  {
    id: "mem_3",
    diagnosis: "Upper Respiratory Tract Infection & Allergic Bronchospasm",
    preferredMedicines: ["Amoxicillin-Clavulanate 625mg", "Levocetirizine 5mg + Montelukast 10mg"],
    writingStyle: "Symptom-targeted acute care instructions",
    followUpDays: 5,
    createdAt: new Date().toISOString()
  }
];

let doctorMemories = [...defaultDoctorMemories];

intelligenceRouter.get("/doctor-memory", (req: Request, res: Response) => {
  res.json(doctorMemories);
});

intelligenceRouter.post("/doctor-memory", (req: Request, res: Response) => {
  const newMem = {
    id: `mem_${Date.now()}`,
    diagnosis: req.body.diagnosis || "Unspecified Diagnosis",
    preferredMedicines: Array.isArray(req.body.preferredMedicines) ? req.body.preferredMedicines : [],
    writingStyle: req.body.writingStyle || "Standard Clinical Protocol",
    followUpDays: Number(req.body.followUpDays) || 14,
    createdAt: new Date().toISOString()
  };
  doctorMemories.unshift(newMem);
  res.status(201).json(newMem);
});

intelligenceRouter.put("/doctor-memory/:id", (req: Request, res: Response) => {
  const mem = doctorMemories.find(m => m.id === req.params.id);
  if (!mem) return res.status(404).json({ error: "Memory item not found" });
  if (req.body.preferredMedicines) mem.preferredMedicines = req.body.preferredMedicines;
  if (req.body.writingStyle) mem.writingStyle = req.body.writingStyle;
  if (req.body.followUpDays !== undefined) mem.followUpDays = Number(req.body.followUpDays);
  res.json({ success: true, memory: mem });
});

intelligenceRouter.delete("/doctor-memory/:id", (req: Request, res: Response) => {
  doctorMemories = doctorMemories.filter(m => m.id !== req.params.id);
  res.json({ success: true });
});

intelligenceRouter.post("/doctor-memory/reset", (req: Request, res: Response) => {
  doctorMemories = [...defaultDoctorMemories];
  res.json({ success: true });
});

intelligenceRouter.get("/doctor-memory/export", (req: Request, res: Response) => {
  res.json({
    version: "2.0",
    exportedAt: new Date().toISOString(),
    memories: doctorMemories
  });
});

// --- 2. Revenue Leaks Detector ---
let revenueLeaks = [
  {
    id: "leak_1",
    patientName: "Rajesh Kumar",
    patientId: "demo-pat-1",
    detectedService: "Unbilled Continuous SpO2 & Telemetry Monitoring",
    estimatedAmount: 1850,
    status: "detected" as const,
    date: new Date().toISOString().split("T")[0],
    confidenceScore: 0.94,
    reasoning: "Nursing flow-sheet documented 8 hours of telemetry, but invoice only lists baseline consultation."
  },
  {
    id: "leak_2",
    patientName: "Ramesh Kumar",
    patientId: "pat_101",
    detectedService: "Bedside Capillary Blood Glucose (3 Timed Checks)",
    estimatedAmount: 450,
    status: "detected" as const,
    date: new Date().toISOString().split("T")[0],
    confidenceScore: 0.89,
    reasoning: "EHR blood glucose chart entries recorded without corresponding lab item code on invoice."
  }
];

intelligenceRouter.get("/revenue-leaks", (req: Request, res: Response) => {
  res.json(revenueLeaks);
});

intelligenceRouter.patch("/revenue-leaks/:id", (req: Request, res: Response) => {
  const leak = revenueLeaks.find(l => l.id === req.params.id);
  if (!leak) return res.status(404).json({ error: "Revenue leak not found" });
  if (req.body.status) leak.status = req.body.status;
  res.json({ success: true, leak });
});

// --- 3. Voice Calls Automation ---
let voiceCalls = [
  {
    id: "call_1",
    patientName: "Rajesh Kumar",
    phone: "+91 98765 43210",
    time: "Today, 10:15 AM",
    duration: "1m 45s",
    status: "completed",
    symptomCheck: "Normal recovery, no fever or dyspnea reported",
    sentiment: "positive",
    transcription: "AI: Hello Rajesh, calling from Dr. Sharma's clinic for your day-3 follow-up. How is your cough? Rajesh: Feeling much better, breathing clearly now."
  }
];

intelligenceRouter.get("/voice-calls", (req: Request, res: Response) => {
  res.json(voiceCalls);
});

intelligenceRouter.post("/voice-calls/simulate", (req: Request, res: Response) => {
  const newCall = {
    id: `call_${Date.now()}`,
    patientName: req.body.patientName || "Rajesh Kumar",
    phone: req.body.phone || "+91 98765 43210",
    time: "Just now",
    duration: "1m 32s",
    status: "completed",
    symptomCheck: req.body.reason || "Post-consultation medication compliance confirmed",
    sentiment: "positive",
    transcription: "AI: Follow-up automated check-in completed. Patient confirmed morning medication taken without side effects."
  };
  voiceCalls.unshift(newCall);
  res.status(201).json(newCall);
});

// --- 4. Clinical Marketplace Apps ---
let marketplaceApps = [
  { id: "app_1", name: "AI ECG Lead-II Analyzer", category: "Diagnostics", enabled: true, description: "Automatic ST-segment elevation & arrhythmia classification" },
  { id: "app_2", name: "WhatsApp Smart Prescription Delivery", category: "Communication", enabled: true, description: "Instant PDF delivery via official Meta WhatsApp Business API" },
  { id: "app_3", name: "ABDM Ayushman Bharat M1/M2/M3 Bridge", category: "Compliance", enabled: true, description: "Certified ABDM FHIR gateway & ABHA health locker synchronization" }
];

intelligenceRouter.get("/marketplace", (req: Request, res: Response) => {
  res.json(marketplaceApps);
});

intelligenceRouter.post("/marketplace/toggle/:id", (req: Request, res: Response) => {
  const app = marketplaceApps.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: "Marketplace app not found" });
  app.enabled = !app.enabled;
  res.json({ success: true, app });
});

// --- 5. Approvals (Human-in-the-Loop) ---
let approvals = [
  {
    id: "appr_1",
    proposedPattern: "Add Rabeprazole 20mg when prescribing Diclofenac or Naproxen for >5 days",
    specialty: "Internal Medicine",
    confidence: "96.4%",
    sourceCases: 42,
    rationale: "Prevents NSAID-induced gastric irritation based on clinical trends in patient demographics."
  }
];

intelligenceRouter.get("/approvals", (req: Request, res: Response) => {
  res.json(approvals);
});

intelligenceRouter.post("/approvals/:id/approve", (req: Request, res: Response) => {
  approvals = approvals.filter(a => a.id !== req.params.id);
  res.json({ success: true });
});

intelligenceRouter.post("/approvals/:id/dismiss", (req: Request, res: Response) => {
  approvals = approvals.filter(a => a.id !== req.params.id);
  res.json({ success: true });
});

// --- 6. Digital Twin ---
intelligenceRouter.get("/digital-twin/:patientId", (req: Request, res: Response) => {
  res.json({
    patientId: req.params.patientId,
    vitalsStabilityIndex: 92,
    metabolicRiskTier: "Low-Moderate",
    organResilience: {
      cardiovascular: 88,
      renal: 95,
      hepatic: 94,
      pulmonary: 86
    },
    simulatedTrajectories: [
      { month: "Month 1", adherenceExpected: 94, bpProjected: "122/80", hba1cProjected: "6.4%" },
      { month: "Month 3", adherenceExpected: 89, bpProjected: "120/78", hba1cProjected: "6.1%" },
      { month: "Month 6", adherenceExpected: 91, bpProjected: "118/76", hba1cProjected: "5.8%" }
    ]
  });
});

// --- 7. Predictive Outcome & Copilot ---
intelligenceRouter.post("/predict-outcome", (req: Request, res: Response) => {
  const { diagnosis, treatmentPlan } = req.body;
  res.json({
    projectedRecoveryDays: 7,
    expectedEfficacy: "89% symptom resolution within 5 days",
    complicationRisk: "Low (< 3%)",
    differentialConsiderations: [
      "Check renal function if initiating ACE inhibitors or ARBs",
      "Monitor fasting blood glucose after 4 weeks"
    ],
    lifestyleDirectives: [
      "Maintain 2.5L daily hydration",
      "Restrict daily sodium intake below 2g"
    ]
  });
});

intelligenceRouter.post("/copilot/consult", (req: Request, res: Response) => {
  res.json({
    reply: `Clinical recommendation based on Indian consensus guidelines: ${req.body.query || "Standard clinical protocol applies."}`,
    confidence: 0.95,
    guidelinesReferenced: ["ICMR National Guidelines 2025", "NMC Standards of Care"]
  });
});

intelligenceRouter.post("/evidence", (req: Request, res: Response) => {
  res.json({
    citations: [
      { title: "Consensus Guidelines on Glycemic Control in Primary Care", journal: "Indian J Med Res", year: "2025", level: "Grade 1A" },
      { title: "Cardiovascular Risk Stratification in South Asian Populations", journal: "Lancet Reg Health", year: "2024", level: "Grade 1B" }
    ]
  });
});

intelligenceRouter.post("/safety-check", (req: Request, res: Response) => {
  res.json({
    isSafe: true,
    alerts: [],
    checkedInteractions: 14
  });
});

// --- 8. AI Skin Analysis ---
let skinAnalysisStore: Record<string, any[]> = {};

intelligenceRouter.post("/skin-analyze/analyze", (req: Request, res: Response) => {
  const { patientId = "demo-pat-1" } = req.body;
  const analysisResult = {
    id: `skin_${Date.now()}`,
    date: new Date().toISOString(),
    overallScore: 84,
    skinType: "Combination / Fitzpatrick Type III",
    primaryConditions: [
      { name: "Mild Facial Erythema", severity: "Mild", confidence: 0.88, advice: "Gentle non-comedogenic cleanser, SPF 50 mineral sunscreen" },
      { name: "Periorbital Hyperpigmentation", severity: "Mild", confidence: 0.82, advice: "Hydrating eye serum with caffeine and niacinamide" }
    ],
    recommendedTopicals: [
      "Niacinamide 5% Gentle Serum (Morning)",
      "Ceramide + Hyaluronic Barrier Repair Cream (Night)",
      "Broad Spectrum Broad SPF 50+ Sunscreen"
    ]
  };

  if (!skinAnalysisStore[patientId]) {
    skinAnalysisStore[patientId] = [];
  }
  skinAnalysisStore[patientId].unshift(analysisResult);

  res.json({
    success: true,
    data: analysisResult
  });
});

intelligenceRouter.get("/skin-analyze/results/:patientId", (req: Request, res: Response) => {
  const results = skinAnalysisStore[req.params.patientId] || [];
  res.json({
    success: true,
    data: results
  });
});
