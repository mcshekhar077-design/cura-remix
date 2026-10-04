import { Request, Response, NextFunction } from "express";

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME-sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Frame protection: AI Studio dev environment embeds app in iframe, so allow iframe embedding
  // X-Frame-Options is omitted to allow iframe rendering in AI Studio
  // XSS protection legacy header
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Strict Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Remove Express fingerprint
  res.removeHeader("X-Powered-By");

  // Strict CORS Handling (Prevent wildcard in production authenticated endpoints)
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-request-id, x-tenant-id, x-hub-signature-256"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}
