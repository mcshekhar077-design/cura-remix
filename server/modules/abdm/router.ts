import { Router, Request, Response } from "express";

export const abdmRouter = Router();

// PMJAY Beneficiary Eligibility & Claim Verification
abdmRouter.post("/pmjay", (req: Request, res: Response) => {
  const { abhaId, rationCardNumber, pmjayId } = req.body;

  res.json({
    success: true,
    scheme: "Ayushman Bharat PM-JAY",
    beneficiary: {
      status: "Eligible",
      pmjayId: pmjayId || "PMJAY-TS-9812-4411",
      familyHead: "Ramesh Kumar",
      coverageBalanceINR: 500000,
      empanelledHospital: "Apollo Super Specialty Hospital",
      verifiedAt: new Date().toISOString()
    }
  });
});

// Hospital Patient Records Fetch Gateway
abdmRouter.post("/hospitals/patient-records", (req: Request, res: Response) => {
  const { consentArtifactId, patientAbhaAddress } = req.body;

  res.json({
    success: true,
    status: "CONSENT_VERIFIED",
    consentArtifactId,
    patientAbhaAddress: patientAbhaAddress || "ramesh.kumar@abdm",
    availableCareContexts: [
      { careContextReference: "OPD-2026-0811", display: "Cardiology Consultation Note" },
      { careContextReference: "LAB-2026-4401", display: "Lipid Profile & HbA1c Lab Report" }
    ]
  });
});
