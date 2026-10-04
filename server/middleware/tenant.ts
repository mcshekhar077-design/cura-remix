import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/errors";

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export function tenantIsolationMiddleware(req: Request, res: Response, next: NextFunction) {
  // If user is authenticated, derive tenantId strictly from authenticated token
  if (req.user) {
    req.tenantId = req.user.tenantId;
  } else {
    // For public endpoints, fallback to tenant header or default tenant
    const headerTenant = req.headers["x-tenant-id"] as string;
    req.tenantId = headerTenant || "tenant_apollo";
  }

  // Prevent client tenant spoofing:
  // If user is authenticated and header specifies a different tenant, reject unless super_admin
  const requestedTenant = req.headers["x-tenant-id"] as string;
  if (req.user && requestedTenant && requestedTenant !== req.user.tenantId && req.user.role !== "super_admin") {
    return next(new ForbiddenError("Cross-tenant access violation. You cannot switch tenants without authorization."));
  }

  next();
}
