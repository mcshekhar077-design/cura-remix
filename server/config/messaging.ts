import { getEnv } from "./env";

export const messagingConfig = {
  whatsapp: {
    get token() {
      return getEnv().WHATSAPP_TOKEN || process.env.WHATSAPP_TOKEN;
    },
    get verifyToken() {
      return getEnv().WHATSAPP_VERIFY_TOKEN;
    },
    get appSecret() {
      return getEnv().WHATSAPP_APP_SECRET || process.env.WHATSAPP_APP_SECRET;
    }
  },
  smtp: {
    host: process.env.SMTP_HOST || "smtp.mailgun.org",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || "CLINITIAL Health <notifications@clinitial.health>"
  }
};
