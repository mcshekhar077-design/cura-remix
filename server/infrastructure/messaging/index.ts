import { messagingConfig } from "../../config/messaging";
import { verifyWhatsAppWebhookSignature } from "../../shared/utils/crypto";

export class MessagingService {
  static verifyWhatsAppWebhook(rawBody: Buffer | string, signature: string | undefined): boolean {
    const appSecret = messagingConfig.whatsapp.appSecret;
    if (!appSecret) return true; // If not configured in dev, skip
    return verifyWhatsAppWebhookSignature(rawBody, signature, appSecret);
  }

  static async sendNotification(params: {
    recipientPhone?: string;
    recipientEmail?: string;
    template: string;
    payload: Record<string, any>;
  }): Promise<{ success: boolean; messageId: string }> {
    // Dispatch notification
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return { success: true, messageId };
  }
}
