import { Router } from "express";
import { ClinicalDomainService } from "../services/clinicalDomainService";
import { authenticateGateway, requirePermission } from "../gateway/rbacAuth";

export const clinicalRouter = Router();

// GET /api/v2/clinical/encounters/:patientId
clinicalRouter.get("/encounters/:patientId", authenticateGateway, requirePermission("clinical:read"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const encounters = await ClinicalDomainService.getEncountersByPatient(tenantId, req.params.patientId);
    res.json({ success: true, count: encounters.length, data: encounters });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v2/clinical/encounters
clinicalRouter.post("/encounters", authenticateGateway, requirePermission("clinical:write"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const doctorId = (req as any).gatewayUser?.id || "user_doc_1";
    const encounter = await ClinicalDomainService.createEncounter(tenantId, {
      ...req.body,
      doctorId
    });
    res.status(201).json({ success: true, message: "Encounter recorded", data: encounter });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/v2/clinical/prescriptions
clinicalRouter.post("/prescriptions", authenticateGateway, requirePermission("clinical:write"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const doctorId = (req as any).gatewayUser?.id || "user_doc_1";
    const rx = await ClinicalDomainService.issuePrescription(tenantId, {
      ...req.body,
      doctorId
    });
    res.status(201).json({ success: true, message: "Prescription issued and sent to pharmacy", data: rx });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
