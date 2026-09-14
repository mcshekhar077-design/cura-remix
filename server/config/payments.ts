import { getEnv } from "./env";

export const paymentsConfig = {
  razorpay: {
    get keyId() {
      return getEnv().RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    },
    get keySecret() {
      return getEnv().RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
    },
    get webhookSecret() {
      return getEnv().RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;
    }
  },
  stripe: {
    get secretKey() {
      return getEnv().STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    },
    get webhookSecret() {
      return getEnv().STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
    }
  },
  plans: {
    clinic_starter: { priceINR: 4999, doctorLimit: 2, fhirEnabled: true },
    clinic_pro: { priceINR: 12999, doctorLimit: 10, fhirEnabled: true },
    hospital_enterprise: { priceINR: 49999, doctorLimit: 100, fhirEnabled: true }
  }
};
