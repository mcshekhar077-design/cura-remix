import { Request, Response } from "express";
import { db } from "../database";

export interface SystemHealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  uptimeSeconds: number;
  timestamp: string;
  version: string;
  checks: {
    database: { status: "up" | "down" };
    aiGateway: { status: "up" | "unconfigured" };
    memory: { usedMB: number; totalMB: number };
  };
}

export class ObservabilityService {
  static async getHealth(): Promise<SystemHealthStatus> {
    const dbHealthy = await db.isHealthy();
    const mem = process.memoryUsage();

    return {
      status: dbHealthy ? "healthy" : "degraded",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version: "2.0.0-production",
      checks: {
        database: { status: dbHealthy ? "up" : "down" },
        aiGateway: { status: process.env.GEMINI_API_KEY ? "up" : "unconfigured" },
        memory: {
          usedMB: Math.round(mem.heapUsed / (1024 * 1024)),
          totalMB: Math.round(mem.heapTotal / (1024 * 1024))
        }
      }
    };
  }

  static log(level: "info" | "warn" | "error", message: string, meta?: Record<string, any>) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };
    if (level === "error") {
      console.error(JSON.stringify(payload));
    } else {
      console.log(JSON.stringify(payload));
    }
  }
}
