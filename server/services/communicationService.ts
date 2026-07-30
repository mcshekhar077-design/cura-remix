import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Lazily initialized nodemailer transporter
let transporter: any = null;
let smtpDisabled = false;

function getTransporter() {
  if (smtpDisabled) return null;
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  const isPlaceholder = (val?: string) => {
    if (!val) return true;
    const v = val.toLowerCase().trim();
    return v === "" || v.includes("your-") || v.includes("your_") || v.includes("placeholder") || v.includes("example.com") || v === "null" || v === "undefined";
  };

  if (host && user && pass && !isPlaceholder(host) && !isPlaceholder(user) && !isPlaceholder(pass)) {
    console.log(`[EMAIL SERVICE] Initializing real SMTP transporter for ${user}@${host}:${port}`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  } else {
    console.log("[EMAIL SERVICE] SMTP credentials not fully configured or contain placeholder. Running in SIMULATED mode.");
    smtpDisabled = true;
  }
  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; error?: string; mode: "real" | "simulated" }> {
  const mailjetKey = process.env.MAILJET_API_KEY || "37b4ca145341ce8a45f2144e65b0961a";
  const mailjetSecret = process.env.MAILJET_API_SECRET || "ec9a61b62547d2f63fdd92bdc42615bf";
  const fromEmail = process.env.SMTP_FROM || "no-reply@cura-healthcare.com";

  // If Mailjet is configured, attempt sending via REST API
  const hasMailjet = mailjetKey && mailjetSecret && 
                     mailjetKey !== "YOUR_MAILJET_KEY" && 
                     mailjetSecret !== "YOUR_MAILJET_SECRET";

  if (hasMailjet) {
    try {
      console.log(`[MAILJET SERVICE] Attempting REST API email dispatch to ${to} using key ending in ...${mailjetKey.slice(-4)}`);
      
      const authHeader = `Basic ${Buffer.from(`${mailjetKey}:${mailjetSecret}`).toString("base64")}`;
      
      const response = await fetch("https://api.mailjet.com/v3.1/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify({
          Messages: [
            {
              From: {
                Email: fromEmail,
                Name: "Cura Healthcare Auto-Alert"
              },
              To: [
                {
                  Email: to,
                  Name: to.split("@")[0]
                }
              ],
              Subject: subject,
              TextPart: text || html.replace(/<[^>]*>?/gm, ""),
              HTMLPart: html
            }
          ]
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(`[MAILJET SERVICE] Email successfully dispatched to ${to} via REST API.`);
        return { success: true, mode: "real" };
      } else {
        const errText = await response.text();
        console.warn(`[MAILJET SERVICE] API returned status ${response.status}: ${errText}. Falling back to standard SMTP / Simulation...`);
      }
    } catch (e: any) {
      console.error(`[MAILJET SERVICE] Error sending via REST API: ${e.message || String(e)}. Falling back to standard SMTP / Simulation...`);
    }
  }

  // Fallback to SMTP or Simulation
  try {
    const activeTransporter = getTransporter();
    const from = fromEmail;

    if (activeTransporter) {
      await activeTransporter.sendMail({
        from,
        to,
        subject,
        text: text || html.replace(/<[^>]*>?/gm, ""), // simple html strip fallback
        html,
      });
      console.log(`[EMAIL SERVICE] Real email sent successfully via SMTP to ${to} (Subject: "${subject}")`);
      return { success: true, mode: "real" };
    } else {
      // Simulation
      console.log(`
=========================================
📧 [SIMULATED EMAIL DISPATCH]
To: ${to}
From: ${from}
Subject: ${subject}
-----------------------------------------
${text || html.replace(/<[^>]*>?/gm, "").substring(0, 300)}...
=========================================
      `);
      return { success: true, mode: "simulated" };
    }
  } catch (error: any) {
    // SMTP authentication or connection error occurred
    const isAuthError = error.message && (
      error.message.includes("auth") || 
      error.message.includes("login") || 
      error.message.includes("535") || 
      error.message.includes("Username and Password not accepted")
    );
    
    if (isAuthError) {
      console.log("[EMAIL SERVICE] SMTP Authentication or connection error detected. Gracefully disabling real SMTP and switching to SIMULATION mode.");
      smtpDisabled = true;
      transporter = null;
    }

    const from = fromEmail;
    console.log(`
=========================================
📧 [SIMULATED EMAIL DISPATCH - FALLBACK]
To: ${to}
From: ${from}
Subject: ${subject}
Reason: Real SMTP failure: ${error.message || String(error)} (Now running in simulated-only mode)
-----------------------------------------
${text || html.replace(/<[^>]*>?/gm, "").substring(0, 300)}...
=========================================
    `);
    return { success: true, mode: "simulated", error: error.message || String(error) };
  }
}

// Simulated/Real SMS Fallback Service
export async function sendSMS({
  to,
  message,
}: {
  to: string;
  message: string;
}): Promise<{ success: boolean; mode: "real" | "simulated"; error?: string }> {
  const apiEndpoint = process.env.SMS_API_ENDPOINT;
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID || "CURAH";

  if (apiEndpoint && apiKey) {
    try {
      console.log(`[SMS SERVICE] Dispatching real SMS via endpoint: ${apiEndpoint} to ${to}`);
      const response = await fetch(`${apiEndpoint}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          to,
          message: message.substring(0, 160), // SMS limit
          sender: senderId
        })
      });

      if (response.ok) {
        console.log(`[SMS SERVICE] Real SMS successfully dispatched to ${to}`);
        return { success: true, mode: "real" };
      } else {
        const errText = await response.text();
        throw new Error(`Endpoint returned status ${response.status}: ${errText}`);
      }
    } catch (e: any) {
      console.error(`[SMS SERVICE] Real SMS failed, falling back to simulation:`, e);
      return { success: false, error: e.message || String(e), mode: "real" };
    }
  } else {
    // Simulation mode
    console.log(`
=========================================
📱 [SIMULATED SMS DISPATCH]
To: ${to}
Sender ID: ${senderId}
Message (160 Chars max): 
"${message.substring(0, 160)}"
=========================================
    `);
    return { success: true, mode: "simulated" };
  }
}

// High Quality HTML Email Templates
export function getWelcomeEmailHTML(patientName: string, patientCode: string, clinicName: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #0ea5e9; letter-spacing: -0.5px; }
          .welcome-hero { background: linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%); padding: 30px; border-radius: 20px; text-align: center; margin-bottom: 30px; }
          .code { font-size: 32px; font-weight: 900; color: #0ea5e9; padding: 12px 24px; background: #ffffff; border-radius: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(14, 165, 233, 0.1); border: 1px solid #bae6fd; letter-spacing: 1px; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 25px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 15px 0; }
          .bullet-card { bg-color: #f8fafc; border: 1px solid #f1f5f9; padding: 15px; border-radius: 16px; margin: 20px 0; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <span class="logo">❤️ ${clinicName} Onboarding</span>
          </div>
          <div class="welcome-hero">
              <h2>Welcome to ${clinicName}!</h2>
              <p>Hello ${patientName}, your Electronic Health Record (EHR) has been successfully created.</p>
              <div style="margin: 20px 0;">
                  <p style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Your Unique Patient Access Code:</p>
                  <div class="code">${patientCode}</div>
              </div>
          </div>
          <p>Please present this code or your phone number during any future visit for instantaneous clinical context recall by our doctor team.</p>
          
          <div class="bullet-card">
              <p style="margin: 0; font-weight: bold; color: #334155;">📱 Smart Healthcare Autopilot:</p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b;">
                  Appointment reminders, dosage tracking, and follow-up schedules will be delivered dynamically via WhatsApp, Email, and SMS fallbacks.
              </p>
          </div>
          
          <div class="footer">
              <p>© 2026 ${clinicName}. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
}

export function getAppointmentEmailHTML(
  patientName: string,
  doctorName: string,
  scheduledAt: string,
  type: string,
  reason: string,
  clinicName: string
): string {
  const dateFormatted = new Date(scheduledAt).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatted = new Date(scheduledAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <style>
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #0ea5e9; letter-spacing: -0.5px; }
          .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 25px; margin: 25px 0; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 15px; border-b: 1px solid #f1f5f9; padding-bottom: 10px; }
          .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
          .label { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; }
          .value { font-size: 14px; font-weight: 700; color: #0f172a; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 25px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; text-align: center; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0; }
          .btn { display: inline-block; background: #0ea5e9; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; text-align: center; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <span class="logo">📅 Appointment Confirmed</span>
          </div>
          <h2>Your Appointment is Confirmed!</h2>
          <p style="text-align: center;">Hello ${patientName}, your upcoming consultation slot has been reserved.</p>
          
          <div class="details-card">
              <div class="detail-row">
                  <span class="label">👨‍⚕️ Clinician:</span>
                  <span class="value">${doctorName}</span>
              </div>
              <div class="detail-row">
                  <span class="label">📆 Date:</span>
                  <span class="value">${dateFormatted}</span>
              </div>
              <div class="detail-row">
                  <span class="label">⏰ Time:</span>
                  <span class="value">${timeFormatted}</span>
              </div>
              <div class="detail-row">
                  <span class="label">📍 Type:</span>
                  <span class="value" style="text-transform: uppercase;">${type}</span>
              </div>
              <div class="detail-row">
                  <span class="label">📝 Diagnosis Context:</span>
                  <span class="value">${reason}</span>
              </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
              <span class="btn">Add to Calendar</span>
          </div>
          
          <div class="footer">
              <p>© 2026 ${clinicName}. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
}
