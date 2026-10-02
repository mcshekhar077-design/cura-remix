// CLINITIAL API Gateway & Production Architecture Types

export type UserRole = 
  | "DOCTOR" 
  | "HOSPITAL_ADMIN" 
  | "PATIENT" 
  | "PHARMACIST" 
  | "NURSE" 
  | "RADIOLOGIST" 
  | "AUDITOR";

export type Permission = 
  | "clinical:read"
  | "clinical:write"
  | "prescribe:narcotics"
  | "admit:patient"
  | "discharge:patient"
  | "audit:read"
  | "audit:verify"
  | "pharmacy:dispense"
  | "pharmacy:inventory"
  | "storage:upload"
  | "storage:read"
  | "ai:query"
  | "abdm:sync"
  | "tenant:manage"
  | "patients:read"
  | "patients:write"
  | "appointments:read"
  | "appointments:write"
  | "pharmacy:read"
  | "billing:read"
  | "billing:write";

export interface GatewayUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  permissions: Permission[];
  department?: string;
  licenseNumber?: string;
  avatarUrl?: string;
}

export interface GatewayAuthContext {
  user: GatewayUser;
  token: string;
  tenantId: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
}

export interface TenantInfo {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  tier: "tertiary" | "secondary" | "clinic";
  activeBeds: number;
  activeDoctors: number;
  status: "active" | "maintenance";
  dbSchema: string;
  encryptionKeyId: string;
}

export interface RateLimitStatus {
  ip: string;
  limit: number;
  remaining: number;
  resetSeconds: number;
  isThrottled: boolean;
  totalHits: number;
}

export interface AuditLogBlock {
  index: number;
  id: string;
  timestamp: string;
  tenantId: string;
  userId: string;
  userRole: UserRole;
  action: "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "AUTH" | "DECRYPT" | "BREAK_GLASS" | "EXPORT";
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  prevHash: string;
  hash: string;
  signatureVerified: boolean;
}

export interface StoredObject {
  id: string;
  tenantId: string;
  fileName: string;
  category: "radiology_dicom" | "lab_report_pdf" | "prescription_pdf" | "discharge_summary" | "clinical_photo";
  fileSizeBytes: number;
  mimeType: string;
  sha256Checksum: string;
  virusScanStatus: "clean" | "scanning" | "quarantined";
  isEncrypted: boolean;
  encryptionAlgorithm: "AES-256-GCM";
  storagePath: string;
  presignedUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  expiresAt: string;
  metadata?: Record<string, string>;
}

export interface RedisTaskJob {
  id: string;
  queue: "critical_clinical_tasks" | "report_generation" | "abdm_health_exchange" | "telemetry_aggregation" | "notification_sms_email";
  taskName: string;
  payload: any;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number; // 0 to 100
  workerId: string;
  retryCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  executionTimeMs?: number;
  result?: any;
}

export interface RedisCacheStats {
  connected: boolean;
  uptimeSeconds: number;
  memoryUsedMb: number;
  totalKeys: number;
  hitCount: number;
  missCount: number;
  hitRatePct: number;
  activeQueues: number;
  pendingJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export interface AIPromptVersionRecord {
  id: string;
  version: string;
  name: string;
  description: string;
  targetModel: string;
  systemPrompt: string;
  confidenceThreshold: number;
  safetyProfile: "standard" | "strict_pharmacovigilance" | "emergency_triage";
  isActive: boolean;
  createdAt: string;
}

export interface ArchitectureNodeStatus {
  id: string;
  name: string;
  tier: "presentation" | "gateway" | "services" | "persistence" | "infra" | "external";
  status: "healthy" | "degraded" | "standby";
  latencyMs: number;
  throughputRps: number;
  uptimePct: number;
  activeConnections: number;
  details: string;
}
