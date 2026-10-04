import http from "http";
import { WebSocketServer } from "ws";
import { createApp } from "./server/app";
import { initializeBackgroundWorkers } from "./server/workers";
import { ObservabilityService } from "./server/infrastructure/observability";

async function startServer() {
  const app = await createApp();
  const PORT = 3000;
  const server = http.createServer(app);

  // Initialize WebSocket server for real-time telemetry & emergency SOS
  const wss = new WebSocketServer({ server, path: "/ws/telemetry" });
  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "CONNECTED", timestamp: new Date().toISOString() }));
    ws.on("message", (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === "TELEMETRY_PING") {
          ws.send(JSON.stringify({ type: "TELEMETRY_PONG", receivedAt: new Date().toISOString() }));
        }
      } catch {
        // Ignore malformed socket frames
      }
    });
  });

  // Start background job workers
  initializeBackgroundWorkers();

  server.listen(PORT, "0.0.0.0", () => {
    ObservabilityService.log("info", `🚀 Clinitial Healthcare Platform Server listening on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    ObservabilityService.log("info", `Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      ObservabilityService.log("info", "HTTP and WebSocket servers closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
