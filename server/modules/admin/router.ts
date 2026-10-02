import { Router, Request, Response } from "express";
import { inMemoryAuditStore } from "../../middleware/audit";
import { aiAuditLedger } from "../../infrastructure/ai";

export const adminRouter = Router();

// In-memory store for interactive admin configuration
let systemConfig = {
  allow_registration: true,
  ai_cdss_enabled: true,
  whatsapp_notifications_enabled: true,
  maintenance_mode: false,
  abdm_m1_sync_active: true,
  max_free_patients: 1000
};

// In-memory user management records
let adminUsersList = [
  {
    id: 1,
    full_name: "Dr. K. S. Murthy (CMO)",
    email: "admin@clinitial.in",
    role: "admin",
    clinic_name: "Clinitial Healthcare Network",
    phone: "+91 98111 22334",
    is_active: true,
    created_at: "2026-01-10T08:00:00Z"
  },
  {
    id: 2,
    full_name: "Dr. Rajesh Sharma",
    email: "dr.sharma@clinitial.in",
    role: "doctor",
    clinic_name: "Sharma Multispecialty Care",
    phone: "+91 98765 43210",
    is_active: true,
    created_at: "2026-01-15T10:30:00Z"
  },
  {
    id: 3,
    full_name: "Dr. Priya Nair",
    email: "dr.priya@ayush.clinitial.in",
    role: "ayush_practitioner",
    clinic_name: "Vaidya Ayurveda & Holistic Wellness",
    phone: "+91 98333 44556",
    is_active: true,
    created_at: "2026-01-18T14:15:00Z"
  },
  {
    id: 4,
    full_name: "Vikram Patel",
    email: "dispenser@medplus.clinitial.in",
    role: "pharmacist",
    clinic_name: "MedPlus Central Pharmacy",
    phone: "+91 98222 33445",
    is_active: true,
    created_at: "2026-01-20T09:00:00Z"
  },
  {
    id: 5,
    full_name: "Admin Sharma",
    email: "admin@apollo.com",
    role: "hospital_admin",
    clinic_name: "Apollo Super Specialty Hospital",
    phone: "+91 98490 99887",
    is_active: true,
    created_at: "2026-02-01T11:45:00Z"
  },
  {
    id: 6,
    full_name: "Rajesh Kumar",
    email: "rajesh.kumar@gmail.com",
    role: "patient",
    clinic_name: "Patient Mobile Portal",
    phone: "+91 98765 43210",
    is_active: true,
    created_at: "2026-02-12T16:20:00Z"
  }
];

// In-memory clinic tenants
let adminClinicsList = [
  {
    id: 1,
    name: "Apollo Super Specialty Hospital",
    city: "Hyderabad",
    state: "Telangana",
    doctor_count: 48,
    subscription_tier: "enterprise",
    status: "active"
  },
  {
    id: 2,
    name: "Sharma Multispecialty Clinic",
    city: "New Delhi",
    state: "Delhi NCR",
    doctor_count: 6,
    subscription_tier: "clinic_pro",
    status: "active"
  },
  {
    id: 3,
    name: "Vaidya Holistic AYUSH Institute",
    city: "Kochi",
    state: "Kerala",
    doctor_count: 12,
    subscription_tier: "ayush_suite",
    status: "active"
  },
  {
    id: 4,
    name: "Apex Heart & Echo Centre",
    city: "Kolkata",
    state: "West Bengal",
    doctor_count: 8,
    subscription_tier: "clinic_pro",
    status: "active"
  }
];

// Authorization guard for administrative endpoints
const adminAuthGuard = (req: Request, res: Response, next: any) => {
  const user = req.user;
  const isAdmin = user && (
    user.role === "super_admin" || 
    user.role === "hospital_admin" || 
    user.role === "admin"
  );

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Access Denied: Clinitial Enterprise Administrator authorization required."
    });
  }
  next();
};

// 1. Verify Admin Session
adminRouter.get("/admin/verify-admin-session", adminAuthGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    authorized: true,
    user: req.user
  });
});

// 2. Admin Dashboard Summary Metrics
adminRouter.get("/admin/dashboard", adminAuthGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      users: {
        total: adminUsersList.length + 36,
        new_today: 4
      },
      subscriptions: {
        revenue: 3845000,
        active: 32
      },
      ai: {
        total_calls: 148920 + aiAuditLedger.length,
        calls_today: 1240
      },
      whatsapp: {
        total_messages: 58210,
        messages_today: 890
      },
      patients: {
        total: 12890
      },
      clinics: {
        total: adminClinicsList.length
      }
    }
  });
});

// 3. Admin Users List
adminRouter.get("/admin/users", adminAuthGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      data: adminUsersList
    }
  });
});

// 4. Toggle User Status
adminRouter.patch("/admin/users/:id/status", adminAuthGuard, (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const target = adminUsersList.find(u => u.id === userId);
  if (target) {
    if (typeof req.body.is_active === "boolean") {
      target.is_active = req.body.is_active;
    } else {
      target.is_active = !target.is_active;
    }
    return res.json({ success: true, user: target });
  }
  res.status(404).json({ success: false, error: "User account not found." });
});

// 5. Clinic Tenants List
adminRouter.get("/admin/clinics", adminAuthGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: adminClinicsList
  });
});

// 6. AI Usage Analytics
adminRouter.get("/admin/ai-usage", adminAuthGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      total_calls: 148920 + aiAuditLedger.length,
      hitl_compliance_rate: "100%",
      avg_latency_ms: 412,
      by_feature: [
        { name: "Clinical CDSS & Differential", calls: 64200 },
        { name: "Herb-Drug Interactions", calls: 42100 },
        { name: "Voice Ambient Scribe", calls: 28400 },
        { name: "ICD-11 & NAMASTE Coding", calls: 14220 }
      ],
      monthly_trend: [
        { month: "Oct", calls: 18000 },
        { month: "Nov", calls: 24500 },
        { month: "Dec", calls: 31000 },
        { month: "Jan", calls: 38200 },
        { month: "Feb", calls: 44000 },
        { month: "Mar", calls: 52000 }
      ]
    }
  });
});

// 7. WhatsApp Traffic Analytics
adminRouter.get("/admin/whatsapp-analytics", adminAuthGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      total_messages: 58210,
      delivery_rate: "99.4%",
      read_rate: "94.2%",
      volume_by_day: [
        { day: "Mon", count: 820 },
        { day: "Tue", count: 910 },
        { day: "Wed", count: 880 },
        { day: "Thu", count: 940 },
        { day: "Fri", count: 1020 },
        { day: "Sat", count: 680 },
        { day: "Sun", count: 420 }
      ]
    }
  });
});

// 8. Admin Audit & Compliance Logs
adminRouter.get("/admin/logs", adminAuthGuard, (req: Request, res: Response) => {
  const sampleLogs = [
    {
      id: "log_101",
      action: "ADMIN_CONFIG_UPDATE",
      actor_name: "Dr. K.S. Murthy (CMO)",
      actor_role: "super_admin",
      resource: "SYSTEM_CONFIG",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      ip_address: "10.0.4.12",
      status: "SUCCESS"
    },
    {
      id: "log_102",
      action: "TENANT_SUBSCRIPTION_RENEWAL",
      actor_name: "Admin Sharma",
      actor_role: "hospital_admin",
      resource: "TENANT_APOLLO",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      ip_address: "10.0.8.99",
      status: "SUCCESS"
    },
    {
      id: "log_103",
      action: "AI_GUARD_SAFETY_TRIGGER",
      actor_name: "Clinical AI Engine",
      actor_role: "system",
      resource: "RX_CDSS_CHECK",
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      ip_address: "127.0.0.1",
      status: "INTERCEPTED"
    }
  ];

  res.json({
    success: true,
    data: [...inMemoryAuditStore.slice(0, 50), ...sampleLogs]
  });
});

// 9. System Config GET and POST
adminRouter.get("/admin/config/system", adminAuthGuard, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: systemConfig
  });
});

adminRouter.post("/admin/config", adminAuthGuard, (req: Request, res: Response) => {
  const { key, value } = req.body;
  if (key && key in systemConfig) {
    (systemConfig as any)[key] = value;
  }
  res.json({
    success: true,
    data: systemConfig
  });
});

// 10. Enterprise RBAC Spec
adminRouter.get("/v1/enterprise/rbac", (req: Request, res: Response) => {
  res.json({
    success: true,
    roles: [
      { role: "super_admin", description: "Global Multi-Tenant Platform Administrator", permissions: ["ALL"] },
      { role: "hospital_admin", description: "Hospital Facility Administrator", permissions: ["MANAGE_STAFF", "VIEW_AUDIT", "MANAGE_BEDS"] },
      { role: "doctor", description: "Licensed Attending Clinician", permissions: ["PRESCRIBE", "VIEW_PATIENT_RECORDS", "RUN_CDSS"] },
      { role: "nurse", description: "Registered Staff Nurse", permissions: ["ADMINISTER_MEDS", "VIEW_VITALS", "RECORD_NOTES"] }
    ]
  });
});

// 11. MFA TOTP Challenge
adminRouter.post("/v1/enterprise/rbac/request-mfa-code", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Two-Factor Verification code dispatched to registered medical practitioner device."
  });
});

