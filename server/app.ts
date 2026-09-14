import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requestIdMiddleware } from "./middleware/request-id";
import { securityHeadersMiddleware } from "./middleware/security";
import { standardRateLimiter } from "./middleware/rate-limit";
import { authenticationMiddleware } from "./middleware/authentication";
import { tenantIsolationMiddleware } from "./middleware/tenant";
import { errorHandlerMiddleware } from "./middleware/error-handler";
import { ObservabilityService } from "./infrastructure/observability";
import { openApiSpecification } from "./shared/openapi";

// Submodule Routers
import { authRouter } from "./modules/auth/router";
import { patientsRouter } from "./modules/patients/router";
import { clinicalRouter } from "./modules/clinical/router";
import { subscriptionsRouter } from "./modules/subscriptions/router";
import { messagingRouter } from "./modules/messaging/router";
import { himsRouter } from "./modules/hims/router";
import { adminRouter } from "./modules/admin/router";
import { crmRouter } from "./modules/crm/router";
import { fhirRouter } from "./modules/fhir/router";
import { abdmRouter } from "./modules/abdm/router";
import { ayushRouter } from "./modules/ayush/router";
import { featureApiRouter } from "./routes/featureApiRouter";

export async function createApp(): Promise<express.Application> {
  const app = express();

  // 1. Raw body capture for webhooks (needed for HMAC verification)
  app.use(
    express.json({
      limit: "25mb",
      verify: (req: Request, res: Response, buf: Buffer) => {
        req.rawBody = buf;
      }
    })
  );
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // 2. Core Security & Observability Middlewares
  app.use(requestIdMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(standardRateLimiter);
  app.use(authenticationMiddleware);
  app.use(tenantIsolationMiddleware);

  // 3. Health & Readiness Probes
  app.get("/health", async (req: Request, res: Response) => {
    const status = await ObservabilityService.getHealth();
    res.json(status);
  });
  app.get("/health/live", (req: Request, res: Response) => {
    res.status(200).send("OK");
  });
  app.get("/health/ready", async (req: Request, res: Response) => {
    const status = await ObservabilityService.getHealth();
    if (status.status === "healthy") {
      res.status(200).json(status);
    } else {
      res.status(503).json(status);
    }
  });

  // 4. OpenAPI Specification
  app.get("/api/openapi.json", (req: Request, res: Response) => {
    res.json(openApiSpecification);
  });

  // 5. API Module Routes
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/patients", patientsRouter);
  app.use("/api/v1", clinicalRouter);
  app.use("/api", clinicalRouter);
  app.use("/api/v1", subscriptionsRouter);
  app.use("/api/v1", messagingRouter);
  app.use("/api/v1/hims", himsRouter);
  app.use("/api", adminRouter);
  app.use("/api/v1", crmRouter);
  app.use("/api/v1/fhir", fhirRouter);
  app.use("/api/v1", abdmRouter);
  app.use("/api/v1/ayush", ayushRouter);
  app.use("/api/ayush", ayushRouter);
  app.use("/api/v1", featureApiRouter);
  app.use("/certificate/v3", abdmRouter);
  app.use("/pmjay", abdmRouter);

  // Fallback compatibility for clinic leads/signup
  app.post("/api/v1/clinic/signup", (req: Request, res: Response) => {
    res.status(201).json({ success: true, message: "Clinic signed up successfully." });
  });
  app.get("/api/v1/clinic/leads", (req: Request, res: Response) => {
    res.json({ success: true, leads: [] });
  });

  // 6. Vite Development or Production Static Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 7. Centralized Safe Error Handler
  app.use(errorHandlerMiddleware);

  return app;
}
