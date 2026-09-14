import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      id: string;
      rawBody?: string | Buffer;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const existingId = req.header("x-request-id");
  const requestId = existingId || `req_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
  req.id = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}
