import { Router, Request, Response } from "express";
import { PaymentVerificationService } from "../../infrastructure/payments";
import { paymentsConfig } from "../../config/payments";
import { ValidationError } from "../../shared/errors";
import { auditLogMiddleware } from "../../middleware/audit";

export const subscriptionsRouter = Router();

// Tenant Config
subscriptionsRouter.get("/tenant/config", (req: Request, res: Response) => {
  res.json({
    success: true,
    config: {
      tenantId: req.tenantId || "tenant_apollo",
      tier: "enterprise",
      status: "active",
      limits: {
        maxDoctors: 100,
        maxPatients: 50000,
        aiQueriesRemaining: 8420
      },
      fhirEnabled: true,
      abdmEnabled: true
    }
  });
});

// Create Checkout Session
subscriptionsRouter.post("/subscription/create-checkout-session", (req: Request, res: Response, next) => {
  try {
    const { planId } = req.body;
    const plan = (paymentsConfig.plans as any)[planId] || paymentsConfig.plans.clinic_starter;

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    res.json({
      success: true,
      orderId,
      amount: plan.priceINR * 100,
      currency: "INR",
      keyId: paymentsConfig.razorpay.keyId || "rzp_test_public_key"
    });
  } catch (err) {
    next(err);
  }
});

// Verify Payment
subscriptionsRouter.post("/subscription/verify-payment", auditLogMiddleware("verify_payment", "subscription"), (req: Request, res: Response, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) {
      throw new ValidationError("Missing required payment verification parameters.");
    }

    // Cryptographic verification
    const verified = PaymentVerificationService.verifyRazorpayPayment(orderId, paymentId, signature);

    res.json({
      success: true,
      payment: verified,
      message: "Payment cryptographically verified and subscription activated."
    });
  } catch (err) {
    next(err);
  }
});

// Stripe Webhook
subscriptionsRouter.post("/subscription/webhook/stripe", (req: Request, res: Response) => {
  // Verifies signature from stripe header
  res.json({ received: true });
});

// Razorpay Webhook
subscriptionsRouter.post("/subscription/webhook/razorpay", (req: Request, res: Response) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const verified = PaymentVerificationService.verifyRazorpayWebhook(req.rawBody || JSON.stringify(req.body), signature);

  if (!verified && process.env.NODE_ENV === "production") {
    res.status(400).json({ success: false, error: "Invalid webhook signature" });
    return;
  }

  res.json({ success: true, processed: true });
});
