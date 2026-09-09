import express from "express";
import { z } from "zod";
import { 
  authenticateGateway, 
  issueGatewayToken, 
  MOCK_USERS, 
  requireRole, 
  requirePermission 
} from "./rbacAuth";
import { createRateLimiter, getRateLimitStatus, resetRateLimit } from "./rateLimiter";
import { appendAuditEvent, verifyAuditChain, getAuditLedger } from "./cryptoAudit";
import { TENANTS, queryTenantClinicalRecords, insertTenantClinicalRecord } from "./tenantIsolation";
import { listStoredObjects, uploadMedicalObject } from "./objectStore";
import { getRedisStats, listRedisJobs, enqueueTaskJob } from "./redisQueue";
import { PROMPT_VERSIONS, processClinicalAIQuery } from "./aiGateway";
import { ABDM_MILESTONES, verifyAbhaAddress, generateFhirR4Bundle } from "./abdmService";
import { ArchitectureNodeStatus, GatewayAuthContext } from "./types";

export const gatewayRouter = express.Router();

// Middleware: JSON parser for gateway router
gatewayRouter.use(express.json());

// Standard Gateway Rate Limiter (60 requests per minute)
const standardRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 60,
  message: "API Gateway Rate Limit Exceeded (60 req/min). Please slow down."
});

// Strict Test Rate Limiter (e.g. 5 requests per minute for instant testing)
const testRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 5,
  message: "Test Throttler Activated: You exceeded the 5 req/min test limit. Rate limiter successfully protected downstream services!"
});

// Zod Schema for Clinical Patient Admission Validation Test
const ClinicalAdmissionSchema = z.object({
  patientName: z.string().min(3, "Patient name must be at least 3 characters"),
  age: z.number().int().positive().max(125, "Age must be between 1 and 125"),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().regex(/^\+?[0-9]{10,13}$/, "Phone number must be valid 10-13 digits"),
  bloodPressureSystolic: z.number().min(50).max(280, "Systolic BP must be between 50 and 280 mmHg"),
  bloodPressureDiastolic: z.number().min(30).max(180, "Diastolic BP must be between 30 and 180 mmHg"),
  diagnosis: z.string().min(4, "Diagnosis description is required")
});

// ==========================================
// 1. ARCHITECTURE TOPOLOGY & HEALTH MATRIX
// ==========================================
gatewayRouter.get("/health", (req, res) => {
  const nodes: ArchitectureNodeStatus[] = [
    {
      id: "node_web",
      name: "CURA Web (Doctor/Hospital/Patient/Pharmacy)",
      tier: "presentation",
      status: "healthy",
      latencyMs: 12,
      throughputRps: 184,
      uptimePct: 99.98,
      activeConnections: 42,
      details: "React 19 SPA, Tailwind CSS, Motion animations, role-based navigation"
    },
    {
      id: "node_gateway",
      name: "API Gateway (Auth • Rate Limit • Validation • RBAC)",
      tier: "gateway",
      status: "healthy",
      latencyMs: 4,
      throughputRps: 340,
      uptimePct: 99.99,
      activeConnections: 88,
      details: "Centralized JWT verification, sliding-window throttling, Zod validation, RBAC matrices"
    },
    {
      id: "node_identity",
      name: "Identity & Access Service",
      tier: "services",
      status: "healthy",
      latencyMs: 8,
      throughputRps: 62,
      uptimePct: 99.95,
      activeConnections: 18,
      details: "MFA OTP, session tokens, role mapping, tenant membership"
    },
    {
      id: "node_clinical",
      name: "Clinical Services",
      tier: "services",
      status: "healthy",
      latencyMs: 14,
      throughputRps: 110,
      uptimePct: 99.97,
      activeConnections: 35,
      details: "EHR/EMR, admissions, ward bed telemetry, vitals, prescriptions, OT scheduling"
    },
    {
      id: "node_ai_gateway",
      name: "AI Gateway (Multi-Model & CDSS)",
      tier: "services",
      status: "healthy",
      latencyMs: 380,
      throughputRps: 18,
      uptimePct: 99.92,
      activeConnections: 6,
      details: "Gemini 3.8 Flash, clinical prompt versioning, pharmacovigilance safety gates"
    },
    {
      id: "node_postgres",
      name: "PostgreSQL (Tenant-Isolated Clinical Database)",
      tier: "persistence",
      status: "healthy",
      latencyMs: 6,
      throughputRps: 240,
      uptimePct: 99.99,
      activeConnections: 24,
      details: "Multi-tenant partitioned schemas, Row-Level Security (RLS), ACID clinical transactions"
    },
    {
      id: "node_object_store",
      name: "Object Store (Reports & Scans Vault)",
      tier: "infra",
      status: "healthy",
      latencyMs: 22,
      throughputRps: 45,
      uptimePct: 99.99,
      activeConnections: 12,
      details: "Encrypted DICOM & PDF imaging, SHA-256 integrity, signed expiring URLs"
    },
    {
      id: "node_redis",
      name: "Redis (Async Queue & Hot Memory Cache)",
      tier: "infra",
      status: "healthy",
      latencyMs: 1,
      throughputRps: 580,
      uptimePct: 100.0,
      activeConnections: 15,
      details: "Sub-millisecond hot lookups, Celery/BullMQ task queue workers, telemetry buffers"
    },
    {
      id: "node_audit_store",
      name: "Audit Store (Immutable Cryptographic Events)",
      tier: "infra",
      status: "healthy",
      latencyMs: 3,
      throughputRps: 120,
      uptimePct: 100.0,
      activeConnections: 8,
      details: "Append-only SHA-256 block hashing with tamper-proof verification"
    },
    {
      id: "node_abdm_fhir",
      name: "ABDM / FHIR / HL7 Integrations",
      tier: "external",
      status: "healthy",
      latencyMs: 45,
      throughputRps: 28,
      uptimePct: 99.85,
      activeConnections: 9,
      details: "NRCES NDHM FHIR R4 Bundle generator, ABHA verification, M1/M2/M3 certified"
    }
  ];

  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    system: "CURA Production Healthcare Gateway",
    version: "2.5.0-production",
    overallHealth: "ALL_SYSTEMS_OPERATIONAL",
    nodes
  });
});

// ==========================================
// 2. IDENTITY & ACCESS (AUTH & SESSIONS)
// ==========================================
gatewayRouter.post("/auth/login", (req, res) => {
  const { role = "doctor", tenantId } = req.body;
  const result = issueGatewayToken(role, tenantId);

  return res.status(200).json({
    success: true,
    message: `Authenticated as ${result.context.user.name} (${result.context.user.role})`,
    token: result.token,
    user: result.context.user,
    tenantId: result.context.tenantId,
    permissions: result.context.user.permissions,
    sessionId: result.context.sessionId
  });
});

gatewayRouter.get("/auth/me", authenticateGateway, (req, res) => {
  const context: GatewayAuthContext = (req as any).curaContext;
  return res.status(200).json({
    success: true,
    context: {
      user: context.user,
      tenantId: context.tenantId,
      sessionId: context.sessionId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      expiresAt: new Date(context.expiresAt).toISOString()
    }
  });
});

gatewayRouter.get("/auth/personas", (req, res) => {
  return res.status(200).json({
    success: true,
    personas: Object.keys(MOCK_USERS).map(k => ({
      key: k,
      ...MOCK_USERS[k]
    }))
  });
});

// ==========================================
// 3. TENANTS (MULTI-TENANT ISOLATION)
// ==========================================
gatewayRouter.get("/tenants", (req, res) => {
  return res.status(200).json({
    success: true,
    tenants: TENANTS
  });
});

// ==========================================
// 4. RATE LIMIT TESTING ENDPOINT
// ==========================================
gatewayRouter.post("/ratelimit/test", testRateLimiter, (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const status = getRateLimitStatus(ip, 60000, 5);

  return res.status(200).json({
    success: true,
    message: "Request passed rate limiter gateway filter.",
    clientIp: ip,
    rateLimitStatus: {
      limit: 5,
      remaining: status.remaining,
      resetSeconds: status.resetSeconds,
      totalHitsThisWindow: status.totalHits
    }
  });
});

gatewayRouter.post("/ratelimit/reset", (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  resetRateLimit(ip);
  return res.status(200).json({
    success: true,
    message: `Rate limiter window reset for ${ip}`
  });
});

// ==========================================
// 5. REQUEST VALIDATION TEST (ZOD)
// ==========================================
gatewayRouter.post("/validation/test", (req, res) => {
  const parseResult = ClinicalAdmissionSchema.safeParse(req.body);

  if (!parseResult.success) {
    const formattedErrors = parseResult.error.format();
    return res.status(400).json({
      type: "https://cura.in/errors/validation-failed",
      title: "Input Validation Failed",
      status: 400,
      detail: "One or more payload parameters failed strict clinical schema validation.",
      errors: parseResult.error.issues.map(err => ({
        field: err.path.join("."),
        message: err.message
      })),
      formattedErrors,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(200).json({
    success: true,
    message: "Payload validated successfully against ClinicalAdmissionSchema.",
    sanitizedData: parseResult.data,
    validationPassed: true
  });
});

// ==========================================
// 6. RBAC PERMISSION TEST ACTION
// ==========================================
gatewayRouter.post("/rbac/test-action", authenticateGateway, (req, res) => {
  const context: GatewayAuthContext = (req as any).curaContext;
  const { action } = req.body;

  // Action to required permission mapping
  const actionRules: Record<string, { role: string[]; permission: string; description: string }> = {
    "prescribe_narcotics": {
      role: ["DOCTOR"],
      permission: "prescribe:narcotics",
      description: "Prescribe Schedule X / Narcotic controlled analgesic"
    },
    "discharge_inpatient": {
      role: ["DOCTOR", "HOSPITAL_ADMIN"],
      permission: "discharge:patient",
      description: "Approve and authorize final inpatient discharge summary"
    },
    "view_audit_ledger": {
      role: ["HOSPITAL_ADMIN", "AUDITOR"],
      permission: "audit:read",
      description: "Inspect immutable tamper-proof cryptographic audit trail"
    },
    "dispense_controlled_meds": {
      role: ["PHARMACIST"],
      permission: "pharmacy:dispense",
      description: "Dispense high-alert medication with double-check barcode scan"
    },
    "manage_tenant_settings": {
      role: ["HOSPITAL_ADMIN"],
      permission: "tenant:manage",
      description: "Modify tenant hospital licenses and department mappings"
    }
  };

  const rule = actionRules[action];
  if (!rule) {
    return res.status(400).json({
      success: false,
      detail: `Unknown action: ${action}. Available: ${Object.keys(actionRules).join(", ")}`
    });
  }

  const hasRole = rule.role.includes(context.user.role);
  const hasPerm = context.user.permissions.includes(rule.permission as any);

  if (!hasRole || !hasPerm) {
    appendAuditEvent({
      tenantId: context.tenantId,
      userId: context.user.id,
      userRole: context.user.role,
      action: "AUTH",
      resourceType: "RBAC_ACTION_TEST",
      resourceId: action,
      details: `Forbidden action '${action}': Role '${context.user.role}' lacks permission '${rule.permission}'`,
      ipAddress: context.ipAddress
    });

    return res.status(403).json({
      type: "https://cura.in/errors/forbidden-rbac",
      title: "Action Forbidden by RBAC Policy",
      status: 403,
      action,
      actionDescription: rule.description,
      userRole: context.user.role,
      requiredRoles: rule.role,
      requiredPermission: rule.permission,
      allowed: false,
      detail: `Role '${context.user.role}' is not authorized for '${action}'. Requires role [${rule.role.join(", ")}] and permission '${rule.permission}'.`
    });
  }

  appendAuditEvent({
    tenantId: context.tenantId,
    userId: context.user.id,
    userRole: context.user.role,
    action: "UPDATE",
    resourceType: "RBAC_ACTION_TEST",
    resourceId: action,
    details: `Authorized execution of '${action}' by ${context.user.name} (${context.user.role})`,
    ipAddress: context.ipAddress
  });

  return res.status(200).json({
    success: true,
    action,
    actionDescription: rule.description,
    userRole: context.user.role,
    userName: context.user.name,
    allowed: true,
    message: `Authorization Granted: Role '${context.user.role}' successfully authorized to execute '${action}'.`
  });
});

// ==========================================
// 7. CLINICAL SERVICES (TENANT-ISOLATED DB)
// ==========================================
gatewayRouter.get("/clinical/patients", authenticateGateway, (req, res) => {
  const context: GatewayAuthContext = (req as any).curaContext;
  const search = req.query.search as string;
  const status = req.query.status as string;

  const result = queryTenantClinicalRecords(context.tenantId, { search, status });

  appendAuditEvent({
    tenantId: context.tenantId,
    userId: context.user.id,
    userRole: context.user.role,
    action: "VIEW",
    resourceType: "PATIENT_LIST",
    resourceId: context.tenantId,
    details: `Retrieved ${result.totalCount} tenant-isolated records from schema ${result.schema}`,
    ipAddress: context.ipAddress
  });

  return res.status(200).json({
    success: true,
    ...result
  });
});

gatewayRouter.post("/clinical/patients", authenticateGateway, requireRole("DOCTOR", "HOSPITAL_ADMIN", "NURSE"), (req, res) => {
  const context: GatewayAuthContext = (req as any).curaContext;

  const newPatient = insertTenantClinicalRecord(context.tenantId, {
    mrn: `${context.tenantId.toUpperCase().slice(-3)}-MRN-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: req.body.fullName || "New Patient",
    age: Number(req.body.age) || 35,
    gender: req.body.gender || "Male",
    phone: req.body.phone || "+91 98000 00000",
    bloodGroup: req.body.bloodGroup || "O+",
    allergies: req.body.allergies || [],
    currentDiagnosis: req.body.currentDiagnosis || "Under Evaluation",
    attendingDoctor: context.user.name,
    admissionStatus: req.body.admissionStatus || "inpatient",
    wardBed: req.body.wardBed || "General Bed #102",
    vitals: req.body.vitals || {
      bpSystolic: 120,
      bpDiastolic: 80,
      heartRate: 72,
      spo2: 99,
      temperatureF: 98.6
    }
  });

  appendAuditEvent({
    tenantId: context.tenantId,
    userId: context.user.id,
    userRole: context.user.role,
    action: "CREATE",
    resourceType: "PATIENT_RECORD",
    resourceId: newPatient.id,
    details: `Created patient ${newPatient.fullName} (${newPatient.mrn}) in tenant ${context.tenantId}`,
    ipAddress: context.ipAddress
  });

  return res.status(201).json({
    success: true,
    patient: newPatient
  });
});

// ==========================================
// 8. AI GATEWAY (GEMINI / MULTI-MODEL & CDSS)
// ==========================================
gatewayRouter.get("/ai/prompts", (req, res) => {
  return res.status(200).json({
    success: true,
    prompts: PROMPT_VERSIONS
  });
});

gatewayRouter.post("/ai/clinical-query", authenticateGateway, async (req, res) => {
  const context: GatewayAuthContext = (req as any).curaContext;
  const { query, promptVersionId, patientContext } = req.body;

  if (!query) {
    return res.status(400).json({ detail: "Query parameter is required" });
  }

  try {
    const result = await processClinicalAIQuery({
      tenantId: context.tenantId,
      userId: context.user.id,
      userRole: context.user.role,
      promptVersionId,
      patientContext,
      query
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      detail: err?.message || "AI Gateway invocation failed"
    });
  }
});

// ==========================================
// 9. OBJECT STORE (SECURE MEDICAL VAULT)
// ==========================================
gatewayRouter.get("/storage/files", authenticateGateway, (req, res) => {
  const context: GatewayAuthContext = (req as any).curaContext;
  const category = req.query.category as string;
  const files = listStoredObjects(context.tenantId, category);

  return res.status(200).json({
    success: true,
    tenantId: context.tenantId,
    files,
    totalCount: files.length
  });
});

gatewayRouter.post("/storage/upload", authenticateGateway, requirePermission("storage:upload"), (req, res) => {
  const context: GatewayAuthContext = (req as any).curaContext;
  const { fileName, category, fileSizeBytes, mimeType, metadata } = req.body;

  if (!fileName || !category) {
    return res.status(400).json({ detail: "fileName and category are required" });
  }

  const newObj = uploadMedicalObject({
    tenantId: context.tenantId,
    fileName,
    category,
    fileSizeBytes: Number(fileSizeBytes) || 1024 * 1024,
    mimeType: mimeType || "application/pdf",
    uploadedBy: context.user.id,
    userRole: context.user.role,
    metadata
  });

  return res.status(201).json({
    success: true,
    storedObject: newObj
  });
});

// ==========================================
// 10. REDIS QUEUE & CACHE
// ==========================================
gatewayRouter.get("/redis/stats", (req, res) => {
  const stats = getRedisStats();
  return res.status(200).json({
    success: true,
    stats
  });
});

gatewayRouter.get("/redis/jobs", (req, res) => {
  const jobs = listRedisJobs();
  return res.status(200).json({
    success: true,
    jobs
  });
});

gatewayRouter.post("/redis/enqueue", authenticateGateway, (req, res) => {
  const { queue, taskName, payload } = req.body;
  if (!queue || !taskName) {
    return res.status(400).json({ detail: "queue and taskName are required" });
  }

  const job = enqueueTaskJob({
    queue,
    taskName,
    payload: payload || {}
  });

  return res.status(202).json({
    success: true,
    job
  });
});

// ==========================================
// 11. AUDIT STORE (IMMUTABLE CRYPTO LEDGER)
// ==========================================
gatewayRouter.get("/audit/ledger", authenticateGateway, (req, res) => {
  const context: GatewayAuthContext = (req as any).curaContext;
  const tenantFilter = req.query.tenantId as string || (context.user.role === "AUDITOR" ? "all" : context.tenantId);
  const action = req.query.action as string;
  const limit = req.query.limit ? Number(req.query.limit) : 50;

  const logs = getAuditLedger({
    tenantId: tenantFilter,
    action,
    limit
  });

  return res.status(200).json({
    success: true,
    logs,
    totalCount: logs.length
  });
});

gatewayRouter.post("/audit/verify-chain", (req, res) => {
  const verification = verifyAuditChain();
  return res.status(200).json({
    success: true,
    verification
  });
});

// ==========================================
// 12. ABDM / FHIR R4 INTEGRATIONS
// ==========================================
gatewayRouter.get("/abdm/milestones", (req, res) => {
  return res.status(200).json({
    success: true,
    milestones: ABDM_MILESTONES
  });
});

gatewayRouter.post("/abdm/verify-abha", (req, res) => {
  const { abhaId } = req.body;
  if (!abhaId) {
    return res.status(400).json({ detail: "abhaId is required" });
  }
  const result = verifyAbhaAddress(abhaId);
  return res.status(200).json({
    success: true,
    result
  });
});

gatewayRouter.post("/abdm/generate-bundle", authenticateGateway, (req, res) => {
  const { patient, doctor, diagnosis, medications, vitals } = req.body;

  const bundle = generateFhirR4Bundle({
    patient: patient || {
      id: "pat-apollo-01",
      fullName: "Amit Patel",
      gender: "Male",
      age: 52,
      phone: "+91 98480 11223",
      abhaId: "amit.patel@abdm"
    },
    doctor: doctor || {
      name: "Dr. K. S. Murthy, MD",
      license: "MCI-CARD-99210-AP",
      hospital: "Apollo Super Specialty Hospital"
    },
    diagnosis: diagnosis || "Acute Coronary Syndrome (STEMI Post-PTCA)",
    medications: medications || [
      { name: "Aspirin 75mg", dosage: "1 tab", frequency: "OD", durationDays: 90 },
      { name: "Ticagrelor 90mg", dosage: "1 tab", frequency: "BD", durationDays: 180 },
      { name: "Atorvastatin 40mg", dosage: "1 tab", frequency: "HS", durationDays: 90 }
    ],
    vitals
  });

  return res.status(200).json({
    success: true,
    fhirBundle: bundle
  });
});
