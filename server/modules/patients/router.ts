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
  const query = (req.query.q as string || "").toLowerCase().trim();
  let allPatients = Array.from(db.tables.patients.values()).filter(p => 
    !tenantId || 
    p.tenantId === tenantId || 
    p.tenantId === "tenant_apollo" || 
    tenantId === "tenant_default"
  );
  if (query) {
    allPatients = allPatients.filter(p => 
      p.fullName.toLowerCase().includes(query) ||
      (p.phone && p.phone.includes(query)) ||
      (p.mrn && p.mrn.toLowerCase().includes(query)) ||
      (p.patientCode && p.patientCode.toLowerCase().includes(query)) ||
      (p.abhaId && p.abhaId.toLowerCase().includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      p.id.toLowerCase().includes(query)
    );
  }
  if (req.query.format === "envelope") {
    return res.json({ success: true, patients: allPatients });
  }
  res.json(allPatients);
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

// GET /api/v1/patients/:id/scanned-reports
patientsRouter.get("/:id/scanned-reports", (req: Request, res: Response, next) => {
  try {
    const patient = db.tables.patients.get(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, detail: "Patient not found" });
    }
    res.json(patient.scannedReports || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/patients/:id/scanned-reports
patientsRouter.post("/:id/scanned-reports", auditLogMiddleware("create", "diagnostic_report"), (req: Request, res: Response, next) => {
  try {
    const patient = db.tables.patients.get(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, detail: "Patient not found" });
    }

    const reportData = req.body;
    const reportId = reportData.id || `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReport = {
      id: reportId,
      createdAt: new Date().toISOString(),
      ...reportData
    };

    if (!Array.isArray(patient.scannedReports)) {
      patient.scannedReports = [];
    }
    patient.scannedReports.unshift(newReport);
    patient.updatedAt = new Date().toISOString();

    if (reportData.diagnosis || reportData.title) {
      if (!Array.isArray(patient.history)) {
        patient.history = [];
      }
      patient.history.unshift({
        date: reportData.date || new Date().toISOString().split("T")[0],
        doctor: reportData.suggestedDoctorName || "Consultant Clinician",
        diagnosis: reportData.diagnosis || reportData.title,
        symptoms: reportData.category || "Diagnostic Assessment",
        prescriptions: (reportData.medications || []).map((m: any) => typeof m === "string" ? m : m.name || "")
      });
    }

    db.tables.patients.set(patient.id, patient);

    res.status(201).json({
      success: true,
      message: `Diagnostic report "${reportData.title || "Report"}" successfully recorded in patient EHR.`,
      report: newReport,
      ...patient
    });
  } catch (err) {
    next(err);
  }
});

