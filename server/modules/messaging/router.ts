import { Router, Request, Response } from "express";
import { messagingConfig } from "../../config/messaging";
import { MessagingService } from "../../infrastructure/messaging";
import { auditLogMiddleware } from "../../middleware/audit";

export const messagingRouter = Router();

const inMemoryWebhookLogs: Array<{ id: string; timestamp: string; event: any }> = [];

// Meta WhatsApp Webhook Challenge Verification
messagingRouter.get("/webhook/whatsapp", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === messagingConfig.whatsapp.verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Verification failed.");
  }
});

// Meta WhatsApp Inbound Webhook
messagingRouter.post("/webhook/whatsapp", (req: Request, res: Response) => {
  const signature = req.headers["x-hub-signature-256"] as string;
  const isVerified = MessagingService.verifyWhatsAppWebhook(req.rawBody || JSON.stringify(req.body), signature);

  if (!isVerified && process.env.NODE_ENV === "production") {
    res.status(401).send("Invalid signature.");
    return;
  }

  inMemoryWebhookLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: req.body
  });

  if (inMemoryWebhookLogs.length > 500) {
    inMemoryWebhookLogs.pop();
  }

  res.status(200).json({ status: "received" });
});

// WhatsApp Logs
messagingRouter.get("/webhook/whatsapp/logs", (req: Request, res: Response) => {
  res.json({
    success: true,
    logs: inMemoryWebhookLogs
  });
});
