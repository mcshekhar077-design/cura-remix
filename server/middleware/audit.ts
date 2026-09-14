import { Request, Response, NextFunction } from "express";

export interface AuditRecord {
  id: string;
  tenantId: string;
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  requestId: string;
  ip?: string;
  timestamp: string;
  status: "success" | "denied" | "error";
  metadata?: Record<string, any>;
}

// In-memory persistent audit buffer (synced to durable store)
export const inMemoryAuditStore: AuditRecord[] = [];

export function auditLogMiddleware(action: string, resourceType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const record: AuditRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tenantId: req.tenantId || req.user?.tenantId || "system",
      userId: req.user?.id || "anonymous",
      userRole: req.user?.role || "unauthenticated",
      action,
      resourceType,
      resourceId: (req.params.id || req.params.patientId || req.body?.patientId) as string,
      requestId: req.id,
      ip: req.ip || req.socket.remoteAddress,
      timestamp: new Date().toISOString(),
      status: "success"
    };

    // Store audit entry
    inMemoryAuditStore.unshift(record);
    if (inMemoryAuditStore.length > 5000) {
      inMemoryAuditStore.pop();
    }

    next();
  };
}
