import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../shared/utils/crypto";
import { UnauthorizedError } from "../shared/errors";
import { AuthenticatedUserContext } from "../shared/types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserContext;
    }
  }
}

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Reject query param spoofing
  if (req.query.patientId && typeof req.query.patientId === "string" && !req.headers.authorization) {
    // Don't authenticate via query param
  }

  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.headers.cookie) {
    // Check session_token cookie
    const cookies = req.headers.cookie.split(";").map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith("session_token="));
    if (sessionCookie) {
      token = sessionCookie.split("=")[1];
    }
  }

  if (token) {
    const verified = verifyToken<AuthenticatedUserContext>(token);
    if (verified) {
      req.user = verified;
    }
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError("Valid authentication token required."));
  }
  next();
}
