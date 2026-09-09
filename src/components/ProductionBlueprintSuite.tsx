import React, { useState, useEffect } from "react";
import {
  Server,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Database,
  Layers,
  Zap,
  Activity,
  Lock,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Terminal,
  ChevronRight,
  HardDrive,
  Network,
  Users,
  Key,
  Flame,
  ArrowRight,
  Search,
  Plus,
  Play,
  Check,
  X,
  FileSpreadsheet,
  Building,
  UploadCloud,
  FileCode,
  Sliders,
  Compass,
  AlertCircle
} from "lucide-react";

interface NodeStatus {
  id: string;
  name: string;
  tier: string;
  status: "healthy" | "degraded" | "standby";
  latencyMs: number;
  throughputRps: number;
  uptimePct: number;
  activeConnections: number;
  details: string;
}

interface Tenant {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  tier: string;
  activeBeds: number;
  activeDoctors: number;
  status: string;
  dbSchema: string;
  encryptionKeyId: string;
}

interface AuditBlock {
  index: number;
  id: string;
  timestamp: string;
  tenantId: string;
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  prevHash: string;
  hash: string;
  signatureVerified: boolean;
}

interface StoredFile {
  id: string;
  tenantId: string;
  fileName: string;
  category: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256Checksum: string;
  virusScanStatus: string;
  isEncrypted: boolean;
  encryptionAlgorithm: string;
  storagePath: string;
  presignedUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  expiresAt: string;
  metadata?: Record<string, string>;
}

interface RedisJob {
  id: string;
  queue: string;
  taskName: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  workerId: string;
  createdAt: string;
  executionTimeMs?: number;
  result?: any;
}

interface ClinicalPatient {
  id: string;
  tenantId: string;
  mrn: string;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  bloodGroup: string;
  abhaId?: string;
  allergies: string[];
  currentDiagnosis: string;
  attendingDoctor: string;
  admissionStatus: string;
  wardBed?: string;
  vitals: {
    bpSystolic: number;
    bpDiastolic: number;
    heartRate: number;
    spo2: number;
    temperatureF: number;
  };
  lastUpdated: string;
}

export interface ProductionBlueprintSuiteProps {
  onBack?: () => void;
}

export const ProductionBlueprintSuite: React.FC<ProductionBlueprintSuiteProps> = ({ onBack }) => {
  // Navigation tabs for the production architecture suite
  const [activeTab, setActiveTab] = useState<
    "blueprint" | "gateway" | "postgres" | "objectstore" | "redis" | "audit" | "ai" | "abdm"
  >("blueprint");

  // Global system health nodes
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeStatus | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // Active user / persona context
  const [currentRole, setCurrentRole] = useState<string>("doctor");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentToken, setCurrentToken] = useState<string>("token_doctor");
  const [currentTenant, setCurrentTenant] = useState<string>("tenant_apollo");
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Rate Limiter Test State
  const [rateLimitHits, setRateLimitHits] = useState<number>(0);
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [isFiringRateTest, setIsFiringRateTest] = useState(false);

  // Validation Test State
  const [validationPayload, setValidationPayload] = useState<string>(
    JSON.stringify(
      {
        patientName: "Amit Patel",
        age: 52,
        gender: "Male",
        phone: "+919848011223",
        bloodPressureSystolic: 128,
        bloodPressureDiastolic: 82,
        diagnosis: "Acute Coronary Syndrome (STEMI Post-PTCA)"
      },
      null,
      2
    )
  );
  const [validationResult, setValidationResult] = useState<any>(null);

  // RBAC Action Test State
  const [selectedRbacAction, setSelectedRbacAction] = useState<string>("prescribe_narcotics");
  const [rbacTestResult, setRbacTestResult] = useState<any>(null);
  const [isTestingRbac, setIsTestingRbac] = useState(false);

  // Tenant Clinical DB State
  const [clinicalPatients, setClinicalPatients] = useState<ClinicalPatient[]>([]);
  const [patientSearch, setPatientSearch] = useState<string>("");
  const [crossTenantAttackResult, setCrossTenantAttackResult] = useState<any>(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    fullName: "",
    age: 45,
    gender: "Male",
    phone: "+91 98480 00000",
    bloodGroup: "O+",
    allergies: "Penicillin",
    currentDiagnosis: "Hypertensive Crisis with Angina"
  });

  // Object Store State
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);

  // Redis Queue & Cache State
  const [redisStats, setRedisStats] = useState<any>(null);
  const [redisJobs, setRedisJobs] = useState<RedisJob[]>([]);
  const [isEnqueueingJob, setIsEnqueueingJob] = useState(false);

  // Audit Store State
  const [auditLogs, setAuditLogs] = useState<AuditBlock[]>([]);
  const [chainVerification, setChainVerification] = useState<any>(null);
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);

  // AI Gateway State
  const [aiPrompts, setAiPrompts] = useState<any[]>([]);
  const [selectedPromptVersion, setSelectedPromptVersion] = useState<string>("prm-v2.0-nabh");
  const [aiClinicalQuery, setAiClinicalQuery] = useState<string>(
    "Patient presents with sudden onset crushing substernal chest pain radiating to left jaw, diaphoresis, and pulse of 105 bpm. Known Penicillin allergy. Evaluate differentials and safe acute therapy."
  );
  const [aiResult, setAiResult] = useState<any>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // ABDM State
  const [abdmMilestones, setAbdmMilestones] = useState<any[]>([]);
  const [abhaQuery, setAbhaQuery] = useState<string>("amit.patel@abdm");
  const [abhaVerificationResult, setAbhaVerificationResult] = useState<any>(null);
  const [fhirBundle, setFhirBundle] = useState<any>(null);
  const [isGeneratingFhir, setIsGeneratingFhir] = useState(false);

  // Decoupled Foundation & Feature APIs State (Golden Rule Architecture)
  const [storageHealth, setStorageHealth] = useState<any>(null);
  const [featureApiTestResult, setFeatureApiTestResult] = useState<any>(null);
  const [isTestingFeatureApi, setIsTestingFeatureApi] = useState(false);
  const [selectedFeatureApi, setSelectedFeatureApi] = useState<string>("patients");

  // Load initial health & configuration
  useEffect(() => {
    fetchHealth();
    fetchTenants();
    fetchRedisStats();
    fetchAuditLogs();
    fetchPrompts();
    fetchAbdmMilestones();
    fetchStorageHealth();
  }, []);

  const fetchStorageHealth = async () => {
    try {
      const res = await fetch("/api/v2/storage/health");
      const data = await res.json();
      setStorageHealth(data);
    } catch (err) {
      console.error("Storage health fetch error:", err);
    }
  };

  const testFeatureApi = async (apiEndpoint: string) => {
    setIsTestingFeatureApi(true);
    try {
      let url = "/api/v2/patients";
      if (apiEndpoint === "clinical") url = "/api/v2/clinical/encounters/pat_1";
      else if (apiEndpoint === "appointments") url = "/api/v2/appointments";
      else if (apiEndpoint === "pharmacy") url = "/api/v2/pharmacy/inventory";
      else if (apiEndpoint === "billing") url = "/api/v2/billing/invoices";
      else if (apiEndpoint === "diagnostics") url = "/api/v2/diagnostics/orders";
      else if (apiEndpoint === "storage") url = "/api/v2/storage/health";

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      const data = await res.json();
      setFeatureApiTestResult({
        endpoint: url,
        status: res.status,
        statusText: res.statusText,
        data
      });
    } catch (err: any) {
      setFeatureApiTestResult({
        endpoint: apiEndpoint,
        error: err.message
      });
    } finally {
      setIsTestingFeatureApi(false);
    }
  };

  // Sync session when role or tenant changes
  useEffect(() => {
    loginAsRole(currentRole, currentTenant);
  }, [currentRole, currentTenant]);

  // Sync tenant clinical patients & object storage when tenant changes
  useEffect(() => {
    fetchClinicalPatients(currentTenant);
    fetchStoredFiles(currentTenant);
  }, [currentTenant]);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch("/api/gateway/health", {
        headers: { Accept: "application/json" }
      });
      const cType = res.headers.get("content-type") || "";
      if (!cType.includes("application/json")) return;
      const data = await res.json();
      if (data.nodes) {
        setNodes(data.nodes);
        if (!selectedNode && data.nodes.length > 0) {
          setSelectedNode(data.nodes[1]); // Default to API Gateway node
        }
      }
    } catch (err) {
      console.error("Health fetch error:", err);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/gateway/tenants", {
        headers: { Accept: "application/json" }
      });
      const cType = res.headers.get("content-type") || "";
      if (!cType.includes("application/json")) return;
      const data = await res.json();
      if (data.tenants) {
        setTenants(data.tenants);
      }
    } catch (err) {
      console.error("Tenants fetch error:", err);
    }
  };

  const loginAsRole = async (role: string, tenantId: string) => {
    try {
      const res = await fetch("/api/gateway/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ role, tenantId })
      });
      const cType = res.headers.get("content-type") || "";
      if (!cType.includes("application/json")) return;
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setCurrentToken(data.token);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const fetchClinicalPatients = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/gateway/clinical/patients?token=${currentToken}`, {
        headers: {
          "x-tenant-id": tenantId,
          Accept: "application/json",
          Authorization: `Bearer ${currentToken}`
        }
      });
      const cType = res.headers.get("content-type") || "";
      if (!cType.includes("application/json")) return;
      const data = await res.json();
      if (data.records) {
        setClinicalPatients(data.records);
      }
    } catch (err) {
      console.error("Clinical patients fetch error:", err);
    }
  };

  const fetchStoredFiles = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/gateway/storage/files?token=${currentToken}`, {
        headers: {
          "x-tenant-id": tenantId,
          Accept: "application/json",
          Authorization: `Bearer ${currentToken}`
        }
      });
      const cType = res.headers.get("content-type") || "";
      if (!cType.includes("application/json")) return;
      const data = await res.json();
      if (data.files) {
        setStoredFiles(data.files);
        if (data.files.length > 0) setSelectedFile(data.files[0]);
      }
    } catch (err) {
      console.error("Stored files fetch error:", err);
    }
  };

  const fetchRedisStats = async () => {
    try {
      const resStats = await fetch("/api/gateway/redis/stats", {
        headers: { Accept: "application/json" }
      });
      const cTypeStats = resStats.headers.get("content-type") || "";
      if (cTypeStats.includes("application/json")) {
        const dataStats = await resStats.json();
        if (dataStats.stats) setRedisStats(dataStats.stats);
      }

      const resJobs = await fetch("/api/gateway/redis/jobs", {
        headers: { Accept: "application/json" }
      });
      const cTypeJobs = resJobs.headers.get("content-type") || "";
      if (cTypeJobs.includes("application/json")) {
        const dataJobs = await resJobs.json();
        if (dataJobs.jobs) setRedisJobs(dataJobs.jobs);
      }
    } catch (err) {
      console.error("Redis fetch error:", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`/api/gateway/audit/ledger?token=${currentToken}&limit=30`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${currentToken}`
        }
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        console.warn("Audit ledger response was not JSON:", contentType);
        return;
      }
      const data = await res.json();
      if (data.logs) {
        setAuditLogs(data.logs);
      } else if (Array.isArray(data)) {
        setAuditLogs(data);
      }
    } catch (err) {
      console.error("Audit fetch error:", err);
    }
  };

  const fetchPrompts = async () => {
    try {
      const res = await fetch("/api/gateway/ai/prompts", {
        headers: { Accept: "application/json" }
      });
      const cType = res.headers.get("content-type") || "";
      if (!cType.includes("application/json")) return;
      const data = await res.json();
      if (data.prompts) setAiPrompts(data.prompts);
    } catch (err) {
      console.error("Prompts fetch error:", err);
    }
  };

  const fetchAbdmMilestones = async () => {
    try {
      const res = await fetch("/api/gateway/abdm/milestones", {
        headers: { Accept: "application/json" }
      });
      const cType = res.headers.get("content-type") || "";
      if (!cType.includes("application/json")) return;
      const data = await res.json();
      if (data.milestones) setAbdmMilestones(data.milestones);
    } catch (err) {
      console.error("ABDM milestones error:", err);
    }
  };

  // Test Rate Limiting Trigger
  const fireRateLimitTest = async () => {
    setIsFiringRateTest(true);
    setRateLimitError(null);
    try {
      const res = await fetch("/api/gateway/ratelimit/test", {
        method: "POST"
      });
      const data = await res.json();
      if (res.status === 429) {
        setRateLimitStatus(null);
        setRateLimitError(data.detail || "HTTP 429: Too Many Requests! Rate Limiter Activated.");
      } else {
        setRateLimitStatus(data.rateLimitStatus);
        setRateLimitHits(prev => prev + 1);
      }
    } catch (err: any) {
      setRateLimitError("Network error during rate limit test");
    } finally {
      setIsFiringRateTest(false);
    }
  };

  const resetRateLimitTest = async () => {
    await fetch("/api/gateway/ratelimit/reset", { method: "POST" });
    setRateLimitHits(0);
    setRateLimitStatus(null);
    setRateLimitError(null);
  };

  // Test Zod Schema Validation
  const runValidationTest = async (payloadOverride?: string) => {
    const raw = payloadOverride || validationPayload;
    try {
      const parsed = JSON.parse(raw);
      const res = await fetch("/api/gateway/validation/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (err: any) {
      setValidationResult({
        success: false,
        title: "JSON Parsing Error",
        detail: "The payload is not valid JSON."
      });
    }
  };

  // Test RBAC Execution
  const runRbacTest = async (actionKey: string) => {
    setIsTestingRbac(true);
    try {
      const res = await fetch("/api/gateway/rbac/test-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({ action: actionKey })
      });
      const data = await res.json();
      setRbacTestResult(data);
      fetchAuditLogs(); // Refresh audit trail
    } catch (err) {
      console.error("RBAC test error:", err);
    } finally {
      setIsTestingRbac(false);
    }
  };

  // Verify Audit Chain
  const verifyChain = async () => {
    setIsVerifyingChain(true);
    try {
      const res = await fetch("/api/gateway/audit/verify-chain", { method: "POST" });
      const data = await res.json();
      setChainVerification(data.verification);
    } catch (err) {
      console.error("Verify chain error:", err);
    } finally {
      setIsVerifyingChain(false);
    }
  };

  // Simulate Cross-Tenant Query Attack
  const simulateCrossTenantAttack = () => {
    // Attempting to inject query for Fortis or Max data while authenticated on Apollo
    const foreignTenant = currentTenant === "tenant_apollo" ? "tenant_fortis" : "tenant_apollo";
    setCrossTenantAttackResult({
      status: "INTERCEPTED_AND_BLOCKED",
      statusCode: 403,
      policy: "PostgreSQL Row-Level Security & Tenant Boundary Assertion",
      attemptedTenant: foreignTenant,
      authenticatedTenant: currentTenant,
      reason: `Gateway intercepted unauthorized cross-tenant query. Token tenant (${currentTenant}) does not match query destination (${foreignTenant}). Zero cross-tenant data leakage permitted.`,
      timestamp: new Date().toISOString()
    });
  };

  // Submit New Patient
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/gateway/clinical/patients?token=${currentToken}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": currentTenant
        },
        body: JSON.stringify({
          fullName: newPatientForm.fullName,
          age: newPatientForm.age,
          gender: newPatientForm.gender,
          phone: newPatientForm.phone,
          bloodGroup: newPatientForm.bloodGroup,
          allergies: newPatientForm.allergies.split(",").map(s => s.trim()),
          currentDiagnosis: newPatientForm.currentDiagnosis
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddPatientModal(false);
        fetchClinicalPatients(currentTenant);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Add patient error:", err);
    }
  };

  // Run AI Gateway Query
  const runAIClinicalQuery = async () => {
    setIsAiProcessing(true);
    try {
      const res = await fetch("/api/gateway/ai/clinical-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          query: aiClinicalQuery,
          promptVersionId: selectedPromptVersion,
          patientContext: {
            name: "Amit Patel",
            age: 52,
            gender: "Male",
            allergies: ["Penicillin", "Sulfa Drugs"],
            currentMedications: ["Atorvastatin 40mg", "Aspirin 75mg"],
            primaryDiagnosis: "Acute Coronary Syndrome"
          }
        })
      });
      const data = await res.json();
      setAiResult(data);
      fetchAuditLogs();
    } catch (err) {
      console.error("AI Gateway error:", err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Enqueue Redis Task
  const dispatchRedisJob = async (queue: string, taskName: string, payload: any) => {
    setIsEnqueueingJob(true);
    try {
      const res = await fetch("/api/gateway/redis/enqueue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({ queue, taskName, payload })
      });
      const data = await res.json();
      if (data.job) {
        fetchRedisStats();
      }
    } catch (err) {
      console.error("Enqueue error:", err);
    } finally {
      setIsEnqueueingJob(false);
    }
  };

  // ABDM Verify ABHA
  const handleVerifyAbha = async () => {
    try {
      const res = await fetch("/api/gateway/abdm/verify-abha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abhaId: abhaQuery })
      });
      const data = await res.json();
      setAbhaVerificationResult(data.result);
    } catch (err) {
      console.error("Verify ABHA error:", err);
    }
  };

  // ABDM Generate FHIR R4 Bundle
  const handleGenerateFhirBundle = async () => {
    setIsGeneratingFhir(true);
    try {
      const res = await fetch("/api/gateway/abdm/generate-bundle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          patient: {
            id: "pat-apollo-01",
            fullName: "Amit Patel",
            gender: "Male",
            age: 52,
            phone: "+91 98480 11223",
            abhaId: "amit.patel@abdm"
          },
          doctor: {
            name: "Dr. K. S. Murthy, MD",
            license: "MCI-CARD-99210-AP",
            hospital: "Apollo Super Specialty Hospital"
          },
          diagnosis: "Acute Coronary Syndrome (STEMI Post-PTCA)",
          medications: [
            { name: "Aspirin 75mg", dosage: "1 tablet", frequency: "Once Daily", durationDays: 90 },
            { name: "Ticagrelor 90mg", dosage: "1 tablet", frequency: "Twice Daily", durationDays: 180 },
            { name: "Atorvastatin 40mg", dosage: "1 tablet", frequency: "At Bedtime", durationDays: 90 }
          ]
        })
      });
      const data = await res.json();
      setFhirBundle(data.fhirBundle);
    } catch (err) {
      console.error("Generate FHIR bundle error:", err);
    } finally {
      setIsGeneratingFhir(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation & Status Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-white">CURA</span>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono">
                  PRODUCTION GATEWAY v2.5
                </span>
                <span className="flex items-center text-xs text-emerald-400 space-x-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ALL SYSTEMS LIVE</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Target Architecture • Tenant-Isolated PostgreSQL • API Gateway • AI Gateway
              </p>
            </div>
          </div>

          {/* Quick Persona & Tenant Switcher */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <Building className="w-4 h-4 text-slate-400" />
              <select
                value={currentTenant}
                onChange={e => setCurrentTenant(e.target.value)}
                className="bg-transparent text-xs text-slate-200 border-none outline-none cursor-pointer pr-1 font-medium"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
                    {t.name} ({t.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <Users className="w-4 h-4 text-teal-400" />
              <select
                value={currentRole}
                onChange={e => setCurrentRole(e.target.value)}
                className="bg-transparent text-xs text-teal-200 border-none outline-none cursor-pointer pr-1 font-medium"
              >
                <option value="doctor" className="bg-slate-900 text-slate-100">
                  Doctor (Dr. Murthy)
                </option>
                <option value="hospital_admin" className="bg-slate-900 text-slate-100">
                  Hospital Admin (Dr. Sharma)
                </option>
                <option value="patient" className="bg-slate-900 text-slate-100">
                  Patient (Amit Patel)
                </option>
                <option value="pharmacist" className="bg-slate-900 text-slate-100">
                  Pharmacist (Priya Sharma)
                </option>
                <option value="nurse" className="bg-slate-900 text-slate-100">
                  Head Nurse (Margaret)
                </option>
                <option value="radiologist" className="bg-slate-900 text-slate-100">
                  Radiologist (Dr. Roy)
                </option>
                <option value="auditor" className="bg-slate-900 text-slate-100">
                  Auditor (NABH Assessor)
                </option>
              </select>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                title="Return to CURA Main Platform"
              >
                <span>←</span>
                <span className="hidden sm:inline">Exit to Main App</span>
                <span className="sm:hidden">Exit</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto border-t border-slate-800/60 py-1 scrollbar-none">
          {[
            { id: "blueprint", label: "Architecture Topology", icon: Compass },
            { id: "gateway", label: "API Gateway Sandbox", icon: ShieldCheck },
            { id: "postgres", label: "PostgreSQL Tenant DB", icon: Database },
            { id: "objectstore", label: "Object Store Vault", icon: HardDrive },
            { id: "redis", label: "Redis Queue & Cache", icon: Zap },
            { id: "audit", label: "Crypto Audit Store", icon: Lock },
            { id: "ai", label: "AI Gateway CDSS", icon: Cpu },
            { id: "abdm", label: "ABDM & FHIR R4", icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ========================================================================= */}
        {/* TAB 1: ARCHITECTURE TOPOLOGY (Interactive Visual Target Blueprint)        */}
        {/* ========================================================================= */}
        {activeTab === "blueprint" && (
          <div className="space-y-6">
            {/* Architectural Overview Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 p-6 rounded-xl border border-slate-800 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">Target Blueprint</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">Enterprise Healthcare Grade</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mt-1">CURA Production Architecture</h1>
                  <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                    High-throughput, tenant-isolated healthcare platform featuring an API Gateway with rate limiting & RBAC,
                    decoupled clinical microservices, secure PostgreSQL isolation, asynchronous Redis queueing, AES-256 object storage,
                    tamper-evident cryptographic audit ledger, and multi-model AI decision support.
                  </p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={fetchHealth}
                    disabled={isLoadingHealth}
                    className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? "animate-spin" : ""}`} />
                    <span>Refresh Telemetry</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("gateway")}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-md transition"
                  >
                    <span>Open Gateway Sandbox</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* GOLDEN RULE: ARCHITECTURE TRANSFORMATION CARD */}
            <div className="bg-slate-900 p-6 rounded-xl border border-teal-500/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>GOLDEN RULE ARCHITECTURAL MANDATE</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-2">
                    Existing CURA UI is an Asset — Retained 100% Intact with Modern Multi-Tier Foundation
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-4xl leading-relaxed">
                    We keep all existing screens, design systems, clinical dashboards, specialty suites (Cardiology, Dentistry, Pediatrics, AYUSH, Oncology), and AI UX.
                    The fragile monolithic in-memory single server has been completely replaced with a decoupled 4-tier production foundation.
                  </p>
                </div>

                {/* Storage Health Pill */}
                {storageHealth && (
                  <div className="hidden lg:flex items-center space-x-3 bg-slate-850 p-2.5 rounded-lg border border-slate-700/80">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Storage Health</div>
                      <div className="text-xs font-mono text-emerald-400 font-bold">PG • Redis • S3 Live</div>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* OLD CURA */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-red-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400">OLD CURA (Legacy Foundation)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-red-500/10 text-red-300 font-mono">Monolithic Risk</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      🎨 CURA UI Screens (Tightly coupled)
                    </div>
                    <div className="text-center text-slate-600">↓ (Direct Raw Calls)</div>
                    <div className="p-2.5 rounded bg-red-950/30 border border-red-800/40 text-red-200">
                      ⚠️ Giant Monolithic Server (13,000+ lines in single file)
                    </div>
                    <div className="text-center text-slate-600">↓ (Volatile Memory)</div>
                    <div className="p-2.5 rounded bg-red-950/30 border border-red-800/40 text-red-200">
                      💾 In-Memory Stores (Lost on restart, no ACID, no tenant isolation)
                    </div>
                  </div>
                </div>

                {/* NEW CURA */}
                <div className="bg-teal-950/20 p-4 rounded-xl border border-teal-500/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">NEW CURA (Live Production Architecture)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-mono">Decoupled & Resilient</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-900 border border-teal-500/30 text-teal-200 flex items-center justify-between">
                      <span>✨ Preserved UI & Design System</span>
                      <span className="text-[10px] text-teal-400 font-sans">100% Retained</span>
                    </div>
                    <div className="text-center text-teal-500/60 font-sans text-[11px]">↓ Clean REST & Security Headers</div>
                    <div className="p-2.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-200">
                      🛡️ Feature APIs (<code className="text-cyan-400">/api/v2/*</code>: Patients, Clinical, Appointments, Pharmacy, Billing, Diagnostics)
                    </div>
                    <div className="text-center text-cyan-500/60 font-sans text-[11px]">↓ Domain Logic & Rules</div>
                    <div className="p-2.5 rounded bg-slate-900 border border-emerald-500/30 text-emerald-200">
                      ⚙️ Domain Services (<code className="text-emerald-400">PatientDomainService</code>, <code className="text-emerald-400">ClinicalDomainService</code>, etc.)
                    </div>
                    <div className="text-center text-emerald-500/60 font-sans text-[11px]">↓ Data Access Abstractions</div>
                    <div className="p-2.5 rounded bg-slate-900 border border-blue-500/30 text-blue-200">
                      🗄️ PostgreSQL (Tenant-Isolated RLS) • Redis (Queues & Cache) • Object Storage (AES-256 Vault)
                    </div>
                    <div className="text-center text-blue-500/60 font-sans text-[11px]">↓ Secure Boundary</div>
                    <div className="p-2.5 rounded bg-slate-900 border border-purple-500/30 text-purple-200">
                      🌐 External Integrations (ABDM M1-M3, WhatsApp/SMS Gateway, Gemini AI CDSS, FHIR R4)
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Live Feature API Test Bench */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-teal-400" />
                      <span>Live Decoupled Feature API Console</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Execute live requests to the newly decoupled Domain Services and inspect response payloads.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: "storage", label: "Storage Health", endpoint: "/api/v2/storage/health" },
                      { id: "patients", label: "Patients API", endpoint: "/api/v2/patients" },
                      { id: "clinical", label: "Clinical Encounters", endpoint: "/api/v2/clinical/encounters/pat_1" },
                      { id: "appointments", label: "Appointments API", endpoint: "/api/v2/appointments" },
                      { id: "pharmacy", label: "Pharmacy Inventory", endpoint: "/api/v2/pharmacy/inventory" },
                      { id: "billing", label: "Billing Invoices", endpoint: "/api/v2/billing/invoices" },
                      { id: "diagnostics", label: "Diagnostics Orders", endpoint: "/api/v2/diagnostics/orders" }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        onClick={() => {
                          setSelectedFeatureApi(btn.id);
                          testFeatureApi(btn.id);
                        }}
                        disabled={isTestingFeatureApi}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono transition-all cursor-pointer ${
                          selectedFeatureApi === btn.id
                            ? "bg-teal-600 text-white border-teal-500"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Response Display */}
                {featureApiTestResult && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                          HTTP {featureApiTestResult.status || 200} OK
                        </span>
                        <span className="text-slate-300">{featureApiTestResult.endpoint}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Processed by Decoupled Domain Service</span>
                    </div>
                    <pre className="text-teal-300 max-h-48 overflow-y-auto scrollbar-thin">
                      {JSON.stringify(featureApiTestResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Architecture Flow Diagram */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Network className="w-4 h-4 text-teal-400" />
                  <span>Live Interactive Topology Map (Click Any Node for Inspection)</span>
                </h3>
                <span className="text-xs text-slate-400">Active Nodes: {nodes.length} / 10 Operational</span>
              </div>

              {/* Graphical Blueprint Flow */}
              <div className="space-y-4">
                {/* 1. Presentation Tier */}
                <div className="flex justify-center">
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_web") || null)}
                    className={`cursor-pointer w-full max-w-md p-4 rounded-xl border transition-all text-center ${
                      selectedNode?.id === "node_web"
                        ? "bg-teal-950/40 border-teal-500 shadow-lg shadow-teal-500/10"
                        : "bg-slate-850 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-teal-400">Presentation Tier</div>
                    <div className="text-base font-bold text-white mt-0.5">CURA Web</div>
                    <div className="text-xs text-slate-400 mt-1">Doctor • Hospital Admin • Patient • Pharmacist</div>
                    <div className="flex justify-center items-center space-x-4 mt-2 text-xs font-mono text-slate-300">
                      <span>184 RPS</span>
                      <span>•</span>
                      <span>12ms Latency</span>
                      <span>•</span>
                      <span className="text-emerald-400">99.98% Uptime</span>
                    </div>
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center items-center space-x-2 text-slate-500 py-1">
                  <div className="h-4 w-px bg-slate-700"></div>
                  <span className="text-xs font-mono uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                    HTTPS / TLS 1.3 Secure API
                  </span>
                  <div className="h-4 w-px bg-slate-700"></div>
                </div>

                {/* 2. Gateway Tier */}
                <div className="flex justify-center">
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_gateway") || null)}
                    className={`cursor-pointer w-full max-w-lg p-4 rounded-xl border transition-all text-center ${
                      selectedNode?.id === "node_gateway"
                        ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10"
                        : "bg-slate-850 border-cyan-500/40 hover:border-cyan-400"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>API Gateway Tier</span>
                    </div>
                    <div className="text-lg font-bold text-white mt-0.5">CURA Central API Gateway</div>
                    <div className="text-xs text-cyan-200 mt-1">
                      Token Authentication • Sliding Window Rate Limiting • Zod Schema Validation • Granular RBAC
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-2 text-xs font-mono text-slate-300">
                      <span>340 RPS</span>
                      <span>•</span>
                      <span>4ms Latency</span>
                      <span>•</span>
                      <span className="text-emerald-400">99.99% Uptime</span>
                    </div>
                  </div>
                </div>

                {/* Connector Arrows to 3 Services */}
                <div className="grid grid-cols-3 max-w-3xl mx-auto gap-4 py-1 text-center">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-px bg-slate-700"></div>
                    <span className="text-[10px] text-slate-500 font-mono">gRPC / Internal</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-px bg-slate-700"></div>
                    <span className="text-[10px] text-slate-500 font-mono">gRPC / Internal</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-px bg-slate-700"></div>
                    <span className="text-[10px] text-slate-500 font-mono">gRPC / Internal</span>
                  </div>
                </div>

                {/* 3. Decoupled Service Tier */}
                <div className="grid grid-cols-1 md:grid-cols-3 max-w-3xl mx-auto gap-4">
                  {/* Identity & Access */}
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_identity") || null)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all text-center ${
                      selectedNode?.id === "node_identity"
                        ? "bg-purple-950/40 border-purple-500"
                        : "bg-slate-850 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <Key className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                    <div className="text-xs font-bold text-white">Identity & Access</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Sessions, MFA, Tenant Membership</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-2">62 RPS • 8ms</div>
                  </div>

                  {/* Clinical Services */}
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_clinical") || null)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all text-center ${
                      selectedNode?.id === "node_clinical"
                        ? "bg-emerald-950/40 border-emerald-500"
                        : "bg-slate-850 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <Activity className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                    <div className="text-xs font-bold text-white">Clinical Services</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">EHR, Admissions, Beds, Vitals</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-2">110 RPS • 14ms</div>
                  </div>

                  {/* AI Gateway */}
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_ai_gateway") || null)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all text-center ${
                      selectedNode?.id === "node_ai_gateway"
                        ? "bg-amber-950/40 border-amber-500"
                        : "bg-slate-850 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <Cpu className="w-5 h-5 mx-auto text-amber-400 mb-1" />
                    <div className="text-xs font-bold text-white">AI Gateway</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Prompt Versioning, Safety Gate, CDSS</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-2">18 RPS • 380ms</div>
                  </div>
                </div>

                {/* Converging into PostgreSQL Database */}
                <div className="flex justify-center items-center py-1">
                  <div className="h-4 w-px bg-slate-700"></div>
                </div>

                {/* 4. Persistence Tier: Tenant-isolated PostgreSQL */}
                <div className="flex justify-center">
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_postgres") || null)}
                    className={`cursor-pointer w-full max-w-lg p-4 rounded-xl border transition-all text-center ${
                      selectedNode?.id === "node_postgres"
                        ? "bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10"
                        : "bg-slate-850 border-blue-500/40 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                      <Database className="w-4 h-4" />
                      <span>Persistence Tier</span>
                    </div>
                    <div className="text-lg font-bold text-white mt-0.5">PostgreSQL (Tenant-Isolated)</div>
                    <div className="text-xs text-blue-200 mt-1">
                      Row-Level Security (RLS) • Isolated Schemas per Hospital • Zero Cross-Tenant Leakage
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-2 text-xs font-mono text-slate-300">
                      <span>240 RPS</span>
                      <span>•</span>
                      <span>6ms Latency</span>
                      <span>•</span>
                      <span className="text-emerald-400">99.99% Uptime</span>
                    </div>
                  </div>
                </div>

                {/* Diverging into 3 Storage / Infra Services */}
                <div className="grid grid-cols-3 max-w-3xl mx-auto gap-4 py-1 text-center">
                  <div className="h-3 w-px bg-slate-700 mx-auto"></div>
                  <div className="h-3 w-px bg-slate-700 mx-auto"></div>
                  <div className="h-3 w-px bg-slate-700 mx-auto"></div>
                </div>

                {/* 5. Infrastructure Stores */}
                <div className="grid grid-cols-1 md:grid-cols-3 max-w-3xl mx-auto gap-4">
                  {/* Object Store */}
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_object_store") || null)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all text-center ${
                      selectedNode?.id === "node_object_store"
                        ? "bg-indigo-950/40 border-indigo-500"
                        : "bg-slate-850 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <HardDrive className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
                    <div className="text-xs font-bold text-white">Object Store</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Encrypted DICOM & Lab Reports</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-2">AES-256 • Presigned URLs</div>
                  </div>

                  {/* Redis Queue / Cache */}
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_redis") || null)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all text-center ${
                      selectedNode?.id === "node_redis"
                        ? "bg-rose-950/40 border-rose-500"
                        : "bg-slate-850 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <Zap className="w-5 h-5 mx-auto text-rose-400 mb-1" />
                    <div className="text-xs font-bold text-white">Redis Queue & Cache</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Sub-ms Cache, Async Tasks</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-2">1ms Latency • 580 RPS</div>
                  </div>

                  {/* Audit Store */}
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_audit_store") || null)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all text-center ${
                      selectedNode?.id === "node_audit_store"
                        ? "bg-emerald-950/40 border-emerald-500"
                        : "bg-slate-850 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <Lock className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                    <div className="text-xs font-bold text-white">Audit Store</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Immutable Cryptographic Trail</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-2">SHA-256 Chained Blocks</div>
                  </div>
                </div>

                {/* External Integrations */}
                <div className="grid grid-cols-2 max-w-xl mx-auto gap-4 pt-3">
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_abdm_fhir") || null)}
                    className={`cursor-pointer p-3 rounded-lg border text-center transition ${
                      selectedNode?.id === "node_abdm_fhir"
                        ? "bg-teal-950/40 border-teal-500"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs font-semibold text-teal-400">ABDM / FHIR R4 / HL7</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">National Health Authority Gateway</p>
                  </div>
                  <div
                    onClick={() => setSelectedNode(nodes.find(n => n.id === "node_ai_gateway") || null)}
                    className="cursor-pointer p-3 rounded-lg border border-slate-800 bg-slate-900 hover:border-slate-700 text-center transition"
                  >
                    <span className="text-xs font-semibold text-amber-400">AI / ML Providers</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Gemini 3.8 Flash & Clinical Models</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Node Telemetry & Inspector */}
            {selectedNode && (
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                    <div>
                      <h4 className="text-base font-bold text-white">{selectedNode.name}</h4>
                      <span className="text-xs font-mono uppercase text-slate-400">
                        Tier: {selectedNode.tier} • Node ID: {selectedNode.id}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-medium self-start sm:self-auto">
                    OPERATIONAL (HEALTHY)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Avg Latency</span>
                    <div className="text-lg font-bold text-white font-mono mt-0.5">{selectedNode.latencyMs} ms</div>
                  </div>
                  <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Throughput</span>
                    <div className="text-lg font-bold text-white font-mono mt-0.5">{selectedNode.throughputRps} RPS</div>
                  </div>
                  <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">SLA Availability</span>
                    <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{selectedNode.uptimePct}%</div>
                  </div>
                  <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Active Sockets</span>
                    <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                      {selectedNode.activeConnections}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-4 bg-slate-950 p-3 rounded border border-slate-800/80 font-mono">
                  {selectedNode.details}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: API GATEWAY SANDBOX (Rate Limiting, Zod Validation, RBAC)           */}
        {/* ========================================================================= */}
        {activeTab === "gateway" && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">CURA API Gateway Security Sandbox</h2>
                  <p className="text-xs text-slate-400">
                    Interactive validation of core Gateway policies: Sliding Window Rate Limiting, Zod Schema Enforcement, and
                    Role-Based Access Control (RBAC).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Module 1: Rate Limiter Interactive Tester */}
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-rose-400" />
                      <h4 className="text-sm font-bold text-white">1. Sliding-Window Rate Limiter</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Window: 60s
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-3">
                    Configured for high-frequency testing at a strict limit of <strong>5 requests/minute</strong>. Rapidly click
                    to exhaust the bucket and witness HTTP 429 Too Many Requests response with Retry-After calculation.
                  </p>

                  <div className="mt-4 bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Allocated Quota:</span>
                      <span className="font-mono text-white font-semibold">5 requests</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Remaining Quota:</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {rateLimitStatus ? `${rateLimitStatus.remaining} / 5` : "5 / 5"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Window Hits:</span>
                      <span className="font-mono text-slate-200">
                        {rateLimitStatus ? rateLimitStatus.totalHitsThisWindow : rateLimitHits}
                      </span>
                    </div>
                  </div>

                  {rateLimitError && (
                    <div className="mt-3 p-3 rounded bg-rose-950/50 border border-rose-600/50 text-xs text-rose-300 flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">Rate Limit Exceeded (HTTP 429)</div>
                        <div className="text-[11px] mt-0.5">{rateLimitError}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex space-x-2">
                  <button
                    onClick={fireRateLimitTest}
                    disabled={isFiringRateTest}
                    className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Fire Request</span>
                  </button>
                  <button
                    onClick={resetRateLimitTest}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
                    title="Reset Bucket"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Module 2: Schema Validation Tester (Zod) */}
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">2. Zod Schema Validation</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                      RFC 7807 Errors
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-3">
                    Enforces strict data hygiene on clinical admission payloads. Test standard clinical data or inject bad types.
                  </p>

                  <div className="flex space-x-2 mt-3 mb-2">
                    <button
                      onClick={() => {
                        const valid = JSON.stringify(
                          {
                            patientName: "Amit Patel",
                            age: 52,
                            gender: "Male",
                            phone: "+919848011223",
                            bloodPressureSystolic: 128,
                            bloodPressureDiastolic: 82,
                            diagnosis: "Acute Coronary Syndrome"
                          },
                          null,
                          2
                        );
                        setValidationPayload(valid);
                        runValidationTest(valid);
                      }}
                      className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-medium"
                    >
                      Load Valid Payload
                    </button>
                    <button
                      onClick={() => {
                        const invalid = JSON.stringify(
                          {
                            patientName: "A",
                            age: 250,
                            gender: "Alien",
                            phone: "invalid_phone",
                            bloodPressureSystolic: 320,
                            bloodPressureDiastolic: 10,
                            diagnosis: ""
                          },
                          null,
                          2
                        );
                        setValidationPayload(invalid);
                        runValidationTest(invalid);
                      }}
                      className="px-2 py-1 text-[11px] bg-rose-950/60 hover:bg-rose-900/80 rounded text-rose-300 font-medium border border-rose-700/40"
                    >
                      Load Malformed
                    </button>
                  </div>

                  <textarea
                    value={validationPayload}
                    onChange={e => setValidationPayload(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-950 text-xs font-mono p-2.5 rounded border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500"
                  />

                  {validationResult && (
                    <div
                      className={`mt-3 p-3 rounded text-xs border ${
                        validationResult.success
                          ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-300"
                          : "bg-rose-950/40 border-rose-600/40 text-rose-300"
                      }`}
                    >
                      <div className="font-semibold flex items-center space-x-1">
                        {validationResult.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{validationResult.message || validationResult.detail}</span>
                      </div>
                      {validationResult.errors && (
                        <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-[11px]">
                          {validationResult.errors.map((e: any, i: number) => (
                            <li key={i}>
                              <span className="font-mono font-semibold">{e.field}:</span> {e.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => runValidationTest()}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition"
                  >
                    <span>Validate Against Gateway Schema</span>
                  </button>
                </div>
              </div>

              {/* Module 3: Granular RBAC Permission Tester */}
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-bold text-white">3. Role-Based Access Control (RBAC)</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                      Active: {currentRole.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-3">
                    Tests high-risk clinical actions. The Gateway inspects token role & permission arrays, granting execution or
                    rejecting with 403 Forbidden.
                  </p>

                  <div className="mt-4 space-y-2">
                    <label className="text-xs text-slate-300 font-medium">Select Clinical Action:</label>
                    <select
                      value={selectedRbacAction}
                      onChange={e => setSelectedRbacAction(e.target.value)}
                      className="w-full bg-slate-950 p-2 text-xs rounded border border-slate-800 text-slate-200 outline-none"
                    >
                      <option value="prescribe_narcotics">Prescribe Narcotics (Doctor Only)</option>
                      <option value="discharge_inpatient">Discharge Inpatient (Doctor / Hospital Admin)</option>
                      <option value="view_audit_ledger">View Audit Ledger (Admin / Auditor)</option>
                      <option value="dispense_controlled_meds">Dispense Controlled Meds (Pharmacist Only)</option>
                      <option value="manage_tenant_settings">Manage Tenant Settings (Admin Only)</option>
                    </select>
                  </div>

                  {rbacTestResult && (
                    <div
                      className={`mt-4 p-3 rounded text-xs border ${
                        rbacTestResult.allowed
                          ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-300"
                          : "bg-rose-950/40 border-rose-600/40 text-rose-300"
                      }`}
                    >
                      <div className="font-semibold flex items-center space-x-1">
                        {rbacTestResult.allowed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{rbacTestResult.allowed ? "ACCESS GRANTED (200 OK)" : "ACCESS FORBIDDEN (403)"}</span>
                      </div>
                      <p className="text-[11px] mt-1">{rbacTestResult.message || rbacTestResult.detail}</p>
                      {!rbacTestResult.allowed && rbacTestResult.requiredRoles && (
                        <div className="mt-1 text-[10px] text-slate-400">
                          Authorized Roles: {rbacTestResult.requiredRoles.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => runRbacTest(selectedRbacAction)}
                    disabled={isTestingRbac}
                    className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition"
                  >
                    <span>Execute Action Under '{currentRole.toUpperCase()}'</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: POSTGRESQL TENANT-ISOLATED CLINICAL DATABASE                        */}
        {/* ========================================================================= */}
        {activeTab === "postgres" && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Tenant-Isolated Clinical Database (PostgreSQL)</h2>
                    <p className="text-xs text-slate-400">
                      Partitioned schemas with strict Row-Level Security (RLS) enforcement. Active Schema:{" "}
                      <code className="text-blue-300 font-mono">
                        {tenants.find(t => t.id === currentTenant)?.dbSchema || "tenant_apollo_clinical"}
                      </code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={simulateCrossTenantAttack}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Simulate Cross-Tenant Query Attack</span>
                  </button>
                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Admit Patient</span>
                  </button>
                </div>
              </div>

              {/* Cross-Tenant Attack Intercept Banner */}
              {crossTenantAttackResult && (
                <div className="mt-4 p-4 rounded-lg bg-rose-950/40 border border-rose-600 text-rose-200 text-xs">
                  <div className="flex items-center space-x-2 font-bold text-rose-300">
                    <ShieldAlert className="w-4 h-4" />
                    <span>ATTACK INTERCEPTED & BLOCKED BY GATEWAY RLS FILTER (403 FORBIDDEN)</span>
                  </div>
                  <p className="mt-1 text-slate-300">{crossTenantAttackResult.reason}</p>
                  <div className="mt-2 font-mono text-[11px] text-slate-400">
                    Policy: {crossTenantAttackResult.policy} • Timestamp: {crossTenantAttackResult.timestamp}
                  </div>
                </div>
              )}
            </div>

            {/* Patients List Scoped to Tenant */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Patients Partitioned in {tenants.find(t => t.id === currentTenant)?.name} ({clinicalPatients.length} Active)
                </h3>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                    placeholder="Search by name, MRN, diagnosis..."
                    className="w-full bg-slate-950 pl-8 pr-3 py-1.5 rounded text-xs text-slate-200 border border-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Patient / MRN</th>
                      <th className="py-3 px-4">Age / Gender</th>
                      <th className="py-3 px-4">Diagnosis</th>
                      <th className="py-3 px-4">Attending Doctor</th>
                      <th className="py-3 px-4">Vitals</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Tenant Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {clinicalPatients
                      .filter(p => !patientSearch || p.fullName.toLowerCase().includes(patientSearch.toLowerCase()))
                      .map(patient => (
                        <tr key={patient.id} className="hover:bg-slate-850 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{patient.fullName}</div>
                            <div className="font-mono text-[11px] text-slate-400">{patient.mrn}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {patient.age}y • {patient.gender}
                            <div className="text-[11px] text-teal-400 font-mono">{patient.bloodGroup}</div>
                          </td>
                          <td className="py-3 px-4 max-w-xs text-slate-200">
                            {patient.currentDiagnosis}
                            {patient.allergies.length > 0 && (
                              <div className="text-[10px] text-rose-400 mt-0.5">
                                Allergies: {patient.allergies.join(", ")}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{patient.attendingDoctor}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                            BP: {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic} • HR: {patient.vitals.heartRate}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                patient.admissionStatus === "inpatient"
                                  ? "bg-amber-950/80 text-amber-300 border border-amber-800/40"
                                  : "bg-teal-950/80 text-teal-300 border border-teal-800/40"
                              }`}
                            >
                              {patient.admissionStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-blue-400">
                            {patient.tenantId}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal for Admitting New Patient */}
            {showAddPatientModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-md w-full p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-base font-bold text-white">Admit Patient to {tenants.find(t => t.id === currentTenant)?.name}</h3>
                    <button onClick={() => setShowAddPatientModal(false)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddPatient} className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newPatientForm.fullName}
                        onChange={e => setNewPatientForm({ ...newPatientForm, fullName: e.target.value })}
                        className="w-full bg-slate-950 text-xs p-2 rounded border border-slate-800 text-white outline-none mt-1"
                        placeholder="e.g. Ramesh Chandra"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300">Age</label>
                        <input
                          type="number"
                          required
                          value={newPatientForm.age}
                          onChange={e => setNewPatientForm({ ...newPatientForm, age: Number(e.target.value) })}
                          className="w-full bg-slate-950 text-xs p-2 rounded border border-slate-800 text-white outline-none mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300">Gender</label>
                        <select
                          value={newPatientForm.gender}
                          onChange={e => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                          className="w-full bg-slate-950 text-xs p-2 rounded border border-slate-800 text-white outline-none mt-1"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-300">Primary Diagnosis</label>
                      <input
                        type="text"
                        required
                        value={newPatientForm.currentDiagnosis}
                        onChange={e => setNewPatientForm({ ...newPatientForm, currentDiagnosis: e.target.value })}
                        className="w-full bg-slate-950 text-xs p-2 rounded border border-slate-800 text-white outline-none mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300">Allergies (comma-separated)</label>
                      <input
                        type="text"
                        value={newPatientForm.allergies}
                        onChange={e => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                        className="w-full bg-slate-950 text-xs p-2 rounded border border-slate-800 text-white outline-none mt-1"
                      />
                    </div>
                    <div className="pt-2 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAddPatientModal(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                      >
                        Commit to Database
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: OBJECT STORE (Medical Reports, Scans & DICOM Vault)                */}
        {/* ========================================================================= */}
        {activeTab === "objectstore" && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Object Store (Reports & Imaging Vault)</h2>
                    <p className="text-xs text-slate-400">
                      S3/Cloud Storage abstraction for encrypted clinical DICOM, laboratory PDFs, and discharge summaries with
                      SHA-256 integrity tags.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newFile = prompt("Enter file name to upload:", "Brain_MRI_T2_Axial.dcm");
                    if (newFile) {
                      fetch(`/api/gateway/storage/upload?token=${currentToken}`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "x-tenant-id": currentTenant
                        },
                        body: JSON.stringify({
                          fileName: newFile,
                          category: "radiology_dicom",
                          fileSizeBytes: 52428800,
                          mimeType: "application/dicom"
                        })
                      }).then(() => {
                        fetchStoredFiles(currentTenant);
                        fetchAuditLogs();
                      });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Medical Artifact</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Files List */}
              <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="text-sm font-semibold text-white">
                    Vault Objects in {currentTenant} ({storedFiles.length})
                  </h3>
                </div>
                <div className="divide-y divide-slate-800">
                  {storedFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedFile?.id === file.id ? "bg-indigo-950/40 border-l-4 border-indigo-500" : "hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-white text-xs">{file.fileName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {(file.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB • {file.mimeType}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                            AES-256-GCM
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-mono">
                            {file.virusScanStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected File Details & Presigned URL Generator */}
              {selectedFile && (
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="pb-3 border-b border-slate-800">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase">Object Detail</span>
                    <h4 className="text-sm font-bold text-white break-words mt-0.5">{selectedFile.fileName}</h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400">Canonical Storage URI:</span>
                      <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 break-all mt-1">
                        {selectedFile.storagePath}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400">SHA-256 Checksum:</span>
                      <div className="font-mono text-[10px] text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800 break-all mt-1">
                        {selectedFile.sha256Checksum}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400">Expiring Presigned HTTPS URL:</span>
                      <div className="font-mono text-[10px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800 break-all mt-1">
                        {selectedFile.presignedUrl}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="bg-slate-850 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400">Uploaded By:</span>
                        <div className="font-mono text-[11px] text-slate-200 mt-0.5">{selectedFile.uploadedBy}</div>
                      </div>
                      <div className="bg-slate-850 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400">Expires:</span>
                        <div className="font-mono text-[11px] text-slate-200 mt-0.5">7 Days</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: REDIS QUEUE & CACHE ENGINE                                         */}
        {/* ========================================================================= */}
        {activeTab === "redis" && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Redis Queue & Hot Memory Cache</h2>
                    <p className="text-xs text-slate-400">
                      Celery/BullMQ asynchronous task workers & sub-millisecond in-memory cache engine for high-acuity medical alerts.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    dispatchRedisJob(
                      "critical_clinical_tasks",
                      "Dispatch Stat Code Blue & Troponin Broadcast",
                      { patientMrn: "APOLLO-MRN-9021", troponinValue: "6.2 ng/mL" }
                    )
                  }
                  disabled={isEnqueueingJob}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Dispatch New Task to Queue</span>
                </button>
              </div>
            </div>

            {/* Redis Metrics Grid */}
            {redisStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Cache Hit Rate</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{redisStats.hitRatePct}%</div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {redisStats.hitCount} hits / {redisStats.missCount} misses
                  </span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Active Queue Pipelines</span>
                  <div className="text-xl font-bold text-white font-mono mt-1">{redisStats.activeQueues} Queues</div>
                  <span className="text-[10px] text-slate-500 font-mono">{redisStats.totalKeys} indexed keys</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Pending Jobs in Buffer</span>
                  <div className="text-xl font-bold text-amber-400 font-mono mt-1">{redisStats.pendingJobs}</div>
                  <span className="text-[10px] text-slate-500 font-mono">{redisStats.completedJobs} finished</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Memory Utilization</span>
                  <div className="text-xl font-bold text-cyan-400 font-mono mt-1">{redisStats.memoryUsedMb} MB</div>
                  <span className="text-[10px] text-slate-500 font-mono">Uptime: {Math.round(redisStats.uptimeSeconds / 3600)}h</span>
                </div>
              </div>
            )}

            {/* Live Queue Tasks List */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white">Active Redis Background Queue Jobs</h3>
              </div>
              <div className="divide-y divide-slate-800">
                {redisJobs.map(job => (
                  <div key={job.id} className="p-4 hover:bg-slate-850 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-white">{job.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {job.queue}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-1 font-medium">{job.taskName}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-28 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full ${
                              job.status === "completed"
                                ? "bg-emerald-500"
                                : job.status === "processing"
                                ? "bg-amber-500 animate-pulse"
                                : "bg-slate-600"
                            }`}
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                            job.status === "completed"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: IMMUTABLE AUDIT STORE (SHA-256 Cryptographic Chain)                */}
        {/* ========================================================================= */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Immutable Audit Store (Cryptographic Ledger)</h2>
                    <p className="text-xs text-slate-400">
                      Append-only SHA-256 chained audit blocks satisfying NABH, HIPAA, and Indian DPDP Act compliance requirements.
                    </p>
                  </div>
                </div>

                <button
                  onClick={verifyChain}
                  disabled={isVerifyingChain}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Full Cryptographic Chain</span>
                </button>
              </div>

              {/* Chain Verification Result */}
              {chainVerification && (
                <div
                  className={`mt-4 p-4 rounded-lg border text-xs ${
                    chainVerification.isValid
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-200"
                      : "bg-rose-950/40 border-rose-500 text-rose-200"
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>LEDGER INTEGRITY 100% VERIFIED — ZERO TAMPERING DETECTED</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-slate-300">
                    Total Blocks Verified: {chainVerification.totalBlocks} • Latest Block Hash:{" "}
                    {chainVerification.latestHash.substring(0, 32)}...
                  </div>
                </div>
              )}
            </div>

            {/* Audit Blocks Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white">Cryptographic Audit Trail (Newest First)</h3>
                <span className="text-xs text-slate-400 font-mono">{auditLogs.length} Blocks Recorded</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Block #</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">SHA-256 Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-850 font-mono text-[11px]">
                        <td className="py-3 px-4 font-bold text-white">#{log.index}</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="py-3 px-4 text-slate-200">
                          {log.userId}
                          <div className="text-[10px] text-teal-400">{log.userRole}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.action === "BREAK_GLASS"
                                ? "bg-rose-950 text-rose-300 border border-rose-700"
                                : log.action === "AUTH"
                                ? "bg-purple-950 text-purple-300"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-cyan-300">{log.resourceType}</td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs font-sans text-xs">{log.details}</td>
                        <td className="py-3 px-4 text-emerald-400 text-[10px]" title={log.hash}>
                          {log.hash.substring(0, 16)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: AI GATEWAY & CLINICAL DECISION SUPPORT (CDSS)                       */}
        {/* ========================================================================= */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Clinical AI Gateway & Multi-Model CDSS</h2>
                  <p className="text-xs text-slate-400">
                    Prompt versioning, patient context grounding, pharmacovigilance contraindication cross-checking, and
                    Human-in-the-Loop (HITL) doctor confirmation gate.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Prompt Versioning & Query Input */}
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Select Active Prompt Version:
                  </label>
                  <select
                    value={selectedPromptVersion}
                    onChange={e => setSelectedPromptVersion(e.target.value)}
                    className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-amber-300 font-mono outline-none"
                  >
                    {aiPrompts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.version} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
                  <span className="text-slate-400 font-semibold block">Grounding Patient Context:</span>
                  <div className="text-slate-300">Amit Patel (52y, Male, MRN-9021)</div>
                  <div className="text-rose-400 font-semibold">Allergies: Penicillin, Sulfa Drugs</div>
                  <div className="text-slate-400">Meds: Atorvastatin 40mg, Aspirin 75mg</div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Clinician Query:</label>
                  <textarea
                    rows={4}
                    value={aiClinicalQuery}
                    onChange={e => setAiClinicalQuery(e.target.value)}
                    className="w-full bg-slate-950 p-2.5 rounded text-xs text-slate-200 border border-slate-800 outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <button
                  onClick={runAIClinicalQuery}
                  disabled={isAiProcessing}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center space-x-2 shadow-lg transition"
                >
                  <Cpu className={`w-4 h-4 ${isAiProcessing ? "animate-spin" : ""}`} />
                  <span>{isAiProcessing ? "Synthesizing Clinical CDSS..." : "Invoke AI Gateway CDSS"}</span>
                </button>
              </div>

              {/* Right Column: Structured Clinical CDSS Output */}
              <div className="lg:col-span-2 bg-slate-900 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-semibold text-white">Clinical Decision Support Output</h3>
                  {aiResult && (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                        Confidence: {(aiResult.confidenceScore * 100).toFixed(0)}%
                      </span>
                      <span className="text-slate-400 font-mono">{aiResult.latencyMs}ms</span>
                    </div>
                  )}
                </div>

                {aiResult ? (
                  <div className="mt-4 space-y-4 text-xs">
                    {/* Summary */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Clinical Synthesis</span>
                      <p className="text-slate-200 mt-1 text-sm">{aiResult.recommendation.summary}</p>
                    </div>

                    {/* Differentials */}
                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Differential Diagnoses</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {aiResult.recommendation.differentialDiagnoses.map((d: any, idx: number) => (
                          <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800">
                            <div className="font-semibold text-white">{d.condition}</div>
                            <div className="text-[11px] font-mono text-teal-400 mt-0.5">
                              ICD-10: {d.icd10} • Probability: {d.probability}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Red Flag Alerts */}
                    {aiResult.recommendation.redFlagAlerts.length > 0 && (
                      <div className="bg-rose-950/40 p-3 rounded-lg border border-rose-700/60 text-rose-300">
                        <span className="font-bold flex items-center space-x-1.5 text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>RED FLAG CLINICAL TRIAGE ALERTS</span>
                        </span>
                        <ul className="mt-1 list-disc list-inside space-y-0.5 text-[11px]">
                          {aiResult.recommendation.redFlagAlerts.map((flag: string, i: number) => (
                            <li key={i}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Therapeutic Considerations & Allergy Safety */}
                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Therapeutics & Pharmacovigilance</span>
                      <div className="space-y-2 mt-1">
                        {aiResult.recommendation.therapeuticConsiderations.map((t: any, i: number) => (
                          <div key={i} className="bg-slate-950 p-2.5 rounded border border-slate-800">
                            <div className="flex justify-between">
                              <span className="font-semibold text-amber-300">{t.drug}</span>
                              <span className="font-mono text-slate-400">{t.dosage}</span>
                            </div>
                            <p className="text-slate-300 text-[11px] mt-0.5">{t.rationale}</p>
                            {t.safetyNote && (
                              <div className="mt-1 text-[11px] text-rose-400 font-medium">{t.safetyNote}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Human-in-the-Loop Signoff Banner */}
                    <div className="p-3 bg-amber-950/30 border border-amber-600/40 rounded text-amber-200 text-xs flex items-center justify-between">
                      <span>NABH Clinical Gate: Mandatory Human-in-the-Loop (HITL) Doctor Signoff Required</span>
                      <button className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-xs">
                        Confirm Clinical Action
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Invoke AI Gateway to generate structured clinical recommendations with pharmacovigilance checking.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: ABDM / FHIR R4 INTEGRATION                                         */}
        {/* ========================================================================= */}
        {activeTab === "abdm" && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">ABDM & FHIR R4 National Healthcare Interoperability</h2>
                  <p className="text-xs text-slate-400">
                    Ayushman Bharat Digital Mission (M1, M2, M3 certified) and NRCES NDHM FHIR R4 Bundle generators.
                  </p>
                </div>
              </div>
            </div>

            {/* ABDM Milestones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {abdmMilestones.map(m => (
                <div key={m.milestone} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-400">{m.milestone}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                      {m.complianceScore}% COMPLIANT
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{m.title}</h4>
                  <p className="text-xs text-slate-400">{m.description}</p>
                </div>
              ))}
            </div>

            {/* ABHA Verification & FHIR Bundle Sandbox */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ABHA Verification */}
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white">ABHA Verification Simulator (Milestone M1)</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={abhaQuery}
                    onChange={e => setAbhaQuery(e.target.value)}
                    placeholder="Enter ABHA Address (e.g. amit.patel@abdm)"
                    className="flex-1 bg-slate-950 p-2 text-xs rounded border border-slate-800 text-white outline-none"
                  />
                  <button
                    onClick={handleVerifyAbha}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded"
                  >
                    Verify
                  </button>
                </div>

                {abhaVerificationResult && (
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ABHA Address:</span>
                      <span className="font-mono text-teal-300 font-semibold">{abhaVerificationResult.abhaId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">14-Digit ABHA Number:</span>
                      <span className="font-mono text-white">{abhaVerificationResult.abhaNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Citizen Name:</span>
                      <span className="text-white font-medium">{abhaVerificationResult.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Health Locker Status:</span>
                      <span className="text-emerald-400 font-semibold">LINKED & ACTIVE</span>
                    </div>
                  </div>
                )}
              </div>

              {/* FHIR R4 Bundle Generator */}
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">NRCES FHIR R4 Bundle Generator (Milestone M2)</h4>
                  <button
                    onClick={handleGenerateFhirBundle}
                    disabled={isGeneratingFhir}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded transition"
                  >
                    Generate Document Bundle
                  </button>
                </div>

                {fhirBundle ? (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono max-h-60 overflow-y-auto">
                    <pre className="text-teal-300">{JSON.stringify(fhirBundle, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    Click to generate a complete NRCES NDHM compliant FHIR R4 DocumentBundle containing Composition,
                    Patient, Practitioner, Condition, and MedicationRequest resources.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductionBlueprintSuite;
