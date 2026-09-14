import crypto from "crypto";
import { hashPassword, verifyPassword, signToken, verifyToken, encryptSensitiveField, decryptSensitiveField, verifyRazorpayPaymentSignature, verifyWhatsAppWebhookSignature } from "../shared/utils/crypto";
import { AIGateway } from "../infrastructure/ai";

/**
 * Automated Security & Verification Test Suite for CURA AI Backend
 */
export async function runSecurityTests(): Promise<{ passed: number; failed: number; results: string[] }> {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, message?: string) {
    if (condition) {
      passed++;
      results.push(`✅ [PASS] ${name}`);
    } else {
      failed++;
      results.push(`❌ [FAIL] ${name}: ${message || "Assertion failed"}`);
    }
  }

  // 1. Password Hashing (scrypt + salt)
  const pwd = "SecureDoctorPass123!";
  const hashed = hashPassword(pwd);
  assert("Password hashing generates non-empty salt and hash", !!hashed.salt && !!hashed.hash);
  assert("Valid password verifies successfully", verifyPassword(pwd, hashed.salt, hashed.hash));
  assert("Incorrect password fails verification", !verifyPassword("WrongPassword!", hashed.salt, hashed.hash));

  // 2. Cryptographic JWT Token Signing & Verification
  const token = signToken({ id: "usr_doc_1", tenantId: "tenant_apollo", role: "doctor" });
  assert("Cryptographic token is generated with 3 segments", token.split(".").length === 3);
  const decoded = verifyToken(token);
  assert("Valid token decodes payload correctly", decoded?.id === "usr_doc_1" && decoded?.tenantId === "tenant_apollo");
  assert("Tampered token signature is rejected", verifyToken(`${token}tampered`) === null);

  // 3. AES-256-GCM Field-Level Authenticated Encryption
  const sensitiveClinicalText = "Patient exhibits acute severe penicillin allergy with anaphylactic shock history.";
  const encrypted = encryptSensitiveField(sensitiveClinicalText);
  assert("AES-256-GCM generates vault-formatted ciphertext", encrypted.startsWith("vault:gcm:"));
  const decrypted = decryptSensitiveField(encrypted);
  assert("Decrypted ciphertext matches original clinical plain text", decrypted === sensitiveClinicalText);

  // 4. Cryptographic Razorpay Signature Verification
  const orderId = "order_98124";
  const paymentId = "pay_81729";
  const secret = "sample_test_secret_key_8899";
  const validSig = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  assert("Valid Razorpay signature is verified", verifyRazorpayPaymentSignature(orderId, paymentId, validSig, secret));
  assert("Forged Razorpay signature is rejected", !verifyRazorpayPaymentSignature(orderId, paymentId, "forged_sig_123", secret));

  // 5. WhatsApp Webhook Signature Verification
  const rawWebhookBody = JSON.stringify({ event: "message_received", from: "+919876543210" });
  const waSecret = "wa_app_secret_test";
  const validWaHash = crypto.createHmac("sha256", waSecret).update(rawWebhookBody).digest("hex");
  assert("Valid WhatsApp webhook signature is accepted", verifyWhatsAppWebhookSignature(rawWebhookBody, `sha256=${validWaHash}`, waSecret));
  assert("Forged WhatsApp webhook signature is rejected", !verifyWhatsAppWebhookSignature(rawWebhookBody, "sha256=invalidhash", waSecret));

  // 6. Medication Contraindication Safety Engine
  const penicillinCheck = AIGateway.checkMedicationSafety(["Penicillin anaphylaxis"], "Amoxicillin 500mg");
  assert("Penicillin cross-reactivity is caught by deterministic safety check", !penicillinCheck.safe);
  const safeMedCheck = AIGateway.checkMedicationSafety(["Penicillin"], "Paracetamol 500mg");
  assert("Non-contraindicated medication passes safety check", safeMedCheck.safe);

  return { passed, failed, results };
}

// Auto-run when executed directly
if (process.argv[1]?.includes("security.test")) {
  runSecurityTests().then((res) => {
    console.log(`Security Test Suite: ${res.passed} passed, ${res.failed} failed`);
    res.results.forEach((r) => console.log(r));
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
