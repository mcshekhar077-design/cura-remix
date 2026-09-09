import crypto from "node:crypto";
import { AuditLogBlock, UserRole } from "./types";

const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
const AUDIT_SECRET = process.env.AUDIT_SIGNING_SECRET || "cura_audit_tamper_proof_secret_2026";

// In-memory append-only audit ledger
const auditLedger: AuditLogBlock[] = [];

/**
 * Calculates SHA-256 hash for an audit block incorporating previous block's hash
 */
export function computeBlockHash(
  index: number,
  prevHash: string,
  timestamp: string,
  tenantId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: string,
  ipAddress: string
): string {
  const content = `${index}:${prevHash}:${timestamp}:${tenantId}:${userId}:${action}:${resourceType}:${resourceId}:${details}:${ipAddress}:${AUDIT_SECRET}`;
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Appends a new immutable audit event to the ledger with SHA-256 chaining
 */
export function appendAuditEvent(params: {
  tenantId: string;
  userId: string;
  userRole: UserRole;
  action: "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "AUTH" | "DECRYPT" | "BREAK_GLASS" | "EXPORT";
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}): AuditLogBlock {
  const index = auditLedger.length;
  const prevHash = index === 0 ? GENESIS_HASH : auditLedger[index - 1].hash;
  const timestamp = new Date().toISOString();
  const ipAddress = params.ipAddress || "127.0.0.1";
  const userAgent = params.userAgent || "CURA-Web/Client";

  const hash = computeBlockHash(
    index,
    prevHash,
    timestamp,
    params.tenantId,
    params.userId,
    params.action,
    params.resourceType,
    params.resourceId,
    params.details,
    ipAddress
  );

  const block: AuditLogBlock = {
    index,
    id: `AUDIT-BLK-${String(index + 1).padStart(6, "0")}`,
    timestamp,
    tenantId: params.tenantId,
    userId: params.userId,
    userRole: params.userRole,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    details: params.details,
    ipAddress,
    userAgent,
    prevHash,
    hash,
    signatureVerified: true
  };

  auditLedger.push(block);
  return block;
}

/**
 * Verifies mathematical integrity of the entire audit chain
 */
export function verifyAuditChain(): {
  isValid: boolean;
  totalBlocks: number;
  genesisHash: string;
  latestHash: string;
  tamperedBlockIndex?: number;
  errorMessage?: string;
  verifiedAt: string;
} {
  const verifiedAt = new Date().toISOString();

  if (auditLedger.length === 0) {
    return {
      isValid: true,
      totalBlocks: 0,
      genesisHash: GENESIS_HASH,
      latestHash: GENESIS_HASH,
      verifiedAt
    };
  }

  for (let i = 0; i < auditLedger.length; i++) {
    const block = auditLedger[i];
    const expectedPrevHash = i === 0 ? GENESIS_HASH : auditLedger[i - 1].hash;

    // Check link to previous block
    if (block.prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        totalBlocks: auditLedger.length,
        genesisHash: GENESIS_HASH,
        latestHash: auditLedger[auditLedger.length - 1].hash,
        tamperedBlockIndex: i,
        errorMessage: `Block #${i} prevHash mismatch! Expected ${expectedPrevHash}, found ${block.prevHash}`,
        verifiedAt
      };
    }

    // Recompute current block hash
    const recalculatedHash = computeBlockHash(
      block.index,
      block.prevHash,
      block.timestamp,
      block.tenantId,
      block.userId,
      block.action,
      block.resourceType,
      block.resourceId,
      block.details,
      block.ipAddress
    );

    if (block.hash !== recalculatedHash) {
      return {
        isValid: false,
        totalBlocks: auditLedger.length,
        genesisHash: GENESIS_HASH,
        latestHash: auditLedger[auditLedger.length - 1].hash,
        tamperedBlockIndex: i,
        errorMessage: `Block #${i} hash corruption! Hash recalculation failed.`,
        verifiedAt
      };
    }
  }

  return {
    isValid: true,
    totalBlocks: auditLedger.length,
    genesisHash: GENESIS_HASH,
    latestHash: auditLedger[auditLedger.length - 1].hash,
    verifiedAt
  };
}

/**
 * Retrieves audit blocks with optional filtering and pagination
 */
export function getAuditLedger(params?: {
  tenantId?: string;
  userId?: string;
  action?: string;
  resourceType?: string;
  limit?: number;
}): AuditLogBlock[] {
  let list = [...auditLedger];

  if (params?.tenantId && params.tenantId !== "all") {
    list = list.filter(b => b.tenantId === params.tenantId);
  }
  if (params?.userId) {
    list = list.filter(b => b.userId === params.userId);
  }
  if (params?.action) {
    list = list.filter(b => b.action === params.action);
  }
  if (params?.resourceType) {
    list = list.filter(b => b.resourceType === params.resourceType);
  }

  // Return newest first
  list.sort((a, b) => b.index - a.index);

  const limit = params?.limit || 50;
  return list.slice(0, limit);
}

// Pre-seed some initial security & clinical audit events
appendAuditEvent({
  tenantId: "tenant_apollo",
  userId: "USR-DOC-001",
  userRole: "DOCTOR",
  action: "AUTH",
  resourceType: "SESSION",
  resourceId: "SES-98214",
  details: "Dr. K. S. Murthy authenticated via Gateway MFA (HMAC-SHA256)",
  ipAddress: "192.168.1.45"
});

appendAuditEvent({
  tenantId: "tenant_apollo",
  userId: "USR-DOC-001",
  userRole: "DOCTOR",
  action: "VIEW",
  resourceType: "PATIENT_RECORD",
  resourceId: "PAT-01",
  details: "Accessed telemetry ECG and cardiac medication history for Amit Patel",
  ipAddress: "192.168.1.45"
});

appendAuditEvent({
  tenantId: "tenant_fortis",
  userId: "USR-ADM-002",
  userRole: "HOSPITAL_ADMIN",
  action: "UPDATE",
  resourceType: "WARD_BED",
  resourceId: "BED-ICU-101",
  details: "Assigned high-acuity ventilator bed to emergency referral",
  ipAddress: "10.0.4.12"
});

appendAuditEvent({
  tenantId: "tenant_apollo",
  userId: "USR-PHARM-003",
  userRole: "PHARMACIST",
  action: "CREATE",
  resourceType: "DISPENSATION",
  resourceId: "DISP-55201",
  details: "Dispensed Atorvastatin 40mg with LASA sound-alike barcoding validation",
  ipAddress: "192.168.2.88"
});

appendAuditEvent({
  tenantId: "tenant_apollo",
  userId: "USR-DOC-001",
  userRole: "DOCTOR",
  action: "BREAK_GLASS",
  resourceType: "EMERGENCY_OVERRIDE",
  resourceId: "EMG-7701",
  details: "Emergency bypass activated for acute STEMI coronary intervention",
  ipAddress: "192.168.1.45"
});

export const cryptoLedger = {
  appendBlock: (params: {
    tenantId: string;
    eventType: string;
    actorId: string;
    actorRole: any;
    resourceType: string;
    resourceId: string;
    eventData: any;
  }) => {
    return appendAuditEvent({
      tenantId: params.tenantId,
      userId: params.actorId,
      userRole: (params.actorRole || "DOCTOR").toUpperCase() as any,
      action: "CREATE",
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      details: `${params.eventType}: ${JSON.stringify(params.eventData)}`
    });
  }
};
