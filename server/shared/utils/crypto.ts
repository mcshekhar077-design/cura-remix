import crypto from "crypto";
import { getEnv } from "../../config/env";

const env = getEnv();
const SESSION_SECRET = env.SESSION_SECRET;
const FIELD_ENCRYPTION_KEY = crypto.createHash("sha256").update(env.FIELD_ENCRYPTION_KEY || SESSION_SECRET).digest();

// ==========================================
// 1. PASSWORD HASHING (SCRYPT + SALT)
// ==========================================

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}

// ==========================================
// 2. CRYPTOGRAPHIC SIGNED TOKENS (HMAC-SHA256)
// ==========================================

function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf8").toString("base64url");
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf8");
}

export function signToken(payload: Record<string, any>, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): string {
  const now = Date.now();
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInMs,
    nonce: crypto.randomBytes(8).toString("hex")
  };

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

export function verifyToken<T = any>(token: string): T | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  try {
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8")
    );
    if (!isSignatureValid) return null;

    const parsed = JSON.parse(base64UrlDecode(body));
    if (parsed.exp && Date.now() > parsed.exp) {
      return null; // Expired
    }
    return parsed as T;
  } catch {
    return null;
  }
}

// ==========================================
// 3. FIELD-LEVEL ENCRYPTION (AES-256-GCM)
// ==========================================

export function encryptSensitiveField(plainText: string): string {
  if (!plainText) return plainText;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", FIELD_ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `vault:gcm:${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptSensitiveField(cipherString: string): string {
  if (!cipherString || !cipherString.startsWith("vault:gcm:")) {
    return cipherString;
  }

  try {
    const parts = cipherString.split(":");
    if (parts.length !== 5) return cipherString;
    const [, , ivHex, authTagHex, encryptedHex] = parts;

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", FIELD_ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "[DECRYPTION_FAILED]";
  }
}

// ==========================================
// 4. WEBHOOK SIGNATURE VERIFICATION
// ==========================================

export function verifyWhatsAppWebhookSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) return false;
  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") return false;
  const expectedHash = parts[1];

  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(typeof rawBody === "string" ? Buffer.from(rawBody, "utf8") : rawBody);
  const calculatedHash = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(calculatedHash, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}

export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"));
  } catch {
    return false;
  }
}

export function verifyRazorpayWebhookSignature(
  rawBody: Buffer | string,
  signature: string,
  webhookSecret: string
): boolean {
  if (!rawBody || !signature || !webhookSecret) return false;
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(typeof rawBody === "string" ? Buffer.from(rawBody, "utf8") : rawBody);
  const expectedSignature = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"));
  } catch {
    return false;
  }
}
