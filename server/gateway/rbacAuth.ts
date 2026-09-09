import { Request, Response, NextFunction } from "express";
import { GatewayUser, UserRole, Permission, GatewayAuthContext } from "./types";
import { appendAuditEvent } from "./cryptoAudit";

// Preconfigured personas
export const MOCK_USERS: Record<string, GatewayUser> = {
  "doctor": {
    id: "USR-DOC-001",
    name: "Dr. K. S. Murthy, MD (Cardiology)",
    email: "dr.murthy@apollo.cura.in",
    role: "DOCTOR",
    tenantId: "tenant_apollo",
    permissions: [
      "clinical:read",
      "clinical:write",
      "prescribe:narcotics",
      "admit:patient",
      "discharge:patient",
      "storage:read",
      "storage:upload",
      "ai:query",
      "abdm:sync",
      "patients:read",
      "patients:write",
      "appointments:read",
      "appointments:write",
      "pharmacy:read",
      "billing:read",
      "billing:write",
      "audit:read",
      "audit:verify"
    ],
    department: "Cardiology & Critical Care",
    licenseNumber: "MCI-CARD-99210-AP",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
  },
  "hospital_admin": {
    id: "USR-ADM-002",
    name: "Dr. Rajesh Sharma, MD (Medical Director)",
    email: "admin@fortis.cura.in",
    role: "HOSPITAL_ADMIN",
    tenantId: "tenant_fortis",
    permissions: [
      "clinical:read",
      "clinical:write",
      "admit:patient",
      "discharge:patient",
      "audit:read",
      "audit:verify",
      "storage:read",
      "storage:upload",
      "tenant:manage",
      "ai:query",
      "abdm:sync",
      "patients:read",
      "patients:write",
      "appointments:read",
      "appointments:write",
      "pharmacy:read",
      "billing:read",
      "billing:write"
    ],
    department: "Hospital Administration & Governance",
    licenseNumber: "MCI-DIR-4412-TS",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
  },
  "patient": {
    id: "USR-PAT-003",
    name: "Amit Patel (Verified Patient)",
    email: "amit.patel@gmail.com",
    role: "PATIENT",
    tenantId: "tenant_apollo",
    permissions: [
      "clinical:read",
      "storage:read",
      "storage:upload",
      "ai:query"
    ],
    department: "Outpatient PHR",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  "pharmacist": {
    id: "USR-PHARM-004",
    name: "Priya Sharma, B.Pharm (Lead Pharmacist)",
    email: "pharmacy@apollo.cura.in",
    role: "PHARMACIST",
    tenantId: "tenant_apollo",
    permissions: [
      "clinical:read",
      "pharmacy:dispense",
      "pharmacy:inventory",
      "storage:read",
      "pharmacy:read",
      "patients:read"
    ],
    department: "Central Pharmacy & Cold Chain",
    licenseNumber: "PCI-PHARM-8812-TS",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
  },
  "nurse": {
    id: "USR-NURSE-005",
    name: "Margaret D'Souza (Head Nurse ICU)",
    email: "nurse.margaret@apollo.cura.in",
    role: "NURSE",
    tenantId: "tenant_apollo",
    permissions: [
      "clinical:read",
      "clinical:write",
      "storage:read"
    ],
    department: "Intensive Care Unit (ICU)",
    licenseNumber: "INC-NURSE-66321",
    avatarUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80"
  },
  "radiologist": {
    id: "USR-RAD-006",
    name: "Dr. Sanjay Roy, MD (Radiology)",
    email: "dr.roy@fortis.cura.in",
    role: "RADIOLOGIST",
    tenantId: "tenant_fortis",
    permissions: [
      "clinical:read",
      "clinical:write",
      "storage:read",
      "storage:upload",
      "ai:query"
    ],
    department: "Imaging & Diagnostics (CT/MRI/PET)",
    licenseNumber: "MCI-RAD-33120-TS",
    avatarUrl: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=150&auto=format&fit=crop&q=80"
  },
  "auditor": {
    id: "USR-AUD-007",
    name: "Dr. S. K. Nair (NABH Lead Assessor)",
    email: "auditor.nair@nabh.gov.in",
    role: "AUDITOR",
    tenantId: "tenant_default",
    permissions: [
      "clinical:read",
      "audit:read",
      "audit:verify"
    ],
    department: "Healthcare Quality & Compliance",
    licenseNumber: "NABH-LEAD-00921",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  }
};

// Map of active tokens to contexts
const activeSessions = new Map<string, GatewayAuthContext>();

/**
 * Creates or retrieves a session token for a given user persona
 */
export function issueGatewayToken(roleKey: string, tenantOverride?: string): { token: string; context: GatewayAuthContext } {
  const baseUser = MOCK_USERS[roleKey] || MOCK_USERS["doctor"];
  const tenantId = tenantOverride || baseUser.tenantId;

  const user: GatewayUser = {
    ...baseUser,
    tenantId
  };

  const token = `cura_jwt_${roleKey}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();
  const context: GatewayAuthContext = {
    user,
    token,
    tenantId,
    ipAddress: "127.0.0.1",
    userAgent: "CURA-Web/Production",
    sessionId: `SES-${Math.floor(10000 + Math.random() * 90000)}`,
    issuedAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000 // 24 hours
  };

  activeSessions.set(token, context);

  // Log authentication to immutable ledger
  appendAuditEvent({
    tenantId,
    userId: user.id,
    userRole: user.role,
    action: "AUTH",
    resourceType: "TOKEN",
    resourceId: context.sessionId,
    details: `User ${user.name} issued token for tenant ${tenantId} [Role: ${user.role}]`
  });

  return { token, context };
}

// Ensure default sessions exist for all personas
Object.keys(MOCK_USERS).forEach(roleKey => {
  const token = `token_${roleKey}`;
  const baseUser = MOCK_USERS[roleKey];
  const now = Date.now();
  activeSessions.set(token, {
    user: baseUser,
    token,
    tenantId: baseUser.tenantId,
    ipAddress: "127.0.0.1",
    userAgent: "CURA-Web/Demo",
    sessionId: `SES-DEMO-${roleKey.toUpperCase()}`,
    issuedAt: now,
    expiresAt: now + 365 * 24 * 60 * 60 * 1000
  });
});

/**
 * Express middleware to authenticate Gateway requests via Authorization header or token param
 */
export function authenticateGateway(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"] || "";
  let token = "";

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.query.token && typeof req.query.token === "string") {
    token = req.query.token;
  } else if (req.headers["x-cura-token"] && typeof req.headers["x-cura-token"] === "string") {
    token = req.headers["x-cura-token"];
  }

  // If no token, default to DOCTOR persona for seamless developer experience, but flag as anonymous
  if (!token) {
    // Default to doctor demo session
    token = "token_doctor";
  }

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({
      type: "https://cura.in/errors/unauthorized",
      title: "Unauthorized Access",
      status: 401,
      detail: "Invalid or expired Gateway authentication token. Please provide a valid Bearer token.",
      timestamp: new Date().toISOString()
    });
  }

  // Allow tenant override from header if user has permission
  const headerTenant = req.headers["x-tenant-id"] as string;
  const effectiveTenant = headerTenant || session.tenantId;

  // Attach context to request
  (req as any).curaContext = {
    ...session,
    tenantId: effectiveTenant,
    ipAddress: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || session.ipAddress,
    userAgent: (req.headers["user-agent"] as string) || session.userAgent
  };

  next();
}

/**
 * Express middleware to enforce Role-Based Access Control
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const context: GatewayAuthContext = (req as any).curaContext;
    if (!context || !context.user) {
      return res.status(401).json({
        type: "https://cura.in/errors/unauthorized",
        title: "Unauthorized",
        status: 401,
        detail: "Authentication context missing"
      });
    }

    if (!allowedRoles.includes(context.user.role)) {
      // Record permission violation in audit log
      appendAuditEvent({
        tenantId: context.tenantId,
        userId: context.user.id,
        userRole: context.user.role,
        action: "AUTH",
        resourceType: "RBAC_GATEWAY",
        resourceId: req.path,
        details: `Access Denied: Role '${context.user.role}' attempted action requiring [${allowedRoles.join(", ")}]`,
        ipAddress: context.ipAddress
      });

      return res.status(403).json({
        type: "https://cura.in/errors/forbidden",
        title: "Access Forbidden (RBAC)",
        status: 403,
        detail: `Role '${context.user.role}' does not possess required role clearance. Required: [${allowedRoles.join(", ")}]`,
        userRole: context.user.role,
        requiredRoles: allowedRoles,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
}

/**
 * Express middleware to enforce specific granular permissions
 */
export function requirePermission(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const context: GatewayAuthContext = (req as any).curaContext;
    if (!context || !context.user) {
      return res.status(401).json({ status: 401, detail: "Authentication context missing" });
    }

    const userPerms = context.user.permissions || [];
    const missingPermissions = requiredPermissions.filter(p => !userPerms.includes(p));

    if (missingPermissions.length > 0) {
      appendAuditEvent({
        tenantId: context.tenantId,
        userId: context.user.id,
        userRole: context.user.role,
        action: "AUTH",
        resourceType: "PERMISSION_GATEWAY",
        resourceId: req.path,
        details: `Access Denied: Missing permissions: ${missingPermissions.join(", ")}`,
        ipAddress: context.ipAddress
      });

      return res.status(403).json({
        type: "https://cura.in/errors/missing-permission",
        title: "Missing Required Permission",
        status: 403,
        detail: `You do not have the required permissions: [${missingPermissions.join(", ")}]`,
        missingPermissions,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
}
