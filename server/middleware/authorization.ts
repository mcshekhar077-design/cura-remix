import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/errors";

export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required."));
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== "super_admin") {
      return next(
        new ForbiddenError(
          `User with role '${req.user.role}' is not authorized to access this resource. Required roles: ${allowedRoles.join(", ")}`
        )
      );
    }

    next();
  };
}

export function requirePatientAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required."));
  }

  const requestedPatientId = req.params.patientId || req.params.id;

  // Clinicians and Admins have authorized access within their tenant
  if (["doctor", "nurse", "hospital_admin", "super_admin"].includes(req.user.role)) {
    return next();
  }

  // Patients can ONLY view their own records
  if (req.user.role === "patient") {
    if (req.user.patientId && req.user.patientId !== requestedPatientId) {
      return next(new ForbiddenError("Patients may only access their own clinical health records."));
    }
    return next();
  }

  next(new ForbiddenError("Unauthorized role for patient clinical record access."));
}
