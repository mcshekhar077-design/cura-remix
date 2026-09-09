import { Router } from "express";
import { PatientDomainService } from "../services/patientDomainService";
import { authenticateGateway, requirePermission } from "../gateway/rbacAuth";

export const patientRouter = Router();

// GET /api/v2/patients
patientRouter.get("/", authenticateGateway, requirePermission("patients:read"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const search = req.query.search as string | undefined;
    const patients = await PatientDomainService.getPatients(tenantId, search);
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v2/patients/:id
patientRouter.get("/:id", authenticateGateway, requirePermission("patients:read"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const patient = await PatientDomainService.getPatientById(tenantId, req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found in this tenant" });
    }
    res.json({ success: true, data: patient });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v2/patients
patientRouter.post("/", authenticateGateway, requirePermission("patients:write"), async (req, res) => {
  try {
    const tenantId = (req as any).tenantId || "tenant_apollo";
    const actorId = (req as any).gatewayUser?.id || "system";
    const newPatient = await PatientDomainService.registerPatient(tenantId, req.body, actorId);
    res.status(201).json({ success: true, message: "Patient registered successfully", data: newPatient });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
