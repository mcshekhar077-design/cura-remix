import { Router } from "express";
import { patientRouter } from "./patientRoutes";
import { clinicalRouter } from "./clinicalRoutes";
import { appointmentRouter } from "./appointmentRoutes";
import { pharmacyRouter } from "./pharmacyRoutes";
import { billingRouter } from "./billingRoutes";
import { diagnosticRouter } from "./diagnosticRoutes";
import { db } from "../storage/postgres/client";
import { redis } from "../storage/redis/client";
import { objectStore } from "../storage/objectStore/client";

export const featureApiRouter = Router();

// Middleware: Request Correlation ID & Security Headers
featureApiRouter.use((req, res, next) => {
  const correlationId = req.headers["x-request-id"] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  res.setHeader("X-Request-ID", correlationId);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// Storage Infrastructure Health Check
featureApiRouter.get("/storage/health", async (req, res) => {
  try {
    const [pgHealth, redisHealth, s3Health] = await Promise.all([
      db.getHealth(),
      redis.getHealth(),
      objectStore.getHealth()
    ]);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      architecture: "CURA Multi-Tier Decoupled Platform",
      storage: {
        postgres: pgHealth,
        redis: redisHealth,
        objectStore: s3Health
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sub-domain Feature Routers
featureApiRouter.use("/patients", patientRouter);
featureApiRouter.use("/clinical", clinicalRouter);
featureApiRouter.use("/appointments", appointmentRouter);
featureApiRouter.use("/pharmacy", pharmacyRouter);
featureApiRouter.use("/billing", billingRouter);
featureApiRouter.use("/diagnostics", diagnosticRouter);
