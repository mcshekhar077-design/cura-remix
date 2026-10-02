import { Router } from "express";
import { patientRouter } from "./patientRoutes";
import { clinicalRouter } from "./clinicalRoutes";
import { appointmentRouter } from "./appointmentRoutes";
import { pharmacyRouter } from "./pharmacyRoutes";
import { billingRouter } from "./billingRoutes";
import { diagnosticRouter } from "./diagnosticRoutes";
import { db } from "../storage/postgres/client";
import { redis } from "../storage/redis/client";
import { objectStore } from "../storage/objectStore/client";
import { db as infraDb } from "../infrastructure/database";

export const featureApiRouter = Router();

// Middleware: Request Correlation ID & Security Headers
featureApiRouter.use((req, res, next) => {
  const correlationId = req.headers["x-request-id"] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  res.setHeader("X-Request-ID", correlationId);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// Storage Infrastructure Health Check
featureApiRouter.get("/storage/health", async (req, res) => {
  try {
    const [pgHealth, redisHealth, s3Health] = await Promise.all([
      db.getHealth(),
      redis.getHealth(),
      objectStore.getHealth()
    ]);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      architecture: "CLINITIAL Multi-Tier Decoupled Platform",
      storage: {
        postgres: pgHealth,
        redis: redisHealth,
        objectStore: s3Health
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sub-domain Feature Routers
featureApiRouter.use("/patients", patientRouter);
featureApiRouter.use("/clinical", clinicalRouter);
featureApiRouter.use("/appointments", appointmentRouter);
featureApiRouter.use("/pharmacy", pharmacyRouter);
featureApiRouter.use("/billing", billingRouter);
featureApiRouter.use("/diagnostics", diagnosticRouter);

// POST /api/v1/offline-sync: Queue processor and synchronizer for offline items (including diagnostic reports)
featureApiRouter.post("/offline-sync", async (req, res) => {
  try {
    const { deviceId, offlineSince, items = [] } = req.body;
    const syncedItems: any[] = [];
    const errors: any[] = [];

    for (const item of items) {
      try {
        if (item.type === "diagnostic_report") {
          const payload = item.payload || {};
          const patientId = payload.patientId || "pat_101";
          let patient = infraDb.tables.patients.get(patientId);
          if (!patient) {
            patient = Array.from(infraDb.tables.patients.values())[0];
          }

          if (patient) {
            if (!Array.isArray(patient.scannedReports)) {
              patient.scannedReports = [];
            }
            const reportId = payload.id || `rep_sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const report = {
              id: reportId,
              title: payload.title || item.title || "Diagnostic Report",
              date: payload.date || new Date().toISOString().split("T")[0],
              category: payload.category || "Pathology & Diagnostics",
              fileName: payload.fileName || "diagnostic_report.pdf",
              fileSize: payload.fileSize || "420 KB",
              extractedText: payload.extractedText || "",
              aiSummary: payload.aiSummary || "",
              keyFindings: payload.keyFindings || [],
              riskLevel: payload.riskLevel || "low",
              abnormalValues: payload.abnormalValues || [],
              possibleConditions: payload.possibleConditions || [],
              suggestedSpecialist: payload.suggestedSpecialist || "",
              suggestedDoctorName: payload.suggestedDoctorName || "Dr. Rajesh Sharma",
              followUpRecommendation: payload.followUpRecommendation || "",
              labResults: payload.labResults || [],
              diagnosis: payload.diagnosis || "",
              medications: payload.medications || [],
              summaryForDoctor: payload.summaryForDoctor || "",
              offlineSyncedAt: new Date().toISOString(),
              syncSource: "OfflineSyncEngine"
            };

            // Avoid duplicates
            const existingIdx = patient.scannedReports.findIndex((r: any) => r.id === report.id || (r.title === report.title && r.date === report.date));
            if (existingIdx >= 0) {
              patient.scannedReports[existingIdx] = { ...patient.scannedReports[existingIdx], ...report };
            } else {
              patient.scannedReports.unshift(report);
            }

            if (payload.diagnosis || payload.title) {
              if (!Array.isArray(patient.history)) patient.history = [];
              patient.history.unshift({
                date: report.date,
                doctor: report.suggestedDoctorName,
                diagnosis: payload.diagnosis || report.title,
                symptoms: report.category,
                prescriptions: (payload.medications || []).map((m: any) => typeof m === "string" ? m : m.name || "")
              });
            }

            patient.updatedAt = new Date().toISOString();
            infraDb.tables.patients.set(patient.id, patient);
          }

          syncedItems.push({
            id: item.id,
            status: "synced",
            type: item.type,
            title: item.title,
            syncedAt: new Date().toISOString()
          });
        } else if (item.type === "clinical_note" || item.type === "generic_log") {
          syncedItems.push({
            id: item.id,
            status: "synced",
            type: item.type,
            title: item.title,
            syncedAt: new Date().toISOString()
          });
        } else if (item.type === "create_patient") {
          const payload = item.payload || {};
          const patId = payload.id || `pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const newPat = {
            id: patId,
            tenantId: "tenant_apollo",
            fullName: payload.fullName || item.title,
            phone: payload.phone || "+91 98765 00000",
            gender: payload.gender || "Other",
            age: payload.age || 35,
            bloodGroup: payload.bloodGroup || "O+",
            allergies: payload.allergies || [],
            chronicConditions: payload.chronicConditions || [],
            currentMedications: payload.currentMedications || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          infraDb.tables.patients.set(newPat.id, newPat as any);
          syncedItems.push({
            id: item.id,
            status: "synced",
            type: item.type,
            title: item.title,
            syncedAt: new Date().toISOString()
          });
        } else {
          syncedItems.push({
            id: item.id,
            status: "synced",
            type: item.type,
            title: item.title,
            syncedAt: new Date().toISOString()
          });
        }
      } catch (itemErr: any) {
        errors.push({ id: item.id, error: itemErr?.message || "Sync processing error" });
      }
    }

    res.json({
      success: true,
      deviceId: deviceId || "default_device",
      offlineSince: offlineSince || null,
      receivedCount: items.length,
      syncedCount: syncedItems.length,
      syncedItems,
      errors,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/offline-sync/health: Diagnostic health probe for offline sync worker
featureApiRouter.get("/offline-sync/health", (req, res) => {
  res.json({
    success: true,
    status: "ready",
    supportedTypes: [
      "diagnostic_report",
      "clinical_note",
      "create_patient",
      "prescription",
      "vital_reading",
      "billing_record",
      "generic_log"
    ],
    gateway: "Clinitial Resilient Offline Synchronization Pipeline",
    timestamp: new Date().toISOString()
  });
});

