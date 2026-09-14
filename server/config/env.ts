import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().default("http://localhost:3000"),
  
  // Database Configuration
  DATABASE_URL: z.string().optional(),
  DIRECT_DATABASE_URL: z.string().optional(),
  
  // Security & Authentication Secrets
  SESSION_SECRET: z.string().default("cura_production_secret_session_hmac_2026_salt_8877"),
  FIELD_ENCRYPTION_KEY: z.string().default("cura_aes_256_gcm_master_key_clinical_vault_9922"),
  
  // AI Gateway & Providers
  GEMINI_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().default("https://api.deepseek.com/v1"),
  DEEPSEEK_MODEL: z.string().default("deepseek-chat"),
  
  // Payment Gateways
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Messaging & Webhooks
  WHATSAPP_TOKEN: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().default("cura_verified_meta_webhook_2026"),
  WHATSAPP_APP_SECRET: z.string().optional(),
  
  // Storage
  STORAGE_BUCKET: z.string().default("cura-clinical-documents"),
  
  // Demo Mode
  DEMO_MODE: z.string().default("false")
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.warn("⚠️ Environment validation warning:", result.error.format());
      cachedEnv = envSchema.parse({
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || "development"
      });
    } else {
      cachedEnv = result.data;
    }
  }
  return cachedEnv;
}
