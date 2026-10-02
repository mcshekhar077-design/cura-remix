import { getEnv } from "./env";

export const aiConfig = {
  get geminiApiKey() {
    return getEnv().GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  },
  get deepseekApiKey() {
    return getEnv().DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  },
  deepseekBaseUrl: getEnv().DEEPSEEK_BASE_URL,
  deepseekModel: getEnv().DEEPSEEK_MODEL,
  models: {
    clinicalCopilot: "gemini-2.5-flash",
    documentVision: "gemini-2.5-flash",
    deepReasoner: "gemini-2.5-pro"
  },
  safety: {
    enforceHumanInTheLoop: true,
    cdssDisclaimer: "ASSISTIVE CLINICAL DECISION SUPPORT: CLINITIAL AI outputs are assistive clinical observations and do not replace independent licensed medical judgement. Prescriptions and diagnoses require clinician verification."
  },
  rateLimits: {
    maxRequestsPerMinutePerTenant: 60,
    maxTokensPerDay: 500000
  }
};
