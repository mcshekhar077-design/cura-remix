import { Router, Request, Response } from "express";
import { db } from "../../infrastructure/database";
import { Patient } from "../../shared/types";
import { ValidationError, NotFoundError, ForbiddenError } from "../../shared/errors";
import { requireAuth } from "../../middleware/authentication";
import { requireRoles, requirePatientAccess } from "../../middleware/authorization";
import { auditLogMiddleware } from "../../middleware/audit";
import { AIGateway } from "../../infrastructure/ai";

export const patientsRouter = Router();

// List patients for tenant
patientsRouter.get("/", (req: Request, res: Response) => {
  const tenantId = req.tenantId || req.user?.tenantId || "tenant_apollo";
  const allPatients = Array.from(db.tables.patients.values()).filter(p => p.tenantId === tenantId);
  res.json({
    success: true,
    patients: allPatients
  });
});

// Create new patient
patientsRouter.post("/", requireRoles("doctor", "hospital_admin", "nurse"), auditLogMiddleware("create", "patient"), async (req: Request, res: Response, next) => {
  try {
    const { fullName, phone, gender, dateOfBirth, age, bloodGroup, allergies, chronicConditions, currentMedications } = req.body;
    if (!fullName || !phone) {
      throw new ValidationError("Full name and phone number are required.");
    }

    const tenantId = req.tenantId || req.user?.tenantId || "tenant_apollo";
    const patientId = `pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const mrn = `MRN-${tenantId.toUpperCase().slice(-4)}-${Date.now().toString().slice(-5)}`;

    const newPatient: Patient = {
      id: patientId,
      tenantId,
      mrn,
      fullName,
      phone,
      gender: gender || "Other",
      dateOfBirth,
      age: age ? parseInt(age, 10) : undefined,
      bloodGroup,
      allergies: Array.isArray(allergies) ? allergies : (allergies ? [allergies] : []),
      chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : [],
      currentMedications: Array.isArray(currentMedications) ? currentMedications : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.tables.patients.set(newPatient.id, newPatient);

    res.status(201).json({
      success: true,
      patient: newPatient
    });
  } catch (err) {
    next(err);
  }
});

// Append longitudinal history
patientsRouter.post("/:id/history", requireRoles("doctor", "nurse"), auditLogMiddleware("append_history", "patient"), (req: Request, res: Response, next) => {
  try {
    const patient = db.tables.patients.get(req.params.id);
    if (!patient) {
      throw new NotFoundError("Patient", req.params.id);
    }

    res.json({
      success: true,
      message: "Clinical history appended successfully."
    });
  } catch (err) {
    next(err);
  }
});

// AI Document Analysis via Gateway
patientsRouter.post("/:id/scanned-reports/analyze", auditLogMiddleware("ai_analyze_report", "patient_document"), async (req: Request, res: Response, next) => {
  try {
    const patient = db.tables.patients.get(req.params.id);
    const { reportText, reportType } = req.body;

    const aiRes = await AIGateway.executeClinicalInference({
      tenantId: patient?.tenantId || "tenant_apollo",
      userId: req.user?.id || "clinician_user",
      patientId: req.params.id,
      taskType: "report_analysis",
      inputData: { reportText, reportType, patientAllergies: patient?.allergies || [] }
    });

    res.json({
      success: true,
      analysis: aiRes.result,
      confidence: aiRes.confidence,
      hitlRequired: aiRes.hitlRequired,
      disclaimer: aiRes.disclaimer
    });
  } catch (err) {
    next(err);
  }
});
