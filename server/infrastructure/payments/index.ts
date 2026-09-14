import { paymentsConfig } from "../../config/payments";
import { verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature } from "../../shared/utils/crypto";
import { ValidationError } from "../../shared/errors";

export interface VerifiedPayment {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: "razorpay" | "stripe";
  status: "verified" | "failed";
  verifiedAt: string;
}

export class PaymentVerificationService {
  // Verify Razorpay Checkout Signature
  static verifyRazorpayPayment(orderId: string, paymentId: string, signature: string): VerifiedPayment {
    const secret = paymentsConfig.razorpay.keySecret;
    if (!secret) {
      throw new ValidationError("Payment gateway secret is not configured on server.");
    }

    const isValid = verifyRazorpayPaymentSignature(orderId, paymentId, signature, secret);
    if (!isValid) {
      throw new ValidationError("Cryptographic payment signature verification failed. Forged payment rejected.");
    }

    return {
      paymentId,
      orderId,
      amount: 499900, // 4999 INR in paise
      currency: "INR",
      provider: "razorpay",
      status: "verified",
      verifiedAt: new Date().toISOString()
    };
  }

  // Verify Razorpay Webhook Signature
  static verifyRazorpayWebhook(rawBody: Buffer | string, signature: string): boolean {
    const webhookSecret = paymentsConfig.razorpay.webhookSecret;
    if (!webhookSecret) return false;
    return verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
  }
}
